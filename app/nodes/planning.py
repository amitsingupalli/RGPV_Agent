from datetime import date, datetime
from typing import Optional
from app.graph.state import AgentState
from app.services.scoring import TopicPriorityEngine, TopicPriorityResult
from app.services.scheduling import ConstraintAwareScheduler, StudyPlanSchedule


def calculate_topic_priorities_node(state: AgentState) -> dict:
    """Computes deterministic priority scores and explainability rankings for all topics."""
    topics = state.get("syllabus_topics", [])
    topic_analysis = state.get("topic_analysis", [])
    mastery_records = state.get("mastery_updates", [])

    # Map analysis by topic_id
    stats_map = {item["topic_id"]: item for item in topic_analysis}
    mastery_map = {m["topic_id"]: m.get("mastery_score", 0.10) for m in mastery_records}

    ranked: list[TopicPriorityResult] = TopicPriorityEngine.rank_topics(
        topics=topics,
        topic_stats_map=stats_map,
        mastery_map=mastery_map
    )

    ranked_dicts = [
        {
            "topic_id": r.topic_id,
            "title": r.title,
            "unit_number": r.unit_number,
            "frequency_score": r.frequency_score,
            "difficulty_score": r.difficulty_score,
            "syllabus_importance": r.syllabus_importance,
            "mastery_score": r.mastery_score,
            "priority_score": r.priority_score,
            "rank": r.rank,
            "justification": r.justification
        }
        for r in ranked
    ]

    return {
        "topic_analysis": ranked_dicts,
        "next_action": "generate_study_plan"
    }


def generate_study_plan_node(state: AgentState) -> dict:
    """Generates a constraint-respecting study schedule across days until exam."""
    start_str = state.get("start_date", date.today().isoformat())
    exam_str = state.get("exam_date", "")
    daily_hours = state.get("daily_hours", 2.5)
    target_score = state.get("target_score", 75)
    raw_ranked = state.get("topic_analysis", [])

    start_d = datetime.strptime(start_str, "%Y-%m-%d").date()
    exam_d = datetime.strptime(exam_str, "%Y-%m-%d").date()

    ranked_objects = [
        TopicPriorityResult(
            topic_id=t["topic_id"],
            title=t["title"],
            unit_number=t["unit_number"],
            frequency_score=t["frequency_score"],
            difficulty_score=t["difficulty_score"],
            syllabus_importance=t["syllabus_importance"],
            mastery_score=t["mastery_score"],
            priority_score=t["priority_score"],
            rank=t.get("rank", 1),
            justification=t.get("justification", [])
        )
        for t in raw_ranked
    ]

    schedule: StudyPlanSchedule = ConstraintAwareScheduler.generate_schedule(
        start_date=start_d,
        exam_date=exam_d,
        daily_hours=daily_hours,
        target_score=target_score,
        ranked_topics=ranked_objects
    )

    plan_sessions = []
    for day in schedule.daily_schedules:
        for s in day.sessions:
            plan_sessions.append(s.model_dump())

    return {
        "study_plan": plan_sessions,
        "next_action": "human_review_plan"
    }
