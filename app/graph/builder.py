from typing import Optional, Literal
from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver
from app.graph.state import AgentState
from app.nodes.requirements import validate_requirements_node
from app.nodes.planning import calculate_topic_priorities_node, generate_study_plan_node


def route_after_requirements(state: AgentState) -> str:
    if state.get("errors"):
        return END
    return "calculate_topic_priorities"


def build_planning_graph(checkpointer: Optional[MemorySaver] = None):
    """Builds the Phase 2 planning workflow with Human-in-the-Loop review interrupt."""
    builder = StateGraph(AgentState)

    # Register nodes
    builder.add_node("validate_requirements", validate_requirements_node)
    builder.add_node("calculate_topic_priorities", calculate_topic_priorities_node)
    builder.add_node("generate_study_plan", generate_study_plan_node)

    # Edge flows
    builder.add_edge(START, "validate_requirements")
    builder.add_conditional_edges(
        "validate_requirements",
        route_after_requirements,
        {
            "calculate_topic_priorities": "calculate_topic_priorities",
            END: END
        }
    )
    builder.add_edge("calculate_topic_priorities", "generate_study_plan")
    builder.add_edge("generate_study_plan", END)

    # Compile with memory checkpointer
    if checkpointer is None:
        checkpointer = MemorySaver()

    # interrupt_before=["generate_study_plan"] or interrupt after plan generation
    return builder.compile(checkpointer=checkpointer)
