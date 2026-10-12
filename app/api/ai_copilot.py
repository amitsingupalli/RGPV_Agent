import json
import os
import re
import urllib.parse
import urllib.request
import urllib.error
from typing import Any, Dict, List, Optional
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(tags=["AI Copilot (Gemini LLM)"])

# Preferred ultra-fast Gemini models available on the user's API key (gemini-3.5-flash-lite responds in ~0.8s)
GEMINI_MODELS = [
    "gemini-3.5-flash-lite",
    "gemini-3.5-flash",
    "gemini-3.8-flash",
]


def load_gemini_api_keys() -> List[str]:
    """Load one or more comma-separated GEMINI_API_KEY values from env.txt, .env, or environment."""
    raw_values: List[str] = []

    env_val = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    if env_val:
        raw_values.append(env_val)

    for candidate_file in ["env.txt", ".env", "../env.txt", "../.env"]:
        if os.path.exists(candidate_file):
            try:
                with open(candidate_file, "r", encoding="utf-8") as f:
                    for line in f:
                        line_s = line.strip()
                        if not line_s or line_s.startswith("#"):
                            continue
                        if "=" in line_s:
                            k, v = line_s.split("=", 1)
                            if k.strip().upper() in ("GEMINI_API_KEY", "GOOGLE_API_KEY"):
                                raw_values.append(v.strip())
            except Exception:
                pass

    keys: List[str] = []
    for raw in raw_values:
        for part in raw.split(","):
            cleaned = part.strip().strip('"').strip("'")
            if cleaned and cleaned not in keys:
                keys.append(cleaned)
    return keys


def call_gemini_json(prompt: str, timeout_sec: int = 12) -> Optional[Dict[str, Any]]:
    """Call Google Gemini API (gemini-3.5-flash-lite) with fast timeout and parse JSON output."""
    keys = load_gemini_api_keys()
    if not keys:
        return None

    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.25,
            "responseMimeType": "application/json",
        },
    }
    data_bytes = json.dumps(payload).encode("utf-8")

    for model_name in GEMINI_MODELS[:2]:
        for api_key in keys[:2]:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
            req = urllib.request.Request(
                url,
                data=data_bytes,
                headers={"Content-Type": "application/json"},
                method="POST",
            )
            try:
                with urllib.request.urlopen(req, timeout=timeout_sec) as resp:
                    body = json.loads(resp.read().decode("utf-8"))
                    candidates = body.get("candidates", [])
                    if not candidates:
                        continue
                    parts = candidates[0].get("content", {}).get("parts", [])
                    text_out = ""
                    for p in parts:
                        if "text" in p:
                            text_out += p["text"]
                    text_out = text_out.strip()
                    text_out = re.sub(r"^```(?:json)?\s*", "", text_out)
                    text_out = re.sub(r"\s*```$", "", text_out)
                    return json.loads(text_out)
            except urllib.error.HTTPError as e:
                if e.code in (401, 403, 429):
                    continue
                break
            except Exception:
                continue

    return None


# ============================================================================
# Request Schemas
# ============================================================================

class ExtractCurriculumRequest(BaseModel):
    branch: str
    semester: str
    subjectCode: str
    subjectName: str
    uploadedFiles: Optional[List[str]] = None


class LearnTopicRequest(BaseModel):
    subjectCode: str
    subjectName: str
    topicTitle: str
    customQuestion: Optional[str] = None
    language: str = "en"


class EvaluateAnswerRequest(BaseModel):
    subjectCode: str
    subjectName: str
    topicTitle: str
    questionText: str
    totalMarks: int = 7
    studentAnswer: str
    currentMastery: int = 0


# ============================================================================
# Endpoints
# ============================================================================

@router.get("/ai/status")
async def ai_status():
    keys = load_gemini_api_keys()
    return {
        "llm_configured": len(keys) > 0,
        "keys_loaded": len(keys),
        "primary_model": GEMINI_MODELS[0],
        "provider": "Google Gemini API (env.txt)",
    }


