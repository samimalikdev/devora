import time
import logging
from typing import Optional
from fastapi import Request, HTTPException, status
from app.core.redis_client import get_redis

logger = logging.getLogger(__name__)

_in_memory_rate_limits: dict[str, list[float]] = {}


def get_client_ip(request: Request) -> str:
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    real_ip = request.headers.get("X-Real-IP")
    if real_ip:
        return real_ip.strip()
    return request.client.host if request.client else "unknown"


def enforce_rate_limit(
    key_prefix: str,
    identifier: str,
    max_requests: int = 10,
    window_seconds: int = 60,
    error_message: Optional[str] = None
):

    key = f"rate_limit:{key_prefix}:{identifier}"
    now = time.time()
    r = get_redis()

    if r:
        try:
            pipe = r.pipeline()
            pipe.zremrangebyscore(key, 0, now - window_seconds)
            pipe.zadd(key, {str(now): now})
            pipe.zcard(key)
            pipe.expire(key, window_seconds + 5)
            results = pipe.execute()
            current_count = results[2]
            if current_count > max_requests:
                detail = error_message or f"Rate limit exceeded. Maximum {max_requests} requests per {window_seconds}s. Please wait."
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=detail,
                    headers={"Retry-After": str(window_seconds)}
                )
            return
        except HTTPException:
            raise
        except Exception as e:
            logger.warning(f"Redis rate limit check failed, falling back to memory: {e}")

    timestamps = _in_memory_rate_limits.get(key, [])
    timestamps = [t for t in timestamps if t > (now - window_seconds)]

    if len(timestamps) >= max_requests:
        detail = error_message or f"Rate limit exceeded. Maximum {max_requests} requests per {window_seconds}s. Please wait."
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=detail,
            headers={"Retry-After": str(window_seconds)}
        )

    timestamps.append(now)
    _in_memory_rate_limits[key] = timestamps

