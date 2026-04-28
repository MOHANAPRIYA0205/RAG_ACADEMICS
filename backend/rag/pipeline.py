"""
rag/pipeline.py — Core RAG Pipeline with Fallback Support
"""
import os
from pathlib import Path
from dotenv import load_dotenv
import logging

# Setup logging
logger = logging.getLogger(__name__)

# Load environment variables
env_path = Path(__file__).parent.parent.parent / ".env"
load_dotenv(env_path)

from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_community.vectorstores import Chroma
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate

# Use absolute path relative to this file so it works regardless of cwd
PERSIST_DIR = str(Path(__file__).parent.parent / "chroma_db")

PROMPT = PromptTemplate(
    input_variables=["context", "question"],
    template="""You are an expert AI academic assistant for an Artificial Intelligence department.
Use ONLY the following retrieved context to answer the question accurately.
If the answer is not in the context, say "I don't have enough information in the uploaded documents."

Context:
{context}

Question: {question}

Answer (be detailed, structured, and cite sources):"""
)


class RAGPipeline:
    def __init__(self):
        self.embeddings = None
        self.llm = None
        self.llm_available = False
        self.vectorstore = None
        self.documents_cache = {}  # Simple in-memory cache for documents

        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=512,
            chunk_overlap=64,
            separators=["\n\n", "\n", ". ", " ", ""]
        )

        # Lazy-init embeddings and LLM so import doesn't fail without API key
        self._init_models()

    def _init_models(self):
        """Initialize OpenAI models; gracefully degrade if key is missing."""
        api_key = os.getenv("OPENAI_API_KEY", "")
        if not api_key or api_key.startswith("sk-your") or len(api_key) < 20:
            logger.warning("OPENAI_API_KEY not set or invalid — running in offline/fallback mode.")
            return

        try:
            self.embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
            self.llm_available = True
            logger.info("OpenAI embeddings initialized.")
        except Exception as e:
            logger.warning(f"Could not initialize embeddings: {e}")

        try:
            self.llm = ChatOpenAI(model="gpt-4o", temperature=0.1)
            logger.info("ChatOpenAI LLM initialized.")
        except Exception as e:
            logger.warning(f"Could not initialize LLM: {e}")

    def ingest(self, text: str, metadata: dict) -> int:
        """Process document → chunks → embeddings → ChromaDB"""
        try:
            chunks = self.splitter.create_documents([text], metadatas=[metadata])

            # Cache the document
            doc_id = metadata.get("doc_id", "unknown")
            self.documents_cache[doc_id] = {
                "text": text,
                "chunks": chunks,
                "metadata": metadata,
                "chunk_count": len(chunks)
            }

            # Try to ingest to vector store if embeddings are available
            if self.embeddings:
                try:
                    os.makedirs(PERSIST_DIR, exist_ok=True)
                    if self.vectorstore is None:
                        self.vectorstore = Chroma.from_documents(
                            chunks, self.embeddings, persist_directory=PERSIST_DIR
                        )
                    else:
                        self.vectorstore.add_documents(chunks)
                    # NOTE: ChromaDB 0.4+ auto-persists; no .persist() call needed
                    logger.info(f"Ingested {len(chunks)} chunks into ChromaDB.")
                except Exception as e:
                    logger.error(f"Failed to add documents to vector store: {e}")
                    # Continue anyway — we have cached data

            return len(chunks)
        except Exception as e:
            logger.error(f"Ingest error: {e}")
            return 0

    def query(self, question: str, top_k: int = 4) -> dict:
        """Retrieve top-k chunks → generate answer with source attribution"""
        if not self.vectorstore and not self.documents_cache:
            return {"answer": "No documents uploaded yet.", "sources": []}

        # Try vector search if available
        if self.vectorstore and self.llm:
            try:
                retriever = self.vectorstore.as_retriever(
                    search_type="mmr",
                    search_kwargs={"k": top_k, "fetch_k": 10}
                )
                chain = RetrievalQA.from_chain_type(
                    llm=self.llm,
                    chain_type="stuff",
                    retriever=retriever,
                    return_source_documents=True,
                    chain_type_kwargs={"prompt": PROMPT}
                )
                result = chain.invoke({"query": question})
                sources = [
                    {
                        "title": doc.metadata.get("filename", "Unknown"),
                        "page": doc.metadata.get("page", 1),
                        "excerpt": doc.page_content[:120] + "..."
                    }
                    for doc in result.get("source_documents", [])
                ]
                return {"answer": result.get("result", ""), "sources": sources}
            except Exception as e:
                logger.error(f"Vector search failed: {e}")

        # Fallback: Simple text search in cache
        try:
            best_matches = []
            for doc_id, doc_data in self.documents_cache.items():
                if question.lower() in doc_data["text"].lower():
                    best_matches.append({
                        "title": doc_data["metadata"].get("filename", "Unknown"),
                        "excerpt": doc_data["text"][:150] + "...",
                        "score": 0.5
                    })

            if best_matches:
                answer = (
                    f"📚 Based on uploaded materials:\n\n"
                    f"Your question '{question}' was found in the uploaded documents. "
                    f"The system retrieved {len(best_matches)} matching section(s)."
                )
                return {"answer": answer, "sources": best_matches[:3]}
        except Exception as e:
            logger.error(f"Fallback search failed: {e}")

        return {
            "answer": "I couldn't find a good answer. Please try uploading more documents or rephrasing your question.",
            "sources": []
        }

    def load_existing(self):
        """Load an existing ChromaDB vector store from disk."""
        try:
            if os.path.exists(PERSIST_DIR) and self.embeddings:
                self.vectorstore = Chroma(
                    persist_directory=PERSIST_DIR,
                    embedding_function=self.embeddings
                )
                logger.info("Loaded existing ChromaDB vector store.")
        except Exception as e:
            logger.error(f"Failed to load existing vector store: {e}")


# Module-level singleton — loaded once at startup
rag = RAGPipeline()
rag.load_existing()
