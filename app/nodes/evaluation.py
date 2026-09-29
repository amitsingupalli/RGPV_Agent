import re
from typing import Optional
from pydantic import BaseModel, Field
from app.graph.state import AgentState
from app.nodes.quiz import QuizQuestionItem


class QuestionEvaluation(BaseModel):
    question_id: str
    max_marks: int
    awarded_score: float
    fulfilled_criteria: list[str] = Field(description="Rubric points successfully satisfied")
    missing_criteria: list[str] = Field(description="Rubric points not addressed or incorrect")
    misconceptions: list[str] = Field(description="Detected misunderstandings or false claims")
    evaluator_confidence: float = Field(ge=0.0, le=1.0)
    source_refs: list[str]


class QuizEvaluationReport(BaseModel):
    quiz_id: Optional[str] = None
    total_marks: int
    total_score: float
    percentage: float
    question_evaluations: list[QuestionEvaluation]
    overall_confidence: float
    needs_remediation: bool


class RubricEvaluatorEngine:
    """Evaluates student answers strictly against rubric points, rejecting unsupported claims."""

    @classmethod
    def evaluate_submission(
        cls,
        quiz_questions: list[dict],
        student_answers: list[dict]
    ) -> QuizEvaluationReport:
        answers_map = {a.get("question_id"): a.get("answer_text", "") for a in student_answers}
        evaluations: list[QuestionEvaluation] = []

        total_marks = 0
        total_score = 0.0

        for q_dict in quiz_questions:
            q_id = q_dict.get("question_id", "")
            q_marks = q_dict.get("marks", 5)
            rubric_raw = q_dict.get("rubric", [])
            source_refs = q_dict.get("source_refs", [])
            expected_points = q_dict.get("expected_answer_points", [])

            student_ans = answers_map.get(q_id, "").strip()
            total_marks += q_marks

            if not student_ans:
                evaluations.append(
                    QuestionEvaluation(
                        question_id=q_id,
                        max_marks=q_marks,
                        awarded_score=0.0,
                        fulfilled_criteria=[],
                        missing_criteria=[r.get("criterion", "") for r in rubric_raw],
                        misconceptions=["No answer provided."],
                        evaluator_confidence=1.0,
                        source_refs=source_refs
                    )
                )
                continue

            # Deterministic keyword & semantic evaluation against rubric points
            fulfilled = []
            missing = []
            score_earned = 0.0
            ans_lower = student_ans.lower()
            ans_words = set(re.findall(r"\b[a-z]{3,}\b", ans_lower))

            for r in rubric_raw:
                crit = r.get("criterion", "")
                weight = float(r.get("weight", 1.0))

                crit_words = set(re.findall(r"\b[a-z]{3,}\b", crit.lower()))
                # Ignore common filler words
                crit_words = {w for w in crit_words if w not in {"defines", "clearly", "states", "explains", "provides", "with", "and", "the", "for"}}

                overlap = crit_words.intersection(ans_words)
                ratio = len(overlap) / max(1, len(crit_words))

                # Also check direct phrase or key terms
                phrase_found = any(cw in ans_lower for cw in crit_words)

                if ratio >= 0.40 or (len(overlap) >= 2 and phrase_found):
                    fulfilled.append(crit)
                    score_earned += weight
                else:
                    missing.append(crit)

            # Detect potential misconceptions
            misconceptions = []
            if "bcnf" in ans_lower and "dependency preserving" in ans_lower:
                if "always" in ans_lower:
                    misconceptions.append("Claimed BCNF is always dependency preserving (BCNF can lose dependencies).")
            if "2nf" in ans_lower and "transitive" in ans_lower:
                misconceptions.append("Confused transitive dependency with 2NF (transitive dependency belongs to 3NF).")

            # Score capping and confidence calculation
            final_q_score = round(min(float(q_marks), score_earned), 2)
            total_score += final_q_score

            confidence = 0.90 if len(student_ans.split()) > 10 else 0.70
            if misconceptions:
                confidence = max(0.60, confidence - 0.15)

            evaluations.append(
                QuestionEvaluation(
                    question_id=q_id,
                    max_marks=q_marks,
                    awarded_score=final_q_score,
                    fulfilled_criteria=fulfilled,
                    missing_criteria=missing,
                    misconceptions=misconceptions,
                    evaluator_confidence=round(confidence, 2),
                    source_refs=source_refs
                )
            )

        pct = round((total_score / max(1, total_marks)) * 100, 2)
        avg_conf = (
            sum(e.evaluator_confidence for e in evaluations) / len(evaluations)
            if evaluations else 1.0
        )
        needs_remed = (pct < 50.0)

        return QuizEvaluationReport(
            total_marks=total_marks,
            total_score=total_score,
            percentage=pct,
            question_evaluations=evaluations,
            overall_confidence=round(avg_conf, 2),
            needs_remediation=needs_remed
        )


def evaluate_answers_node(state: AgentState) -> dict:
    """LangGraph node: evaluates student answers against quiz rubric."""
    quiz_questions = state.get("quiz", [])
    student_answers = state.get("student_answers", [])

    report = RubricEvaluatorEngine.evaluate_submission(
        quiz_questions=quiz_questions,
        student_answers=student_answers
    )

    return {
        "evaluation": report.model_dump(),
        "next_action": "verify_evaluation"
    }
