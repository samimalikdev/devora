import asyncio
import io
import logging
import re
import uuid
from typing import Any, Dict, List, Optional, Tuple

from pypdf import PdfReader

from app.core.supabase import supabase_admin
from app.service.embedding_service import create_chunks_from_page, embed_in_batches

logger = logging.getLogger(__name__)

PAGE_INSERT_BATCH = 100
CHUNK_INSERT_BATCH = 100
DOC_COLUMNS = "id,title,file_path,file_size,total_pages,created_at,status,total_chunks,processed_chunks,error"

_processing_slots = asyncio.Semaphore(2)



def create_document_record(file_bytes: bytes, filename: str, user_id: str) -> Dict[str, Any]:
  
    if not file_bytes:
        raise ValueError("Uploaded file is empty.")

    try:
        total_pages = len(PdfReader(io.BytesIO(file_bytes)).pages) 
    except Exception:
        raise ValueError("Invalid or corrupted PDF.")
    if total_pages == 0:
        raise ValueError("PDF has no readable pages.")

    uuid.UUID(user_id)  
    storage_path = f"uploads/{uuid.uuid4()}.pdf"
    supabase_admin.storage.from_("documents").upload(
        file=file_bytes, path=storage_path, file_options={"content-type": "application/pdf"}
    )
    file_url = supabase_admin.storage.from_("documents").get_public_url(storage_path)

    res = supabase_admin.table("documents").insert({
        "title": filename,
        "file_path": file_url,
        "file_size": len(file_bytes),
        "total_pages": total_pages,
        "user_id": user_id,
        "status": "processing",
    }).execute()
    if not res.data:
        raise RuntimeError("Failed to save document metadata.")
    return res.data[0]



_FOOTER = re.compile(
    r"CS304 VU\s*\nWebsite: vubookshoppk\.com \| WhatsApp: 0326-0775533\s*\d*\s*\n"
    r"All VU books are available in hard copy and delivered all over Pakistan\. Order now!\s*",
    re.IGNORECASE,
)
_DOT_LEADERS = re.compile(r"\.{4,}\s*\d*") 

def _clean(text: str) -> str:
    text = (text or "").replace("\x00", "")
    text = _FOOTER.sub("", text)
    return _DOT_LEADERS.sub(" ", text)


def _extract_pages(file_bytes: bytes) -> List[Tuple[int, str]]:
    reader = PdfReader(io.BytesIO(file_bytes))
    out: List[Tuple[int, str]] = []
    for idx, page in enumerate(reader.pages):
        try:
            out.append((idx + 1, _clean(page.extract_text())))
        except Exception as e: 
            logger.warning(f"Page {idx + 1} extraction failed: {e}")
            out.append((idx + 1, ""))
    return out


def _update_doc(doc_id: str, **fields: Any) -> None:
    supabase_admin.table("documents").update(fields).eq("id", doc_id).execute()


def _reset_document_rows(doc_id: str) -> None:
    supabase_admin.table("document_chunks").delete().eq("document_id", doc_id).execute()
    supabase_admin.table("document_pages").delete().eq("document_id", doc_id).execute()


def _insert_pages(doc_id: str, pages: List[Tuple[int, str]]) -> None:
    rows = [{"document_id": doc_id, "page_number": n, "content": t} for n, t in pages]
    for i in range(0, len(rows), PAGE_INSERT_BATCH):
        supabase_admin.table("document_pages").insert(rows[i:i + PAGE_INSERT_BATCH]).execute()


def _build_chunks(pages: List[Tuple[int, str]]) -> List[Dict[str, Any]]:
    chunks: List[Dict[str, Any]] = []
    for n, text in pages:
        chunks.extend(create_chunks_from_page(n, text))
    return chunks


def _insert_chunks(doc_id: str, chunks: List[Dict[str, Any]], vectors: List[List[float]]) -> None:
    rows = [
        {
            "document_id": doc_id,
            "page_number": c["page_number"],
            "chunk_index": c["chunk_index"],
            "content": c["content"],
            "embedding": v,
        }
        for c, v in zip(chunks, vectors)
    ]
    for i in range(0, len(rows), CHUNK_INSERT_BATCH):
        supabase_admin.table("document_chunks").insert(rows[i:i + CHUNK_INSERT_BATCH]).execute()


async def process_document(doc_id: str, file_bytes: bytes) -> None:

    async with _processing_slots:
        try:
            await asyncio.to_thread(_reset_document_rows, doc_id)  
            pages = await asyncio.to_thread(_extract_pages, file_bytes)
            await asyncio.to_thread(_insert_pages, doc_id, pages) 

            chunks = await asyncio.to_thread(_build_chunks, pages)
            await asyncio.to_thread(_update_doc, doc_id, total_chunks=len(chunks), processed_chunks=0)

            done = 0
            texts = [c["content"] for c in chunks]
            async for start, vectors in embed_in_batches(texts):
                batch_chunks = chunks[start:start + len(vectors)]
                await asyncio.to_thread(_insert_chunks, doc_id, batch_chunks, vectors)
                done += len(vectors)
                await asyncio.to_thread(_update_doc, doc_id, processed_chunks=done)

            await asyncio.to_thread(_update_doc, doc_id, status="ready", error=None)
            logger.info(f"Document {doc_id} ready: {len(pages)} pages, {len(chunks)} chunks")
        except Exception as e:
            logger.exception(f"Document {doc_id} processing failed")
            try:
                await asyncio.to_thread(_update_doc, doc_id, status="failed", error=str(e)[:500])
            except Exception:
                logger.exception("Could not mark document as failed")



def fetch_all_documents(user_id: str) -> List[Dict[str, Any]]:
    res = (
        supabase_admin.table("documents")
        .select(DOC_COLUMNS)
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )
    return res.data or []


def fetch_document(document_id: str, user_id: str) -> Optional[Dict[str, Any]]:
    res = (
        supabase_admin.table("documents")
        .select(DOC_COLUMNS)
        .eq("id", document_id)
        .eq("user_id", user_id)
        .limit(1)
        .execute()
    )
    return res.data[0] if res.data else None


def fetch_document_pages(document_id: str, offset: int, limit: int) -> List[Dict[str, Any]]:
    res = (
        supabase_admin.table("document_pages")
        .select("page_number,content")
        .eq("document_id", document_id)
        .order("page_number")
        .range(offset, offset + limit - 1)
        .execute()
    )
    return res.data or []
