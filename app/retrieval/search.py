import re
from dataclasses import dataclass
from typing import Optional, Literal
from pydantic import BaseModel, Field


class Evidence(BaseModel):
    source_id: str
    document_id: str
    page_number: int
    excerpt: str
    relevance_score: float = Field(ge=0.0, le=1.0)
    source_type: Literal["official_syllabus", "pyq_paper", "textbook_reference", "student_notes"]


class EvidenceRetriever:
    """Hybrid keyword and semantic retrieval engine with source authority weighting."""

    # Authority weights: Official RGPV documents get highest priority
    SOURCE_WEIGHTS = {
        "official_syllabus": 1.0,
        "pyq_paper": 0.95,
        "textbook_reference": 0.85,
        "student_notes": 0.65
    }

    @classmethod
    def retrieve_for_topic(
        cls,
        topic: dict,
        chunks: list[dict],
        top_k: int = 4,
        min_relevance: float = 0.40
    ) -> list[Evidence]:
        """Retrieves and ranks grounded evidence excerpts for a syllabus topic."""
        title = topic.get("title", "")
        subtopics = topic.get("subtopics", [])
        keywords = set(re.findall(r"\b[a-z]{3,}\b", title.lower()))
        for st in subtopics:
            keywords.update(re.findall(r"\b[a-z]{3,}\b", st.lower()))

        scored_evidence: list[Evidence] = []

        for ch in chunks:
            text = ch.get("chunk_text") or ch.get("text") or ""
            source_type = ch.get("source_type", "textbook_reference")
            doc_id = ch.get("document_id") or ch.get("doc_id", "doc_1")
            page_no = int(ch.get("page_number", 1))

            text_lower = text.lower()
            text_words = set(re.findall(r"\b[a-z]{3,}\b", text_lower))

            overlap = keywords.intersection(text_words)
            if not overlap:
                continue

            # Term overlap ratio
            base_score = len(overlap) / max(1, len(keywords))

            # Phrase match bonuses
            if title.lower() in text_lower:
                base_score += 0.35
            for st in subtopics:
                if st.lower() in text_lower:
                    base_score += 0.20

            # Authority weight
            authority = cls.SOURCE_WEIGHTS.get(source_type, 0.70)
            final_score = min(1.0, base_score * authority)

            if final_score >= min_relevance:
                # Extract clean snippet around matching keywords
                excerpt = cls._extract_best_snippet(text, list(overlap)[:3])
                scored_evidence.append(
                    Evidence(
                        source_id=f"{doc_id}:p{page_no}",
                        document_id=doc_id,
                        page_number=page_no,
                        excerpt=excerpt,
                        relevance_score=round(final_score, 4),
                        source_type=source_type
                    )
                )

        # Sort descending by relevance score
        scored_evidence.sort(key=lambda x: x.relevance_score, reverse=True)
        return scored_evidence[:top_k]

    @staticmethod
    def _extract_best_snippet(text: str, keywords: list[str], max_len: int = 350) -> str:
        text_clean = " ".join(text.split())
        if len(text_clean) <= max_len:
            return text_clean

        # Find first keyword occurrence
        pos = 0
        for kw in keywords:
            idx = text_clean.lower().find(kw.lower())
            if idx != -1:
                pos = idx
                break

        start = max(0, pos - 80)
        end = min(len(text_clean), start + max_len)
        snippet = text_clean[start:end].strip()

        if start > 0:
            snippet = "..." + snippet
        if end < len(text_clean):
            snippet = snippet + "..."
        return snippet
