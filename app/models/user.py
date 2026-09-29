from sqlalchemy import String, Integer, Float, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, UUIDMixin, TimestampMixin


class User(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=True)
    branch: Mapped[str] = mapped_column(String(100), default="Computer Science & Engineering", nullable=False)
    semester: Mapped[int] = mapped_column(Integer, default=4, nullable=False)
    target_score: Mapped[int] = mapped_column(Integer, default=75, nullable=False)
    daily_study_hours: Mapped[float] = mapped_column(Float, default=2.5, nullable=False)
    preferred_language: Mapped[str] = mapped_column(String(20), default="english", nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
