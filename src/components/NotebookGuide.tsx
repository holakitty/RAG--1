import React, { useState } from 'react';
import { RAG_PARTS, GROQ_MODELS } from '../data/ragCodeSnippets';
import { CodeViewer } from './CodeViewer';
import {
  BookOpen,
  Terminal,
  Zap,
  Cpu,
  Layers,
  Key,
  Flame,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  ArrowRight,
  Code2,
  ShieldCheck
} from 'lucide-react';

export const NotebookGuide: React.FC = () => {
  const [activePartId, setActivePartId] = useState<string>('part-1-quickstart');

  const activePart = RAG_PARTS.find((p) => p.id === activePartId) || RAG_PARTS[0];

  const installCommand = `pip install langchain_community langchain-groq langchain-huggingface sentence-transformers chromadb langchain pypdf pymupdf`;
  
  const envCommand = `# Linux / macOS:
export GROQ_API_KEY="gsk_your_groq_api_key_here"

# Windows (Command Prompt):
set GROQ_API_KEY="gsk_your_groq_api_key_here"

# Windows (PowerShell):
$env:GROQ_API_KEY="gsk_your_groq_api_key_here"`;

  return (
    <div className="space-y-8">
      {/* Hero Overview */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-indigo-600" /> Groq ChatGroq &bull; Meta Llama 3
          </span>
          <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-emerald-600" /> Up to 800+ Tokens/Sec
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          RAG from Scratch: Converted for Groq & Llama 3
        </h1>

        <p className="text-sm sm:text-base text-slate-600 max-w-4xl leading-relaxed">
          This comprehensive suite converts the traditional OpenAI-based LangChain RAG pipeline into an ultra-low latency, production-grade RAG system using <strong className="text-indigo-600 font-semibold">ChatGroq</strong> and <strong className="text-slate-900 font-semibold">Meta Llama 3 (70B / 8B)</strong>. Experience sub-second Time To First Token (TTFT) and real-time streaming answers.
        </p>

        {/* Quick Features Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-xl flex items-start gap-3">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 shrink-0">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Groq LPU Hardware</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">Deterministic SRAM streaming bypassing GPU memory bottlenecks.</p>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-xl flex items-start gap-3">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Meta Llama 3 Optimized</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">Supports Llama 3.3 70B, Llama 3.1 8B with 128k context windows.</p>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-xl flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600 border border-amber-100 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Zero Cost Embeddings</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">Paired with local HuggingFace embeddings for complete independence.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Step 0: Environment & Dependencies Installation */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-extrabold text-xs flex items-center justify-center shadow-sm">
            0
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Environment Setup & Dependencies
            </h2>
            <p className="text-xs text-slate-500">
              Install the required Python libraries and configure your Groq API key.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-emerald-600" /> 1. Install Packages
              </span>
              <span className="text-[11px] text-slate-400 font-mono">pip / uv / conda</span>
            </div>
            <CodeViewer
              code={installCommand}
              language="bash"
              title="Terminal Command"
              highlightGroq={false}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-indigo-600" /> 2. Set Groq API Key
              </span>
              <a
                href="https://console.groq.com/keys"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-indigo-600 font-semibold hover:underline"
              >
                Get Free Groq Key &rarr;
              </a>
            </div>
            <CodeViewer
              code={envCommand}
              language="bash"
              title="Set Environment Variable"
              highlightGroq={false}
            />
          </div>
        </div>
      </div>

      {/* Interactive Part Navigator */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            Notebook Modules (Converted Python Code)
          </h2>
          <span className="text-xs text-slate-500 hidden sm:inline font-medium">
            Click a module to view code & explanation
          </span>
        </div>

        {/* Tab Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {RAG_PARTS.map((part) => (
            <button
              key={part.id}
              onClick={() => setActivePartId(part.id)}
              className={`p-3 rounded-xl border text-left transition-all relative ${
                activePartId === part.id
                  ? 'bg-indigo-50/60 border-indigo-600 text-slate-900 shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 mb-0.5">
                {part.part}
              </div>
              <div className="text-xs font-semibold text-slate-900 line-clamp-1">
                {part.title.split(':')[1]?.trim() || part.title}
              </div>
              {activePartId === part.id && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-indigo-600 rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Active Part Content */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm">
          
          {/* Header */}
          <div className="space-y-2 border-b border-slate-100 pb-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold text-xs border border-indigo-100">
                {activePart.part}
              </span>
              <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Groq + Llama 3 Ready
              </span>
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
              {activePart.title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {activePart.description}
            </p>
          </div>

          {/* Python Code Display */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-indigo-600" /> Converted Python Code (ChatGroq + Llama 3)
              </span>
              <span className="text-[11px] text-slate-400 font-mono">Python 3.9+ &bull; LangChain 0.2+</span>
            </div>
            <CodeViewer
              code={activePart.groqCode}
              title={activePart.title}
              language="python"
              highlightGroq={true}
            />
          </div>

          {/* Key Changes & Explanations */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              Why This Conversion Works
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {activePart.explanation.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50 border border-slate-200/80 p-3 rounded-xl flex items-start gap-2.5 text-xs text-slate-700"
                >
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Available Groq Llama 3 Models Grid */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-indigo-600" />
            Supported Groq Llama 3 Model Variants for RAG
          </h3>
          <p className="text-xs text-slate-500">
            Choose the ideal model variant based on your context window and inference throughput needs.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {GROQ_MODELS.map((model) => (
            <div
              key={model.id}
              className="bg-slate-50 border border-slate-200 hover:border-indigo-300 p-4 rounded-xl space-y-2.5 transition-all shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-xs">{model.name}</span>
                <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                  {model.speed}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2">
                {model.description}
              </p>
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500">
                <span>Context: <strong className="text-slate-800">{model.contextWindow}</strong></span>
                <span className="text-indigo-600 font-mono font-medium">{model.id}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
