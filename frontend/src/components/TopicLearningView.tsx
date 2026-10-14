import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  CheckCircle2,
  XCircle,
  Lightbulb,
  FileCode,
  ArrowRight,
  ExternalLink,
  PenTool,
  FileCheck,
  Target,
  Award,
  Sparkles,
  RefreshCw,
  Calculator,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import { Topic, Unit, Language } from '../types';
import {
  fetchAITopicStudyGuide,
  AITopicStudyGuideResponse
} from '../services/aiService';

interface TopicLearningViewProps {
  currentTopic: Topic | null;
  allUnits: Unit[];
  subjectCode?: string;
  subjectName?: string;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onSelectTopic: (topicId: string) => void;
  onOpenCitation?: (cite: any) => void;
  onProceedToPractice: () => void;
  onGoToSetup: () => void;
}

interface DiagramBlueprint {
  title: string;
  caption: string;
  examDrawingTip: string;
  referenceUrl: string;
  referenceLabel: string;
  nodes: Array<{ step: string; label: string; sub: string }>;
  doList: string[];
  dontList: string[];
}

function getTopicDiagramAndGuide(topic: Topic): DiagramBlueprint {
  const titleLower = topic.title.toLowerCase();

  if (titleLower.includes('er') || titleLower.includes('entity')) {
    return {
      title: 'ER Model Notation & Weak Entity Participation Diagram',
      caption: 'Standard Chen Notation required in RGPV 7/10-mark ER design questions',
      examDrawingTip:
        'Draw Strong Entities with single rectangles, Weak Entities with double rectangles, Identifying Relationships with double diamonds, and Total Participation with double lines.',
      referenceUrl: 'https://en.wikipedia.org/wiki/Entity%E2%80%93relationship_model',
      referenceLabel: 'ER Diagram Standard Notation Reference',
      nodes: [
        { step: 'Strong Entity', label: '[ Department ]', sub: 'Primary Key: Dept_ID (Underlined solid)' },
        { step: '1 : N Relation', label: '< Has / Employs >', sub: 'Diamond box connecting entities' },
        { step: 'Weak Entity', label: '[[ Dependent ]]', sub: 'Double rectangle + Dashed partial key' },
        { step: 'Total Participation', label: '=== Double Line ===', sub: 'Every weak entity must link to owner' },
      ],
      doList: [
        'Underline Primary Keys with a solid line and Weak Entity Partial Keys (Discriminators) with a dashed line.',
        'Clearly mark cardinality ratios (1:1, 1:N, M:N) on every relationship diamond.',
        'Use double lines (===) to show Total Participation and single lines (---) for Partial Participation.',
        'Convert the ER diagram into Relational Schema tables at the end for full 10/10 marks.',
      ],
      dontList: [
        'Do NOT connect two entity rectangles directly with a line—always place a Relationship Diamond in between.',
        'Do NOT draw foreign keys as ovals/attributes inside an ER diagram (FKs only appear in relational tables).',
        'Do NOT forget double rectangles and double diamonds when asked about Weak Entity Sets.',
      ],
    };
  }

  if (titleLower.includes('schema') || titleLower.includes('architecture')) {
    return {
      title: 'ANSI/SPARC Three-Schema Architecture & Data Independence Diagram',
      caption: 'Three-level abstraction showing External, Conceptual, and Physical schemas',
      examDrawingTip:
        'Always label the two mappings between levels: (1) External/Conceptual Mapping -> Logical Data Independence, and (2) Conceptual/Internal Mapping -> Physical Data Independence.',
      referenceUrl: 'https://en.wikipedia.org/wiki/Three-schema_approach',
      referenceLabel: 'ANSI-SPARC Three-Schema Reference',
      nodes: [
        { step: 'Top Layer', label: 'External Level (View 1, View 2)', sub: 'End-user tailored views & security hides' },
        { step: 'Mapping 1', label: '↕ Logical Data Independence', sub: 'Protects views from table/column changes' },
        { step: 'Middle Layer', label: 'Conceptual Schema', sub: 'Logical tables, constraints, relationships' },
        { step: 'Mapping 2', label: '↕ Physical Data Independence', sub: 'Protects logic from B+ Tree / disk changes' },
        { step: 'Bottom Layer', label: 'Internal / Physical Schema', sub: 'Disk blocks, byte offsets, indices' },
      ],
      doList: [
        'Draw all 3 levels (External, Conceptual, Internal) vertically with bidirectional arrows between them.',
        'Explicitly label where Logical Data Independence and Physical Data Independence occur on the arrows.',
        'Add a 4-row comparison table between Physical and Logical Data Independence after the diagram.',
        'Mention DBA (Database Administrator) and Storage Manager roles briefly.',
      ],
      dontList: [
        'Do NOT confuse 3-Schema Architecture (ANSI/SPARC abstraction) with 3-Tier Client-Server Architecture (UI -> App Server -> DB).',
        'Do NOT write that Logical Data Independence is easier to achieve—Physical Data Independence is easier.',
        'Do NOT leave the diagram unlabeled without showing the Physical Storage Disk at the bottom.',
      ],
    };
  }

  if (titleLower.includes('normal') || titleLower.includes('bcnf') || titleLower.includes('dependency')) {
    return {
      title: 'Normal Forms Hierarchy (1NF → 2NF → 3NF → BCNF) & Dependency Diagram',
      caption: 'Stepwise elimination of Partial and Transitive Functional Dependencies',
      examDrawingTip:
        'Draw concentric ovals (1NF ⊃ 2NF ⊃ 3NF ⊃ BCNF) and draw arrow diagrams above relation boxes R(A,B,C,D) showing Primary Key attributes underlined.',
      referenceUrl: 'https://en.wikipedia.org/wiki/Database_normalization',
      referenceLabel: 'Normalization & BCNF Diagram Reference',
      nodes: [
        { step: 'Stage 1: 1NF', label: 'Atomic Attributes Only', sub: 'Remove multi-valued & composite columns' },
        { step: 'Stage 2: 2NF', label: 'No Partial Dependency', sub: 'Non-prime attr depends on FULL candidate key' },
        { step: 'Stage 3: 3NF', label: 'No Transitive Dependency', sub: 'For X->Y: X is Superkey OR Y is Prime attr' },
        { step: 'Stage 4: BCNF', label: 'Strict Superkey Rule', sub: 'For every non-trivial X->Y: X MUST be Superkey' },
      ],
      doList: [
        'Always compute the Attribute Closure (X+) first to find all Candidate Keys before checking normal forms.',
        'Explicitly list Prime Attributes (part of any candidate key) vs Non-Prime Attributes.',
        'Write the formal condition for 3NF (X is superkey OR Y is prime) vs BCNF (X must be superkey).',
        'Verify Lossless Join condition: (R1 ∩ R2) -> R1 or (R1 ∩ R2) -> R2 when decomposing tables.',
      ],
      dontList: [
        'Do NOT check 2NF or 3NF without first finding all Candidate Keys—guessing the key loses 50% marks.',
        'Do NOT claim that BCNF decomposition is always Dependency Preserving (BCNF guarantees Lossless Join, NOT always Dependency Preservation).',
        'Do NOT stop at one candidate key if multiple candidate keys exist in the relation.',
      ],
    };
  }

  const snippetLines = (topic.pedagogicalContent.workedExample.stepByStepSolution[0]?.codeSnippet || '')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);

  const dynamicNodes: Array<{ step: string; label: string; sub: string }> =
    topic.pedagogicalContent.workedExample.stepByStepSolution.length >= 2
      ? topic.pedagogicalContent.workedExample.stepByStepSolution.map((s, idx) => ({
          step: `Stage ${idx + 1}`,
          label: s.title,
          sub: (s.codeSnippet || s.content).split('\n')[0].slice(0, 68),
        }))
      : [
          {
            step: '1. Principle / Input',
            label: topic.title.split('&')[0].trim(),
            sub: 'State formal law, assumptions, or system inputs',
          },
          {
            step: '2. Core Architecture',
            label: snippetLines[0] ? snippetLines[0].slice(0, 48) : 'Labeled Block / Circuit / Setup Diagram',
            sub: 'Draw neat schematic with arrows & parameter labels',
          },
          {
            step: '3. Governing Equation',
            label: snippetLines[1] ? snippetLines[1].slice(0, 48) : 'Step-by-Step Mathematical / Logical Derivation',
            sub: topic.pedagogicalContent.examPattern.gradingRubricHighlight.slice(0, 65),
          },
          {
            step: '4. Verified Output',
            label: 'Final Boxed Formula / Numerical Result',
            sub: 'Include SI units, boundary checks, and conclusion',
          },
        ];

  const searchSlug = encodeURIComponent(topic.title.replace(/[^a-zA-Z0-9\s]/g, ' ').trim());

  return {
    title: `${topic.title} — Exam Diagram & Stepwise Flow`,
    caption: `Required schematic & derivation flow for ${topic.pedagogicalContent.examPattern.standardMarks}-mark university questions`,
    examDrawingTip: `Rubric Distribution: ${topic.pedagogicalContent.examPattern.gradingRubricHighlight}. Always enclose your diagram and final formula inside a neat rectangular box with clear labels.`,
    referenceUrl: `https://en.wikipedia.org/w/index.php?search=${searchSlug}`,
    referenceLabel: `Reference Diagram & Notes for ${topic.title}`,
    nodes: dynamicNodes,
    doList: [
      `Follow the exact rubric breakdown: ${topic.pedagogicalContent.examPattern.gradingRubricHighlight}`,
      `Begin with a crisp 3-line formal definition of ${topic.title} and underline the key technical terms.`,
      'Draw the labeled block/circuit/schematic diagram or mathematical graph using a pencil before writing long paragraphs.',
      'Highlight the final derived formula or numerical answer in a rectangular box with proper units.',
    ],
    dontList: [
      ...topic.pedagogicalContent.commonMistakes.map(
        (m) => `Do NOT make this mistake (${m.penalty}): ${m.mistake}. Instead: ${m.remedy}`
      ),
      'Do NOT write a wall of unbroken text without subheadings, equations, or a labeled diagram.',
      'Do NOT skip intermediate substitution steps in numericals or derivations—step marks are awarded even if calculation has a minor slip.',
    ],
  };
}

