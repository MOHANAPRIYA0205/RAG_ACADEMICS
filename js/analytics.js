/* analytics.js */
const Analytics=(() => {
  let inited=false;
  const SUB=[
    {name:"Machine Learning",score:85,color:"#6366f1",q:12},
    {name:"Deep Learning",score:72,color:"#a855f7",q:8},
    {name:"NLP & RAG",score:68,color:"#22d3ee",q:6},
    {name:"Computer Vision",score:80,color:"#10b981",q:9},
    {name:"Knowledge Rep.",score:61,color:"#ef4444",q:5},
    {name:"Search & AI",score:77,color:"#f59e0b",q:7},
  ];
  function heatmap(){
    let h='';
    for(let i=0;i<49;i++){
      const op=[0.05,0.2,0.4,0.7,1][Math.floor(Math.random()*5)];
      h+=`<div style="aspect-ratio:1;border-radius:3px;background:rgba(99,102,241,${op});cursor:pointer;transition:transform 0.15s" onmouseover="this.style.transform='scale(1.3)'" onmouseout="this.style.transform='scale(1)'"></div>`;
    }
    return h;
  }
  function render(){
    return `<div class="page">
    <div class="section-header">
      <div><div class="section-title">📊 Performance Analytics</div><div class="section-sub">AI-driven insights into your academic progress</div></div>
      <select class="input-field" style="width:auto;padding:7px 12px;font-size:13px" id="period-select"><option>Last 7 Days</option><option>Last 30 Days</option><option>This Semester</option></select>
    </div>
    <div class="analytics-metrics">
      ${[{l:"Overall Score",v:"76%",s:"↑ 11% this month",i:"🎯",c:"var(--accent)"},{l:"Quizzes Taken",v:"47",s:"↑ 8 this week",i:"🧪",c:"var(--purple)"},{l:"Study Hours",v:"38h",s:"This month",i:"⏰",c:"var(--cyan)"},{l:"Streak",v:"12 days",s:"Keep it up! 🔥",i:"🔥",c:"var(--orange)"}].map(m=>`
      <div class="stat-card"><div><div class="stat-label">${m.l}</div><div class="stat-value">${m.v}</div><div class="stat-sub">${m.s}</div></div><div class="stat-icon" style="background:${m.c}20;font-size:22px">${m.i}</div></div>`).join('')}
    </div>
    <div class="grid-2" style="margin-bottom:24px">
      <div class="chart-card"><div class="chart-title">Weekly Score Trend</div><div class="chart-sub">Quiz scores over last 7 days</div><div style="height:200px"><canvas id="trend-chart"></canvas></div></div>
      <div class="chart-card"><div class="chart-title">Subject Radar</div><div class="chart-sub">Strength across all topics</div><div style="height:200px"><canvas id="radar-chart"></canvas></div></div>
    </div>
    <div class="grid-2" style="margin-bottom:24px">
      <div class="card">
        <div class="section-title" style="font-size:15px;margin-bottom:16px">Subject Performance</div>
        ${SUB.map(s=>`<div class="subject-row"><div class="subject-name">${s.name}</div><div class="subject-bar"><div class="progress-bar"><div class="progress-fill" style="width:${s.score}%;background:linear-gradient(90deg,${s.color},${s.color}88)"></div></div></div><div class="subject-pct" style="color:${s.color}">${s.score}%</div></div>`).join('')}
      </div>
      <div class="chart-card"><div class="chart-title">Quiz Distribution</div><div class="chart-sub">Questions per subject</div><div style="height:220px;margin-top:8px"><canvas id="bar-chart"></canvas></div></div>
    </div>
    <div class="grid-2">
      <div class="card">
        <div class="section-title" style="font-size:15px;margin-bottom:16px">🤖 AI Recommendations</div>
        ${[
          {i:"🔴",t:"Knowledge Representation (61%) is your weakest area. Allocate 3 hrs this week."},
          {i:"🟡",t:"NLP improved 12% — maintain momentum with 2 more quizzes."},
          {i:"🟢",t:"Machine Learning is your strongest. Try hard-level questions!"},
          {i:"📅",t:"You haven't studied Computer Vision in 4 days. Schedule a session."},
          {i:"🎯",t:"Transformer Architecture is a high-probability exam topic based on past papers."},
        ].map(r=>`<div style="display:flex;gap:10px;padding:10px 12px;background:var(--bg-elevated);border-radius:var(--radius-md);border:1px solid var(--border);margin-bottom:8px"><span style="font-size:16px;flex-shrink:0">${r.i}</span><span style="font-size:13px;color:var(--text-secondary)">${r.t}</span></div>`).join('')}
      </div>
      <div class="card">
        <div class="section-title" style="font-size:15px;margin-bottom:12px">📅 Study Heatmap</div>
        <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px">${heatmap()}</div>
        <div style="display:flex;gap:8px;align-items:center;margin-top:10px;font-size:11px;color:var(--text-muted)">
          <span>Less</span>${['0.1','0.3','0.5','0.8','1'].map(o=>`<div style="width:12px;height:12px;border-radius:2px;background:rgba(99,102,241,${o})"></div>`).join('')}<span>More</span>
        </div>
        <div style="margin-top:20px"><div style="font-size:13px;font-weight:700;margin-bottom:10px">Monthly Progress</div><div style="height:110px"><canvas id="progress-chart"></canvas></div></div>
      </div>
    </div></div>`;
  }
  function initCharts(){
    if(inited||typeof Chart==='undefined')return;
    inited=true;
    const dark=document.documentElement.getAttribute('data-theme')!=='light';
    const gc=dark?'rgba(255,255,255,0.05)':'rgba(0,0,0,0.05)';
    Chart.defaults.color=dark?'#94a3b8':'#475569';
    Chart.defaults.font.family="'Inter',sans-serif";
    const t=document.getElementById('trend-chart');
    if(t)new Chart(t,{type:'line',data:{labels:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],datasets:[{label:'Score',data:[65,72,68,79,75,83,78],fill:true,backgroundColor:'rgba(99,102,241,0.1)',borderColor:'#6366f1',borderWidth:2,pointBackgroundColor:'#6366f1',pointRadius:4,tension:0.4}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{min:50,max:100,grid:{color:gc}},x:{grid:{display:false}}}}});
    const r=document.getElementById('radar-chart');
    if(r)new Chart(r,{type:'radar',data:{labels:SUB.map(s=>s.name.split(' ')[0]),datasets:[{data:SUB.map(s=>s.score),backgroundColor:'rgba(99,102,241,0.15)',borderColor:'#6366f1',borderWidth:2,pointBackgroundColor:'#a855f7',pointRadius:4}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{r:{min:0,max:100,ticks:{display:false},grid:{color:gc}}}}});
    const b=document.getElementById('bar-chart');
    if(b)new Chart(b,{type:'bar',data:{labels:SUB.map(s=>s.name.split(' ')[0]),datasets:[{label:'Quizzes',data:SUB.map(s=>s.q),backgroundColor:SUB.map(s=>s.color+'aa'),borderColor:SUB.map(s=>s.color),borderWidth:2,borderRadius:6}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{grid:{color:gc}},x:{grid:{display:false}}}}});
    const p=document.getElementById('progress-chart');
    if(p)new Chart(p,{type:'line',data:{labels:['Jan','Feb','Mar','Apr'],datasets:[{data:[58,65,70,76],fill:true,backgroundColor:'rgba(168,85,247,0.1)',borderColor:'#a855f7',borderWidth:2,tension:0.4,pointRadius:3,pointBackgroundColor:'#a855f7'}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{min:40,max:100,grid:{color:gc}},x:{grid:{display:false}}}}});
  }
  function bindEvents(){
    inited=false;
    setTimeout(initCharts,120);
  }
  return{render,bindEvents};
})();
