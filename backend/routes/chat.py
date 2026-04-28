"""
routes/chat.py — Chat query endpoint
"""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List
from agents.agents import dispatch

router = APIRouter()


class ChatRequest(BaseModel):
    query: str
    agent: Optional[str] = None
    history: Optional[List[dict]] = []


class ChatResponse(BaseModel):
    answer: str
    sources: list
    agent: str


@router.post("/query", response_model=ChatResponse)
async def chat_query(req: ChatRequest):
    """Route a user query to the appropriate agent and return the response."""
    result = dispatch(req.query, agent_id=req.agent)
    return {
        "answer": result.get("answer", ""),
        "sources": result.get("sources", []),
        "agent": result.get("agent", "academic"),
    }


@router.get("/history/{session_id}")
async def get_history(session_id: str):
    """Return chat history for a session (stub — extend with DB persistence)."""
    return {"session_id": session_id, "messages": []}
