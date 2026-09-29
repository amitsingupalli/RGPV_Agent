import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Sliders, 
  Info, 
  ArrowRight, 
  Sparkles, 
  AlertTriangle, 
  Check, 
  ShieldCheck,
  ChevronRight,
  Filter,
  RefreshCw,
  BookOpen
} from 'lucide-react';
import { DaySchedule, StudySession, StudentProfile, Topic, SessionType } from '../types';

interface StudyTimetableProps {
  scheduleDays: DaySchedule[];
  profile: StudentProfile;
  allTopics: Topic[];
  onApprovePlan: () => void;
  onAdjustConstraints: (newCap: number, newTarget: number) => void;
  onOpenPriorityExplainer: (day: DaySchedule, topic: Topic | null) => void;
  onSelectSessionForStudy: (topicId: string, session: StudySession) => void;
  onToggleSessionComplete: (dayNumber: number, sessionId: string) => void;
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
}) => {
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(1);
  const [isAdjusting, setIsAdjusting] = useState<boolean>(false);
  const [tempDailyCap, setTempDailyCap] = useState<number>(profile.dailyHoursCap);
  const [tempTarget, setTempTarget] = useState<number>(profile.targetScore);

  const selectedDay = scheduleDays.find((d) => d.dayNumber === selectedDayNumber) || scheduleDays[0];

  const getSessionStyle = (type: SessionType) => {
    switch (type) {
      case 'concept_learning':
        return {
          bg: 'bg-blue-500/10 border-blue-500/20 text-blue-300',
          badge: 'bg-blue-500/20 text-blue-200 border-blue-500/30',
          dot: 'bg-blue-400',
          label: 'Concept Learning',
        };
      case 'pyq_practice':
        return {
          bg: 'bg-purple-500/10 border-purple-500/20 text-purple-300',
          badge: 'bg-purple-500/20 text-purple-200 border-purple-500/30',
          dot: 'bg-purple-400',
          label: 'PYQ Practice',
        };
      case 'active_recall':
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300',
          badge: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30',
          dot: 'bg-emerald-400',
          label: 'Active Recall Quiz',
        };
      case 'spaced_revision':
        return {
          bg: 'bg-amber-500/10 border-amber-500/20 text-amber-300',
          badge: 'bg-amber-500/20 text-amber-200 border-amber-500/30',
          dot: 'bg-amber-400',
          label: 'Spaced Revision',
        };
      case 'buffer_rest':
        return {
          bg: 'bg-zinc-800/60 border-zinc-700 text-zinc-300',
          badge: 'bg-zinc-800 text-zinc-400 border-zinc-700',
          dot: 'bg-zinc-400',
          label: 'Buffer & Rest Block',
        };
    }
  };

  const handleSaveConstraints = () => {
    onAdjustConstraints(tempDailyCap, tempTarget);
    setIsAdjusting(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Top Banner: Constraint-Aware Plan Status & Human-In-The-Loop Sticky Action Bar */}
      <div className="border border-[#27272a] rounded-xl bg-[#18181b] overflow-hidden shadow-lg">
        {/* Banner Alert Header */}
        <div className={`p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b ${
          profile.planApproved 
            ? 'bg-emerald-950/20 border-emerald-500/20' 
            : 'bg-amber-950/20 border-amber-500/20'
        }`}>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-mono px-2 py-0.5 rounded border ${
                profile.planApproved 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
              }`}>
                {profile.planApproved ? 'Schedule Activated & In Progress' : '⚠️ Awaiting Human-in-the-Loop Review & Approval'}
              </span>
              <span className="text-xs font-mono text-zinc-400">
                Deterministic Constraint Engine
              </span>
            </div>
            <h1 className="text-lg font-bold text-zinc-100">
              {profile.planApproved 
                ? 'Active 14-Day Adaptive Study Schedule' 
                : '14-Day University Exam Timetable Generated'}
            </h1>
            <p className="text-xs text-zinc-400">
              Strictly clamped to <strong className="text-zinc-200">{profile.dailyHoursCap} hrs/day max</strong> ceiling with 2 built-in remediation buffer days before exam.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsAdjusting(!isAdjusting)}
              className="px-3.5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 border border-zinc-700 font-medium transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{isAdjusting ? 'Close Adjustments' : 'Adjust Constraints'}</span>
            </button>

            {!profile.planApproved ? (
              <button
                onClick={onApprovePlan}
                className="px-5 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Approve & Activate Schedule</span>
              </button>
            ) : (
              <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Schedule Verified & Active</span>
              </div>
            )}
          </div>
        </div>

        {/* Inline Constraints Adjuster Form (if toggled) */}
        {isAdjusting && (
          <div className="p-5 bg-[#121214] border-b border-zinc-800 space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-zinc-200 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                Constraint Parameters Override
              </span>
              <span className="text-zinc-500 font-mono text-[11px]">
                Regenerates schedule slots deterministically
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-zinc-400">Strict Daily Cap Ceiling</span>
                  <span className="font-mono text-indigo-400 font-semibold">{tempDailyCap.toFixed(1)} hrs/day</span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="4.5"
                  step="0.5"
                  value={tempDailyCap}
                  onChange={(e) => setTempDailyCap(Number(e.target.value))}
                  className="w-full accent-indigo-500 bg-zinc-800 h-1.5 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-zinc-400">Target University Exam Score</span>
                  <span className="font-mono text-emerald-400 font-semibold">{tempTarget} / 100</span>
                </div>
                <input
                  type="range"
                  min="55"
                  max="95"
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
                Apply Constraints & Re-derive Plan
              </button>
            </div>
          </div>
        )}

        {/* Schedule Summary Bar */}
        <div className="px-5 py-3 bg-[#121214] grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono text-zinc-400 border-t border-zinc-800/40">
          <div>
            <span className="text-zinc-500 block text-[11px]">Total Span:</span>
            <span className="text-zinc-200 font-semibold">14 Days Calendar</span>
          </div>
          <div>
            <span className="text-zinc-500 block text-[11px]">Strict Daily Limit:</span>
            <span className="text-indigo-400 font-semibold">Max {profile.dailyHoursCap} hrs/day</span>
          </div>
          <div>
            <span className="text-zinc-500 block text-[11px]">Buffer Days:</span>
            <span className="text-emerald-400 font-semibold">Day 7 & Day 14 (2 Days)</span>
          </div>
          <div>
            <span className="text-zinc-500 block text-[11px]">Completed Hours:</span>
            <span className="text-zinc-200 font-semibold">2.4 / 32.5 Total Hrs</span>
          </div>
        </div>
      </div>

      {/* Main Two-Zone Timetable View: Days Selector Strip + Day Detail Deck */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 14-Day Timeline Navigator (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between text-xs text-zinc-400 px-1 font-mono">
            <span>Day-by-Day Timeline</span>
            <span>14 Days Total</span>
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
                    <span>{day.sessions[0]?.title.slice(0, 32)}...</span>
                    <span className="font-mono text-emerald-400">
                      {completedCount}/{totalSessions} done
                    </span>
                  </div>

                  {/* Priority Mini Badge */}
                  {!day.isBufferDay && (
                    <div className="mt-2 pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[10px] font-mono text-zinc-500">
                      <span>Priority P_i: {day.priorityMetrics.calculatedPriority}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const targetTopic = allTopics.find((t) => t.id === day.sessions[0]?.topicId) || null;
                          onOpenPriorityExplainer(day, targetTopic);
                        }}
                        className="text-indigo-400 hover:text-indigo-300 underline cursor-pointer"
                      >
                        Why this day?
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Day Sessions & Details (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Day Detail Card */}
          <div className="border border-[#27272a] rounded-xl bg-[#18181b] p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-zinc-100">
                    {selectedDay.date} — Planned Sessions
                  </h2>
                  {selectedDay.isBufferDay && (
                    <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono">
                      Catch-up Window
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Allocated: <strong className="text-zinc-200">{(selectedDay.totalMinutes / 60).toFixed(1)} hrs</strong> of {profile.dailyHoursCap} hrs daily cap.
                </p>
              </div>

              {!selectedDay.isBufferDay && (
                <button
                  onClick={() => {
                    const topTopic = allTopics.find((t) => t.id === selectedDay.sessions[0]?.topicId) || null;
                    onOpenPriorityExplainer(selectedDay, topTopic);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-mono font-medium transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                >
                  <Info className="w-3.5 h-3.5" />
                  <span>Inspect Deterministic Formula (P_i: {selectedDay.priorityMetrics.calculatedPriority})</span>
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
                        {/* Completion Checkbox */}
                        <button
                          onClick={() => onToggleSessionComplete(selectedDay.dayNumber, session.id)}
                          className={`mt-0.5 h-5 w-5 rounded-md border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                            session.completed
                              ? 'bg-emerald-600 border-emerald-500 text-white'
                              : 'border-zinc-700 bg-zinc-800/60 hover:border-zinc-500 text-transparent'
                          }`}
                          title={session.completed ? 'Mark as incomplete' : 'Mark as completed'}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </button>

                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${style.badge}`}>
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

                          <h3 className={`text-sm font-semibold text-zinc-100 ${session.completed ? 'line-through text-zinc-500' : ''}`}>
                            {session.title}
                          </h3>

                          {session.notes && (
                            <p className="text-xs text-zinc-400 italic">
                              {session.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Launch Study Room Button */}
                      <button
                        onClick={() => onSelectSessionForStudy(session.topicId, session)}
                        className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-indigo-600 text-zinc-300 hover:text-white text-xs font-medium transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
                        title="Open topic in Active Study Room"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Open Topic</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Why This Was Prioritized Section */}
            {!selectedDay.isBufferDay && selectedDay.priorityMetrics.justification.length > 0 && (
              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                <h4 className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  Algorithmic Priority Justification for {selectedDay.date}:
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