@router.post("/ai/extract-curriculum")
async def extract_curriculum_with_ai(req: ExtractCurriculumRequest):
    files_context = (
        f"Uploaded documents: {', '.join(req.uploadedFiles)}"
        if req.uploadedFiles
        else "Standard RGPV Bhopal B.Tech Syllabus & Past 5-Year Question Bank"
    )

    prompt = f"""You are an expert RGPV Bhopal B.Tech University Professor for {req.branch}, {req.semester}, Subject: {req.subjectCode} - {req.subjectName}.
{files_context}.

Generate the authentic 5-Unit RGPV Syllabus with 2 high-yield exam topics per unit (10 topics total), including detailed theory, a worked numerical/practical example with step-by-step calculations/derivations, common exam mistakes, and past year questions (PYQs).

Return strictly valid JSON with this exact structure:
{{
  "units": [
    {{
      "number": 1,
      "title": "Unit 1 Title",
      "description": "Concise summary of Unit 1 syllabus topics",
      "weightMarks": 15,
      "topics": [
        {{
          "title": "Specific High-Yield Topic Name",
          "weight": 92,
          "freq": 94,
          "appearances": 5,
          "marks5Yr": 35,
          "difficulty": 65,
          "difficultyLabel": "Moderate",
          "defEn": "Detailed 4-5 sentence university exam theoretical explanation covering core definition, mathematical/engineering principles, governing laws, and applications.",
          "defHi": "Detailed 4-5 sentence Hinglish explanation (Hindi written in Roman script mixed with technical English terms) explaining the theory clearly for students.",
          "analogyTitle": "Intuitive Real-World Analogy Title",
          "analogyEn": "2-sentence clear engineering analogy.",
          "analogyHi": "2-sentence Hinglish analogy.",
          "typicalQuestion": "Authentic 7-mark or 10-mark RGPV university exam question asking for theory, diagram, and numerical/derivation.",
          "standardMarks": 7,
          "rubricHighlight": "2M for Definition & Theory + 2M for Labeled Diagram + 3M for Numerical / Derivation",
          "problemStatement": "A concrete numerical problem or step-by-step derivation problem on this topic with realistic values.",
          "steps": [
            {{
              "title": "Step 1: Theoretical Formula & Given Data",
              "content": "Explanation of governing formula and parameters",
              "codeSnippet": "Exact mathematical formula / equation / reaction / algorithm"
            }},
            {{
              "title": "Step 2: Step-by-Step Numerical Substitution & Final Answer",
              "content": "Complete calculation showing intermediate steps and units",
              "codeSnippet": "Step-by-step numerical calculation with final boxed answer"
            }}
          ],
          "mistakes": [
            {{
              "mistake": "Common student error in exams on this topic",
              "penalty": "-2 Marks",
              "remedy": "What to write or draw instead to get full marks"
            }}
          ],
          "mcqQuestion": "A conceptual/numerical multiple-choice question on this topic",
          "mcqOptions": ["Option A", "Option B", "Option C", "Option D"],
          "mcqAnswerIndex": 0,
          "mcqExplanation": "1-sentence explanation of why the correct option is right."
        }}
      ]
    }}
  ]
}}"""

    result = call_gemini_json(prompt, timeout_sec=35)
    if result and "units" in result and isinstance(result["units"], list) and len(result["units"]) > 0:
        return {"source": "gemini_llm", "data": result}

    return {"source": "fallback", "data": None}


