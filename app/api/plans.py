import uuid
from datetime import date, datetime, timedelta
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from app.services.scoring import TopicPriorityEngine, TopicPriorityResult
from app.services.scheduling import ConstraintAwareScheduler, StudyPlanSchedule
from app.api.auth import get_current_user
from app.api.documents import SYLLABUS_STORE, QUESTIONS_STORE, MAPPINGS_STORE, get_extracted_syllabus

router = APIRouter(prefix="/plans", tags=["Study Plans"])

PLANS_STORE: dict[str, dict] = {}


class GeneratePlanRequest(BaseModel):
    subject_id: str = "dbms_cs403"
    exam_date: str = Field(description="YYYY-MM-DD")
    start_date: Optional[str] = None
    daily_hours: Optional[float] = None
    target_score: Optional[int] = None
    preferred_language: Optional[str] = "english"


@router.post("/generate")
async def generate_plan(req: GeneratePlanRequest, current_user: dict = Depends(get_current_user)):
    """Generates a personalized, time-constrained study schedule respecting student capacity."""
    start_d = (
        datetime.strptime(req.start_date, "%Y-%m-%d").date()
        if req.start_date
        else date.today()
    )
    exam_d = datetime.strptime(req.exam_date, "%Y-%m-%d").date()
    daily_h = req.daily_hours or current_user.get("daily_study_hours", 2.5)
    target = req.target_score or current_user.get("target_score", 75)

    # Ensure syllabus is extracted
    if req.subject_id not in SYLLABUS_STORE:
        await get_extracted_syllabus(req.subject_id, current_user)

    syl = SYLLABUS_STORE[req.subject_id]
    topics_flat = [
        {
            "id": t.id,
            "title": t.title,
            "subtopics": t.subtopics,
            "unit_number": u.unit_number,
            "syllabus_weight": 1.0,
            "difficulty_score": 0.5,
            "mastery_score": 0.10
        }
        for u in syl.units for t in u.topics
    ]

    ranked: list[TopicPriorityResult] = TopicPriorityEngine.rank_topics(topics=topics_flat)

    schedule: StudyPlanSchedule = ConstraintAwareScheduler.generate_schedule(
        start_date=start_d,
        exam_date=exam_d,
        daily_hours=daily_h,
        target_score=target,
        ranked_topics=ranked
    )

    plan_id = f"plan_{uuid.uuid4().hex[:8]}"
    plan_record = {
        "plan_id": plan_id,
        "user_id": current_user["id"],
        "subject_id": req.subject_id,
        "start_date": start_d.isoformat(),
        "exam_date": exam_d.isoformat(),
        "daily_hours": daily_h,
        "target_score": target,
        "status": "pending_approval",
        "schedule": schedule.model_dump(),
        "ranked_topics": [r.__dict__ for r in ranked]
    }
    PLANS_STORE[plan_id] = plan_record

    return {
        "status": "success",
        "plan_id": plan_id,
        "total_days": schedule.total_days,
        "total_sessions": schedule.total_sessions,
        "daily_hours": schedule.daily_hours,
        "schedule": schedule.model_dump()
    }


@router.get("/current")
async def get_current_plan(current_user: dict = Depends(get_current_user)):
    """Fetches the latest plan for the logged-in student."""
    user_plans = [p for p in PLANS_STORE.values() if p["user_id"] == current_user["id"]]
    if not user_plans:
        raise HTTPException(status_code=404, detail="No study plan found. Please generate one first.")
    return user_plans[-1]


@router.post("/{plan_id}/approve")
async def approve_plan(plan_id: str, current_user: dict = Depends(get_current_user)):
    """Human-in-the-Loop approval endpoint: approves and activates the timetable."""
    plan = PLANS_STORE.get(plan_id)
    if not plan or plan["user_id"] != current_user["id"]:
        raise HTTPException(status_code=404, detail="Plan not found")

    plan["status"] = "approved"
    return {"status": "approved", "plan_id": plan_id, "message": "Study plan approved! You can now start studying."}
