import os
import re
from dataclasses import dataclass
from typing import Optional
import fitz  # PyMuPDF


@dataclass
class PageExtract:
    page_number: int  # 1-indexed
    text: str
    char_count: int
    has_text: bool


@dataclass
class DocumentParseResult:
    filename: str
    total_pages: int
    pages: list[PageExtract]
    is_valid: bool
    error: Optional[str] = None


class PDFParser:
    """Secure, page-preserving PDF and text extractor using PyMuPDF."""

    MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024  # 25 MB
    MAX_PAGES = 100

    @classmethod
    def validate_file(cls, file_path: str) -> tuple[bool, Optional[str]]:
        if not os.path.exists(file_path):
            return False, f"File does not exist: {file_path}"
        
        file_size = os.path.getsize(file_path)
        if file_size > cls.MAX_FILE_SIZE_BYTES:
            return False, f"File size ({file_size} bytes) exceeds limit of {cls.MAX_FILE_SIZE_BYTES} bytes"
        
        if file_size == 0:
            return False, "File is empty (0 bytes)"

        return True, None

    @classmethod
    def parse_document(cls, file_path: str) -> DocumentParseResult:
        is_valid, error = cls.validate_file(file_path)
        if not is_valid:
            return DocumentParseResult(
                filename=os.path.basename(file_path),
                total_pages=0,
                pages=[],
                is_valid=False,
                error=error
            )

        filename = os.path.basename(file_path)
        ext = os.path.splitext(filename)[1].lower()

        # Plain text file support (e.g. sample text or exported notes)
        if ext in [".txt", ".md"]:
            return cls._parse_text_file(file_path)

        # PDF extraction using PyMuPDF
        try:
            doc = fitz.open(file_path)
            if doc.is_encrypted:
                return DocumentParseResult(
                    filename=filename,
                    total_pages=0,
                    pages=[],
                    is_valid=False,
                    error="PDF file is encrypted or password protected"
                )

            total_pages = len(doc)
            if total_pages > cls.MAX_PAGES:
                doc.close()
                return DocumentParseResult(
                    filename=filename,
                    total_pages=total_pages,
                    pages=[],
                    is_valid=False,
                    error=f"PDF page count ({total_pages}) exceeds maximum allowed ({cls.MAX_PAGES})"
                )

            extracted_pages: list[PageExtract] = []
            for page_idx in range(total_pages):
                page = doc[page_idx]
                text = page.get_text("text") or ""
                cleaned_text = cls._clean_text(text)
                extracted_pages.append(
                    PageExtract(
                        page_number=page_idx + 1,
                        text=cleaned_text,
                        char_count=len(cleaned_text),
                        has_text=bool(cleaned_text.strip())
                    )
                )

            doc.close()
            return DocumentParseResult(
                filename=filename,
                total_pages=total_pages,
                pages=extracted_pages,
                is_valid=True
            )
        except Exception as e:
            return DocumentParseResult(
                filename=filename,
                total_pages=0,
                pages=[],
                is_valid=False,
                error=f"Failed to parse PDF document: {str(e)}"
            )

    @classmethod
    def _parse_text_file(cls, file_path: str) -> DocumentParseResult:
        filename = os.path.basename(file_path)
        try:
            with open(file_path, "r", encoding="utf-8", errors="replace") as f:
                content = f.read()

            pages: list[PageExtract] = []
            # Detect explicit [Page X] markers
            pattern = re.compile(r"\[Page\s+(\d+)\]", re.IGNORECASE)
            matches = list(pattern.finditer(content))

            if matches:
                # If there is introductory header before first [Page 1], prepend to Page 1
                for i, match in enumerate(matches):
                    page_num = int(match.group(1))
                    start_pos = match.end()
                    end_pos = matches[i + 1].start() if i + 1 < len(matches) else len(content)
                    page_content = content[start_pos:end_pos]
                    
                    # Prepend any header before [Page 1] to page 1
                    if i == 0 and match.start() > 0:
                        header = content[:match.start()].strip()
                        if header:
                            page_content = header + "\n\n" + page_content

                    cleaned = cls._clean_text(page_content)
                    pages.append(
                        PageExtract(
                            page_number=page_num,
                            text=cleaned,
                            char_count=len(cleaned),
                            has_text=bool(cleaned.strip())
                        )
                    )
            else:
                cleaned = cls._clean_text(content)
                pages.append(
                    PageExtract(
                        page_number=1,
                        text=cleaned,
                        char_count=len(cleaned),
                        has_text=bool(cleaned.strip())
                    )
                )

            return DocumentParseResult(
                filename=filename,
                total_pages=len(pages),
                pages=pages,
                is_valid=True
            )
        except Exception as e:
            return DocumentParseResult(
                filename=filename,
                total_pages=0,
                pages=[],
                is_valid=False,
                error=f"Failed to read text file: {str(e)}"
            )

    @staticmethod
    def _clean_text(text: str) -> str:
        text = text.replace("\r\n", "\n").replace("\r", "\n").replace("\x00", "")
        lines = [line.strip() for line in text.split("\n")]
        cleaned_lines = []
        consecutive_empty = 0
        for line in lines:
            if not line:
                consecutive_empty += 1
                if consecutive_empty <= 1:
                    cleaned_lines.append("")
            else:
                consecutive_empty = 0
                cleaned_lines.append(line)
        return "\n".join(cleaned_lines).strip()
