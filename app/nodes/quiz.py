import uuid
from typing import Optional
from pydantic import BaseModel, Field
from app.graph.state import AgentState


class RubricPoint(BaseModel):
    criterion: str
    weight: float = Field(description="Points awarded if criterion is satisfied")
    is_mandatory: bool = True


class QuizQuestionItem(BaseModel):
    question_id: str
    question_text: str
    question_type: str  # recall, conceptual, problem, pyq_style
    marks: int
    rubric: list[RubricPoint]
    expected_answer_points: list[str]
    source_refs: list[str]


class TopicQuiz(BaseModel):
    quiz_id: str
    topic_id: str
    topic_title: str
    total_marks: int
    questions: list[QuizQuestionItem]


class QuizGeneratorEngine:
    """Generates structured, rubric-backed active recall quizzes tailored to RGPV patterns."""

    CURATED_QUIZZES = {
        "dbms_u3_t2": [
            QuizQuestionItem(
                question_id="q_norm_1",
                question_text="Explain the fundamental difference between 2NF and 3NF with respect to functional dependencies.",
                question_type="conceptual",
                marks=5,
                rubric=[
                    RubricPoint(criterion="Clearly defines Second Normal Form (2NF) and absence of partial dependency", weight=1.5),
                    RubricPoint(criterion="Clearly defines Third Normal Form (3NF) and absence of transitive dependency", weight=1.5),
                    RubricPoint(criterion="States the formal condition for non-prime attributes", weight=1.0),
                    RubricPoint(criterion="Provides a clear, contrasting example of both forms", weight=1.0)
                ],
                expected_answer_points=[
                    "2NF removes partial dependency: no non-prime attribute should depend on a proper subset of candidate key.",
                    "3NF removes transitive dependency: X -> Y where X is superkey or Y is prime attribute.",
                    "Both require 1NF (atomic attributes)."
                ],
                source_refs=["doc_cs403_syllabus:p2"]
            ),
            QuizQuestionItem(
                question_id="q_norm_2",
                question_text="Given a relation R(A, B, C, D) with FDs: {A -> B, B -> C, C -> D}. Find candidate keys and determine the highest normal form of R.",
                question_type="problem",
                marks=7,
                rubric=[
                    RubricPoint(criterion="Calculates closure of attribute A: (A)+ = {A, B, C, D}", weight=2.0),
                    RubricPoint(criterion="Identifies candidate key correctly as A", weight=1.5),
                    RubricPoint(criterion="Evaluates 2NF: No partial dependency since key is single attribute A", weight=1.5),
                    RubricPoint(criterion="Evaluates 3NF: B -> C and C -> D violate 3NF (transitive dependencies), relation is in 2NF only", weight=2.0)
                ],
                expected_answer_points=[
                    "Closure (A)+ = ABCD, hence A is the primary candidate key.",
                    "Since key is single attribute, 2NF is satisfied.",
                    "In B -> C, neither B is superkey nor C is prime, violating 3NF.",
                    "Highest normal form is 2NF."
                ],
                source_refs=["doc_cs403_syllabus:p2"]
            )
        ],
        "dbms_u4_t1": [
            QuizQuestionItem(
                question_id="q_acid_1",
                question_text="State each of the ACID properties of a DBMS transaction and describe which subsystem is responsible for enforcing Durability.",
                question_type="conceptual",
                marks=5,
                rubric=[
                    RubricPoint(criterion="Defines Atomicity (all operations or none)", weight=1.0),
                    RubricPoint(criterion="Defines Consistency and Isolation", weight=1.5),
                    RubricPoint(criterion="Defines Durability (committed changes persist)", weight=1.0),
                    RubricPoint(criterion="Identifies Recovery Management subsystem / Write-Ahead Logging (WAL)", weight=1.5)
                ],
                expected_answer_points=[
                    "Atomicity: transaction either completes fully or has no effect.",
                    "Consistency: transforms DB from one consistent state to another.",
                    "Isolation: transactions execute without interfering with each other.",
                    "Durability: committed changes survive crashes.",
                    "Recovery manager (log files, WAL) guarantees Durability."
                ],
                source_refs=["doc_cs403_syllabus:p2"]
            )
        ]
    }

    @classmethod
    def generate_quiz_for_topic(cls, topic: dict) -> TopicQuiz:
        t_id = topic.get("id") or topic.get("topic_id", "default_topic")
        title = topic.get("title", "DBMS Topic")

        if t_id in cls.CURATED_QUIZZES:
            questions = cls.CURATED_QUIZZES[t_id]
        else:
            # Fallback dynamic question generation
            questions = [
                QuizQuestionItem(
                    question_id=f"q_{t_id}_1",
                    question_text=f"Define {title}. Explain its importance in relational database systems.",
                    question_type="recall",
                    marks=5,
                    rubric=[
                        RubricPoint(criterion=f"Accurate academic definition of {title}", weight=2.0),
                        RubricPoint(criterion="Explains at least two key advantages or use-cases", weight=2.0),
                        RubricPoint(criterion="Uses correct formal database terminology", weight=1.0)
                    ],
                    expected_answer_points=[
                        f"Formal definition of {title}",
                        "Architectural role and data integrity benefits"
                    ],
                    source_refs=["doc_cs403_syllabus:p1"]
                ),
                QuizQuestionItem(
                    question_id=f"q_{t_id}_2",
                    question_text=f"Discuss a typical RGPV exam problem or edge case related to {title}.",
                    question_type="conceptual",
                    marks=7,
                    rubric=[
                        RubricPoint(criterion="Addresses problem formulation accurately", weight=2.5),
                        RubricPoint(criterion="Provides step-by-step reasoning", weight=2.5),
                        RubricPoint(criterion="Identifies common anomalies or boundary conditions", weight=2.0)
                    ],
                    expected_answer_points=[
                        f"Step-by-step analysis for {title}",
                        "Identification of constraints and resolution"
                    ],
                    source_refs=["doc_cs403_syllabus:p1"]
                )
            ]

        total_m = sum(q.marks for q in questions)
        return TopicQuiz(
            quiz_id=f"quiz_{t_id}_{uuid.uuid4().hex[:6]}",
            topic_id=t_id,
            topic_title=title,
            total_marks=total_m,
            questions=questions
        )


def generate_quiz_node(state: AgentState) -> dict:
    """LangGraph node: produces rubric-backed quiz for active topic and prepares student response interrupt."""
    current_topic_id = state.get("current_topic_id")
    topics = state.get("syllabus_topics", [])
    current_topic = next((t for t in topics if (t.get("id") or t.get("topic_id")) == current_topic_id), None)
    if not current_topic and topics:
        current_topic = topics[0]

    quiz = QuizGeneratorEngine.generate_quiz_for_topic(current_topic or {"id": current_topic_id, "title": "Topic"})
    quiz_dict = [q.model_dump() for q in quiz.questions]

    return {
        "quiz": quiz_dict,
        "next_action": "wait_for_student_answers"
    }
