"""
# COST GUARDRAIL: Free tier only
# Rate Limiting & Quota Throttling Middleware
# Enforces strict request caps on free external API endpoints to prevent exhaustion or overage.
"""
from fastapi import Request, Response
from fastapi.responses import JSONResponse
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# COST GUARDRAIL: Free tier only
# Limiter tracks requests per client IP to safeguard free Gemini & Mappls quotas
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["60/minute"],
    headers_enabled=False,
    storage_uri="memory://"
)

async def rate_limit_custom_handler(request: Request, exc: RateLimitExceeded) -> Response:
    """
    # COST GUARDRAIL: Free tier only
    Graceful 429 Too Many Requests response handler.
    Returns structured, friendly JSON to prevent system crashes and alert the client.
    """
    return JSONResponse(
        status_code=429,
        content={
            "status": "RATE_LIMITED",
            "error": "Free-tier quota protection active. Request limit reached.",
            "message": "To protect free developer API limits (Google Gemini & MapmyIndia), please wait a few seconds before retrying.",
            "retry_after_seconds": 15,
            "cost_guardrail": "Active (Zero-Cost Free Tier Policy Enforced)"
        }
    )
