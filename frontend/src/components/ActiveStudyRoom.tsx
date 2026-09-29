import React, { useState } from 'react';
import { 
  BookOpen, 
  Lightbulb, 
  FileCode, 
  AlertTriangle, 
  Target, 
  Timer, 
  FileText, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  ChevronRight, 
  Sparkles, 
  Code, 
  RefreshCw, 
  ArrowUpRight, 
  Check,
  Send,
  HelpCircle,
  Award
} from 'lucide-react';
import { Topic, Language, Unit, QuizSubmission, RubricItem } from '../types';

interface ActiveStudyRoomProps {
  currentTopic: Topic;
  allUnits: Unit[];
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onSelectTopic: (topicId: string) => void;
  onOpenCitation: (citation: any) => void;
  onUpdateTopicMastery: (topicId: string, newMastery: number) => void;
  onTriggerHitlAppeal: (reason: string) => void;
}

export const ActiveStudyRoom: React.FC<ActiveStudyRoomProps> = ({
  currentTopic,
  allUnits,
  language,
  onLanguageChange,
  onSelectTopic,
  onOpenCitation,
  onUpdateTopicMastery,
  onTriggerHitlAppeal,
}) => {
  // Diagnostic state
  const [selectedDiagnosticOption, setSelectedDiagnosticOption] = useState<number | null>(null);
  const [diagnosticSubmitted, setDiagnosticSubmitted] = useState<boolean>(false);

  // Quiz submission state
  const [studentAnswerText, setStudentAnswerText] = useState<string>(
    'Functional Dependency (X -> Y) holds if whenever two tuples agree on attribute X, they must also agree on attribute Y.\n\n3NF Condition: For every non-trivial FD X -> Y, either:\n1. X is a superkey, OR\n2. Y is a prime attribute (part of candidate key).\n\nBCNF Condition: For every non-trivial FD X -> Y, X MUST be a superkey.\n\nCounter Example: Consider R(Student, Subject, Teacher) with FDs:\n(Student, Subject) -> Teacher\nTeacher -> Subject\nCandidate keys: {Student, Subject}, {Student, Teacher}.\nHere Teacher -> Subject satisfies 3NF because Subject is prime, but violates BCNF because Teacher is not a superkey.'
  );
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [submission, setSubmission] = useState<QuizSubmission | null>({
    id: 'sub-sample',
    topicId: currentTopic.id,
    questionText: 'Differentiate between 3NF and BCNF with a relation that is in 3NF but violates BCNF. State the impact on dependency preservation.',
    questionType: 'Conceptual',
    totalMarks: 5.0,
    studentAnswer: '',
    submittedAt: 'Just now',
    status: 'evaluated',
    score: 4.5,
    verifierShield: true,
    rubrics: [
      {
        id: 'r-1',
        criterion: 'Precise definition of Functional Dependency and candidate keys identified',
        allocatedMarks: 1.0,
        awardedMarks: 1.0,
        fulfilled: true,
        examinerNote: 'Accurately stated tuple-equivalence rule and candidate key combinations.'
      },
      {
        id: 'r-2',
        criterion: 'Distinction between 3NF (prime attribute exemption) and strict BCNF superkey condition',
        allocatedMarks: 1.5,
        awardedMarks: 1.5,
        fulfilled: true,
        examinerNote: 'Clear breakdown of LHS superkey rule and prime attribute clause.'
      },
      {
        id: 'r-3',
        criterion: 'Valid worked counter-example relation demonstrating 3NF vs BCNF',
        allocatedMarks: 1.5,
        awardedMarks: 1.5,
        fulfilled: true,
        examinerNote: 'Standard Student-Teacher-Subject schema provided with valid FDs.'
      },
      {
        id: 'r-4',
        criterion: 'Impact on Dependency Preservation and Lossless Join analyzed during BCNF decomposition',
        allocatedMarks: 1.0,
        awardedMarks: 0.5,
        fulfilled: false,
        examinerNote: 'Partially stated; omitted the formal proof that dependency (Student, Subject)->Teacher cannot be preserved in decomposed schemas.'
      }
    ],
    missingCriteria: [
      'Did not explicitly show that testing (Student, Subject)->Teacher requires expensive multi-relation join in decomposed BCNF schema.'
    ],
    misconceptions: [
      'Be careful: In 3NF, Y only needs to be a single prime attribute, not necessarily the entire candidate key.'
    ],
    masteryDelta: {
      before: currentTopic.masteryPercentage,
      after: Math.min(100, currentTopic.masteryPercentage + 20)
    }
  });

  const [hasAppealed, setHasAppealed] = useState<boolean>(false);

  const wordCount = studentAnswerText.trim().split(/\s+/).filter(Boolean).length;
  const content = currentTopic.pedagogicalContent;

  const handleDiagnosticSubmit = (index: number) => {
    setSelectedDiagnosticOption(index);
    setDiagnosticSubmitted(true);
  };

  const handleInsertSQLTemplate = (snippet: string) => {
    setStudentAnswerText((prev) => prev + '\n\n' + snippet);
  };

  const handleSubmitAnswer = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      const newScore = 4.5;
      const beforeMastery = currentTopic.masteryPercentage;
      const afterMastery = Math.min(100, beforeMastery + 18);
      onUpdateTopicMastery(currentTopic.id, afterMastery);

      setSubmission({
        id: `sub-${Date.now()}`,
        topicId: currentTopic.id,
        questionText: 'Differentiate between 3NF and BCNF with a relation that is in 3NF but violates BCNF. State the impact on dependency preservation.',
        questionType: 'Conceptual',
        totalMarks: 5.0,
        studentAnswer: studentAnswerText,
        submittedAt: 'Just now',
        status: 'evaluated',
        score: newScore,
        verifierShield: true,
        rubrics: [
          {
            id: 'r-1',
            criterion: 'Precise definition of Functional Dependency and candidate keys identified',
            allocatedMarks: 1.0,
            awardedMarks: 1.0,
            fulfilled: true,
            examinerNote: 'Accurately stated tuple-equivalence rule and candidate key combinations.'
          },
          {
            id: 'r-2',
            criterion: 'Distinction between 3NF (prime attribute exemption) and strict BCNF superkey condition',
            allocatedMarks: 1.5,
            awardedMarks: 1.5,
            fulfilled: true,
            examinerNote: 'Clear breakdown of LHS superkey rule and prime attribute clause.'
          },
          {
            id: 'r-3',
            criterion: 'Valid worked counter-example relation demonstrating 3NF vs BCNF',
            allocatedMarks: 1.5,
            awardedMarks: 1.5,
            fulfilled: true,
            examinerNote: 'Standard Student-Teacher-Subject schema provided with valid FDs.'
          },
          {
            id: 'r-4',
            criterion: 'Impact on Dependency Preservation and Lossless Join analyzed during BCNF decomposition',
            allocatedMarks: 1.0,
            awardedMarks: 0.5,
            fulfilled: false,
            examinerNote: 'Partially stated; omitted the formal proof that dependency (Student, Subject)->Teacher cannot be preserved in decomposed schemas.'
          }
        ],
        missingCriteria: [
          'Explicit proof of lost dependency (Student, Subject) -> Teacher in decomposed schema R1(Teacher, Subject) and R2(Student, Teacher).'
        ],
        misconceptions: [
          'In RGPV marking, always explicitly state whether the decomposition achieves both lossless join and dependency preservation.'
        ],
        masteryDelta: {
          before: beforeMastery,
          after: afterMastery
        }
      });
    }, 1400);
  };

  const handleRequestAppeal = () => {
    setHasAppealed(true);
    onTriggerHitlAppeal(`Quiz Evaluation Appeal for ${currentTopic.title} (Question 4.5/5.0 Marks Review)`);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Top Controller Bar: Topic Selection & Language Toggle */}
      <div className="border border-[#27272a] rounded-xl bg-[#18181b] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-zinc-400">Current Study Topic:</span>
              <select
                value={currentTopic.id}
                onChange={(e) => onSelectTopic(e.target.value)}
                className="bg-[#121214] border border-[#27272a] rounded px-2.5 py-1 text-xs font-bold text-zinc-100 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                {allUnits.flatMap((u) => u.topics).map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title} (Mastery: {t.masteryPercentage}%)
                  </option>
                ))}
              </select>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Source-grounded pedagogical reader paired with rubric-based verification agent.
            </p>
          </div>
        </div>

        {/* Language Pill Switcher */}
        <div className="flex items-center gap-3 self-start md:self-auto">
          <div className="flex items-center p-1 rounded-lg bg-[#121214] border border-zinc-800 text-xs">
            <button
              onClick={() => onLanguageChange('en')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                language === 'en'
                  ? 'bg-zinc-800 text-white font-semibold shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              English (RGPV Academic)
            </button>
            <button
              onClick={() => onLanguageChange('hi')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                language === 'hi'
                  ? 'bg-indigo-600/30 text-indigo-300 font-semibold border border-indigo-500/30'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Hinglish (Intuitive Indian Examples)
            </button>
          </div>
        </div>
      </div>

      {/* Two-Column Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ========================================================================= */}
        {/* Left Column: Standardized 7-Section Pedagogical Reader (7 cols)            */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 space-y-5">
          {/* Section 1: 📌 Core Concept Definition */}
          <div className="border border-[#27272a] rounded-xl bg-[#18181b] p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="text-indigo-400 font-mono text-sm">01.</span>
                <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-1.5">
                  <span>Core Concept Definition</span>
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                Syllabus Anchor
              </span>
            </div>

            <p className="text-sm text-zinc-200 leading-relaxed font-sans">
              {language === 'en' ? content.coreDefinition.en : content.coreDefinition.hi}
            </p>
          </div>

          {/* Section 2: 💡 Intuitive Analogy */}
          <div className="border border-[#27272a] rounded-xl bg-[#18181b] p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="text-amber-400 font-mono text-sm">02.</span>
                <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  <span>Intuitive Real-World Analogy</span>
                </h3>
              </div>
              <span className="text-xs text-zinc-400 font-mono">
                {content.analogy.title}
              </span>
            </div>

            <div className="p-3.5 rounded-lg bg-amber-950/20 border border-amber-500/20 text-xs text-amber-200/90 leading-relaxed space-y-2">
              <p>
                {language === 'en' ? content.analogy.en : content.analogy.hi}
              </p>
            </div>
          </div>

          {/* Section 3: 📝 Worked Step-by-Step RGPV Example */}
          <div className="border border-[#27272a] rounded-xl bg-[#18181b] p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-mono text-sm">03.</span>
                <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-1.5">
                  <FileCode className="w-4 h-4 text-emerald-400" />
                  <span>Worked Step-by-Step RGPV Example</span>
                </h3>
              </div>
              <span className="text-xs font-mono text-emerald-400">
                10-Mark Standard Proof
              </span>
            </div>

            <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 font-medium">
              <span className="text-zinc-500 font-mono block text-[11px] mb-1">Problem Statement:</span>
              "{content.workedExample.problemStatement}"
            </div>

            <div className="space-y-3">
              {content.workedExample.stepByStepSolution.map((step) => (
                <div key={step.step} className="p-3.5 rounded-lg bg-[#121214] border border-[#27272a] space-y-2 text-xs">
                  <div className="flex items-center gap-2 font-mono text-indigo-400 font-semibold">
                    <span>Step {step.step}:</span>
                    <span className="text-zinc-200 font-sans">{step.title}</span>
                  </div>
                  <p className="text-zinc-300 leading-relaxed whitespace-pre-line">
                    {step.content}
                  </p>
                  {step.codeSnippet && (
                    <div className="p-2.5 rounded bg-black/60 border border-zinc-800 font-mono text-[11px] text-emerald-300 overflow-x-auto">
                      <pre>{step.codeSnippet}</pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: ⚠️ Common Exam Mistakes */}
          <div className="border border-[#27272a] rounded-xl bg-[#18181b] p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="text-rose-400 font-mono text-sm">04.</span>
                <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>Common Exam Mistakes (Where Examiners Deduct Marks)</span>
                </h3>
              </div>
              <span className="text-xs font-mono text-rose-400">Examiner Penalty Radar</span>
            </div>

            <div className="space-y-2.5">
              {content.commonMistakes.map((item, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-rose-950/20 border border-rose-500/20 space-y-1.5 text-xs">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold text-rose-300">
                      ✗ {item.mistake}
                    </span>
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-200 shrink-0">
                      {item.penalty}
                    </span>
                  </div>
                  <p className="text-zinc-300 text-[11px]">
                    <strong className="text-emerald-400 font-mono">Remedy:</strong> {item.remedy}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: 🎯 Frequent RGPV Exam Pattern */}
          <div className="border border-[#27272a] rounded-xl bg-[#18181b] p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="text-purple-400 font-mono text-sm">05.</span>
                <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-purple-400" />
                  <span>Frequent RGPV Exam Formulation</span>
                </h3>
              </div>
              <span className="text-xs font-mono text-purple-300">
                {content.examPattern.standardMarks} Marks Compulsory
              </span>
            </div>

            <div className="p-3.5 rounded-lg bg-[#121214] border border-[#27272a] space-y-2 text-xs">
              <p className="font-mono font-medium text-zinc-200">
                "{content.examPattern.typicalQuestion}"
              </p>
              <div className="pt-2 border-t border-zinc-800 text-[11px] text-zinc-400">
                <strong className="text-indigo-400 font-mono">Grading Rubric Breakdown:</strong>{' '}
                {content.examPattern.gradingRubricHighlight}
              </div>
            </div>
          </div>

          {/* Section 6: ⏱️ Mini 1-Minute Diagnostic Check */}
          <div className="border border-[#27272a] rounded-xl bg-[#18181b] p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="text-cyan-400 font-mono text-sm">06.</span>
                <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-1.5">
                  <Timer className="w-4 h-4 text-cyan-400" />
                  <span>Mini 1-Minute Diagnostic Recall Check</span>
                </h3>
              </div>
              <span className="text-xs font-mono text-zinc-400">Instant Check</span>
            </div>

            <p className="text-xs font-medium text-zinc-200">
              {content.diagnosticCheck.question}
            </p>

            <div className="space-y-2">
              {content.diagnosticCheck.options.map((option, idx) => {
                const isSelected = selectedDiagnosticOption === idx;
                const isCorrect = idx === content.diagnosticCheck.correctAnswerIndex;
                let btnStyle = 'bg-[#121214] border-[#27272a] text-zinc-300 hover:border-zinc-700';

                if (diagnosticSubmitted) {
                  if (isCorrect) {
                    btnStyle = 'bg-emerald-950/40 border-emerald-500 text-emerald-200 font-semibold';
                  } else if (isSelected && !isCorrect) {
                    btnStyle = 'bg-rose-950/40 border-rose-500 text-rose-200';
                  }
                } else if (isSelected) {
                  btnStyle = 'bg-zinc-800 border-indigo-500 text-white';
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={diagnosticSubmitted}
                    onClick={() => handleDiagnosticSubmit(idx)}
                    className={`w-full text-left p-3 rounded-lg border text-xs transition-colors flex items-center justify-between cursor-pointer ${btnStyle}`}
                  >
                    <span>{option}</span>
                    {diagnosticSubmitted && isCorrect && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                    {diagnosticSubmitted && isSelected && !isCorrect && (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {diagnosticSubmitted && (
              <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 space-y-1 animate-in fade-in duration-200">
                <span className="font-semibold text-emerald-400 font-mono">Explanation:</span>
                <p>{content.diagnosticCheck.explanation}</p>
              </div>
            )}
          </div>

          {/* Section 7: 📑 Source Citations */}
          <div className="border border-[#27272a] rounded-xl bg-[#18181b] p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="text-zinc-400 font-mono text-sm">07.</span>
                <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-zinc-400" />
                  <span>Verifiable Academic Citations & Bounding Box Proofs</span>
                </h3>
              </div>
              <span className="text-xs font-mono text-zinc-500">Hallucination Barrier</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {content.citations.map((cite) => (
                <button
                  key={cite.id}
                  onClick={() => onOpenCitation(cite)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-300 font-mono hover:text-indigo-400 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span>[{cite.docName}, Page {cite.page}]</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500" />
                </button>
              ))}
            </div>
            <p className="text-[11px] text-zinc-500 italic">
              Click any citation pill to inspect the actual scanned textbook/exam paper bounding box coordinates.
            </p>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* Right Column: Interactive Rubric-Based Quiz Runner & Evaluation Agent     */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 space-y-5 sticky top-20">
          <div className="border border-[#27272a] rounded-xl bg-[#18181b] p-5 space-y-4 shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-indigo-500/10 text-indigo-400">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-100">
                    Rubric Quiz & Answer Evaluator
                  </h3>
                  <span className="text-[11px] text-zinc-400 font-mono">
                    Topic: {currentTopic.title}
                  </span>
                </div>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                [5 Marks Target]
              </span>
            </div>

            {/* Question Prompt Card */}
            <div className="p-3.5 rounded-lg bg-[#121214] border border-[#27272a] space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                  Conceptual Problem
                </span>
                <span className="text-[10px] font-mono text-zinc-500">
                  RGPV University Standard Marking
                </span>
              </div>
              <p className="font-medium text-zinc-200 leading-relaxed font-sans">
                "Differentiate between 3NF and BCNF with a relation that is in 3NF but violates BCNF. State the impact on dependency preservation."
              </p>
            </div>

            {/* Student Answer Area with SQL snippet helpers & word counter */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span className="font-medium text-zinc-300">Your Detailed Answer:</span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-zinc-500">
                    {wordCount} words
                  </span>
                </div>
              </div>

              {/* Quick Snippet Helpers */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] font-mono">
                <span className="text-zinc-500 text-[10px]">Insert:</span>
                <button
                  type="button"
                  onClick={() => handleInsertSQLTemplate('R(A, B, C, D) with FDs { A->B, BC->D }')}
                  className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors cursor-pointer"
                >
                  + Schema R(A,B,C)
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertSQLTemplate('Candidate Keys: {A, B}+ = {A, B, C, D}')}
                  className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors cursor-pointer"
                >
                  + Key Closure
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertSQLTemplate('SELECT * FROM R WHERE ...')}
                  className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors cursor-pointer"
                >
                  + SQL
                </button>
              </div>

              <textarea
                rows={8}
                value={studentAnswerText}
                onChange={(e) => setStudentAnswerText(e.target.value)}
                placeholder="Type your structured answer with definitions, schemas, and counter-examples..."
                className="w-full bg-[#121214] border border-[#27272a] rounded-lg p-3 font-mono text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 leading-relaxed transition-colors resize-y"
              />
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-zinc-500">
                Evaluated against RGPV 4-point rubric
              </span>
              <button
                type="button"
                disabled={isVerifying || !studentAnswerText.trim()}
                onClick={handleSubmitAnswer}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50 cursor-pointer"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Evaluating Rubric Points...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Answer for Verification</span>
                  </>
                )}
              </button>
            </div>

            {/* Grading & Verification Result Card */}
            {submission && submission.status === 'evaluated' && (
              <div className="pt-4 border-t border-zinc-800 space-y-4 animate-in fade-in duration-200">
                {/* Score Header */}
                <div className="p-3.5 rounded-lg bg-emerald-950/20 border border-emerald-500/20 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-emerald-400 font-mono block">
                      Awarded Exam Marks:
                    </span>
                    <div className="text-xl font-bold font-mono text-white mt-0.5">
                      {submission.score} <span className="text-xs text-zinc-400 font-normal">/ {submission.totalMarks} Marks</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-xs font-medium">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Verified by Verifier Agent</span>
                  </div>
                </div>

                {/* Rubric Criteria Evaluation List */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-zinc-300 font-mono block">
                    Detailed Rubric Fulfillment Matrix:
                  </span>
                  <div className="space-y-1.5">
                    {submission.rubrics?.map((rubric) => (
                      <div
                        key={rubric.id}
                        className={`p-2.5 rounded-lg border text-xs space-y-1 ${
                          rubric.fulfilled
                            ? 'bg-[#121214] border-emerald-500/20'
                            : 'bg-amber-950/10 border-amber-500/20'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-1.5 min-w-0">
                            {rubric.fulfilled ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            ) : (
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                            )}
                            <span className="text-zinc-200 font-medium text-[11px] leading-tight">
                              {rubric.criterion}
                            </span>
                          </div>
                          <span className="font-mono text-[11px] text-zinc-400 shrink-0">
                            {rubric.awardedMarks} / {rubric.allocatedMarks}M
                          </span>
                        </div>
                        <p className="text-[10px] text-zinc-500 pl-5">
                          {rubric.examinerNote}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Missing Criteria / Pitfalls */}
                {submission.missingCriteria && submission.missingCriteria.length > 0 && (
                  <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-500/20 text-xs text-amber-200 space-y-1">
                    <span className="font-semibold text-amber-300 flex items-center gap-1 font-mono text-[11px]">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      Missing Examiner Criteria:
                    </span>
                    <ul className="list-disc list-inside text-[11px] space-y-0.5 text-zinc-300">
                      {submission.missingCriteria.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Misconceptions Box */}
                {submission.misconceptions && submission.misconceptions.length > 0 && (
                  <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-500/20 text-xs text-rose-200 space-y-1">
                    <span className="font-semibold text-rose-300 font-mono text-[11px]">
                      Examiner Misconception Flag:
                    </span>
                    <p className="text-[11px] text-zinc-300">
                      {submission.misconceptions[0]}
                    </p>
                  </div>
                )}

                {/* Topic Mastery Delta */}
                {submission.masteryDelta && (
                  <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-400">Topic Mastery Delta:</span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      {submission.masteryDelta.before}% &rarr; {submission.masteryDelta.after}% (+{submission.masteryDelta.after - submission.masteryDelta.before}%)
                    </span>
                  </div>
                )}

                {/* Human-In-The-Loop Appeal Action */}
                <div className="pt-2 flex justify-between items-center text-xs">
                  <span className="text-zinc-500 text-[11px]">
                    Disagree with verifier rubrics?
                  </span>
                  {!hasAppealed ? (
                    <button
                      type="button"
                      onClick={handleRequestAppeal}
                      className="px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs border border-zinc-700 transition-colors cursor-pointer"
                    >
                      Request Human/Instructor Appeal
                    </button>
                  ) : (
                    <span className="text-amber-400 font-mono text-[11px]">
                      ✓ Appeal Queued for Instructor Review
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
