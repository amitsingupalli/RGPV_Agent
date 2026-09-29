from dataclasses import dataclass
from typing import Optional


@dataclass
class MasteryUpdateResult:
    topic_id: str
    previous_mastery: float
    new_mastery: float
    delta: float
    score_ratio: float
    confidence: float
    repeated_error: bool
    is_mastered: bool  # >= 0.85
    needs_remediation: bool  # < 0.50
    next_revision_days: Optional[int]


class MasteryEngine:
    """Adaptive student mastery and spaced revision engine."""

    MASTERY_THRESHOLD = 0.85
    REMEDIATION_THRESHOLD = 0.50

    # Spaced intervals in days
    SPACED_INTERVALS = [1, 3, 7, 14]

    @classmethod
    def calculate_new_mastery(
        cls,
        topic_id: str,
        previous_mastery: float,
        score_earned: float,
        max_marks: float,
        confidence: float,
        repeated_error: bool = False,
        current_step: int = 0
    ) -> MasteryUpdateResult:
        score_ratio = score_earned / max(1.0, max_marks)
        score_ratio = max(0.0, min(1.0, score_ratio))
        conf = max(0.0, min(1.0, confidence))

        # Core formula: adjustment = 0.20 * score_ratio * confidence - (0.08 if repeated else 0)
        adjustment = 0.20 * score_ratio * conf
        if repeated_error:
            adjustment -= 0.08

        new_mastery = round(max(0.0, min(1.0, previous_mastery + adjustment)), 4)
        delta = round(new_mastery - previous_mastery, 4)

        is_mastered = (new_mastery >= cls.MASTERY_THRESHOLD)
        needs_remediation = (new_mastery < cls.REMEDIATION_THRESHOLD)

        # Calculate next spaced interval
        next_days: Optional[int] = None
        if not needs_remediation:
            step_idx = min(len(cls.SPACED_INTERVALS) - 1, current_step)
            next_days = cls.SPACED_INTERVALS[step_idx]

        return MasteryUpdateResult(
            topic_id=topic_id,
            previous_mastery=previous_mastery,
            new_mastery=new_mastery,
            delta=delta,
            score_ratio=round(score_ratio, 2),
            confidence=round(conf, 2),
            repeated_error=repeated_error,
            is_mastered=is_mastered,
            needs_remediation=needs_remediation,
            next_revision_days=next_days
        )
