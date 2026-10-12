import React from 'react';
import { 
  BookMarked, 
  Calendar, 
  Layers, 
  BarChart3, 
  FileCheck,
  RotateCcw
} from 'lucide-react';
import { Language, StudentProfile } from '../types';

interface NavbarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  profile: StudentProfile;
  onOpenTraces: () => void;
  onResetToZero?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  language,
  onLanguageChange,
  profile,
  onResetToZero
}) => {
  const navItems = [
    { id: 'ingestion', label: '1. Setup', icon: FileCheck, badge: !profile.isSetupComplete ? 'Start' : undefined },
    { id: 'syllabus', label: '2. Syllabus', icon: Layers },
    { id: 'timetable', label: '3. Study Plan', icon: Calendar, badge: profile.isSetupComplete && !profile.planApproved ? 'Review' : undefined },
    { id: 'studyroom', label: '4. Study Room', icon: BookMarked },
    { id: 'dashboard', label: '5. Progress', icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#27272a] bg-[#09090b]/95 backdrop-blur-md">
      {/* Review Notification Ribbon (only active after setup when a plan needs approval) */}
      {profile.isSetupComplete && profile.hitlInterruptActive && !profile.planApproved && (
        <div className="bg-amber-950/60 border-b border-amber-500/30 px-4 py-1.5 flex items-center justify-between gap-2 text-xs text-amber-200">
          <div className="flex items-center gap-2 min-w-0 truncate">
            <span className="flex h-2 w-2 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <span className="font-medium shrink-0">Action Needed:</span>
            <span className="text-amber-300/90 truncate">{profile.hitlInterruptReason}</span>
          </div>
          <button 
            onClick={() => onTabChange('timetable')}
            className="text-xs px-2.5 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/30 transition-colors font-medium shrink-0 cursor-pointer"
          >
            Review Schedule &rarr;
          </button>
        </div>
      )}

      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 overflow-hidden">
        {/* Zone 1: Compact Brand Wordmark & Subject Badge */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-bold text-xs shadow-md shadow-indigo-500/20 shrink-0">
            RP
          </div>
          <span className="font-bold text-sm sm:text-base tracking-tight text-white whitespace-nowrap">
            RGPV Prep
          </span>

          {profile.subjectCode && (
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-[11px] font-mono text-indigo-400 whitespace-nowrap">
              {profile.subjectCode}
            </span>
          )}

          {profile.isSetupComplete && (
            <span className="hidden lg:inline-flex items-center px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-mono text-emerald-400 whitespace-nowrap">
              {profile.daysRemaining}d left
            </span>
          )}
        </div>

        {/* Zone 2: Center Navigation Links (Compact, Single-Line, Never Overflows) */}
        <nav className="hidden md:flex items-center gap-1 min-w-0">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                  isActive 
                    ? 'text-white bg-zinc-800/90 shadow-sm border border-zinc-700/60' 
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-indigo-400' : 'text-zinc-500'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Language, Target Score & Reset */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Bilingual Language Switcher Toggle */}
          <div className="flex items-center p-0.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs">
            <button
              onClick={() => onLanguageChange('en')}
              className={`px-2 py-1 rounded font-medium transition-colors cursor-pointer ${
                language === 'en' 
                  ? 'bg-zinc-800 text-white shadow-xs font-semibold' 
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="English Notes"
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
              title="Hinglish Notes"
            >
              Hinglish
            </button>
          </div>

          {/* Target Score Chip (only shown after user configures it) */}
          {profile.isSetupComplete && (
            <div className="hidden xl:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 font-mono text-xs whitespace-nowrap">
              <span className="text-zinc-500">Goal:</span>
              <span className="font-semibold text-emerald-400">
                {profile.targetScore}/{profile.maxExamMarks}
              </span>
            </div>
          )}

          {/* Reset to Zero Button */}
          {onResetToZero && profile.isSetupComplete && (
            <button
              onClick={onResetToZero}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-zinc-900 hover:bg-rose-950/40 border border-zinc-800 hover:border-rose-500/30 text-xs text-zinc-400 hover:text-rose-300 transition-colors cursor-pointer"
              title="Reset everything back to 0 (New User State)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Reset</span>
            </button>
          )}
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
