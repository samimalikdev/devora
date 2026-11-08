from app.service.embedding_service import get_embedding
import logging
from typing import Any
from rank_bm25 import BM25Okapi
from typing import Any, List, Dict

from app.core.supabase import supabase
from app.service.reranker import tokenize, rerank_passages

logger = logging.getLogger(__name__)

DEFAULT_CANDIDATE_POOL = 6
DEFAULT_TOP_K = 3


class HybridSearcher:

    def __init__(self, pages: list[dict[str, Any]], candidate_pool: int = DEFAULT_CANDIDATE_POOL):
        self.pages = [p for p in pages if (p.get("content") or p.get("text") or "").strip()]
        self.candidate_pool = candidate_pool
        self._bm25 = None
        self._tokens = []

        if self.pages:
            self._tokens = [tokenize(p.get("content") or p.get("text") or "") for p in self.pages]
            self._bm25 = BM25Okapi(self._tokens)

    def search(self, query: str, top_k: int = DEFAULT_TOP_K) -> list[dict[str, Any]]:
        if not self._bm25 or not self.pages:
            return []

        query_tokens = tokenize(query)
        if not query_tokens:
            return []

        scores = self._bm25.get_scores(query_tokens)
        if not any(s > 0 for s in scores):
            return []

        pool_size = min(self.candidate_pool, len(self.pages))
        ranked_indices = sorted(range(len(scores)), key=lambda i: scores[i], reverse=True)[:pool_size]

        candidates = []
        for idx in ranked_indices:
            candidate = dict(self.pages[idx])
            candidate["bm25_score"] = round(float(scores[idx]), 4)
            candidates.append(candidate)

        return rerank_passages(query, candidates, top_k=top_k)

def search_vector_chunks(document_id: str, query: str, top_k: int = 6) -> List[Dict[str, Any]]:
    try:
        query_vector = get_embedding(query)

        res = supabase.rpc('match_document_chunks', {
            "query_embedding": query_vector,
            "match_threshold": 0.25,
            "match_count": top_k,
            "filter_document_id": document_id
        }).execute()

        return res.data or []

    except Exception as e:
        logger.warning(f"Vector search failed, falling back to BM25: {e}")
        return []  

def search_document_pages(
    document_id: str,
    query: str,
    top_k: int = DEFAULT_TOP_K
) -> list[dict]:

    try:
        vector_chunks = search_vector_chunks(document_id, query, top_k=6)
        response = (
            supabase.table("document_pages")
            .select("id, page_number, content, document_id")
            .eq("document_id", document_id)
            .order("page_number")
            .execute()
        )
        pages = response.data or []
        combined_candidates = []
        seen_texts = set()

        for ch in vector_chunks:
            text = (ch.get("content") or "").strip()
            if text and text not in seen_texts:
                seen_texts.add(text)
                combined_candidates.append({
                    "page_number": ch.get("page_number", 1),
                    "content": text,
                    "document_id": document_id,
                    "similarity": ch.get("similarity", 0.0)
                })

        if pages:
            tokens = [tokenize(p.get("content", "")) for p in pages]
            bm25 = BM25Okapi(tokens)
            query_tokens = tokenize(query)
            if query_tokens:
                scores = bm25.get_scores(query_tokens)
                for page, sc in zip(pages, scores):
                    if sc > 0:
                        text = page.get("content", "").strip()
                        if text and text not in seen_texts:
                            seen_texts.add(text)
                            combined_candidates.append({
                                **page,
                                "bm25_score": float(sc)
                            })

        candidates_to_rerank = combined_candidates if combined_candidates else pages

        return rerank_passages(query, candidates_to_rerank, top_k=top_k)
    except Exception as e:
        logger.error(f"Error in hybrid search_document_pages: {e}")
        return []