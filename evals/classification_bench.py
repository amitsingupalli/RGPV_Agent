import os
import json
from dataclasses import dataclass
from typing import Optional
from app.nodes.questions import QuestionClassifier, QuestionExtract, QuestionMappingResult


@dataclass
class ClassificationBenchmarkMetrics:
    total_questions: int
    correct_topic_matches: int
    topic_accuracy: float
    correct_unit_matches: int
    unit_accuracy: float
    ambiguous_flagged_count: int
    mean_confidence: float
    calibration_score: float  # Difference in confidence between correct and incorrect


class ClassificationBenchmarkHarness:
    """Evaluates question-to-topic classification accuracy against human-verified gold standards."""

    @classmethod
    def run_benchmark(
        cls,
        pyq_path: Optional[str] = None,
        syllabus_path: Optional[str] = None,
        gold_mappings_path: Optional[str] = None
    ) -> ClassificationBenchmarkMetrics:
        pyq_path = pyq_path or os.path.join("data", "reference", "dbms", "pyq_papers.json")
        syllabus_path = syllabus_path or os.path.join("data", "reference", "dbms", "syllabus_dbms.json")
        gold_mappings_path = gold_mappings_path or os.path.join("data", "reference", "dbms", "gold_standard_mappings.json")

        # 1. Load data
        with open(pyq_path, "r", encoding="utf-8") as f:
            pyq_data = json.load(f)

        with open(syllabus_path, "r", encoding="utf-8") as f:
            syllabus_data = json.load(f)

        with open(gold_mappings_path, "r", encoding="utf-8") as f:
            gold_data = json.load(f)

        gold_map = {m["question_id"]: m for m in gold_data["mappings"]}

        # Flatten syllabus topics for classifier
        topics_flat = []
        topic_unit_map = {}
        for u in syllabus_data["units"]:
            for t in u["topics"]:
                t_id = t["topic_id"]
                topics_flat.append({
                    "id": t_id,
                    "title": t["title"],
                    "subtopics": t["subtopics"],
                    "unit_number": u["unit_number"]
                })
                topic_unit_map[t_id] = u["unit_number"]

        # 2. Run classifications
        correct_topics = 0
        correct_units = 0
        ambiguous_count = 0
        confidences = []
        conf_correct = []
        conf_incorrect = []

        for q_dict in pyq_data:
            q_id = q_dict["question_id"]
            gold = gold_map.get(q_id)
            if not gold:
                continue

            q_obj = QuestionExtract(
                id=q_id,
                paper=q_dict.get("paper", "CS-403"),
                year=q_dict.get("year", 2024),
                question_no=q_dict.get("question_no", "1"),
                text=q_dict["text"],
                marks=q_dict.get("marks", 7),
                question_type=q_dict.get("question_type", "theory"),
                difficulty=q_dict.get("difficulty", 0.5),
                source_ref=q_dict.get("source_ref", "doc:p1")
            )

            res: QuestionMappingResult = QuestionClassifier.classify_question(q_obj, topics_flat)
            confidences.append(res.confidence)

            if res.is_ambiguous:
                ambiguous_count += 1

            expected_topic = gold["expected_topic_id"]
            expected_unit = gold["expected_unit"]
            pred_topic = res.topic_id
            pred_unit = topic_unit_map.get(pred_topic)

            is_topic_correct = (pred_topic == expected_topic)
            is_unit_correct = (pred_unit == expected_unit)

            if is_topic_correct:
                correct_topics += 1
                conf_correct.append(res.confidence)
            else:
                conf_incorrect.append(res.confidence)

            if is_unit_correct:
                correct_units += 1

        total = len(pyq_data)
        topic_acc = round(correct_topics / max(1, total), 4)
        unit_acc = round(correct_units / max(1, total), 4)
        mean_conf = round(sum(confidences) / max(1, len(confidences)), 4)

        avg_conf_correct = sum(conf_correct) / len(conf_correct) if conf_correct else 0.0
        avg_conf_incorrect = sum(conf_incorrect) / len(conf_incorrect) if conf_incorrect else 0.0
        calibration = round(avg_conf_correct - avg_conf_incorrect, 4)

        return ClassificationBenchmarkMetrics(
            total_questions=total,
            correct_topic_matches=correct_topics,
            topic_accuracy=topic_acc,
            correct_unit_matches=correct_units,
            unit_accuracy=unit_acc,
            ambiguous_flagged_count=ambiguous_count,
            mean_confidence=mean_conf,
            calibration_score=calibration
        )


if __name__ == "__main__":
    metrics = ClassificationBenchmarkHarness.run_benchmark()
    print("Question Classification Benchmark Results:")
    print(f"  Total Questions: {metrics.total_questions}")
    print(f"  Topic Accuracy: {metrics.topic_accuracy * 100:.1f}% ({metrics.correct_topic_matches}/{metrics.total_questions})")
    print(f"  Unit Accuracy: {metrics.unit_accuracy * 100:.1f}% ({metrics.correct_unit_matches}/{metrics.total_questions})")
    print(f"  Mean Confidence: {metrics.mean_confidence:.2f}")
    print(f"  Confidence Calibration Gap: +{metrics.calibration_score:.2f}")
