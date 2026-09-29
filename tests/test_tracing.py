import time
import pytest
from fastapi.testclient import TestClient
from app.services.tracing import TraceLogger, TimedNodeContext
from app.main import app

client = TestClient(app)


def test_trace_logger_recording_and_summary():
    TraceLogger.clear_buffer()
    run_id = "test_run_trace_123"
    user_id = "user_abc"

    # Record 3 events
    e1 = TraceLogger.record_node_execution(
        run_id=run_id,
        user_id=user_id,
        node_name="ingest_documents",
        latency_ms=150.0,
        token_usage=500,
        validation_status="passed",
        confidence=0.95
    )
    e2 = TraceLogger.record_node_execution(
        run_id=run_id,
        user_id=user_id,
        node_name="classify_questions",
        latency_ms=320.0,
        token_usage=1200,
        validation_status="passed",
        confidence=0.85
    )
    e3 = TraceLogger.record_node_execution(
        run_id=run_id,
        user_id=user_id,
        node_name="verify_evaluation",
        latency_ms=80.0,
        token_usage=300,
        validation_status="failed",
        confidence=0.60,
        error="Doubtful grading confidence"
    )

    summary = TraceLogger.get_run_summary(run_id)
    assert summary.run_id == run_id
    assert summary.total_events == 3
    assert summary.total_tokens == 2000
    assert summary.failed_nodes_count == 1
    assert abs(summary.total_latency_ms - 550.0) < 1.0
    assert 0.79 <= summary.avg_confidence <= 0.81


def test_timed_node_context():
    TraceLogger.clear_buffer()
    run_id = "test_timed_run"

    with TimedNodeContext(run_id=run_id, user_id="u1", node_name="simulate_work", estimated_tokens=150):
        time.sleep(0.05)  # 50 ms

    summary = TraceLogger.get_run_summary(run_id)
    assert summary.total_events == 1
    assert summary.events[0].latency_ms >= 40.0
    assert summary.events[0].validation_status == "passed"
    assert summary.total_tokens == 150


def test_traces_api_endpoint():
    # Register / login user
    reg_payload = {
        "email": "tracing_tester@example.com",
        "password": "securepassword123",
        "full_name": "Trace Tester",
        "branch": "Computer Science & Engineering",
        "semester": 4
    }
    reg_res = client.post("/api/v1/auth/register", json=reg_payload)
    if reg_res.status_code == 201:
        token = reg_res.json()["access_token"]
    else:
        login_res = client.post("/api/v1/auth/login", json={
            "email": "tracing_tester@example.com",
            "password": "securepassword123"
        })
        token = login_res.json()["access_token"]

    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/v1/progress/traces/run_live_test", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert "total_events" in data
    assert "total_latency_ms" in data
    assert "events" in data
