from datetime import date, timedelta
from typing import Optional, Literal
from pydantic import BaseModel, Field
from app.services.scoring import TopicPriorityResult


SessionType = Literal[
    "concept_learning",
    "solved_examples",
    "pyq_practice",
    "quiz",
    "revision",
    "buffer"
]


class ScheduledSession(BaseModel):
    session_id: str
    topic_id: str
    topic_title: str
    unit_number: int
    session_type: SessionType
    scheduled_date: str  # YYYY-MM-DD
    duration_minutes: int
    objective: str
    status: str = "pending"  # pending, completed, skipped


class DaySchedule(BaseModel):
    date: str
    day_number: int
    available_minutes: int
    allocated_minutes: int
    is_buffer_day: bool
    sessions: list[ScheduledSession]


class StudyPlanSchedule(BaseModel):
    start_date: str
    exam_date: str
    total_days: int
    daily_hours: float
    total_available_hours: float
    total_study_minutes: int
    total_sessions: int
    daily_schedules: list[DaySchedule]


class ConstraintAwareScheduler:
    """Deterministic, constraint-satisfying study timetable generator."""

    MAX_SESSION_MINUTES = 60
    MIN_SESSION_MINUTES = 20

    @classmethod
    def generate_schedule(
        cls,
        start_date: date,
        exam_date: date,
        daily_hours: float,
        target_score: int,
        ranked_topics: list[TopicPriorityResult]
    ) -> StudyPlanSchedule:
        if exam_date <= start_date:
            raise ValueError(f"Exam date ({exam_date}) must be strictly after start date ({start_date})")

        if daily_hours <= 0 or daily_hours > 12:
            raise ValueError("Daily study hours must be between 0.5 and 12.0 hours")

        total_days = (exam_date - start_date).days
        daily_limit_minutes = int(daily_hours * 60)

        # Plan structure
        daily_schedules: list[DaySchedule] = []
        session_counter = 1

        # Determine buffer days (day before exam and every 7th day)
        buffer_days: set[int] = set()
        if total_days > 2:
            buffer_days.add(total_days)  # Day before exam
        for d in range(7, total_days, 7):
            buffer_days.add(d)

        # Sort topics: Primary order by unit (prerequisites), secondary by priority score
        curriculum_order = sorted(ranked_topics, key=lambda t: (t.unit_number, -t.priority_score))

        # Build session sequence for each topic:
        # High priority topics get: Concept (45m), Practice (45m), Quiz (25m), Revision (30m)
        # Moderate priority get: Concept (45m), Practice (35m), Quiz (20m)
        pending_sessions: list[dict] = []
        for topic in curriculum_order:
            # 1. Concept Learning
            pending_sessions.append({
                "topic_id": topic.topic_id,
                "topic_title": topic.title,
                "unit_number": topic.unit_number,
                "session_type": "concept_learning",
                "duration": 45,
                "objective": f"Master core definitions and principles of {topic.title}"
            })

            # 2. PYQ Practice
            practice_time = 45 if topic.priority_score >= 0.55 else 30
            pending_sessions.append({
                "topic_id": topic.topic_id,
                "topic_title": topic.title,
                "unit_number": topic.unit_number,
                "session_type": "pyq_practice",
                "duration": practice_time,
                "objective": f"Solve previous RGPV examination questions on {topic.title}"
            })

            # 3. Topic Quiz
            pending_sessions.append({
                "topic_id": topic.topic_id,
                "topic_title": topic.title,
                "unit_number": topic.unit_number,
                "session_type": "quiz",
                "duration": 25,
                "objective": f"Take 3-question active recall quiz with rubric evaluation on {topic.title}"
            })

            # 4. Spaced Revision for top priority topics
            if topic.priority_score >= 0.60:
                pending_sessions.append({
                    "topic_id": topic.topic_id,
                    "topic_title": topic.title,
                    "unit_number": topic.unit_number,
                    "session_type": "revision",
                    "duration": 30,
                    "objective": f"Review key mistakes and high-weight diagrams for {topic.title}"
                })

        # Slot sessions into calendar days respecting daily_limit_minutes
        sess_idx = 0
        total_sessions_count = len(pending_sessions)

        for day_offset in range(total_days):
            current_day = start_date + timedelta(days=day_offset)
            day_num = day_offset + 1
            date_str = current_day.isoformat()

            day_sessions: list[ScheduledSession] = []
            allocated_minutes = 0

            # If it's a buffer day, schedule catch-up / review
            if day_num in buffer_days:
                day_sessions.append(
                    ScheduledSession(
                        session_id=f"sess_{session_counter}",
                        topic_id="buffer_day",
                        topic_title="Buffer & Catch-up Session",
                        unit_number=0,
                        session_type="buffer",
                        scheduled_date=date_str,
                        duration_minutes=min(60, daily_limit_minutes),
                        objective="Catch up on pending topics, rest, and review challenging concepts",
                        status="pending"
                    )
                )
                session_counter += 1
                allocated_minutes = min(60, daily_limit_minutes)
            else:
                # Fill day with pending sessions until daily limit is reached
                while sess_idx < total_sessions_count:
                    next_cand = pending_sessions[sess_idx]
                    dur = next_cand["duration"]

                    # If fits into today's remaining time
                    if allocated_minutes + dur <= daily_limit_minutes:
                        day_sessions.append(
                            ScheduledSession(
                                session_id=f"sess_{session_counter}",
                                topic_id=next_cand["topic_id"],
                                topic_title=next_cand["topic_title"],
                                unit_number=next_cand["unit_number"],
                                session_type=next_cand["session_type"],
                                scheduled_date=date_str,
                                duration_minutes=dur,
                                objective=next_cand["objective"],
                                status="pending"
                            )
                        )
                        session_counter += 1
                        allocated_minutes += dur
                        sess_idx += 1
                    else:
                        # Cannot fit any more full sessions today without violating daily limit
                        break

            daily_schedules.append(
                DaySchedule(
                    date=date_str,
                    day_number=day_num,
                    available_minutes=daily_limit_minutes,
                    allocated_minutes=allocated_minutes,
                    is_buffer_day=(day_num in buffer_days),
                    sessions=day_sessions
                )
            )

        # Invariant check: Ensure no day ever exceeds daily_limit_minutes
        for day in daily_schedules:
            assert day.allocated_minutes <= day.available_minutes, (
                f"Constraint violation: day {day.date} allocated {day.allocated_minutes}m > limit {day.available_minutes}m"
            )

        total_allocated = sum(d.allocated_minutes for d in daily_schedules)
        total_sessions = sum(len(d.sessions) for d in daily_schedules)

        return StudyPlanSchedule(
            start_date=start_date.isoformat(),
            exam_date=exam_date.isoformat(),
            total_days=total_days,
            daily_hours=daily_hours,
            total_available_hours=round((total_days * daily_limit_minutes) / 60, 2),
            total_study_minutes=total_allocated,
            total_sessions=total_sessions,
            daily_schedules=daily_schedules
        )
