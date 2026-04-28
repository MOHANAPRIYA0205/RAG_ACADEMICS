/* =====================================================
   quiz.js — AI Quiz Engine
   ===================================================== */

const Quiz = (() => {
  let QUESTION_BANK = [];

  let state = {
    phase: "setup", // setup | active | result
    topic: "All Units",
    difficulty: "mixed",
    numQuestions: 5,
    qType: "mcq",
    questions: [],
    current: 0,
    selected: null,
    answered: false,
    score: 0,
    correct: 0,
    wrong: 0,
    timeLeft: 0,
    timer: null,
    answers: []
  };

  function render() {
    if (state.phase === "setup") return renderSetup();
    if (state.phase === "active") return renderQuestion();
    if (state.phase === "result") return renderResult();
  }

  function renderSetup() {
    return `
    <div class="page">
      <div class="section-header"><div><div class="section-title">🧪 AI Quiz Engine</div><div class="section-sub">Generate adaptive quizzes powered by AI from your study materials</div></div></div>
      <div class="quiz-setup">
        <div class="card" style="margin-bottom:20px;">
          <div style="font-size:14px;font-weight:700;margin-bottom:16px;">Select Topic</div>
          <div class="quiz-options-grid">
            ${["All Units","Machine Learning","Deep Learning","NLP & RAG","Computer Vision"].map(t => `
              <div class="quiz-option-card ${state.topic===t?'selected':''}" data-topic="${t}">
                <div class="opt-icon">${{All:"📚",Machine:"🤖",Deep:"🧠",NLP:"💬",Computer:"👁️"}[t.split(' ')[0]]||'📚'}</div>
                <div class="opt-label">${t}</div>
              </div>`).join('')}
          </div>
        </div>
        <div class="card" style="margin-bottom:20px;">
          <div style="font-size:14px;font-weight:700;margin-bottom:16px;">Difficulty</div>
          <div style="display:flex;gap:10px;">
            ${["easy","medium","hard","mixed"].map(d => `
              <div class="quiz-option-card ${state.difficulty===d?'selected':''}" data-diff="${d}" style="flex:1;padding:10px;">
                <div class="opt-icon">${{easy:"🟢",medium:"🟡",hard:"🔴",mixed:"🎲"}[d]}</div>
                <div class="opt-label" style="text-transform:capitalize;">${d}</div>
              </div>`).join('')}
          </div>
        </div>
        <div class="card" style="margin-bottom:20px;">
          <div style="font-size:14px;font-weight:700;margin-bottom:16px;">Quiz Settings</div>
          <div class="grid-2" style="gap:16px;">
            <div class="input-group">
              <label class="input-label">Number of Questions</label>
              <select class="input-field" id="num-q-select">
                <option ${state.numQuestions===5?'selected':''} value="5">5 Questions</option>
                <option ${state.numQuestions===8?'selected':''} value="8">8 Questions</option>
                <option ${state.numQuestions===10?'selected':''} value="10">10 Questions</option>
              </select>
            </div>
            <div class="input-group">
              <label class="input-label">Question Type</label>
              <select class="input-field" id="q-type-select">
                <option value="mcq">Multiple Choice (MCQ)</option>
                <option value="short">Short Answer</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>
          </div>
        </div>
        <button class="btn btn-primary" id="start-quiz-btn" style="width:100%;justify-content:center;padding:14px;">
          🚀 Generate AI Quiz
        </button>
      </div>
    </div>`;
  }

  function renderQuestion() {
    const q = state.questions[state.current];
    const progress = ((state.current) / state.questions.length) * 100;
    const mins = Math.floor(state.timeLeft / 60);
    const secs = String(state.timeLeft % 60).padStart(2, '0');
    return `
    <div class="page">
      <div class="quiz-container">
        <div class="quiz-header">
          <div>
            <span class="badge badge-accent">Question ${state.current + 1} / ${state.questions.length}</span>
            <span class="badge badge-${q.difficulty==='easy'?'green':q.difficulty==='hard'?'red':'orange'}" style="margin-left:6px;">${q.difficulty}</span>
            <span class="badge badge-purple" style="margin-left:6px;">${q.unit}</span>
          </div>
          <div class="quiz-timer">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            ${mins}:${secs}
          </div>
        </div>
        <div class="progress-bar" style="margin-bottom:24px;">
          <div class="progress-fill" style="width:${progress}%"></div>
        </div>
        <div class="question-card">
          <div class="question-num">Question ${state.current + 1}</div>
          <div class="question-text">${q.question}</div>
          <div class="option-list">
            ${q.options.map((opt, i) => {
              let cls = '';
              if (state.answered) {
                if (i === q.correct) cls = 'correct';
                else if (i === state.selected) cls = 'wrong';
              } else if (i === state.selected) cls = 'selected';
              return `
              <div class="option-item ${cls}" data-idx="${i}" ${state.answered ? 'style="cursor:default;"' : ''}>
                <div class="option-letter">${String.fromCharCode(65+i)}</div>
                ${opt}
              </div>`;
            }).join('')}
          </div>
          ${state.answered ? `
          <div style="margin-top:20px;padding:14px;background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.2);border-radius:var(--radius-md);">
            <div style="font-size:12px;font-weight:700;color:var(--green);margin-bottom:6px;">💡 Explanation</div>
            <div style="font-size:13px;color:var(--text-secondary);">${q.explanation}</div>
          </div>` : ''}
        </div>
        <div class="quiz-nav">
          <button class="btn btn-secondary" id="skip-btn">Skip</button>
          <div style="display:flex;gap:8px;align-items:center;">
            <span style="font-size:13px;color:var(--green);font-weight:600;">✓ ${state.correct}</span>
            <span style="font-size:13px;color:var(--red);font-weight:600;">✗ ${state.wrong}</span>
            <button class="btn btn-primary" id="next-btn" ${!state.answered?'disabled style="opacity:0.4;"':''}>
              ${state.current === state.questions.length - 1 ? 'Finish Quiz →' : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    </div>`;
  }

  function renderResult() {
    const pct = Math.round((state.correct / state.questions.length) * 100);
    const grade = pct >= 90 ? "Excellent! 🏆" : pct >= 70 ? "Good Job! 👏" : pct >= 50 ? "Keep Practicing 📚" : "Needs Improvement ⚠️";
    return `
    <div class="page">
      <div class="quiz-container">
        <div class="quiz-result">
          <div style="font-size:14px;color:var(--text-muted);margin-bottom:8px;">Quiz Complete!</div>
          <div class="result-score">${pct}%</div>
          <div class="result-label">${grade}</div>
          <div class="result-sub">${state.correct} correct out of ${state.questions.length} questions</div>
          <div class="result-breakdown">
            <div class="breakdown-item">
              <div class="breakdown-val" style="color:var(--green);">${state.correct}</div>
              <div class="breakdown-label">Correct</div>
            </div>
            <div class="breakdown-item">
              <div class="breakdown-val" style="color:var(--red);">${state.wrong}</div>
              <div class="breakdown-label">Wrong</div>
            </div>
            <div class="breakdown-item">
              <div class="breakdown-val" style="color:var(--orange);">${state.questions.length - state.correct - state.wrong}</div>
              <div class="breakdown-label">Skipped</div>
            </div>
          </div>
          <div style="margin-bottom:24px;">
            <div style="font-size:13px;font-weight:700;margin-bottom:10px;">AI Recommendation:</div>
            <div style="font-size:13px;color:var(--text-secondary);background:var(--bg-elevated);padding:14px;border-radius:var(--radius-md);border:1px solid var(--border);">
              ${pct >= 70 ? "Great performance! You're well-prepared. Focus on reviewing any wrong answers and attempt harder questions next time." : "Review the explanations for incorrect answers. Spend extra time on weak topics before retaking the quiz."}
            </div>
          </div>
          <div style="display:flex;gap:12px;justify-content:center;">
            <button class="btn btn-secondary" id="retake-btn">🔄 Retake Quiz</button>
            <button class="btn btn-primary" id="new-quiz-btn">✨ New Quiz</button>
          </div>
        </div>
      </div>
    </div>`;
  }

  async function startQuiz() {
    App.showToast('Generating AI Quiz...', 'info');
    document.getElementById('start-quiz-btn').disabled = true;
    document.getElementById('start-quiz-btn').innerHTML = `<span class="spinner"></span> Generating...`;
    
    try {
      const response = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: state.topic,
          n: state.numQuestions,
          difficulty: state.difficulty
        })
      });
      
      if (!response.ok) throw new Error('Failed to generate quiz');
      
      const data = await response.json();
      
      if (data.questions && data.questions.length > 0) {
        state.questions = data.questions;
        // ensure each question has a difficulty and unit for UI mapping
        state.questions.forEach((q, i) => {
          q.id = i + 1;
          q.unit = state.topic;
          q.difficulty = state.difficulty === 'mixed' ? 'medium' : state.difficulty;
        });
        
        state.current = 0; state.score = 0; state.correct = 0;
        state.wrong = 0; state.selected = null; state.answered = false;
        state.answers = []; state.phase = "active";
        state.timeLeft = state.questions.length * 60;
        App.renderPage('quiz');
        startTimer();
      } else {
        throw new Error('No questions generated');
      }
    } catch (e) {
      console.error(e);
      App.showToast('Failed to generate quiz. Try again or upload more docs.', 'error');
      document.getElementById('start-quiz-btn').disabled = false;
      document.getElementById('start-quiz-btn').innerHTML = `🚀 Generate AI Quiz`;
    }
  }

  function startTimer() {
    if (state.timer) clearInterval(state.timer);
    state.timer = setInterval(() => {
      state.timeLeft--;
      const el = document.querySelector('.quiz-timer');
      if (el) {
        const m = Math.floor(state.timeLeft / 60);
        const s = String(state.timeLeft % 60).padStart(2,'0');
        el.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>${m}:${s}`;
        if (state.timeLeft <= 30) el.style.color = 'var(--red)';
      }
      if (state.timeLeft <= 0) { clearInterval(state.timer); endQuiz(); }
    }, 1000);
  }

  function selectOption(idx) {
    if (state.answered) return;
    state.selected = idx;
    state.answered = true;
    const q = state.questions[state.current];
    if (idx === q.correct) state.correct++;
    else state.wrong++;
    state.answers.push({ q: q.id, selected: idx, correct: q.correct });
    App.renderPage('quiz');
    startTimer(); // re-bind without reset
  }

  function nextQuestion() {
    if (state.current >= state.questions.length - 1) { endQuiz(); return; }
    state.current++;
    state.selected = null;
    state.answered = false;
    App.renderPage('quiz');
  }

  async function endQuiz() {
    if (state.timer) clearInterval(state.timer);
    
    try {
      const response = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: state.answers })
      });
      
      if (response.ok) {
        const result = await response.json();
        // Trust backend score (or use local if preferred)
        state.correct = result.score || state.correct;
      }
    } catch (e) {
      console.error('Failed to submit quiz results', e);
    }
    
    state.phase = "result";
    App.renderPage('quiz');
    App.showToast(`Quiz complete! Score: ${Math.round((state.correct/state.questions.length)*100)}%`, 'success');
  }

  function bindEvents() {
    if (state.phase === "setup") {
      document.querySelectorAll('[data-topic]').forEach(el => {
        el.addEventListener('click', () => { state.topic = el.dataset.topic; App.renderPage('quiz'); });
      });
      document.querySelectorAll('[data-diff]').forEach(el => {
        el.addEventListener('click', () => { state.difficulty = el.dataset.diff; App.renderPage('quiz'); });
      });
      document.getElementById('num-q-select')?.addEventListener('change', e => { state.numQuestions = +e.target.value; });
      document.getElementById('start-quiz-btn')?.addEventListener('click', startQuiz);
    }
    if (state.phase === "active") {
      document.querySelectorAll('.option-item').forEach(el => {
        el.addEventListener('click', () => { if (!state.answered) selectOption(+el.dataset.idx); });
      });
      document.getElementById('next-btn')?.addEventListener('click', nextQuestion);
      document.getElementById('skip-btn')?.addEventListener('click', nextQuestion);
    }
    if (state.phase === "result") {
      document.getElementById('retake-btn')?.addEventListener('click', () => {
        state.phase = 'setup';
        App.renderPage('quiz');
        // Trigger quiz generation after re-render
        setTimeout(() => document.getElementById('start-quiz-btn')?.click(), 100);
      });
      document.getElementById('new-quiz-btn')?.addEventListener('click', () => { state.phase = 'setup'; App.renderPage('quiz'); });
    }
  }

  return { render, bindEvents, startQuiz };
})();
