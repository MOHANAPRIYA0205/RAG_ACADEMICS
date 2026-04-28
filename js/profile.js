/* profile.js */
const Profile=(() => {
  const user={name:"Mohammed Khan",initials:"MK",role:"B.Tech AI — Semester 5",streak:12,totalXP:3480,level:8,quizzesTaken:47,avgScore:76,docsUploaded:8};
  const ACH=[
    {icon:"🏆",name:"Quiz Master",desc:"Complete 10 quizzes",unlocked:true},
    {icon:"🔥",name:"On Fire",desc:"7-day streak",unlocked:true},
    {icon:"📚",name:"Bookworm",desc:"Upload 5 docs",unlocked:true},
    {icon:"🧠",name:"Deep Thinker",desc:"Score 90%+",unlocked:true},
    {icon:"⚡",name:"Speed Learner",desc:"Finish in <5 min",unlocked:false},
    {icon:"🎯",name:"Perfect Score",desc:"Score 100%",unlocked:false},
    {icon:"🌟",name:"All-Rounder",desc:"All 6 subjects",unlocked:false},
    {icon:"🏅",name:"Top 10%",desc:"Rank top 10%",unlocked:false},
  ];
  const LB=[
    {name:"Priya Sharma",initials:"PS",score:4920,color:"#6366f1",rank:1},
    {name:"Arjun Mehta",initials:"AM",score:4310,color:"#a855f7",rank:2},
    {name:"Mohammed Khan",initials:"MK",score:3480,color:"#22d3ee",rank:3,isYou:true},
    {name:"Sneha Patel",initials:"SP",score:3210,color:"#10b981",rank:4},
    {name:"Rahul Das",initials:"RD",score:2980,color:"#f59e0b",rank:5},
  ];
  function render(){
    const xpPct=(user.totalXP/4000)*100;
    return `<div class="page">
    <div class="profile-header">
      <div class="profile-avatar">${user.initials}</div>
      <div style="flex:1">
        <div class="profile-name">${user.name}</div>
        <div class="profile-role">${user.role}</div>
        <div class="profile-badges">
          <div class="achievement-badge">🔥 ${user.streak}-day streak</div>
          <div class="achievement-badge">⚡ Level ${user.level}</div>
          <div class="achievement-badge">🎓 AI Department</div>
        </div>
      </div>
      <div style="text-align:right">
        <div style="font-size:12px;color:rgba(255,255,255,0.6);margin-bottom:6px">XP to Level ${user.level+1}</div>
        <div style="font-size:20px;font-weight:800;margin-bottom:8px">${user.totalXP.toLocaleString()} XP</div>
        <div class="progress-bar" style="width:160px;margin-left:auto;margin-bottom:6px"><div class="progress-fill" style="width:${xpPct}%"></div></div>
        <div style="font-size:11px;color:rgba(255,255,255,0.5)">${4000-user.totalXP} XP to next level</div>
      </div>
    </div>
    <div class="grid-4" style="margin-bottom:24px">
      ${[{l:"Quizzes Taken",v:user.quizzesTaken,i:"🧪",c:"var(--accent)"},{l:"Avg Score",v:user.avgScore+"%",i:"🎯",c:"var(--purple)"},{l:"Docs Uploaded",v:user.docsUploaded,i:"📄",c:"var(--cyan)"},{l:"Streak",v:user.streak+" days",i:"🔥",c:"var(--orange)"}].map(s=>`
      <div class="stat-card"><div><div class="stat-label">${s.l}</div><div class="stat-value" style="font-size:22px">${s.v}</div></div><div class="stat-icon" style="background:${s.c}20;font-size:20px">${s.i}</div></div>`).join('')}
    </div>
    <div class="grid-2" style="margin-bottom:24px">
      <div class="card">
        <div class="section-header" style="margin-bottom:16px"><div class="section-title" style="font-size:15px">🏆 Achievements</div><span class="badge badge-accent">${ACH.filter(a=>a.unlocked).length}/${ACH.length} Unlocked</span></div>
        <div class="achievements-grid">
          ${ACH.map(a=>`<div class="achievement-card ${a.unlocked?'unlocked':'locked'}"><div class="achievement-icon">${a.icon}</div><div class="achievement-name">${a.name}</div><div class="achievement-desc">${a.desc}</div></div>`).join('')}
        </div>
      </div>
      <div class="card">
        <div class="section-header" style="margin-bottom:16px"><div class="section-title" style="font-size:15px">🥇 Leaderboard</div><span class="badge badge-orange">This Month</span></div>
        ${LB.map(lb=>`
        <div class="leaderboard-item" style="${lb.isYou?'background:rgba(99,102,241,0.08);border-radius:var(--radius-md);padding:10px 8px;':''}">
          <div class="rank ${lb.rank===1?'gold':lb.rank===2?'silver':lb.rank===3?'bronze':''}">${lb.rank===1?'🥇':lb.rank===2?'🥈':lb.rank===3?'🥉':lb.rank}</div>
          <div class="lb-avatar" style="background:${lb.color}">${lb.initials}</div>
          <div class="lb-name">${lb.name}${lb.isYou?' <span style="font-size:11px;color:var(--accent-light)">(You)</span>':''}</div>
          <div class="lb-score">${lb.score.toLocaleString()} XP</div>
        </div>`).join('')}
        <div style="margin-top:16px;padding:12px;background:var(--bg-elevated);border-radius:var(--radius-md);text-align:center;font-size:13px;color:var(--text-secondary)">
          You need <strong style="color:var(--accent-light)">830 XP</strong> to reach 2nd place!
        </div>
      </div>
    </div>
    <div class="card">
      <div class="section-title" style="font-size:15px;margin-bottom:16px">📋 Recent Activity</div>
      ${[
        {i:"🧪",t:"Completed ML Quiz — Score: 90%",time:"Today, 4:30 PM"},
        {i:"💬",t:"AI Chat — Transformer architecture (12 messages)",time:"Today, 2:15 PM"},
        {i:"📄",t:"Uploaded Previous_Year_Papers.pdf — 67 chunks indexed",time:"Today, 11:00 AM"},
        {i:"🧪",t:"Completed Deep Learning Quiz — Score: 75%",time:"Yesterday, 6:00 PM"},
        {i:"📋",t:"Summarized Neural Networks Notes",time:"Yesterday, 3:00 PM"},
      ].map(a=>`<div class="activity-item"><div class="activity-dot ai"></div><div><div class="activity-text"><span style="font-size:16px;margin-right:6px">${a.i}</span>${a.t}</div><div class="activity-time">${a.time}</div></div><span class="badge badge-accent" style="margin-left:auto;flex-shrink:0">+50 XP</span></div>`).join('')}
    </div></div>`;
  }
  function bindEvents(){}
  return{render,bindEvents};
})();
