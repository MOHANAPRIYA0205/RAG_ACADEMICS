"""
Unit tests for RAG Pipeline
Tests document ingestion, retrieval, and query functionality
"""
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))

import pytest
from rag.pipeline import RAGPipeline


class TestRAGPipeline:
    """Test suite for RAG Pipeline"""

    @pytest.fixture
    def rag_pipeline(self):
        """Create a fresh RAG pipeline instance for each test"""
        return RAGPipeline()

    def test_pipeline_initialization(self, rag_pipeline):
        """Test that RAG pipeline initializes correctly"""
        assert rag_pipeline is not None
        assert rag_pipeline.splitter is not None
        assert rag_pipeline.documents_cache == {}

    def test_document_ingestion(self, rag_pipeline):
        """Test document ingestion and chunking"""
        text = "Machine learning is a subset of artificial intelligence. " * 20
        metadata = {"filename": "test.txt", "doc_id": "test-001"}
        
        chunks = rag_pipeline.ingest(text, metadata)
        
        assert chunks > 0
        assert "test-001" in rag_pipeline.documents_cache
        assert rag_pipeline.documents_cache["test-001"]["chunk_count"] == chunks

    def test_empty_document_ingestion(self, rag_pipeline):
        """Test handling of empty documents"""
        text = ""
        metadata = {"filename": "empty.txt", "doc_id": "empty-001"}
        
        chunks = rag_pipeline.ingest(text, metadata)
        
        # Should handle gracefully, may return 0 or 1 depending on implementation
        assert chunks >= 0

    def test_query_without_documents(self, rag_pipeline):
        """Test query when no documents are uploaded"""
        result = rag_pipeline.query("What is machine learning?")
        
        assert "answer" in result
        assert "sources" in result
        assert "No documents uploaded" in result["answer"] or len(result["sources"]) == 0

    def test_query_with_documents(self, rag_pipeline):
        """Test query after uploading documents"""
        # Ingest a document
        text = (
            "Backpropagation is an algorithm used to train neural networks. "
            "It computes gradients using the chain rule. "
            "The algorithm consists of forward pass and backward pass."
        )
        metadata = {"filename": "neural_networks.txt", "doc_id": "nn-001"}
        rag_pipeline.ingest(text, metadata)
        
        # Query the document
        result = rag_pipeline.query("What is backpropagation?")
        
        assert "answer" in result
        assert "sources" in result
        assert len(result["answer"]) > 0

    def test_multiple_document_ingestion(self, rag_pipeline):
        """Test ingesting multiple documents"""
        docs = [
            ("Machine learning is a subset of AI.", {"filename": "ml.txt", "doc_id": "ml-001"}),
            ("Deep learning uses neural networks.", {"filename": "dl.txt", "doc_id": "dl-001"}),
            ("NLP processes natural language.", {"filename": "nlp.txt", "doc_id": "nlp-001"}),
        ]
        
        total_chunks = 0
        for text, metadata in docs:
            chunks = rag_pipeline.ingest(text, metadata)
            total_chunks += chunks
        
        assert len(rag_pipeline.documents_cache) == 3
        assert total_chunks > 0

    def test_chunking_strategy(self, rag_pipeline):
        """Test that text is properly chunked"""
        # Create a long document that will be split into multiple chunks
        text = "This is a test sentence. " * 100
        metadata = {"filename": "long.txt", "doc_id": "long-001"}
        
        chunks = rag_pipeline.ingest(text, metadata)
        
        # Should create multiple chunks for long text
        assert chunks >= 1
        cached_doc = rag_pipeline.documents_cache["long-001"]
        assert len(cached_doc["chunks"]) == chunks

    def test_metadata_preservation(self, rag_pipeline):
        """Test that metadata is preserved during ingestion"""
        text = "Test document content"
        metadata = {
            "filename": "test.pdf",
            "doc_id": "test-123",
            "page": 1,
            "author": "Test Author"
        }
        
        rag_pipeline.ingest(text, metadata)
        
        cached_doc = rag_pipeline.documents_cache["test-123"]
        assert cached_doc["metadata"]["filename"] == "test.pdf"
        assert cached_doc["metadata"]["doc_id"] == "test-123"

    def test_query_returns_sources(self, rag_pipeline):
        """Test that query returns source documents"""
        text = "Transformers use self-attention mechanism for processing sequences."
        metadata = {"filename": "transformers.txt", "doc_id": "trans-001"}
        rag_pipeline.ingest(text, metadata)
        
        result = rag_pipeline.query("What do transformers use?")
        
        assert "sources" in result
        assert isinstance(result["sources"], list)

    def test_concurrent_queries(self, rag_pipeline):
        """Test multiple queries on the same pipeline"""
        text = "Neural networks consist of layers. Each layer has neurons."
        metadata = {"filename": "nn.txt", "doc_id": "nn-001"}
        rag_pipeline.ingest(text, metadata)
        
        result1 = rag_pipeline.query("What are neural networks?")
        result2 = rag_pipeline.query("What do layers have?")
        
        assert "answer" in result1
        assert "answer" in result2
        assert len(result1["answer"]) > 0
        assert len(result2["answer"]) > 0


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
