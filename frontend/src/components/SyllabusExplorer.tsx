import React, { useState } from 'react';
import { 
  Layers, 
  ChevronDown, 
  ChevronRight, 
  Flame, 
  Brain, 
  BookOpen, 
  ArrowUpRight, 
  CheckCircle2, 
  HelpCircle, 
  SlidersHorizontal,
  FolderTree,
  Filter,
  FileText
} from 'lucide-react';
import { Unit, Topic, PYQQuestion } from '../types';

interface SyllabusExplorerProps {
  units: Unit[];
  pyqs: PYQQuestion[];
  onReassignQuestion: (questionId: string, newTopicId: string) => void;
  onSelectTopicForStudy: (topicId: string) => void;
  onOpenCitation: (pageRef: string) => void;
}

export const SyllabusExplorer: React.FC<SyllabusExplorerProps> = ({
  units,
  pyqs,
  onReassignQuestion,
  onSelectTopicForStudy,
  onOpenCitation,
}) => {
  const [expandedUnitIds, setExpandedUnitIds] = useState<string[]>(['unit-3', 'unit-4']);
  const [expandedTopicPYQs, setExpandedTopicPYQs] = useState<string[]>(['topic-3-1']);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterDifficulty, setFilterDifficulty] = useState<'all' | 'high' | 'weak'>('all');

  const toggleUnit = (unitId: string) => {
    setExpandedUnitIds((prev) =>
      prev.includes(unitId) ? prev.filter((id) => id !== unitId) : [...prev, unitId]
    );
  };

  const toggleTopicPYQ = (topicId: string) => {
    setExpandedTopicPYQs((prev) =>
      prev.includes(topicId) ? prev.filter((id) => id !== topicId) : [...prev, topicId]
    );
  };

  // Flattened topic list for reassignment dropdowns
  const allTopics = units.flatMap((u) => u.topics);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Top Header Card: Overview & Aggregate Analytics */}
      <div className="border border-[#27272a] rounded-xl bg-[#18181b] p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Rajiv Gandhi Proudyogiki Vishwavidyalaya • CS-403
              </span>
              <span className="text-xs font-mono text-zinc-400">DBMS Exam Blueprint</span>
            </div>
            <h1 className="text-xl font-bold text-zinc-100">
              Syllabus & Exam Question Frequency Explorer
            </h1>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-3 text-xs font-mono">
            <div className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800">
              <span className="text-zinc-500">Units:</span>{' '}
              <span className="text-zinc-200 font-semibold">5 Units</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800">
              <span className="text-zinc-500">Core Topics:</span>{' '}
              <span className="text-zinc-200 font-semibold">{allTopics.length} Topics</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800">
              <span className="text-zinc-500">PYQs Analyzed:</span>{' '}
              <span className="text-indigo-400 font-semibold">{pyqs.length} Questions (2020–2024)</span>
            </div>
          </div>
        </div>

        {/* Filters & Search Control Bar */}
        <div className="pt-3 border-t border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-zinc-500" />
            <span className="text-zinc-400">View Filter:</span>
            <div className="flex items-center gap-1 p-0.5 rounded-lg bg-zinc-900 border border-zinc-800">
              <button
                onClick={() => setFilterDifficulty('all')}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  filterDifficulty === 'all'
                    ? 'bg-zinc-800 text-white font-medium'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                All Topics
              </button>
              <button
                onClick={() => setFilterDifficulty('high')}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  filterDifficulty === 'high'
                    ? 'bg-zinc-800 text-purple-300 font-medium'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                High Frequency (🔥 4+)
              </button>
              <button
                onClick={() => setFilterDifficulty('weak')}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  filterDifficulty === 'weak'
                    ? 'bg-zinc-800 text-rose-300 font-medium'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Weak Mastery (&lt;50%)
              </button>
            </div>
          </div>

          <div className="w-full sm:w-64">
            <input
              type="text"
              placeholder="Search topic or PYQ text..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#121214] border border-[#27272a] rounded-lg px-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Accordion Units Tree */}
      <div className="space-y-4">
        {units.map((unit) => {
          const isUnitExpanded = expandedUnitIds.includes(unit.id);
          
          // Filter topics based on search and filters
          const filteredTopics = unit.topics.filter((topic) => {
            const matchesSearch =
              topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              topic.pedagogicalContent.coreDefinition.en.toLowerCase().includes(searchQuery.toLowerCase());
            
            if (!matchesSearch) return false;
            if (filterDifficulty === 'high') return topic.appearancesCount >= 4;
            if (filterDifficulty === 'weak') return topic.masteryPercentage < 50;
            return true;
          });

          if (filteredTopics.length === 0 && searchQuery) {
            return null;
          }

          return (
            <div
              key={unit.id}
              className="border border-[#27272a] rounded-xl bg-[#18181b] overflow-hidden transition-all"
            >
              {/* Unit Header Bar (Accordion Trigger) */}
              <div
                onClick={() => toggleUnit(unit.id)}
                className="p-4 bg-[#141416] hover:bg-zinc-800/40 cursor-pointer flex items-center justify-between border-b border-[#27272a]/60 select-none transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1 rounded bg-zinc-800 text-zinc-400">
                    {isUnitExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-indigo-400 font-semibold">
                        {unit.code}
                      </span>
                      <h2 className="text-sm font-semibold text-zinc-100">
                        {unit.title}
                      </h2>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-1">
                      {unit.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs font-mono shrink-0">
                  <span className="text-zinc-500 hidden sm:inline">
                    {unit.topics.length} Topics
                  </span>
                  <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
                    Exam Weight: ~{unit.weightMarks} Marks
                  </span>
                </div>
              </div>

              {/* Unit Topics Grid / List */}
              {isUnitExpanded && (
                <div className="p-5 space-y-4 bg-[#0e0e11]/60">
                  {filteredTopics.map((topic) => {
                    const isPYQExpanded = expandedTopicPYQs.includes(topic.id);
                    const topicPYQs = pyqs.filter((q) => q.topicId === topic.id);

                    return (
                      <div
                        key={topic.id}
                        className="border border-[#27272a] rounded-xl bg-[#18181b] p-5 space-y-4 hover:border-zinc-700 transition-colors"
                      >
                        {/* Topic Header Row */}
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-sm font-bold text-zinc-100">
                                {topic.title}
                              </h3>
                              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                Syllabus Weight: {topic.syllabusWeight}%
                              </span>
                              <span
                                className={`text-[11px] font-mono px-2 py-0.5 rounded ${
                                  topic.difficultyScore >= 70
                                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                    : 'bg-zinc-800 text-zinc-300'
                                }`}
                              >
                                Difficulty: {topic.difficultyScore}% · {topic.difficultyLabel}
                              </span>
                            </div>
                            <p className="text-xs text-zinc-400 line-clamp-2">
                              {topic.pedagogicalContent.coreDefinition.en}
                            </p>
                          </div>

                          {/* Quick Study Action Button */}
                          <div className="shrink-0 flex items-center gap-2">
                            <button
                              onClick={() => onSelectTopicForStudy(topic.id)}
                              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                            >
                              <span>Enter Study Room</span>
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Historical Exam Frequency Meter & Mastery Metric */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-zinc-800/80">
                          {/* Frequency Meter */}
                          <div className="p-3 rounded-lg bg-[#121214] border border-[#27272a] flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <Flame className="w-4 h-4 text-amber-400" />
                              <span className="text-zinc-300 font-medium">Exam Frequency:</span>
                            </div>
                            <span className="font-mono text-amber-300 font-semibold">
                              Appeared {topic.appearancesCount}× in 5 Yrs · {topic.totalMarksInPast5Years} Marks
                            </span>
                          </div>

                          {/* Mastery Metric */}
                          <div className="p-3 rounded-lg bg-[#121214] border border-[#27272a] flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <Brain className="w-4 h-4 text-indigo-400" />
                              <span className="text-zinc-300 font-medium">Current Student Mastery:</span>
                            </div>
                            <div className="flex items-center gap-2 font-mono">
                              <div className="w-16 h-2 rounded-full bg-zinc-800 overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    topic.masteryPercentage < 50 ? 'bg-rose-500' : 'bg-emerald-500'
                                  }`}
                                  style={{ width: `${topic.masteryPercentage}%` }}
                                />
                              </div>
                              <span
                                className={`font-semibold ${
                                  topic.masteryPercentage < 50 ? 'text-rose-400' : 'text-emerald-400'
                                }`}
                              >
                                {topic.masteryPercentage}%
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Mapped PYQ Questions Toggle Button */}
                        <div className="pt-1">
                          <button
                            onClick={() => toggleTopicPYQ(topic.id)}
                            className="flex items-center justify-between w-full px-3.5 py-2 rounded-lg bg-zinc-900/90 hover:bg-zinc-800/80 border border-zinc-800 text-xs text-zinc-300 font-medium transition-colors cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <FileText className="w-3.5 h-3.5 text-indigo-400" />
                              <span>
                                {isPYQExpanded ? 'Hide' : 'View'} Mapped University PYQ Questions ({topicPYQs.length} Questions)
                              </span>
                            </div>
                            <span className="font-mono text-[11px] text-zinc-500">
                              {isPYQExpanded ? 'Collapse ▲' : 'Expand past questions ▼'}
                            </span>
                          </button>
                        </div>

                        {/* Expanded Mapped PYQ List */}
                        {isPYQExpanded && (
                          <div className="space-y-3 pt-1 animate-in fade-in duration-150">
                            {topicPYQs.map((q) => (
                              <div
                                key={q.id}
                                className="p-3.5 rounded-lg bg-[#121214] border border-[#27272a] space-y-2 text-xs"
                              >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono font-semibold text-zinc-200">
                                      {q.questionNumber}
                                    </span>
                                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                                      RGPV {q.season} {q.year}
                                    </span>
                                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                      [{q.marks} Marks]
                                    </span>
                                  </div>

                                  {/* Human-in-the-Loop Reassign Topic Dropdown */}
                                  <div className="flex items-center gap-1.5 self-start sm:self-auto">
                                    <span className="text-[11px] text-zinc-500">Reassign Topic:</span>
                                    <select
                                      value={q.topicId}
                                      onChange={(e) => onReassignQuestion(q.id, e.target.value)}
                                      className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-[11px] text-zinc-300 focus:outline-none focus:border-indigo-500 font-sans cursor-pointer"
                                    >
                                      {allTopics.map((top) => (
                                        <option key={top.id} value={top.id}>
                                          {top.title}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                </div>

                                <p className="text-zinc-300 leading-relaxed font-sans">
                                  "{q.text}"
                                </p>

                                <div className="flex items-center justify-between pt-1 border-t border-zinc-800/60 text-[11px] text-zinc-500 font-mono">
                                  <button
                                    onClick={() => onOpenCitation(q.pageRef)}
                                    className="hover:text-indigo-400 transition-colors flex items-center gap-1 cursor-pointer"
                                  >
                                    <span>Source: {q.pageRef}</span>
                                    <ArrowUpRight className="w-3 h-3" />
                                  </button>
                                  <span className="text-emerald-400">
                                    Classifier Confidence: {q.confidence}%
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
