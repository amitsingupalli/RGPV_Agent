from dataclasses import dataclass
from typing import Optional
from app.tools.pdf_tools import PageExtract


@dataclass
class TextChunk:
    chunk_index: int
    page_number: int
    text: str
    token_count: int
    char_count: int
    source_ref: str  # e.g. "doc_123:p2"


class PagePreservingChunker:
    """Splits document pages into semantic chunks while strictly preserving page boundaries."""

    def __init__(
        self,
        target_chunk_chars: int = 1500,
        chunk_overlap_chars: int = 200,
        min_chunk_chars: int = 100
    ):
        self.target_chunk_chars = target_chunk_chars
        self.chunk_overlap_chars = chunk_overlap_chars
        self.min_chunk_chars = min_chunk_chars

    def chunk_pages(
        self,
        pages: list[PageExtract],
        doc_id: str
    ) -> list[TextChunk]:
        all_chunks: list[TextChunk] = []
        global_chunk_idx = 0

        for page in pages:
            if not page.has_text:
                continue

            page_chunks = self._chunk_single_page(
                page_text=page.text,
                page_number=page.page_number,
                doc_id=doc_id,
                start_index=global_chunk_idx
            )
            all_chunks.extend(page_chunks)
            global_chunk_idx += len(page_chunks)

        return all_chunks

    def _chunk_single_page(
        self,
        page_text: str,
        page_number: int,
        doc_id: str,
        start_index: int
    ) -> list[TextChunk]:
        chunks: list[TextChunk] = []
        text = page_text.strip()
        if not text:
            return chunks

        # If page fits within chunk size, keep it as single intact chunk
        if len(text) <= self.target_chunk_chars:
            chunks.append(
                TextChunk(
                    chunk_index=start_index,
                    page_number=page_number,
                    text=text,
                    token_count=self._estimate_tokens(text),
                    char_count=len(text),
                    source_ref=f"{doc_id}:p{page_number}"
                )
            )
            return chunks

        # Break text into paragraphs / sections
        paragraphs = text.split("\n\n")
        current_chunk_paragraphs: list[str] = []
        current_len = 0
        local_idx = start_index

        for para in paragraphs:
            para = para.strip()
            if not para:
                continue

            para_len = len(para)
            if current_len + para_len > self.target_chunk_chars and current_chunk_paragraphs:
                chunk_str = "\n\n".join(current_chunk_paragraphs).strip()
                chunks.append(
                    TextChunk(
                        chunk_index=local_idx,
                        page_number=page_number,
                        text=chunk_str,
                        token_count=self._estimate_tokens(chunk_str),
                        char_count=len(chunk_str),
                        source_ref=f"{doc_id}:p{page_number}"
                    )
                )
                local_idx += 1
                # Overlap: keep the last paragraph if small enough
                if len(current_chunk_paragraphs[-1]) < self.chunk_overlap_chars:
                    current_chunk_paragraphs = [current_chunk_paragraphs[-1], para]
                    current_len = len(current_chunk_paragraphs[0]) + para_len
                else:
                    current_chunk_paragraphs = [para]
                    current_len = para_len
            else:
                current_chunk_paragraphs.append(para)
                current_len += para_len + 2

        # Remainder
        if current_chunk_paragraphs:
            chunk_str = "\n\n".join(current_chunk_paragraphs).strip()
            if len(chunk_str) >= self.min_chunk_chars or not chunks:
                chunks.append(
                    TextChunk(
                        chunk_index=local_idx,
                        page_number=page_number,
                        text=chunk_str,
                        token_count=self._estimate_tokens(chunk_str),
                        char_count=len(chunk_str),
                        source_ref=f"{doc_id}:p{page_number}"
                    )
                )

        return chunks

    @staticmethod
    def _estimate_tokens(text: str) -> int:
        # Standard conservative English token approximation (~4 chars per token)
        return max(1, len(text) // 4)
