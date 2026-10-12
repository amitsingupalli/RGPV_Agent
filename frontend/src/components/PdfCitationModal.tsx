import React from 'react';
import { X, FileText } from 'lucide-react';

interface CitationData {
  id: string;
  docName: string;
  page: number;
  excerpt: string;
  context: string;
}

interface PdfCitationModalProps {
  citation: CitationData | null;
  onClose: () => void;
}

export const PdfCitationModal: React.FC<PdfCitationModalProps> = ({ citation, onClose }) => {
  if (!citation) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div 
        className="w-full max-w-xl bg-[#18181b] border border-[#27272a] rounded-xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#27272a] bg-[#121214]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-zinc-100">{citation.docName}</h3>
                <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono">
                  Page {citation.page}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">{citation.context}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          <div className="rounded-lg bg-[#0e0e11] border border-zinc-800 p-5 text-sm leading-relaxed text-zinc-200">
            <span className="text-[11px] font-mono text-zinc-500 block mb-2">
              Document Excerpt (Page {citation.page}):
            </span>
            <div className="p-3.5 rounded-md bg-indigo-950/30 border-l-4 border-indigo-500 text-zinc-100">
              <p className="text-sm leading-relaxed">
                &ldquo;{citation.excerpt}&rdquo;
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-[#27272a] bg-[#121214] flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
