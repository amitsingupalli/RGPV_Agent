from typing import Optional
from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver
from app.graph.state import AgentState
from app.nodes.requirements import validate_requirements_node
from app.nodes.ingestion import ingest_documents_node
from app.nodes.syllabus import SyllabusParserEngine, ExtractedSyllabus
from app.nodes.questions import QuestionParserEngine, QuestionClassifier, QuestionExtract
from app.nodes.analysis import DocumentAnalysisEngine, DocumentAnalysisReport
from app.nodes.planning import calculate_topic_priorities_node, generate_study_plan_node
from app.retrieval.search import EvidenceRetriever, Evidence
from app.nodes.teaching import generate_explanation_node
from app.nodes.quiz import generate_quiz_node
from app.nodes.evaluation import evaluate_answers_node
from app.nodes.verification import verify_evaluation_node
from app.nodes.replanning import update_mastery_node, recalculate_plan_node
from app.graph.routes import (
    after_requirements_router,
    after_analysis_router,
    after_evaluation_router,
    after_session_recalculation_router
)


# Node wrappers
def extract_syllabus_node(state: AgentState) -> dict:
    pages = state.get("pages", [])
    syl_pages = [p for p in pages if p.get("document_type") == "official_syllabus"]
    if not syl_pages:
        syl_pages = pages

    sub_name = state.get("subject_name", "Database Management Systems")
    syllabus: ExtractedSyllabus = SyllabusParserEngine.parse_raw_text(syl_pages, subject_name=sub_name)

    topics_flat = []
    for u in syllabus.units:
        for t in u.topics:
            topics_flat.append({
                "id": t.id,
                "title": t.title,
                "unit_number": u.unit_number,
                "unit_name": u.unit_name,
                "subtopics": t.subtopics,
                "source_refs": t.source_refs,
                "syllabus_weight": 1.0,
                "difficulty_score": 0.5,
                "mastery_score": 0.10
            })

    return {
        "syllabus_topics": topics_flat,
        "next_action": "extract_questions"
    }


def extract_questions_node(state: AgentState) -> dict:
    pages = state.get("pages", [])
    pyq_pages = [p for p in pages if p.get("document_type") == "pyq_paper"]

    questions_extracted: list[QuestionExtract] = []
    for p in pyq_pages:
        q_list = QuestionParserEngine.parse_paper_text(
            text=p.get("text", ""),
            paper_name=p.get("doc_id", "PYQ_Paper"),
            year=2024,
            doc_id=p.get("doc_id", "pyq_doc"),
            page_number=p.get("page_number", 1)
        )
        questions_extracted.extend(q_list)

    return {
        "previous_questions": [q.model_dump() for q in questions_extracted],
        "next_action": "classify_questions"
    }


def classify_questions_node(state: AgentState) -> dict:
    topics = state.get("syllabus_topics", [])
    questions_raw = state.get("previous_questions", [])

    mappings = []
    for q_dict in questions_raw:
        q_obj = QuestionExtract(**q_dict)
        res = QuestionClassifier.classify_question(q_obj, topics)
        mappings.append(res.model_dump())

    return {
        "question_topic_mappings": mappings,
        "next_action": "validate_document_analysis"
    }


def validate_document_analysis_node(state: AgentState) -> dict:
    topics = state.get("syllabus_topics", [])
    questions_raw = state.get("previous_questions", [])

    q_objs = [QuestionExtract(**q) for q in questions_raw]
    m_objs = [QuestionClassifier.classify_question(q, topics) for q in q_objs]

    report: DocumentAnalysisReport = DocumentAnalysisEngine.analyze(
        topics=topics,
        questions=q_objs,
        mappings=m_objs
    )

    return {
        "topic_analysis": [s.model_dump() for s in report.topic_stats],
        "warnings": report.warnings,
        "next_action": "calculate_topic_priorities"
    }


def select_next_topic_node(state: AgentState) -> dict:
    """Picks the next pending study session from the approved study plan."""
    plan = state.get("study_plan", [])
    pending = [s for s in plan if s.get("status") == "pending"]

    if not pending:
        return {"current_topic_id": None, "current_session_id": None, "next_action": "finish"}

    next_sess = pending[0]
    return {
        "current_topic_id": next_sess.get("topic_id"),
        "current_session_id": next_sess.get("session_id"),
        "next_action": "retrieve_learning_material"
    }


