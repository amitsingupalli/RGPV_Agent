import os
from datetime import date, timedelta
import pytest
from app.graph.builder import build_full_agent_graph
from app.graph.state import AgentState


def test_full_agent_graph_execution():
    graph = build_full_agent_graph()

    sample_syl_path = os.path.join("data", "reference", "dbms", "sample_syllabus_text.txt")
    start_d = date.today().isoformat()
    exam_d = (date.today() + timedelta(days=7)).isoformat()

    initial_state: AgentState = {
        "run_id": "test_e2e_run",
        "user_id": "student_01",
        "subject_name": "Database Management Systems",
        "branch": "Computer Science & Engineering",
        "semester": 4,
        "start_date": start_d,
        "exam_date": exam_d,
        "daily_hours": 2.0,
        "target_score": 80,
        "preferred_language": "hinglish",
        "documents": [
            {
                "id": "doc_syl_1",
                "document_type": "official_syllabus",
                "file_path": sample_syl_path
            }
        ],
        "student_answers": [
            {
                "question_id": "q_norm_1",
                "answer_text": "2NF eliminates partial dependency on candidate keys. 3NF removes transitive dependency."
            }
        ]
    }

    config = {"configurable": {"thread_id": "thread_e2e_test"}}
    final_state = graph.invoke(initial_state, config=config)

    # Assertions on pipeline completion
    assert len(final_state.get("errors", [])) == 0
    assert len(final_state.get("syllabus_topics", [])) > 0
    assert len(final_state.get("study_plan", [])) > 0
    assert final_state.get("explanation") is not None
    assert final_state.get("explanation", {}).get("language") == "hinglish"
    assert len(final_state.get("mastery_updates", [])) > 0
