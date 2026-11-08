from typing import List

from fastapi import APIRouter, BackgroundTasks, Depends, File, HTTPException, Query, UploadFile, status
from fastapi.concurrency import run_in_threadpool

from app.core.auth import get_current_user
from app.schemas.document import (
    DocumentDetailResponse,
    DocumentResponse,
    PagesResponse,
    UploadSuccessResponse,
)
from app.service import document_service

router = APIRouter(prefix="/documents", tags=["Document"])

MAX_UPLOAD_SIZE = 15 * 1024 * 1024
DEFAULT_PAGE_WINDOW = 10
MAX_PAGE_WINDOW = 50


def _owned_document_or_404(document_id: str, user_id: str) -> dict:
    doc = document_service.fetch_document(document_id, user_id)
    if not doc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Document not found or access denied.")
    return doc


@router.post("/upload", response_model=UploadSuccessResponse, status_code=status.HTTP_202_ACCEPTED)
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    current_user=Depends(get_current_user),
):
    if not (file.filename or "").lower().endswith(".pdf"):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Only PDF files are supported.")

    file_bytes = await file.read(MAX_UPLOAD_SIZE + 1)
    if len(file_bytes) > MAX_UPLOAD_SIZE:
        raise HTTPException(status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, "File size exceeds the 15MB limit.")
    if not file_bytes:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Uploaded file is empty.")

    try:
        doc = await run_in_threadpool(
            document_service.create_document_record, file_bytes, file.filename, str(current_user.id)
        )
    except ValueError as ve:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, str(ve))
    except Exception as e:
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, f"Error storing document: {e}")

    background_tasks.add_task(document_service.process_document, str(doc["id"]), file_bytes)

    return UploadSuccessResponse(
        success=True,
        message="Upload received. Processing in background - poll GET /documents/{id}/status.",
        document=DocumentResponse(**{**doc, "id": str(doc["id"]), "created_at": str(doc.get("created_at", ""))}),
        pages=[],
    )


@router.get("", response_model=List[DocumentResponse])
def get_documents(current_user=Depends(get_current_user)):
    rows = document_service.fetch_all_documents(str(current_user.id))
    return [DocumentResponse(**{**d, "id": str(d["id"]), "created_at": str(d.get("created_at", ""))}) for d in rows]


@router.get("/{document_id}/status", response_model=DocumentResponse)
def get_document_status(document_id: str, current_user=Depends(get_current_user)):
    d = _owned_document_or_404(document_id, str(current_user.id))
    return DocumentResponse(**{**d, "id": str(d["id"]), "created_at": str(d.get("created_at", ""))})


@router.get("/{document_id}/pages", response_model=PagesResponse)
def get_document_pages(
    document_id: str,
    offset: int = Query(0, ge=0),
    limit: int = Query(DEFAULT_PAGE_WINDOW, ge=1, le=MAX_PAGE_WINDOW),
    current_user=Depends(get_current_user),
):
    d = _owned_document_or_404(document_id, str(current_user.id))
    pages = document_service.fetch_document_pages(document_id, offset, limit)
    return PagesResponse(
        pages=pages, offset=offset, limit=limit,
        total_pages=d["total_pages"], has_more=offset + len(pages) < d["total_pages"],
    )


@router.get("/{document_id}", response_model=DocumentDetailResponse)
def get_document_details(
    document_id: str,
    page_limit: int = Query(DEFAULT_PAGE_WINDOW, ge=0, le=MAX_PAGE_WINDOW),
    current_user=Depends(get_current_user),
):
    d = _owned_document_or_404(document_id, str(current_user.id))
    pages = document_service.fetch_document_pages(document_id, 0, page_limit) if page_limit else []
    return DocumentDetailResponse(
        document=DocumentResponse(**{**d, "id": str(d["id"]), "created_at": str(d.get("created_at", ""))}),
        pages=pages,
        has_more=len(pages) < d["total_pages"],
    )
