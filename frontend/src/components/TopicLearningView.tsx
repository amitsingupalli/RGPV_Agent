import React from 'react';
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
  Award
} from 'lucide-react';
import { Topic, Unit, Language } from '../types';

interface TopicLearningViewProps {
  currentTopic: Topic | null;
  allUnits: Unit[];
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

  if (titleLower.includes('sql') || titleLower.includes('algebra') || titleLower.includes('query')) {
    return {
      title: 'Relational Algebra & SQL Query Execution Pipeline',
      caption: 'Order of evaluation from Cartesian Product / Joins to Grouping & Projection',
      examDrawingTip:
        'When writing Relational Algebra alongside SQL, clearly use σ (Selection), π (Projection), ⋈ (Natural Join), and γ (Grouping/Aggregation).',
      referenceUrl: 'https://en.wikipedia.org/wiki/Relational_algebra',
      referenceLabel: 'Relational Algebra Operators Reference',
      nodes: [
        { step: '1. FROM / ⋈', label: 'Relation Join (R ⋈ S)', sub: 'Combines rows matching join condition' },
        { step: '2. WHERE / σ', label: 'Row Selection (σ_predicate)', sub: 'Filters individual tuples before grouping' },
        { step: '3. GROUP BY', label: 'Partitioning Tuples', sub: 'Groups rows by shared attribute values' },
        { step: '4. HAVING', label: 'Group Filter (AVG > X)', sub: 'Filters aggregated groups' },
        { step: '5. SELECT / π', label: 'Column Projection (π_cols)', sub: 'Outputs final target attributes' },
      ],
      doList: [
        'Write both the Relational Algebra expression (using σ, π, ⋈) and the equivalent SQL query when comparing.',
        'Draw a small 3-row sample input table and show the resulting output table after the query.',
        'Clearly state that WHERE filters individual rows before GROUP BY, whereas HAVING filters groups after aggregation.',
        'Include every non-aggregated SELECT column inside the GROUP BY clause.',
      ],
      dontList: [
        'Do NOT use aggregate functions like AVG(salary) > 50000 inside a WHERE clause—always use HAVING.',
        'Do NOT confuse π (Projection -> vertical column subset) with σ (Selection -> horizontal row filter).',
        'Do NOT forget that Relational Algebra automatically eliminates duplicates while SQL SELECT retains them unless DISTINCT is used.',
      ],
    };
  }

