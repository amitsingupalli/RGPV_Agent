import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  Sliders, 
  ArrowRight, 
  RefreshCw, 
  Trash2,
  FileCheck,
  User,
  BookOpen,
  AlertCircle,
  Clock
} from 'lucide-react';
import { 
  StudentProfile, 
  UploadedDocumentItem, 
  StudyTimeSlot, 
  StartingPreparationLevel 
} from '../types';
import { getCurriculumForSubject } from '../data/subjectCurriculumEngine';
import { getSubjectsForBranchAndSemester } from '../data/rgpvSubjectCatalog';

interface DocumentIngestionHubProps {
  profile: StudentProfile;
  files: UploadedDocumentItem[];
  onUpdateFiles: React.Dispatch<React.SetStateAction<UploadedDocumentItem[]>>;
  onUpdateProfile: (updates: Partial<StudentProfile>) => void;
  onCompleteIngestion: (customUnitMastery?: Record<string, number>) => void;
}

export const DocumentIngestionHub: React.FC<DocumentIngestionHubProps> = ({
  profile,
  files,
  onUpdateFiles,
  onUpdateProfile,
  onCompleteIngestion,
}) => {
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [extractionProgress, setExtractionProgress] = useState<number>(0);
  const [extractionStageText, setExtractionStageText] = useState<string>('');
  const [uploadCategory, setUploadCategory] = useState<'Syllabus' | 'PYQ' | 'Notes'>('Syllabus');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Custom per-unit starting confidence when user chooses 'custom'
  const [customUnitMastery, setCustomUnitMastery] = useState<Record<string, number>>({
    'unit-1': 0,
    'unit-2': 0,
    'unit-3': 0,
    'unit-4': 0,
    'unit-5': 0,
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Calculate days remaining when user picks an exam date
  const handleExamDateChange = (dateStr: string) => {
    if (!dateStr) {
      onUpdateProfile({ examDate: '' });
      return;
    }
    const picked = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffMs = picked.getTime() - today.getTime();
    const diffDays = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    onUpdateProfile({
      examDate: dateStr,
      daysRemaining: diffDays,
    });
  };

  // Real browser file input handler
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    const added: UploadedDocumentItem[] = Array.from(selectedFiles).map((file, idx) => {
      const sizeKB = file.size / 1024;
      const sizeFormatted =
        sizeKB >= 1024
          ? `${(sizeKB / 1024).toFixed(2)} MB`
          : `${Math.max(1, Math.round(sizeKB))} KB`;
      const estimatedPages = Math.max(1, Math.min(60, Math.round(sizeKB / 65) || 4));

      return {
        id: `doc-${Date.now()}-${idx}`,
        name: file.name,
        size: sizeFormatted,
        pages: estimatedPages,
        category: uploadCategory,
        status: 'verified',
        progress: 100,
      };
    });

    onUpdateFiles((prev) => [...prev, ...added]);
    setValidationError(null);
    e.target.value = '';
  };

  // Quick-fill helper for users who want to test with the reference RGPV CS-501 DBMS data
  const handleFillSampleCourse = () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 14);
    const isoDate = futureDate.toISOString().split('T')[0];

    onUpdateProfile({
      studentName: profile.studentName || 'Student',
      university: 'RGPV Bhopal',
      program: 'B.Tech',
      branch: 'Computer Science & Engineering (CSE)',
      semester: '5th Semester (V)',
      subjectCode: 'CS-502',
      subjectName: 'Database Management Systems',
      maxExamMarks: 70,
      targetScore: 55,
      dailyHoursCap: 2.5,
      bufferDays: 2,
      preferredStudySlot: 'morning',
      startingLevel: 'zero',
      examDate: isoDate,
      daysRemaining: 14,
    });

    if (files.length === 0) {
      onUpdateFiles([
        {
          id: 'sample-syl',
          name: 'RGPV_CS501_DBMS_Syllabus.pdf',
          size: '1.2 MB',
          pages: 4,
          category: 'Syllabus',
          status: 'verified',
          progress: 100,
        },
        {
          id: 'sample-pyq',
          name: 'RGPV_CS501_PYQ_2020_2024.pdf',
          size: '4.8 MB',
          pages: 18,
          category: 'PYQ',
          status: 'verified',
          progress: 100,
        },
      ]);
    }
    setValidationError(null);
  };

  const handleRemoveFile = (id: string) => {
    onUpdateFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleStartExtraction = () => {
    // Validate required user inputs so we never assume missing fields
    if (!profile.program.trim() || !profile.branch.trim() || !profile.semester.trim()) {
      setValidationError('Please select your Program, Branch, and Semester before continuing.');
      return;
    }
    if (!profile.subjectCode.trim() || !profile.subjectName.trim()) {
      setValidationError('Please select your Subject from the dropdown before continuing.');
      return;
    }

    setValidationError(null);
    setIsExtracting(true);
    const totalPages = files.reduce((acc, f) => acc + f.pages, 0);

    setExtractionProgress(15);
    setExtractionStageText(
      files.length > 0
        ? `Reading ${files.length} uploaded document(s) (${totalPages} pages)...`
        : `Loading built-in RGPV syllabus & past papers for ${profile.subjectCode} (${profile.subjectName})...`
    );

    setTimeout(() => {
      setExtractionProgress(45);
      setExtractionStageText(`Extracting syllabus units & past exam questions for ${profile.subjectCode}...`);
    }, 500);

    setTimeout(() => {
      setExtractionProgress(80);
      setExtractionStageText(
        `Building ${profile.daysRemaining}-day schedule (${profile.dailyHoursCap} hrs/day cap, ${profile.bufferDays} buffer days)...`
      );
    }, 1100);

    setTimeout(() => {
      setExtractionProgress(100);
      setIsExtracting(false);
      onCompleteIngestion(
        profile.startingLevel === 'custom' ? customUnitMastery : undefined
      );
    }, 1600);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Top Banner */}
      <div className="border border-[#27272a] rounded-xl bg-[#121214] p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-zinc-100 tracking-tight">
              Step 1: Course Setup &amp; Document Upload
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Enter your academic details, study constraints, and current preparation level, then upload your syllabus and past question papers.
            </p>
          </div>

          <button
            type="button"
            onClick={handleFillSampleCourse}
            className="px-3.5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-indigo-300 border border-indigo-500/30 transition-colors shrink-0 cursor-pointer"
          >
            Quick-Fill Sample CS-501 (DBMS) Data
          </button>
        </div>
      </div>

      {/* Validation Banner if user misses required inputs */}
      {validationError && (
        <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 flex items-center gap-2.5 text-xs text-rose-200">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Student Profile, Course & Study Constraints (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Card 1: Student & Subject Details */}
          <div className="border border-[#27272a] rounded-xl bg-[#18181b] p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-zinc-800">
              <User className="w-4 h-4 text-indigo-400" />
              <h2 className="text-sm font-semibold text-zinc-100">
                1. Student &amp; Subject Details
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., Amit"
                  value={profile.studentName}
                  onChange={(e) => onUpdateProfile({ studentName: e.target.value })}
                  className="w-full bg-[#121214] border border-[#27272a] rounded-lg px-3 py-2 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  University / Scheme
                </label>
                <input
                  type="text"
                  placeholder="e.g., RGPV Bhopal"
                  value={profile.university}
                  onChange={(e) => onUpdateProfile({ university: e.target.value })}
                  className="w-full bg-[#121214] border border-[#27272a] rounded-lg px-3 py-2 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Degree Program *
                </label>
                <select
                  value={profile.program || 'B.Tech'}
                  onChange={(e) => onUpdateProfile({ program: e.target.value })}
                  className="w-full bg-[#121214] border border-[#27272a] rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="B.Tech">B.Tech (Bachelor of Technology)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Semester *
                </label>
                <select
                  value={profile.semester}
                  onChange={(e) => {
                    const nextSem = e.target.value;
                    const nextSubjects = getSubjectsForBranchAndSemester(profile.branch, nextSem);
                    const stillValid = nextSubjects.some((s) => s.code === profile.subjectCode);
                    onUpdateProfile({
                      semester: nextSem,
                      ...(stillValid ? {} : { subjectCode: '', subjectName: '' }),
                    });
                  }}
                  className="w-full bg-[#121214] border border-[#27272a] rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="">-- Select Semester --</option>
                  <option value="1st Semester (I)">1st Semester (I)</option>
                  <option value="2nd Semester (II)">2nd Semester (II)</option>
                  <option value="3rd Semester (III)">3rd Semester (III)</option>
                  <option value="4th Semester (IV)">4th Semester (IV)</option>
                  <option value="5th Semester (V)">5th Semester (V)</option>
                  <option value="6th Semester (VI)">6th Semester (VI)</option>
                  <option value="7th Semester (VII)">7th Semester (VII)</option>
                  <option value="8th Semester (VIII)">8th Semester (VIII)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">
                Branch / Specialization *
              </label>
              <select
                value={profile.branch}
                onChange={(e) => {
                  const nextBranch = e.target.value;
                  const nextSubjects = getSubjectsForBranchAndSemester(nextBranch, profile.semester);
                  const stillValid = nextSubjects.some((s) => s.code === profile.subjectCode);
                  onUpdateProfile({
                    branch: nextBranch,
                    ...(stillValid ? {} : { subjectCode: '', subjectName: '' }),
                  });
                }}
                className="w-full bg-[#121214] border border-[#27272a] rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="">-- Select Branch --</option>
                <option value="Computer Science & Engineering (CSE)">
                  Computer Science &amp; Engineering (CSE)
                </option>
                <option value="CSE (AI & Machine Learning)">
                  CSE (AI &amp; Machine Learning)
                </option>
                <option value="CSE (Data Science)">
                  CSE (Data Science)
                </option>
                <option value="Electronics & Communication Engineering (ECE)">
                  Electronics &amp; Communication Engineering (ECE)
                </option>
              </select>
            </div>

            {/* Dynamic Subject Dropdown based on selected Branch & Semester */}
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">
                Subject (Auto-loaded for Selected Semester &amp; Branch) *
              </label>
              {(() => {
                const availableSubjects = getSubjectsForBranchAndSemester(
                  profile.branch,
                  profile.semester
                );
                const isReady = Boolean(profile.branch && profile.semester);

                return (
                  <div className="space-y-2">
                    <select
                      disabled={!isReady}
                      value={profile.subjectCode}
                      onChange={(e) => {
                        const selectedCode = e.target.value;
                        const found = availableSubjects.find((s) => s.code === selectedCode);
                        if (found) {
                          onUpdateProfile({
                            subjectCode: found.code,
                            subjectName: found.name,
                          });
                        } else {
                          onUpdateProfile({
                            subjectCode: '',
                            subjectName: '',
                          });
                        }
                      }}
                      className="w-full bg-[#121214] border border-[#27272a] disabled:opacity-50 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="">
                        {!isReady
                          ? '-- Select Semester & Branch first --'
                          : `-- Select Subject (${availableSubjects.length} subjects available) --`}
                      </option>
                      {availableSubjects.map((subj) => (
                        <option key={subj.code} value={subj.code}>
                          {subj.code} — {subj.name}
                        </option>
                      ))}
                    </select>

                    {profile.subjectCode && profile.subjectName && (
                      <div className="px-3 py-2 rounded-lg bg-[#121214] border border-zinc-800/80 flex items-center justify-between text-xs">
                        <span className="text-zinc-300 font-medium">
                          {profile.subjectName}
                        </span>
                        <span className="font-mono text-indigo-400 px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                          {profile.subjectCode}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Card 2: Exam Timeline, Study Constraints & Starting Level */}
          <div className="border border-[#27272a] rounded-xl bg-[#18181b] p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-zinc-800">
              <Sliders className="w-4 h-4 text-indigo-400" />
              <h2 className="text-sm font-semibold text-zinc-100">
                2. Your Study Constraints &amp; Starting Level
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Target Exam Date
                </label>
                <input
                  type="date"
                  value={profile.examDate}
                  onChange={(e) => handleExamDateChange(e.target.value)}
                  className="w-full bg-[#121214] border border-[#27272a] rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Days Left Until Exam
                </label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={profile.daysRemaining}
                  onChange={(e) =>
                    onUpdateProfile({
                      daysRemaining: Math.max(1, Math.min(60, Number(e.target.value) || 1)),
                    })
                  }
                  className="w-full bg-[#121214] border border-[#27272a] rounded-lg px-3 py-2 text-xs font-mono text-zinc-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Daily Hours & Buffer Days */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-zinc-400 font-medium">Daily Study Hours</span>
                  <span className="font-mono text-indigo-400 font-semibold">
                    {profile.dailyHoursCap.toFixed(1)} hrs/day
                  </span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="8.0"
                  step="0.5"
                  value={profile.dailyHoursCap}
                  onChange={(e) => onUpdateProfile({ dailyHoursCap: Number(e.target.value) })}
                  className="w-full accent-indigo-500 bg-zinc-800 h-1.5 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Pre-Exam Revision Buffer Days
                </label>
                <select
                  value={profile.bufferDays}
                  onChange={(e) => onUpdateProfile({ bufferDays: Number(e.target.value) })}
                  className="w-full bg-[#121214] border border-[#27272a] rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value={0}>0 Buffer Days (Study till last day)</option>
                  <option value={1}>1 Buffer Day before exam</option>
                  <option value={2}>2 Buffer Days before exam</option>
                  <option value={3}>3 Buffer Days before exam</option>
                </select>
              </div>
            </div>

            {/* Max Marks & Target Marks */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Exam Paper Total Marks
                </label>
                <select
                  value={profile.maxExamMarks}
                  onChange={(e) => {
                    const newMax = Number(e.target.value);
                    onUpdateProfile({
                      maxExamMarks: newMax,
                      targetScore: Math.min(profile.targetScore, newMax),
                    });
                  }}
                  className="w-full bg-[#121214] border border-[#27272a] rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value={70}>70 Marks (RGPV Theory Paper)</option>
                  <option value={100}>100 Marks (Full Assessment)</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-zinc-400 font-medium">Your Target Marks</span>
                  <span className="font-mono text-emerald-400 font-semibold">
                    {profile.targetScore} / {profile.maxExamMarks}
                  </span>
                </div>
                <input
                  type="range"
                  min={Math.round(profile.maxExamMarks * 0.35)}
                  max={profile.maxExamMarks}
                  value={profile.targetScore}
                  onChange={(e) => onUpdateProfile({ targetScore: Number(e.target.value) })}
                  className="w-full accent-emerald-500 bg-zinc-800 h-1.5 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Preferred Study Time & Language */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Preferred Study Time Slot
                </label>
                <select
                  value={profile.preferredStudySlot}
                  onChange={(e) =>
                    onUpdateProfile({ preferredStudySlot: e.target.value as StudyTimeSlot })
                  }
                  className="w-full bg-[#121214] border border-[#27272a] rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="morning">Morning Session</option>
                  <option value="afternoon">Afternoon Session</option>
                  <option value="night">Night Owl Session</option>
                  <option value="flexible">Flexible / Any Time</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Preferred Notes Language
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => onUpdateProfile({ language: 'en' })}
                    className={`px-3 py-2 rounded-lg text-xs font-medium border text-center transition-colors cursor-pointer ${
                      profile.language === 'en'
                        ? 'bg-zinc-800 border-indigo-500 text-white font-semibold'
                        : 'bg-[#121214] border-[#27272a] text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateProfile({ language: 'hi' })}
                    className={`px-3 py-2 rounded-lg text-xs font-medium border text-center transition-colors cursor-pointer ${
                      profile.language === 'hi'
                        ? 'bg-indigo-950/40 border-indigo-500 text-indigo-300 font-semibold'
                        : 'bg-[#121214] border-[#27272a] text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Hinglish
                  </button>
                </div>
              </div>
            </div>

            {/* Current Preparation Level (Starting from 0 by default!) */}
            <div className="pt-2 border-t border-zinc-800 space-y-2.5">
              <label className="block text-xs font-medium text-zinc-300">
                How much of this subject have you studied so far?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { id: 'zero', label: 'Starting from 0 (0%)', desc: 'Fresh start' },
                  { id: 'basics', label: 'Know Basics (~25%)', desc: 'Attended lectures' },
                  { id: 'custom', label: 'Rate Each Unit', desc: 'Set per-unit %' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() =>
                      onUpdateProfile({ startingLevel: opt.id as StartingPreparationLevel })
                    }
                    className={`p-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                      profile.startingLevel === opt.id
                        ? 'bg-indigo-950/30 border-indigo-500 text-zinc-100'
                        : 'bg-[#121214] border-[#27272a] text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <div className="text-xs font-semibold">{opt.label}</div>
                    <div className="text-[10px] text-zinc-500">{opt.desc}</div>
                  </button>
                ))}
              </div>

              {/* Per-unit sliders if user selects 'custom' */}
              {profile.startingLevel === 'custom' && (
                <div className="p-3.5 rounded-lg bg-[#121214] border border-zinc-800 space-y-2.5 mt-2">
                  <span className="text-[11px] text-zinc-400 block">
                    Rate your current confidence in each unit of{' '}
                    <strong className="text-zinc-200">
                      {profile.subjectCode ? `${profile.subjectCode} (${profile.subjectName})` : 'your selected subject'}
                    </strong>{' '}
                    (0% = not started):
                  </span>
                  {getCurriculumForSubject(profile.subjectCode, profile.subjectName).units.map((u) => (
                    <div key={u.id} className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-zinc-300 truncate pr-2">
                          {u.code}: {u.title}
                        </span>
                        <span className="font-mono text-indigo-400">
                          {customUnitMastery[u.id] ?? 0}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={90}
                        step={5}
                        value={customUnitMastery[u.id] ?? 0}
                        onChange={(e) =>
                          setCustomUnitMastery((prev) => ({
                            ...prev,
                            [u.id]: Number(e.target.value),
                          }))
                        }
                        className="w-full accent-indigo-500 bg-zinc-800 h-1 rounded-lg cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Real Document Upload & Plan Generation (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="border border-[#27272a] rounded-xl bg-[#18181b] p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-indigo-400" />
                <h2 className="text-sm font-semibold text-zinc-100">
                  3. Upload Extra Notes or PYQ PDFs (Optional)
                </h2>
              </div>
              <span className="text-xs font-mono text-zinc-400">
                {files.length === 0
                  ? 'Using Built-in RGPV Catalog'
                  : `${files.length} ${files.length === 1 ? 'File' : 'Files'} Uploaded`}
              </span>
            </div>

            {/* Category selector before picking file */}
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="text-zinc-400">Optional Document Type:</span>
              <div className="flex items-center gap-1.5">
                {(['Syllabus', 'PYQ', 'Notes'] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setUploadCategory(cat)}
                    className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors cursor-pointer ${
                      uploadCategory === cat
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                        : 'bg-[#121214] border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Hidden Native File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt"
              multiple
              onChange={handleFileInputChange}
              className="hidden"
            />

            {/* Upload Dropzone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#27272a] hover:border-indigo-500/60 rounded-xl p-6 text-center bg-[#121214]/60 transition-colors cursor-pointer"
            >
              <div className="max-w-md mx-auto space-y-3">
                <div className="w-10 h-10 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/20">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-zinc-200">
                    Have your own PDFs or class notes? Click to upload (Optional)
                  </p>
                  <p className="text-[11px] text-zinc-500 mt-1">
                    If you don&apos;t have any files to upload, you can skip this step—we automatically use the built-in RGPV syllabus and past papers for your selected subject.
                  </p>
                </div>

                <div className="flex flex-wrap justify-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setUploadCategory('Syllabus');
                      fileInputRef.current?.click();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 transition-colors border border-zinc-700 cursor-pointer"
                  >
                    + Upload Syllabus PDF
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setUploadCategory('PYQ');
                      fileInputRef.current?.click();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-xs text-indigo-300 transition-colors border border-indigo-500/30 font-medium cursor-pointer"
                  >
                    + Upload PYQ Paper
                  </button>
                </div>
              </div>
            </div>

            {/* Uploaded Files List or Built-In Fallback Notice */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span> Study Material Source</span>
                {files.length > 0 && (
                  <button
                    type="button"
                    onClick={() => onUpdateFiles([])}
                    className="text-[11px] text-zinc-500 hover:text-rose-400 cursor-pointer"
                  >
                    Clear Uploaded Files
                  </button>
                )}
              </div>

              {files.length === 0 ? (
                <div className="p-4 rounded-xl bg-emerald-950/15 border border-emerald-500/25 flex items-start gap-3 text-xs">
                  <BookOpen className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-zinc-200 font-medium">
                      No files uploaded — Using Built-in RGPV Curriculum
                    </p>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      {profile.subjectCode
                        ? `We will automatically load the 5-Unit RGPV Syllabus and Past Year Questions for ${profile.subjectCode} (${profile.subjectName}).`
                        : 'Select your Semester, Branch, and Subject on the left, then click "Save Preferences & Generate Study Plan" below—no file upload required!'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className="p-3 rounded-lg bg-[#121214] border border-[#27272a] flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 rounded bg-zinc-800 text-indigo-400 shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-zinc-200 truncate">
                              {file.name}
                            </span>
                            <span
                              className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                                file.category === 'Syllabus'
                                  ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                  : file.category === 'PYQ'
                                  ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              }`}
                            >
                              {file.category}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-zinc-500 mt-0.5 font-mono">
                            <span>~{file.pages} Pages</span>
                            <span>·</span>
                            <span>{file.size}</span>
                            <span>·</span>
                            <span className="text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Ready
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveFile(file.id)}
                        className="p-1.5 rounded text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 transition-colors cursor-pointer"
                        title="Remove file"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Summary of User's Selected Settings Before Building Plan */}
            <div className="p-3.5 rounded-xl bg-[#121214] border border-zinc-800/80 space-y-2 text-xs">
              <div className="flex items-center gap-1.5 text-zinc-300 font-medium">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>Your Configured Plan Summary:</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] font-mono text-zinc-400">
                <div>
                  Subject: <strong className="text-zinc-200">{profile.subjectCode || 'Not set'}</strong>
                </div>
                <div>
                  Timeline: <strong className="text-zinc-200">{profile.daysRemaining} Days</strong>
                </div>
                <div>
                  Daily Limit: <strong className="text-zinc-200">{profile.dailyHoursCap} hrs/day</strong>
                </div>
                <div>
                  Buffer Days: <strong className="text-zinc-200">{profile.bufferDays} days</strong>
                </div>
                <div>
                  Starting Mastery:{' '}
                  <strong className="text-emerald-400">
                    {profile.startingLevel === 'zero'
                      ? '0% (Fresh)'
                      : profile.startingLevel === 'basics'
                      ? '25%'
                      : 'Custom'}
                  </strong>
                </div>
                <div>
                  Goal: <strong className="text-zinc-200">{profile.targetScore}/{profile.maxExamMarks}</strong>
                </div>
              </div>
            </div>

            {/* Extraction Progress Box */}
            {isExtracting && (
              <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/30 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 font-medium text-indigo-300">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Building Your Personalized Study Plan...
                  </span>
                  <span className="font-mono text-indigo-200">{extractionProgress}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 transition-all duration-300 rounded-full"
                    style={{ width: `${extractionProgress}%` }}
                  />
                </div>
                <p className="text-[11px] text-zinc-400 font-mono">
                  {extractionStageText}
                </p>
              </div>
            )}

            {/* Submit & Build Study Plan Button */}
            <div className="pt-1 flex justify-end">
              <button
                type="button"
                disabled={isExtracting}
                onClick={handleStartExtraction}
                className="w-full px-6 py-3 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 cursor-pointer"
              >
                {isExtracting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Generating Syllabus &amp; Schedule...
                  </>
                ) : (
                  <>
                    <span>Save Preferences &amp; Generate Study Plan</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
