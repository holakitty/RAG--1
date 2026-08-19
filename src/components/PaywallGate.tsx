import React from 'react';
import { ShieldCheck, Lock, Sparkles, Zap, ArrowRight, CheckCircle2, CreditCard } from 'lucide-react';

interface PaywallGateProps {
  tabName: string;
  onGoToPricing: () => void;
}

export const PaywallGate: React.FC<PaywallGateProps> = ({ tabName, onGoToPricing }) => {
  return (
    <div className="max-w-3xl mx-auto my-8 bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 shadow-sm text-center space-y-6 relative overflow-hidden animate-in fade-in">
      <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-50/60 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* Lock Icon */}
      <div className="w-16 h-16 bg-indigo-50 border border-indigo-200 rounded-2xl mx-auto flex items-center justify-center shadow-xs">
        <Lock className="w-8 h-8 text-indigo-600 animate-pulse" />
      </div>

      <div className="space-y-2 max-w-xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Active Subscription or Token Pack Required</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {tabName} is Locked
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          Complete your subscription through our official Razorpay gateway to unlock the full interactive RAG sandbox, Python codebase, benchmarks, and real-time Google Chat workspace.
        </p>
      </div>

      {/* Feature check list */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-6 max-w-lg mx-auto text-left space-y-2.5 text-xs text-slate-700 font-medium">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Complete 7-Step Jupyter Notebook Python Code Suite</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Live Interactive Groq LPU Inference Sandbox (Llama 3 @ 800+ tok/s)</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Automated Google Chat Card & Interactive Webhook Engine</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Full Token Balance & PDF Export Documentation</span>
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <button
          id="paywall-go-to-pricing-btn"
          onClick={onGoToPricing}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm shadow-sm transition-all cursor-pointer"
        >
          <CreditCard className="w-4 h-4" />
          <span>Go to Razorpay & Pricing Gateway</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="pt-2 flex items-center justify-center gap-2 text-xs text-slate-400">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
        <span>Secure 256-Bit SSL Encrypted Razorpay Gateway</span>
      </div>
    </div>
  );
};
