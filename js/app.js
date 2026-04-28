/* =====================================================
   app.js — Main SPA Router & State Manager
   ===================================================== */

const App = (() => {
  const PAGES = {
    dashboard: { title: 'Dashboard', module: null },
    chat:      { title: 'AI Chat',   module: Chat },
    upload:    { title: 'Documents', module: Upload },
    quiz:      { title: 'Quiz Engine', module: Quiz },
    analytics: { title: 'Analytics', module: Analytics },
    profile:   { title: 'Profile',   module: Profile },
  };

  let currentPage = 'dashboard';

  // ── Toast ──────────────────────────────────────────
  function showToast(msg, type = 'info') {
    const icons = { success: '✅', error: '❌', info: 'ℹ️' };
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `<span>${icons[type]||'ℹ️'}</span><span>${msg}</span>`;
    document.getElementById('toast-container').appendChild(el);
    setTimeout(() => el.remove(), 4000);
  }

  // ── Navigate ───────────────────────────────────────
  function navigate(page) {
    if (!PAGES[page]) return;
    currentPage = page;

    // Update nav
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById('nav-' + page)?.classList.add('active');

    // Update breadcrumb
    document.getElementById('breadcrumb').textContent = PAGES[page].title;

    renderPage(page);
  }

  function renderPage(page) {
    const container = document.getElementById('page-container');
    const mod = PAGES[page]?.module;

    if (page === 'dashboard') {
      container.innerHTML = renderDashboard();
      bindDashboardEvents();
    } else if (mod) {
      container.innerHTML = mod.render();
      mod.bindEvents();
    }
  }

  // ── Dashboard ──────────────────────────────────────
  function renderDashboard() {
    const agents = AgentSystem.getAgents();
    return `<div class="page">
    <div class="dash-welcome">
      <h1>Good Evening, Mohammed! 👋</h1>
      <p>Your AI academic assistant is ready. You have <strong>2 quizzes</strong> pending and <strong>1 document</strong> being indexed.</p>
      <div class="dash-welcome-actions">
        <div class="quick-action" onclick="App.navigate('chat')">💬 Ask AI Anything</div>
        <div class="quick-action" onclick="App.navigate('quiz')">🧪 Take a Quiz</div>
        <div class="quick-action" onclick="App.navigate('upload')">📤 Upload Document</div>
        <div class="quick-action" onclick="App.navigate('analytics')">📊 View Analytics</div>
      </div>
    </div>

    <div class="agent-cards-row" style="margin-bottom:24px">
      ${agents.map(a=>`
      <div class="agent-card" onclick="App.navigate('chat')" title="${a.desc}">
        <div class="agent-emoji">${a.emoji}</div>
        <div class="agent-name">${a.name}</div>
        <div class="agent-desc">${a.desc}</div>
        <div class="agent-chip" style="margin-top:8px;justify-content:center;font-size:10px"><span class="dot"></span>Active</div>
      </div>`).join('')}
    </div>

    <div class="grid-4" style="margin-bottom:24px">
      ${[
        {l:"Overall Score",v:"76%",s:"↑ 11% this month",i:"🎯",c:"var(--accent)"},
        {l:"Quizzes Taken",v:"47",s:"12 this week",i:"🧪",c:"var(--purple)"},
        {l:"Documents",v:"8",s:"144 chunks indexed",i:"📄",c:"var(--cyan)"},
        {l:"Study Streak",v:"12 days",s:"Keep going! 🔥",i:"🔥",c:"var(--orange)"},
      ].map(s=>`
      <div class="stat-card">
        <div><div class="stat-label">${s.l}</div><div class="stat-value">${s.v}</div><div class="stat-sub">${s.s}</div></div>
        <div class="stat-icon" style="background:${s.c}20;font-size:22px">${s.i}</div>
      </div>`).join('')}
    </div>

    <div class="grid-2" style="margin-bottom:24px">
      <div class="card">
        <div class="section-header">
          <div><div class="section-title">📈 Score Trend</div></div>
          <span class="badge badge-accent">7 Days</span>
        </div>
        <div style="height:160px;margin-top:12px"><canvas id="dash-chart"></canvas></div>
      </div>
      <div class="card">
        <div class="section-header">
          <div class="section-title">⚡ Recent Activity</div>
          <span class="see-all" onclick="App.navigate('profile')">See all</span>
        </div>
        <div class="activity-feed">
          ${[
            {dot:'ai',text:'<strong>AI Chat:</strong> Transformer architecture explained',time:'2 hours ago'},
            {dot:'quiz',text:'<strong>Quiz Complete:</strong> ML Quiz — 90% score',time:'4 hours ago'},
            {dot:'doc',text:'<strong>Doc Indexed:</strong> Neural_Networks_Notes.pdf → 35 chunks',time:'Yesterday'},
            {dot:'schedule',text:'<strong>Study Plan:</strong> Deep Learning session scheduled',time:'2 days ago'},
          ].map(a=>`
          <div class="activity-item">
            <div class="activity-dot ${a.dot}"></div>
            <div><div class="activity-text">${a.text}</div><div class="activity-time">${a.time}</div></div>
          </div>`).join('')}
        </div>
      </div>
    </div>

    <div class="grid-2">
      <div class="card">
        <div class="section-header">
          <div class="section-title">📚 Subject Progress</div>
          <span class="see-all" onclick="App.navigate('analytics')">Full Report</span>
        </div>
        ${[
          {n:"Machine Learning",p:85,c:"#6366f1"},
          {n:"Deep Learning",p:72,c:"#a855f7"},
          {n:"NLP & RAG",p:68,c:"#22d3ee"},
          {n:"Computer Vision",p:80,c:"#10b981"},
          {n:"Knowledge Rep.",p:61,c:"#ef4444"},
        ].map(s=>`
        <div class="subject-row">
          <div class="subject-name" style="font-size:13px">${s.n}</div>
          <div class="subject-bar"><div class="progress-bar"><div class="progress-fill" style="width:${s.p}%;background:linear-gradient(90deg,${s.c},${s.c}88)"></div></div></div>
          <div class="subject-pct" style="color:${s.c}">${s.p}%</div>
        </div>`).join('')}
      </div>

      <div class="card">
        <div class="section-header">
          <div class="section-title">🤖 AI Suggestions</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:10px;margin-top:4px">
          ${[
            {i:"⚠️",t:"Revise Unit 2 — Knowledge Representation (weak area)",btn:"Study Now",page:"chat"},
            {i:"🧪",t:"You haven't taken a Deep Learning quiz in 3 days",btn:"Take Quiz",page:"quiz"},
            {i:"📅",t:"Exam in 12 days — start intensive revision today",btn:"Study Plan",page:"chat"},
            {i:"📄",t:"Upload your latest lab notes to improve RAG accuracy",btn:"Upload",page:"upload"},
          ].map(s=>`
          <div style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:var(--bg-elevated);border-radius:var(--radius-md);border:1px solid var(--border)">
            <span style="font-size:18px;flex-shrink:0">${s.i}</span>
            <span style="font-size:13px;color:var(--text-secondary);flex:1">${s.t}</span>
            <button class="btn btn-ghost btn-sm" onclick="App.navigate('${s.page}')" style="flex-shrink:0;font-size:11px">${s.btn}</button>
          </div>`).join('')}
        </div>
      </div>
    </div>
    </div>`;
  }

  function bindDashboardEvents() {
    setTimeout(() => {
      const ctx = document.getElementById('dash-chart');
      if (ctx && typeof Chart !== 'undefined') {
        const dark = document.documentElement.getAttribute('data-theme') !== 'light';
        new Chart(ctx, {
          type: 'line',
          data: {
            labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
            datasets: [{
              data: [65,72,68,79,75,83,78],
              fill: true,
              backgroundColor: 'rgba(99,102,241,0.12)',
              borderColor: '#6366f1', borderWidth: 2,
              pointBackgroundColor: '#a855f7', pointRadius: 4, tension: 0.4
            }]
          },
          options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              y: { min:50,max:100, grid:{ color: dark?'rgba(255,255,255,0.05)':'rgba(0,0,0,0.05)' } },
              x: { grid:{ display:false } }
            }
          }
        });
      }
    }, 120);
  }

  // ── Theme ──────────────────────────────────────────
  function toggleTheme() {
    const html = document.documentElement;
    const isDark = html.getAttribute('data-theme') === 'dark';
    html.setAttribute('data-theme', isDark ? 'light' : 'dark');
    document.querySelector('.dark-icon').style.display = isDark ? 'none' : '';
    document.querySelector('.light-icon').style.display = isDark ? '' : 'none';
    document.querySelector('.theme-label').textContent = isDark ? 'Light Mode' : 'Dark Mode';
    localStorage.setItem('theme', isDark ? 'light' : 'dark');
    Analytics.bindEvents && setTimeout(() => Analytics.bindEvents(), 100);
  }

  // ── Sidebar ────────────────────────────────────────
  function toggleSidebar() {
    const sb = document.getElementById('sidebar');
    const mc = document.getElementById('main-content');
    sb.classList.toggle('collapsed');
    mc.classList.toggle('expanded');
  }

  // ── Init ───────────────────────────────────────────
  function init() {
    // Restore theme
    const saved = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
    if (saved === 'light') {
      document.querySelector('.dark-icon').style.display = 'none';
      document.querySelector('.light-icon').style.display = '';
      document.querySelector('.theme-label').textContent = 'Light Mode';
    }

    // Nav clicks
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', e => {
        e.preventDefault();
        navigate(item.dataset.page);
        // close mobile sidebar
        document.getElementById('sidebar').classList.remove('mobile-open');
      });
    });

    // Sidebar toggles
    document.getElementById('sidebar-toggle')?.addEventListener('click', toggleSidebar);
    document.getElementById('mobile-menu-btn')?.addEventListener('click', () => {
      document.getElementById('sidebar').classList.toggle('mobile-open');
    });

    // Theme toggle
    document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);

    // Notifications
    document.getElementById('notif-btn')?.addEventListener('click', () => {
      document.getElementById('notif-dropdown').classList.toggle('open');
    });
    document.addEventListener('click', e => {
      if (!e.target.closest('.notification-btn-wrap')) {
        document.getElementById('notif-dropdown')?.classList.remove('open');
      }
    });

    // Topbar voice btn
    document.getElementById('voice-btn')?.addEventListener('click', () => {
      navigate('chat');
      setTimeout(() => document.getElementById('voice-input-btn')?.click(), 500);
    });

    // Global search
    document.getElementById('global-search')?.addEventListener('keydown', e => {
      if (e.key === 'Enter' && e.target.value.trim()) {
        navigate('chat');
        setTimeout(() => {
          const input = document.getElementById('chat-input');
          if (input) { input.value = e.target.value; input.focus(); }
          e.target.value = '';
        }, 400);
      }
    });

    // Modal close
    document.getElementById('modal-close')?.addEventListener('click', closeModal);
    document.getElementById('modal-overlay')?.addEventListener('click', e => {
      if (e.target === document.getElementById('modal-overlay')) closeModal();
    });

    // Render first page
    navigate('dashboard');

    // Hide loader & show app
    setTimeout(() => {
      document.getElementById('loading-screen').style.opacity = '0';
      document.getElementById('loading-screen').style.transition = 'opacity 0.5s ease';
      setTimeout(() => {
        document.getElementById('loading-screen').style.display = 'none';
        document.getElementById('app').style.display = 'flex';
        document.getElementById('app').style.animation = 'pageIn 0.4s ease';
      }, 500);
    }, 2400);
  }

  function closeModal() {
    document.getElementById('modal-overlay').style.display = 'none';
  }

  function openModal(html) {
    document.getElementById('modal-content').innerHTML = html;
    document.getElementById('modal-overlay').style.display = 'flex';
  }

  // Start
  window.addEventListener('DOMContentLoaded', init);

  return { navigate, renderPage, showToast, openModal, closeModal, toggleTheme };
})();
