import os
import json
from dataclasses import dataclass
from typing import Optional
from app.tools.pdf_tools import PDFParser
from app.nodes.syllabus import SyllabusParserEngine, ExtractedSyllabus


@dataclass
class SyllabusBenchmarkMetrics:
    total_expected_units: int
    extracted_units: int
    unit_recall: float
    total_expected_topics: int
    extracted_topics: int
    matched_topics: int
    topic_precision: float
    topic_recall: float
    topic_f1: float
    citation_accuracy: float


class SyllabusBenchmarkHarness:
    """Automated benchmark harness to evaluate syllabus extraction accuracy against human-verified gold standards."""

    @classmethod
    def run_benchmark(
        cls,
        sample_text_path: Optional[str] = None,
        gold_standard_path: Optional[str] = None
    ) -> SyllabusBenchmarkMetrics:
        sample_text_path = sample_text_path or os.path.join("data", "reference", "dbms", "sample_syllabus_text.txt")
        gold_standard_path = gold_standard_path or os.path.join("data", "reference", "dbms", "syllabus_dbms.json")

        # 1. Load gold standard
        with open(gold_standard_path, "r", encoding="utf-8") as f:
            gold_data = json.load(f)

        expected_units = len(gold_data.get("units", []))
        expected_topics = [
            t["title"].lower()
            for u in gold_data.get("units", [])
            for t in u.get("topics", [])
        ]
        total_expected_topics = len(expected_topics)

        # 2. Run extraction
        parse_res = PDFParser.parse_document(sample_text_path)
        pages = [{"page_number": p.page_number, "text": p.text, "doc_id": "eval_syl"} for p in parse_res.pages]
        extracted: ExtractedSyllabus = SyllabusParserEngine.parse_raw_text(pages)

        extracted_units_count = len(extracted.units)
        unit_recall = round(min(1.0, extracted_units_count / max(1, expected_units)), 4)

        extracted_topics_list = [
            t.title.lower()
            for u in extracted.units
            for t in u.topics
        ]
        total_extracted_topics = len(extracted_topics_list)

        # 3. Compute topic matches (fuzzy / token overlap)
        matched_count = 0
        valid_citations_count = 0
        total_topics_with_citations = 0

        for u in extracted.units:
            for t in u.topics:
                total_topics_with_citations += 1
                # Check citation format
                if t.source_refs and any(":p" in ref for ref in t.source_refs):
                    valid_citations_count += 1

                t_words = set(t.title.lower().split())
                is_matched = any(
                    len(t_words.intersection(set(exp.split()))) >= 1 or exp in t.title.lower() or t.title.lower() in exp
                    for exp in expected_topics
                )
                if is_matched:
                    matched_count += 1

        precision = round(matched_count / max(1, total_extracted_topics), 4)
        recall = round(matched_count / max(1, total_expected_topics), 4)
        f1 = (
            round(2 * (precision * recall) / (precision + recall), 4)
            if (precision + recall) > 0
            else 0.0
        )
        citation_acc = round(valid_citations_count / max(1, total_topics_with_citations), 4)

        return SyllabusBenchmarkMetrics(
            total_expected_units=expected_units,
            extracted_units=extracted_units_count,
            unit_recall=unit_recall,
            total_expected_topics=total_expected_topics,
            extracted_topics=total_extracted_topics,
            matched_topics=matched_count,
            topic_precision=precision,
            topic_recall=recall,
            topic_f1=f1,
            citation_accuracy=citation_acc
        )


if __name__ == "__main__":
    metrics = SyllabusBenchmarkHarness.run_benchmark()
    print("Syllabus Extraction Benchmark Results:")
    print(f"  Unit Recall: {metrics.unit_recall * 100:.1f}%")
    print(f"  Topic Precision: {metrics.topic_precision * 100:.1f}%")
    print(f"  Topic Recall: {metrics.topic_recall * 100:.1f}%")
    print(f"  F1 Score: {metrics.topic_f1 * 100:.1f}%")
    print(f"  Citation Accuracy: {metrics.citation_accuracy * 100:.1f}%")
