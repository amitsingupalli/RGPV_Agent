import React, { useState } from 'react';
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  Sliders, 
  Calendar, 
  Clock, 
  Award, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  RefreshCw, 
  Layers, 
  Database,
  Trash2,
  FileCheck
} from 'lucide-react';
import { StudentProfile, Language } from '../types';

interface DocumentIngestionHubProps {
  profile: StudentProfile;
  onUpdateProfile: (updates: Partial<StudentProfile>) => void;
  onCompleteIngestion: () => void;
}

interface UploadedFile {
  id: string;
  name: string;
  size: string;
  pages: number;
  category: 'Syllabus' | 'PYQ';
  status: 'ready' | 'processing' | 'verified';
  progress: number;
}

export const DocumentIngestionHub: React.FC<DocumentIngestionHubProps> = ({
  profile,
  onUpdateProfile,
  onCompleteIngestion,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(2); // 1. Setup, 2. Ingestion, 3. Extraction
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [extractionProgress, setExtractionProgress] = useState<number>(0);
  const [extractionStageText, setExtractionStageText] = useState<string>('');

  const [files, setFiles] = useState<UploadedFile[]>([
    {
      id: 'f-1',
      name: 'RGPV_CS403_Official_Syllabus_2024.pdf',
      size: '2.4 MB',
      pages: 6,
      category: 'Syllabus',
      status: 'verified',
      progress: 100,
    },
    {
      id: 'f-2',
      name: 'RGPV_DBMS_Past_Papers_2020_2024_Compiled.pdf',
      size: '14.8 MB',
      pages: 26,
      category: 'PYQ',
      status: 'verified',
      progress: 100,
    },
  ]);

  const handleStartExtraction = () => {
    setIsExtracting(true);
    setCurrentStep(3);
    setExtractionProgress(10);
    setExtractionStageText('PyMuPDF parsing 32 document pages and preserving bbox layout...');

    setTimeout(() => {
      setExtractionProgress(35);
      setExtractionStageText('Extracting 24 past exam questions across 2020–2024...');
    }, 600);

    setTimeout(() => {
      setExtractionProgress(70);
      setExtractionStageText('Mapping questions to 5 curriculum units & computing frequency scores...');
    }, 1300);

    setTimeout(() => {
      setExtractionProgress(95);
      setExtractionStageText('Synthesizing 7-section pedagogical reader & generating priority timetable...');
    }, 2000);

    setTimeout(() => {
      setExtractionProgress(100);
      setIsExtracting(false);
      onCompleteIngestion();
    }, 2600);
  };

  const handleSimulateAddFile = (category: 'Syllabus' | 'PYQ') => {
    const newId = `f-${Date.now()}`;
    const newFile: UploadedFile = {
      id: newId,
      name: category === 'Syllabus' 
        ? 'RGPV_CSE_Syllabus_Revision_Addendum.pdf' 
        : `RGPV_DBMS_MidSem_QuestionBank_2025.pdf`,
      size: '3.1 MB',
      pages: 8,
      category,
      status: 'verified',
      progress: 100,
    };
    setFiles((prev) => [...prev, newFile]);
  };

  const handleRemoveFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Top Header: Step Indicator */}
      <div className="border border-[#27272a] rounded-xl bg-[#121214] p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-zinc-100 tracking-tight">
              Academic Setup & Curriculum Ingestion Hub
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Feed official university documents for automated question frequency extraction and constraint-aware scheduling.
            </p>
          </div>

          {/* Step Progress Pill */}
          <div className="flex items-center gap-2">
            {[
              { num: 1, label: 'Academic Setup' },
              { num: 2, label: 'Document Ingestion' },
              { num: 3, label: 'AI Curriculum Extraction' },
            ].map((step, idx) => {
              const isPassed = currentStep > step.num;
              const isCurrent = currentStep === step.num;
              return (
                <React.Fragment key={step.num}>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-mono font-semibold transition-colors ${
                        isPassed
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : isCurrent
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-zinc-800 text-zinc-500'
                      }`}
                    >
                      {isPassed ? '✓' : step.num}
                    </span>
                    <span
                      className={`text-xs font-medium hidden lg:inline ${
                        isCurrent ? 'text-zinc-200' : 'text-zinc-500'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {idx < 2 && <span className="text-zinc-700 text-xs hidden lg:inline">&rarr;</span>}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Academic Metadata & Constraints Setup (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="border border-[#27272a] rounded-xl bg-[#18181b] p-6 space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-zinc-800">
              <Sliders className="w-4 h-4 text-indigo-400" />
              <h2 className="text-sm font-semibold text-zinc-100">
                1. Academic Degree & Target Configuration
              </h2>
            </div>

            {/* University & Degree Dropdowns */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Academic Program
                </label>
                <select
                  value={profile.program}
                  onChange={(e) => onUpdateProfile({ program: e.target.value })}
                  className="w-full bg-[#121214] border border-[#27272a] rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500 transition-colors"
                >
                  <option value="B.Tech">B.Tech (Bachelor of Technology)</option>
                  <option value="B.E">B.E (Bachelor of Engineering)</option>
                  <option value="M.Tech">M.Tech (Computer Science)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Branch / Specialization
                </label>
                <select
                  value={profile.branch}
                  onChange={(e) => onUpdateProfile({ branch: e.target.value })}
                  className="w-full bg-[#121214] border border-[#27272a] rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500 transition-colors"
                >
                  <option value="Computer Science & Engineering">
                    Computer Science & Engineering (CSE)
                  </option>
                  <option value="Information Technology">Information Technology (IT)</option>
                  <option value="CSE (Artificial Intelligence & ML)">CSE (AI & ML)</option>
                  <option value="CSE (Data Science)">CSE (Data Science)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                    Semester
                  </label>
                  <select
                    value={profile.semester}
                    onChange={(e) => onUpdateProfile({ semester: e.target.value })}
                    className="w-full bg-[#121214] border border-[#27272a] rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500 transition-colors"
                  >
                    <option value="4th Semester (IV)">4th Semester (IV)</option>
                    <option value="5th Semester (V)">5th Semester (V)</option>
                    <option value="6th Semester (VI)">6th Semester (VI)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                    Exam Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={profile.examDate}
                      onChange={(e) => onUpdateProfile({ examDate: e.target.value })}
                      className="w-full bg-[#121214] border border-[#27272a] rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Subject & Course Code
                </label>
                <div className="p-3 rounded-lg bg-[#121214] border border-[#27272a] flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-zinc-200">
                      {profile.subjectName}
                    </span>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      RGPV Bhopal Affiliated Curriculum
                    </p>
                  </div>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {profile.subjectCode}
                  </span>
                </div>
              </div>
            </div>

            {/* Target Score & Daily Hours Constraints Sliders */}
            <div className="pt-4 border-t border-zinc-800 space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-zinc-400 font-medium">Target Exam Score</span>
                  <span className="font-mono text-emerald-400 font-semibold">
                    {profile.targetScore} / 100 Marks
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="98"
                  value={profile.targetScore}
                  onChange={(e) => onUpdateProfile({ targetScore: Number(e.target.value) })}
                  className="w-full accent-indigo-500 bg-zinc-800 h-1.5 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-zinc-500 mt-1 font-mono">
                  <span>Pass (50M)</span>
                  <span>Distinction (75M)</span>
                  <span>Gold Medalist (90M+)</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-zinc-400 font-medium">
                    Strict Daily Study Cap (Constraint)
                  </span>
                  <span className="font-mono text-indigo-400 font-semibold">
                    {profile.dailyHoursCap.toFixed(1)} hrs/day max
                  </span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="5.0"
                  step="0.5"
                  value={profile.dailyHoursCap}
                  onChange={(e) => onUpdateProfile({ dailyHoursCap: Number(e.target.value) })}
                  className="w-full accent-indigo-500 bg-zinc-800 h-1.5 rounded-lg cursor-pointer"
                />
                <p className="text-[11px] text-zinc-500 mt-1">
                  The algorithm strictly clamps scheduled sessions to stay within this daily ceiling.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Primary Explanation Style
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
                    English (Academic)
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
                    Hinglish (Conversational)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Document Dropzones & Extraction Trigger (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="border border-[#27272a] rounded-xl bg-[#18181b] p-6 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-indigo-400" />
                <h2 className="text-sm font-semibold text-zinc-100">
                  2. Document Vault & Verified Upload Dropzones
                </h2>
              </div>
              <span className="text-xs font-mono text-zinc-400">
                {files.length} Documents Loaded
              </span>
            </div>

            {/* Drag & Drop Surface */}
            <div className="border-2 border-dashed border-[#27272a] hover:border-indigo-500/50 rounded-xl p-6 text-center bg-[#121214]/60 transition-colors">
              <div className="max-w-md mx-auto space-y-3">
                <div className="w-10 h-10 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/20">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-zinc-200">
                    Drop Official RGPV Syllabus & PYQ PDF Bundles
                  </p>
                  <p className="text-[11px] text-zinc-500 mt-1">
                    Accepts text-searchable PDFs (2020–2024 university examinations supported).
                  </p>
                </div>

                <div className="flex justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => handleSimulateAddFile('Syllabus')}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 transition-colors border border-zinc-700 cursor-pointer"
                  >
                    + Add Syllabus PDF
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSimulateAddFile('PYQ')}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-xs text-indigo-300 transition-colors border border-indigo-500/30 font-medium cursor-pointer"
                  >
                    + Add Past Year Paper Bundle
                  </button>
                </div>
              </div>
            </div>

            {/* Ingested Documents List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>Ingested Verified Sources</span>
                <span className="flex items-center gap-1 text-[11px] text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Page Boundaries & BBoxes Preserved
                </span>
              </div>

              <div className="space-y-2.5">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="p-3.5 rounded-lg bg-[#121214] border border-[#27272a] flex items-center justify-between text-xs hover:border-zinc-700 transition-colors"
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
                                : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                            }`}
                          >
                            {file.category}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-zinc-500 mt-0.5 font-mono">
                          <span>{file.pages} Pages</span>
                          <span aria-hidden="true">·</span>
                          <span>{file.size}</span>
                          <span aria-hidden="true">·</span>
                          <span className="text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Checksum Verified
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pl-3 shrink-0">
                      <button
                        onClick={() => handleRemoveFile(file.id)}
                        className="p-1 rounded text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 transition-colors cursor-pointer"
                        title="Remove Document"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Extraction Progress Box (if in step 3) */}
            {isExtracting && (
              <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/30 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 font-medium text-indigo-300">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Agent Extraction Pipeline Running
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

            {/* Primary Action Button */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                disabled={isExtracting || files.length === 0}
                onClick={handleStartExtraction}
                className="w-full sm:w-auto px-6 py-3 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 cursor-pointer"
              >
                {isExtracting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Processing Syllabus & Past Papers...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Ingest & Extract Curriculum (24 PYQs)
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
