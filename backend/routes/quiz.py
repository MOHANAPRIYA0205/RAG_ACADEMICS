"""
routes/quiz.py — Quiz generation and submission
"""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List
from agents.agents import AGENTS

router = APIRouter()


class QuizRequest(BaseModel):
    topic: str
    n: Optional[int] = 5
    difficulty: Optional[str] = "medium"


class QuizAnswer(BaseModel):
    q: Optional[int] = None
    selected: int
    correct: int


class QuizSubmissionRequest(BaseModel):
    answers: List[QuizAnswer]


@router.post("/generate")
async def generate_quiz(req: QuizRequest):
    """Generate quiz questions using the Quiz Agent."""
    quiz_agent = AGENTS["quiz"]
    result = quiz_agent.run(
        topic=req.topic,
        n=req.n,
        difficulty=req.difficulty,
    )
    questions = result.get("questions", [])
    return {
        "topic": req.topic,
        "difficulty": req.difficulty,
        "count": len(questions),
        "questions": questions,
        "status": "success" if questions else "partial",
        "note": result.get("note", ""),
    }


@router.post("/submit")
async def submit_quiz(req: QuizSubmissionRequest):
    """Submit quiz answers and calculate the score."""
    answers = req.answers
    if not answers:
        return {"score": 0, "total": 0, "percentage": 0.0, "xp_earned": 0, "feedback": "No answers submitted."}

    score = sum(1 for a in answers if a.selected == a.correct)
    total = len(answers)
    percentage = round((score / total) * 100, 1) if total > 0 else 0.0

    return {
        "score": score,
        "total": total,
        "percentage": percentage,
        "xp_earned": score * 10,
        "feedback": f"You scored {score}/{total} ({percentage}%)",
    }
