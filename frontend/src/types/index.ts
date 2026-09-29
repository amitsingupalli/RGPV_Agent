export type Language = 'en' | 'hi';

export type SubjectCode = 'CS-403';

export interface PYQQuestion {
  id: string;
  year: number;
  season: 'May/June' | 'Nov/Dec';
  questionNumber: string;
  text: string;
  marks: number;
  unitId: string;
  topicId: string;
  confidence: number; // 0 - 100
  historicalAppearanceCount: number;
  pageRef: string;
}

export interface Topic {
  id: string;
  unitId: string;
  title: string;
  syllabusWeight: number; // percentage
  frequencyScore: number; // 0 - 100
  appearancesCount: number;
  totalMarksInPast5Years: number;
  difficultyScore: number; // 0 - 100
  difficultyLabel: 'Low' | 'Moderate' | 'High Cognitive Load';
  masteryPercentage: number; // 0 - 100
  mappedPYQIds: string[];
  
  // 7-Section Content
  pedagogicalContent: {
    coreDefinition: {
      en: string;
      hi: string;
    };
    analogy: {
      en: string;
      hi: string;
      title: string;
    };
    workedExample: {
      problemStatement: string;
      stepByStepSolution: Array<{ step: number; title: string; content: string; codeSnippet?: string }>;
    };
    commonMistakes: Array<{ mistake: string; penalty: string; remedy: string }>;
    examPattern: {
      typicalQuestion: string;
      standardMarks: number;
      gradingRubricHighlight: string;
    };
    diagnosticCheck: {
      question: string;
      options: string[];
      correctAnswerIndex: number;
      explanation: string;
    };
    citations: Array<{
      id: string;
      docName: string;
      page: number;
      excerpt: string;
      context: string;
    }>;
  };
}

export interface Unit {
  id: string;
  number: number;
  title: string;
  code: string;
  description: string;
  topics: Topic[];
  weightMarks: number;
}

export type SessionType = 
  | 'concept_learning'
  | 'pyq_practice'
  | 'active_recall'
  | 'spaced_revision'
  | 'buffer_rest';

export interface StudySession {
  id: string;
  type: SessionType;
  title: string;
  topicId: string;
  durationMinutes: number;
  completed: boolean;
  notes?: string;
}

export interface DaySchedule {
  dayNumber: number;
  date: string;
  totalMinutes: number;
  isBufferDay: boolean;
  sessions: StudySession[];
  priorityMetrics: {
    frequency: number;
    difficulty: number;
    syllabusWeight: number;
    masteryDeficit: number;
    calculatedPriority: number;
    justification: string[];
  };
}

export interface StudentProfile {
  program: string;
  branch: string;
  semester: string;
  subjectCode: string;
  subjectName: string;
  targetScore: number; // out of 100
  dailyHoursCap: number; // e.g. 2.5
  examDate: string;
  language: Language;
  planApproved: boolean;
  hitlInterruptActive: boolean;
  hitlInterruptReason?: string;
}

export interface RubricItem {
  id: string;
  criterion: string;
  allocatedMarks: number;
  awardedMarks: number;
  fulfilled: boolean;
  examinerNote: string;
}

export interface QuizSubmission {
  id: string;
  topicId: string;
  questionText: string;
  questionType: 'Conceptual' | 'Problem Solving' | 'Schema Design';
  totalMarks: number;
  studentAnswer: string;
  submittedAt: string;
  status: 'pending' | 'evaluated' | 'appealed';
  score?: number;
  verifierShield: boolean;
  rubrics?: RubricItem[];
  missingCriteria?: string[];
  misconceptions?: string[];
  masteryDelta?: {
    before: number;
    after: number;
  };
}

export interface LangGraphTraceNode {
  id: string;
  nodeName: string;
  status: 'completed' | 'active' | 'pending';
  latencyMs: number;
  inputTokens: number;
  outputTokens: number;
  confidenceScore: number;
  description: string;
  details: Record<string, any>;
}
