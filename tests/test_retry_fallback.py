import json
import pytest
from unittest.mock import patch
from fastapi.testclient import TestClient
from app.main import app
from app.api.ai_copilot import (
    call_gemini_json_with_retry_and_fallback,
    validate_grading_schema,
    validate_learn_topic_schema
)

client = TestClient(app)


def test_schema_validators():
    # 1. Test grading validator
    valid_grading = {
        "score": 7.5,
        "rubrics": [
            {"id": "r1", "criterion": "Theory", "allocatedMarks": 4, "awardedMarks": 3.5}
        ]
    }
    is_valid, err = validate_grading_schema(valid_grading)
    assert is_valid is True
    assert err is None

    invalid_grading = {"wrong_key": 5}
    is_valid, err = validate_grading_schema(invalid_grading)
    assert is_valid is False
    assert "Missing 'score'" in err

    # 2. Test learn topic validator
    valid_topic = {"coreDefinition": {"en": "Explaining Normalization...", "hi": "Samjhate hue..."}}
    is_valid, err = validate_learn_topic_schema(valid_topic)
    assert is_valid is True

    invalid_topic = {"coreDefinition": {}}
    is_valid, err = validate_learn_topic_schema(invalid_topic)
    assert is_valid is False


@patch("app.api.ai_copilot.load_gemini_api_keys", return_value=["test_fake_key_123"])
@patch("app.api.ai_copilot.execute_gemini_for_model")
def test_retry_on_validation_failure(mock_exec, mock_keys):
    # Attempt 1 returns invalid json schema (missing rubrics)
    # Attempt 2 returns valid json schema
    mock_exec.side_effect = [
        (json.dumps({"score": 8.0}), 150, None),
        (json.dumps({"score": 8.0, "rubrics": [{"id": "r1", "allocatedMarks": 5, "awardedMarks": 4}]}), 180, None),
    ]

    res, info = call_gemini_json_with_retry_and_fallback(
        prompt="Grade student answer",
        phase="exam_room",
        schema_validator=validate_grading_schema
    )

    assert info["status"] == "retry_success"
    assert info["attempts"] == 2
    assert res is not None
    assert res["score"] == 8.0


@patch("app.api.ai_copilot.load_gemini_api_keys", return_value=["test_fake_key_123"])
@patch("app.api.ai_copilot.execute_gemini_for_model")
def test_fallback_model_success(mock_exec, mock_keys):
    # Attempt 1 and 2 fail, Attempt 3 (fallback model) succeeds
    mock_exec.side_effect = [
        (None, 100, "Network timeout"),
        (None, 110, "Network timeout"),
        (json.dumps({"score": 9.0, "rubrics": [{"id": "r1", "allocatedMarks": 5, "awardedMarks": 5}]}), 220, None),
    ]

    res, info = call_gemini_json_with_retry_and_fallback(
        prompt="Grade student answer",
        phase="exam_room",
        schema_validator=validate_grading_schema
    )

    assert info["status"] == "fallback_success"
    assert info["attempts"] == 3
    assert res["score"] == 9.0


@patch("app.api.ai_copilot.load_gemini_api_keys", return_value=["test_fake_key_123"])
@patch("app.api.ai_copilot.execute_gemini_for_model")
def test_degraded_mode_grading_endpoint(mock_exec, mock_keys):
    # All attempts fail
    mock_exec.side_effect = [
        (None, 100, "500 Internal Server Error"),
        (None, 100, "500 Internal Server Error"),
        (None, 100, "500 Internal Server Error"),
    ]

    payload = {
        "subjectCode": "CS-501",
        "subjectName": "Theory of Computation",
        "topicTitle": "Pumping Lemma for Regular Languages",
        "questionText": "State and prove Pumping Lemma for Regular Languages with an example.",
        "totalMarks": 10,
        "studentAnswer": "Pumping lemma states that for any regular language L, there exists a constant p such that any string w in L with length >= p can be split into xyz satisfying conditions |y| > 0, |xy| <= p, and xy^iz is in L for all i >= 0.",
        "currentMastery": 0
    }

    res = client.post("/api/v1/ai/evaluate-answer", json=payload)
    assert res.status_code == 200
    data = res.json()

    assert data["source"] == "degraded_fallback"
    assert data["guardrail_status"] == "degraded"
    assert "Your answer was saved, but automatic grading is temporarily unavailable." in data["notice"]
    assert data["data"]["degraded_mode"] is True
    assert data["data"]["needs_human_review"] is True
    assert "student_notice" in data["data"]
