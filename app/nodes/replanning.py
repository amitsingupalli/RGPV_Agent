from typing import Optional
from app.graph.state import AgentState
from app.services.mastery import MasteryEngine, MasteryUpdateResult


def update_mastery_node(state: AgentState) -> dict:
    """Updates student mastery for current topic based on verified evaluation."""
    topic_id = state.get("current_topic_id", "")
    evaluation = state.get("evaluation", {})
    mastery_records = state.get("mastery_updates", [])

    # Find previous mastery
    prev_record = next((m for m in mastery_records if m.get("topic_id") == topic_id), None)
    prev_score = prev_record.get("mastery_score", 0.10) if prev_record else 0.10
    step = prev_record.get("spaced_step", 0) if prev_record else 0

    score_earned = float(evaluation.get("verified_score", evaluation.get("total_score", 0.0)))
    max_marks = float(evaluation.get("total_marks", 10.0))
    conf = float(evaluation.get("verification_confidence", evaluation.get("overall_confidence", 0.90)))

    # Check for repeated mistakes
    repeated_error = False
    for q_eval in evaluation.get("question_evaluations", []):
        if len(q_eval.get("misconceptions", [])) > 0:
            repeated_error = True
            break

    result: MasteryUpdateResult = MasteryEngine.calculate_new_mastery(
        topic_id=topic_id,
        previous_mastery=prev_score,
        score_earned=score_earned,
        max_marks=max_marks,
        confidence=conf,
        repeated_error=repeated_error,
        current_step=step
    )

    # Update state list
    updated_records = [m for m in mastery_records if m.get("topic_id") != topic_id]
    updated_records.append({
        "topic_id": topic_id,
        "mastery_score": result.new_mastery,
        "previous_mastery": result.previous_mastery,
        "delta": result.delta,
        "is_mastered": result.is_mastered,
        "needs_remediation": result.needs_remediation,
        "spaced_step": step + 1 if not result.needs_remediation else step,
        "next_revision_days": result.next_revision_days
    })

    return {
        "mastery_updates": updated_records,
        "next_action": "recalculate_plan"
    }


def recalculate_plan_node(state: AgentState) -> dict:
    """Adapts upcoming timetable: inserts remedial sessions if weak, or shifts schedule."""
    topic_id = state.get("current_topic_id", "")
    mastery_records = state.get("mastery_updates", [])
    study_plan = state.get("study_plan", [])
    current_sess_id = state.get("current_session_id", "")

    # Mark current session as completed
    for sess in study_plan:
        if sess.get("session_id") == current_sess_id or (sess.get("topic_id") == topic_id and sess.get("status") == "pending"):
            sess["status"] = "completed"
            break

    current_m = next((m for m in mastery_records if m.get("topic_id") == topic_id), None)

    # Remediation handling
    if current_m and current_m.get("needs_remediation", False):
        # Insert a 25-minute remedial revision session for tomorrow
        pending_sessions = [s for s in study_plan if s.get("status") == "pending"]
        if pending_sessions:
            next_date = pending_sessions[0].get("scheduled_date", "")
            remedial_sess = {
                "session_id": f"sess_remedial_{topic_id[:8]}",
                "topic_id": topic_id,
                "topic_title": f"Remedial Concept Review: {topic_id}",
                "unit_number": 0,
                "session_type": "revision",
                "scheduled_date": next_date,
                "duration_minutes": 25,
                "objective": f"Review misconceptions and re-solve missed rubric problems for {topic_id}",
                "status": "pending"
            }
            # Insert at beginning of pending
            idx = study_plan.index(pending_sessions[0])
            study_plan.insert(idx, remedial_sess)

    return {
        "study_plan": study_plan,
        "next_action": "route_to_next_session_or_finish"
    }
