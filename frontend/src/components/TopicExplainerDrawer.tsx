import React from 'react';
import { X, Calculator, TrendingUp, AlertTriangle, BookOpen, Brain, CheckCircle2 } from 'lucide-react';
import { DaySchedule, Topic } from '../types';

interface TopicExplainerDrawerProps {
  daySchedule: DaySchedule | null;
  topic: Topic | null;
  onClose: () => void;
}

export const TopicExplainerDrawer: React.FC<TopicExplainerDrawerProps> = ({
  daySchedule,
  topic,
  onClose
}) => {
  if (!daySchedule && !topic) return null;

  const frequency = daySchedule?.priorityMetrics.frequency ?? topic?.frequencyScore ?? 0;
  const difficulty = daySchedule?.priorityMetrics.difficulty ?? topic?.difficultyScore ?? 0;
  const syllabus = daySchedule?.priorityMetrics.syllabusWeight ?? topic?.syllabusWeight ?? 0;
  const mastery = topic ? topic.masteryPercentage : (100 - (daySchedule?.priorityMetrics.masteryDeficit ?? 100));
  const deficit = 100 - mastery;

  const freqContribution = (0.35 * frequency).toFixed(1);
  const diffContribution = (0.20 * difficulty).toFixed(1);
  const syllContribution = (0.25 * syllabus).toFixed(1);
  const defContribution = (0.20 * deficit).toFixed(1);
  const calculatedPriority = (
    0.35 * frequency +
    0.20 * difficulty +
    0.25 * syllabus +
    0.20 * deficit
  ).toFixed(1);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm">
      <div 
        className="w-full max-w-xl h-full bg-[#18181b] border-l border-[#27272a] shadow-2xl flex flex-col overflow-hidden text-zinc-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-6 border-b border-[#27272a] bg-[#121214] flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Topic Priority Breakdown
              </span>
              {daySchedule && (
                <span className="text-xs font-mono text-zinc-400">
                  {daySchedule.date}
                </span>
              )}
            </div>
            <h2 className="text-lg font-bold text-zinc-100 leading-snug">
              {topic ? topic.title : `Day ${daySchedule?.dayNumber} Priority Score`}
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              How this topic&apos;s priority score was calculated from past exam weightage and your current familiarity.
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Formula Display Card */}
          <div className="p-4 rounded-xl bg-[#0e0e11] border border-[#27272a] space-y-3">
            <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
              <span className="flex items-center gap-1.5 text-indigo-400 font-medium">
                <Calculator className="w-4 h-4" />
                Priority Formula
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                Total Score: {calculatedPriority} / 100
              </span>
            </div>
            <div className="p-3 rounded-lg bg-zinc-900/80 border border-zinc-800 font-mono text-xs text-zinc-200 overflow-x-auto">
              <code>Priority = 0.35×(PYQ Freq) + 0.25×(Syllabus) + 0.20×(Difficulty) + 0.20×(100 - Familiarity)</code>
            </div>
          </div>

          {/* Metric Breakdown Table */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 font-mono">
              Score Components
            </h3>

            <div className="space-y-3">
              {/* Metric 1: Frequency */}
              <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/80 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-zinc-300 font-medium">
                    <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                    Past Exam Frequency (0.35 × {frequency})
                  </span>
                  <span className="font-mono text-zinc-200">+{freqContribution} pts</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                  <div 
                    className="h-full bg-amber-400 rounded-full" 
                    style={{ width: `${frequency}%` }}
                  />
                </div>
                {topic && (
                  <p className="text-[11px] text-zinc-500">
                    Asked {topic.appearancesCount} times in recent university papers ({topic.totalMarksInPast5Years} marks total).
                  </p>
                )}
              </div>

              {/* Metric 2: Syllabus Weight */}
              <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/80 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-zinc-300 font-medium">
                    <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                    Syllabus Weightage (0.25 × {syllabus})
                  </span>
                  <span className="font-mono text-zinc-200">+{syllContribution} pts</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                  <div 
                    className="h-full bg-blue-400 rounded-full" 
                    style={{ width: `${syllabus}%` }}
                  />
                </div>
              </div>

              {/* Metric 3: Difficulty */}
              <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/80 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-zinc-300 font-medium">
                    <Brain className="w-3.5 h-3.5 text-purple-400" />
                    Topic Complexity (0.20 × {difficulty})
                  </span>
                  <span className="font-mono text-zinc-200">+{diffContribution} pts</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                  <div 
                    className="h-full bg-purple-400 rounded-full" 
                    style={{ width: `${difficulty}%` }}
                  />
                </div>
              </div>

              {/* Metric 4: Mastery Deficit */}
              <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/80 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-zinc-300 font-medium">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                    Remaining Study Gap [100 - {mastery}%] (0.20 × {deficit})
                  </span>
                  <span className="font-mono text-zinc-200">+{defContribution} pts</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                  <div 
                    className="h-full bg-rose-400 rounded-full" 
                    style={{ width: `${deficit}%` }}
                  />
                </div>
                <p className="text-[11px] text-zinc-500">
                  Your current familiarity is {mastery}%, leaving a {deficit}% study gap.
                </p>
              </div>
            </div>
          </div>

          {daySchedule && daySchedule.priorityMetrics.justification.length > 0 && (
            <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-2.5">
              <h4 className="text-xs font-semibold text-zinc-300">
                Schedule Notes:
              </h4>
              <ul className="space-y-1.5 text-xs text-zinc-400">
                {daySchedule.priorityMetrics.justification.map((note, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-[#27272a] bg-[#121214] flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
