import asyncio
import logging
import os
import random
import time
from collections import deque
from typing import Any, AsyncIterator, Dict, List, Tuple

from google.genai import types
from langchain_text_splitters import RecursiveCharacterTextSplitter

from app.service.llm_service import get_gemini_client

logger = logging.getLogger(__name__)

EMBED_MODEL = "gemini-embedding-001"
EMBED_DIM = 768

EMBED_BATCH_SIZE = int(os.getenv("EMBED_BATCH_SIZE", "50"))      
EMBED_CONCURRENCY = int(os.getenv("EMBED_CONCURRENCY", "2"))
EMBED_TPM_LIMIT = int(os.getenv("EMBED_TPM_LIMIT", "25000"))     
EMBED_MAX_RETRIES = int(os.getenv("EMBED_MAX_RETRIES", "8"))


class _TokenWindow:

    def __init__(self, per_minute: int):
        self.per_minute = per_minute
        self.events: deque[tuple[float, int]] = deque()
        self.lock = asyncio.Lock()

    async def acquire(self, tokens: int) -> None:
        if self.per_minute <= 0:
            return
        tokens = min(tokens, self.per_minute)
        async with self.lock:
            while True:
                now = time.monotonic()
                while self.events and now - self.events[0][0] >= 60:
                    self.events.popleft()
                if sum(t for _, t in self.events) + tokens <= self.per_minute:
                    self.events.append((now, tokens))
                    return
                await asyncio.sleep(max(0.5, 60 - (now - self.events[0][0])))


_window = _TokenWindow(EMBED_TPM_LIMIT)

text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=150,
    separators=["\n\n", "\n", " ", ""],
)


def create_chunks_from_page(page_number: int, content: str) -> List[Dict[str, Any]]:
    if not content or not content.strip():
        return []
    return [
        {"page_number": page_number, "chunk_index": idx, "content": text}
        for idx, text in enumerate(text_splitter.split_text(content.strip()))
    ]


def _config(task_type: str) -> types.EmbedContentConfig:
    return types.EmbedContentConfig(output_dimensionality=EMBED_DIM, task_type=task_type)


def get_embedding(text: str, task_type: str = "RETRIEVAL_QUERY") -> List[float]:

    res = get_gemini_client().models.embed_content(
        model=EMBED_MODEL, contents=text, config=_config(task_type)
    )
    return res.embeddings[0].values


async def _embed_batch_with_retry(batch: List[str], task_type: str) -> List[List[float]]:
    client = get_gemini_client()
    last_err: Exception | None = None
    est_tokens = sum(len(t) for t in batch) // 4 + len(batch)
    for attempt in range(EMBED_MAX_RETRIES):
        await _window.acquire(est_tokens)
        try:
            res = await client.aio.models.embed_content(
                model=EMBED_MODEL, contents=batch, config=_config(task_type)
            )
            vectors = [e.values for e in res.embeddings]
            if len(vectors) != len(batch):
                raise RuntimeError(f"Expected {len(batch)} embeddings, got {len(vectors)}")
            return vectors
        except Exception as e:  
            last_err = e
            delay = min(60.0, 2 ** (attempt + 1)) + random.random()
            logger.warning(f"Embed batch failed (attempt {attempt + 1}/{EMBED_MAX_RETRIES}): {e}; retry in {delay:.1f}s")
            await asyncio.sleep(delay)
    raise RuntimeError(f"Embedding batch failed after {EMBED_MAX_RETRIES} attempts: {last_err}")


async def embed_in_batches(
    texts: List[str], task_type: str = "RETRIEVAL_DOCUMENT"
) -> AsyncIterator[Tuple[int, List[List[float]]]]:

    sem = asyncio.Semaphore(EMBED_CONCURRENCY)

    async def run(start: int) -> Tuple[int, List[List[float]]]:
        async with sem:
            return start, await _embed_batch_with_retry(texts[start:start + EMBED_BATCH_SIZE], task_type)

    tasks = [asyncio.create_task(run(s)) for s in range(0, len(texts), EMBED_BATCH_SIZE)]
    try:
        for fut in asyncio.as_completed(tasks):
            yield await fut
    finally:
        for t in tasks:
            t.cancel()



EMBED_BACKEND = os.getenv("EMBED_BACKEND", "gemini").lower()
LOCAL_MODEL_NAME = os.getenv("LOCAL_EMBED_MODEL", "BAAI/bge-base-en-v1.5")

if EMBED_BACKEND == "local":
    import torch
    from sentence_transformers import SentenceTransformer

    _device = "cuda" if torch.cuda.is_available() else "cpu"
    _local = SentenceTransformer(LOCAL_MODEL_NAME, device=_device)
    if _device == "cuda":
        _local.half()  
    logger.info(f"Local embedding model {LOCAL_MODEL_NAME} loaded on {_device}")

   
    def _embed_local(texts: List[str]) -> List[List[float]]:
        return _local.encode(
            texts, batch_size=64, normalize_embeddings=True, show_progress_bar=False
        ).tolist()

   
    async def _embed_batch_with_retry(batch: List[str], task_type: str) -> List[List[float]]:

        return await asyncio.to_thread(_embed_local, batch)

   
    def get_embedding(text: str, task_type: str = "RETRIEVAL_QUERY") -> List[float]:
        return _embed_local([text])[0]
