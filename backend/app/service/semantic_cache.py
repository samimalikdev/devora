import math
import logging
from typing import List, Optional, Tuple, Dict, Any
from app.core import redis_client
from app.service.embedding_service import get_embedding

logger = logging.getLogger(__name__)

SIMILARITY_THRESHOLD = 0.88 
MAX_CACHED_ITEMS = 100


def cosine_similarity(v1: List[float], v2: List[float]) -> float:
    if not v1 or not v2 or len(v1) != len(v2):
        return 0.0

    dot_product = sum(a * b for a, b in zip(v1, v2))
    norm_v1 = math.sqrt(sum(a * a for a in v1))
    norm_v2 = math.sqrt(sum(b * b for b in v2))

    if norm_v1 == 0 or norm_v2 == 0:
        return 0.0

    return dot_product / (norm_v1 * norm_v2)


def get_semantic_match(query: str, user_id: str, namespace: str = "chat") -> Optional[Tuple[str, float]]:
    if not query or len(query.strip()) < 5:
        return None

    index_key = f"semantic:{namespace}:{user_id}:index"
    keys_list = redis_client.cache_get(index_key) or []
    if not keys_list:
        return None

    try:
        query_vector = get_embedding(query.strip())
    except Exception as e:
        logger.warning(f"Failed to generate embedding for semantic cache: {e}")
        return None

    best_match_answer = None
    highest_similarity = -1.0
    matched_query_text = ""

    for item_key in keys_list:
        cached_item = redis_client.cache_get(item_key)
        if not cached_item:
            continue

        cached_vector = cached_item.get("vector", [])
        sim = cosine_similarity(query_vector, cached_vector)

        if sim > highest_similarity:
            highest_similarity = sim
            best_match_answer = cached_item.get("answer")
            matched_query_text = cached_item.get("query", "")

    if highest_similarity >= SIMILARITY_THRESHOLD and best_match_answer:
        logger.info(
            f" SEMANTIC CACHE HIT ({highest_similarity:.2%}) for user {user_id}! "
            f"Query: '{query}' matched with '{matched_query_text}'"
        )
        return (best_match_answer, highest_similarity)

    return None


def save_semantic_match(query: str, answer: str, user_id: str, namespace: str = "chat", ttl_seconds: int = 86400):
    if not query or not answer or len(query.strip()) < 5:
        return

    try:
        query_vector = get_embedding(query.strip())
    except Exception as e:
        logger.warning(f"Failed to generate embedding for saving semantic cache: {e}")
        return

    import hashlib
    h = hashlib.md5(query.strip().lower().encode("utf-8")).hexdigest()[:12]
    item_key = f"semantic:{namespace}:{user_id}:{h}"

    item_data = {
        "query": query.strip(),
        "vector": query_vector,
        "answer": answer.strip()
    }

    redis_client.cache_set(item_key, item_data, ttl_seconds=ttl_seconds)

    index_key = f"semantic:{namespace}:{user_id}:index"
    keys_list = redis_client.cache_get(index_key) or []
    if item_key not in keys_list:
        keys_list.append(item_key)
        if len(keys_list) > MAX_CACHED_ITEMS:
            keys_list = keys_list[-MAX_CACHED_ITEMS:]
        redis_client.cache_set(index_key, keys_list, ttl_seconds=ttl_seconds)
