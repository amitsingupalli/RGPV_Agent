import React from 'react';
import { 
  Clock, 
  AlertTriangle, 
  ArrowRight, 
  Layers,
  FileCheck
} from 'lucide-react';
import { Unit, StudentProfile, DaySchedule, LangGraphTraceNode } from '../types';

interface AnalyticsDashboardProps {
  units: Unit[];
  scheduleDays: DaySchedule[];
  profile: StudentProfile;
  traceNodes: LangGraphTraceNode[];
  onSelectTopicForStudy: (topicId: string) => void;
  onOpenTraces: () => void;
  onOpenTimetable: () => void;
  onGoToSetup: () => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  units,
  scheduleDays,
  profile,
  traceNodes,
  onSelectTopicForStudy,
  onOpenTraces,
  onOpenTimetable,
  onGoToSetup,
}) => {
  // If user hasn't completed setup yet, show a clean zero-state prompt
  if (!profile.isSetupComplete || units.length === 0) {
    return (
      <div className="max-w-3xl mx-auto my-12 border border-[#27272a] rounded-xl bg-[#18181b] p-8 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mx-auto">
          <FileCheck className="w-6 h-6" />
        </div>
        <h1 className="text-lg font-bold text-zinc-100">
          No Course Configured Yet (Starting from 0)
        </h1>
        <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
          To view your progress and unit breakdown, first enter your course details, exam date, daily study hours, and upload your syllabus or past papers in Step 1.
        </p>
        <button
          onClick={onGoToSetup}
          className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors inline-flex items-center gap-2 cursor-pointer"
        >
          <span>Go to Step 1: Course Setup &amp; Upload</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  const allTopics = units.flatMap((u) => u.topics);
  const weakTopics = allTopics.filter((t) => t.masteryPercentage < 50);

  // Compute aggregate mastery (starts at 0% if user selected "Starting from 0")
  const totalMasterySum = allTopics.reduce((acc, t) => acc + t.masteryPercentage, 0);
  const avgMastery = Math.round(totalMasterySum / (allTopics.length || 1));

  // Calculate real completed and planned hours from scheduleDays
  const totalPlannedMinutes = scheduleDays.reduce((acc, d) => acc + d.totalMinutes, 0);
  const totalCompletedMinutes = scheduleDays.reduce(
    (acc, d) =>
      acc +
      d.sessions
        .filter((s) => s.completed)
        .reduce((sAcc, s) => sAcc + s.durationMinutes, 0),
    0
  );
  const completedHours = (totalCompletedMinutes / 60).toFixed(1);
  const plannedHours = (totalPlannedMinutes / 60).toFixed(1);
  const hoursProgressPct =
    totalPlannedMinutes > 0
      ? Math.min(100, Math.round((totalCompletedMinutes / totalPlannedMinutes) * 100))
      : 0;

  // Estimated score based on current mastery out of user's configured maxExamMarks
  const estimatedScore = Math.round((avgMastery / 100) * profile.maxExamMarks);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Top Banner with User's Actual Course & Subject */}
      <div className="border border-[#27272a] rounded-xl bg-[#18181b] p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {profile.university} • {profile.program} {profile.semester}
            </span>
            <span className="text-xs font-mono text-zinc-400">
              {profile.subjectCode} — {profile.subjectName}
            </span>
          </div>
          <h1 className="text-xl font-bold text-zinc-100">
            {profile.studentName ? `${profile.studentName}'s Study Progress` : 'Study Progress & Unit Overview'}
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Track your topic mastery, completed study sessions, and weak areas before your exam.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenTimetable}
            className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 border border-zinc-700 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>Open {scheduleDays.length}-Day Schedule</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Top Row KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* KPI 1: Current Mastery */}
        <div className="border border-[#27272a] rounded-xl bg-[#18181b] p-6 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider block">
              Current Subject Mastery
            </span>
            <div className="text-2xl font-bold font-mono text-white">
              {avgMastery}%{' '}
              <span className="text-xs text-zinc-400 font-sans font-normal">
                {avgMastery === 0 ? '(Just Started)' : 'Covered'}
              </span>
            </div>
            <p className="text-[11px] text-zinc-500">
              Across {units.length} units &amp; {allTopics.length} topics
            </p>
          </div>

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
                className="text-indigo-500 transition-all duration-700 ease-out"
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

        {/* KPI 2: Target Score vs Current Readiness */}
        <div className="border border-[#27272a] rounded-xl bg-[#18181b] p-6 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-zinc-400 uppercase tracking-wider">
              Target Marks Goal
            </span>
            <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono text-[10px] border border-zinc-700">
              Max: {profile.maxExamMarks}M
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {profile.targetScore} / {profile.maxExamMarks} Marks
          </div>
          <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono pt-1">
            <span>
              Current Readiness:{' '}
              <strong className="text-zinc-200">
                ~{estimatedScore}/{profile.maxExamMarks}
              </strong>
            </span>
            <span className="text-indigo-400">
              Gap: {Math.max(0, profile.targetScore - estimatedScore)}M
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full"
              style={{
                width: `${Math.min(100, Math.round((estimatedScore / (profile.maxExamMarks || 70)) * 100))}%`,
              }}
            />
          </div>
        </div>

        {/* KPI 3: Exam Countdown & Completed Hours */}
        <div className="border border-[#27272a] rounded-xl bg-[#18181b] p-6 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-zinc-400 uppercase tracking-wider">
              Exam Timeline &amp; Hours
            </span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-300">
            {profile.daysRemaining} {profile.daysRemaining === 1 ? 'Day' : 'Days'} Left
          </div>
          <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono pt-1">
            <span>
              Studied: <strong className="text-zinc-200">{completedHours} hrs</strong>
            </span>
            <span>Planned: {plannedHours} hrs</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
            <div
              className="h-full bg-amber-400 rounded-full"
              style={{ width: `${hoursProgressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Middle Section: Unit-wise Breakdown & Topics to Study */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Unit-wise Mastery Breakdown */}
        <div className="lg:col-span-7 border border-[#27272a] rounded-xl bg-[#18181b] p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <h2 className="text-sm font-semibold text-zinc-100">
                Unit-Wise Progress
              </h2>
            </div>
            <span className="text-xs font-mono text-zinc-500">{units.length} Units</span>
          </div>

          <div className="space-y-4">
            {units.map((unit) => {
              const unitTopics = unit.topics;
              const unitAvg = Math.round(
                unitTopics.reduce((acc, t) => acc + t.masteryPercentage, 0) /
                  (unitTopics.length || 1)
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
                    <span>{unitTopics.length} Topics</span>
                    <span>Weightage: ~{unit.weightMarks} Marks</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Priority Topics to Study Next */}
        <div className="lg:col-span-5 border border-[#27272a] rounded-xl bg-[#18181b] p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-semibold text-zinc-100">
                Topics Needing Study (&lt;50% Mastery)
              </h2>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
              {weakTopics.length} Topics
            </span>
          </div>

          <p className="text-xs text-zinc-400">
            Topics ordered by past exam frequency. Click &ldquo;Start Studying&rdquo; to read notes and take a practice quiz.
          </p>

          <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
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
                      <span>Asked {topic.appearancesCount}× in PYQs</span>
                      <span>·</span>
                      <span className="text-amber-400">{topic.totalMarksInPast5Years} Marks total</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectTopicForStudy(topic.id)}
                    className="px-2.5 py-1 rounded-md bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-medium transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
                  >
                    <span>Study</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-zinc-500">Current Mastery:</span>
                  <span className="text-zinc-300 font-semibold">{topic.masteryPercentage}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full"
                    style={{ width: `${topic.masteryPercentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
