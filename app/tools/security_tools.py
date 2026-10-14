import os
import re
from typing import Optional, List, Dict, Any, Tuple
from pydantic import BaseModel, Field


class SanitizationResult(BaseModel):
    is_safe: bool
    risk_score: float  # 0.0 (safe) to 1.0 (dangerous)
    detected_patterns: list[str]
    sanitized_text: str
    reason: Optional[str] = None


class AcademicScopeResult(BaseModel):
    is_academic: bool
    category: str
    reason: str
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)


class AnswerGuardResult(BaseModel):
    is_valid: bool
    flagged_issue: Optional[str] = None
    awarded_score: float = 0.0
    rubrics: list[dict] = Field(default_factory=list)
    verifier_shield_active: bool = True
    audit_notes: list[str] = Field(default_factory=list)


class SecurityGuardrails:
    """Enterprise-grade security and academic guardrails protecting RGPV-Agent.

    Layers:
    1. Prompt-Injection & Jailbreak Defense (adversarial pattern detection, role hijacking, instruction override).
    2. Academic Scope & Off-Topic Filtering (ensures queries stay within engineering/curriculum bounds).
    3. Student Answer Integrity Guard (detects gibberish, empty answers, question copy-pasting).
    4. Anti-Hallucination & Scoring Verifier Shield (enforces mathematical bounds & rubric self-consistency).
    5. Path Traversal & PDF Signature Validation (protects file storage & ingestion).
    """

    # Comprehensive Prompt Injection, Jailbreak, and XSS patterns
    INJECTION_PATTERNS: List[Tuple[re.Pattern, str]] = [
        (re.compile(r"ignore\s+(?:all\s+)?(?:previous|prior|above)\s+instructions", re.IGNORECASE), "Instruction Override Attempt"),
        (re.compile(r"disregard\s+(?:all\s+)?(?:rules|rubric|grading|constraints)", re.IGNORECASE), "Grading Rule Disregard Attempt"),
        (re.compile(r"system\s+(?:prompt|override|command)\s*:", re.IGNORECASE), "System Role Impersonation"),
        (re.compile(r"you\s+must\s+now\s+(?:act|behave|pretend)\s+as", re.IGNORECASE), "Persona Hijack Attempt"),
        (re.compile(r"award\s+(?:full|maximum|100%?)\s+marks\s+(?:automatically|always)?", re.IGNORECASE), "Fraudulent Score Manipulation"),
        (re.compile(r"give\s+(?:me\s+)?(?:full|maximum|100%?)\s+marks", re.IGNORECASE), "Score Override Request"),
        (re.compile(r"bypass\s+(?:all\s+)?(?:academic\s+|security\s+)?(?:guardrails|rubrics|filters|security|safety|guidelines)", re.IGNORECASE), "Guardrail Bypass Attempt"),
        (re.compile(r"\b(?:dan\s+mode|jailbreak|developer\s+mode|unrestricted\s+ai)\b", re.IGNORECASE), "Jailbreak Mode Pattern"),
        (re.compile(r"reveal\s+(?:your\s+)?(?:system\s+prompt|hidden\s+instructions|secret\s+key|prompt\b)", re.IGNORECASE), "System Prompt Leakage Attempt"),
        (re.compile(r"<\s*script[^>]*>.*?<\s*/\s*script\s*>", re.IGNORECASE | re.DOTALL), "HTML/Script Injection"),
        (re.compile(r"javascript\s*:", re.IGNORECASE), "JavaScript URI Scheme"),
        (re.compile(r"on(?:error|load|click|mouse[a-z]+)\s*=", re.IGNORECASE), "Inline DOM Event Handler Injection"),
        (re.compile(r"<\s*iframe[^>]*>", re.IGNORECASE), "IFrame Injection Attempt"),
    ]

    # Harmful / non-academic patterns strictly disallowed in educational copilot
    HARMFUL_PATTERNS: List[Tuple[re.Pattern, str]] = [
        (re.compile(r"\b(?:keylogger|ransomware|trojan|rootkit|malware|ddos\s+script|exploit\s+payload)\b", re.IGNORECASE), "Malicious Exploit Generation"),
        (re.compile(r"\b(?:how\s+to\s+make|build|synthesize)\s+(?:a\s+)?(?:bomb|explosive|weapon|poison)\b", re.IGNORECASE), "Dangerous / Hazardous Material Request"),
        (re.compile(r"\b(?:steal\s+(?:passwords|credentials)|bypass\s+password|crack\s+wifi|hack\s+into)\b", re.IGNORECASE), "Unauthorized Access Attempt"),
    ]

    # Off-topic patterns clearly unrelated to B.Tech university academics
    OFF_TOPIC_PATTERNS: List[Tuple[re.Pattern, str]] = [
        (re.compile(r"\b(?:write\s+(?:a\s+)?(?:love\s+|romantic\s+)?(?:poem|poetry|story|song|lyrics|rap|movie\s+script))\b", re.IGNORECASE), "Creative Non-Academic Fiction"),
        (re.compile(r"\b(?:tell\s+(?:me\s+)?(?:(?:a|some)\s+)?(?:funny\s+)?joke|comedian|standup)\b", re.IGNORECASE), "Casual Entertainment / Gossip"),
        (re.compile(r"\b(?:who\s+is\s+(?:the\s+)?actor|bollywood|hollywood|movie\s+star|celebrity|box\s+office|latest\s+movie)\b", re.IGNORECASE), "Casual Entertainment / Movies"),
        (re.compile(r"\b(?:who\s+won\s+the\s+(?:ipl|match|world\s+cup|fifa)|cricket\s+score|football\s+score)\b", re.IGNORECASE), "Sports & Entertainment"),
        (re.compile(r"\b(?:horoscope|astrology|zodiac|dating\s+advice|love\s+advice|girlfriend|boyfriend)\b", re.IGNORECASE), "Personal / Dating Advice"),
        (re.compile(r"\b(?:recipe\s+for|how\s+to\s+cook|baking\s+cake|pizza\s+dough)\b", re.IGNORECASE), "Culinary / Non-Engineering Query"),
    ]

    # Academic keywords that signal legitimate engineering / science context
    ACADEMIC_KEYWORDS = {
        "algorithm", "database", "sql", "network", "matrix", "derivative", "integral", "physics",
        "chemistry", "edta", "thermodynamics", "circuit", "transformer", "amplifier", "diode",
        "rectifier", "compiler", "operating", "process", "memory", "paging", "scheduling",
        "automata", "grammar", "turing", "complexity", "machine", "learning", "data", "tree",
        "graph", "sorting", "stack", "queue", "induction", "motor", "bending", "shear",
        "beam", "cad", "projection", "scale", "isometric", "differential", "equation",
        "eigenvalue", "cayley", "hamilton", "boolean", "logic", "gate", "kcl", "kvl",
        "thevenin", "norton", "resonance", "rlc", "entropy", "regression", "svm", "neural",
        "rf", "pyq", "unit", "rgpv", "bcnf", "acid", "concurrency", "deadlock", "syntax",
        "derivation", "formula", "numerical", "diagram", "schematic", "proof", "theorem"
    }

    @classmethod
    def sanitize_text(cls, text: str, max_chars: int = 50000) -> SanitizationResult:
        """Sanitizes text extracted from untrusted student uploads, questions, or notes.
        Detects prompt-injection attempts, HTML/script tags, and adversarial manipulation.
        """
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

        # Scan for harmful patterns
        for pattern, label in cls.HARMFUL_PATTERNS:
            if pattern.search(clean_text):
                detected.append(label)

        # Risk score calculation
        risk_score = round(min(1.0, len(detected) * 0.40), 2)
        is_safe = (len(detected) == 0)
        reason = None
        if not is_safe:
            reason = f"Security guardrail intervened: Detected {', '.join(detected)}."

        return SanitizationResult(
            is_safe=is_safe,
            risk_score=risk_score,
            detected_patterns=detected,
            sanitized_text=clean_text,
            reason=reason
        )

    @classmethod
    def check_academic_scope(cls, query: str, subject_context: Optional[str] = None) -> AcademicScopeResult:
        """Academic Scope Guardrail:
        Ensures questions and custom topics submitted by students fall within
        legitimate RGPV B.Tech university curriculum (Engineering, Math, Sciences, Tech English).
        Rejects harmful exploit requests and blatantly off-topic entertainment prompts.
        """
        if not query or not query.strip():
            return AcademicScopeResult(
                is_academic=False,
                category="Empty Query",
                reason="Please provide a valid question or topic to study.",
                confidence=1.0
            )

        query_clean = query.strip()
        query_lower = query_clean.lower()

        # 1. Check harmful exploits
        for pattern, label in cls.HARMFUL_PATTERNS:
            if pattern.search(query_lower):
                return AcademicScopeResult(
                    is_academic=False,
                    category="Harmful / Safety Violation",
                    reason=f"Query rejected by Guardrail: {label}. RGPV-Agent strictly supports academic learning and engineering education.",
                    confidence=1.0
                )

        # 2. Check prompt injection
        for pattern, label in cls.INJECTION_PATTERNS:
            if pattern.search(query_lower):
                return AcademicScopeResult(
                    is_academic=False,
                    category="Adversarial Injection",
                    reason=f"Query rejected by Guardrail: {label}. Please ask a legitimate academic question.",
                    confidence=1.0
                )

        # 3. Check blatantly off-topic queries
        for pattern, label in cls.OFF_TOPIC_PATTERNS:
            if pattern.search(query_lower):
                return AcademicScopeResult(
                    is_academic=False,
                    category="Off-Topic Query",
                    reason="This query is outside the academic engineering scope of RGPV exams. Please ask engineering/curriculum questions related to your syllabus, concepts, derivations, or numericals.",
                    confidence=0.95
                )

        # 4. Check for presence of academic/engineering keywords or subject context
        words = set(re.findall(r"[a-z0-9_+-]+", query_lower))
        has_academic_keyword = bool(words & cls.ACADEMIC_KEYWORDS)
        has_subject_context = bool(subject_context and any(w in query_lower for w in re.findall(r"[a-z0-9]+", subject_context.lower())))

        # If it's a short query without any academic terms or technical phrasing
        if len(words) >= 3 and not (has_academic_keyword or has_subject_context):
            # Check for general conversational greetings
            greetings = {"hi", "hello", "hey", "who are you", "what can you do", "help"}
            if query_lower in greetings or query_clean in greetings:
                return AcademicScopeResult(
                    is_academic=True,
                    category="General Greeting",
                    reason="Greeting recognized. Ask any engineering topic to begin.",
                    confidence=0.90
                )

        return AcademicScopeResult(
            is_academic=True,
            category="Academic Engineering",
            reason="Query validated as legitimate university academic inquiry.",
            confidence=0.95
        )

    @classmethod
    def guard_student_answer(cls, answer: str, question: str, total_marks: int) -> AnswerGuardResult:
        """Student Answer Integrity Guardrail:
        - Prevents awarding marks to empty, single-word, or gibberish text.
        - Detects prompt copying (student simply pasted the question).
        - Blocks prompt injection attempts inside answer submissions.
        """
        # 1. Check prompt injection in answer
        san_res = cls.sanitize_text(answer)
        if not san_res.is_safe:
            return AnswerGuardResult(
                is_valid=False,
                flagged_issue="Adversarial Prompt Injection",
                awarded_score=0.0,
                rubrics=[
                    {
                        "id": "r-guard-sec",
                        "criterion": "Academic response integrity & absence of adversarial instructions",
                        "allocatedMarks": total_marks,
                        "awardedMarks": 0.0,
                        "fulfilled": False,
                        "examinerNote": f"Security Guardrail Intervened: {san_res.reason} Please write an authentic answer."
                    }
                ],
                verifier_shield_active=True,
                audit_notes=["Adversarial instruction detected in answer text; score locked to 0.0."]
            )

        words = [w for w in answer.strip().split() if len(w) > 0]
        word_count = len(words)

        # 2. Empty or near-empty answer
        if word_count < 4:
            return AnswerGuardResult(
                is_valid=False,
                flagged_issue="Insufficient Content",
                awarded_score=0.0,
                rubrics=[
                    {
                        "id": "r-guard-len",
                        "criterion": "Minimum response length & academic completeness",
                        "allocatedMarks": total_marks,
                        "awardedMarks": 0.0,
                        "fulfilled": False,
                        "examinerNote": "Answer is too short (< 4 words). RGPV university questions require formal definition, explanation, and examples."
                    }
                ],
                verifier_shield_active=True,
                audit_notes=["Answer length below minimum threshold (3 words); awarded 0.0."]
            )

        # 3. Gibberish / keyboard mashing detector
        cleaned_no_spaces = re.sub(r"\s+", "", answer.lower())
        has_repeated_chars = bool(re.search(r"(.)\1{5,}", cleaned_no_spaces))
        has_vowels = bool(re.search(r"[aeiou]", cleaned_no_spaces))
        consonant_blocks = bool(re.search(r"[bcdfghjklmnpqrstvwxyz]{9,}", cleaned_no_spaces))

        if has_repeated_chars or (not has_vowels and len(cleaned_no_spaces) > 8) or consonant_blocks:
            return AnswerGuardResult(
                is_valid=False,
                flagged_issue="Gibberish / Non-Academic Input",
                awarded_score=0.0,
                rubrics=[
                    {
                        "id": "r-guard-gib",
                        "criterion": "Valid written English / technical language",
                        "allocatedMarks": total_marks,
                        "awardedMarks": 0.0,
                        "fulfilled": False,
                        "examinerNote": "Detected unstructured keyboard input or gibberish. Please provide an intelligible academic answer."
                    }
                ],
                verifier_shield_active=True,
                audit_notes=["Gibberish input pattern detected; awarded 0.0."]
            )

        # 4. Question Echo / Copied Prompt Guardrail
        q_words = set(re.findall(r"[a-z0-9]+", question.lower()))
        ans_words = set(re.findall(r"[a-z0-9]+", answer.lower()))
        if len(q_words) >= 5 and len(ans_words) > 0:
            overlap = len(ans_words & q_words) / len(ans_words)
            if overlap >= 0.88 and word_count <= len(q_words) + 5:
                return AnswerGuardResult(
                    is_valid=False,
                    flagged_issue="Copied Question Prompt",
                    awarded_score=0.0,
                    rubrics=[
                        {
                            "id": "r-guard-echo",
                            "criterion": "Original student explanation vs copied prompt",
                            "allocatedMarks": total_marks,
                            "awardedMarks": 0.0,
                            "fulfilled": False,
                            "examinerNote": "The submitted text merely copies the exam question without providing an actual answer or explanation."
                        }
                    ],
                    verifier_shield_active=True,
                    audit_notes=["Question echo detected (88%+ overlap with no distinct answer); awarded 0.0."]
                )

        return AnswerGuardResult(is_valid=True, awarded_score=0.0)

    @classmethod
    def verify_and_clamp_evaluation(
        cls,
        raw_score: float,
        total_marks: int,
        rubrics: List[Dict[str, Any]]
    ) -> Tuple[float, List[Dict[str, Any]], bool, List[str]]:
        """Verifier Shield Guardrail:
        - Strictly bounds overall score to [0.0, total_marks].
        - Ensures individual rubric criterion awardedMarks <= allocatedMarks.
        - Ensures sum of rubric awardedMarks matches the total score (self-consistency check).
        """
        audit_notes: List[str] = []
        validated_rubrics: List[Dict[str, Any]] = []
        rubric_sum = 0.0

        for r in rubrics:
            r_copy = dict(r)
            alloc = float(r_copy.get("allocatedMarks", 0.0))
            awarded = float(r_copy.get("awardedMarks", 0.0))

            # Clamp criterion awardedMarks between 0 and alloc
            if awarded < 0.0:
                audit_notes.append(f"Negative marks on criterion '{r_copy.get('id')}' clamped to 0.0.")
                awarded = 0.0
            elif awarded > alloc:
                audit_notes.append(f"Awarded marks ({awarded}) exceeded allocated ({alloc}) on '{r_copy.get('id')}'; clamped.")
                awarded = alloc

            r_copy["awardedMarks"] = round(awarded, 1)
            r_copy["allocatedMarks"] = round(alloc, 1)
            r_copy["fulfilled"] = (r_copy["awardedMarks"] >= 0.8 * r_copy["allocatedMarks"])
            rubric_sum += r_copy["awardedMarks"]
            validated_rubrics.append(r_copy)

        # Invariant: Score must equal sum of rubrics and lie in [0.0, total_marks]
        max_m = float(total_marks)
        final_score = round(max(0.0, min(max_m, rubric_sum)), 1)

        if abs(final_score - float(raw_score)) > 0.5:
            audit_notes.append(f"Overall score adjusted from {raw_score} to {final_score} to maintain rubric self-consistency.")

        return final_score, validated_rubrics, True, audit_notes

    @classmethod
    def compute_grading_confidence(
        cls,
        final_score: float,
        total_marks: int,
        student_answer: str,
        rubrics: List[Dict[str, Any]]
    ) -> Tuple[float, bool, Optional[str]]:
        """Calculates deterministic confidence score [0.0 - 1.0] and determines if instructor review is required.
        - Low confidence triggers when student answer is borderline, highly dispersed across rubrics, or too short.
        - High confidence indicates definitive mastery or clearly established deficiency.
        """
        words = len(student_answer.strip().split())
        score_ratio = final_score / max(1.0, float(total_marks))

        # Base confidence starts high for well-calibrated rubric sets
        confidence = 0.94

        # 1. Answer length factor
        if words < 20:
            confidence -= 0.18
        elif words > 450:
            confidence -= 0.05

        # 2. Borderline score factor (35% to 52% is standard RGPV pass/fail boundary)
        is_borderline = (0.35 <= score_ratio <= 0.52)
        if is_borderline:
            confidence -= 0.15

        # 3. Rubric fulfillment consistency
        fulfilled_count = sum(1 for r in rubrics if r.get("fulfilled", False))
        total_rubrics = max(1, len(rubrics))
        fulfillment_ratio = fulfilled_count / total_rubrics

        # If overall score is high but few rubrics fulfilled, or vice versa, confidence drops
        if abs(score_ratio - fulfillment_ratio) > 0.35:
            confidence -= 0.12

        confidence = round(max(0.40, min(0.99, confidence)), 2)

        needs_human_review = (confidence < 0.75) or (is_borderline and words >= 25)
        review_reason = None
        if needs_human_review:
            if is_borderline:
                review_reason = f"Borderline exam score ({round(score_ratio * 100)}%) near RGPV pass/fail threshold. Instructor verification recommended."
            elif confidence < 0.75:
                review_reason = f"Automated grading confidence is {int(confidence * 100)}%. Subject-matter instructor review flagged."
            else:
                review_reason = "Answer flagged for human verification."

        return confidence, needs_human_review, review_reason


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
