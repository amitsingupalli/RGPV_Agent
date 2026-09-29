from typing import Literal
from langgraph.graph import END
from app.graph.state import AgentState


def after_requirements_router(state: AgentState) -> str:
    if state.get("errors"):
        return END
    return "ingest_documents"


def after_analysis_router(state: AgentState) -> str:
    return "calculate_topic_priorities"


def after_evaluation_router(state: AgentState) -> str:
    return "update_mastery"


def after_session_recalculation_router(state: AgentState) -> str:
    """Terminates active session cleanly upon completion of mastery update and replanning."""
    # A single active session run finishes so the student can review mastery and take a break
    return END
