import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.tools.feedback_collector import FeedbackCollector, FeedbackInput
from app.tools.observability import ObservabilityTracker

client = TestClient(app)


def test_feedback_collector_direct():
    inp = FeedbackInput(
        run_id="run_test_fb_01",
        phase="exam_room",
        subject_code="CS-502",
        topic_title="Database Normalization",
        helpful=True,
        grade_fair=True,
        citation_accurate=True,
        topic_missing=False,
        flagged=False,
        comment="Great rubric and breakdown!"
    )
    rec = FeedbackCollector.record_feedback(inp)
    assert rec["feedback_id"].startswith("fb_")
    assert rec["helpful"] is True
    assert rec["grade_fair"] is True

    summary = FeedbackCollector.get_feedback_summary()
    assert summary["total_feedback"] >= 1
    assert summary["helpful_rate_pct"] > 0
    assert summary["fair_grade_rate_pct"] > 0


def test_feedback_endpoints_and_user_corrections():
    initial_corrections = ObservabilityTracker.get_metrics()["user_corrections"]

    # Submit feedback with disputed grade
    payload = {
        "run_id": "run_test_fb_02",
        "phase": "exam_room",
        "subject_code": "CS-502",
        "topic_title": "BCNF Decomposition",
        "helpful": True,
        "grade_fair": False,  # User disputes grade
        "user_suggested_score": 8.5,
        "citation_accurate": True,
        "topic_missing": False,
        "flagged": False,
        "comment": "I believe 8.5 is fairer because I proved lossless join."
    }

    res = client.post("/api/v1/ai/feedback", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "success"
    assert "feedback_id" in data

    # Verify user correction counter incremented
    new_corrections = ObservabilityTracker.get_metrics()["user_corrections"]
    assert new_corrections == initial_corrections + 1

    # Check feedback summary endpoint
    res_summary = client.get("/api/v1/ai/feedback/summary")
    assert res_summary.status_code == 200
    summary_data = res_summary.json()
    assert "total_feedback" in summary_data
    assert "helpful_rate_pct" in summary_data
    assert len(summary_data["recent_submissions"]) >= 1


def test_flagged_feedback_submission():
    payload = {
        "run_id": "run_test_fb_03",
        "phase": "topic_learning",
        "subject_code": "CS-502",
        "topic_title": "SQL Injection",
        "helpful": False,
        "grade_fair": None,
        "citation_accurate": False,
        "citation_error_details": "Reference URL does not lead to RGPV syllabus.",
        "topic_missing": True,
        "missing_topic_details": "Missing parameterized query implementation.",
        "flagged": True,
        "flag_reason": "Contains outdated syntax.",
        "comment": "Needs updated textbook citation."
    }

    res = client.post("/api/v1/ai/feedback", json=payload)
    assert res.status_code == 200

    summary = client.get("/api/v1/ai/feedback/summary").json()
    assert summary["flagged_count"] >= 1
    assert summary["missing_topics_count"] >= 1
