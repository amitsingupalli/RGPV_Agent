import pytest
from app.models.base import Base
from app.models.user import User
from app.models.subject import Subject
from app.models.document import Document, DocumentChunk
from app.models.topic import SyllabusTopic
from app.models.question import Question, QuestionTopicMapping
from app.models.study_plan import StudyPlan, StudySession
from app.models.quiz import Quiz, QuizQuestion, StudentAnswer, MasteryRecord


def test_database_models_metadata():
    expected_tables = {
        "users",
        "subjects",
        "documents",
        "document_chunks",
        "syllabus_topics",
        "questions",
        "question_topic_mappings",
        "study_plans",
        "study_sessions",
        "quizzes",
        "quiz_questions",
        "student_answers",
        "mastery_records"
    }
    actual_tables = set(Base.metadata.tables.keys())
    assert expected_tables.issubset(actual_tables), f"Missing tables: {expected_tables - actual_tables}"


def test_user_model_defaults():
    # Test column-level schema defaults
    assert User.branch.default.arg == "Computer Science & Engineering"
    assert User.semester.default.arg == 4
    assert User.target_score.default.arg == 75
    assert User.daily_study_hours.default.arg == 2.5
    assert User.preferred_language.default.arg == "english"
    assert User.is_active.default.arg is True

    # Test instance attributes when explicitly set
    user = User(
        email="test_student@example.com",
        hashed_password="fake_hashed_password",
        branch="Computer Science & Engineering",
        semester=4
    )
    assert user.email == "test_student@example.com"
    assert user.branch == "Computer Science & Engineering"
    assert user.semester == 4


def test_syllabus_topic_model():
    # Test column-level defaults
    assert SyllabusTopic.difficulty_score.default.arg == 0.5
    assert SyllabusTopic.mastery_score.default.arg == 0.1
    assert SyllabusTopic.question_frequency.default.arg == 0

    topic = SyllabusTopic(
        id="dbms_u1_t1",
        unit_number=1,
        unit_name="Unit I: Introduction",
        title="DBMS Architecture",
        subtopics=["Three-schema architecture"],
        source_refs=["doc_1:p1"],
        difficulty_score=0.5,
        mastery_score=0.1
    )
    assert topic.id == "dbms_u1_t1"
    assert topic.difficulty_score == 0.5
    assert topic.mastery_score == 0.1
