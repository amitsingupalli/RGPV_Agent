from typing import Optional
from pydantic import BaseModel, Field
from app.nodes.questions import QuestionExtract, QuestionMappingResult


class TopicStat(BaseModel):
    topic_id: str
    title: str
    unit_number: int
    question_count: int = 0
    total_marks: int = 0
    avg_difficulty: float = 0.5
    normalized_frequency: float = 0.0  # F_i in [0.0, 1.0]
    has_appeared_recently: bool = False  # e.g. in last 2 years


class DocumentAnalysisReport(BaseModel):
    total_questions: int
    mapped_count: int
    unmapped_count: int
    ambiguous_count: int
    topic_stats: list[TopicStat]
    ambiguous_mappings: list[QuestionMappingResult]
    validation_status: str  # "passed", "requires_review", "failed"
    warnings: list[str] = Field(default_factory=list)


class DocumentAnalysisEngine:
    """Analyzes syllabus coverage, question frequency, and flags ambiguous mappings."""

    @classmethod
    def analyze(
        cls,
        topics: list[dict],
        questions: list[QuestionExtract],
        mappings: list[QuestionMappingResult]
    ) -> DocumentAnalysisReport:
        mapping_by_qid = {m.question_id: m for m in mappings}
        question_by_id = {q.id: q for q in questions}

        # Initialize topic stat dict
        stats_map: dict[str, dict] = {}
        for t in topics:
            t_id = t.get("id") or t.get("topic_id")
            stats_map[t_id] = {
                "topic_id": t_id,
                "title": t.get("title", ""),
                "unit_number": t.get("unit_number", 1),
                "question_count": 0,
                "total_marks": 0,
                "difficulties": [],
                "recent_years": set()
            }

        unmapped = 0
        ambiguous = []

        for q in questions:
            m = mapping_by_qid.get(q.id)
            if not m or not m.topic_id or m.topic_id not in stats_map:
                unmapped += 1
                if m:
                    ambiguous.append(m)
                continue

            if m.is_ambiguous:
                ambiguous.append(m)

            t_stat = stats_map[m.topic_id]
            t_stat["question_count"] += 1
            t_stat["total_marks"] += q.marks
            t_stat["difficulties"].append(q.difficulty)
            t_stat["recent_years"].add(q.year)

        # Max frequency for normalization
        max_freq = max([s["question_count"] for s in stats_map.values()], default=1)
        max_freq = max(1, max_freq)

        topic_stats: list[TopicStat] = []
        for t_id, s in stats_map.items():
            avg_diff = (
                sum(s["difficulties"]) / len(s["difficulties"])
                if s["difficulties"]
                else 0.5
            )
            has_recent = any(y >= 2023 for y in s["recent_years"])
            topic_stats.append(
                TopicStat(
                    topic_id=t_id,
                    title=s["title"],
                    unit_number=s["unit_number"],
                    question_count=s["question_count"],
                    total_marks=s["total_marks"],
                    avg_difficulty=round(avg_diff, 2),
                    normalized_frequency=round(s["question_count"] / max_freq, 4),
                    has_appeared_recently=has_recent
                )
            )

        # Warnings and status
        warnings = []
        if unmapped > 0:
            warnings.append(f"{unmapped} questions could not be automatically mapped to syllabus topics.")
        if len(ambiguous) > 0:
            warnings.append(f"{len(ambiguous)} question mappings have low confidence and require confirmation.")

        status = "passed"
        if unmapped > 0 or len(ambiguous) > 3:
            status = "requires_review"

        return DocumentAnalysisReport(
            total_questions=len(questions),
            mapped_count=len(questions) - unmapped,
            unmapped_count=unmapped,
            ambiguous_count=len(ambiguous),
            topic_stats=topic_stats,
            ambiguous_mappings=ambiguous,
            validation_status=status,
            warnings=warnings
        )

    @classmethod
    def apply_manual_override(
        cls,
        mappings: list[QuestionMappingResult],
        question_id: str,
        correct_topic_id: str,
        notes: str = "User manual correction"
    ) -> list[QuestionMappingResult]:
        """Allows the student to correct an ambiguous or incorrect topic mapping."""
        updated = []
        for m in mappings:
            if m.question_id == question_id:
                updated.append(
                    QuestionMappingResult(
                        question_id=m.question_id,
                        topic_id=correct_topic_id,
                        confidence=1.0,
                        matched_subtopic="Manual Override",
                        rationale=notes,
                        is_ambiguous=False
                    )
                )
            else:
                updated.append(m)
        return updated
