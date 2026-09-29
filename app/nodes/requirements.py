from datetime import date, datetime
from app.graph.state import AgentState


def validate_requirements_node(state: AgentState) -> dict:
    """Validates student inputs, date constraints, and uploaded document availability."""
    errors: list[str] = []
    warnings: list[str] = []

    subject_name = state.get("subject_name", "").strip()
    if not subject_name:
        errors.append("Subject name is required.")

    # Exam Date Validation
    exam_date_str = state.get("exam_date", "")
    if not exam_date_str:
        errors.append("Exam date is required.")
    else:
        try:
            exam_d = datetime.strptime(exam_date_str, "%Y-%m-%d").date()
            start_d = date.today()
            if state.get("start_date"):
                start_d = datetime.strptime(state["start_date"], "%Y-%m-%d").date()

            if exam_d <= start_d:
                errors.append(f"Exam date ({exam_d}) must be in the future relative to start date ({start_d}).")
            elif (exam_d - start_d).days < 3:
                warnings.append("Less than 3 days until exam: intensive crash revision mode activated.")
        except ValueError:
            errors.append(f"Invalid exam date format: '{exam_date_str}'. Expected YYYY-MM-DD.")

    # Daily Study Hours
    hours = state.get("daily_hours", 2.5)
    if hours < 0.5:
        errors.append("Daily study hours must be at least 30 minutes (0.5 hours).")
    elif hours > 10.0:
        warnings.append(f"High daily study hours ({hours}h/day): scheduling extra breaks to prevent fatigue.")

    # Target Score
    target = state.get("target_score", 75)
    if target < 33:
        warnings.append("Target score is below RGPV passing threshold (33%). Adjusted to 40%.")

    return {
        "errors": errors,
        "warnings": warnings,
        "next_action": "repair" if errors else "continue"
    }
