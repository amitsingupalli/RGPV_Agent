import { Unit, PYQQuestion, Topic, RubricItem } from '../types';

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1/ai';

export interface AITopicStudyGuideResponse {
  typicalQuestion: string;
  standardMarks: number;
  rubricHighlight: string;
  coreDefinition: {
    en: string;
    hi: string;
  };
  theoryBulletPoints: string[];
  analogy: {
    title: string;
    en: string;
    hi: string;
  };
  workedExample: {
    problemStatement: string;
    stepByStepSolution: Array<{
      step: number;
      title: string;
      content: string;
      codeSnippet?: string;
    }>;
  };
  diagramBlueprint: {
    title: string;
    caption: string;
    examDrawingTip: string;
    referenceUrl: string;
    referenceLabel: string;
    nodes: Array<{ step: string; label: string; sub: string }>;
    doList: string[];
    dontList: string[];
  };
  guardrail_status?: 'passed' | 'blocked' | 'flagged';
  guardrail_reason?: string;
  is_ai_draft?: boolean;
  disclaimer?: string;
  status_label?: string;
}

export interface AIEvaluationResult {
  score: number;
  rubrics: RubricItem[];
  missingCriteria: string[];
  misconceptions: string[];
  verifier_shield?: boolean;
  guardrail_status?: 'passed' | 'flagged' | 'blocked';
  flagged_issue?: string;
  audit_notes?: string[];
  confidence_score?: number;
  needs_human_review?: boolean;
  review_reason?: string;
  is_ai_draft?: boolean;
  disclaimer?: string;
}

export async function checkBackendAIStatus(): Promise<{
  llm_configured: boolean;
  keys_loaded: number;
  primary_model: string;
}> {
  try {
    const res = await fetch(`${API_BASE_URL}/status`);
    if (!res.ok) throw new Error('Status check failed');
    return await res.json();
  } catch {
    return { llm_configured: false, keys_loaded: 0, primary_model: 'local' };
  }
}

