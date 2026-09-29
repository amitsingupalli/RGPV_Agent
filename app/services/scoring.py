from dataclasses import dataclass
from typing import Optional


@dataclass
class TopicPriorityResult:
    topic_id: str
    title: str
    unit_number: int
    frequency_score: float  # F_i [0.0, 1.0]
    difficulty_score: float  # D_i [0.0, 1.0]
    syllabus_importance: float  # S_i [0.0, 1.0]
    mastery_score: float  # M_i [0.0, 1.0]
    priority_score: float  # P_i [0.0, 1.0]
    rank: int
    justification: list[str]


class TopicPriorityEngine:
    """Deterministic topic priority scoring engine.
    
    Formula:
        P_i = 0.35 * F_i + 0.20 * D_i + 0.25 * S_i + 0.20 * (1 - M_i)
    """

    WEIGHT_FREQUENCY = 0.35
    WEIGHT_DIFFICULTY = 0.20
    WEIGHT_SYLLABUS = 0.25
    WEIGHT_MASTERY_DEFICIT = 0.20

    @classmethod
    def calculate_priority(
        cls,
        frequency_score: float,
        difficulty_score: float,
        syllabus_importance: float,
        mastery_score: float
    ) -> float:
        # Clamp inputs to [0.0, 1.0]
        f = max(0.0, min(1.0, frequency_score))
        d = max(0.0, min(1.0, difficulty_score))
        s = max(0.0, min(1.0, syllabus_importance))
        m = max(0.0, min(1.0, mastery_score))

        score = (
            cls.WEIGHT_FREQUENCY * f +
            cls.WEIGHT_DIFFICULTY * d +
            cls.WEIGHT_SYLLABUS * s +
            cls.WEIGHT_MASTERY_DEFICIT * (1.0 - m)
        )
        return round(score, 4)

    @classmethod
    def rank_topics(
        cls,
        topics: list[dict],
        topic_stats_map: Optional[dict[str, dict]] = None,
        mastery_map: Optional[dict[str, float]] = None
    ) -> list[TopicPriorityResult]:
        topic_stats_map = topic_stats_map or {}
        mastery_map = mastery_map or {}

        scored: list[TopicPriorityResult] = []

        for t in topics:
            t_id = t.get("id") or t.get("topic_id")
            title = t.get("title", "")
            unit_no = t.get("unit_number", 1)

            # Extract statistical metrics
            stats = topic_stats_map.get(t_id, {})
            f_score = float(stats.get("normalized_frequency", t.get("normalized_frequency", 0.0)))
            d_score = float(stats.get("avg_difficulty", t.get("difficulty_score", 0.5)))
            s_score = float(t.get("syllabus_weight", 1.0))
            # Normalize syllabus weight to [0.0, 1.0]
            s_norm = min(1.0, s_score if s_score <= 1.0 else s_score / 2.0)
            m_score = float(mastery_map.get(t_id, t.get("mastery_score", 0.10)))

            p_score = cls.calculate_priority(
                frequency_score=f_score,
                difficulty_score=d_score,
                syllabus_importance=s_norm,
                mastery_score=m_score
            )

            # Generate explainability bullets
            justifications = cls._build_justification(
                f_score=f_score,
                d_score=d_score,
                s_score=s_norm,
                m_score=m_score,
                question_count=stats.get("question_count", 0),
                total_marks=stats.get("total_marks", 0)
            )

            scored.append(
                TopicPriorityResult(
                    topic_id=t_id,
                    title=title,
                    unit_number=unit_no,
                    frequency_score=f_score,
                    difficulty_score=d_score,
                    syllabus_importance=s_norm,
                    mastery_score=m_score,
                    priority_score=p_score,
                    rank=0,  # Assigned after sorting
                    justification=justifications
                )
            )

        # Sort descending by priority score
        scored.sort(key=lambda x: x.priority_score, reverse=True)
        for i, item in enumerate(scored, 1):
            item.rank = i

        return scored

    @staticmethod
    def _build_justification(
        f_score: float,
        d_score: float,
        s_score: float,
        m_score: float,
        question_count: int,
        total_marks: int
    ) -> list[str]:
        bullets = []
        if question_count > 0:
            bullets.append(f"High historical frequency: appeared {question_count} times ({total_marks} marks total in past papers).")
        else:
            bullets.append("Core syllabus theory topic with low historical frequency.")

        if d_score >= 0.70:
            bullets.append(f"High cognitive difficulty ({int(d_score * 100)}%): requires rigorous worked examples and algorithm tracing.")
        elif d_score <= 0.40:
            bullets.append("Fundamental conceptual topic with straightforward definitions.")

        if m_score <= 0.25:
            bullets.append(f"Current student mastery is critically low ({int(m_score * 100)}%): high preparation deficit.")
        elif m_score >= 0.75:
            bullets.append(f"Student has already demonstrated solid mastery ({int(m_score * 100)}%).")

        return bullets
