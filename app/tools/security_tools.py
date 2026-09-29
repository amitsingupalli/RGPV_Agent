import os
import re
from dataclasses import dataclass
from typing import Optional, Literal
from pydantic import BaseModel


class SanitizationResult(BaseModel):
    is_safe: bool
    risk_score: float  # 0.0 (safe) to 1.0 (dangerous)
    detected_patterns: list[str]
    sanitized_text: str


class SecurityGuardrails:
    """Security tools protecting against prompt-injection, adversarial documents, and unsafe inputs."""

    # Common prompt injection and override patterns found in adversarial documents
    INJECTION_PATTERNS = [
        (re.compile(r"ignore\s+(?:all\s+)?(?:previous|prior)\s+instructions", re.IGNORECASE), "Instruction Override Attempt"),
        (re.compile(r"disregard\s+(?:all\s+)?(?:rules|rubric|grading)", re.IGNORECASE), "Grading Rule Disregard Attempt"),
        (re.compile(r"system\s+(?:prompt|override|command)\s*:", re.IGNORECASE), "System Role Impersonation"),
        (re.compile(r"you\s+must\s+now\s+(?:act|behave)\s+as", re.IGNORECASE), "Persona Hijack Attempt"),
        (re.compile(r"award\s+(?:full|maximum|100%?)\s+marks\s+(?:automatically|always)", re.IGNORECASE), "Fraudulent Score Manipulation"),
        (re.compile(r"<\s*script[^>]*>.*?<\s*/\s*script\s*>", re.IGNORECASE | re.DOTALL), "HTML/Script Injection"),
        (re.compile(r"javascript\s*:", re.IGNORECASE), "JavaScript URI Scheme"),
    ]

    @classmethod
    def sanitize_text(cls, text: str, max_chars: int = 50000) -> SanitizationResult:
        """Sanitizes text extracted from untrusted student uploads or notes."""
        if not text:
            return SanitizationResult(is_safe=True, risk_score=0.0, detected_patterns=[], sanitized_text="")

        detected = []
        clean_text = text[:max_chars]

        # Scan for injection patterns
        for pattern, label in cls.INJECTION_PATTERNS:
            matches = pattern.findall(clean_text)
            if matches:
                detected.append(label)
                # Neutralize pattern by replacing with safe placeholder
                clean_text = pattern.sub(f"[REDACTED_{label.upper().replace(' ', '_')}]", clean_text)

        # Risk score calculation
        risk_score = round(min(1.0, len(detected) * 0.35), 2)
        is_safe = (risk_score < 0.70)

        return SanitizationResult(
            is_safe=is_safe,
            risk_score=risk_score,
            detected_patterns=detected,
            sanitized_text=clean_text
        )

    @classmethod
    def validate_file_path(cls, base_dir: str, filename: str) -> tuple[bool, Optional[str], str]:
        """Guards against path traversal directory escape attacks (e.g. ../../etc/passwd)."""
        safe_filename = os.path.basename(filename)
        safe_filename = re.sub(r"[^\w\.-]", "_", safe_filename)

        full_path = os.path.abspath(os.path.join(base_dir, safe_filename))
        base_path = os.path.abspath(base_dir)

        if not full_path.startswith(base_path):
            return False, f"Path traversal attempt detected in filename: {filename}", ""

        return True, None, full_path

    @classmethod
    def validate_pdf_signature(cls, file_bytes: bytes) -> tuple[bool, Optional[str]]:
        """Verifies that uploaded binary content is a genuine PDF file via magic bytes."""
        if len(file_bytes) < 4:
            return False, "File is too small to be a valid PDF document."

        # PDF files must start with %PDF- (hex: 25 50 44 46)
        if not file_bytes.startswith(b"%PDF-"):
            return False, "Invalid file signature: uploaded file does not begin with standard PDF magic bytes."

        return True, None
