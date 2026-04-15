"""
cache.py — In-memory cache with TTL (time-to-live).

Provides a simple dictionary-based cache to store web-scraped content
so we don't hammer the source websites on every request.
"""

import time
from typing import Optional


# Cache storage: { key: (value, timestamp) }
_cache: dict[str, tuple[str, float]] = {}

# Default TTL: 10 minutes (600 seconds)
DEFAULT_TTL = 600


def get(key: str, ttl: int = DEFAULT_TTL) -> Optional[str]:
    """
    Retrieve a cached value if it exists and hasn't expired.

    Args:
        key: Cache key (typically the URL or a derived identifier).
        ttl: Time-to-live in seconds. If the entry is older than this, it's stale.

    Returns:
        The cached string value, or None if not found / expired.
    """
    if key not in _cache:
        return None

    value, timestamp = _cache[key]
    age = time.time() - timestamp

    if age > ttl:
        # Entry has expired — remove it and return None
        del _cache[key]
        return None

    return value


def set(key: str, value: str) -> None:
    """
    Store a value in the cache with the current timestamp.

    Args:
        key: Cache key.
        value: The string content to cache.
    """
    _cache[key] = (value, time.time())


def clear() -> None:
    """Clear the entire cache."""
    _cache.clear()


def info() -> dict:
    """
    Return cache statistics for debugging.

    Returns:
        Dictionary with total entries and per-entry age in seconds.
    """
    now = time.time()
    entries = {}
    for key, (_, timestamp) in _cache.items():
        entries[key] = {
            "age_seconds": round(now - timestamp, 1),
        }
    return {
        "total_entries": len(_cache),
        "entries": entries,
    }
