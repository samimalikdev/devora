import math
import re
from typing import Sequence

STOP_WORDS = frozenset([
    "a", "an", "and", "are", "as", "at", "be", "by", "for", "from",
    "has", "have", "in", "is", "it", "its", "of", "on", "or", "that",
    "the", "to", "was", "were", "what", "when", "where", "which", "who", "why", "with"
])

def tokenize(text: str | None) -> list[str]:
    if not text:
        return []
    return re.findall(r"\w+", text.lower())

def compute_cross_encoder_relevance_score(query: str, doc_text: str) -> float:

    if not query or not doc_text:
        return 0.0

    raw_query_tokens = tokenize(query)
    doc_tokens = tokenize(doc_text)

    if not raw_query_tokens or not doc_tokens:
        return 0.0

    content_query_tokens = [t for t in raw_query_tokens if t not in STOP_WORDS]
    eval_tokens = content_query_tokens if content_query_tokens else raw_query_tokens

    doc_token_set = set(doc_tokens)
    doc_text_lower = doc_text.lower()

    matching_terms = [t for t in eval_tokens if t in doc_token_set]
    if not matching_terms:
        return 0.0
    density = len(matching_terms) / len(eval_tokens)

    position_bonus = 0.0
    for term in matching_terms:
        idx = doc_text_lower.find(term)
        if idx != -1:
            norm_pos = max(0.0, 1.0 - (idx / 500.0))
            position_bonus += norm_pos

    avg_position_bonus = position_bonus / len(matching_terms)

    raw_score = (0.7 * density) + (0.3 * avg_position_bonus)

    return round(min(1.0, max(0.0, raw_score)), 4)


def rerank_passages(query: str, passages: list[dict], top_k: int = 5) -> list[dict]:

    scored = []
    for p in passages:
        content = p.get("content", "")
        score = compute_cross_encoder_relevance_score(query, content)
        scored.append({**p, "relevance_score": score})

    scored.sort(key=lambda x: x["relevance_score"], reverse=True)
    return scored[:top_k]



