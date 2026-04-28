/* =====================================================
   upload.js — Document Upload & Management
   ===================================================== */

const Upload = (() => {
  let docs = [];

  function render() {
    return `
    <div class="page">
      <div class="section-header">
        <div>
          <div class="section-title">📂 Document Management</div>
          <div class="section-sub">Upload PDFs, DOCX, TXT files to power your RAG knowledge base</div>
        </div>
        <button class="btn btn-primary btn-sm" id="upload-btn-top">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
          Upload Files
        </button>
      </div>

      <!-- RAG Pipeline Status -->
      <div class="card" style="margin-bottom:24px;background:linear-gradient(135deg,rgba(30,33,64,0.8),rgba(45,31,94,0.5));">
        <div style="display:flex;align-items:center;gap:20px;flex-wrap:wrap;">
          <div style="flex:1;min-width:200px;">
            <div style="font-size:13px;font-weight:700;margin-bottom:4px;">RAG Pipeline Status</div>
            <div style="font-size:12px;color:var(--text-secondary);">Vector DB: ChromaDB · Embedding: text-embedding-3-small · LLM: GPT-4o</div>
          </div>
          ${[
            {label:"Documents",val:docs.length,icon:"📄"},
            {label:"Total Chunks",val:docs.reduce((a,d)=>a+(d.chunks||0),0),icon:"🧩"},
            {label:"Indexed",val:docs.filter(d=>d.status==='indexed').length,icon:"✅"},
            {label:"Vector DB Size",val:"128 MB",icon:"🗄️"},
          ].map(s => `
            <div style="text-align:center;padding:12px 16px;background:rgba(255,255,255,0.05);border-radius:var(--radius-md);border:1px solid var(--border);">
              <div style="font-size:20px;">${s.icon}</div>
              <div style="font-size:18px;font-weight:800;margin-top:4px;">${s.val}</div>
              <div style="font-size:11px;color:var(--text-muted);">${s.label}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Drop Zone -->
      <div class="drop-zone card" id="drop-zone" style="margin-bottom:24px;">
        <input type="file" id="file-input" multiple accept=".pdf,.docx,.txt,.pptx" style="display:none;" />
        <div class="drop-icon">📤</div>
        <h3>Drag & Drop Files Here</h3>
        <p>or click to browse your files</p>
        <div class="file-types">
          <span class="tag">📄 PDF</span>
          <span class="tag">📝 DOCX</span>
          <span class="tag">📃 TXT</span>
          <span class="tag">📊 PPTX</span>
        </div>
        <button class="btn btn-primary" style="margin-top:20px;" onclick="document.getElementById('file-input').click()">
          Browse Files
        </button>
        <div style="margin-top:12px;font-size:12px;color:var(--text-muted);">Max file size: 50 MB per file</div>
      </div>

      <!-- Processing Pipeline Steps -->
      <div class="card" style="margin-bottom:24px;">
        <div style="font-size:14px;font-weight:700;margin-bottom:16px;">RAG Processing Pipeline</div>
        <div style="display:flex;gap:0;align-items:center;flex-wrap:wrap;gap:8px;">
          ${[
            {step:"1",label:"Upload",icon:"📤",desc:"Accept file",done:true},
            {step:"2",label:"Extract",icon:"🔍",desc:"Parse content",done:true},
            {step:"3",label:"Chunk",icon:"✂️",desc:"Smart splitting",done:true},
            {step:"4",label:"Embed",icon:"🧬",desc:"Generate vectors",done:true},
            {step:"5",label:"Index",icon:"🗂️",desc:"Store in ChromaDB",done:true},
            {step:"6",label:"Retrieve",icon:"🎯",desc:"Semantic search",done:false},
          ].map((s,i,arr) => `
            <div style="display:flex;align-items:center;gap:8px;flex:1;min-width:100px;">
              <div style="text-align:center;flex:1;">
                <div style="width:38px;height:38px;border-radius:50%;background:${s.done?'linear-gradient(135deg,var(--accent),var(--purple))':'var(--bg-elevated)'};border:2px solid ${s.done?'var(--accent)':'var(--border)'};display:flex;align-items:center;justify-content:center;margin:0 auto 6px;font-size:16px;">${s.icon}</div>
                <div style="font-size:12px;font-weight:600;">${s.label}</div>
                <div style="font-size:10px;color:var(--text-muted);">${s.desc}</div>
              </div>
              ${i < arr.length - 1 ? '<div style="flex:0.5;height:2px;background:linear-gradient(90deg,var(--accent),var(--border));border-radius:1px;"></div>' : ''}
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Document List -->
      <div class="section-header"><div class="section-title" style="font-size:15px;">Uploaded Documents</div></div>
      <div class="doc-list" id="doc-list">
        ${docs.map(d => renderDocItem(d)).join('')}
      </div>
    </div>`;
  }

  function renderDocItem(doc) {
    const icons = { pdf: '📄', docx: '📝', txt: '📃', pptx: '📊' };
    const icon = icons[doc.type] || '📄';
    const statusBadge = doc.status === 'indexed'
      ? `<span class="badge badge-green">✓ Indexed</span>`
      : `<span class="badge badge-orange">⏳ Processing...</span>`;
    return `
    <div class="doc-item" id="doc-${doc.id}">
      <div class="doc-icon ${doc.type}">${icon}</div>
      <div class="doc-info">
        <div class="doc-name">${doc.name}</div>
        <div class="doc-meta">
          <span>${doc.size}</span>
          <span>${doc.pages} pages</span>
          ${doc.chunks ? `<span>${doc.chunks} chunks</span>` : ''}
          <span>Uploaded ${doc.uploaded}</span>
        </div>
        <div style="margin-top:6px;display:flex;gap:5px;flex-wrap:wrap;">
          ${doc.tags.map(t => `<span class="tag">${t}</span>`).join('')}
        </div>
      </div>
      <div class="doc-status">${statusBadge}</div>
      <div style="display:flex;gap:6px;margin-left:8px;">
        <button class="btn btn-ghost btn-sm" onclick="Upload._chat('${doc.id}')" title="Chat with this doc">💬</button>
        <button class="btn btn-ghost btn-sm" onclick="Upload._summarize('${doc.id}')" title="Summarize">📋</button>
        <button class="btn btn-ghost btn-sm" onclick="Upload._delete('${doc.id}')" title="Delete" style="color:var(--red);">🗑️</button>
      </div>
    </div>`;
  }

  async function uploadFile(file) {
    const formData = new FormData();
    formData.append("file", file);

    const tempId = "d" + Date.now();
    const newDoc = {
      id: tempId,
      name: file.name,
      type: file.name.split('.').pop().toLowerCase(),
      size: (file.size / 1048576).toFixed(1) + " MB",
      pages: 0, chunks: 0,
      status: "processing",
      uploaded: "just now",
      tags: ["New Document"]
    };
    docs.unshift(newDoc);

    // Re-render doc list
    document.getElementById('doc-list').insertAdjacentHTML('afterbegin', renderDocItem(newDoc));
    App.showToast(`📤 Uploading ${file.name}...`, 'info');

    try {
      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData
      });
      if (!response.ok) throw new Error("Upload failed");
      const result = await response.json();
      
      const docIndex = docs.findIndex(d => d.id === tempId);
      if (docIndex !== -1) {
        docs[docIndex].id = result.doc_id;
        docs[docIndex].status = "indexed";
        docs[docIndex].chunks = result.chunks;
        
        const el = document.getElementById(`doc-${tempId}`);
        if (el) {
          el.id = `doc-${result.doc_id}`;
          el.querySelector('.doc-status').innerHTML = `<span class="badge badge-green">✓ Indexed</span>`;
          // Update action buttons with new ID
          const actions = el.querySelectorAll('button');
          actions[0].setAttribute('onclick', `Upload._chat('${result.doc_id}')`);
          actions[1].setAttribute('onclick', `Upload._summarize('${result.doc_id}')`);
          actions[2].setAttribute('onclick', `Upload._delete('${result.doc_id}')`);
        }
      }
      App.showToast(`✅ ${file.name} indexed into RAG pipeline!`, 'success');
    } catch (error) {
      console.error(error);
      App.showToast(`❌ Failed to process ${file.name}`, 'error');
      // Remove from UI if failed
      docs = docs.filter(d => d.id !== tempId);
      document.getElementById(`doc-${tempId}`)?.remove();
    }
  }

  function _chat(docId) {
    const doc = docs.find(d => d.id === docId);
    if (doc) {
      App.navigate('chat');
      setTimeout(() => {
        const input = document.getElementById('chat-input');
        if (input) { input.value = `Tell me about the content in ${doc.name}`; input.focus(); }
      }, 400);
    }
  }

  function _summarize(docId) {
    const doc = docs.find(d => d.id === docId);
    if (doc) {
      App.navigate('chat');
      setTimeout(() => {
        const input = document.getElementById('chat-input');
        if (input) { input.value = `Summarize the document: ${doc.name}`; input.focus(); }
      }, 400);
    }
  }

  async function _delete(docId) {
    try {
      const response = await fetch(`/api/documents/${docId}`, { method: 'DELETE' });
      if (response.ok) {
        docs = docs.filter(d => d.id !== docId);
        document.getElementById(`doc-${docId}`)?.remove();
        App.showToast('Document removed from knowledge base', 'info');
      } else {
        App.showToast('Failed to delete document', 'error');
      }
    } catch (e) {
      console.error(e);
      App.showToast('Error deleting document', 'error');
    }
  }

  async function loadDocuments() {
    try {
      const response = await fetch('/api/documents/list');
      if (response.ok) {
        const data = await response.json();
        if (data.documents && data.documents.length > 0) {
          // Normalise API response fields to what renderDocItem expects
          docs = data.documents.map(d => ({
            id:       d.id || d.doc_id || String(Date.now()),
            name:     d.name || d.filename || 'Unknown',
            type:     d.type || (d.filename || '').split('.').pop().toLowerCase() || 'txt',
            size:     d.size || '—',
            pages:    d.pages || 1,
            chunks:   d.chunks || 0,
            status:   d.status || 'indexed',
            uploaded: d.uploaded || 'recently',
            tags:     d.tags || ['Uploaded'],
          }));
          const docListEl = document.getElementById('doc-list');
          if (docListEl) docListEl.innerHTML = docs.map(d => renderDocItem(d)).join('');
        }
      }
    } catch (e) {
      console.error("Failed to fetch documents", e);
    }
  }

  function bindEvents() {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    if (!dropZone) return;

    dropZone.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
    dropZone.addEventListener('drop', e => {
      e.preventDefault(); dropZone.classList.remove('drag-over');
      [...e.dataTransfer.files].forEach(uploadFile);
    });
    fileInput.addEventListener('change', () => { [...fileInput.files].forEach(uploadFile); fileInput.value = ''; });
    document.getElementById('upload-btn-top')?.addEventListener('click', () => fileInput.click());
    
    // Load existing documents when events are bound
    loadDocuments();
  }

  return { render, bindEvents, _chat, _summarize, _delete };
})();
