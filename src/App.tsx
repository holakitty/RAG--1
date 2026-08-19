import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { NotebookGuide } from './components/NotebookGuide';
import { InteractiveRAGPlayground } from './components/InteractiveRAGPlayground';
import { DiffViewer } from './components/DiffViewer';
import { SpeedBenchmark } from './components/SpeedBenchmark';
import { ArchitectureDiagram } from './components/ArchitectureDiagram';
import { GoogleChatManager } from './components/GoogleChatManager';
import { RazorpayGateway } from './components/RazorpayGateway';
import { ExportModal } from './components/ExportModal';
import { PaywallGate } from './components/PaywallGate';
import {
  BookOpen,
  Play,
  Code2,
  BarChart3,
  ExternalLink,
  MessageSquare,
  CreditCard,
  Lock,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Sparkles
} from 'lucide-react';

export default function App() {
  // Paywall & Subscription State
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    const saved = localStorage.getItem('rag_subscription_unlocked');
    return saved === 'true';
  });

  // Default to pricing landing gate if not unlocked, otherwise playground
  const [activeTab, setActiveTab] = useState<'pricing' | 'notebook' | 'playground' | 'diff' | 'benchmark' | 'architecture' | 'chat'>(() => {
    const saved = localStorage.getItem('rag_subscription_unlocked');
    return saved === 'true' ? 'playground' : 'pricing';
  });

  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [groqApiKey, setGroqApiKey] = useState<string>('');
  const [lastRAGResult, setLastRAGResult] = useState<{
    question: string;
    answer: string;
    model: string;
    ttftMs: number;
    tokensPerSec: number;
  } | undefined>(undefined);

  const handleUnlockSuite = () => {
    setIsUnlocked(true);
    localStorage.setItem('rag_subscription_unlocked', 'true');
    setActiveTab('playground');
  };

  const handleLockSuite = () => {
    setIsUnlocked(false);
    localStorage.setItem('rag_subscription_unlocked', 'false');
    setActiveTab('pricing');
  };

  const handleTabClick = (tab: 'pricing' | 'notebook' | 'playground' | 'diff' | 'benchmark' | 'architecture' | 'chat') => {
    if (!isUnlocked && tab !== 'pricing') {
      setActiveTab('pricing');
      const pricingElem = document.getElementById('pricing-plans-section');
      if (pricingElem) {
        pricingElem.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-500/20 selection:text-indigo-900">
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleTabClick}
        onOpenExport={() => setIsExportOpen(true)}
        groqApiKey={groqApiKey}
        setGroqApiKey={setGroqApiKey}
        isUnlocked={isUnlocked}
        onLockSuite={handleLockSuite}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        
        {/* Navigation Tab Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              id="tab-btn-pricing"
              onClick={() => handleTabClick('pricing')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'pricing'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>1. Razorpay Gateway & Landing</span>
              {!isUnlocked && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-indigo-500 text-white">
                  GATEWAY LOCK
                </span>
              )}
            </button>

            <button
              id="tab-btn-playground"
              onClick={() => handleTabClick('playground')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'playground'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {!isUnlocked ? <Lock className="w-3 h-3 text-amber-500" /> : <Play className="w-3.5 h-3.5" />}
              <span>2. Interactive Live RAG Sandbox</span>
            </button>

            <button
              id="tab-btn-notebook"
              onClick={() => handleTabClick('notebook')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'notebook'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {!isUnlocked ? <Lock className="w-3 h-3 text-amber-500" /> : <BookOpen className="w-3.5 h-3.5" />}
              <span>3. Python Code & Multi-PDF Guide</span>
            </button>

            <button
              id="tab-btn-diff"
              onClick={() => handleTabClick('diff')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'diff'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {!isUnlocked ? <Lock className="w-3 h-3 text-amber-500" /> : <Code2 className="w-3.5 h-3.5" />}
              <span>4. OpenAI vs Groq Diff</span>
            </button>

            <button
              id="tab-btn-benchmark"
              onClick={() => handleTabClick('benchmark')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'benchmark'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {!isUnlocked ? <Lock className="w-3 h-3 text-amber-500" /> : <BarChart3 className="w-3.5 h-3.5" />}
              <span>5. Speed & Benchmarks</span>
            </button>

            <button
              id="tab-btn-chat"
              onClick={() => handleTabClick('chat')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'chat'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {!isUnlocked ? <Lock className="w-3 h-3 text-amber-500" /> : <MessageSquare className="w-3.5 h-3.5" />}
              <span>6. Google Chat Collaboration</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {isUnlocked ? (
              <button
                onClick={handleLockSuite}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                title="Lock RAG Suite for testing or security"
              >
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                <span>Lock Suite</span>
              </button>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold rounded-xl">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                <span>Razorpay Lock Active</span>
              </div>
            )}
          </div>
        </div>

        {/* Tab 1: Razorpay Landing & Pricing Gateway */}
        {(!isUnlocked || activeTab === 'pricing') && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <RazorpayGateway
              isUnlocked={isUnlocked}
              onUnlockSuite={handleUnlockSuite}
              onNavigateToTab={(tab) => {
                handleUnlockSuite();
                setActiveTab(tab);
              }}
            />
          </div>
        )}

        {/* Tab 2: Interactive Live RAG Sandbox */}
        {isUnlocked && activeTab === 'playground' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <InteractiveRAGPlayground
              groqApiKey={groqApiKey}
              onRAGGenerated={(res) => setLastRAGResult(res)}
              onNavigateToChat={() => setActiveTab('chat')}
            />
          </div>
        )}

        {/* Tab 3: Python Code Guide & Modules */}
        {isUnlocked && activeTab === 'notebook' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <NotebookGuide />
            <ArchitectureDiagram />
          </div>
        )}

        {/* Tab 4: Diff Matrix (OpenAI vs Groq) */}
        {isUnlocked && activeTab === 'diff' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <DiffViewer />
          </div>
        )}

        {/* Tab 5: Speed & Benchmarks */}
        {isUnlocked && activeTab === 'benchmark' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <SpeedBenchmark />
            <ArchitectureDiagram />
          </div>
        )}

        {/* Tab 6: Google Chat Collaboration */}
        {isUnlocked && activeTab === 'chat' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <GoogleChatManager lastRAGResult={lastRAGResult} />
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500 space-y-3 mt-auto">
        <div className="flex flex-wrap items-center justify-center gap-4 text-slate-600">
          <a
            href="https://console.groq.com/docs/models"
            target="_blank"
            rel="noreferrer"
            className="hover:text-indigo-600 transition-colors flex items-center gap-1 font-medium"
          >
            Groq Models Documentation <ExternalLink className="w-3 h-3" />
          </a>
          <span>&bull;</span>
          <a
            href="https://python.langchain.com/docs/integrations/chat/groq/"
            target="_blank"
            rel="noreferrer"
            className="hover:text-indigo-600 transition-colors flex items-center gap-1 font-medium"
          >
            LangChain Groq Integration <ExternalLink className="w-3 h-3" />
          </a>
          <span>&bull;</span>
          <a
            href="https://razorpay.com"
            target="_blank"
            rel="noreferrer"
            className="hover:text-indigo-600 transition-colors flex items-center gap-1 font-medium"
          >
            Razorpay Payment Infrastructure <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <p className="text-slate-500">
          RAG from Scratch: High-Speed Inference Architecture powered by Groq LPUs, ChatGroq, Meta Llama 3, and Razorpay.
        </p>
      </footer>

      {/* Export Modal */}
      <ExportModal isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} />
    </div>
  );
}
