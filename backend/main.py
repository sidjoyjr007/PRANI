from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config.settings import settings
from config.database import Base, engine, SessionLocal
from routes import api_router
from engine.tools import ToolRegistry

from asgi_correlation_id import CorrelationIdMiddleware
from middleware.logging_middleware import LoggingMiddleware
from config.logger import setup_logging

# Initialize standardized JSON logging for the application
setup_logging()

# Import all models so SQLAlchemy's `create_all` discovers them
import models

# Create tables
Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    
    # Shutdown logic (if any)

# Create FastAPI app
app = FastAPI(
    title="Prani API",
    description="Secure authentication API",
    version="1.0.0",
    lifespan=lifespan
)

# Standard logging middlewares (executed bottom-up)
app.add_middleware(LoggingMiddleware)
app.add_middleware(CorrelationIdMiddleware)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(api_router, prefix="/api")


@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug,
    )
