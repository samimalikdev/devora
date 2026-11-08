import hashlib
import logging
import re
from typing import List, Dict, Any, Optional
import httpx

from app.core.config import settings
from app.core.redis_client import cache_get, cache_set

logger = logging.getLogger(__name__)

EXA_SEARCH_URL = "https://api.exa.ai/search"
CACHE_TTL_SECONDS = 900 


def sanitize_text(text: str) -> str:

    if not text:
        return ""
    clean = re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', '', text)

    clean = clean.replace("<", "&lt;").replace(">", "&gt;")
    return clean.strip()


def is_safe_url(url: Optional[str]) -> bool:

    if not url or not isinstance(url, str):
        return False
    u = url.strip().lower()

    return u.startswith("https://") or u.startswith("http://")


async def search_web_exa(query: str, num_results: int = 3) -> List[Dict[str, Any]]:

    if not settings.EXA_API_KEY:
        logger.warning("EXA_API_KEY not configured. Skipping live web search.")
        return []

    clean_query = re.sub(r'[\r\n\t]+', ' ', query or '').strip()
    clean_query = clean_query[:200] 

    if len(clean_query) < 2:
        return []

    bounded_results = max(1, min(int(num_results or 3), 5))

    query_hash = hashlib.sha256(f"{clean_query.lower()}:{bounded_results}".encode()).hexdigest()[:16]
    cache_key = f"exa_cache:{query_hash}"
    cached_data = cache_get(cache_key)
    if cached_data is not None:
        logger.info(f"Exa search cache hit for query: '{clean_query[:40]}'")
        return cached_data

    headers = {
        "x-api-key": settings.EXA_API_KEY,
        "Content-Type": "application/json"
    }

    payload = {
        "query": clean_query,
        "type": "auto",
        "numResults": bounded_results,
        "contents": {
            "highlights": True,
            "text": {"maxCharacters": 600}
        }
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(EXA_SEARCH_URL, json=payload, headers=headers)
            if response.status_code >= 400:
                logger.error(f"Exa search failed ({response.status_code}): {response.text}")
                return []

            data = response.json()
            raw_results = data.get("results", [])
            cleaned_results: List[Dict[str, Any]] = []

            for item in raw_results:
                raw_url = item.get("url")
                if not is_safe_url(raw_url):
                    continue

                raw_title = item.get("title") or "Web Source"
                highlights = item.get("highlights", [])
                snippet = " ".join(highlights) if highlights else (item.get("text") or "")[:250]

                cleaned_results.append({
                    "title": sanitize_text(raw_title)[:120],
                    "url": raw_url.strip(),
                    "snippet": sanitize_text(snippet)[:300],
                })

            if cleaned_results:
                cache_set(cache_key, cleaned_results, ttl_seconds=CACHE_TTL_SECONDS)

            return cleaned_results

    except Exception as e:
        logger.error(f"Exception during Exa live search: {e}")
        return []
