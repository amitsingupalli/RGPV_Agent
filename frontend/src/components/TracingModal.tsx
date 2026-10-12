import React, { useState } from 'react';
import { 
  X, 
  Terminal, 
  CheckCircle2
} from 'lucide-react';
import { LangGraphTraceNode } from '../types';

interface TracingModalProps {
  isOpen: boolean;
  onClose: () => void;
  traceNodes: LangGraphTraceNode[];
}

export const TracingModal: React.FC<TracingModalProps> = ({
  isOpen,
  onClose,
  traceNodes,
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>(traceNodes[0]?.id || 'node-1');

  if (!isOpen) return null;

  const totalLatency = traceNodes.reduce((acc, n) => acc + n.latencyMs, 0);
  const totalTokens = traceNodes.reduce((acc, n) => acc + n.inputTokens + n.outputTokens, 0);
  const selectedNode = traceNodes.find((n) => n.id === selectedNodeId) || traceNodes[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div 
        className="w-full max-w-4xl max-h-[85vh] bg-[#18181b] border border-[#27272a] rounded-xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#27272a] bg-[#121214]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-100">
                Pipeline Processing Logs
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Step-by-step execution timings for PDF parsing, question mapping, and schedule generation.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {traceNodes.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <p className="text-sm font-semibold text-zinc-200">
              No Pipeline Runs Yet (Starting from 0)
            </p>
            <p className="text-xs text-zinc-400">
              Complete Step 1 (Course Setup &amp; Document Upload) to run the extraction and scheduling pipeline.
            </p>
          </div>
        ) : (
          <>
            {/* Summary Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 px-6 py-3 bg-[#0e0e11] border-b border-[#27272a] text-xs font-mono">
              <div>
                <span className="text-zinc-500 block text-[11px]">Total Processing Time:</span>
                <span className="text-zinc-200 font-semibold">{totalLatency} ms</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[11px]">Total Tokens Processed:</span>
                <span className="text-indigo-400 font-semibold">{totalTokens.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[11px]">Steps Completed:</span>
                <span className="text-emerald-400 font-semibold">{traceNodes.length} Steps</span>
              </div>
            </div>

            {/* Main Body */}
            <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden">
              <div className="md:col-span-5 border-r border-[#27272a] p-4 space-y-2 overflow-y-auto max-h-[55vh]">
                <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 block px-1 mb-2">
                  Pipeline Steps
                </span>

                {traceNodes.map((node, idx) => {
                  const isSelected = selectedNode?.id === node.id;
                  return (
                    <div
                      key={node.id}
                      onClick={() => setSelectedNodeId(node.id)}
                      className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-zinc-800/90 border-indigo-500 text-white shadow-sm'
                          : 'bg-[#121214] border-[#27272a] text-zinc-300 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5 font-mono">
                          <span className="text-[11px] text-zinc-500">0{idx + 1}.</span>
                          <span className="font-semibold text-zinc-100">{node.nodeName}</span>
                        </div>
                        <span className="font-mono text-[11px] text-zinc-400">
                          {node.latencyMs}ms
                        </span>
                      </div>

                      <p className="text-[11px] text-zinc-400 line-clamp-1">
                        {node.description}
                      </p>

                      <div className="mt-2 flex items-center justify-end text-[10px] font-mono">
                        <span className="text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Done
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {selectedNode && (
                <div className="md:col-span-7 p-6 space-y-4 overflow-y-auto max-h-[55vh]">
                  <div className="space-y-1">
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                      Step ID: {selectedNode.id}
                    </span>
                    <h4 className="text-base font-bold text-zinc-100 pt-1">
                      {selectedNode.nodeName}
                    </h4>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      {selectedNode.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-xs font-mono">
                    <div className="p-3 rounded-lg bg-[#121214] border border-[#27272a]">
                      <span className="text-zinc-500 text-[10px] block">Duration</span>
                      <span className="text-zinc-100 font-bold text-sm">{selectedNode.latencyMs} ms</span>
                    </div>
                    <div className="p-3 rounded-lg bg-[#121214] border border-[#27272a]">
                      <span className="text-zinc-500 text-[10px] block">Input Tokens</span>
                      <span className="text-zinc-100 font-bold text-sm">{selectedNode.inputTokens}</span>
                    </div>
                    <div className="p-3 rounded-lg bg-[#121214] border border-[#27272a]">
                      <span className="text-zinc-500 text-[10px] block">Output Tokens</span>
                      <span className="text-zinc-100 font-bold text-sm">{selectedNode.outputTokens}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-zinc-300 font-mono block">
                      Step Metadata:
                    </span>
                    <div className="p-4 rounded-lg bg-[#0e0e11] border border-[#27272a] font-mono text-xs text-zinc-300 overflow-x-auto">
                      <pre>{JSON.stringify(selectedNode.details, null, 2)}</pre>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#27272a] bg-[#121214] flex items-center justify-end text-xs">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
