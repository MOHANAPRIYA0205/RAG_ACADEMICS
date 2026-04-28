"""
agents/agents.py — Multi-Agent System with LLM-based Routing
"""
import os
import json
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
env_path = Path(__file__).parent.parent.parent / ".env"
load_dotenv(env_path)

from langchain_openai import ChatOpenAI
from rag.pipeline import rag

_llm = None  # Will be initialized on first use


def get_llm():
    """Return a shared ChatOpenAI instance, or None if unavailable."""
    global _llm
    if _llm is None:
        api_key = os.getenv("OPENAI_API_KEY", "")
        if not api_key or len(api_key) < 20:
            _llm = False  # Mark as unavailable
            return None
        try:
            _llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
        except Exception as e:
            print(f"Warning: Could not initialize LLM: {e}")
            _llm = False
    return _llm if _llm is not False else None


def _keyword_route(query: str) -> str:
    """Pure keyword-based routing — no LLM required."""
    q = query.lower()
    # Scheduler keywords checked before quiz so "study schedule for exams" → scheduler
    if any(kw in q for kw in ["schedule", "timetable", "study plan", "revision plan", "when to study", "study schedule", "plan my study", "study timetable"]):
        return "scheduler"
    elif any(kw in q for kw in ["quiz", "mcq", "generate quiz", "generate questions", "practice questions"]):
        return "quiz"
    elif any(kw in q for kw in ["code", "python", "debug", "program", "implement", "write a function", "write code"]):
        return "coding"
    elif any(kw in q for kw in ["performance", "score", "analytics", "progress", "weak area", "improve"]):
        return "analytics"
    # Broad quiz/exam keywords last so they don't override scheduler
    elif any(kw in q for kw in ["question", "test", "exam"]):
        return "quiz"
    return "academic"


AGENT_DESCRIPTIONS = {
    "academic":  "Answers questions about syllabus, notes, concepts using RAG",
    "quiz":      "Generates MCQs, short/long answer questions from documents",
    "scheduler": "Creates study plans, timetables, and revision schedules",
    "coding":    "Helps with programming labs, debugging, code explanations",
    "analytics": "Provides performance insights and improvement suggestions",
}


def route_query(query: str) -> str:
    """LLM-based intelligent routing with keyword fallback."""
    llm_client = get_llm()
    if not llm_client:
        return _keyword_route(query)

    try:
        prompt = (
            f"You are a query router. Based on the user query, choose the best agent.\n"
            f"Agents: {json.dumps(AGENT_DESCRIPTIONS)}\n"
            f'Query: "{query}"\n'
            f"Reply with ONLY the agent key (academic/quiz/scheduler/coding/analytics):"
        )
        response = llm_client.invoke(prompt).content.strip().lower()
        # Strip any extra punctuation the model might add
        response = response.split()[0] if response else "academic"
        return response if response in AGENT_DESCRIPTIONS else "academic"
    except Exception as e:
        print(f"Routing error: {e}")
        return _keyword_route(query)


class AcademicAgent:
    def run(self, query: str, history: list = None) -> dict:
        result = rag.query(query)
        if not result.get("sources"):
            result["answer"] = (
                f"📚 Your Query: {query}\n\n"
                + result["answer"]
                + "\n\n💡 Tip: Upload documents to get more specific answers from your materials."
            )
        return result


class QuizAgent:
    def run(self, topic: str, n: int = 5, difficulty: str = "medium") -> dict:
        llm_client = get_llm()
        if not llm_client:
            # Fallback quiz generation without LLM
            return {
                "questions": [
                    {
                        "question": f"What is {topic}?",
                        "options": ["Option A", "Option B", "Option C", "Option D"],
                        "correct": 0,
                        "explanation": "Upload documents and add an OpenAI API key for AI-generated quizzes."
                    }
                ],
                "topic": topic,
                "note": "LLM unavailable — showing template. Add OPENAI_API_KEY for real quiz generation.",
            }

        try:
            docs_result = rag.query(f"key concepts about {topic}")
            docs_context = docs_result.get("answer", "")
            prompt = (
                f"Generate {n} {difficulty}-difficulty MCQs about: {topic}\n"
                f"Based on: {docs_context[:800]}\n"
                f'Format as JSON array: [{{"question":"...","options":["A","B","C","D"],"correct":0,"explanation":"..."}}]\n'
                f"Return ONLY the JSON array, no extra text."
            )
            raw = llm_client.invoke(prompt).content.strip()
            # Strip markdown code fences if present
            if raw.startswith("```"):
                raw = raw.split("```")[1]
                if raw.startswith("json"):
                    raw = raw[4:]
            questions = json.loads(raw.strip())
            if not isinstance(questions, list):
                raise ValueError("Expected a JSON array")
        except Exception as e:
            print(f"Quiz generation error: {e}")
            questions = []

        return {"questions": questions, "topic": topic}


