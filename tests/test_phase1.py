import os
import pytest
from app.tools.pdf_tools import PDFParser
from app.retrieval.chunking import PagePreservingChunker
from app.nodes.syllabus import SyllabusParserEngine, ExtractedSyllabus
from app.nodes.questions import QuestionParserEngine, QuestionClassifier, QuestionExtract
from app.nodes.analysis import DocumentAnalysisEngine


@pytest.fixture
def sample_syllabus_path():
    return os.path.join("data", "reference", "dbms", "sample_syllabus_text.txt")


def test_pdf_parser_text_file(sample_syllabus_path):
    result = PDFParser.parse_document(sample_syllabus_path)
    assert result.is_valid is True
    assert result.total_pages == 2
    assert len(result.pages) == 2
    assert result.pages[0].page_number == 1
    assert result.pages[1].page_number == 2
    assert "Unit-I" in result.pages[0].text
    assert "Unit-III" in result.pages[1].text


def test_page_preserving_chunker(sample_syllabus_path):
    result = PDFParser.parse_document(sample_syllabus_path)
    chunker = PagePreservingChunker(target_chunk_chars=600, chunk_overlap_chars=100)
    chunks = chunker.chunk_pages(result.pages, doc_id="cs403_doc")
    
    assert len(chunks) > 0
    # Strict invariant: Every chunk has valid page number matching its source ref
    for ch in chunks:
        assert ch.page_number in [1, 2]
        assert ch.source_ref.startswith("cs403_doc:p")
        assert f":p{ch.page_number}" in ch.source_ref
        assert ch.token_count > 0


def test_syllabus_parser_engine(sample_syllabus_path):
    result = PDFParser.parse_document(sample_syllabus_path)
    pages = [
        {"page_number": p.page_number, "doc_id": "cs403_doc", "text": p.text}
        for p in result.pages
    ]
    syllabus: ExtractedSyllabus = SyllabusParserEngine.parse_raw_text(
        pages, subject_name="Database Management Systems", subject_code="CS-403"
    )
    
    assert syllabus.subject_name == "Database Management Systems"
    assert len(syllabus.units) == 5  # Units 1 through 5
    for unit in syllabus.units:
        assert 1 <= unit.unit_number <= 5
        assert len(unit.topics) > 0
        for topic in unit.topics:
            assert len(topic.source_refs) > 0
            assert topic.source_refs[0].startswith("cs403_doc:p")


def test_question_parser_engine():
    raw_paper_text = """
    RAJIV GANDHI PROUDYOGIKI VISHWAVIDYALAYA, BHOPAL
    B.Tech. IV Semester CS-403 June 2024
    1.(a) Explain the three-schema architecture with neat diagram. [7 Marks]
    1.(b) Construct an ER diagram for a Hospital Management System. [7 Marks]
    2.(a) Explain 1NF, 2NF, 3NF and BCNF with suitable examples. [10 Marks]
    """
    questions = QuestionParserEngine.parse_paper_text(
        text=raw_paper_text,
        paper_name="CS-403_June_2024",
        year=2024,
        doc_id="pyq_2024",
        page_number=1
    )
    
    assert len(questions) == 3
    assert questions[0].question_no == "1(a)"
    assert questions[0].marks == 7
    assert questions[0].year == 2024
    assert questions[2].marks == 10


def test_question_classifier_and_analysis():
    topics = [
        {"id": "t_arch", "title": "DBMS Architecture and Three-Schema", "subtopics": ["three-schema", "data independence"], "unit_number": 1},
        {"id": "t_norm", "title": "Normal Forms and Normalization", "subtopics": ["1nf", "2nf", "3nf", "bcnf"], "unit_number": 3},
    ]
    q1 = QuestionExtract(
        id="q1",
        paper="CS-403_2024",
        year=2024,
        question_no="1(a)",
        text="Explain three-schema architecture of DBMS and physical data independence.",
        marks=7,
        source_ref="pyq_2024:p1"
    )
    q2 = QuestionExtract(
        id="q2",
        paper="CS-403_2024",
        year=2024,
        question_no="2(a)",
        text="Explain 1NF, 2NF, 3NF and BCNF normalization anomalies.",
        marks=10,
        source_ref="pyq_2024:p1"
    )

    mapping1 = QuestionClassifier.classify_question(q1, topics)
    mapping2 = QuestionClassifier.classify_question(q2, topics)

    assert mapping1.topic_id == "t_arch"
    assert mapping1.confidence >= 0.70
    assert mapping2.topic_id == "t_norm"
    assert mapping2.confidence >= 0.70

    # Test DocumentAnalysisEngine
    report = DocumentAnalysisEngine.analyze(
        topics=topics,
        questions=[q1, q2],
        mappings=[mapping1, mapping2]
    )
    assert report.total_questions == 2
    assert report.mapped_count == 2
    assert report.unmapped_count == 0
    assert len(report.topic_stats) == 2

    # Test student override
    overridden = DocumentAnalysisEngine.apply_manual_override(
        [mapping1, mapping2],
        question_id="q1",
        correct_topic_id="t_norm",
        notes="Student manual reclassification"
    )
    assert overridden[0].topic_id == "t_norm"
    assert overridden[0].confidence == 1.0
