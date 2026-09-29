import re
from typing import Optional
from pydantic import BaseModel, Field


class QuestionExtract(BaseModel):
    id: str
    paper: str
    year: int
    question_no: str
    text: str
    marks: int = 7
    question_type: str = "theory"
    difficulty: float = 0.5
    source_ref: str


class QuestionMappingResult(BaseModel):
    question_id: str
    topic_id: Optional[str] = None
    confidence: float = Field(ge=0.0, le=1.0)
    matched_subtopic: Optional[str] = None
    rationale: str
    is_ambiguous: bool = False


class QuestionParserEngine:
    """Extracts individual exam questions from previous-year question papers."""

    QUESTION_PATTERN = re.compile(
        r"^(?:Q(?:uestion)?\.?\s*(\d+)[\.\s]*\(([a-d])\)|(\d+)[\.\s]*\(([a-d])\)|Q(?:uestion)?\.?\s*(\d+)[\.\s]+|(\d+)\.\s+)",
        re.IGNORECASE
    )
    MARKS_PATTERN = re.compile(r"\[(\d+)\s*(?:Marks|M)?\]|\((\d+)\s*(?:Marks|M)?\)|(\d+)\s*Marks", re.IGNORECASE)

    @classmethod
    def parse_paper_text(
        cls,
        text: str,
        paper_name: str,
        year: int,
        doc_id: str,
        page_number: int = 1
    ) -> list[QuestionExtract]:
        lines = text.split("\n")
        extracted: list[QuestionExtract] = []
        current_q_no = ""
        current_lines: list[str] = []
        q_count = 1

        for line in lines:
            line_str = line.strip()
            if not line_str:
                continue

            match = cls.QUESTION_PATTERN.match(line_str)
            if match:
                # Flush previous question only if we had an active question number
                if current_q_no and current_lines:
                    full_q_text = " ".join(current_lines).strip()
                    marks = cls._extract_marks(full_q_text)
                    clean_no = current_q_no.replace(" ", "_").replace("(", "").replace(")", "")
                    q_id = f"q_{year}_{clean_no or q_count}"
                    extracted.append(
                        QuestionExtract(
                            id=q_id,
                            paper=paper_name,
                            year=year,
                            question_no=current_q_no,
                            text=full_q_text,
                            marks=marks,
                            question_type=cls._infer_type(full_q_text),
                            difficulty=cls._estimate_difficulty(full_q_text, marks),
                            source_ref=f"{doc_id}:p{page_number}"
                        )
                    )
                    q_count += 1
                
                # Discard pre-question header lines
                current_lines = []

                # Format question number e.g. "1(a)"
                groups = match.groups()
                if groups[0] and groups[1]:
                    current_q_no = f"{groups[0]}({groups[1]})"
                elif groups[2] and groups[3]:
                    current_q_no = f"{groups[2]}({groups[3]})"
                elif groups[4]:
                    current_q_no = f"{groups[4]}"
                elif groups[5]:
                    current_q_no = f"{groups[5]}"
                else:
                    current_q_no = f"Q{q_count}"

                remaining = line_str[match.end():].strip()
                if remaining:
                    current_lines.append(remaining)
                continue

            current_lines.append(line_str)

        # Flush final question
        if current_q_no and current_lines:
            full_q_text = " ".join(current_lines).strip()
            marks = cls._extract_marks(full_q_text)
            clean_no = current_q_no.replace(" ", "_").replace("(", "").replace(")", "")
            q_id = f"q_{year}_{clean_no or q_count}"
            extracted.append(
                QuestionExtract(
                    id=q_id,
                    paper=paper_name,
                    year=year,
                    question_no=current_q_no,
                    text=full_q_text,
                    marks=marks,
                    question_type=cls._infer_type(full_q_text),
                    difficulty=cls._estimate_difficulty(full_q_text, marks),
                    source_ref=f"{doc_id}:p{page_number}"
                )
            )

        return extracted

    @classmethod
    def _extract_marks(cls, text: str) -> int:
        match = cls.MARKS_PATTERN.search(text)
        if match:
            for g in match.groups():
                if g and g.isdigit():
                    m = int(g)
                    if 1 <= m <= 20:
                        return m
        return 7

    @staticmethod
    def _infer_type(text: str) -> str:
        lower = text.lower()
        if "sql" in lower or "write query" in lower or "select" in lower:
            return "coding"
        if "calculate" in lower or "find closure" in lower or "construct" in lower or "order" in lower:
            return "numerical"
        if "er diagram" in lower or "draw" in lower or "schema" in lower:
            return "design"
        return "theory"

    @staticmethod
    def _estimate_difficulty(text: str, marks: int) -> float:
        base = 0.4 if marks <= 5 else (0.6 if marks <= 7 else 0.75)
        lower = text.lower()
        if any(w in lower for w in ["prove", "bcnfc", "b+ tree", "serializability", "lossless", "concurrency"]):
            base += 0.1
        return round(min(1.0, max(0.2, base)), 2)


class QuestionClassifier:
    """Classifies exam questions against syllabus topics using deterministic semantic keyword matching."""

    @classmethod
    def classify_question(
        cls,
        question: QuestionExtract,
        topics: list[dict]
    ) -> QuestionMappingResult:
        q_text = question.text.lower()
        best_topic_id: Optional[str] = None
        best_score = 0.0
        best_matched_term = ""

        q_words = set(re.findall(r"\b[a-z]{3,}\b", q_text))

        for topic in topics:
            topic_id = topic.get("id") or topic.get("topic_id")
            title = topic.get("title", "").lower()
            subtopics = [s.lower() for s in topic.get("subtopics", [])]

            score = 0.0
            matched_term = ""

            t_words = set(re.findall(r"\b[a-z]{3,}\b", title))
            overlap = q_words.intersection(t_words)
            if overlap:
                score += len(overlap) * 0.35
                matched_term = list(overlap)[0]

            for st in subtopics:
                st_words = set(re.findall(r"\b[a-z]{3,}\b", st))
                st_overlap = q_words.intersection(st_words)
                if st_overlap:
                    score += len(st_overlap) * 0.25
                    if not matched_term:
                        matched_term = list(st_overlap)[0]
                if st in q_text:
                    score += 0.4
                    matched_term = st

            if score > best_score:
                best_score = score
                best_topic_id = topic_id
                best_matched_term = matched_term

        confidence = round(min(1.0, best_score / 1.5), 2)
        if confidence < 0.45:
            return QuestionMappingResult(
                question_id=question.id,
                topic_id=None,
                confidence=confidence,
                rationale="No strong match found in syllabus topics; requires human review.",
                is_ambiguous=True
            )

        return QuestionMappingResult(
            question_id=question.id,
            topic_id=best_topic_id,
            confidence=confidence,
            matched_subtopic=best_matched_term,
            rationale=f"Matched keywords '{best_matched_term}' with topic {best_topic_id}",
            is_ambiguous=(confidence < 0.70)
        )
