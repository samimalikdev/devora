import logging
import time
from typing import Any
from google import genai
from google.genai import types
from fastapi import HTTPException, status
from app.core.config import settings

logger = logging.getLogger(__name__)

DEFAULT_SYSTEM_INSTRUCTION = (
    "You are Devora AI, a precise document assistant. Answer strictly from the "
    "provided context. If the context does not contain the answer, say so plainly "
    "instead of guessing. Always cite the page numbers you used in square brackets like [Page X]."
)

_cached_client = None

def get_gemini_client() -> genai.Client:
    global _cached_client
    if _cached_client is not None:
        return _cached_client

    if not settings.GEMINI_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="GEMINI_API_KEY is not configured in .env"
        )
    _cached_client = genai.Client(api_key=settings.GEMINI_API_KEY)
    return _cached_client


def generate_llm_response(
    prompt: str,
    system_instruction: str = DEFAULT_SYSTEM_INSTRUCTION,
    temperature: float = 0.2,
    retries: int = 2
) -> str:

    client = get_gemini_client()
    config = types.GenerateContentConfig(
        system_instruction=system_instruction,
        temperature=temperature,
    )

    last_error = None
    for attempt in range(retries + 1):
        try:
            response = client.models.generate_content(
                model="gemini-3.5-flash-lite",
                config=config,
                contents=prompt,
            )
            return (response.text or "No response generated.").strip()
        except Exception as e:
            last_error = e
            logger.warning(f"Gemini call attempt {attempt + 1} failed: {e}")
            if attempt < retries:
                time.sleep(1.0 * (attempt + 1))  

    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail=f"Gemini LLM error: {str(last_error)}"
    )


def build_grounded_prompt(question: str, passages: list[dict[str, Any]]) -> str:
    blocks = []
    for idx, p in enumerate(passages, start=1):
        page_num = p.get("page_number", "?")
        content = (p.get("content") or "").strip()
        blocks.append(f"[Source {idx} | Page {page_num}]:\n{content}")

    context = "\n\n".join(blocks) if blocks else "(No relevant passages found)"

    return (
        "Use ONLY the following context passages to answer the user's question.\n"
        "If the answer cannot be found in the context, respond: 'I could not find the answer in the provided document.'\n\n"
        f"### CONTEXT PASSAGES:\n{context}\n\n"
        f"### USER QUESTION:\n{question.strip()}\n\n"
        "### YOUR ANSWER (Include citations like [Page X]):"
    )


def answer_question(question: str, passages: list[dict[str, Any]]) -> dict[str, Any]:
    
    if not passages:
        return {
            "answer": "I could not find any relevant information in the document.",
            "passages": []
        }

    prompt = build_grounded_prompt(question, passages)
    answer = generate_llm_response(prompt, temperature=0.1)

    return {
        "answer": answer,
        "passages": passages
    }


