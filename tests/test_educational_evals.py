import json
import os
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.tools.security_tools import SecurityGuardrails

client = TestClient(app)

BENCHMARK_FILE = os.path.join(os.path.dirname(__file__), "..", "app", "data", "evaluation_benchmarks.json")


def load_benchmarks():
    with open(BENCHMARK_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def test_educational_benchmark_integrity_cases():
    """Validates that student answer integrity guardrails accurately flag adversarial, gibberish, and echo submissions."""
    benchmarks = load_benchmarks()
    flagged_cases = [b for b in benchmarks if b.get("expectedFlaggedIssue") is not None]

    for item in flagged_cases:
        guard_res = SecurityGuardrails.guard_student_answer(
            answer=item["studentAnswer"],
            question=item["questionText"],
            total_marks=item["totalMarks"]
        )
        assert guard_res.is_valid is False, f"Failed for {item['id']}: expected is_valid=False"
        assert guard_res.awarded_score == 0.0, f"Failed for {item['id']}: expected score 0.0"
        assert guard_res.flagged_issue == item["expectedFlaggedIssue"], (
            f"Failed for {item['id']}: expected {item['expectedFlaggedIssue']}, got {guard_res.flagged_issue}"
        )


def test_deterministic_scoring_confidence_metric():
    """Validates that compute_grading_confidence detects borderline answers and calculates reliable confidence."""
    # 1. High-scoring complete answer
    score_high = 6.5
    rubrics_high = [
        {"id": "r1", "allocatedMarks": 2.0, "awardedMarks": 2.0, "fulfilled": True},
        {"id": "r2", "allocatedMarks": 3.0, "awardedMarks": 2.5, "fulfilled": True},
        {"id": "r3", "allocatedMarks": 2.0, "awardedMarks": 2.0, "fulfilled": True},
    ]
    long_answer = " ".join(["BCNF database normalization ensures no anomalies occur."] * 15)
    conf_high, review_high, _ = SecurityGuardrails.compute_grading_confidence(
        final_score=score_high,
        total_marks=7,
        student_answer=long_answer,
        rubrics=rubrics_high
    )
    assert conf_high >= 0.85
    assert review_high is False

    # 2. Borderline score (3.0 / 7 = 42%, right in 35-52% RGPV passing threshold)
    score_borderline = 3.0
    rubrics_borderline = [
        {"id": "r1", "allocatedMarks": 2.0, "awardedMarks": 1.5, "fulfilled": True},
        {"id": "r2", "allocatedMarks": 3.0, "awardedMarks": 1.0, "fulfilled": False},
        {"id": "r3", "allocatedMarks": 2.0, "awardedMarks": 0.5, "fulfilled": False},
    ]
    conf_border, review_border, reason_border = SecurityGuardrails.compute_grading_confidence(
        final_score=score_borderline,
        total_marks=7,
        student_answer=long_answer,
        rubrics=rubrics_borderline
    )
    assert review_border is True, "Borderline score near pass threshold must trigger instructor review."
    assert "Borderline exam score" in (reason_border or "")


def test_evaluate_answer_api_returns_draft_disclosure_and_confidence():
    """Validates that the /evaluate-answer API returns the production draft disclaimer and confidence score."""
    res = client.post("/api/v1/ai/evaluate-answer", json={
        "subjectCode": "CS-403",
        "subjectName": "Database Management Systems",
        "topicTitle": "Boyce-Codd Normal Form",
        "questionText": "Explain BCNF decomposition with example.",
        "totalMarks": 7,
        "studentAnswer": "BCNF stands for Boyce-Codd Normal Form. For every X -> Y, X must be a superkey. It eliminates redundancy."
    })

    assert res.status_code == 200
    data = res.json()
    assert data["is_ai_draft"] is True
    assert "disclaimer" in data
    assert "confidence_score" in data["data"]
    assert "needs_human_review" in data["data"]
