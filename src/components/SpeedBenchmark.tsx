import React from 'react';
import { Gauge, Zap, Clock, DollarSign, Flame, Cpu, CheckCircle2, TrendingUp } from 'lucide-react';

export const SpeedBenchmark: React.FC = () => {
  const benchmarks = [
    {
      provider: 'Groq LPUs (ChatGroq)',
      model: 'Meta Llama 3.1 8B',
      tokensPerSec: 850,
      ttftMs: 120,
      relativeSpeed: '100%',
      highlight: true,
      color: 'text-indigo-600',
      barColor: 'bg-indigo-600',
    },
    {
      provider: 'Groq LPUs (ChatGroq)',
      model: 'Meta Llama 3.3 70B',
      tokensPerSec: 330,
      ttftMs: 180,
      relativeSpeed: '42%',
      highlight: true,
      color: 'text-indigo-600',
      barColor: 'bg-indigo-500',
    },
    {
      provider: 'OpenAI Cloud (GPU)',
      model: 'GPT-3.5 Turbo',
      tokensPerSec: 35,
      ttftMs: 950,
      relativeSpeed: '4.5%',
      highlight: false,
      color: 'text-slate-500',
      barColor: 'bg-slate-300',
    },
    {
      provider: 'OpenAI Cloud (GPU)',
      model: 'GPT-4o',
      tokensPerSec: 55,
      ttftMs: 1100,
      relativeSpeed: '7%',
      highlight: false,
      color: 'text-slate-500',
      barColor: 'bg-slate-300',
    },
    {
      provider: 'Standard GPU Cloud',
      model: 'Llama 3 70B (vLLM)',
      tokensPerSec: 40,
      ttftMs: 850,
      relativeSpeed: '5%',
      highlight: false,
      color: 'text-slate-500',
      barColor: 'bg-slate-300',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Benchmark Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
            <Gauge className="w-4 h-4" />
          </span>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Inference Speed & Latency Comparison
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
          Why Groq's Tensor Streaming Processor (TSP) architecture changes RAG application dynamics: deterministic SRAM execution delivers up to <strong className="text-indigo-600">20x faster token generation</strong> than traditional GPU clusters.
        </p>
      </div>

      {/* Visual Bar Chart */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            Tokens Generated Per Second (Throughput)
          </h3>
          <span className="text-xs text-slate-400 font-mono">Higher is better</span>
        </div>

        <div className="space-y-4">
          {benchmarks.map((item, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className={`font-semibold ${item.highlight ? 'text-slate-900' : 'text-slate-600'}`}>
                    {item.model}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">({item.provider})</span>
                </div>
                <div className="flex items-center gap-3 font-mono">
                  <span className="text-[11px] text-slate-500">TTFT: {item.ttftMs}ms</span>
                  <span className={`font-bold ${item.color}`}>{item.tokensPerSec} tok/s</span>
                </div>
              </div>

              {/* Bar track */}
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${item.barColor}`}
                  style={{ width: `${Math.min(100, (item.tokensPerSec / 850) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Architectural Explanations for Groq Advantage */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-2 shadow-sm">
          <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold">
            <Clock className="w-4 h-4" /> Sub-Second TTFT
          </div>
          <h4 className="text-sm font-bold text-slate-900">Time To First Token</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            In multi-step RAG chains (query rewrite, retrieval, reranking, synthesis), latency compounds. 120ms TTFT keeps chains instantaneous.
          </p>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-2 shadow-sm">
          <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold">
            <Zap className="w-4 h-4" /> 80TB/s SRAM Bandwidth
          </div>
          <h4 className="text-sm font-bold text-slate-900">Zero HBM Bottlenecks</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Traditional GPUs stall while fetching weights from HBM. Groq keeps the entire model execution in ultra-fast on-chip SRAM.
          </p>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-2 shadow-sm">
          <div className="flex items-center gap-2 text-amber-600 text-xs font-bold">
            <DollarSign className="w-4 h-4" /> Low Cost & Open Weights
          </div>
          <h4 className="text-sm font-bold text-slate-900">Meta Llama 3 Ecosystem</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Open-weight weights combined with Groq's high compute efficiency translates into massive cost savings over proprietary APIs.
          </p>
        </div>
      </div>
    </div>
  );
};
