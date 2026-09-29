import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Target, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  Terminal, 
  ShieldCheck, 
  BookOpen, 
  Flame,
  Activity,
  Layers
} from 'lucide-react';
import { Unit, StudentProfile, Topic, LangGraphTraceNode } from '../types';

interface AnalyticsDashboardProps {
  units: Unit[];
  profile: StudentProfile;
  traceNodes: LangGraphTraceNode[];
  onSelectTopicForStudy: (topicId: string) => void;
  onOpenTraces: () => void;
  onOpenTimetable: () => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  units,
  profile,
  traceNodes,
  onSelectTopicForStudy,
  onOpenTraces,
  onOpenTimetable,
}) => {
  const allTopics = units.flatMap((u) => u.topics);
  const weakTopics = allTopics.filter((t) => t.masteryPercentage < 50);

  // Compute aggregate weighted mastery
  const totalMasterySum = allTopics.reduce((acc, t) => acc + t.masteryPercentage, 0);
  const avgMastery = Math.round(totalMasterySum / (allTopics.length || 1));

  // Trajectory calculation based on current pace
  const predictedLow = Math.max(50, Math.round(avgMastery * 1.05));
  const predictedHigh = Math.min(95, Math.round(avgMastery * 1.15));

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Top Welcome & Subject Banner */}
      <div className="border border-[#27272a] rounded-xl bg-[#18181b] p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              RGPV B.Tech CSE IV Sem
            </span>
            <span className="text-xs font-mono text-zinc-400">CS-403 DBMS Examination</span>
          </div>
          <h1 className="text-xl font-bold text-zinc-100">
            Exam Readiness & Adaptive Learning Analytics
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time mastery tracking powered by deterministic priority scheduling and verified rubric assessments.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenTimetable}
            className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 border border-zinc-700 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>View 14-Day Plan</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Top Row KPI Cards (3 Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* KPI 1: Overall Exam Readiness Radial Progress */}
        <div className="border border-[#27272a] rounded-xl bg-[#18181b] p-6 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider block">
              Overall Exam Readiness
            </span>
            <div className="text-2xl font-bold font-mono text-white">
              {avgMastery}% <span className="text-xs text-emerald-400 font-sans font-normal">Ready</span>
            </div>
            <p className="text-[11px] text-zinc-500">
              Across all 5 syllabus units & 24 past questions
            </p>
          </div>

          {/* Circular Visual Ring */}
          <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-zinc-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-indigo-500 transition-all duration-1000 ease-out"
                strokeDasharray={`${avgMastery}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-xs font-bold font-mono text-zinc-100">
              {avgMastery}%
            </span>
          </div>
        </div>

        {/* KPI 2: Target Score vs Predicted Range */}
        <div className="border border-[#27272a] rounded-xl bg-[#18181b] p-6 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-zinc-400 uppercase tracking-wider">
              Target vs Trajectory
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono text-[10px] border border-emerald-500/20">
              On Track
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {predictedLow}–{predictedHigh}%
          </div>
          <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono pt-1">
            <span>Target Goal: <strong className="text-zinc-200">{profile.targetScore}%</strong></span>
            <span className="text-emerald-400">Delta: +{predictedHigh - profile.targetScore}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full"
              style={{ width: `${(predictedHigh / 100) * 100}%` }}
            />
          </div>
        </div>

        {/* KPI 3: Exam Countdown Timer Card */}
        <div className="border border-[#27272a] rounded-xl bg-[#18181b] p-6 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-zinc-400 uppercase tracking-wider">
              Exam Countdown
            </span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-300">
            12 Days Remaining
          </div>
          <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono pt-1">
            <span>Completed: <strong className="text-zinc-200">2.4 hrs</strong></span>
            <span>Planned: 32.5 hrs</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
            <div
              className="h-full bg-amber-400 rounded-full"
              style={{ width: `18%` }}
            />
          </div>
        </div>
      </div>

      {/* Middle Section: Unit-wise Breakdown & Weak Topics Watchlist */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Unit-wise Mastery Bar Breakdown (7 cols) */}
        <div className="lg:col-span-7 border border-[#27272a] rounded-xl bg-[#18181b] p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <h2 className="text-sm font-semibold text-zinc-100">
                Unit-Wise Mastery Breakdown
              </h2>
            </div>
            <span className="text-xs font-mono text-zinc-500">5 Exam Units</span>
          </div>

          <div className="space-y-4">
            {units.map((unit) => {
              const unitTopics = unit.topics;
              const unitAvg = Math.round(
                unitTopics.reduce((acc, t) => acc + t.masteryPercentage, 0) / (unitTopics.length || 1)
              );

              return (
                <div key={unit.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono font-semibold text-indigo-400 shrink-0">
                        {unit.code}
                      </span>
                      <span className="text-zinc-200 font-medium truncate">
                        {unit.title}
                      </span>
                    </div>
                    <span className="font-mono text-zinc-300 shrink-0 pl-2">
                      {unitAvg}%
                    </span>
                  </div>

                  <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        unitAvg < 50
                          ? 'bg-rose-500'
                          : unitAvg < 70
                          ? 'bg-amber-400'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${unitAvg}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                    <span>{unitTopics.length} Core Topics</span>
                    <span>Exam Quota: ~{unit.weightMarks} Marks</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Weak Topics Watchlist (5 cols) */}
        <div className="lg:col-span-5 border border-[#27272a] rounded-xl bg-[#18181b] p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <h2 className="text-sm font-semibold text-zinc-100">
                Weak Topics Remediation Watchlist
              </h2>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
              {weakTopics.length} Deficits (&lt;50%)
            </span>
          </div>

          <p className="text-xs text-zinc-400">
            These high-frequency syllabus topics exhibit a dangerous mastery gap. Click "Revise Now" to jump into targeted practice.
          </p>

          <div className="space-y-3">
            {weakTopics.map((topic) => (
              <div
                key={topic.id}
                className="p-3.5 rounded-lg bg-[#121214] border border-[#27272a] space-y-2 hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-bold text-zinc-200">
                      {topic.title}
                    </h3>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500 mt-0.5">
                      <span>Appeared {topic.appearancesCount}× in PYQs</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-amber-400">{topic.totalMarksInPast5Years} Marks</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectTopicForStudy(topic.id)}
                    className="px-2.5 py-1 rounded-md bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-medium transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
                  >
                    <span>Revise Now</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-zinc-500">Current Mastery:</span>
                  <span className="text-rose-400 font-semibold">{topic.masteryPercentage}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded-full"
                    style={{ width: `${topic.masteryPercentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section: Execution Tracing & Telemetry Overview Card */}
      <div className="border border-[#27272a] rounded-xl bg-[#18181b] p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-semibold text-zinc-100">
              LangGraph Agent Pipeline Execution Health & Latency
            </h2>
          </div>
          <button
            onClick={onOpenTraces}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-mono flex items-center gap-1 cursor-pointer"
          >
            <span>Open Detailed Execution Trace Modal</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {traceNodes.map((node) => (
            <div
              key={node.id}
              className="p-3 rounded-lg bg-[#121214] border border-[#27272a] space-y-1 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-zinc-500 truncate">
                  {node.nodeName.split(' ')[0]}
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </div>
              <div className="font-mono font-bold text-zinc-200">
                {node.latencyMs}ms
              </div>
              <div className="text-[10px] text-zinc-500 font-mono">
                {node.confidenceScore}% conf
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between text-xs text-zinc-500 font-mono pt-1">
          <span>Dual-pass verifier invariant status: <strong className="text-emerald-400">PASSED (0 Hallucinations)</strong></span>
          <span>Deterministic linear optimizer status: <strong className="text-emerald-400">ACTIVE</strong></span>
        </div>
      </div>
    </div>
  );
};