def retrieve_learning_material_node(state: AgentState) -> dict:
    """Retrieves authoritative evidence chunks for current topic."""
    current_topic_id = state.get("current_topic_id")
    topics = state.get("syllabus_topics", [])
    topic = next((t for t in topics if t.get("id") == current_topic_id), None)
    chunks = state.get("retrieved_evidence", [])

    if topic:
        evidence = EvidenceRetriever.retrieve_for_topic(topic, chunks, top_k=4)
        evidence_dicts = [ev.model_dump() for ev in evidence]
    else:
        evidence_dicts = []

    return {
        "retrieved_evidence": evidence_dicts,
        "next_action": "generate_explanation"
    }


def build_planning_graph(checkpointer: Optional[MemorySaver] = None):
    """Builds the standalone Phase 2 planning subgraph."""
    builder = StateGraph(AgentState)

    builder.add_node("validate_requirements", validate_requirements_node)
    builder.add_node("calculate_topic_priorities", calculate_topic_priorities_node)
    builder.add_node("generate_study_plan", generate_study_plan_node)

    builder.add_edge(START, "validate_requirements")
    builder.add_conditional_edges(
        "validate_requirements",
        after_requirements_router,
        {
            "calculate_topic_priorities": "calculate_topic_priorities",
            "ingest_documents": "calculate_topic_priorities",
            END: END
        }
    )
    builder.add_edge("calculate_topic_priorities", "generate_study_plan")
    builder.add_edge("generate_study_plan", END)

    if checkpointer is None:
        checkpointer = MemorySaver()

    return builder.compile(checkpointer=checkpointer)


def build_full_agent_graph(checkpointer: Optional[MemorySaver] = None):
    """Builds the complete end-to-end RGPV-Agent workflow state machine."""
    builder = StateGraph(AgentState)

    # 1. Ingestion & Analysis Subgraph
    builder.add_node("validate_requirements", validate_requirements_node)
    builder.add_node("ingest_documents", ingest_documents_node)
    builder.add_node("extract_syllabus", extract_syllabus_node)
    builder.add_node("extract_questions", extract_questions_node)
    builder.add_node("classify_questions", classify_questions_node)
    builder.add_node("validate_document_analysis", validate_document_analysis_node)

    # 2. Planning Subgraph
    builder.add_node("calculate_topic_priorities", calculate_topic_priorities_node)
    builder.add_node("generate_study_plan", generate_study_plan_node)

    # 3. Learning & Adaptive Quiz Loop Subgraph
    builder.add_node("select_next_topic", select_next_topic_node)
    builder.add_node("retrieve_learning_material", retrieve_learning_material_node)
    builder.add_node("generate_explanation", generate_explanation_node)
    builder.add_node("generate_quiz", generate_quiz_node)
    builder.add_node("evaluate_answers", evaluate_answers_node)
    builder.add_node("verify_evaluation", verify_evaluation_node)
    builder.add_node("update_mastery", update_mastery_node)
    builder.add_node("recalculate_plan", recalculate_plan_node)

    # Connect Edges
    builder.add_edge(START, "validate_requirements")
    builder.add_conditional_edges("validate_requirements", after_requirements_router, {
        "ingest_documents": "ingest_documents",
        END: END
    })
    builder.add_edge("ingest_documents", "extract_syllabus")
    builder.add_edge("extract_syllabus", "extract_questions")
    builder.add_edge("extract_questions", "classify_questions")
    builder.add_edge("classify_questions", "validate_document_analysis")
    builder.add_edge("validate_document_analysis", "calculate_topic_priorities")
    builder.add_edge("calculate_topic_priorities", "generate_study_plan")
    builder.add_edge("generate_study_plan", "select_next_topic")

    # Learning Loop
    builder.add_edge("select_next_topic", "retrieve_learning_material")
    builder.add_edge("retrieve_learning_material", "generate_explanation")
    builder.add_edge("generate_explanation", "generate_quiz")
    builder.add_edge("generate_quiz", "evaluate_answers")
    builder.add_edge("evaluate_answers", "verify_evaluation")
    builder.add_edge("verify_evaluation", "update_mastery")
    builder.add_edge("update_mastery", "recalculate_plan")

    # Clean termination of active study session
    builder.add_conditional_edges("recalculate_plan", after_session_recalculation_router, {
        END: END
    })

    if checkpointer is None:
        checkpointer = MemorySaver()

    return builder.compile(checkpointer=checkpointer)
