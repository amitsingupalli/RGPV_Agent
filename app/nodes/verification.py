from typing import Optional
from pydantic import BaseModel, Field
from app.graph.state import AgentState
from app.nodes.evaluation import QuizEvaluationReport, QuestionEvaluation


class VerifiedQuestionAudit(BaseModel):
    question_id: str
    verified_score: float
    is_score_consistent: bool
    requires_human_review: bool
    audit_notes: str


class EvaluationVerificationReport(BaseModel):
    is_valid: bool
    verified_total_score: float
    verification_confidence: float = Field(ge=0.0, le=1.0)
    requires_human_appeal: bool
    question_audits: list[VerifiedQuestionAudit]
    verification_summary: str


class EvaluationVerifierEngine:
    """Secondary verification agent ensuring grading consistency and flagging doubtful assessments."""

    @classmethod
    def verify(cls, evaluation_report: QuizEvaluationReport) -> EvaluationVerificationReport:
        audits: list[VerifiedQuestionAudit] = []
        verified_total = 0.0
        doubtful_count = 0

        for q_eval in evaluation_report.question_evaluations:
            score = q_eval.awarded_score
            max_m = q_eval.max_marks
            conf = q_eval.evaluator_confidence

            # Invariant 1: Score must not exceed max marks or be negative
            is_bounded = (0.0 <= score <= float(max_m))
            adjusted_score = min(float(max_m), max(0.0, score))

            # Invariant 2: Low confidence or borderlines require human confirmation
            needs_review = (conf < 0.75) or (len(q_eval.misconceptions) > 0 and score > 0.5 * max_m)
            if needs_review:
                doubtful_count += 1

            notes = []
            if not is_bounded:
                notes.append(f"Score was out of bounds ({score} vs {max_m}); clamped.")
            if conf < 0.75:
                notes.append(f"Confidence is low ({conf}): student phrasing was ambiguous.")
            if q_eval.misconceptions:
                notes.append(f"Misconception identified: {q_eval.misconceptions[0]}")
            if not notes:
                notes.append("Rubric alignment verified cleanly.")

            verified_total += adjusted_score
            audits.append(
                VerifiedQuestionAudit(
                    question_id=q_eval.question_id,
                    verified_score=adjusted_score,
                    is_score_consistent=is_bounded,
                    requires_human_review=needs_review,
                    audit_notes=" | ".join(notes)
                )
            )

        overall_conf = max(0.50, min(1.0, evaluation_report.overall_confidence - (0.05 * doubtful_count)))
        human_appeal = (doubtful_count > 0 or overall_conf < 0.75)

        summary = (
            "Verification passed with high confidence."
            if not human_appeal
            else f"Verification completed with reservations: {doubtful_count} question(s) flagged for optional student review."
        )

        return EvaluationVerificationReport(
            is_valid=True,
            verified_total_score=round(verified_total, 2),
            verification_confidence=round(overall_conf, 2),
            requires_human_appeal=human_appeal,
            question_audits=audits,
            verification_summary=summary
        )


def verify_evaluation_node(state: AgentState) -> dict:
    """LangGraph node: audits quiz evaluation and calculates confidence."""
    raw_eval = state.get("evaluation", {})
    eval_report = QuizEvaluationReport(**raw_eval)

    verification = EvaluationVerifierEngine.verify(eval_report)

    # If verification adjusted the score or confirmed confidence
    raw_eval["verified_score"] = verification.verified_total_score
    raw_eval["verification_confidence"] = verification.verification_confidence
    raw_eval["requires_appeal"] = verification.requires_human_appeal

    next_act = "human_review_grading" if verification.requires_human_appeal else "update_mastery"

    return {
        "evaluation": raw_eval,
        "next_action": next_act
    }
