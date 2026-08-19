import React, { useState } from 'react';
import { RAG_PARTS } from '../data/ragCodeSnippets';
import { CodeViewer } from './CodeViewer';
import { ArrowRight, CheckCircle2, Zap, Cpu, Sparkles, Flame, ShieldAlert, Layers } from 'lucide-react';

export const DiffViewer: React.FC = () => {
  const [selectedPartId, setSelectedPartId] = useState<string>('part-1-quickstart');
  const [viewMode, setViewMode] = useState<'side-by-side' | 'groq-only'>('side-by-side');

  const currentPart = RAG_PARTS.find(p => p.id === selectedPartId) || RAG_PARTS[0];

  return (
    <div className="space-y-6">
      {/* Top Banner explaining the Migration */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 relative overflow-hidden shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold">
              <Zap className="w-3.5 h-3.5 text-indigo-600" /> High-Performance Migration Matrix
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              OpenAI vs Groq + Llama 3 Code Conversion
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Converting your RAG architecture from OpenAI (<code className="text-indigo-600 font-mono text-xs bg-indigo-50 px-1 py-0.5 rounded">ChatOpenAI</code>) to Groq (<code className="text-indigo-600 font-mono text-xs bg-indigo-50 px-1 py-0.5 rounded">ChatGroq</code>) with <span className="font-semibold text-slate-900">Meta Llama 3</span> slashes inference latency from ~3-5 seconds down to <span className="text-emerald-700 font-semibold">150-300ms</span> on Groq LPUs with up to <span className="text-emerald-700 font-semibold">800+ tokens/sec</span>.
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="grid grid-cols-2 gap-3 shrink-0 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
            <div className="space-y-0.5">
              <span className="text-slate-500 text-[11px]">Legacy (OpenAI)</span>
              <p className="font-mono font-bold text-rose-600">~25-40 tok/s</p>
              <span className="text-[10px] text-slate-400">TTFT: ~1.2s</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-slate-500 text-[11px]">Groq + Llama 3</span>
              <p className="font-mono font-bold text-emerald-700 flex items-center gap-1">
                <Flame className="w-3 h-3 text-indigo-600" /> 300-850 tok/s
              </p>
              <span className="text-[10px] text-emerald-700 font-medium">TTFT: ~0.15s (10x faster)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Part Selector Pills */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-wrap gap-1.5">
          {RAG_PARTS.map((part) => (
            <button
              key={part.id}
              onClick={() => setSelectedPartId(part.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedPartId === part.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {part.part}: {part.title.split(':')[1] || part.title}
            </button>
          ))}
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
          <button
            onClick={() => setViewMode('side-by-side')}
            className={`px-2.5 py-1 rounded font-medium transition-all ${
              viewMode === 'side-by-side'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Side-by-Side Comparison
          </button>
          <button
            onClick={() => setViewMode('groq-only')}
            className={`px-2.5 py-1 rounded font-medium transition-all ${
              viewMode === 'groq-only'
                ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Groq Llama 3 Only
          </button>
        </div>
      </div>

      {/* Code Comparison Section */}
      {viewMode === 'side-by-side' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* OpenAI Original */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">
                  Original (OpenAI / GPT)
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">langchain-openai</span>
            </div>
            <CodeViewer
              code={currentPart.openaiCode}
              title={`Original: ${currentPart.title}`}
              language="python"
              highlightGroq={false}
            />
          </div>

          {/* Groq Llama 3 Converted */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-indigo-600" /> Converted (Groq + Llama 3)
                </span>
              </div>
              <span className="text-[11px] text-indigo-600 font-semibold font-mono">langchain-groq &bull; 800 tok/s</span>
            </div>
            <CodeViewer
              code={currentPart.groqCode}
              title={`Groq Optimized: ${currentPart.title}`}
              language="python"
              highlightGroq={true}
            />
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <CodeViewer
            code={currentPart.groqCode}
            title={currentPart.title}
            language="python"
            highlightGroq={true}
          />
        </div>
      )}

      {/* Key Architectural Highlights for this Part */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {currentPart.keyChanges.map((change, idx) => (
          <div
            key={idx}
            className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-4 space-y-3 transition-colors shadow-sm"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center justify-center font-bold text-xs">
                {idx + 1}
              </div>
              <h4 className="text-xs font-semibold text-slate-800">Architectural Conversion</h4>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="p-2 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 line-through">
                {change.from}
              </div>
              <div className="flex justify-center text-indigo-600">
                <ArrowRight className="w-4 h-4" />
              </div>
              <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 font-semibold">
                {change.to}
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed pt-1">
              <span className="text-slate-800 font-medium">Why: </span>
              {change.reason}
            </p>
          </div>
        ))}
      </div>

      {/* Bulleted Explanation */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Key Conversion Details for {currentPart.part}
        </h3>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-700">
          {currentPart.explanation.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
