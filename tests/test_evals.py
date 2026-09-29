import pytest
from evals.syllabus_bench import SyllabusBenchmarkHarness, SyllabusBenchmarkMetrics
from evals.classification_bench import ClassificationBenchmarkHarness, ClassificationBenchmarkMetrics


def test_syllabus_extraction_benchmark():
    metrics: SyllabusBenchmarkMetrics = SyllabusBenchmarkHarness.run_benchmark()
    assert metrics.unit_recall == 1.0  # 100% of Units 1 to 5 found
    assert metrics.citation_accuracy == 1.0  # 100% have valid page citations
    assert metrics.topic_precision >= 0.70
    assert metrics.extracted_units == 5


def test_question_classification_benchmark():
    metrics: ClassificationBenchmarkMetrics = ClassificationBenchmarkHarness.run_benchmark()
    assert metrics.total_questions == 24
    assert metrics.topic_accuracy >= 0.80  # Target >= 80% topic accuracy
    assert metrics.unit_accuracy >= 0.90   # Target >= 90% unit accuracy
    assert metrics.calibration_score > 0.0  # Positive calibration gap
