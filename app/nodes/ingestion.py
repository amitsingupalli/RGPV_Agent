import os
from typing import Optional
from app.graph.state import AgentState
from app.tools.pdf_tools import PDFParser
from app.retrieval.chunking import PagePreservingChunker


def ingest_documents_node(state: AgentState) -> dict:
    """Extracts text and chunks from uploaded syllabus and PYQ documents, strictly preserving pages."""
    documents = state.get("documents", [])
    extracted_pages: list[dict] = []
    document_chunks: list[dict] = []
    doc_ids: list[str] = []

    chunker = PagePreservingChunker(target_chunk_chars=1200, chunk_overlap_chars=150)

    for doc in documents:
        doc_id = doc.get("id") or doc.get("document_id", "doc_default")
        file_path = doc.get("file_path", "")
        doc_type = doc.get("document_type", "reference")
        doc_ids.append(doc_id)

        if not file_path or not os.path.exists(file_path):
            continue

        parse_res = PDFParser.parse_document(file_path)
        if not parse_res.is_valid:
            continue

        # Preserve pages
        for p in parse_res.pages:
            extracted_pages.append({
                "doc_id": doc_id,
                "document_type": doc_type,
                "page_number": p.page_number,
                "text": p.text
            })

        # Generate page-preserving chunks
        chunks = chunker.chunk_pages(parse_res.pages, doc_id=doc_id)
        for ch in chunks:
            document_chunks.append({
                "document_id": doc_id,
                "source_type": doc_type,
                "page_number": ch.page_number,
                "chunk_index": ch.chunk_index,
                "chunk_text": ch.text,
                "token_count": ch.token_count,
                "source_ref": ch.source_ref
            })

    return {
        "document_ids": doc_ids,
        "pages": extracted_pages,
        "retrieved_evidence": document_chunks[:50],  # Keep available in state
        "next_action": "extract_syllabus"
    }
