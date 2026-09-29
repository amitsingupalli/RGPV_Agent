import React from 'react';
import { 
  Sparkles, 
  Terminal, 
  Clock, 
  AlertCircle, 
  Globe, 
  BookMarked, 
  Calendar, 
  Layers, 
  BarChart3, 
  FileCheck,
  CheckCircle2
} from 'lucide-react';
import { Language, StudentProfile } from '../types';

interface NavbarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  profile: StudentProfile;
  onOpenTraces: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  language,
  onLanguageChange,
  profile,
  onOpenTraces
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'ingestion', label: 'Documents & Ingestion', icon: FileCheck },
    { id: 'syllabus', label: 'Curriculum & PYQs', icon: Layers },
    { id: 'timetable', label: 'Study Timetable', icon: Calendar, badge: profile.planApproved ? undefined : 'Review' },
    { id: 'studyroom', label: 'Active Study Room', icon: BookMarked },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#27272a] bg-[#09090b]/90 backdrop-blur-md">
      {/* Human In The Loop Interrupt Notification Ribbon (if active) */}
      {profile.hitlInterruptActive && !profile.planApproved && (
        <div className="bg-amber-950/60 border-b border-amber-500/30 px-4 py-1.5 flex items-center justify-between text-xs text-amber-200">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <span className="font-medium">Human-in-the-Loop Interrupt Active:</span>
            <span className="text-amber-300/90">{profile.hitlInterruptReason}</span>
          </div>
          <button 
            onClick={() => onTabChange('timetable')}
            className="text-xs px-2.5 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/30 transition-colors font-medium cursor-pointer"
          >
            Review Timetable Constraints &rarr;
          </button>
        </div>
      )}

      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Zone 1: Brand Wordmark & Subject Identifier */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-bold text-xs shadow-md shadow-indigo-500/20">
              RP
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-bold text-base tracking-tight text-white">
                RGPV-Agent
              </span>
              <span className="hidden sm:inline-block text-xs font-mono text-zinc-400">
                CS-403 DBMS
              </span>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-zinc-800 text-xs text-zinc-400">
            <span>B.Tech CSE</span>
            <span aria-hidden="true" className="text-zinc-600">·</span>
            <span>Sem IV</span>
            <span aria-hidden="true" className="text-zinc-600">·</span>
            <span className="text-emerald-400 font-mono">12 Days to Exam</span>
          </div>
        </div>

        {/* Zone 2: Navigation Links (Single-Line, Text with Active States) */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all relative cursor-pointer ${
                  isActive 
                    ? 'text-white bg-zinc-800/90 shadow-sm border border-zinc-700/60' 
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-400' : 'text-zinc-500'}`} />
                <span className="whitespace-nowrap">{item.label}</span>
                {item.badge && (
                  <span className="ml-1 text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Actions (Language, Traces, Countdown) */}
        <div className="flex items-center gap-2.5">
          {/* Bilingual Language Switcher Toggle */}
          <div className="flex items-center p-0.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs">
            <button
              onClick={() => onLanguageChange('en')}
              className={`px-2 py-1 rounded font-medium transition-colors cursor-pointer ${
                language === 'en' 
                  ? 'bg-zinc-800 text-white shadow-xs font-semibold' 
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="English Pedagogical Content"
            >
              EN
            </button>
            <button
              onClick={() => onLanguageChange('hi')}
              className={`px-2 py-1 rounded font-medium transition-colors cursor-pointer ${
                language === 'hi' 
                  ? 'bg-indigo-600/30 text-indigo-300 font-semibold border border-indigo-500/30' 
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Hinglish Real-World Explanations"
            >
              Hinglish
            </button>
          </div>

          {/* Execution Tracing Modal Trigger */}
          <button
            onClick={onOpenTraces}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-300 transition-colors cursor-pointer"
            title="View LangGraph Agent Execution Traces"
          >
            <Terminal className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Telemetry</span>
          </button>

          {/* Target Score Chip */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 font-mono text-xs">
            <span className="text-zinc-500">Target:</span>
            <span className="font-semibold text-emerald-400">{profile.targetScore}/100</span>
          </div>
        </div>
      </div>

      {/* Mobile Tab Bar */}
      <div className="flex md:hidden overflow-x-auto px-4 py-2 border-t border-zinc-800/80 gap-1 bg-[#0d0d10]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs whitespace-nowrap font-medium ${
                isActive 
                  ? 'text-white bg-zinc-800' 
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
