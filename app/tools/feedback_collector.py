"""User Feedback Subsystem for RGPV-Agent.
Collects and aggregates student/educator feedback on generated explanations,
model answers, and grading accuracy to continuously improve prompts and evaluation datasets.
"""

import json
import os
import threading
import time
import uuid
from typing import Dict, Any, List, Optional
from dataclasses import dataclass, asdict
from pydantic import BaseModel, Field

from app.tools.observability import ObservabilityTracker, LOGS_DIR

FEEDBACK_FILE = os.path.join(LOGS_DIR, "user_feedback.jsonl")


class FeedbackInput(BaseModel):
    run_id: Optional[str] = None
    phase: str = "exam_room"  # "exam_room", "topic_learning", "curriculum"
    subject_code: Optional[str] = None
    topic_title: Optional[str] = None
    helpful: Optional[bool] = None  # "Was this explanation helpful?"
    grade_fair: Optional[bool] = None  # "Was the grade fair?"
    citation_accurate: Optional[bool] = None  # "Was any citation incorrect?" (True=accurate, False=incorrect)
    citation_error_details: Optional[str] = None
    topic_missing: Optional[bool] = None  # "Was a topic missing?"
    missing_topic_details: Optional[str] = None
    flagged: bool = False  # "Should this material be flagged?"
    flag_reason: Optional[str] = None
    user_suggested_score: Optional[float] = None
    comment: Optional[str] = None


@dataclass
class FeedbackRecord:
    feedback_id: str
    run_id: Optional[str]
    phase: str
    subject_code: Optional[str]
    topic_title: Optional[str]
    helpful: Optional[bool]
    grade_fair: Optional[bool]
    citation_accurate: Optional[bool]
    citation_error_details: Optional[str]
    topic_missing: Optional[bool]
    missing_topic_details: Optional[str]
    flagged: bool
    flag_reason: Optional[str]
    user_suggested_score: Optional[float]
    comment: Optional[str]
    timestamp: float = 0.0

    def __post_init__(self):
        if not self.timestamp:
            self.timestamp = time.time()


class FeedbackCollector:
    _lock = threading.Lock()
    _submissions: List[Dict[str, Any]] = []

    @classmethod
    def record_feedback(cls, inp: FeedbackInput) -> Dict[str, Any]:
        """Ingests, persists, and links user feedback to observability."""
        feedback_id = f"fb_{uuid.uuid4().hex[:8]}"
        record = FeedbackRecord(
            feedback_id=feedback_id,
            run_id=inp.run_id,
            phase=inp.phase,
            subject_code=inp.subject_code,
            topic_title=inp.topic_title,
            helpful=inp.helpful,
            grade_fair=inp.grade_fair,
            citation_accurate=inp.citation_accurate,
            citation_error_details=inp.citation_error_details,
            topic_missing=inp.topic_missing,
            missing_topic_details=inp.missing_topic_details,
            flagged=inp.flagged,
            flag_reason=inp.flag_reason,
            user_suggested_score=inp.user_suggested_score,
            comment=inp.comment
        )
        data = asdict(record)

        # If user disputed the grade or suggested a score, update observability corrections
        if inp.grade_fair is False or inp.user_suggested_score is not None:
            ObservabilityTracker.record_user_correction()

        os.makedirs(LOGS_DIR, exist_ok=True)
        with cls._lock:
            cls._submissions.append(data)
            if len(cls._submissions) > 1000:
                cls._submissions.pop(0)

            # Append to persistent JSONL
            try:
                with open(FEEDBACK_FILE, "a", encoding="utf-8") as f:
                    f.write(json.dumps(data) + "\n")
            except Exception:
                pass

        return data

    @classmethod
    def get_feedback_summary(cls, limit: int = 50) -> Dict[str, Any]:
        """Calculates aggregate feedback satisfaction percentages."""
        with cls._lock:
            subs = list(cls._submissions)

        total = len(subs)
        if total == 0:
            return {
                "total_feedback": 0,
                "helpful_rate_pct": 100.0,
                "fair_grade_rate_pct": 100.0,
                "citation_accuracy_rate_pct": 100.0,
                "missing_topics_count": 0,
                "flagged_count": 0,
                "recent_submissions": []
            }

        helpful_responses = [s["helpful"] for s in subs if s.get("helpful") is not None]
        helpful_rate = (
            round((sum(1 for h in helpful_responses if h) / len(helpful_responses)) * 100, 1)
            if helpful_responses
            else 100.0
        )

        grade_fair_responses = [s["grade_fair"] for s in subs if s.get("grade_fair") is not None]
        grade_fair_rate = (
            round((sum(1 for g in grade_fair_responses if g) / len(grade_fair_responses)) * 100, 1)
            if grade_fair_responses
            else 100.0
        )

        citation_responses = [s["citation_accurate"] for s in subs if s.get("citation_accurate") is not None]
        citation_rate = (
            round((sum(1 for c in citation_responses if c) / len(citation_responses)) * 100, 1)
            if citation_responses
            else 100.0
        )

        missing_topics_count = sum(1 for s in subs if s.get("topic_missing"))
        flagged_count = sum(1 for s in subs if s.get("flagged"))

        return {
            "total_feedback": total,
            "helpful_rate_pct": helpful_rate,
            "fair_grade_rate_pct": grade_fair_rate,
            "citation_accuracy_rate_pct": citation_rate,
            "missing_topics_count": missing_topics_count,
            "flagged_count": flagged_count,
            "recent_submissions": list(reversed(subs[-limit:]))
        }
