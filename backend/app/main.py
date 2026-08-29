"""
# COST GUARDRAIL: Free tier only
# FastAPI Main Application Entrypoint with Zero-Cost Rate Limiting
"""
import os
from dotenv import load_dotenv

# Load backend/.env explicitly
env_path = os.path.join(os.path.dirname(__file__), "..", ".env")
load_dotenv(dotenv_path=os.path.abspath(env_path))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from slowapi.errors import RateLimitExceeded
from app.core.config import settings
from app.api.endpoints import router as api_router
from app.middleware.rate_limit import limiter, rate_limit_custom_handler

# Initialize FastAPI Application
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Deterministic MoSJE Concessional Credit & Hyper-Local Feasibility Advisory Engine"
)

# Attach Rate Limiter to app state
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, rate_limit_custom_handler)

# Enable CORS for frontend Vite development & production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure static directories exist
static_dir = os.path.join(os.path.dirname(__file__), "static")
reports_dir = os.path.join(static_dir, "reports")
os.makedirs(reports_dir, exist_ok=True)

# Mount static files
app.mount("/static", StaticFiles(directory=static_dir), name="static")

# Include API Router
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "status": "ONLINE",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs_url": "/docs",
        "mandate": "Ministry of Social Justice and Empowerment (MoSJE) - SIH26091",
        "cost_guardrail": "Active (Zero-Cost Free Developer Tier Enforcement)"
    }