@router.post("/ai/learn-topic")
async def learn_topic_with_ai(req: LearnTopicRequest):
    question_focus = (
        f"Specifically answer this custom question: '{req.customQuestion}'"
        if req.customQuestion
        else f"Provide a complete 7/10-mark RGPV university model answer for the topic: '{req.topicTitle}'"
    )

    prompt = f"""You are a Senior RGPV Bhopal B.Tech University Examiner and Professor for Subject: {req.subjectCode} ({req.subjectName}).
{question_focus}.

Generate a comprehensive, high-scoring university exam study guide that includes:
1. Detailed Theory (multi-point conceptual explanation, governing laws/principles, mathematical formulas, and key properties in both English and Hinglish).
2. A Complete Worked Numerical Example or Step-by-Step Derivation/Implementation (with realistic numbers, given data, formula substitution, and final result with units).
3. A 4-to-5 stage Visual Block/Flow Diagram blueprint (`nodes`) + Exam Sheet Drawing Tip + Reference URL.
4. Side-by-side "What You SHOULD Do While Writing Answer" (`doList`) and "What You Should NOT Do" (`dontList`).

Return strictly valid JSON with this exact schema:
{{
  "typicalQuestion": "Full 7/10-mark university exam question statement",
  "standardMarks": 10,
  "rubricHighlight": "2M Definition & Theory + 3M Labeled Diagram + 3M Worked Numerical/Derivation + 2M Conclusion",
  "coreDefinition": {{
    "en": "Comprehensive, detailed theoretical explanation (at least 120 words) covering formal definition, underlying principles, mathematical equations, and core concepts.",
    "hi": "Detailed Hinglish explanation (at least 100 words in Roman Hindi + technical English terms) explaining the complete theory and formulas."
  }},
  "theoryBulletPoints": [
    "Key Theoretical Principle 1 with formula/law",
    "Key Theoretical Principle 2 with operating condition",
    "Key Theoretical Principle 3 with engineering significance",
    "Key Theoretical Principle 4 with comparison/application"
  ],
  "analogy": {{
    "title": "Real-World Engineering Analogy Title",
    "en": "Clear analogy connecting the theory to an everyday physical or software system.",
    "hi": "Clear Hinglish explanation of the analogy."
  }},
  "workedExample": {{
    "problemStatement": "Solved Numerical Problem / Derivation Statement with exact given values and required output",
    "stepByStepSolution": [
      {{
        "step": 1,
        "title": "Given Data & Governing Formula",
        "content": "List all given parameters in SI/standard units and state the formula.",
        "codeSnippet": "Formula and Given Parameters"
      }},
      {{
        "step": 2,
        "title": "Step-by-Step Substitution & Calculation",
        "content": "Substitute values into the formula and compute intermediate values.",
        "codeSnippet": "Detailed mathematical calculation steps"
      }},
      {{
        "step": 3,
        "title": "Final Boxed Result & Physical/Technical Interpretation",
        "content": "State the final numerical/derived answer with units and conclusion.",
        "codeSnippet": "Final Answer = ... [Units]"
      }}
    ]
  }},
  "diagramBlueprint": {{
    "title": "Title of the Exam Block / Circuit / Process Diagram",
    "caption": "What this diagram illustrates in the exam sheet",
    "examDrawingTip": "Specific advice on how to draw and label this diagram on the RGPV answer sheet for full marks",
    "referenceUrl": "https://en.wikipedia.org/wiki/Special:Search?search={urllib.parse.quote(req.topicTitle)}",
    "referenceLabel": "External Diagram & Technical Reference",
    "nodes": [
      {{ "step": "Stage 1", "label": "Block 1 Title", "sub": "Key input / component detail" }},
      {{ "step": "Stage 2", "label": "Block 2 Title", "sub": "Core transformation / law" }},
      {{ "step": "Stage 3", "label": "Block 3 Title", "sub": "Equation / mechanism" }},
      {{ "step": "Stage 4", "label": "Block 4 Title", "sub": "Final output / verification" }}
    ],
    "doList": [
      "Specific exam writing DO #1 for this topic",
      "Specific exam writing DO #2 (diagram/formula tip)",
      "Specific exam writing DO #3 (numerical/derivation tip)",
      "Specific exam writing DO #4 (presentation/table tip)"
    ],
    "dontList": [
      "Specific exam mistake to AVOID #1 (-2 Marks)",
      "Specific exam mistake to AVOID #2 (-1.5 Marks)",
      "Specific exam mistake to AVOID #3 (-1 Mark)"
    ]
  }}
}}"""

    result = call_gemini_json(prompt, timeout_sec=30)
    if result and "coreDefinition" in result:
        return {"source": "gemini_llm", "data": result}

    return {"source": "fallback", "data": None}


@router.post("/ai/evaluate-answer")
async def evaluate_answer_with_ai(req: EvaluateAnswerRequest):
    prompt = f"""You are a strict but constructive RGPV Bhopal B.Tech University Examiner grading a student's written answer for Subject: {req.subjectCode} ({req.subjectName}), Topic: {req.topicTitle}.

Exam Question ({req.totalMarks} Marks):
"{req.questionText}"

Student's Written Answer:
\"\"\"{req.studentAnswer}\"\"\"

Evaluate the student's actual answer strictly on its academic merit, technical accuracy, formulas/examples included, and structure.
Return strictly valid JSON with this exact schema:
{{
  "score": 5.5,
  "rubrics": [
    {{
      "id": "r-1",
      "criterion": "Core Theoretical Definition & Technical Accuracy",
      "allocatedMarks": 2,
      "awardedMarks": 1.5,
      "fulfilled": true,
      "examinerNote": "Specific feedback on the student's definition and theory."
    }},
    {{
      "id": "r-2",
      "criterion": "Worked Numerical Example / Derivation / Diagram Steps",
      "allocatedMarks": 3,
      "awardedMarks": 2.0,
      "fulfilled": true,
      "examinerNote": "Specific feedback on formulas, calculations, or diagram steps mentioned."
    }},
    {{
      "id": "r-3",
      "criterion": "Completeness, Key Properties & Exam Presentation",
      "allocatedMarks": 2,
      "awardedMarks": 2.0,
      "fulfilled": true,
      "examinerNote": "Specific feedback on structure and conclusion."
    }}
  ],
  "missingCriteria": [
    "Specific point, formula, or diagram label the student missed"
  ],
  "misconceptions": [
    "Any factual or mathematical misconception found in the student's answer (leave empty array [] if none)"
  ]
}}"""

    result = call_gemini_json(prompt, timeout_sec=25)
    if result and "rubrics" in result and "score" in result:
        return {"source": "gemini_llm", "data": result}

    return {"source": "fallback", "data": None}
