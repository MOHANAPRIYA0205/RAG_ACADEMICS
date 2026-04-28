/* =====================================================
   chat.js — AI Chat Interface
   ===================================================== */

const Chat = (() => {
  let sessions = [
    { id: "c1", title: "Backpropagation Explained", time: "2h ago", active: true },
    { id: "c2", title: "Transformer Architecture", time: "Yesterday", active: false },
    { id: "c3", title: "Study Plan for Exams", time: "2 days ago", active: false },
    { id: "c4", title: "Python ML Implementation", time: "3 days ago", active: false },
  ];

  let messages = [
    {
      role: "ai", time: "10:30 AM", agent: "Academic Agent", agentColor: "#6366f1",
      text: "Hello! I'm your **AcademicAI** assistant powered by a RAG pipeline. I can help you with:\n\n• 📚 Syllabus and notes-based questions\n• 🧪 Quiz generation and practice\n• 📅 Study schedule planning\n• 💻 Coding and lab exercises\n• 📊 Performance analytics\n\nWhat would you like to explore today?",
      sources: []
    }
  ];

  let selectedAgent = null; // null = auto-route
  let isProcessing = false;
  let voiceRecognition = null;

  function render() {
    return `
    <div class="page chat-page">
      <div class="chat-layout">
        <!-- Left: Session History -->
        <div class="chat-sidebar">
          <div class="chat-sidebar-header">
            <h3>Chat History</h3>
            <button class="btn btn-primary btn-sm" id="new-chat-btn" style="width:100%">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              New Chat
            </button>
          </div>
          <div class="chat-history-list" id="chat-history-list">
            ${sessions.map(s => `
              <div class="chat-history-item ${s.active ? 'active' : ''}" data-id="${s.id}">
                <div class="chat-history-title">${s.title}</div>
                <div class="chat-history-meta">${s.time}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Center: Messages -->
        <div class="chat-main">
          <div class="chat-header">
            <div class="chat-agent-selector">
              <span style="font-size:12px;color:var(--text-muted);margin-right:4px;font-weight:600;">Agent:</span>
              <button class="agent-btn ${!selectedAgent ? 'active' : ''}" data-agent="">🔀 Auto</button>
              ${AgentSystem.getAgents().map(a => `
                <button class="agent-btn ${selectedAgent === a.id ? 'active' : ''}" data-agent="${a.id}">${a.emoji} ${a.name.replace(' Agent','')}</button>
              `).join('')}
            </div>
            <div style="display:flex;gap:8px;">
              <button class="btn btn-secondary btn-sm" id="clear-chat-btn">Clear</button>
              <button class="btn btn-secondary btn-sm" id="export-chat-btn">Export</button>
            </div>
          </div>

          <div class="chat-messages" id="chat-messages">
            ${renderMessages()}
          </div>

          <div class="chat-input-wrap">
            <div class="chat-tools">
              <button class="chat-tool-btn" id="attach-doc-btn" title="Attach Document">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg>
                Attach
              </button>
              <button class="chat-tool-btn" id="voice-input-btn" title="Voice Input">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/></svg>
                Voice
              </button>
              <button class="chat-tool-btn" id="summarize-btn" title="Summarize Last Doc">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                Summarize
              </button>
              <button class="chat-tool-btn" id="important-q-btn" title="Predict Important Questions">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                Predict Qs
              </button>
            </div>
            <div class="chat-input-row">
              <textarea class="chat-textarea" id="chat-input" placeholder="Ask about syllabus, notes, quiz, code..." rows="1"></textarea>
              <button class="chat-send-btn" id="chat-send-btn" title="Send">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              </button>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <span style="font-size:11px;color:var(--text-muted);">Press Enter to send · Shift+Enter for new line</span>
              <span class="agent-chip" id="active-agent-chip">
                <span class="dot"></span>
                RAG Pipeline Active
              </span>
            </div>
          </div>
        </div>

        <!-- Right: Source Panel -->
        <div class="source-panel" id="source-panel">
          <div class="source-panel-header">📎 Retrieved Sources</div>
          <div class="source-panel-body" id="source-panel-body">
            <div class="empty-state" style="padding:30px 16px;">
              <div class="empty-icon">🔍</div>
              <p style="font-size:12px;">Sources will appear here after your first query.</p>
            </div>
          </div>
        </div>
      </div>
    </div>`;
  }

  function renderMessages() {
    return messages.map(msg => renderMessage(msg)).join('');
  }

  function renderMessage(msg) {
    const isUser = msg.role === 'user';
    const formatted = typeof marked !== 'undefined'
      ? marked.parse(msg.text || '')
      : (msg.text || '').replace(/\n/g, '<br>');
    const getSourceTitle = (s) => s.title || s.docTitle || 'Document';
    const sourcesHtml = msg.sources && msg.sources.length
      ? `<div class="msg-source">${msg.sources.map(s => `<span class="source-chip">📄 ${getSourceTitle(s)}</span>`).join('')}</div>`
      : '';
    return `
    <div class="msg ${isUser ? 'user' : 'ai'}">
      <div class="msg-avatar">${isUser ? 'MK' : '🤖'}</div>
      <div>
        ${!isUser ? `<div style="font-size:11px;color:var(--text-muted);margin-bottom:4px;font-weight:600;">${msg.agent || 'AcademicAI'}</div>` : ''}
        <div class="msg-bubble">${formatted}</div>
        ${sourcesHtml}
        <div class="msg-meta">${msg.time || ''}</div>
      </div>
    </div>`;
  }

  function addTypingIndicator() {
    const el = document.createElement('div');
    el.className = 'msg ai';
    el.id = 'typing-msg';
    el.innerHTML = `
      <div class="msg-avatar">🤖</div>
      <div class="msg-bubble" style="padding:8px 14px;">
        <div class="typing-indicator">
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
        </div>
      </div>`;
    document.getElementById('chat-messages').appendChild(el);
    el.scrollIntoView({ behavior: 'smooth' });
  }

  function removeTypingIndicator() {
    const el = document.getElementById('typing-msg');
    if (el) el.remove();
  }

  async function sendMessage(text) {
    if (!text.trim() || isProcessing) return;
    isProcessing = true;

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    messages.push({ role: 'user', text, time: now });
    const msgEl = document.getElementById('chat-messages');
    msgEl.insertAdjacentHTML('beforeend', renderMessage({ role: 'user', text, time: now }));
    document.getElementById('chat-input').value = '';
    autoResize(document.getElementById('chat-input'));

    addTypingIndicator();

    try {
      const result = await AgentSystem.dispatch(text, selectedAgent);
      removeTypingIndicator();

      const aiMsg = {
        role: 'ai',
        text: result.answer,
        sources: result.sources || [],
        agent: `${result.agentEmoji} ${result.agentName}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      messages.push(aiMsg);
      msgEl.insertAdjacentHTML('beforeend', renderMessage(aiMsg));
      msgEl.lastElementChild.scrollIntoView({ behavior: 'smooth' });

      // Update source panel — backend returns {title, page, excerpt}, simulated returns {docTitle, text, score}
      if (result.sources && result.sources.length) {
        document.getElementById('source-panel-body').innerHTML = result.sources.map(s => {
          const title = s.title || s.docTitle || 'Document';
          const excerpt = s.excerpt || (s.text ? s.text.substring(0, 120) + '...' : 'No excerpt available');
          const page = s.page || 1;
          const rel = s.score != null ? Math.round(s.score * 33) + '%' : 'High';
          return `
          <div class="source-doc">
            <div class="source-doc-title">📄 ${title}</div>
            <div style="font-size:12px;color:var(--text-secondary);margin-top:4px;line-height:1.5;">${excerpt}</div>
            <div style="margin-top:6px;font-size:10px;color:var(--text-muted);">Page ${page} · Relevance: ${rel}</div>
          </div>`;
        }).join('');
      } else {
        document.getElementById('source-panel-body').innerHTML = `
          <div class="empty-state" style="padding:30px 16px;">
            <div class="empty-icon">💡</div>
            <p style="font-size:12px;">No document sources retrieved. Upload documents to enable RAG-powered answers.</p>
          </div>`;
      }

      // Update active agent chip
      document.getElementById('active-agent-chip').innerHTML = `<span class="dot"></span>${result.agentEmoji} ${result.agentName}`;

    } catch(e) {
      removeTypingIndicator();
      App.showToast('AI response failed. Please try again.', 'error');
    }
    isProcessing = false;
  }

  function autoResize(el) {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 140) + 'px';
  }

  function initVoice() {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      App.showToast('Voice input not supported in this browser', 'error'); return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    voiceRecognition = new SR();
    voiceRecognition.continuous = false;
    voiceRecognition.interimResults = false;
    voiceRecognition.onstart = () => { App.showToast('🎤 Listening...', 'info'); };
    voiceRecognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      document.getElementById('chat-input').value = transcript;
      sendMessage(transcript);
    };
    voiceRecognition.onerror = () => App.showToast('Voice recognition error', 'error');
    voiceRecognition.start();
  }

  function bindEvents() {
    const input = document.getElementById('chat-input');
    const sendBtn = document.getElementById('chat-send-btn');
    if (!input) return;

    input.addEventListener('input', () => autoResize(input));
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input.value); }
    });
    sendBtn.addEventListener('click', () => sendMessage(input.value));

    // Agent selector
    document.querySelectorAll('.agent-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.agent-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedAgent = btn.dataset.agent || null;
      });
    });

    // Tool buttons
    document.getElementById('voice-input-btn')?.addEventListener('click', initVoice);
    document.getElementById('new-chat-btn')?.addEventListener('click', () => {
      messages = [messages[0]]; // keep greeting
      document.getElementById('chat-messages').innerHTML = renderMessages();
      App.showToast('New chat started', 'info');
    });
    document.getElementById('clear-chat-btn')?.addEventListener('click', () => {
      messages = [messages[0]];
      document.getElementById('chat-messages').innerHTML = renderMessages();
    });
    document.getElementById('summarize-btn')?.addEventListener('click', () => {
      sendMessage("Summarize the uploaded AI syllabus document in detail with all key topics.");
    });
    document.getElementById('important-q-btn')?.addEventListener('click', () => {
      sendMessage("Predict the most important questions likely to appear in the upcoming AI exam based on previous year papers.");
    });
  }

  return { render, bindEvents };
})();
