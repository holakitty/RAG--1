import React from 'react';
import {
  FileText,
  Scissors,
  Binary,
  Database,
  Search,
  MessageSquare,
  Cpu,
  Sparkles,
  ArrowRight,
  ArrowDown,
  Flame,
  Zap
} from 'lucide-react';

export const ArchitectureDiagram: React.FC = () => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm">
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold">
          <Zap className="w-3 h-3 text-indigo-600" /> Visual Pipeline
        </div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          RAG from Scratch: Groq & Llama 3 End-to-End Architecture
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          How indexing, semantic retrieval, and Groq LPUs collaborate to deliver instant, factual answers.
        </p>
      </div>

      {/* Pipeline 1: Indexing Phase */}
      <div className="space-y-3 bg-slate-50 p-5 rounded-xl border border-slate-200">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-extrabold text-xs flex items-center justify-center shadow-xs">
            A
          </span>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Phase 1: Ingestion & Vector Indexing
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 relative">
          {/* Step 1: Raw Docs */}
          <div className="bg-white border border-slate-200 p-3.5 rounded-xl space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-indigo-600" /> WebBaseLoader
              </span>
              <span className="text-[10px] text-slate-400 font-mono">HTML/Blog</span>
            </div>
            <p className="text-[11px] text-slate-600">
              Loads raw documents and extracts main article sections with BeautifulSoup.
            </p>
          </div>

          {/* Step 2: Splitter */}
          <div className="bg-white border border-slate-200 p-3.5 rounded-xl space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Scissors className="w-4 h-4 text-amber-600" /> Text Splitter
              </span>
              <span className="text-[10px] text-slate-400 font-mono">1000/200 ovlp</span>
            </div>
            <p className="text-[11px] text-slate-600">
              RecursiveCharacterTextSplitter chunks text into semantically cohesive blocks.
            </p>
          </div>

          {/* Step 3: Embeddings */}
          <div className="bg-white border border-slate-200 p-3.5 rounded-xl space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Binary className="w-4 h-4 text-emerald-600" /> HuggingFace
              </span>
              <span className="text-[10px] text-emerald-700 font-mono bg-emerald-50 px-1 rounded">384-dim</span>
            </div>
            <p className="text-[11px] text-slate-600">
              Converts text chunks to normalized dense vectors using all-MiniLM-L6-v2.
            </p>
          </div>

          {/* Step 4: Vector Store */}
          <div className="bg-white border border-slate-200 p-3.5 rounded-xl space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Database className="w-4 h-4 text-cyan-600" /> Chroma DB
              </span>
              <span className="text-[10px] text-cyan-700 font-mono bg-cyan-50 px-1 rounded">HNSW / Vector</span>
            </div>
            <p className="text-[11px] text-slate-600">
              Stores vectors for sub-millisecond k-nearest-neighbors similarity search.
            </p>
          </div>
        </div>
      </div>

      {/* Pipeline 2: Retrieval & Groq LPU Generation Phase */}
      <div className="space-y-3 bg-slate-50 p-5 rounded-xl border border-slate-200">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center shadow-xs">
            B
          </span>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            Phase 2: Ultra-Fast Retrieval & Groq Llama 3 Inference
            <span className="text-[10px] text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded font-medium">
              Sub-second response
            </span>
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* User Query */}
          <div className="bg-white border border-slate-200 p-3.5 rounded-xl space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Search className="w-4 h-4 text-indigo-600" /> User Query
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Input</span>
            </div>
            <p className="text-[11px] text-slate-600">
              "What is Task Decomposition?" is embedded into the same vector space.
            </p>
          </div>

          {/* Top-K Retrieval */}
          <div className="bg-white border border-slate-200 p-3.5 rounded-xl space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Database className="w-4 h-4 text-cyan-600" /> Top-K Search
              </span>
              <span className="text-[10px] text-emerald-700 font-mono bg-emerald-50 px-1 rounded font-medium">k=3 Chunks</span>
            </div>
            <p className="text-[11px] text-slate-600">
              Chroma retriever returns the highest similarity context chunks.
            </p>
          </div>

          {/* ChatPromptTemplate */}
          <div className="bg-white border border-slate-200 p-3.5 rounded-xl space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-violet-600" /> Prompt Assembly
              </span>
              <span className="text-[10px] text-violet-700 font-mono bg-violet-50 px-1 rounded">LCEL Chain</span>
            </div>
            <p className="text-[11px] text-slate-600">
              Injects retrieved context chunks and user question into structured template.
            </p>
          </div>

          {/* Groq LPU + Llama 3 */}
          <div className="bg-white border border-indigo-200 p-3.5 rounded-xl space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-700 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-indigo-600 animate-pulse" /> ChatGroq
              </span>
              <span className="text-[10px] text-emerald-700 font-mono font-bold bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">800 tok/s</span>
            </div>
            <p className="text-[11px] text-slate-700">
              Groq LPU executes Meta Llama 3 in ~150ms with instant token streaming.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
