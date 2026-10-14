import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.tools.observability import ObservabilityTracker, ModelCallRecord

client = TestClient(app)


def test_observability_tracker_cost_and_logging():
    # 1. Test token cost calculation
    cost = ObservabilityTracker.calculate_cost(input_tokens=1000, output_tokens=500, model="gemini-3.5-flash-lite")
    assert cost > 0.0
    # Expected: (1000 * 0.075 / 1e6) + (500 * 0.30 / 1e6) = 0.000075 + 0.000150 = 0.000225
    assert cost == 0.000225

    # 2. Test logging a record
    record = ModelCallRecord(
        run_id="run_test_obs_123",
        phase="exam_room",
        model="gemini-3.5-flash-lite",
        latency_ms=750,
        input_tokens=1200,
        output_tokens=650,
        schema_valid=True,
        verifier_status="passed",
        cost_usd=cost,
        safety_blocked=False
    )
    logged = ObservabilityTracker.log_call(record)
    assert logged["run_id"] == "run_test_obs_123"
    assert logged["phase"] == "exam_room"

    # 3. Test metric aggregation
    metrics = ObservabilityTracker.get_metrics()
    assert metrics["total_calls"] >= 1
    assert metrics["total_cost_usd"] >= cost
    assert metrics["average_latency_ms"] > 0


def test_observability_endpoints():
    res_metrics = client.get("/api/v1/ai/observability/metrics")
    assert res_metrics.status_code == 200
    data_m = res_metrics.json()
    assert "total_calls" in data_m
    assert "average_latency_ms" in data_m
    assert "retry_count" in data_m

    res_logs = client.get("/api/v1/ai/observability/logs?limit=5")
    assert res_logs.status_code == 200
    data_l = res_logs.json()
    assert isinstance(data_l, list)
    assert len(data_l) >= 1
    assert data_l[0]["phase"] in ["exam_room", "general", "learn_topic"]
