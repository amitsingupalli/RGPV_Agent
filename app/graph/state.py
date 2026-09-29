from typing import TypedDict, Optional, Literal


class AgentState(TypedDict, total=False):
    # Session & User Metadata
    run_id: str
    user_id: str
    subject_id: str
    subject_name: str
    branch: str
    semester: int
    start_date: str
    exam_date: str
    daily_hours: float
    target_score: int
    preferred_language: Literal["english", "hinglish"]

    # Ingestion & Documents
    document_ids: list[str]
    documents: list[dict]
    pages: list[dict]

    # Academic Structure & PYQs
    syllabus_topics: list[dict]
    previous_questions: list[dict]
    question_topic_mappings: list[dict]
    topic_analysis: list[dict]

    # Planning & Human-in-the-Loop Interrupt
    study_plan: list[dict]
    plan_feedback: Optional[dict]

    # Active Learning Execution
    current_topic_id: Optional[str]
    current_session_id: Optional[str]
    retrieved_evidence: list[dict]
    explanation: Optional[dict]
    quiz: list[dict]
    student_answers: list[dict]
    evaluation: Optional[dict]
    mastery_updates: list[dict]

    # Error Handling & Flow Control
    errors: list[str]
    warnings: list[str]
    retry_count: int
    next_action: str
