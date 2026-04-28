/* =====================================================
   rag.js — RAG Pipeline Simulation + AI Responses
   ===================================================== */

const RAG = (() => {
  // Simulated document knowledge base
  const KB = {
    syllabus: {
      title: "AI Department Syllabus 2024",
      chunks: [
        { id: "s1", text: "Unit 1: Introduction to Artificial Intelligence — History, Turing Test, Problem formulation, Search strategies (BFS, DFS, A*). 10 hours.", page: 2 },
        { id: "s2", text: "Unit 2: Knowledge Representation — Propositional logic, First-order logic, Inference rules, Knowledge graphs, Ontologies. 12 hours.", page: 4 },
        { id: "s3", text: "Unit 3: Machine Learning — Supervised learning (Linear Regression, SVM, Decision Trees), Unsupervised learning (K-Means, PCA), Reinforcement Learning basics. 15 hours.", page: 7 },
        { id: "s4", text: "Unit 4: Deep Learning — Neural Networks, CNN, RNN, LSTM, Transformers, Attention Mechanism. 18 hours.", page: 11 },
        { id: "s5", text: "Unit 5: Natural Language Processing — Tokenization, Word2Vec, BERT, GPT architectures, RAG systems, LangChain. 14 hours.", page: 16 },
        { id: "s6", text: "Unit 6: Computer Vision — Image preprocessing, Feature extraction, Object detection (YOLO, SSD), Semantic segmentation. 12 hours.", page: 20 },
      ]
    },
    notes: {
      title: "Neural Networks — Study Notes",
      chunks: [
        { id: "n1", text: "A neural network is a computational model inspired by the human brain consisting of layers: input, hidden, and output. Each neuron computes a weighted sum and applies an activation function.", page: 1 },
        { id: "n2", text: "Backpropagation algorithm: computes gradient of loss function w.r.t. weights using chain rule. Steps: Forward pass → compute loss → backward pass → update weights via gradient descent.", page: 3 },
        { id: "n3", text: "Activation Functions: Sigmoid σ(x)=1/(1+e^-x), ReLU max(0,x), Tanh, Leaky ReLU, Softmax for multi-class. ReLU is preferred for hidden layers to avoid vanishing gradient.", page: 5 },
        { id: "n4", text: "Regularization techniques to prevent overfitting: L1 (Lasso), L2 (Ridge), Dropout (randomly zero neurons), Batch Normalization, Early Stopping, Data Augmentation.", page: 8 },
        { id: "n5", text: "Transformers use Self-Attention mechanism: Q, K, V matrices. Attention(Q,K,V) = softmax(QK^T/√d_k)V. BERT uses Masked LM + NSP pre-training. GPT uses causal/autoregressive masking.", page: 12 },
      ]
    },
    qpapers: {
      title: "Previous Year Question Papers",
      chunks: [
        { id: "q1", text: "2023 Q1: Explain the A* search algorithm with a suitable example. What is the role of heuristic function h(n)? [8 marks]", page: 1 },
        { id: "q2", text: "2023 Q2: Compare and contrast supervised vs unsupervised learning with real-world examples. [6 marks]", page: 1 },
        { id: "q3", text: "2022 Q1: Derive the backpropagation algorithm for a 3-layer neural network. [10 marks]", page: 1 },
        { id: "q4", text: "2022 Q2: Explain the attention mechanism in Transformer architecture. Write the self-attention formula. [8 marks]", page: 2 },
        { id: "q5", text: "2021 Q1: What is Retrieval-Augmented Generation (RAG)? How does it reduce hallucination in LLMs? [8 marks]", page: 1 },
      ]
    }
  };

  // Embed (simulate cosine similarity ranking)
  function retrieveChunks(query, topK = 3) {
    const q = query.toLowerCase();
    const all = [];
    Object.values(KB).forEach(doc => {
      doc.chunks.forEach(chunk => {
        const score = computeScore(q, chunk.text.toLowerCase());
        all.push({ ...chunk, docTitle: doc.title, score });
      });
    });
    return all.sort((a, b) => b.score - a.score).slice(0, topK);
  }

  function computeScore(query, text) {
    const keywords = query.split(/\s+/).filter(w => w.length > 2);
    let score = 0;
    keywords.forEach(kw => { if (text.includes(kw)) score += 1; });
    if (text.includes(query)) score += 3;
    return score;
  }

  // AI response templates (simulated LLM output)
  const RESPONSES = {
    default: (ctx, q) => `Based on the retrieved documents, here is what I found:\n\n${ctx}\n\nThis information is sourced directly from your uploaded academic materials. If you'd like more detail on any specific aspect, feel free to ask!`,
    backpropagation: `**Backpropagation** is the core training algorithm for neural networks. Here's how it works:\n\n**Step 1 — Forward Pass:**\nInput data flows through the network layer by layer. Each neuron computes:\n$$z = Wx + b, \\quad a = \\sigma(z)$$\n\n**Step 2 — Compute Loss:**\nUsing Mean Squared Error or Cross-Entropy:\n$$L = -\\sum y \\log(\\hat{y})$$\n\n**Step 3 — Backward Pass (Chain Rule):**\n$$\\frac{\\partial L}{\\partial W} = \\frac{\\partial L}{\\partial a} \\cdot \\frac{\\partial a}{\\partial z} \\cdot \\frac{\\partial z}{\\partial W}$$\n\n**Step 4 — Weight Update:**\n$$W \\leftarrow W - \\eta \\cdot \\frac{\\partial L}{\\partial W}$$\n\nwhere η is the learning rate.\n\n📚 **Source:** Neural Networks Study Notes, Page 3`,
    transformer: `**Transformer Architecture** was introduced in "Attention is All You Need" (2017).\n\n**Key Components:**\n- **Multi-Head Self-Attention** — allows the model to attend to different positions simultaneously\n- **Positional Encoding** — injects position information since there's no recurrence\n- **Feed-Forward Network** — applied to each position independently\n- **Layer Normalization + Residual Connections**\n\n**Self-Attention Formula:**\n$$\\text{Attention}(Q,K,V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V$$\n\n**BERT** uses bidirectional attention (Masked LM + NSP pre-training).\n**GPT** uses causal masking (autoregressive generation).\n\n📚 **Source:** Neural Networks Notes, Page 12`,
    units: `**AI Department — Unit Overview:**\n\n| Unit | Topic | Hours |\n|------|-------|-------|\n| 1 | Introduction to AI | 10 |\n| 2 | Knowledge Representation | 12 |\n| 3 | Machine Learning | 15 |\n| 4 | Deep Learning | 18 |\n| 5 | NLP & RAG | 14 |\n| 6 | Computer Vision | 12 |\n\n**Total: 81 hours**\n\n📚 **Source:** AI Department Syllabus 2024`,
  };

  function generateResponse(query, chunks) {
    const q = query.toLowerCase();
    if (q.includes("backprop")) return RESPONSES.backpropagation;
    if (q.includes("transformer") || q.includes("attention") || q.includes("bert")) return RESPONSES.transformer;
    if (q.includes("unit") || q.includes("syllabus") || q.includes("schedule")) return RESPONSES.units;
    const ctx = chunks.map(c => `• ${c.text}`).join("\n");
    return RESPONSES.default(ctx, query);
  }

  async function query(userQuery) {
    // Simulate latency
    await new Promise(r => setTimeout(r, 1200 + Math.random() * 800));
    const chunks = retrieveChunks(userQuery, 3);
    const answer = generateResponse(userQuery, chunks);
    return { answer, sources: chunks };
  }

  function getAllDocs() { return KB; }

  return { query, retrieveChunks, getAllDocs };
})();
