from typing import Optional
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from app.api.auth import get_current_user
from app.nodes.teaching import TeachingEngine
from app.nodes.quiz import QuizGeneratorEngine, TopicQuiz
from app.nodes.evaluation import RubricEvaluatorEngine, QuizEvaluationReport
from app.nodes.verification import EvaluationVerifierEngine, EvaluationVerificationReport
from app.services.mastery import MasteryEngine
from app.api.documents import SYLLABUS_STORE, get_extracted_syllabus

router = APIRouter(prefix="/quizzes", tags=["Interactive Quizzes & Teaching"])

ACTIVE_QUIZZES: dict[str, TopicQuiz] = {}
MASTERY_STORE: dict[str, dict[str, float]] = {}  # user_id -> {topic_id: score}


class SubmitAnswerItem(BaseModel):
    question_id: str
    answer_text: str


class QuizSubmissionRequest(BaseModel):
    topic_id: str
    answers: list[SubmitAnswerItem]


@router.get("/topic/{topic_id}")
async def get_topic_study_material_and_quiz(
    topic_id: str,
    subject_id: str = "dbms_cs403",
    language: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Retrieves 7-part pedagogical explanation and active recall quiz for a topic."""
    if subject_id not in SYLLABUS_STORE:
        await get_extracted_syllabus(subject_id, current_user)

    syl = SYLLABUS_STORE[subject_id]
    all_topics = [t for u in syl.units for t in u.topics]
    topic = next((t for t in all_topics if t.id == topic_id), None)
    if not topic:
        topic_dict = {"id": topic_id, "title": topic_id.replace("_", " ").title()}
    else:
        topic_dict = topic.model_dump()

    pref_lang = language or current_user.get("preferred_language", "english")
    explanation = TeachingEngine.generate_explanation(
        topic=topic_dict,
        evidence=[],
        language=pref_lang
    )

    quiz = QuizGeneratorEngine.generate_quiz_for_topic(topic_dict)
    ACTIVE_QUIZZES[quiz.quiz_id] = quiz

    # Omit expected answer from public quiz payload so student cannot cheat
    sanitized_questions = [
        {
            "question_id": q.question_id,
            "question_text": q.question_text,
            "question_type": q.question_type,
            "marks": q.marks,
            "rubric_points_count": len(q.rubric),
            "source_refs": q.source_refs
        }
        for q in quiz.questions
    ]

    return {
        "topic_id": topic_id,
        "topic_title": topic_dict.get("title", ""),
        "explanation": explanation.model_dump(),
        "quiz": {
            "quiz_id": quiz.quiz_id,
            "total_marks": quiz.total_marks,
            "questions": sanitized_questions
        }
    }


@router.post("/{quiz_id}/submit")
async def submit_quiz_answers(
    quiz_id: str,
    req: QuizSubmissionRequest,
    current_user: dict = Depends(get_current_user)
):
    """Submits student answers, executes rubric-based grading, verification, and mastery update."""
    quiz = ACTIVE_QUIZZES.get(quiz_id)
    if not quiz:
        # Generate on the fly
        quiz = QuizGeneratorEngine.generate_quiz_for_topic({"id": req.topic_id, "title": req.topic_id})
        ACTIVE_QUIZZES[quiz_id] = quiz

    quiz_dicts = [q.model_dump() for q in quiz.questions]
    ans_dicts = [a.model_dump() for a in req.answers]

    # 1. Rubric Evaluation
    eval_report: QuizEvaluationReport = RubricEvaluatorEngine.evaluate_submission(
        quiz_questions=quiz_dicts,
        student_answers=ans_dicts
    )

    # 2. Dual-pass Verification
    verification: EvaluationVerificationReport = EvaluationVerifierEngine.verify(eval_report)

    # 3. Dynamic Mastery Update
    user_id = current_user["id"]
    if user_id not in MASTERY_STORE:
        MASTERY_STORE[user_id] = {}

    prev_mastery = MASTERY_STORE[user_id].get(req.topic_id, 0.10)
    has_repeat = any(len(q.misconceptions) > 0 for q in eval_report.question_evaluations)

    mastery_res = MasteryEngine.calculate_new_mastery(
        topic_id=req.topic_id,
        previous_mastery=prev_mastery,
        score_earned=verification.verified_total_score,
        max_marks=eval_report.total_marks,
        confidence=verification.verification_confidence,
        repeated_error=has_repeat
    )
    MASTERY_STORE[user_id][req.topic_id] = mastery_res.new_mastery

    return {
        "status": "evaluated",
        "quiz_id": quiz_id,
        "topic_id": req.topic_id,
        "evaluation": eval_report.model_dump(),
        "verification": verification.model_dump(),
        "mastery_update": {
            "previous_mastery": mastery_res.previous_mastery,
            "new_mastery": mastery_res.new_mastery,
            "delta": mastery_res.delta,
            "is_mastered": mastery_res.is_mastered,
            "needs_remediation": mastery_res.needs_remediation,
            "next_revision_days": mastery_res.next_revision_days
        }
    }
