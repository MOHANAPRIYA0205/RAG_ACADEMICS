/* =====================================================
   agents.js — Multi-Agent System
   ===================================================== */

const AgentSystem = (() => {
  const AGENTS = {
    academic: {
      id: "academic", name: "Academic Agent", emoji: "🎓",
      desc: "Syllabus & notes-based Q&A via RAG",
      color: "#6366f1",
      keywords: ["unit", "syllabus", "explain", "what is", "define", "describe", "how does", "notes", "concept", "theory", "algorithm"]
    },
    quiz: {
      id: "quiz", name: "Quiz Agent", emoji: "🧪",
      desc: "Generates adaptive quizzes from content",
      color: "#a855f7",
      keywords: ["quiz", "question", "test", "mcq", "exam", "practice", "generate quiz"]
    },
    scheduler: {
      id: "scheduler", name: "Scheduler Agent", emoji: "📅",
      desc: "Generates study plans & timetables",
      color: "#22d3ee",
      keywords: ["schedule", "plan", "timetable", "study plan", "when", "time", "reminder", "revision"]
    },
    coding: {
      id: "coding", name: "Coding Agent", emoji: "💻",
      desc: "Lab help, debugging & code explanations",
      color: "#10b981",
      keywords: ["code", "program", "python", "implement", "debug", "error", "function", "class", "algorithm", "write a"]
    },
    analytics: {
      id: "analytics", name: "Analytics Agent", emoji: "📊",
      desc: "Performance tracking & improvement tips",
      color: "#f59e0b",
      keywords: ["performance", "score", "analytics", "progress", "weak", "improve", "trend", "result"]
    }
  };

  // LLM-based routing on frontend (fallback/default)
  function routeQuery(query) {
    const q = query.toLowerCase();
    for (const [id, agent] of Object.entries(AGENTS)) {
      if (agent.keywords.some(kw => q.includes(kw))) return agent;
    }
    return AGENTS.academic; // default
  }

  async function dispatch(query, agentId = null) {
    let agent = agentId ? AGENTS[agentId] : routeQuery(query);
    
    try {
      const response = await fetch('/api/chat/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query,
          agent: agentId || null
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch from backend');
      }

      const result = await response.json();
      
      // If the backend routed to a different agent, update it
      if (result.agent && AGENTS[result.agent]) {
        agent = AGENTS[result.agent];
      }

      return { 
        answer: result.answer,
        sources: result.sources || [],
        agentName: agent.name, 
        agentEmoji: agent.emoji, 
        agentColor: agent.color 
      };
    } catch (error) {
      console.error("Chat error:", error);
      throw error;
    }
  }

  function getAgents() { return Object.values(AGENTS); }

  return { dispatch, routeQuery, getAgents };
})();