  if (titleLower.includes('normal') || titleLower.includes('bcnf') || titleLower.includes('dependency') || titleLower.includes('lossless')) {
    return {
      title: 'Step-by-Step Normalization & BCNF Decomposition Flowchart',
      caption: 'Progressive elimination of Partial, Transitive, and Non-Superkey dependencies',
      examDrawingTip:
        'Draw concentric nested boxes or a 4-stage pipeline showing 1NF -> 2NF -> 3NF -> BCNF and write the exact dependency rule next to each arrow.',
      referenceUrl: 'https://en.wikipedia.org/wiki/Database_normalization',
      referenceLabel: 'Normalization & BCNF Reference Guide',
      nodes: [
        { step: 'Stage 1: 1NF', label: 'Atomic Attribute Domains', sub: 'Remove repeating groups & multivalued cols' },
        { step: 'Stage 2: 2NF', label: 'No Partial Dependency', sub: 'No non-prime attr depends on part of key' },
        { step: 'Stage 3: 3NF', label: 'No Transitive Dependency', sub: 'For X->Y: X is Superkey OR Y is Prime' },
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

  if (titleLower.includes('transaction') || titleLower.includes('acid') || titleLower.includes('serializ') || titleLower.includes('lock')) {
    return {
      title: 'Transaction State Transition & Precedence Graph Diagram',
      caption: 'Lifecycle of an ACID transaction and Conflict Serializability cycle test',
      examDrawingTip:
        'Draw the 5 transaction states (Active -> Partially Committed -> Committed, and Active/Partially Committed -> Failed -> Aborted) AND a Precedence Graph (T1 -> T2) showing no cycles.',
      referenceUrl: 'https://en.wikipedia.org/wiki/Database_transaction',
      referenceLabel: 'ACID & Concurrency Control Reference',
      nodes: [
        { step: '1. Active', label: 'Executing Read(X) / Write(X)', sub: 'Operations running in memory buffer' },
        { step: '2. Partially Committed', label: 'Final Statement Executed', sub: 'Waiting for WAL log flush to disk' },
        { step: '3. Committed', label: 'Durable on Disk', sub: 'Changes permanent (Durability)' },
        { step: '4. Failed -> Aborted', label: 'Rollback & Undo', sub: 'Restores atomicity on crash/deadlock' },
      ],
      doList: [
        'Define all 4 ACID properties (Atomicity, Consistency, Isolation, Durability) and state which DBMS component enforces each.',
        'When testing Conflict Serializability, list all conflicting pairs: (R-W, W-R, W-W) on the same data item.',
        'Draw the directed Precedence Graph (Serialization Graph) and state: "No cycle exists => Schedule is Conflict Serializable".',
        'For Two-Phase Locking (2PL), draw the Growing Phase (acquiring locks) and Shrinking Phase (releasing locks).',
      ],
      dontList: [
        'Do NOT draw an edge for Read-Read (R1(X), R2(X)) operations—two reads never conflict.',
        'Do NOT forget that Strict 2PL holds all Exclusive (X) locks until Commit/Abort to prevent Cascading Rollbacks.',
        'Do NOT skip the state transition diagram when asked a 10-mark question on transactions.',
      ],
    };
  }

  // Default: B+ Tree / Indexing / Storage / General Engineering Topic
  return {
    title: 'B+ Tree Multi-Level Index & Leaf Linked-List Architecture',
    caption: 'Internal routing nodes and doubly-linked leaf nodes pointing to disk data blocks',
    examDrawingTip:
      'Clearly distinguish Internal Nodes (routing keys only, no data pointers) from Leaf Nodes (contain all keys + data pointers + horizontal NextLeaf arrows).',
    referenceUrl: 'https://en.wikipedia.org/wiki/B%2B_tree',
    referenceLabel: 'B+ Tree & Indexing Architecture Reference',
    nodes: [
      { step: 'Root Node', label: '[ 25 | 50 ]', sub: 'Top-level routing keys (Max m-1 keys)' },
      { step: 'Internal Nodes', label: '[ 10 | 20 ]   [ 30 | 40 ]   [ 60 | 75 ]', sub: 'Guides search in O(log_m N) disk I/Os' },
      { step: 'Leaf Nodes', label: '[10|15|20] ⇄ [25|30|40] ⇄ [50|60|75]', sub: 'Linked sequentially for fast range queries' },
      { step: 'Data Blocks', label: '↓ Disk Record Pointers ↓', sub: 'Actual tuple blocks on secondary storage' },
    ],
    doList: [
      'Draw horizontal arrows (⇄) connecting all Leaf Nodes in your B+ Tree diagram to highlight range-query efficiency.',
      'Write a clear comparison table between B-Tree and B+ Tree (data pointers at all nodes vs leaf nodes only).',
      'State the node capacity formulas for order m: max children = m, min children = ⌈m/2⌉, max keys = m - 1.',
      'Show intermediate tree steps when inserting keys that cause a leaf split.',
    ],
    dontList: [
      'Do NOT omit the sequential linked-list arrows between leaf nodes in a B+ Tree diagram.',
      'Do NOT delete a key from an internal node without redistributing or merging underfull nodes.',
      'Do NOT confuse RAID 0 (striping only, zero fault tolerance) with RAID 1 (mirroring) or RAID 5 (distributed parity).',
    ],
  };
}

export const TopicLearningView: React.FC<TopicLearningViewProps> = ({
  currentTopic,
  allUnits,
  language,
  onLanguageChange,
  onSelectTopic,
  onProceedToPractice,
  onGoToSetup,
}) => {
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

  const content = currentTopic.pedagogicalContent;
  const diagramGuide = getTopicDiagramAndGuide(currentTopic);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Top Bar: Topic Selector, Language Switcher & Practice CTA */}
      <div className="border border-[#27272a] rounded-xl bg-[#18181b] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Step 4: Learn Topic &amp; Exam Answer Format
            </span>
            <span className="text-xs font-mono text-amber-400">
              Asked {currentTopic.appearancesCount}× in Past Exams ({currentTopic.totalMarksInPast5Years} Marks)
            </span>
          </div>

          <div className="flex items-center gap-2 pt-1 flex-wrap">
            <span className="text-xs text-zinc-400">Topic:</span>
            <select
              value={currentTopic.id}
              onChange={(e) => onSelectTopic(e.target.value)}
              className="bg-[#121214] border border-[#27272a] rounded-lg px-3 py-1.5 text-sm font-bold text-zinc-100 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              {allUnits.flatMap((u) => u.topics).map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto shrink-0">
          <div className="flex items-center p-1 rounded-lg bg-[#121214] border border-zinc-800 text-xs">
            <button
              onClick={() => onLanguageChange('en')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                language === 'en'
                  ? 'bg-zinc-800 text-white font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              English
            </button>
            <button
              onClick={() => onLanguageChange('hi')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                language === 'hi'
                  ? 'bg-indigo-600/30 text-indigo-300 font-semibold border border-indigo-500/30'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Hinglish
            </button>
          </div>

          <button
            onClick={onProceedToPractice}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
          >
            <span>Practice Writing Answer</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 1. Target University Question & Ideal Answer Structure */}
      <div className="border border-[#27272a] rounded-xl bg-[#18181b] p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-bold text-zinc-100">
              1. Model University Exam Answer ({content.examPattern.standardMarks} Marks Format)
            </h2>
          </div>
          <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
            [{content.examPattern.standardMarks} Marks Standard Question]
          </span>
        </div>

        <div className="p-4 rounded-lg bg-[#121214] border border-zinc-800 space-y-1.5">
          <span className="text-[11px] font-mono text-zinc-400 block">
            Most Frequent Exam Question on {currentTopic.title}:
          </span>
          <p className="text-sm font-semibold text-zinc-100 leading-relaxed">
            &ldquo;{content.examPattern.typicalQuestion}&rdquo;
          </p>
          <p className="text-xs text-indigo-300 font-mono pt-1">
            Marks Split: {content.examPattern.gradingRubricHighlight}
          </p>
        </div>

        {/* Detailed Theory & Definition */}
        <div className="space-y-3 pt-1">
          <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400">
            Part A: Formal Definition &amp; Core Explanation (Write this in Opening Paragraph)
          </h3>
          <div className="p-4 rounded-xl bg-[#121214] border border-[#27272a] text-sm text-zinc-200 leading-relaxed">
            {language === 'en' ? content.coreDefinition.en : content.coreDefinition.hi}
          </div>

          <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/20 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <span>Easy Concept Intuition ({content.analogy.title}):</span>
            </div>
            <p className="text-xs text-amber-100/90 leading-relaxed">
              {language === 'en' ? content.analogy.en : content.analogy.hi}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Drawn Architecture / Concept Diagram & External Diagram Link */}
      <div className="border border-[#27272a] rounded-xl bg-[#18181b] p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <PenTool className="w-4 h-4 text-emerald-400" />
            <div>
              <h2 className="text-sm font-bold text-zinc-100">
                2. Required Exam Diagram: {diagramGuide.title}
              </h2>
              <p className="text-xs text-zinc-400">{diagramGuide.caption}</p>
            </div>
          </div>

          <a
            href={diagramGuide.referenceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs text-indigo-300 font-medium inline-flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <span>{diagramGuide.referenceLabel}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Drawn Visual Block Diagram */}
        <div className="p-6 rounded-xl bg-[#0c0c0e] border border-zinc-800 space-y-4">
          <div className="text-center text-xs font-mono text-zinc-400 pb-2">
            [ Draw &amp; Label This Block Diagram in Your Exam Answer Sheet ]
          </div>

          <div className="max-w-2xl mx-auto space-y-2">
            {diagramGuide.nodes.map((node, index) => (
              <React.Fragment key={index}>
                <div className="p-3.5 rounded-xl bg-[#16161a] border-2 border-indigo-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-md">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded bg-indigo-500/20 border border-indigo-500/30 font-mono text-xs font-semibold text-indigo-300 shrink-0">
                      {node.step}
                    </span>
                    <span className="font-mono text-sm font-bold text-white">
                      {node.label}
                    </span>
                  </div>
                  <span className="text-xs text-zinc-400 font-sans">
                    {node.sub}
                  </span>
                </div>

                {index < diagramGuide.nodes.length - 1 && (
                  <div className="flex justify-center py-0.5">
                    <div className="flex flex-col items-center text-indigo-400 font-mono text-xs">
                      <span>│</span>
                      <span>▼</span>
                    </div>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>

          <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/25 text-xs text-emerald-200 flex items-start gap-2 mt-4">
            <Award className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold text-emerald-300">How to Draw in Exam: </strong>
              <span>{diagramGuide.examDrawingTip}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Step-by-Step Worked Derivation / Example */}
      <div className="border border-[#27272a] rounded-xl bg-[#18181b] p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-bold text-zinc-100">
              3. Worked Example to Include in Your Answer
            </h2>
          </div>
          <span className="text-xs font-mono text-zinc-400">Step-by-Step Solution</span>
        </div>

        <div className="p-3.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 font-medium">
          <span className="text-zinc-500 font-mono block text-[11px] mb-1">
            Example Problem:
          </span>
          &ldquo;{content.workedExample.problemStatement}&rdquo;
        </div>

        <div className="space-y-3">
          {content.workedExample.stepByStepSolution.map((step) => (
            <div
              key={step.step}
              className="p-4 rounded-lg bg-[#121214] border border-[#27272a] space-y-2 text-xs"
            >
              <div className="flex items-center gap-2 font-mono text-indigo-400 font-semibold">
                <span>Step {step.step}:</span>
                <span className="text-zinc-100 font-sans">{step.title}</span>
              </div>
              <p className="text-zinc-300 leading-relaxed whitespace-pre-line">
                {step.content}
              </p>
              {step.codeSnippet && (
                <div className="p-3 rounded bg-black/60 border border-zinc-800 font-mono text-[11px] text-emerald-300 overflow-x-auto">
                  <pre>{step.codeSnippet}</pre>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 4. What TO DO vs What NOT TO DO While Writing the Exam Answer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: What TO DO */}
        <div className="border border-emerald-500/30 rounded-xl bg-[#18181b] p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-zinc-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-emerald-300">
              What You SHOULD Do While Writing Answer
            </h2>
          </div>

          <ul className="space-y-3 text-xs text-zinc-200 leading-relaxed">
            {diagramGuide.doList.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-emerald-950/15 border border-emerald-500/20">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right: What NOT TO DO */}
        <div className="border border-rose-500/30 rounded-xl bg-[#18181b] p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-zinc-800">
            <XCircle className="w-4 h-4 text-rose-400" />
            <h2 className="text-sm font-bold text-rose-300">
              What You Should NOT Do (Avoid Marks Deduction)
            </h2>
          </div>

          <ul className="space-y-3 text-xs text-zinc-200 leading-relaxed">
            {diagramGuide.dontList.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-rose-950/15 border border-rose-500/20">
                <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
            {content.commonMistakes.map((mistake, idx) => (
              <li
                key={`cm-${idx}`}
                className="p-2.5 rounded-lg bg-rose-950/15 border border-rose-500/20 space-y-1"
              >
                <div className="flex items-center justify-between font-semibold text-rose-300">
                  <span>✗ {mistake.mistake}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-200">
                    {mistake.penalty}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-300">
                  <strong className="text-emerald-400 font-mono">Instead: </strong>
                  {mistake.remedy}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom CTA to Practice Writing the Answer */}
      <div className="border border-[#27272a] rounded-xl bg-[#18181b] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-100">
              Ready to test yourself on {currentTopic.title}?
            </h3>
            <p className="text-xs text-zinc-400">
              Proceed to Step 5 (Study Room) to write your own answer and get instant rubric feedback.
            </p>
          </div>
        </div>

        <button
          onClick={onProceedToPractice}
          className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-indigo-600/20 shrink-0"
        >
          <span>Go to Step 5: Practice Answer in Study Room</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
