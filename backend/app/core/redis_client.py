import json
import logging
import os
import time
from typing import Any, Optional
import redis

logger = logging.getLogger(__name__)

REDIS_URL = os.getenv("REDIS_URL", "") or os.getenv("REDIUS_URL", "")

_redis_client: Optional[redis.Redis] = None
_in_memory_fallback: dict = {}


def get_redis() -> Optional[redis.Redis]:
    global _redis_client
    if not REDIS_URL or REDIS_URL.strip() == "":
        return None

    if _redis_client is None:
        try:
            _redis_client = redis.from_url(
                REDIS_URL,
                decode_responses=True,
                socket_timeout=3,
                socket_connect_timeout=3,
            )
            _redis_client.ping()
            logger.info("Connected to Redis successfully.")
        except Exception as e:
            logger.warning(f"Redis connection failed, using fallback in-memory cache: {e}")
            _redis_client = None

    return _redis_client


def cache_get(key: str) -> Optional[Any]:
    r = get_redis()
    if r:
        try:
            val = r.get(key)
            return json.loads(val) if val else None
        except Exception as e:
            logger.warning(f"Redis GET failed for {key}: {e}")

    if key in _in_memory_fallback:
        entry = _in_memory_fallback[key]
        if time.time() < entry["expires_at"]:
            return entry["data"]
        else:
            del _in_memory_fallback[key]

    return None


def cache_set(key: str, value: Any, ttl_seconds: int = 3600):
    r = get_redis()
    if r:
        try:
            r.setex(key, ttl_seconds, json.dumps(value))
            return
        except Exception as e:
            logger.warning(f"Redis SET failed for {key}: {e}")

    _in_memory_fallback[key] = {
        "data": value,
        "expires_at": time.time() + ttl_seconds
    }
