"""
routes/analytics.py — Analytics and performance endpoints
"""
from fastapi import APIRouter

router = APIRouter()


@router.get("/performance/{user_id}")
async def get_performance(user_id: str):
    """Return performance analytics for a user."""
    return {
        "user_id": user_id,
        "overall": 76,
        "streak": 12,
        "subjects": [
            {"name": "Machine Learning",    "score": 85},
            {"name": "Deep Learning",       "score": 72},
            {"name": "NLP & RAG",           "score": 68},
            {"name": "Computer Vision",     "score": 80},
            {"name": "Knowledge Rep.",      "score": 61},
            {"name": "Search & AI",         "score": 77},
        ],
        "recommendations": [
            "Focus on Knowledge Representation",
            "Revise Transformer architecture",
        ],
    }


@router.get("/summary")
async def get_summary():
    """Return a high-level analytics summary."""
    return {
        "quizzes_taken": 47,
        "avg_score": 76,
        "study_hours": 38,
        "streak": 12,
        "xp": 3480,
    }