export const TopicLearningView: React.FC<TopicLearningViewProps> = ({
  currentTopic,
  allUnits,
  subjectCode,
  subjectName,
  language,
  onLanguageChange,
  onSelectTopic,
  onProceedToPractice,
  onGoToSetup,
}) => {
  const [customTopicOrQuestion, setCustomTopicOrQuestion] = useState<string>('');
  const [isGeneratingAI, setIsGeneratingAI] = useState<boolean>(false);
  const [aiGuideCache, setAiGuideCache] = useState<Record<string, AITopicStudyGuideResponse>>({});
  const [activeCustomGuide, setActiveCustomGuide] = useState<AITopicStudyGuideResponse | null>(null);

  // Clear active custom override when user switches syllabus topic from dropdown
  useEffect(() => {
    setActiveCustomGuide(null);
  }, [currentTopic?.id]);

  if (!currentTopic || allUnits.length === 0) {
    return (
      <div className="max-w-3xl mx-auto my-12 border border-[#27272a] rounded-xl bg-[#18181b] p-8 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mx-auto">
          <FileCheck className="w-6 h-6" />
        </div>
        <h1 className="text-lg font-bold text-zinc-100">
          Select Your Course First to View Topic Notes &amp; Diagrams
        </h1>
        <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
          Complete Step 1 (Course Setup) so we can load your subject&apos;s detailed model answers, architecture diagrams, and exam writing guide.
        </p>
        <button
          onClick={onGoToSetup}
          className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors inline-flex items-center gap-2 cursor-pointer"
        >
          <span>Go to Step 1: Course Setup</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  const handleGenerateWithAI = async (customQuery?: string) => {
    setIsGeneratingAI(true);
    const result = await fetchAITopicStudyGuide({
      subjectCode: subjectCode || 'RGPV',
      subjectName: subjectName || 'Engineering Subject',
      topicTitle: currentTopic.title,
      customQuestion: customQuery?.trim() || undefined,
      language,
    });
    setIsGeneratingAI(false);

    if (result) {
      if (customQuery?.trim()) {
        setActiveCustomGuide(result);
      } else {
        setAiGuideCache((prev) => ({ ...prev, [currentTopic.id]: result }));
      }
    }
  };

  const activeAiData = activeCustomGuide || aiGuideCache[currentTopic.id] || null;
  const content = currentTopic.pedagogicalContent;
  const fallbackDiagramGuide = getTopicDiagramAndGuide(currentTopic);

  const displayQuestion =
    activeAiData?.typicalQuestion || content.examPattern.typicalQuestion;
  const displayMarks =
    activeAiData?.standardMarks || content.examPattern.standardMarks;
  const displayRubric =
    activeAiData?.rubricHighlight || content.examPattern.gradingRubricHighlight;
  const displayDef =
    activeAiData?.coreDefinition?.[language] || content.coreDefinition[language];
  const displayAnalogyTitle =
    activeAiData?.analogy?.title || content.analogy.title;
  const displayAnalogyText =
    activeAiData?.analogy?.[language] || content.analogy[language];
  const displayWorkedExample =
    activeAiData?.workedExample || content.workedExample;
  const displayDiagram: DiagramBlueprint =
    activeAiData?.diagramBlueprint || fallbackDiagramGuide;

  // Derived theoretical key points for comprehensive theory learning
  const theoryPoints: string[] =
    activeAiData?.theoryBulletPoints && activeAiData.theoryBulletPoints.length > 0
      ? activeAiData.theoryBulletPoints
      : [
          `Governing Principle: ${content.coreDefinition.en.split('.')[0]}.`,
          `Mathematical / Structural Formulation: ${
            displayWorkedExample.stepByStepSolution[0]?.codeSnippet?.split('\n')[0] ||
            displayWorkedExample.stepByStepSolution[0]?.title ||
            'Defined via formal boundary conditions and state equations.'
          }`,
          `Exam Weightage & Rubric Priority: ${displayRubric}.`,
          `Practical Implementation Context: ${content.analogy.en}`,
        ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Top Bar: Topic Selector, Language Switcher & Practice CTA */}
      <div className="border border-[#27272a] rounded-xl bg-[#18181b] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Step 4: Learn Topic (Theory + Numericals + Diagram)
            </span>
            <span className="text-xs font-mono text-amber-400">
              Asked {currentTopic.appearancesCount}× in Past Exams ({currentTopic.totalMarksInPast5Years} Marks)
            </span>
            {activeAiData && (
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Live Gemini AI Answer
              </span>
            )}
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-800/80 text-zinc-300 border border-zinc-700/60 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              Guardrail Shield Active
            </span>
          </div>

          <div className="flex items-center gap-3 pt-1 flex-wrap">
            <label className="text-xs text-zinc-400 font-medium">Topic:</label>
            <select
              value={currentTopic.id}
              onChange={(e) => onSelectTopic(e.target.value)}
              className="bg-[#121214] border border-[#27272a] rounded-lg px-3 py-1.5 text-sm font-semibold text-zinc-100 focus:outline-none focus:border-indigo-500 cursor-pointer max-w-full sm:max-w-md"
            >
              {allUnits.map((u) => (
                <optgroup key={u.id} label={`${u.code}: ${u.title}`}>
                  {u.topics.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title} ({t.appearancesCount}× PYQ)
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <div className="flex items-center p-0.5 rounded-lg bg-[#121214] border border-[#27272a] text-xs">
            <button
              onClick={() => onLanguageChange('en')}
              className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                language === 'en'
                  ? 'bg-zinc-800 text-white font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              English
            </button>
            <button
              onClick={() => onLanguageChange('hi')}
              className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                language === 'hi'
                  ? 'bg-indigo-600/30 text-indigo-300 font-semibold border border-indigo-500/30'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Hinglish
            </button>
          </div>

          <button
            onClick={() => handleGenerateWithAI()}
            disabled={isGeneratingAI}
            className="px-3.5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-indigo-500/30 text-indigo-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            title="Generate fresh detailed theory, numerical example, and diagram using Gemini AI"
          >
            {isGeneratingAI ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Generating via AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Deep-Dive with Gemini AI</span>
              </>
            )}
          </button>

          <button
            onClick={onProceedToPractice}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-md shadow-indigo-600/20 cursor-pointer"
          >
            <span>Practice Writing Answer</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Interactive Custom Topic / Question Bar Powered by Gemini AI */}
      <div className="border border-indigo-500/25 rounded-xl bg-indigo-950/15 p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="flex items-center gap-2 text-xs text-indigo-300 shrink-0 font-medium">
          <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>Ask Any Custom Question / Topic:</span>
        </div>
        <input
          type="text"
          value={customTopicOrQuestion}
          onChange={(e) => setCustomTopicOrQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && customTopicOrQuestion.trim()) {
              handleGenerateWithAI(customTopicOrQuestion);
            }
          }}
          placeholder={`Type any ${subjectCode || 'exam'} topic, derivation, or numerical question to generate a full 10-mark answer & diagram...`}
          className="flex-1 bg-[#121214] border border-zinc-700/80 rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
        />
        <button
          type="button"
          disabled={isGeneratingAI || !customTopicOrQuestion.trim()}
          onClick={() => handleGenerateWithAI(customTopicOrQuestion)}
          className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
        >
          {isGeneratingAI ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate AI Answer</span>
            </>
          )}
        </button>
      </div>

      {/* Guardrail Intercept Notice */}
      {activeAiData?.guardrail_status === 'blocked' && (
        <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/40 text-amber-200 text-xs flex items-start gap-3">
          <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <span className="font-semibold text-amber-300 block font-mono text-[11px] uppercase tracking-wide">
              🛡️ Academic Scope Guardrail Intercepted
            </span>
            <p className="text-zinc-300 text-xs leading-relaxed">
              {activeAiData.guardrail_reason ||
                'This query was intercepted because it falls outside the accredited RGPV B.Tech university curriculum. The workspace has redirected to authentic engineering syllabus requirements.'}
            </p>
          </div>
        </div>
      )}

      {/* SECTION 1: Complete Theoretical Explanation, Principles & Exam Question */}
      <div className="border border-[#27272a] rounded-xl bg-[#18181b] overflow-hidden">
        <div className="px-5 py-3.5 bg-[#141416] border-b border-[#27272a] flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-semibold text-zinc-100">
              1. Complete Topic Theory &amp; Model Exam Answer ({displayMarks} Marks Format)
            </h2>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
            {displayRubric}
          </span>
        </div>

        <div className="p-5 space-y-4">
          {/* Typical Exam Question Banner */}
          <div className="p-3.5 rounded-lg bg-[#121214] border border-zinc-800 space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 block">
              Frequently Asked University Question ({displayMarks} Marks):
            </span>
            <p className="text-xs sm:text-sm font-semibold text-zinc-100">
              &ldquo;{displayQuestion}&rdquo;
            </p>
          </div>

          {/* Formal Theoretical Explanation */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Part A — Formal Definition &amp; Theoretical Explanation:
            </h3>
            <div className="p-4 rounded-lg bg-[#121214] border border-zinc-800/80 text-xs sm:text-sm text-zinc-200 leading-relaxed">
              {displayDef}
            </div>
          </div>

          {/* Structured Key Theoretical Principles & Laws */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Part B — Core Theoretical Principles, Governing Laws &amp; Properties:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {theoryPoints.map((pt, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-[#121214] border border-zinc-800/80 flex items-start gap-2.5 text-xs text-zinc-300 leading-relaxed"
                >
                  <span className="w-5 h-5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 font-mono text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{pt}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Easy Concept Understanding / Analogy */}
          <div className="p-4 rounded-lg bg-amber-950/15 border border-amber-500/20 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
              <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Concept Intuition: {displayAnalogyTitle}</span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              {displayAnalogyText}
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 2: Drawn Architectural / Flow Diagram + Reference Link */}
      <div className="border border-[#27272a] rounded-xl bg-[#18181b] overflow-hidden">
        <div className="px-5 py-3.5 bg-[#141416] border-b border-[#27272a] flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <PenTool className="w-4 h-4 text-violet-400" />
            <div>
              <h2 className="text-sm font-semibold text-zinc-100">
                2. Required Exam Diagram: {displayDiagram.title}
              </h2>
              <p className="text-[11px] text-zinc-400">{displayDiagram.caption}</p>
            </div>
          </div>

          <a
            href={displayDiagram.referenceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-mono text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 px-3 py-1.5 rounded-lg border border-indigo-500/20 flex items-center gap-1.5 transition-colors"
          >
            <span>{displayDiagram.referenceLabel}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="p-5 space-y-4">
          {/* Drawn Visual Block Diagram */}
          <div className="p-5 rounded-xl bg-[#0d0d10] border border-zinc-800">
            <div className="text-[11px] font-mono text-zinc-500 mb-4 text-center uppercase tracking-wider">
              ▼ Draw This Labeled Block Diagram on Your Exam Answer Sheet ▼
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-stretch">
              {displayDiagram.nodes.map((node, idx) => (
                <div
                  key={idx}
                  className="relative flex flex-col justify-between p-3.5 rounded-lg bg-[#18181b] border-2 border-indigo-500/30 shadow-inner"
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-300 font-semibold">
                        {node.step}
                      </span>
                      {idx < displayDiagram.nodes.length - 1 && (
                        <span className="text-xs font-mono text-zinc-500 hidden lg:inline">
                          ───►
                        </span>
                      )}
                    </div>
                    <div className="font-mono text-xs font-bold text-white break-words">
                      {node.label}
                    </div>
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-2 pt-2 border-t border-zinc-800/80">
                    {node.sub}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Exam Drawing Tip */}
          <div className="p-3.5 rounded-lg bg-violet-950/20 border border-violet-500/30 flex items-start gap-2.5 text-xs text-violet-200">
            <Target className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-violet-300">How to Draw in Exam for Full Marks: </span>
              <span>{displayDiagram.examDrawingTip}</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: Worked Numerical Example / Step-by-Step Implementation & Derivation */}
      <div className="border border-[#27272a] rounded-xl bg-[#18181b] overflow-hidden">
        <div className="px-5 py-3.5 bg-[#141416] border-b border-[#27272a] flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-semibold text-zinc-100">
              3. Worked Numerical Example, Derivation &amp; Practical Implementation
            </h2>
          </div>
          <span className="text-[11px] font-mono text-zinc-400">
            Include this solved example/numerical in 7 &amp; 10-Mark answers
          </span>
        </div>

        <div className="p-5 space-y-4">
          <div className="p-3.5 rounded-lg bg-[#121214] border border-emerald-500/25 text-xs text-zinc-200">
            <span className="font-semibold text-emerald-400 block mb-1 uppercase tracking-wider font-mono text-[10px]">
              Problem Statement / Numerical Implementation:
            </span>
            <p className="text-xs sm:text-sm font-medium text-zinc-100 leading-relaxed">
              {displayWorkedExample.problemStatement}
            </p>
          </div>

          <div className="space-y-3">
            {displayWorkedExample.stepByStepSolution.map((stepObj) => (
              <div
                key={stepObj.step}
                className="p-4 rounded-lg bg-[#121214] border border-zinc-800/90 space-y-2"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                    {stepObj.step}
                  </span>
                  <h4 className="text-xs font-semibold text-zinc-200">
                    {stepObj.title}
                  </h4>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed pl-7">
                  {stepObj.content}
                </p>
                {stepObj.codeSnippet && (
                  <pre className="ml-7 p-3 rounded-lg bg-[#09090b] border border-zinc-800 font-mono text-xs text-emerald-300 overflow-x-auto whitespace-pre-wrap">
                    {stepObj.codeSnippet}
                  </pre>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 4: What You SHOULD Do vs What You Should NOT Do While Writing the Answer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* DO'S Card */}
        <div className="border border-emerald-500/30 rounded-xl bg-[#18181b] overflow-hidden flex flex-col">
          <div className="px-5 py-3.5 bg-emerald-950/30 border-b border-emerald-500/30 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <h3 className="text-sm font-semibold text-emerald-200">
              What You SHOULD Do While Writing Answer ✅
            </h3>
          </div>
          <div className="p-5 space-y-3 flex-1">
            {displayDiagram.doList.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs text-zinc-200 leading-relaxed">
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold shrink-0 mt-0.5">
                  DO #{idx + 1}
                </span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* DONT'S Card */}
        <div className="border border-rose-500/30 rounded-xl bg-[#18181b] overflow-hidden flex flex-col">
          <div className="px-5 py-3.5 bg-rose-950/30 border-b border-rose-500/30 flex items-center gap-2">
            <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <h3 className="text-sm font-semibold text-rose-200">
              What You Should NOT Do ❌ (Avoid Marks Deduction)
            </h3>
          </div>
          <div className="p-5 space-y-3 flex-1">
            {displayDiagram.dontList.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs text-zinc-200 leading-relaxed">
                <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono text-[10px] font-bold shrink-0 mt-0.5">
                  DON&apos;T #{idx + 1}
                </span>
                <span>{item}</span>
              </div>
            ))}

            {content.commonMistakes.map((m, idx) => (
              <div
                key={`cm-${idx}`}
                className="p-3 rounded-lg bg-rose-950/15 border border-rose-500/20 space-y-1 text-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-rose-300">Trap: {m.mistake}</span>
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 shrink-0">
                    {m.penalty}
                  </span>
                </div>
                <p className="text-zinc-300 text-[11px]">
                  <strong className="text-emerald-400">Correct Way:</strong> {m.remedy}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Action Bar to Proceed to Step 5: Study Room Practice */}
      <div className="border border-indigo-500/30 rounded-xl bg-gradient-to-r from-indigo-950/40 via-[#18181b] to-[#18181b] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              Ready to Test Your Answer for &ldquo;{currentTopic.title}&rdquo;?
            </h3>
            <p className="text-xs text-zinc-400">
              Proceed to Step 5 (Study Room) to practice writing this answer and get it graded by the Gemini AI Examiner.
            </p>
          </div>
        </div>

        <button
          onClick={onProceedToPractice}
          className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-600/20 shrink-0 cursor-pointer"
        >
          <span>Go to Step 5: Practice in Study Room</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
