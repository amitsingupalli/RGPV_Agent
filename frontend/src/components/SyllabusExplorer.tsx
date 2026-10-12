import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  Flame, 
  Brain, 
  ArrowUpRight, 
  ArrowRight,
  Filter,
  FileText,
  FileCheck
} from 'lucide-react';
import { Unit, PYQQuestion, StudentProfile } from '../types';

interface SyllabusExplorerProps {
  units: Unit[];
  pyqs: PYQQuestion[];
  profile: StudentProfile;
  onReassignQuestion: (questionId: string, newTopicId: string) => void;
  onSelectTopicForStudy: (topicId: string) => void;
  onOpenCitation: (pageRef: string) => void;
  onUpdateTopicMastery: (topicId: string, newMastery: number) => void;
  onGoToSetup: () => void;
}

export const SyllabusExplorer: React.FC<SyllabusExplorerProps> = ({
  units,
  pyqs,
  profile,
  onReassignQuestion,
  onSelectTopicForStudy,
  onOpenCitation,
  onUpdateTopicMastery,
  onGoToSetup,
}) => {
  const [expandedUnitIds, setExpandedUnitIds] = useState<string[]>(['unit-1', 'unit-3']);
  const [expandedTopicPYQs, setExpandedTopicPYQs] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterDifficulty, setFilterDifficulty] = useState<'all' | 'high' | 'weak'>('all');

  if (!profile.isSetupComplete || units.length === 0) {
    return (
      <div className="max-w-3xl mx-auto my-12 border border-[#27272a] rounded-xl bg-[#18181b] p-8 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mx-auto">
          <FileCheck className="w-6 h-6" />
        </div>
        <h1 className="text-lg font-bold text-zinc-100">
          No Syllabus Extracted Yet
        </h1>
        <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
          Complete Step 1 by entering your subject details and uploading your syllabus and past question papers so we can extract your units and PYQ mappings.
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

  const allTopics = units.flatMap((u) => u.topics);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Top Header Card */}
      <div className="border border-[#27272a] rounded-xl bg-[#18181b] p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {profile.university} • {profile.subjectCode}
              </span>
              <span className="text-xs font-mono text-zinc-400">
                {profile.subjectName}
              </span>
            </div>
            <h1 className="text-xl font-bold text-zinc-100">
              Step 2: Review Syllabus Units, PYQ Weightage &amp; Your Familiarity
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              You can adjust your current familiarity (%) on any topic below or reassign PYQ questions before studying.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-3 text-xs font-mono shrink-0">
            <div className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800">
              <span className="text-zinc-500">Units:</span>{' '}
              <span className="text-zinc-200 font-semibold">{units.length}</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800">
              <span className="text-zinc-500">Topics:</span>{' '}
              <span className="text-zinc-200 font-semibold">{allTopics.length}</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800">
              <span className="text-zinc-500">PYQs:</span>{' '}
              <span className="text-indigo-400 font-semibold">{pyqs.length} Questions</span>
            </div>
          </div>
        </div>

        {/* Filters & Search Control Bar */}
        <div className="pt-3 border-t border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-zinc-500" />
            <span className="text-zinc-400">Filter:</span>
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
                Frequently Asked (4+ PYQs)
              </button>
              <button
                onClick={() => setFilterDifficulty('weak')}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  filterDifficulty === 'weak'
                    ? 'bg-zinc-800 text-rose-300 font-medium'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Needs Study (&lt;50%)
              </button>
            </div>
          </div>

          <div className="w-full sm:w-64">
            <input
              type="text"
              placeholder="Search topic..."
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
              {/* Unit Header Bar */}
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
                    Weight: ~{unit.weightMarks} Marks
                  </span>
                </div>
              </div>

              {/* Unit Topics List */}
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
                                Weight: {topic.syllabusWeight}%
                              </span>
                              <span
                                className={`text-[11px] font-mono px-2 py-0.5 rounded ${
                                  topic.difficultyScore >= 70
                                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                    : 'bg-zinc-800 text-zinc-300'
                                }`}
                              >
                                {topic.difficultyLabel}
                              </span>
                            </div>
                            <p className="text-xs text-zinc-400 line-clamp-2">
                              {topic.pedagogicalContent.coreDefinition.en}
                            </p>
                          </div>

                          <div className="shrink-0 flex items-center gap-2">
                            <button
                              onClick={() => onSelectTopicForStudy(topic.id)}
                              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                            >
                              <span>Study This Topic</span>
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Frequency & Editable Student Familiarity Slider */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-zinc-800/80">
                          <div className="p-3 rounded-lg bg-[#121214] border border-[#27272a] flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <Flame className="w-4 h-4 text-amber-400" />
                              <span className="text-zinc-300 font-medium">Past Exam Frequency:</span>
                            </div>
                            <span className="font-mono text-amber-300 font-semibold">
                              {topic.appearancesCount}× ({topic.totalMarksInPast5Years} Marks)
                            </span>
                          </div>

                          {/* Interactive User Mastery Slider so we never assume their knowledge */}
                          <div className="p-3 rounded-lg bg-[#121214] border border-[#27272a] flex items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-2 shrink-0">
                              <Brain className="w-4 h-4 text-indigo-400" />
                              <span className="text-zinc-300 font-medium">Your Familiarity:</span>
                            </div>
                            <div className="flex items-center gap-2.5 flex-1 max-w-[180px] font-mono">
                              <input
                                type="range"
                                min={0}
                                max={100}
                                step={5}
                                value={topic.masteryPercentage}
                                onChange={(e) =>
                                  onUpdateTopicMastery(topic.id, Number(e.target.value))
                                }
                                className="w-full accent-indigo-500 bg-zinc-800 h-1.5 rounded-lg cursor-pointer"
                                title="Adjust your current knowledge of this topic"
                              />
                              <span
                                className={`font-semibold w-9 text-right ${
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
                                {isPYQExpanded ? 'Hide' : 'View'} Past Exam Questions ({topicPYQs.length})
                              </span>
                            </div>
                            <span className="font-mono text-[11px] text-zinc-500">
                              {isPYQExpanded ? 'Collapse ▲' : 'Expand ▼'}
                            </span>
                          </button>
                        </div>

                        {/* Expanded Mapped PYQ List */}
                        {isPYQExpanded && (
                          <div className="space-y-3 pt-1">
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
                                      {q.season} {q.year}
                                    </span>
                                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                      [{q.marks} Marks]
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-1.5 self-start sm:self-auto">
                                    <span className="text-[11px] text-zinc-500">Move to Topic:</span>
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
                                  &ldquo;{q.text}&rdquo;
                                </p>

                                <div className="flex items-center justify-between pt-1 border-t border-zinc-800/60 text-[11px] text-zinc-500 font-mono">
                                  <button
                                    onClick={() => onOpenCitation(q.pageRef)}
                                    className="hover:text-indigo-400 transition-colors flex items-center gap-1 cursor-pointer"
                                  >
                                    <span>Source: {q.pageRef}</span>
                                    <ArrowUpRight className="w-3 h-3" />
                                  </button>
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
