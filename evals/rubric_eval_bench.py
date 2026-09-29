from dataclasses import dataclass
from typing import Optional
from app.nodes.quiz import QuizGeneratorEngine
from app.nodes.evaluation import RubricEvaluatorEngine, QuizEvaluationReport
from app.nodes.verification import EvaluationVerifierEngine, EvaluationVerificationReport


@dataclass
class RubricBenchmarkMetrics:
    total_test_cases: int
    mean_absolute_error: float
    max_absolute_error: float
    false_positive_score_leakage: float
    misconception_detection_rate: float
    verifier_alignment_rate: float


class RubricEvaluationBenchmarkHarness:
    """Evaluates agent grading accuracy, MAE, and misconception detection against human-graded answer samples."""

    # Benchmark test dataset with human expert grades
    TEST_CASES = [
        {
            "id": "case_1_full_correct",
            "topic_id": "dbms_u3_t2",
            "question_id": "q_norm_1",
            "student_answer": (
                "2NF removes partial dependency, which means no non-prime attribute should depend on a proper "
                "subset of any candidate key. 3NF removes transitive dependency, meaning X -> Y must have X as "
                "a superkey or Y as a prime attribute. For example, in Student(RollNo, DeptName, HOD), "
                "RollNo -> DeptName and DeptName -> HOD creates transitive dependency violating 3NF."
            ),
            "human_grade": 5.0,
            "max_marks": 5.0,
            "has_misconception": False
        },
        {
            "id": "case_2_partially_correct_no_example",
            "topic_id": "dbms_u3_t2",
            "question_id": "q_norm_1",
            "student_answer": (
                "Second Normal Form requires that relation is in 1NF and has no partial dependency. "
                "Third Normal Form requires that relation is in 2NF and has no transitive dependency."
            ),
            "human_grade": 3.0,
            "max_marks": 5.0,
            "has_misconception": False
        },
        {
            "id": "case_3_confident_wrong_misconception",
            "topic_id": "dbms_u3_t2",
            "question_id": "q_norm_1",
            "student_answer": (
                "2NF deals with transitive dependencies while 3NF deals with multivalued dependencies. "
                "Also, BCNF is always dependency preserving under all circumstances."
            ),
            "human_grade": 0.5,
            "max_marks": 5.0,
            "has_misconception": True
        },
        {
            "id": "case_4_fluent_nonsense",
            "topic_id": "dbms_u3_t2",
            "question_id": "q_norm_1",
            "student_answer": (
                "Database normalization is an advanced paradigm of artificial intelligence and cloud computing "
                "where deep learning algorithms optimize database latency and quantum servers."
            ),
            "human_grade": 0.0,
            "max_marks": 5.0,
            "has_misconception": False
        }
    ]

    @classmethod
    def run_benchmark(cls) -> RubricBenchmarkMetrics:
        quiz = QuizGeneratorEngine.generate_quiz_for_topic({"id": "dbms_u3_t2", "title": "Normal Forms"})
        quiz_dicts = [q.model_dump() for q in quiz.questions]

        absolute_errors = []
        misconceptions_detected = 0
        misconceptions_expected = 0
        verifier_aligned = 0
        leakage_score = 0.0

        for tc in cls.TEST_CASES:
            student_sub = [{
                "question_id": tc["question_id"],
                "answer_text": tc["student_answer"]
            }]

            # 1. Evaluation
            eval_report: QuizEvaluationReport = RubricEvaluatorEngine.evaluate_submission(
                quiz_questions=quiz_dicts,
                student_answers=student_sub
            )

            # 2. Verification
            verification: EvaluationVerificationReport = EvaluationVerifierEngine.verify(eval_report)

            agent_score = verification.verified_total_score
            human_score = tc["human_grade"]
            err = abs(agent_score - human_score)
            absolute_errors.append(err)

            if tc["id"] == "case_4_fluent_nonsense":
                leakage_score = agent_score

            if tc["has_misconception"]:
                misconceptions_expected += 1
                q_eval = eval_report.question_evaluations[0]
                if q_eval.misconceptions:
                    misconceptions_detected += 1

            if verification.is_valid:
                verifier_aligned += 1

        mae = round(sum(absolute_errors) / len(absolute_errors), 3)
        max_err = round(max(absolute_errors), 3)
        misconception_rate = (
            round(misconceptions_detected / max(1, misconceptions_expected), 3)
        )
        verifier_rate = round(verifier_aligned / len(cls.TEST_CASES), 3)

        return RubricBenchmarkMetrics(
            total_test_cases=len(cls.TEST_CASES),
            mean_absolute_error=mae,
            max_absolute_error=max_err,
            false_positive_score_leakage=leakage_score,
            misconception_detection_rate=misconception_rate,
            verifier_alignment_rate=verifier_rate
        )


if __name__ == "__main__":
    metrics = RubricEvaluationBenchmarkHarness.run_benchmark()
    print("Rubric Grading Benchmark Results:")
    print(f"  Test Cases Evaluated: {metrics.total_test_cases}")
    print(f"  Mean Absolute Error (MAE): {metrics.mean_absolute_error:.2f} marks (Target <= 0.50)")
    print(f"  Max Absolute Error: {metrics.max_absolute_error:.2f} marks")
    print(f"  Hallucination Score Leakage: {metrics.false_positive_score_leakage:.2f} marks")
    print(f"  Misconception Catch Rate: {metrics.misconception_detection_rate * 100:.1f}%")
    print(f"  Verifier Alignment Rate: {metrics.verifier_alignment_rate * 100:.1f}%")
