import time
import logging
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger(__name__)

class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # We don't need to manually grab correlation_id here because it's managed 
        # by asgi-correlation-id contextvars and printed automatically by config/logger.py
        
        start_time = time.time()
        
        # Ignore health checks for logging to avoid spam
        if request.url.path == "/health" or request.url.path.endswith("/health"):
            return await call_next(request)
            
        logger.info(
            f"Request Started: {request.method} {request.url.path}",
            extra={
                "http_method": request.method,
                "url_path": request.url.path,
                "client_ip": request.client.host if request.client else None,
            }
        )
        
        try:
            response = await call_next(request)
            process_time = (time.time() - start_time) * 1000
            
            logger.info(
                f"Request Completed: {request.method} {request.url.path} - {response.status_code}",
                extra={
                    "http_method": request.method,
                    "url_path": request.url.path,
                    "status_code": response.status_code,
                    "duration_ms": round(process_time, 2),
                }
            )
            return response
            
        except Exception as e:
            process_time = (time.time() - start_time) * 1000
            logger.error(
                f"Request Failed: {request.method} {request.url.path} - {str(e)}",
                exc_info=True,
                extra={
                    "http_method": request.method,
                    "url_path": request.url.path,
                    "duration_ms": round(process_time, 2),
                    "error_type": type(e).__name__,
                }
            )
            raise
