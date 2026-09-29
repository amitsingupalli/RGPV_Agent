from datetime import date, timedelta
import pytest
from app.services.scoring import TopicPriorityEngine, TopicPriorityResult
from app.services.scheduling import ConstraintAwareScheduler
from app.graph.builder import build_planning_graph
from app.graph.state import AgentState


def test_topic_priority_formula_exact():
    # P_i = 0.35*F_i + 0.20*D_i + 0.25*S_i + 0.20*(1 - M_i)
    # F = 0.8, D = 0.6, S = 1.0, M = 0.2
    # P = 0.35*0.8 + 0.20*0.6 + 0.25*1.0 + 0.20*0.8 = 0.28 + 0.12 + 0.25 + 0.16 = 0.81
    score = TopicPriorityEngine.calculate_priority(
        frequency_score=0.8,
        difficulty_score=0.6,
        syllabus_importance=1.0,
        mastery_score=0.2
    )
    assert score == 0.81


def test_topic_ranking_order():
    topics = [
        {"id": "t_low", "title": "History of Databases", "unit_number": 1, "syllabus_weight": 0.5},
        {"id": "t_high", "title": "Transactions and 2PL", "unit_number": 4, "syllabus_weight": 1.0},
    ]
    stats_map = {
        "t_low": {"normalized_frequency": 0.1, "avg_difficulty": 0.3, "question_count": 1, "total_marks": 7},
        "t_high": {"normalized_frequency": 0.9, "avg_difficulty": 0.7, "question_count": 5, "total_marks": 35},
    }
    mastery_map = {
        "t_low": 0.8,   # High mastery -> lower deficit
        "t_high": 0.1   # Low mastery -> high deficit
    }

    ranked = TopicPriorityEngine.rank_topics(topics, stats_map, mastery_map)
    assert len(ranked) == 2
    assert ranked[0].topic_id == "t_high"
    assert ranked[0].rank == 1
    assert ranked[1].topic_id == "t_low"
    assert ranked[1].rank == 2
    assert len(ranked[0].justification) > 0


def test_scheduler_invariants():
    start = date(2026, 10, 1)
    exam = date(2026, 10, 15)  # 14 days
    daily_hours = 2.0  # 120 mins/day

    topics = [
        TopicPriorityResult(
            topic_id=f"t_{i}",
            title=f"Topic {i}",
            unit_number=(i % 5) + 1,
            frequency_score=0.5,
            difficulty_score=0.5,
            syllabus_importance=1.0,
            mastery_score=0.1,
            priority_score=0.7 - (i * 0.05),
            rank=i + 1,
            justification=["Standard priority"]
        )
        for i in range(10)
    ]

    schedule = ConstraintAwareScheduler.generate_schedule(
        start_date=start,
        exam_date=exam,
        daily_hours=daily_hours,
        target_score=80,
        ranked_topics=topics
    )

    assert schedule.total_days == 14
    assert schedule.daily_hours == 2.0
    assert len(schedule.daily_schedules) == 14

    # Strict hard invariant: No day exceeds 120 minutes!
    for day in schedule.daily_schedules:
        assert day.allocated_minutes <= 120, f"Day {day.date} exceeded limit: {day.allocated_minutes} > 120"
        if day.is_buffer_day:
            assert any(s.session_type == "buffer" for s in day.sessions)


def test_planning_graph_execution():
    graph = build_planning_graph()

    start_date = (date.today()).isoformat()
    exam_date = (date.today() + timedelta(days=10)).isoformat()

    initial_state: AgentState = {
        "run_id": "test_run_1",
        "user_id": "test_user_1",
        "subject_name": "Database Management Systems",
        "start_date": start_date,
        "exam_date": exam_date,
        "daily_hours": 2.5,
        "target_score": 75,
        "syllabus_topics": [
            {"id": "t1", "title": "ER Modeling", "unit_number": 1, "syllabus_weight": 1.0},
            {"id": "t2", "title": "Normalization", "unit_number": 3, "syllabus_weight": 1.0}
        ],
        "topic_analysis": [
            {"topic_id": "t1", "normalized_frequency": 0.5, "avg_difficulty": 0.5},
            {"topic_id": "t2", "normalized_frequency": 0.9, "avg_difficulty": 0.8}
        ]
    }

    config = {"configurable": {"thread_id": "test_thread_1"}}
    final_state = graph.invoke(initial_state, config=config)

    assert len(final_state.get("errors", [])) == 0
    assert len(final_state.get("study_plan", [])) > 0
    # Normalization should rank higher than ER Modeling
    assert final_state["topic_analysis"][0]["topic_id"] == "t2"
