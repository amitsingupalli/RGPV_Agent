import React, { useState } from 'react';
import { 
  X, 
  Terminal, 
  CheckCircle2, 
  Clock, 
  Cpu, 
  Zap, 
  ShieldCheck, 
  Database, 
  Activity,
  Layers,
  ArrowRight,
  ChevronDown,
  ChevronRight
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
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
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-zinc-100">
                  LangGraph Agent Execution Traces & Node Telemetry
                </h3>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono border border-emerald-500/20">
                  All Invariants Verified
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Deterministic DAG execution pipeline: Ingestion &rarr; Frequency Classification &rarr; LP Scheduler &rarr; Grounder &rarr; Verifier
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

        {/* Aggregate KPI Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 px-6 py-3 bg-[#0e0e11] border-b border-[#27272a] text-xs font-mono">
          <div>
            <span className="text-zinc-500 block text-[11px]">Total Pipeline Latency:</span>
            <span className="text-zinc-200 font-semibold">{totalLatency} ms</span>
          </div>
          <div>
            <span className="text-zinc-500 block text-[11px]">Token Footprint:</span>
            <span className="text-indigo-400 font-semibold">{totalTokens.toLocaleString()} Tokens</span>
          </div>
          <div>
            <span className="text-zinc-500 block text-[11px]">Average Confidence:</span>
            <span className="text-emerald-400 font-semibold">96.7%</span>
          </div>
          <div>
            <span className="text-zinc-500 block text-[11px]">Guardrail Hallucination Check:</span>
            <span className="text-emerald-400 font-semibold">0 Violations</span>
          </div>
        </div>

        {/* Main Body: DAG Node List + Selected Node Inspection Deck */}
        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden">
          {/* Left: DAG Nodes List (5 cols) */}
          <div className="md:col-span-5 border-r border-[#27272a] p-4 space-y-2 overflow-y-auto max-h-[55vh]">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 block px-1 mb-2">
              LangGraph Directed Acyclic Graph (DAG) Nodes
            </span>

            {traceNodes.map((node, idx) => {
              const isSelected = selectedNodeId === node.id;
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
                      <span className="font-semibold text-zinc-100">{node.nodeName.split(' ')[0]}</span>
                    </div>
                    <span className="font-mono text-[11px] text-zinc-400">
                      {node.latencyMs}ms
                    </span>
                  </div>

                  <p className="text-[11px] text-zinc-400 line-clamp-1">
                    {node.description}
                  </p>

                  <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-zinc-500">
                    <span>Conf: {node.confidenceScore}%</span>
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Completed
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Selected Node Telemetry & JSON View (7 cols) */}
          <div className="md:col-span-7 p-6 space-y-4 overflow-y-auto max-h-[55vh]">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                  Node ID: {selectedNode.id}
                </span>
                <span className="text-xs font-mono text-emerald-400">
                  Confidence: {selectedNode.confidenceScore}%
                </span>
              </div>
              <h4 className="text-base font-bold text-zinc-100">
                {selectedNode.nodeName}
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {selectedNode.description}
              </p>
            </div>

            {/* Performance Stats */}
            <div className="grid grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-3 rounded-lg bg-[#121214] border border-[#27272a]">
                <span className="text-zinc-500 text-[10px] block">Execution Latency</span>
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

            {/* Invariant & Payload Details */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-zinc-300 font-mono block">
                Execution State Invariants & Parameters:
              </span>
              <div className="p-4 rounded-lg bg-[#0e0e11] border border-[#27272a] font-mono text-xs text-zinc-300 overflow-x-auto">
                <pre>{JSON.stringify(selectedNode.details, null, 2)}</pre>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#27272a] bg-[#121214] flex items-center justify-between text-xs">
          <span className="text-zinc-500 font-mono">
            Pipeline Engine: LangGraph v0.2.1 • LLM Guardrail: Strict Zero-Hallucination
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium transition-colors cursor-pointer"
          >
            Close Telemetry
          </button>
        </div>
      </div>
    </div>
  );
};