class SchedulerAgent:
    def run(self, query: str, **kwargs) -> dict:
        llm_client = get_llm()
        docs_result = rag.query(query)
        docs_context = docs_result.get("answer", "")

        if not llm_client:
            return {
                "schedule": (
                    f"📅 **Study Schedule for: {query}**\n\n"
                    "**Monday – Friday**: 2 hours daily focused study\n"
                    "**Saturday**: 3 hours review + practice\n"
                    "**Sunday**: 1 hour light review + planning\n\n"
                    "💡 Tip: Add an OpenAI API key for personalized schedules based on your documents."
                )
            }

        try:
            prompt = (
                f"Based on this academic content, create a detailed weekly study schedule.\n"
                f"Content: {docs_context[:600]}\n"
                f"Format as structured markdown with days, topics, and durations."
            )
            return {"schedule": llm_client.invoke(prompt).content}
        except Exception as e:
            print(f"Scheduler error: {e}")
            return {"schedule": "Schedule generation currently unavailable. Please try again later."}


class CodingAgent:
    def run(self, query: str, **kwargs) -> dict:
        llm_client = get_llm()

        if not llm_client:
            return {
                "code": (
                    f"```python\n# {query}\n# Example implementation\n\n"
                    "def solve():\n    # Add your implementation here\n    pass\n\n"
                    "# Usage\nresult = solve()\n```\n\n"
                    "**Note:** Add an OpenAI API key for detailed explanations and implementations."
                )
            }

        try:
            prompt = (
                f"You are an expert Python/AI programming assistant.\n"
                f"Provide clean, well-commented code with explanation for: {query}\n"
                f"Include: implementation, explanation, example usage."
            )
            return {"code": llm_client.invoke(prompt).content}
        except Exception as e:
            print(f"Coding agent error: {e}")
            return {"code": f"Error generating code: {str(e)}"}


class AnalyticsAgent:
    def run(self, query: str = None, **kwargs) -> dict:
        return {
            "performance": {
                "accuracy": 85,
                "speed": "Good",
                "retention": 78,
                "trend": "📈 Improving",
            },
            "recommendations": [
                "Focus on weak topics",
                "Increase practice frequency",
                "Review yesterday's material",
            ],
            "streaks": {
                "current": 7,
                "best": 21,
                "xp_earned": 450,
            },
        }


# Agent registry
AGENTS = {
    "academic":  AcademicAgent(),
    "quiz":      QuizAgent(),
    "scheduler": SchedulerAgent(),
    "coding":    CodingAgent(),
    "analytics": AnalyticsAgent(),
}


def dispatch(query: str, agent_id: str = None) -> dict:
    """Route query to the appropriate agent and return a unified response dict."""
    if agent_id is None or agent_id not in AGENTS:
        agent_id = route_query(query)

    agent = AGENTS[agent_id]

    # Each agent's run() may return different keys; normalise to answer + sources
    raw = agent.run(query)

    # Normalise: ensure 'answer' key exists
    if "answer" not in raw:
        # Coding agent returns 'code', scheduler returns 'schedule', etc.
        if "code" in raw:
            raw["answer"] = raw.pop("code")
        elif "schedule" in raw:
            raw["answer"] = raw.pop("schedule")
        elif "performance" in raw:
            import json as _json
            raw["answer"] = _json.dumps(raw, indent=2)
        elif "questions" in raw:
            raw["answer"] = f"Generated {len(raw['questions'])} quiz questions for topic: {raw.get('topic','')}"
        else:
            raw["answer"] = str(raw)

    raw.setdefault("sources", [])
    raw["agent"] = agent_id
    return raw
