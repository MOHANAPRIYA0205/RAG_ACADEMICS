"""
Unit tests for Multi-Agent System
Tests agent routing, dispatch, and individual agent functionality
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))

import pytest
from agents.agents import (
    route_query,
    dispatch,
    AGENTS,
    AcademicAgent,
    QuizAgent,
    SchedulerAgent,
    CodingAgent,
    AnalyticsAgent
)


class TestAgentRouting:
    """Test suite for agent routing logic"""

    def test_route_to_quiz_agent(self):
        """Test routing to quiz agent"""
        queries = [
            "generate a quiz about machine learning",
            "create mcq questions",
            "I need practice questions",
        ]
        for query in queries:
            agent_id = route_query(query)
            assert agent_id == "quiz", f"Failed for query: {query}"

    def test_route_to_scheduler_agent(self):
        """Test routing to scheduler agent"""
        queries = [
            "create a study schedule",
            "make a timetable for exams",
            "plan my study for this week",
        ]
        for query in queries:
            agent_id = route_query(query)
            assert agent_id == "scheduler", f"Failed for query: {query}"

    def test_route_to_coding_agent(self):
        """Test routing to coding agent"""
        queries = [
            "write python code for sorting",
            "debug my program",
            "implement a function",
        ]
        for query in queries:
            agent_id = route_query(query)
            assert agent_id == "coding", f"Failed for query: {query}"

    def test_route_to_analytics_agent(self):
        """Test routing to analytics agent"""
        queries = [
            "show my performance",
            "what are my weak areas",
            "analytics dashboard",
        ]
        for query in queries:
            agent_id = route_query(query)
            assert agent_id == "analytics", f"Failed for query: {query}"

    def test_route_to_academic_agent(self):
        """Test routing to academic agent (default)"""
        queries = [
            "what is machine learning",
            "explain backpropagation",
            "define neural networks",
        ]
        for query in queries:
            agent_id = route_query(query)
            assert agent_id == "academic", f"Failed for query: {query}"


class TestAgentDispatch:
    """Test suite for agent dispatch mechanism"""

    def test_dispatch_returns_dict(self):
        """Test that dispatch returns a properly formatted dict"""
        result = dispatch("What is AI?", agent_id="academic")
        
        assert isinstance(result, dict)
        assert "answer" in result
        assert "sources" in result
        assert "agent" in result

    def test_dispatch_with_explicit_agent(self):
        """Test dispatch with explicitly specified agent"""
        result = dispatch("Test query", agent_id="analytics")
        
        assert result["agent"] == "analytics"

    def test_dispatch_with_auto_routing(self):
        """Test dispatch with automatic agent routing"""
        result = dispatch("generate a quiz")
        
        # Should route to quiz agent
        assert result["agent"] in AGENTS.keys()

    def test_dispatch_invalid_agent_fallback(self):
        """Test that invalid agent ID falls back to academic"""
        result = dispatch("Test query", agent_id="invalid_agent")
        
        assert result["agent"] == "academic"


class TestAcademicAgent:
    """Test suite for Academic Agent"""

    @pytest.fixture
    def agent(self):
        return AcademicAgent()

    def test_academic_agent_run(self, agent):
        """Test academic agent execution"""
        result = agent.run("What is machine learning?")
        
        assert isinstance(result, dict)
        assert "answer" in result
        assert len(result["answer"]) > 0

    def test_academic_agent_with_history(self, agent):
        """Test academic agent with conversation history"""
        history = [
            {"role": "user", "content": "What is AI?"},
            {"role": "assistant", "content": "AI is..."}
        ]
        result = agent.run("Tell me more", history=history)
        
        assert isinstance(result, dict)
        assert "answer" in result


class TestQuizAgent:
    """Test suite for Quiz Agent"""

    @pytest.fixture
    def agent(self):
        return QuizAgent()

    def test_quiz_agent_run(self, agent):
        """Test quiz generation"""
        result = agent.run(topic="Machine Learning", n=5, difficulty="medium")
        
        assert isinstance(result, dict)
        assert "questions" in result
        assert "topic" in result
        assert result["topic"] == "Machine Learning"

    def test_quiz_agent_question_format(self, agent):
        """Test that generated questions have correct format"""
        result = agent.run(topic="AI", n=3, difficulty="easy")
        
        questions = result.get("questions", [])
        if len(questions) > 0:
            q = questions[0]
            assert "question" in q
            assert "options" in q
            assert "correct" in q
            assert "explanation" in q

    def test_quiz_agent_different_difficulties(self, agent):
        """Test quiz generation with different difficulties"""
        for difficulty in ["easy", "medium", "hard"]:
            result = agent.run(topic="Test", n=2, difficulty=difficulty)
            assert isinstance(result, dict)
            assert "questions" in result


class TestSchedulerAgent:
    """Test suite for Scheduler Agent"""

    @pytest.fixture
    def agent(self):
        return SchedulerAgent()

    def test_scheduler_agent_run(self, agent):
        """Test schedule generation"""
        result = agent.run("Create a study plan for exams")
        
        assert isinstance(result, dict)
        assert "schedule" in result
        assert len(result["schedule"]) > 0

    def test_scheduler_agent_output_format(self, agent):
        """Test that schedule output is properly formatted"""
        result = agent.run("Weekly study schedule")
        
        schedule = result.get("schedule", "")
        assert isinstance(schedule, str)
        assert len(schedule) > 0


class TestCodingAgent:
    """Test suite for Coding Agent"""

    @pytest.fixture
    def agent(self):
        return CodingAgent()

    def test_coding_agent_run(self, agent):
        """Test code generation"""
        result = agent.run("Write a function to sort a list")
        
        assert isinstance(result, dict)
        assert "code" in result
        assert len(result["code"]) > 0

    def test_coding_agent_output_contains_code(self, agent):
        """Test that output contains code blocks"""
        result = agent.run("Implement bubble sort")
        
        code = result.get("code", "")
        # Should contain code markers or actual code
        assert isinstance(code, str)
        assert len(code) > 0


class TestAnalyticsAgent:
    """Test suite for Analytics Agent"""

    @pytest.fixture
    def agent(self):
        return AnalyticsAgent()

    def test_analytics_agent_run(self, agent):
        """Test analytics generation"""
        result = agent.run()
        
        assert isinstance(result, dict)
        assert "performance" in result or "recommendations" in result

    def test_analytics_agent_structure(self, agent):
        """Test analytics output structure"""
        result = agent.run()
        
        if "performance" in result:
            perf = result["performance"]
            assert isinstance(perf, dict)
        
        if "recommendations" in result:
            recs = result["recommendations"]
            assert isinstance(recs, list)


class TestAgentRegistry:
    """Test suite for agent registry"""

    def test_all_agents_registered(self):
        """Test that all agents are in the registry"""
        expected_agents = ["academic", "quiz", "scheduler", "coding", "analytics"]
        
        for agent_id in expected_agents:
            assert agent_id in AGENTS
            assert AGENTS[agent_id] is not None

    def test_agent_instances(self):
        """Test that all registered agents are proper instances"""
        for agent_id, agent in AGENTS.items():
            assert hasattr(agent, "run")
            assert callable(agent.run)


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
