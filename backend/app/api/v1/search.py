import logging
from typing import Any
from fastapi import APIRouter, Query, HTTPException, status, Depends

from app.core.auth import get_current_user
from app.core.supabase import supabase_admin
from app.schemas.search import (
    SearchRequest,
    SearchResponse,
    SearchHit,
    AskedQuestion,
    SourceReference,
)
from app.service.hybrid_search import search_document_pages
from app.service.llm_service import answer_question

router = APIRouter(prefix="/search", tags=["Search"])
logger = logging.getLogger(__name__)


@router.post("", response_model=SearchResponse)
def search_documents(
    request: SearchRequest,
    ask: bool = Query(default=True),
    current_user = Depends(get_current_user),
) -> SearchResponse:

    try:
        if not request.document_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="document_id is required for document search."
            )

        user_id = str(current_user.id)
        doc_check = (
            supabase_admin.table("documents")
            .select("id")
            .eq("id", request.document_id)
            .eq("user_id", user_id)
            .execute()
        )
        if not doc_check.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found or access denied."
            )

        bounded_top_k = max(1, min(request.top_k or 3, 10))

        passages = search_document_pages(
            document_id=request.document_id,
            query=request.query,
            top_k=bounded_top_k,
        )

        hits: list[SearchHit] = []
        for p in passages:
            hits.append(
                SearchHit(
                    document_id=str(p.get("document_id", request.document_id)),
                    page_number=int(p.get("page_number", 1)),
                    content=str(p.get("content", "")),
                    relevance_score=p.get("relevance_score"),
                    bm25_score=p.get("bm25_score"),
                )
            )

        answer_data = AskedQuestion(asked=ask)
        if ask and hits:
            llm_passages = [
                {"page_number": h.page_number, "content": h.content}
                for h in hits
            ]
            llm_res = answer_question(request.query, llm_passages)

            sources = [
                SourceReference(
                    document_id=h.document_id,
                    page_number=h.page_number,
                    score=h.relevance_score,
                    snippet=h.content[:200],
                )
                for h in hits
            ]
            answer_data = AskedQuestion(
                asked=True,
                answer=llm_res.get("answer"),
                sources=sources,
            )

        return SearchResponse(
            success=True,
            query=request.query,
            count=len(hits),
            results=hits,
            answer=answer_data,
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Search endpoint error: {e}")
        raise HTTPException(status_code=500, detail=str(e))