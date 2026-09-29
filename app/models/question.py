import uuid
from sqlalchemy import String, Integer, Float, Text, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, UUIDMixin, TimestampMixin


class Question(Base, TimestampMixin):
    __tablename__ = "questions"

    id: Mapped[str] = mapped_column(String(100), primary_key=True)  # e.g. "q_rgpv_2024_1a"
    subject_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False)
    document_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("documents.id", ondelete="SET NULL"), nullable=True)
    text: Mapped[str] = mapped_column(Text, nullable=False)
    exam_year: Mapped[int] = mapped_column(Integer, nullable=False)
    paper_name: Mapped[str] = mapped_column(String(255), nullable=False)
    question_no: Mapped[str] = mapped_column(String(50), nullable=False)
    marks: Mapped[int] = mapped_column(Integer, default=7, nullable=False)
    question_type: Mapped[str] = mapped_column(String(50), default="theory", nullable=False)  # theory, numerical, coding, design
    difficulty: Mapped[float] = mapped_column(Float, default=0.5, nullable=False)
    source_ref: Mapped[str] = mapped_column(String(100), nullable=False)

    mappings = relationship("QuestionTopicMapping", back_populates="question")


class QuestionTopicMapping(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "question_topic_mappings"

    question_id: Mapped[str] = mapped_column(String(100), ForeignKey("questions.id", ondelete="CASCADE"), nullable=False)
    topic_id: Mapped[str] = mapped_column(String(100), ForeignKey("syllabus_topics.id", ondelete="CASCADE"), nullable=False)
    confidence: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    notes: Mapped[str] = mapped_column(Text, nullable=True)

    question = relationship("Question", back_populates="mappings")
    topic = relationship("SyllabusTopic", back_populates="mappings")