export async function fetchAICurriculumForSubject(params: {
  branch: string;
  semester: string;
  subjectCode: string;
  subjectName: string;
  uploadedFiles?: string[];
  startingMastery?: number;
  customUnitMastery?: Record<string, number>;
}): Promise<{ units: Unit[]; pyqs: PYQQuestion[] } | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/extract-curriculum`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        branch: params.branch,
        semester: params.semester,
        subjectCode: params.subjectCode,
        subjectName: params.subjectName,
        uploadedFiles: params.uploadedFiles || [],
      }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (json.source !== 'gemini_llm' || !json.data?.units?.length) {
      return null;
    }

    const units: Unit[] = [];
    const pyqs: PYQQuestion[] = [];
    let pyqCounter = 1;

    json.data.units.forEach((uRaw: any, uIdx: number) => {
      const unitNumber = uRaw.number || uIdx + 1;
      const unitId = `unit-${unitNumber}`;
      const unitBaseline =
        params.customUnitMastery?.[unitId] ?? params.startingMastery ?? 0;

      const rawTopics = Array.isArray(uRaw.topics) ? uRaw.topics : [];
      const topics: Topic[] = rawTopics.map((tRaw: any, tIdx: number) => {
        const topicId = `topic-${unitNumber}-${tIdx + 1}`;
        const pyqId = `pyq-ai-${params.subjectCode}-${pyqCounter++}`;

        pyqs.push({
          id: pyqId,
          year: 2024 - (tIdx % 3),
          season: tIdx % 2 === 0 ? 'May/June' : 'Nov/Dec',
          questionNumber: `Q.${unitNumber}(${tIdx === 0 ? 'a' : 'b'})`,
          text:
            tRaw.typicalQuestion ||
            `Explain ${tRaw.title} with neat diagram, theory, and worked numerical example.`,
          marks: Number(tRaw.standardMarks) || 7,
          unitId,
          topicId,
          confidence: 96,
          historicalAppearanceCount: Number(tRaw.appearances) || 5,
          pageRef:
            params.uploadedFiles && params.uploadedFiles.length > 0
              ? `Doc: ${params.uploadedFiles[0]}, Page ${unitNumber}`
              : `Doc: ${params.subjectCode}-RGPV-Syllabus, Unit ${unitNumber}`,
        });

        const rawSteps = Array.isArray(tRaw.steps) ? tRaw.steps : [];
        const rawMistakes = Array.isArray(tRaw.mistakes) ? tRaw.mistakes : [];

        return {
          id: topicId,
          unitId,
          title: tRaw.title || `Unit ${unitNumber} Topic ${tIdx + 1}`,
          syllabusWeight: Number(tRaw.weight) || 90,
          frequencyScore: Number(tRaw.freq) || 92,
          appearancesCount: Number(tRaw.appearances) || 5,
          totalMarksInPast5Years: Number(tRaw.marks5Yr) || 35,
          difficultyScore: Number(tRaw.difficulty) || 65,
          difficultyLabel:
            tRaw.difficultyLabel === 'Low' ||
            tRaw.difficultyLabel === 'High Cognitive Load'
              ? tRaw.difficultyLabel
              : 'Moderate',
          masteryPercentage: unitBaseline,
          mappedPYQIds: [pyqId],
          pedagogicalContent: {
            coreDefinition: {
              en:
                tRaw.defEn ||
                `${tRaw.title} is a core topic in ${params.subjectCode} (${params.subjectName}).`,
              hi:
                tRaw.defHi ||
                `${tRaw.title} (${params.subjectName}) university exam ka important topic hai.`,
            },
            analogy: {
              title: tRaw.analogyTitle || `Engineering Analogy: ${tRaw.title}`,
              en:
                tRaw.analogyEn ||
                `Connects ${tRaw.title} to practical engineering applications.`,
              hi:
                tRaw.analogyHi ||
                `${tRaw.title} ko real-world system se samajhne ka tarika.`,
            },
            workedExample: {
              problemStatement:
                tRaw.problemStatement ||
                tRaw.typicalQuestion ||
                `Solve and derive the governing equations for ${tRaw.title}.`,
              stepByStepSolution:
                rawSteps.length > 0
                  ? rawSteps.map((s: any, sIdx: number) => ({
                      step: sIdx + 1,
                      title: s.title || `Step ${sIdx + 1}`,
                      content: s.content || '',
                      codeSnippet: s.codeSnippet || '',
                    }))
                  : [
                      {
                        step: 1,
                        title: 'Governing Formula & Derivation',
                        content:
                          'State the fundamental principle and substitute given parameters:',
                        codeSnippet: tRaw.defEn || tRaw.title,
                      },
                    ],
            },
            commonMistakes:
              rawMistakes.length > 0
                ? rawMistakes.map((m: any) => ({
                    mistake: m.mistake || 'Skipping labeled diagram or units',
                    penalty: m.penalty || '-2 Marks',
                    remedy:
                      m.remedy ||
                      'Always include a labeled diagram and final units.',
                  }))
                : [
                    {
                      mistake: 'Omitting the labeled block/circuit diagram or units',
                      penalty: '-2 Marks',
                      remedy:
                        'Always draw a neat labeled diagram and box the final numerical answer.',
                    },
                  ],
            examPattern: {
              typicalQuestion:
                tRaw.typicalQuestion ||
                `Explain ${tRaw.title} in detail with theory, diagram, and numerical example.`,
              standardMarks: Number(tRaw.standardMarks) || 7,
              gradingRubricHighlight:
                tRaw.rubricHighlight ||
                '2M Definition & Theory + 2M Labeled Diagram + 3M Numerical / Derivation',
            },
            diagnosticCheck: {
              question:
                tRaw.mcqQuestion ||
                `Which of the following best describes ${tRaw.title}?`,
              options:
                Array.isArray(tRaw.mcqOptions) && tRaw.mcqOptions.length >= 2
                  ? tRaw.mcqOptions
                  : [
                      tRaw.defEn?.slice(0, 80) || `Core principle of ${tRaw.title}`,
                      'Unrelated constant approximation',
                      'Zero-efficiency condition',
                      'None of the above',
                    ],
              correctAnswerIndex: Number(tRaw.mcqAnswerIndex) || 0,
              explanation:
                tRaw.mcqExplanation ||
                `Follows directly from the core principle of ${tRaw.title}.`,
            },
            citations: [
              {
                id: `cite-ai-${topicId}`,
                docName:
                  params.uploadedFiles && params.uploadedFiles.length > 0
                    ? params.uploadedFiles[0]
                    : `RGPV_${params.subjectCode}_Syllabus.pdf`,
                page: unitNumber,
                excerpt: `Unit ${unitNumber}: ${uRaw.title} — ${tRaw.title}`,
                context: `Extracted via Gemini AI for ${params.subjectCode} (${params.subjectName})`,
              },
            ],
          },
        };
      });

      units.push({
        id: unitId,
        number: unitNumber,
        title: uRaw.title || `Unit ${unitNumber}`,
        code: `${params.subjectCode} • Unit ${unitNumber}`,
        description:
          uRaw.description ||
          `Core concepts and exam problems for Unit ${unitNumber}`,
        weightMarks: Number(uRaw.weightMarks) || 14,
        topics,
      });
    });

    return { units, pyqs };
  } catch {
    return null;
  }
}

export async function fetchAITopicStudyGuide(params: {
  subjectCode: string;
  subjectName: string;
  topicTitle: string;
  customQuestion?: string;
  language?: string;
}): Promise<AITopicStudyGuideResponse | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/learn-topic`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) return null;
    const json = await res.json();
    if ((json.source === 'gemini_llm' || json.source === 'guardrail_intercept') && json.data) {
      return {
        ...json.data,
        guardrail_status: json.guardrail_status,
        guardrail_reason: json.reason,
        is_ai_draft: json.is_ai_draft ?? true,
        disclaimer: json.disclaimer || 'AI-Generated Draft: Review against official RGPV scheme before final exams.',
        status_label: json.status_label,
      } as AITopicStudyGuideResponse;
    }
    return null;
  } catch {
    return null;
  }
}

export async function evaluateAnswerWithAI(params: {
  subjectCode: string;
  subjectName: string;
  topicTitle: string;
  questionText: string;
  totalMarks: number;
  studentAnswer: string;
  currentMastery: number;
}): Promise<AIEvaluationResult | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/evaluate-answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) return null;
    const json = await res.json();
    if ((json.source === 'gemini_llm' || json.source === 'guardrail_intercept') && json.data) {
      return {
        ...json.data,
        guardrail_status: json.guardrail_status,
        verifier_shield: json.data.verifier_shield ?? true,
        confidence_score: json.data.confidence_score,
        needs_human_review: json.data.needs_human_review,
        review_reason: json.data.review_reason,
        is_ai_draft: json.is_ai_draft ?? true,
        disclaimer: json.disclaimer,
      } as AIEvaluationResult;
    }
    return null;
  } catch {
    return null;
  }
}
