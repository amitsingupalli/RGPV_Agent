import uuid
from sqlalchemy import String, Integer, Float, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin


class SyllabusTopic(Base, TimestampMixin):
    __tablename__ = "syllabus_topics"

    id: Mapped[str] = mapped_column(String(100), primary_key=True)  # e.g. "dbms_u1_t1"
    subject_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False)
    unit_number: Mapped[int] = mapped_column(Integer, nullable=False)
    unit_name: Mapped[str] = mapped_column(String(255), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    subtopics = mapped_column(JSONB, nullable=False, default=list)
    source_refs = mapped_column(JSONB, nullable=False, default=list)
    
    # Statistical analysis attributes
    syllabus_weight: Mapped[float] = mapped_column(Float, default=1.0, nullable=False)
    question_frequency: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    difficulty_score: Mapped[float] = mapped_column(Float, default=0.5, nullable=False)
    mastery_score: Mapped[float] = mapped_column(Float, default=0.1, nullable=False)
    priority_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)

    mappings = relationship("QuestionTopicMapping", back_populates="topic")
