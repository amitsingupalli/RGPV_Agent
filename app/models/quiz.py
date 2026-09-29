import uuid
from datetime import datetime
from sqlalchemy import String, Integer, Float, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, UUIDMixin, TimestampMixin


class Quiz(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "quizzes"

    topic_id: Mapped[str] = mapped_column(String(100), ForeignKey("syllabus_topics.id", ondelete="CASCADE"), nullable=False)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    total_marks: Mapped[int] = mapped_column(Integer, default=15, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="active", nullable=False)  # active, completed

    questions = relationship("QuizQuestion", back_populates="quiz", cascade="all, delete-orphan")


class QuizQuestion(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "quiz_questions"

    quiz_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("quizzes.id", ondelete="CASCADE"), nullable=False)
    question_text: Mapped[str] = mapped_column(Text, nullable=False)
    question_type: Mapped[str] = mapped_column(String(50), default="short_answer", nullable=False)
    marks: Mapped[int] = mapped_column(Integer, default=5, nullable=False)
    rubric_points = mapped_column(JSONB, nullable=False, default=list)
    expected_answer: Mapped[str] = mapped_column(Text, nullable=False)
    source_refs = mapped_column(JSONB, nullable=False, default=list)

    quiz = relationship("Quiz", back_populates="questions")
    answers = relationship("StudentAnswer", back_populates="question", cascade="all, delete-orphan")


class StudentAnswer(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "student_answers"

    quiz_question_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("quiz_questions.id", ondelete="CASCADE"), nullable=False)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    answer_text: Mapped[str] = mapped_column(Text, nullable=False)
    awarded_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    evaluation = mapped_column(JSONB, nullable=True)  # {correct_points, missing_points, misconceptions, confidence}
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    verification_confidence: Mapped[float] = mapped_column(Float, default=1.0, nullable=False)

    question = relationship("QuizQuestion", back_populates="answers")


class MasteryRecord(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "mastery_records"

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    topic_id: Mapped[str] = mapped_column(String(100), ForeignKey("syllabus_topics.id", ondelete="CASCADE"), nullable=False)
    mastery_score: Mapped[float] = mapped_column(Float, default=0.1, nullable=False)
    attempt_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    last_studied_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    repeated_mistakes_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    spaced_revision_step: Mapped[int] = mapped_column(Integer, default=0, nullable=False)  # 0: None, 1: 1d, 2: 3d, 3: 7d, 4: 14d
