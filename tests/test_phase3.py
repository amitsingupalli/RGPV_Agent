import pytest
from app.retrieval.search import EvidenceRetriever, Evidence
from app.nodes.teaching import TeachingEngine
from app.nodes.quiz import QuizGeneratorEngine
from app.nodes.evaluation import RubricEvaluatorEngine
from app.nodes.verification import EvaluationVerifierEngine
from app.services.mastery import MasteryEngine


def test_evidence_retriever():
    topic = {
        "id": "dbms_u3_t2",
        "title": "Normal Forms (1NF, 2NF, 3NF, BCNF)",
        "subtopics": ["Partial Dependency", "Transitive Dependency", "BCNF superkey"]
    }
    chunks = [
        {
            "chunk_text": "Normal forms reduce redundancy. 2NF removes partial dependency, while 3NF removes transitive dependency.",
            "source_type": "official_syllabus",
            "document_id": "doc_syl",
            "page_number": 2
        },
        {
            "chunk_text": "Unrelated topic regarding CPU scheduling in Operating Systems.",
            "source_type": "textbook_reference",
            "document_id": "doc_os",
            "page_number": 1
        }
    ]

    evidence = EvidenceRetriever.retrieve_for_topic(topic, chunks, top_k=2)
    assert len(evidence) == 1
    assert evidence[0].document_id == "doc_syl"
    assert evidence[0].page_number == 2
    assert evidence[0].relevance_score > 0.40
    assert "partial dependency" in evidence[0].excerpt.lower()


def test_teaching_engine_english_and_hinglish():
    topic = {
        "id": "dbms_u3_t2",
        "title": "Normal Forms (1NF, 2NF, 3NF, BCNF)"
    }
    evidence = [
        Evidence(
            source_id="doc_syl:p2",
            document_id="doc_syl",
            page_number=2,
            excerpt="BCNF definition excerpt",
            relevance_score=0.9,
            source_type="official_syllabus"
        )
    ]

    # Test English
    exp_eng = TeachingEngine.generate_explanation(topic, evidence, language="english")
    assert exp_eng.language == "english"
    assert "Normalization" in exp_eng.concept_definition
    assert len(exp_eng.source_citations) > 0
    assert len(exp_eng.mini_check_question) > 5

    # Test Hinglish
    exp_hin = TeachingEngine.generate_explanation(topic, evidence, language="hinglish")
    assert exp_hin.language == "hinglish"
    assert "redundancy" in exp_hin.concept_definition.lower()
    assert len(exp_hin.worked_example) > 10


def test_quiz_generator_rubrics():
    topic = {"id": "dbms_u3_t2", "title": "Normal Forms"}
    quiz = QuizGeneratorEngine.generate_quiz_for_topic(topic)

    assert len(quiz.questions) >= 2
    assert quiz.total_marks > 0
    for q in quiz.questions:
        assert len(q.rubric) > 0
        total_rubric_weight = sum(r.weight for r in q.rubric)
        assert abs(total_rubric_weight - q.marks) < 0.01


def test_rubric_evaluator_and_verifier():
    quiz = QuizGeneratorEngine.generate_quiz_for_topic({"id": "dbms_u3_t2", "title": "Normal Forms"})
    quiz_dicts = [q.model_dump() for q in quiz.questions]

    student_answers = [
        {
            "question_id": quiz.questions[0].question_id,
            "answer_text": "2NF removes partial dependency where non-prime depends on subset of candidate key. 3NF removes transitive dependency. For example, Student(ID, Dept, HOD) has transitive dependency ID -> Dept -> HOD."
        }
    ]

    report = RubricEvaluatorEngine.evaluate_submission(quiz_dicts, student_answers)
    assert report.total_marks > 0
    assert report.total_score > 0
    assert len(report.question_evaluations[0].fulfilled_criteria) > 0

    # Verification pass
    verification = EvaluationVerifierEngine.verify(report)
    assert verification.is_valid is True
    assert verification.verified_total_score == report.total_score
    assert verification.verification_confidence >= 0.70


def test_mastery_engine_calculation():
    # Previous mastery = 0.20, perfect score (5/5), conf = 1.0, no repeat
    # new = 0.20 + 0.20 * 1.0 * 1.0 = 0.40
    res1 = MasteryEngine.calculate_new_mastery(
        topic_id="t1",
        previous_mastery=0.20,
        score_earned=5.0,
        max_marks=5.0,
        confidence=1.0,
        repeated_error=False
    )
    assert res1.new_mastery == 0.40
    assert res1.delta == 0.20
    assert res1.needs_remediation is True  # 0.40 < 0.50

    # Test repeated error penalty (-0.08)
    res2 = MasteryEngine.calculate_new_mastery(
        topic_id="t1",
        previous_mastery=0.50,
        score_earned=2.5,
        max_marks=5.0,
        confidence=1.0,
        repeated_error=True
    )
    # adjustment = 0.20 * 0.5 * 1.0 - 0.08 = 0.10 - 0.08 = +0.02
    assert res2.new_mastery == 0.52
