import pytest
from app.tools.eval_harness import EvaluationHarness


def test_eval_harness_answer_grading_metrics():
    metrics = EvaluationHarness.evaluate_answer_grading()
    assert metrics["total_cases"] >= 10
    assert metrics["agreement_rate_pct"] >= 80.0
    assert metrics["mean_absolute_error"] <= 1.5
    assert metrics["false_full_marks_rate_pct"] == 0.0


def test_eval_harness_prompt_injection_defense():
    metrics = EvaluationHarness.evaluate_prompt_injection_defense()
    assert metrics["total_cases"] >= 5
    assert metrics["prompt_injection_bypass_rate_pct"] == 0.0
    assert metrics["prompt_injection_defense_rate_pct"] == 100.0


def test_eval_harness_citation_and_plan_metrics():
    cite_metrics = EvaluationHarness.evaluate_citation_accuracy()
    assert cite_metrics["unsupported_citation_rate_pct"] <= 5.0

    plan_metrics = EvaluationHarness.evaluate_study_plan_constraints()
    assert plan_metrics["plan_constraint_violations_pct"] == 0.0


def test_eval_harness_master_report():
    report = EvaluationHarness.run_full_evaluation()
    assert report["overall_status"] == "PASSED"
    assert "grading" in report
    assert "security" in report
