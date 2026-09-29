import uuid
from datetime import date, datetime
from sqlalchemy import String, Integer, Float, Date, DateTime, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, UUIDMixin, TimestampMixin


class StudyPlan(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "study_plans"

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    subject_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False)
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    exam_date: Mapped[date] = mapped_column(Date, nullable=False)
    daily_hours: Mapped[float] = mapped_column(Float, default=2.5, nullable=False)
    target_score: Mapped[int] = mapped_column(Integer, default=75, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="draft", nullable=False)  # draft, approved, active, completed
    total_sessions: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    plan_metadata = mapped_column(JSONB, nullable=True)

    sessions = relationship("StudySession", back_populates="plan", cascade="all, delete-orphan")


class StudySession(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "study_sessions"

    plan_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("study_plans.id", ondelete="CASCADE"), nullable=False)
    topic_id: Mapped[str] = mapped_column(String(100), ForeignKey("syllabus_topics.id", ondelete="CASCADE"), nullable=False)
    session_type: Mapped[str] = mapped_column(String(50), nullable=False)  # concept_learning, solved_examples, pyq_practice, quiz, revision, buffer
    scheduled_date: Mapped[date] = mapped_column(Date, nullable=False)
    duration_minutes: Mapped[int] = mapped_column(Integer, nullable=False)
    objective: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="pending", nullable=False)  # pending, completed, skipped
    completed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)

    plan = relationship("StudyPlan", back_populates="sessions")
