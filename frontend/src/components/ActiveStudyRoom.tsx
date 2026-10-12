import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Lightbulb, 
  FileCode, 
  AlertTriangle, 
  Target, 
  Timer, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  ArrowUpRight, 
  ArrowRight,
  Send,
  Award,
  FileCheck
} from 'lucide-react';
import { Topic, Language, Unit, QuizSubmission, RubricItem } from '../types';

interface ActiveStudyRoomProps {
  currentTopic: Topic | null;
  allUnits: Unit[];
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onSelectTopic: (topicId: string) => void;
  onOpenCitation: (citation: any) => void;
  onUpdateTopicMastery: (topicId: string, newMastery: number) => void;
  onTriggerHitlAppeal: (reason: string) => void;
  onGoToSetup: () => void;
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
  onGoToSetup,
}) => {
  // Diagnostic state (starts blank)
  const [selectedDiagnosticOption, setSelectedDiagnosticOption] = useState<number | null>(null);
  const [diagnosticSubmitted, setDiagnosticSubmitted] = useState<boolean>(false);

  // Quiz submission state — starts completely empty (no pre-written answer, no pre-graded result)
  const [customQuestionText, setCustomQuestionText] = useState<string>('');
  const [isEditingQuestion, setIsEditingQuestion] = useState<boolean>(false);
  const [studentAnswerText, setStudentAnswerText] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [submission, setSubmission] = useState<QuizSubmission | null>(null);
  const [hasAppealed, setHasAppealed] = useState<boolean>(false);

  // Reset state whenever user switches to a different topic
  useEffect(() => {
    setSelectedDiagnosticOption(null);
    setDiagnosticSubmitted(false);
    setStudentAnswerText('');
    setSubmission(null);
    setHasAppealed(false);
    setIsEditingQuestion(false);
    if (currentTopic) {
      setCustomQuestionText(currentTopic.pedagogicalContent.examPattern.typicalQuestion);
    }
  }, [currentTopic?.id]);

  if (!currentTopic || allUnits.length === 0) {
    return (
      <div className="max-w-3xl mx-auto my-12 border border-[#27272a] rounded-xl bg-[#18181b] p-8 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mx-auto">
          <FileCheck className="w-6 h-6" />
        </div>
        <h1 className="text-lg font-bold text-zinc-100">
          Study Room Ready After Setup
        </h1>
        <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
          Complete Step 1 by setting up your subject and uploading your course files so we can load your topic notes and practice questions.
        </p>
        <button
          onClick={onGoToSetup}
          className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors inline-flex items-center gap-2 cursor-pointer"
        >
          <span>Go to Step 1: Setup &amp; Documents</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  const wordCount = studentAnswerText.trim().split(/\s+/).filter(Boolean).length;
  const content = currentTopic.pedagogicalContent;
  const activeQuestion =
    customQuestionText.trim() || content.examPattern.typicalQuestion;
  const totalMarks = content.examPattern.standardMarks || 7;

  const handleDiagnosticSubmit = (index: number) => {
    setSelectedDiagnosticOption(index);
    setDiagnosticSubmitted(true);
  };

  const handleInsertTemplate = (snippet: string) => {
    setStudentAnswerText((prev) => (prev ? prev + '\n\n' + snippet : snippet));
  };

  // Evaluate what the student actually wrote against topic concepts & rubrics
  const handleSubmitAnswer = () => {
    setIsVerifying(true);

    setTimeout(() => {
      setIsVerifying(false);
      const answerLower = studentAnswerText.toLowerCase();

      // Check for adversarial prompt injection attempts
      const injectionPatterns = [
        'ignore previous',
        'ignore all instructions',
        'give full marks',
        'award 100%',
        'system prompt',
      ];
      const hasInjection = injectionPatterns.some((pat) => answerLower.includes(pat));

      if (hasInjection) {
        setSubmission({
          id: `sub-${Date.now()}`,
          topicId: currentTopic.id,
          questionText: activeQuestion,
          questionType: 'Conceptual',
          totalMarks,
          studentAnswer: studentAnswerText,
          submittedAt: 'Just now',
          status: 'evaluated',
          score: 0,
          verifierShield: true,
          rubrics: [
            {
              id: 'r-sec',
              criterion: 'Valid academic response without grading manipulation instructions',
              allocatedMarks: totalMarks,
              awardedMarks: 0,
              fulfilled: false,
              examinerNote: 'Detected grading override instruction in answer text. Please write a genuine subject answer.',
            },
          ],
          missingCriteria: ['Please remove instruction-override phrases and answer the question directly.'],
          misconceptions: [],
          masteryDelta: {
            before: currentTopic.masteryPercentage,
            after: currentTopic.masteryPercentage,
          },
        });
        return;
      }

      // Extract significant keywords from topic title and definition
      const rawKeywords = `${currentTopic.title} ${content.coreDefinition.en}`
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter((w) => w.length >= 5);
      const uniqueKeywords = Array.from(new Set(rawKeywords)).slice(0, 12);
      const matchedKeywords = uniqueKeywords.filter((kw) => answerLower.includes(kw));
      const keywordRatio =
        uniqueKeywords.length > 0 ? matchedKeywords.length / uniqueKeywords.length : 0.5;

      // Check structural elements
      const hasDefinitionWords = wordCount >= 18 && keywordRatio >= 0.2;
      const hasExampleOrSchema =
        answerLower.includes('example') ||
        answerLower.includes('consider') ||
        answerLower.includes('select ') ||
        answerLower.includes('->') ||
        answerLower.includes('step') ||
        answerLower.includes('table') ||
        wordCount >= 45;
      const hasDepth = wordCount >= 65 && keywordRatio >= 0.35;

      const c1Alloc = Number((totalMarks * 0.3).toFixed(1));
      const c2Alloc = Number((totalMarks * 0.4).toFixed(1));
      const c3Alloc = Number((totalMarks - c1Alloc - c2Alloc).toFixed(1));

      const c1Awarded = hasDefinitionWords
        ? c1Alloc
        : wordCount >= 8
        ? Number((c1Alloc * 0.5).toFixed(1))
        : 0;
      const c2Awarded = hasExampleOrSchema
        ? c2Alloc
        : wordCount >= 25
        ? Number((c2Alloc * 0.5).toFixed(1))
        : 0;
      const c3Awarded = hasDepth
        ? c3Alloc
        : wordCount >= 35
        ? Number((c3Alloc * 0.5).toFixed(1))
        : 0;

      const totalAwarded = Number((c1Awarded + c2Awarded + c3Awarded).toFixed(1));
      const scorePct = totalAwarded / totalMarks;

      const rubrics: RubricItem[] = [
        {
          id: 'r-1',
          criterion: `Core definition & key concepts of ${currentTopic.title}`,
          allocatedMarks: c1Alloc,
          awardedMarks: c1Awarded,
          fulfilled: c1Awarded === c1Alloc,
          examinerNote:
            c1Awarded === c1Alloc
              ? 'Covered core terminology clearly.'
              : 'Include a clearer formal definition and key technical terms.',
        },
        {
          id: 'r-2',
          criterion: 'Worked example, diagram notation, or schema illustration',
          allocatedMarks: c2Alloc,
          awardedMarks: c2Awarded,
          fulfilled: c2Awarded === c2Alloc,
          examinerNote:
            c2Awarded === c2Alloc
              ? 'Included concrete example/notation.'
              : 'Add a concrete example relation, diagram steps, or SQL/formula snippet.',
        },
        {
          id: 'r-3',
          criterion: 'Completeness & exam rubric points (' + content.examPattern.gradingRubricHighlight + ')',
          allocatedMarks: c3Alloc,
          awardedMarks: c3Awarded,
          fulfilled: c3Awarded === c3Alloc,
          examinerNote:
            c3Awarded === c3Alloc
              ? 'Addressed full university marking scheme.'
              : 'Expand your explanation to cover all parts of the question.',
        },
      ];

      const missing: string[] = [];
      if (!hasDefinitionWords) {
        missing.push(`Define ${currentTopic.title} formally in your opening paragraph.`);
      }
      if (!hasExampleOrSchema) {
        missing.push('Include a concrete example, table schema, or step-by-step derivation.');
      }
      if (!hasDepth) {
        missing.push(`Cover all rubric points: ${content.examPattern.gradingRubricHighlight}`);
      }

      const beforeMastery = currentTopic.masteryPercentage;
      const afterMastery = Math.max(
        0,
        Math.min(
          100,
          Math.round(0.6 * (scorePct * 100) + 0.4 * beforeMastery)
        )
      );
      onUpdateTopicMastery(currentTopic.id, afterMastery);

      setSubmission({
        id: `sub-${Date.now()}`,
        topicId: currentTopic.id,
        questionText: activeQuestion,
        questionType: 'Conceptual',
        totalMarks,
        studentAnswer: studentAnswerText,
        submittedAt: 'Just now',
        status: 'evaluated',
        score: totalAwarded,
        verifierShield: true,
        rubrics,
        missingCriteria: missing,
        misconceptions:
          scorePct < 0.7 && content.commonMistakes[0]
            ? [`Tip: Avoid "${content.commonMistakes[0].mistake}" — ${content.commonMistakes[0].remedy}`]
            : [],
        masteryDelta: {
          before: beforeMastery,
          after: afterMastery,
        },
      });
    }, 600);
  };

  const handleRequestAppeal = () => {
    setHasAppealed(true);
    onTriggerHitlAppeal(
      `Review requested for ${currentTopic.title} (${submission?.score}/${totalMarks} Marks)`
    );
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
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono text-zinc-400">Select Topic:</span>
              <select
                value={currentTopic.id}
                onChange={(e) => onSelectTopic(e.target.value)}
                className="bg-[#121214] border border-[#27272a] rounded px-2.5 py-1 text-xs font-bold text-zinc-100 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                {allUnits.flatMap((u) => u.topics).map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title} (Familiarity: {t.masteryPercentage}%)
                  </option>
                ))}
              </select>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Read the structured topic notes on the left, then write and check your practice answer on the right.
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
              English Notes
            </button>
            <button
              onClick={() => onLanguageChange('hi')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                language === 'hi'
                  ? 'bg-indigo-600/30 text-indigo-300 font-semibold border border-indigo-500/30'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Hinglish Notes
            </button>
          </div>
        </div>
      </div>

      {/* Two-Column Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Topic Study Notes (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Section 1: Core Concept Definition */}
          <div className="border border-[#27272a] rounded-xl bg-[#18181b] p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="text-indigo-400 font-mono text-sm">01.</span>
                <h3 className="text-sm font-semibold text-zinc-100">
                  Core Concept &amp; Definition
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                Syllabus Topic
              </span>
            </div>

            <p className="text-sm text-zinc-200 leading-relaxed font-sans">
              {language === 'en' ? content.coreDefinition.en : content.coreDefinition.hi}
            </p>
          </div>

          {/* Section 2: Real-World Analogy */}
          <div className="border border-[#27272a] rounded-xl bg-[#18181b] p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="text-amber-400 font-mono text-sm">02.</span>
                <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  <span>Easy-to-Remember Analogy</span>
                </h3>
              </div>
              <span className="text-xs text-zinc-400 font-mono">
                {content.analogy.title}
              </span>
            </div>

            <div className="p-3.5 rounded-lg bg-amber-950/20 border border-amber-500/20 text-xs text-amber-200/90 leading-relaxed">
              <p>
                {language === 'en' ? content.analogy.en : content.analogy.hi}
              </p>
            </div>
          </div>

          {/* Section 3: Worked Step-by-Step Example */}
          <div className="border border-[#27272a] rounded-xl bg-[#18181b] p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-mono text-sm">03.</span>
                <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-1.5">
                  <FileCode className="w-4 h-4 text-emerald-400" />
                  <span>Solved Exam Example</span>
                </h3>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 font-medium">
              <span className="text-zinc-500 font-mono block text-[11px] mb-1">Question:</span>
              &ldquo;{content.workedExample.problemStatement}&rdquo;
            </div>

            <div className="space-y-3">
              {content.workedExample.stepByStepSolution.map((step) => (
                <div
                  key={step.step}
                  className="p-3.5 rounded-lg bg-[#121214] border border-[#27272a] space-y-2 text-xs"
                >
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

          {/* Section 4: Common Exam Mistakes */}
          <div className="border border-[#27272a] rounded-xl bg-[#18181b] p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="text-rose-400 font-mono text-sm">04.</span>
                <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>Common Mistakes to Avoid in Exam</span>
                </h3>
              </div>
            </div>

            <div className="space-y-2.5">
              {content.commonMistakes.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-rose-950/20 border border-rose-500/20 space-y-1.5 text-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold text-rose-300">
                      ✗ {item.mistake}
                    </span>
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-200 shrink-0">
                      {item.penalty}
                    </span>
                  </div>
                  <p className="text-zinc-300 text-[11px]">
                    <strong className="text-emerald-400 font-mono">How to fix:</strong>{' '}
                    {item.remedy}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Frequent Exam Pattern */}
          <div className="border border-[#27272a] rounded-xl bg-[#18181b] p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="text-purple-400 font-mono text-sm">05.</span>
                <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-purple-400" />
                  <span>Typical University Question Pattern</span>
                </h3>
              </div>
              <span className="text-xs font-mono text-purple-300">
                {content.examPattern.standardMarks} Marks
              </span>
            </div>

            <div className="p-3.5 rounded-lg bg-[#121214] border border-[#27272a] space-y-2 text-xs">
              <p className="font-mono font-medium text-zinc-200">
                &ldquo;{content.examPattern.typicalQuestion}&rdquo;
              </p>
              <div className="pt-2 border-t border-zinc-800 text-[11px] text-zinc-400">
                <strong className="text-indigo-400 font-mono">Key Points to Include:</strong>{' '}
                {content.examPattern.gradingRubricHighlight}
              </div>
            </div>
          </div>

          {/* Section 6: Quick 1-Question MCQ Check */}
          <div className="border border-[#27272a] rounded-xl bg-[#18181b] p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="text-cyan-400 font-mono text-sm">06.</span>
                <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-1.5">
                  <Timer className="w-4 h-4 text-cyan-400" />
                  <span>Quick Concept Check (MCQ)</span>
                </h3>
              </div>
              {diagnosticSubmitted && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDiagnosticOption(null);
                    setDiagnosticSubmitted(false);
                  }}
                  className="text-[11px] text-indigo-400 hover:underline cursor-pointer"
                >
                  Retry MCQ
                </button>
              )}
            </div>

            <p className="text-xs font-medium text-zinc-200">
              {content.diagnosticCheck.question}
            </p>

            <div className="space-y-2">
              {content.diagnosticCheck.options.map((option, idx) => {
                const isSelected = selectedDiagnosticOption === idx;
                const isCorrect = idx === content.diagnosticCheck.correctAnswerIndex;
                let btnStyle =
                  'bg-[#121214] border-[#27272a] text-zinc-300 hover:border-zinc-700';

                if (diagnosticSubmitted) {
                  if (isCorrect) {
                    btnStyle =
                      'bg-emerald-950/40 border-emerald-500 text-emerald-200 font-semibold';
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
              <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 space-y-1">
                <span className="font-semibold text-emerald-400 font-mono">Explanation:</span>
                <p>{content.diagnosticCheck.explanation}</p>
              </div>
            )}
          </div>

          {/* Section 7: Source Citations */}
          <div className="border border-[#27272a] rounded-xl bg-[#18181b] p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="text-zinc-400 font-mono text-sm">07.</span>
                <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-zinc-400" />
                  <span>PDF Page References</span>
                </h3>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {content.citations.map((cite) => (
                <button
                  key={cite.id}
                  onClick={() => onOpenCitation(cite)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-300 font-mono hover:text-indigo-400 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span>
                    [{cite.docName}, Page {cite.page}]
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Blank-Slate Practice Answer Box & Rubric Checker (5 cols) */}
        <div className="lg:col-span-5 space-y-5 sticky top-20">
          <div className="border border-[#27272a] rounded-xl bg-[#18181b] p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-indigo-500/10 text-indigo-400">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-100">
                    Write &amp; Check Practice Answer
                  </h3>
                  <span className="text-[11px] text-zinc-400 font-mono">
                    {currentTopic.title}
                  </span>
                </div>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                [{totalMarks} Marks]
              </span>
            </div>

            {/* Question Prompt Card (with option for user to enter their own question) */}
            <div className="p-3.5 rounded-lg bg-[#121214] border border-[#27272a] space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                  Practice Question
                </span>
                <button
                  type="button"
                  onClick={() => setIsEditingQuestion(!isEditingQuestion)}
                  className="text-[11px] text-indigo-400 hover:underline cursor-pointer"
                >
                  {isEditingQuestion ? 'Done Editing' : 'Use Custom Question'}
                </button>
              </div>

              {isEditingQuestion ? (
                <textarea
                  rows={3}
                  value={customQuestionText}
                  onChange={(e) => setCustomQuestionText(e.target.value)}
                  placeholder="Paste or type your own exam question here..."
                  className="w-full bg-[#18181b] border border-zinc-700 rounded p-2 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
                />
              ) : (
                <p className="font-medium text-zinc-200 leading-relaxed font-sans">
                  &ldquo;{activeQuestion}&rdquo;
                </p>
              )}
            </div>

            {/* Student Answer Area — Starts Empty! */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span className="font-medium text-zinc-300">Your Answer:</span>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-mono text-zinc-500">
                    {wordCount} words
                  </span>
                  {studentAnswerText && (
                    <button
                      type="button"
                      onClick={() => {
                        setStudentAnswerText('');
                        setSubmission(null);
                      }}
                      className="text-[11px] text-zinc-500 hover:text-rose-400 cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Quick Snippet Helpers */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] font-mono">
                <span className="text-zinc-500 text-[10px]">Insert template:</span>
                <button
                  type="button"
                  onClick={() =>
                    handleInsertTemplate('Definition:\n\nExample / Schema:\n\nKey Properties:')
                  }
                  className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors cursor-pointer"
                >
                  + Answer Outline
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleInsertTemplate('Consider Relation R(A, B, C, D) with FDs:\n')
                  }
                  className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors cursor-pointer"
                >
                  + Relation R(A,B,C)
                </button>
              </div>

              <textarea
                rows={8}
                value={studentAnswerText}
                onChange={(e) => setStudentAnswerText(e.target.value)}
                placeholder="Write your exam answer here from scratch (include definition, example/diagram steps, and key points)..."
                className="w-full bg-[#121214] border border-[#27272a] rounded-lg p-3 font-mono text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 leading-relaxed transition-colors resize-y"
              />
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-zinc-500">
                Checked against {totalMarks}-mark rubric
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
                    <span>Checking Answer...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Evaluate My Answer</span>
                  </>
                )}
              </button>
            </div>

            {/* Grading Result Card (Only shown AFTER the student actually submits an answer!) */}
            {submission && submission.status === 'evaluated' && (
              <div className="pt-4 border-t border-zinc-800 space-y-4">
                <div className="p-3.5 rounded-lg bg-emerald-950/20 border border-emerald-500/20 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-emerald-400 font-mono block">
                      Score Awarded:
                    </span>
                    <div className="text-xl font-bold font-mono text-white mt-0.5">
                      {submission.score}{' '}
                      <span className="text-xs text-zinc-400 font-normal">
                        / {submission.totalMarks} Marks
                      </span>
                    </div>
                  </div>

                  {submission.masteryDelta && (
                    <div className="text-right font-mono text-xs">
                      <span className="text-zinc-400 block text-[10px]">Topic Mastery:</span>
                      <span className="text-emerald-400 font-semibold">
                        {submission.masteryDelta.before}% &rarr; {submission.masteryDelta.after}%
                      </span>
                    </div>
                  )}
                </div>

                {/* Rubric Breakdown */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-zinc-300 font-mono block">
                    Rubric Checklist:
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

                {/* Missing Criteria */}
                {submission.missingCriteria && submission.missingCriteria.length > 0 && (
                  <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-500/20 text-xs text-amber-200 space-y-1">
                    <span className="font-semibold text-amber-300 flex items-center gap-1 font-mono text-[11px]">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      How to improve your answer:
                    </span>
                    <ul className="list-disc list-inside text-[11px] space-y-0.5 text-zinc-300">
                      {submission.missingCriteria.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Appeal / Override Option */}
                <div className="pt-2 flex justify-between items-center text-xs">
                  <span className="text-zinc-500 text-[11px]">
                    Want to flag this score for manual review?
                  </span>
                  {!hasAppealed ? (
                    <button
                      type="button"
                      onClick={handleRequestAppeal}
                      className="px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs border border-zinc-700 transition-colors cursor-pointer"
                    >
                      Flag for Review
                    </button>
                  ) : (
                    <span className="text-amber-400 font-mono text-[11px]">
                      ✓ Flagged for Review
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
