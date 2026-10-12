import time
from collections import defaultdict
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse


class SecurityAndRateLimitMiddleware(BaseHTTPMiddleware):
    """Middleware enforcing HTTP security headers and sliding-window per-IP rate limiting."""

    def __init__(self, app, max_requests_per_minute: int = 120):
        super().__init__(app)
        self.max_requests = max_requests_per_minute
        self.requests_log: dict[str, list[float]] = defaultdict(list)

    async def dispatch(self, request: Request, call_next) -> Response:
        client_ip = request.client.host if request.client else "unknown"
        now = time.time()

        # Clean timestamps older than 60 seconds
        window_start = now - 60.0
        self.requests_log[client_ip] = [
            ts for ts in self.requests_log[client_ip] if ts > window_start
        ]

        if len(self.requests_log[client_ip]) >= self.max_requests:
            return JSONResponse(
                status_code=429,
                content={"detail": "Rate limit exceeded. Please wait before sending more requests."}
            )

        self.requests_log[client_ip].append(now)

        response: Response = await call_next(request)

        # Standard OWASP Security Headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"

        return response
