from datetime import datetime, date
from fastapi import APIRouter, Depends
from app.api.auth import get_current_user
from app.api.documents import SYLLABUS_STORE, get_extracted_syllabus
from app.api.quizzes import MASTERY_STORE
from app.api.plans import PLANS_STORE

router = APIRouter(prefix="/progress", tags=["Progress & Analytics"])


@router.get("/dashboard")
async def get_dashboard(subject_id: str = "dbms_cs403", current_user: dict = Depends(get_current_user)):
    """Computes comprehensive student progress dashboard and exam readiness score."""
    if subject_id not in SYLLABUS_STORE:
        await get_extracted_syllabus(subject_id, current_user)

    syl = SYLLABUS_STORE[subject_id]
    user_id = current_user["id"]
    user_mastery = MASTERY_STORE.get(user_id, {})

    all_topics = [t for u in syl.units for t in u.topics]
    total_topics = len(all_topics)

    # Unit-wise breakdown
    unit_stats = []
    total_score_sum = 0.0

    for u in syl.units:
        u_topics = u.topics
        u_scores = [user_mastery.get(t.id, 0.10) for t in u_topics]
        u_avg = sum(u_scores) / max(1, len(u_scores))
        total_score_sum += sum(u_scores)

        unit_stats.append({
            "unit_number": u.unit_number,
            "unit_name": u.unit_name,
            "topic_count": len(u_topics),
            "mastery_percentage": round(u_avg * 100, 1)
        })

    overall_readiness = round((total_score_sum / max(1, total_topics)) * 100, 1)

    # Weak topics (< 50% mastery)
    weak_topics = [
        {
            "topic_id": t.id,
            "title": t.title,
            "unit_number": next(u.unit_number for u in syl.units if t in u.topics),
            "mastery_percentage": round(user_mastery.get(t.id, 0.10) * 100, 1)
        }
        for t in all_topics
        if user_mastery.get(t.id, 0.10) < 0.50
    ]

    # Plan stats
    user_plans = [p for p in PLANS_STORE.values() if p["user_id"] == user_id]
    latest_plan = user_plans[-1] if user_plans else None

    days_remaining = None
    completed_sessions = 0
    total_sessions = 0

    if latest_plan:
        exam_d = datetime.strptime(latest_plan["exam_date"], "%Y-%m-%d").date()
        days_remaining = max(0, (exam_d - date.today()).days)
        sched = latest_plan.get("schedule", {})
        total_sessions = sched.get("total_sessions", 0)

    return {
        "subject_name": syl.subject_name,
        "subject_code": syl.subject_code,
        "overall_readiness_percentage": overall_readiness,
        "target_score": current_user.get("target_score", 75),
        "days_remaining_to_exam": days_remaining,
        "total_topics_count": total_topics,
        "weak_topics_count": len(weak_topics),
        "unit_breakdown": unit_stats,
        "weak_topics": weak_topics[:5],
        "completed_sessions": completed_sessions,
        "total_sessions": total_sessions
    }
