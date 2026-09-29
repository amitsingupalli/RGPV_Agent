import pytest
from evals.syllabus_bench import SyllabusBenchmarkHarness, SyllabusBenchmarkMetrics


def test_syllabus_extraction_benchmark():
    metrics: SyllabusBenchmarkMetrics = SyllabusBenchmarkHarness.run_benchmark()
    assert metrics.unit_recall == 1.0  # 100% of Units 1 to 5 found
    assert metrics.citation_accuracy == 1.0  # 100% have valid page citations
    assert metrics.topic_precision >= 0.70
    assert metrics.extracted_units == 5
