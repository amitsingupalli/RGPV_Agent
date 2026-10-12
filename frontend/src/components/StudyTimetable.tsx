import React, { useState } from 'react';
import { 
  Sliders, 
  Info, 
  ArrowRight, 
  Check, 
  ShieldCheck,
  BookOpen,
  FileCheck
} from 'lucide-react';
import { DaySchedule, StudySession, StudentProfile, Topic, SessionType } from '../types';

interface StudyTimetableProps {
  scheduleDays: DaySchedule[];
  profile: StudentProfile;
  allTopics: Topic[];
  onApprovePlan: () => void;
  onAdjustConstraints: (
    newCap: number,
    newTarget: number,
    newDaysRemaining?: number,
    newBufferDays?: number
  ) => void;
  onOpenPriorityExplainer: (day: DaySchedule, topic: Topic | null) => void;
  onSelectSessionForStudy: (topicId: string, session: StudySession) => void;
  onToggleSessionComplete: (dayNumber: number, sessionId: string) => void;
  onGoToSetup: () => void;
}

export const StudyTimetable: React.FC<StudyTimetableProps> = ({
  scheduleDays,
  profile,
  allTopics,
  onApprovePlan,
  onAdjustConstraints,
  onOpenPriorityExplainer,
  onSelectSessionForStudy,
  onToggleSessionComplete,
  onGoToSetup,
}) => {
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(1);
  const [isAdjusting, setIsAdjusting] = useState<boolean>(false);
  const [tempDailyCap, setTempDailyCap] = useState<number>(profile.dailyHoursCap);
  const [tempTarget, setTempTarget] = useState<number>(profile.targetScore);
  const [tempDaysRemaining, setTempDaysRemaining] = useState<number>(profile.daysRemaining);
  const [tempBufferDays, setTempBufferDays] = useState<number>(profile.bufferDays);

  if (!profile.isSetupComplete || scheduleDays.length === 0) {
    return (
      <div className="max-w-3xl mx-auto my-12 border border-[#27272a] rounded-xl bg-[#18181b] p-8 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mx-auto">
          <FileCheck className="w-6 h-6" />
        </div>
        <h1 className="text-lg font-bold text-zinc-100">
          No Study Schedule Generated Yet
        </h1>
        <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
          Complete Step 1 by setting your exam date, daily study hour limit, and revision buffer days to generate your day-by-day study plan.
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

  const selectedDay =
    scheduleDays.find((d) => d.dayNumber === selectedDayNumber) || scheduleDays[0];

  // Dynamically calculate completed and planned hours
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
  const actualBufferDays = scheduleDays.filter((d) => d.isBufferDay).length;

  const getSessionStyle = (type: SessionType) => {
    switch (type) {
      case 'concept_learning':
        return {
          badge: 'bg-blue-500/20 text-blue-200 border-blue-500/30',
          label: 'Concept Study',
        };
      case 'pyq_practice':
        return {
          badge: 'bg-purple-500/20 text-purple-200 border-purple-500/30',
          label: 'PYQ Practice',
        };
      case 'active_recall':
        return {
          badge: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30',
          label: 'Practice Quiz',
        };
      case 'spaced_revision':
        return {
          badge: 'bg-amber-500/20 text-amber-200 border-amber-500/30',
          label: 'Revision',
        };
      case 'buffer_rest':
        return {
          badge: 'bg-zinc-800 text-zinc-400 border-zinc-700',
          label: 'Buffer / Catch-up',
        };
    }
  };

  const handleSaveConstraints = () => {
    onAdjustConstraints(tempDailyCap, tempTarget, tempDaysRemaining, tempBufferDays);
    setSelectedDayNumber(1);
    setIsAdjusting(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Top Banner */}
      <div className="border border-[#27272a] rounded-xl bg-[#18181b] overflow-hidden shadow-lg">
        <div
          className={`p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b ${
            profile.planApproved
              ? 'bg-emerald-950/20 border-emerald-500/20'
              : 'bg-amber-950/20 border-amber-500/20'
          }`}
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-mono px-2 py-0.5 rounded border ${
                  profile.planApproved
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                }`}
              >
                {profile.planApproved ? 'Schedule Approved' : 'Please Review Your Schedule'}
              </span>
              <span className="text-xs font-mono text-zinc-400">
                {profile.subjectCode} • {profile.preferredStudySlot} slot
              </span>
            </div>
            <h1 className="text-lg font-bold text-zinc-100">
              Step 3: Your {scheduleDays.length}-Day Study Schedule
            </h1>
            <p className="text-xs text-zinc-400">
              Limited to <strong className="text-zinc-200">{profile.dailyHoursCap} hrs/day</strong> with{' '}
              <strong className="text-zinc-200">{actualBufferDays} revision buffer day(s)</strong> before your exam.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => {
                setTempDailyCap(profile.dailyHoursCap);
                setTempTarget(profile.targetScore);
                setTempDaysRemaining(profile.daysRemaining);
                setTempBufferDays(profile.bufferDays);
                setIsAdjusting(!isAdjusting);
              }}
              className="px-3.5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 border border-zinc-700 font-medium transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{isAdjusting ? 'Close Settings' : 'Edit Hours / Days'}</span>
            </button>

            {!profile.planApproved ? (
              <button
                onClick={onApprovePlan}
                className="px-5 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Approve Schedule</span>
              </button>
            ) : (
              <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Approved</span>
              </div>
            )}
          </div>
        </div>

        {/* Inline Constraints Adjuster Form */}
        {isAdjusting && (
          <div className="p-5 bg-[#121214] border-b border-zinc-800 space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-zinc-200 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                Update Your Schedule Preferences
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-zinc-400">Daily Hours Limit</span>
                  <span className="font-mono text-indigo-400 font-semibold">
                    {tempDailyCap.toFixed(1)} hrs
                  </span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="8.0"
                  step="0.5"
                  value={tempDailyCap}
                  onChange={(e) => setTempDailyCap(Number(e.target.value))}
                  className="w-full accent-indigo-500 bg-zinc-800 h-1.5 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1">
                  Days Until Exam
                </label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={tempDaysRemaining}
                  onChange={(e) =>
                    setTempDaysRemaining(Math.max(1, Math.min(60, Number(e.target.value) || 1)))
                  }
                  className="w-full bg-[#18181b] border border-zinc-700 rounded px-2.5 py-1 text-xs font-mono text-zinc-200"
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1">
                  Buffer Days
                </label>
                <select
                  value={tempBufferDays}
                  onChange={(e) => setTempBufferDays(Number(e.target.value))}
                  className="w-full bg-[#18181b] border border-zinc-700 rounded px-2.5 py-1 text-xs text-zinc-200"
                >
                  <option value={0}>0 Buffer Days</option>
                  <option value={1}>1 Buffer Day</option>
                  <option value={2}>2 Buffer Days</option>
                  <option value={3}>3 Buffer Days</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-zinc-400">Target Marks</span>
                  <span className="font-mono text-emerald-400 font-semibold">
                    {tempTarget}/{profile.maxExamMarks}
                  </span>
                </div>
                <input
                  type="range"
                  min={Math.round(profile.maxExamMarks * 0.35)}
                  max={profile.maxExamMarks}
                  value={tempTarget}
                  onChange={(e) => setTempTarget(Number(e.target.value))}
                  className="w-full accent-emerald-500 bg-zinc-800 h-1.5 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsAdjusting(false)}
                className="px-3 py-1.5 rounded text-xs text-zinc-400 hover:text-zinc-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveConstraints}
                className="px-4 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Update Schedule
              </button>
            </div>
          </div>
        )}

        {/* Schedule Summary Bar */}
        <div className="px-5 py-3 bg-[#121214] grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono text-zinc-400 border-t border-zinc-800/40">
          <div>
            <span className="text-zinc-500 block text-[11px]">Total Plan Length:</span>
            <span className="text-zinc-200 font-semibold">{scheduleDays.length} Days</span>
          </div>
          <div>
            <span className="text-zinc-500 block text-[11px]">Daily Limit:</span>
            <span className="text-indigo-400 font-semibold">Max {profile.dailyHoursCap} hrs/day</span>
          </div>
          <div>
            <span className="text-zinc-500 block text-[11px]">Buffer Days:</span>
            <span className="text-emerald-400 font-semibold">
              {actualBufferDays} {actualBufferDays === 1 ? 'Day' : 'Days'}
            </span>
          </div>
          <div>
            <span className="text-zinc-500 block text-[11px]">Completed Hours:</span>
            <span className="text-zinc-200 font-semibold">
              {completedHours} / {plannedHours} Hrs
            </span>
          </div>
        </div>
      </div>

      {/* Main Two-Zone Timetable View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Day-by-Day Timeline Navigator */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between text-xs text-zinc-400 px-1 font-mono">
            <span>Schedule Days</span>
            <span>{scheduleDays.length} Days Total</span>
          </div>

          <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
            {scheduleDays.map((day) => {
              const isSelected = selectedDayNumber === day.dayNumber;
              const completedCount = day.sessions.filter((s) => s.completed).length;
              const totalSessions = day.sessions.length;

              return (
                <div
                  key={day.dayNumber}
                  onClick={() => setSelectedDayNumber(day.dayNumber)}
                  className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-zinc-800/90 border-indigo-500/80 shadow-md ring-1 ring-indigo-500/30'
                      : 'bg-[#18181b] border-[#27272a] hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-zinc-200 font-mono">
                        {day.date}
                      </span>
                      {day.isBufferDay && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                          Buffer Day
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-mono text-zinc-400">
                      {(day.totalMinutes / 60).toFixed(1)} hrs
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-zinc-500">
                    <span className="truncate pr-2">{day.sessions[0]?.title}</span>
                    <span className="font-mono text-emerald-400 shrink-0">
                      {completedCount}/{totalSessions} done
                    </span>
                  </div>

                  {!day.isBufferDay && (
                    <div className="mt-2 pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[10px] font-mono text-zinc-500">
                      <span>Priority Score: {day.priorityMetrics.calculatedPriority}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const targetTopic =
                            allTopics.find((t) => t.id === day.sessions[0]?.topicId) || null;
                          onOpenPriorityExplainer(day, targetTopic);
                        }}
                        className="text-indigo-400 hover:text-indigo-300 underline cursor-pointer"
                      >
                        Why this topic?
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Day Sessions & Details */}
        <div className="lg:col-span-8 space-y-4">
          <div className="border border-[#27272a] rounded-xl bg-[#18181b] p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-zinc-100">
                    {selectedDay.date} — Study Tasks
                  </h2>
                  {selectedDay.isBufferDay && (
                    <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono">
                      Revision Buffer
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Scheduled: <strong className="text-zinc-200">{(selectedDay.totalMinutes / 60).toFixed(1)} hrs</strong> (within your {profile.dailyHoursCap} hrs/day limit). Check the box as you finish each task.
                </p>
              </div>

              {!selectedDay.isBufferDay && (
                <button
                  onClick={() => {
                    const topTopic =
                      allTopics.find((t) => t.id === selectedDay.sessions[0]?.topicId) || null;
                    onOpenPriorityExplainer(selectedDay, topTopic);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-mono font-medium transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                >
                  <Info className="w-3.5 h-3.5" />
                  <span>Priority Score Breakdown ({selectedDay.priorityMetrics.calculatedPriority})</span>
                </button>
              )}
            </div>

            {/* Session Blocks List */}
            <div className="space-y-3">
              {selectedDay.sessions.map((session) => {
                const style = getSessionStyle(session.type);
                const relatedTopic = allTopics.find((t) => t.id === session.topicId);

                return (
                  <div
                    key={session.id}
                    className={`p-4 rounded-xl border transition-all ${
                      session.completed
                        ? 'bg-zinc-900/40 border-zinc-800/80 opacity-75'
                        : 'bg-[#141416] border-[#27272a] hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <button
                          onClick={() =>
                            onToggleSessionComplete(selectedDay.dayNumber, session.id)
                          }
                          className={`mt-0.5 h-5 w-5 rounded-md border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                            session.completed
                              ? 'bg-emerald-600 border-emerald-500 text-white'
                              : 'border-zinc-700 bg-zinc-800/60 hover:border-zinc-500 text-transparent'
                          }`}
                          title={session.completed ? 'Mark incomplete' : 'Mark completed'}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </button>

                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`text-[10px] font-mono px-2 py-0.5 rounded border ${style.badge}`}
                            >
                              {style.label}
                            </span>
                            <span className="text-xs font-mono text-zinc-400">
                              {session.durationMinutes} mins
                            </span>
                            {relatedTopic && (
                              <span className="text-[11px] text-zinc-500 font-mono truncate max-w-[200px]">
                                · {relatedTopic.title}
                              </span>
                            )}
                          </div>

                          <h3
                            className={`text-sm font-semibold text-zinc-100 ${
                              session.completed ? 'line-through text-zinc-500' : ''
                            }`}
                          >
                            {session.title}
                          </h3>
                        </div>
                      </div>

                      <button
                        onClick={() => onSelectSessionForStudy(session.topicId, session)}
                        className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-indigo-600 text-zinc-300 hover:text-white text-xs font-medium transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Study Now</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Priority Reasons */}
            {!selectedDay.isBufferDay &&
              selectedDay.priorityMetrics.justification.length > 0 && (
                <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                  <h4 className="text-xs font-semibold text-zinc-300">
                    Why these tasks are scheduled on {selectedDay.date}:
                  </h4>
                  <ul className="space-y-1 text-xs text-zinc-400">
                    {selectedDay.priorityMetrics.justification.map((point, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-indigo-400 font-mono mt-0.5">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};
