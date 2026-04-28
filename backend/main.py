"""
main.py — FastAPI Backend Entry Point
Academic AI RAG Platform
"""
import os
import sys
import logging
from pathlib import Path

# Ensure the backend directory is on sys.path so relative imports work
# whether the app is started from the repo root or from inside backend/
_backend_dir = Path(__file__).parent
if str(_backend_dir) not in sys.path:
    sys.path.insert(0, str(_backend_dir))

# Load .env from the project root (one level above backend/)
from dotenv import load_dotenv
load_dotenv(Path(__file__).parent.parent / ".env")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from routes import chat, documents, quiz, auth, analytics
from db.database import engine, Base
from models import models  # noqa: F401 — ensures models are registered with Base

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AcademicAI RAG API",
    description="Multi-agent RAG-powered academic assistant",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ────────────────────────────────────────────────────────────────────
app.include_router(auth.router,      prefix="/api/auth",      tags=["Auth"])
app.include_router(documents.router, prefix="/api/documents", tags=["Documents"])
app.include_router(chat.router,      prefix="/api/chat",      tags=["Chat"])
app.include_router(quiz.router,      prefix="/api/quiz",      tags=["Quiz"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])


# ── Health check ───────────────────────────────────────────────────────────────
@app.get("/health")
async def health():
    return {"status": "ok", "pipeline": "RAG active", "agents": 5}


# ── Static files (frontend) ────────────────────────────────────────────────────
_frontend_dir = Path(__file__).parent.parent  # project root

_js_dir  = _frontend_dir / "js"
_css_dir = _frontend_dir / "css"

if _js_dir.exists():
    try:
        app.mount("/js", StaticFiles(directory=str(_js_dir)), name="js")
        logger.info(f"Serving JS from {_js_dir}")
    except Exception as e:
        logger.warning(f"Could not mount JS directory: {e}")

if _css_dir.exists():
    try:
        app.mount("/css", StaticFiles(directory=str(_css_dir)), name="css")
        logger.info(f"Serving CSS from {_css_dir}")
    except Exception as e:
        logger.warning(f"Could not mount CSS directory: {e}")


@app.get("/")
async def root():
    index_path = _frontend_dir / "index.html"
    if index_path.exists():
        return FileResponse(str(index_path))
    return {
        "message": "AcademicAI RAG Backend API",
        "version": "1.0.0",
        "docs": "/docs",
    }


# ── Entry point ────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
