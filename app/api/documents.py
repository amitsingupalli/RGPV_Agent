import os
import shutil
import uuid
from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from pydantic import BaseModel
from app.config import get_settings
from app.tools.pdf_tools import PDFParser
from app.retrieval.chunking import PagePreservingChunker
from app.nodes.syllabus import SyllabusParserEngine, ExtractedSyllabus
from app.nodes.questions import QuestionParserEngine, QuestionClassifier, QuestionExtract, QuestionMappingResult
from app.nodes.analysis import DocumentAnalysisEngine, DocumentAnalysisReport
from app.api.auth import get_current_user

settings = get_settings()
router = APIRouter(prefix="/documents", tags=["Documents"])

# In-memory session stores for extracted state
DOCUMENTS_STORE: dict[str, dict] = {}
SYLLABUS_STORE: dict[str, ExtractedSyllabus] = {}
QUESTIONS_STORE: dict[str, list[QuestionExtract]] = {}
MAPPINGS_STORE: dict[str, list[QuestionMappingResult]] = {}


class MappingOverrideRequest(BaseModel):
    subject_id: str
    question_id: str
    correct_topic_id: str
    notes: Optional[str] = "Student manual correction"


@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    document_type: str = Form(..., description="official_syllabus, pyq_paper, or notes"),
    subject_id: str = Form(default="dbms_cs403"),
    current_user: dict = Depends(get_current_user)
):
    """Uploads a PDF or text document and performs page-preserving parsing."""
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in [".pdf", ".txt", ".md"]:
        raise HTTPException(status_code=400, detail="Only .pdf, .txt, and .md files are supported.")

    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    doc_id = f"doc_{uuid.uuid4().hex[:8]}"
    save_path = os.path.join(settings.UPLOAD_DIR, f"{doc_id}_{file.filename}")

    with open(save_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    parse_result = PDFParser.parse_document(save_path)
    if not parse_result.is_valid:
        raise HTTPException(status_code=400, detail=f"Failed to parse document: {parse_result.error}")

    chunker = PagePreservingChunker(target_chunk_chars=1000)
    chunks = chunker.chunk_pages(parse_result.pages, doc_id=doc_id)

    doc_record = {
        "doc_id": doc_id,
        "filename": file.filename,
        "document_type": document_type,
        "subject_id": subject_id,
        "total_pages": parse_result.total_pages,
        "chunk_count": len(chunks),
        "file_path": save_path,
        "pages": [{"page_number": p.page_number, "text": p.text, "doc_id": doc_id} for p in parse_result.pages],
        "chunks": [{"text": c.text, "page_number": c.page_number, "source_ref": c.source_ref, "doc_id": doc_id} for c in chunks]
    }
    DOCUMENTS_STORE[doc_id] = doc_record

    # If official syllabus, extract structured curriculum immediately
    if document_type == "official_syllabus":
        syllabus = SyllabusParserEngine.parse_raw_text(
            doc_record["pages"],
            subject_name="Database Management Systems",
            subject_code="CS-403"
        )
        SYLLABUS_STORE[subject_id] = syllabus

    # If PYQ paper, extract questions immediately
    if document_type == "pyq_paper":
        questions = []
        for p in parse_result.pages:
            q_list = QuestionParserEngine.parse_paper_text(
                text=p.text,
                paper_name=file.filename,
                year=2024,
                doc_id=doc_id,
                page_number=p.page_number
            )
            questions.extend(q_list)
        QUESTIONS_STORE[subject_id] = questions

        # Auto-classify against existing syllabus if present
        if subject_id in SYLLABUS_STORE:
            syl = SYLLABUS_STORE[subject_id]
            topics_flat = [
                {"id": t.id, "title": t.title, "subtopics": t.subtopics, "unit_number": u.unit_number}
                for u in syl.units for t in u.topics
            ]
            mappings = [QuestionClassifier.classify_question(q, topics_flat) for q in questions]
            MAPPINGS_STORE[subject_id] = mappings

    return {
        "status": "success",
        "doc_id": doc_id,
        "filename": file.filename,
        "document_type": document_type,
        "pages": parse_result.total_pages,
        "chunks": len(chunks)
    }


@router.get("/syllabus/{subject_id}")
async def get_extracted_syllabus(subject_id: str = "dbms_cs403", current_user: dict = Depends(get_current_user)):
    """Fetches extracted units and topics hierarchy for subject."""
    if subject_id not in SYLLABUS_STORE:
        # Fallback to benchmark syllabus data
        sample_path = os.path.join(settings.REFERENCE_DATA_DIR, "dbms", "sample_syllabus_text.txt")
        if os.path.exists(sample_path):
            parse_res = PDFParser.parse_document(sample_path)
            pages = [{"page_number": p.page_number, "text": p.text, "doc_id": "ref_syl"} for p in parse_res.pages]
            SYLLABUS_STORE[subject_id] = SyllabusParserEngine.parse_raw_text(pages)
        else:
            raise HTTPException(status_code=404, detail="Syllabus not yet uploaded or extracted.")

    return SYLLABUS_STORE[subject_id].model_dump()


@router.get("/analysis/{subject_id}")
async def get_analysis_report(subject_id: str = "dbms_cs403", current_user: dict = Depends(get_current_user)):
    """Fetches question frequency, difficulty, and mapping statistics."""
    # Ensure syllabus and questions are loaded
    if subject_id not in SYLLABUS_STORE:
        await get_extracted_syllabus(subject_id, current_user)

    syl = SYLLABUS_STORE[subject_id]
    topics_flat = [
        {"id": t.id, "title": t.title, "subtopics": t.subtopics, "unit_number": u.unit_number}
        for u in syl.units for t in u.topics
    ]

    questions = QUESTIONS_STORE.get(subject_id, [])
    mappings = MAPPINGS_STORE.get(subject_id, [])

    if not mappings and questions:
        mappings = [QuestionClassifier.classify_question(q, topics_flat) for q in questions]
        MAPPINGS_STORE[subject_id] = mappings

    report = DocumentAnalysisEngine.analyze(topics=topics_flat, questions=questions, mappings=mappings)
    return report.model_dump()


@router.post("/override-mapping")
async def override_question_mapping(req: MappingOverrideRequest, current_user: dict = Depends(get_current_user)):
    """Allows student to correct an ambiguous question mapping."""
    mappings = MAPPINGS_STORE.get(req.subject_id, [])
    if not mappings:
        raise HTTPException(status_code=404, detail="No mappings found for subject")

    updated = DocumentAnalysisEngine.apply_manual_override(
        mappings=mappings,
        question_id=req.question_id,
        correct_topic_id=req.correct_topic_id,
        notes=req.notes or "Manual override"
    )
    MAPPINGS_STORE[req.subject_id] = updated
    return {"status": "success", "question_id": req.question_id, "new_topic_id": req.correct_topic_id}
