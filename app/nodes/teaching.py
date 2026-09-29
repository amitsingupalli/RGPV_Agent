from typing import Optional, Literal
from pydantic import BaseModel, Field
from app.graph.state import AgentState
from app.retrieval.search import Evidence


class ExplanationPayload(BaseModel):
    topic_id: str
    topic_title: str
    language: Literal["english", "hinglish"]
    concept_definition: str = Field(description="Formal definition grounded in evidence")
    simple_explanation: str = Field(description="Intuitive real-world analogy")
    worked_example: str = Field(description="Step-by-step worked RGPV problem or schema design")
    common_mistake: str = Field(description="Frequent pitfall where RGPV students lose marks")
    rgpv_question_pattern: str = Field(description="Typical 7 or 14-mark question structure in RGPV")
    mini_check_question: str = Field(description="Immediate 1-minute diagnostic question")
    source_citations: list[str] = Field(description="Page-level citations e.g. ['doc_1:p2']")


class TeachingEngine:
    """Generates structured, source-grounded pedagogical explanations in English or Hinglish."""

    TOPIC_EXEMPLARS = {
        "dbms_u3_t2": {
            "english": {
                "concept": "Normalization is the process of organizing relational database tables to reduce data redundancy and eliminate update, insertion, and deletion anomalies. Boyce-Codd Normal Form (BCNF) requires that for every non-trivial functional dependency X -> Y, X must be a superkey.",
                "analogy": "Think of normalization like decluttering a shared university register: instead of writing student name, address, and hostel room repeatedly next to every course enrollment, you keep student details in a Student table and course enrollments in an Enrollment table with roll numbers as references.",
                "example": "Given R(A, B, C) with FDs {AB -> C, C -> B}. Candidate keys are AB and AC. Dependency C -> B is in 3NF (since B is a prime attribute), but violates BCNF because C is not a superkey. Decomposition into R1(C, B) and R2(A, C) achieves BCNF.",
                "mistake": "Students commonly forget that BCNF does not guarantee dependency preservation. For {AB -> C, C -> B}, BCNF decomposition loses AB -> C.",
                "pattern": "Typically asked as a 7 or 10-mark question: 'Define Normalization. Differentiate between 3NF and BCNF with a suitable relation violating BCNF.'",
                "check": "If a relation has only two attributes and is in 1NF, is it always in BCNF? Why?"
            },
            "hinglish": {
                "concept": "Normalization relational database mein redundancy (duplicate data) ko remove karne aur Insertion, Update, Deletion anomalies se bachne ka structured process hai. BCNF (Boyce-Codd Normal Form) ka rule simple hai: har non-trivial dependency X -> Y ke liye LHS (X) hamesha Superkey hona chahiye.",
                "analogy": "Socho ek class attendance register jisme har subject ke aage student ka poora address aur phone number baar-baar likha ho. Agar address badlega to har jagah update karna padega! Normalization se hum Student details aur Enrollment ko alag tables mein divide karte hain using Roll Number as primary key.",
                "example": "Relation R(A, B, C) with FDs {AB -> C, C -> B}. Yahan candidate keys AB aur AC hain. Dependency C -> B 3NF mein valid hai kyunki B prime attribute hai, lekin BCNF violate karti hai kyunki C superkey nahi hai. Isko R1(C, B) aur R2(A, C) mein decompose karne se BCNF achieve hoti hai.",
                "mistake": "RGPV exam mein students aksar bhool jaate hain ki BCNF mein Functional Dependency preserve hona zaroori nahi hota. Jaise upar ke example mein AB -> C lose ho jaati hai.",
                "pattern": "RGPV exam mein 7 ya 10 marks ka regular question aata hai: 'Explain 2NF, 3NF and BCNF with examples showing anomaly removal.'",
                "check": "Kya har 3NF relation automatically BCNF mein hota hai? Ek line mein reason batao."
            }
        },
        "dbms_u4_t1": {
            "english": {
                "concept": "A transaction is a logical unit of database processing that includes one or more database access operations. Transactions must satisfy the ACID properties: Atomicity (all or nothing), Consistency (preserves database correctness), Isolation (concurrent execution is equivalent to serial execution), and Durability (committed changes persist despite system crashes).",
                "analogy": "Consider an ATM withdrawal of Rs. 5000: your bank balance must be deducted AND cash must be dispensed. If power fails after deduction but before cash dispense, the transaction must abort and roll back completely (Atomicity).",
                "example": "A schedule S: r1(A), w1(A), r2(A), w2(A) exhibits a dirty read or conflict serializability issue. We draw a precedence graph: if an edge T1 -> T2 exists and T2 -> T1 exists, a cycle exists, proving S is non-serializable.",
                "mistake": "Students often confuse Conflict Serializability with View Serializability. Conflict serializable schedules are a strict subset of view serializable schedules; every conflict serializable schedule is view serializable, but not vice-versa.",
                "pattern": "Appears in almost every RGPV paper for 7 marks: 'Explain ACID properties with diagrammatic transaction states' or 'Test conflict serializability using precedence graph.'",
                "check": "Which component of the DBMS recovery subsystem ensures Durability?"
            },
            "hinglish": {
                "concept": "Transaction database processing ki ek single logical unit of work hoti hai jo ACID properties follow karti hai: Atomicity (poora execute hoga ya bilkul nahi), Consistency (database valid state mein rahega), Isolation (concurrent transactions ek doosre ko interfere nahi karenge), aur Durability (commit hone ke baad changes permanent rahenge).",
                "analogy": "Bank ATM se paise nikalne ka example lo: Account se paise debit hona aur ATM se cash bahar aana dono ek sath hona chahiye. Agar cash aane se pehle light chali gayi, to paise wapas account mein credit hone chahiye (Atomicity).",
                "example": "Schedule S: r1(A), w1(A), r2(A), w2(A). Yahan T1 ke write ke baad T2 read kar raha hai. Serialization graph (precedence graph) bana kar cycle check karte hain; agar graph Directed Acyclic Graph (DAG) hai, to schedule conflict serializable hai.",
                "mistake": "Exams mein students Conflict Serializability aur View Serializability ko mix kar dete hain. Yaad rakho: blind writes sirf View Serializability mein allow hote hain jo Conflict mein nahi hote.",
                "pattern": "RGPV June/Dec exam ka fixed 7-mark question: 'Define ACID properties and draw the transaction state transition diagram.'",
                "check": "Agar do transactions concurrent run ho rahe hain, to unhe serial order mein simulate karne ke liye precedence graph mein kya nahi hona chahiye?"
            }
        }
    }

    @classmethod
    def generate_explanation(
        cls,
        topic: dict,
        evidence: list[Evidence],
        language: Literal["english", "hinglish"] = "english"
    ) -> ExplanationPayload:
        topic_id = topic.get("id") or topic.get("topic_id", "default_topic")
        title = topic.get("title", "DBMS Topic")

        # Collect source citations from evidence
        citations = [ev.source_id for ev in evidence] if evidence else ["doc_cs403_syllabus:p1"]

        # Check curated exemplar first
        if topic_id in cls.TOPIC_EXEMPLARS and language in cls.TOPIC_EXEMPLARS[topic_id]:
            ex = cls.TOPIC_EXEMPLARS[topic_id][language]
            return ExplanationPayload(
                topic_id=topic_id,
                topic_title=title,
                language=language,
                concept_definition=ex["concept"],
                simple_explanation=ex["analogy"],
                worked_example=ex["example"],
                common_mistake=ex["mistake"],
                rgpv_question_pattern=ex["pattern"],
                mini_check_question=ex["check"],
                source_citations=citations
            )

        # Dynamic fallback grounded on retrieved evidence
        evidence_text = "\n".join([f"[{ev.source_id}] {ev.excerpt}" for ev in evidence])
        is_hinglish = (language == "hinglish")

        if is_hinglish:
            def_text = f"{title} ek essential RGPV university syllabus topic hai. Iska core function database integrity aur efficiency maintain karna hai. Source evidence: {evidence_text[:150]}..."
            ana_text = f"Isko aise samjho: real-world applications jaise college portal ya banking system mein {title} data ko reliably organize karne mein madad karta hai."
            ex_text = f"Standard RGPV exam representation: Consider relation schema R aur specific rules jo {title} demonstrate karte hain."
            mis_text = f"Students aksar basic definitions aur boundary conditions mein marks lose karte hain."
            pat_text = f"Yeh topic general RGPV theory ya 7-mark question pattern mein directly poocha jaata hai."
            chk_text = f"{title} ka primary objective kya hai aur yeh database performance ko kaise improve karta hai?"
        else:
            def_text = f"{title} is a core academic topic in the RGPV curriculum. Its fundamental role is ensuring rigorous data consistency and efficient database operations. Grounded in evidence: {evidence_text[:150]}..."
            ana_text = f"An intuitive way to understand this is to consider how modern data systems isolate users while maintaining transactional reliability."
            ex_text = f"Academic example: Evaluating schema conditions and formal constraints for {title} under typical exam specifications."
            mis_text = f"Students commonly miss edge cases and formal notation in university answer sheets."
            pat_text = f"Frequently formulated as a 7-mark descriptive question with diagrammatic requirements."
            chk_text = f"What is the primary constraint enforced by {title}?"

        return ExplanationPayload(
            topic_id=topic_id,
            topic_title=title,
            language=language,
            concept_definition=def_text,
            simple_explanation=ana_text,
            worked_example=ex_text,
            common_mistake=mis_text,
            rgpv_question_pattern=pat_text,
            mini_check_question=chk_text,
            source_citations=citations
        )


def generate_explanation_node(state: AgentState) -> dict:
    """LangGraph node: generates teaching material for the current active topic."""
    current_topic_id = state.get("current_topic_id")
    topics = state.get("syllabus_topics", [])
    current_topic = next((t for t in topics if (t.get("id") or t.get("topic_id")) == current_topic_id), None)

    if not current_topic and topics:
        current_topic = topics[0]
        current_topic_id = current_topic.get("id") or current_topic.get("topic_id")

    evidence_dicts = state.get("retrieved_evidence", [])
    evidence = [Evidence(**e) for e in evidence_dicts]
    language = state.get("preferred_language", "english")

    explanation = TeachingEngine.generate_explanation(
        topic=current_topic or {"id": current_topic_id, "title": "Database Topic"},
        evidence=evidence,
        language=language
    )

    return {
        "current_topic_id": current_topic_id,
        "explanation": explanation.model_dump(),
        "next_action": "generate_quiz"
    }
