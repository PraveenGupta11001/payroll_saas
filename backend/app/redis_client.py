import redis

redis_client = redis.Redis(
    host="localhost",
    port=6379,
    password="redisStrongPass456",
    db=0,
    decode_responses=True
)

# Token blacklist functions
BLACKLIST_PREFIX = "bl_token:"

def blacklist_token(jti: str, expires_in: int = 86400):
    """Add a JWT token ID to the blacklist with expiry."""
    redis_client.setex(f"{BLACKLIST_PREFIX}{jti}", expires_in, "1")

def is_token_blacklisted(jti: str) -> bool:
    """Check if a JWT token ID is blacklisted."""
    return redis_client.exists(f"{BLACKLIST_PREFIX}{jti}") > 0
