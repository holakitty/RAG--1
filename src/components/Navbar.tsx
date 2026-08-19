import React from 'react';
import { Zap, Cpu, Code2, Play, BookOpen, BarChart3, Download, Sparkles, Key, MessageSquare, CreditCard, ExternalLink, Lock, CheckCircle2 } from 'lucide-react';

interface NavbarProps {
  activeTab: 'notebook' | 'playground' | 'diff' | 'benchmark' | 'architecture' | 'chat' | 'pricing';
  setActiveTab: (tab: 'notebook' | 'playground' | 'diff' | 'benchmark' | 'architecture' | 'chat' | 'pricing') => void;
  onOpenExport: () => void;
  groqApiKey: string;
  setGroqApiKey: (key: string) => void;
  isUnlocked?: boolean;
  onLockSuite?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenExport,
  groqApiKey,
  setGroqApiKey,
  isUnlocked = false,
  onLockSuite,
}) => {
  const [showKeyInput, setShowKeyInput] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Badges */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 p-0.5 shadow-md shadow-indigo-500/20 cursor-pointer" onClick={() => setActiveTab('pricing')}>
              <div className="h-full w-full bg-white rounded-[10px] flex items-center justify-center">
                <Zap className="h-5 w-5 text-indigo-600 fill-indigo-600/10" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-lg tracking-tight">RAG from Scratch</span>
                <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Cpu className="w-3 h-3 text-indigo-600" /> Groq + Llama 3
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Converted Python code suite & ultra-fast LPU inference (300-800 tok/s)
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/80">
            <button
              id="nav-pricing-tab"
              onClick={() => setActiveTab('pricing')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'pricing'
                  ? 'bg-white text-slate-900 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5 text-indigo-600" />
              <span>Razorpay & Pricing</span>
              {!isUnlocked && (
                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-indigo-600 text-white">Gateway</span>
              )}
            </button>

            <button
              id="nav-playground-tab"
              onClick={() => setActiveTab('playground')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'playground'
                  ? 'bg-white text-slate-900 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              {!isUnlocked ? <Lock className="w-3 h-3 text-amber-500" /> : <Play className="w-3.5 h-3.5 text-indigo-600" />}
              <span>Live RAG (PDFs)</span>
            </button>

            <button
              id="nav-notebook-tab"
              onClick={() => setActiveTab('notebook')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'notebook'
                  ? 'bg-white text-slate-900 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              {!isUnlocked ? <Lock className="w-3 h-3 text-amber-500" /> : <BookOpen className="w-3.5 h-3.5 text-indigo-600" />}
              <span>Python Code</span>
            </button>

            <button
              id="nav-diff-tab"
              onClick={() => setActiveTab('diff')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'diff'
                  ? 'bg-white text-slate-900 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              {!isUnlocked ? <Lock className="w-3 h-3 text-amber-500" /> : <Code2 className="w-3.5 h-3.5 text-indigo-600" />}
              <span>OpenAI vs Groq</span>
            </button>

            <button
              id="nav-benchmark-tab"
              onClick={() => setActiveTab('benchmark')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'benchmark'
                  ? 'bg-white text-slate-900 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              {!isUnlocked ? <Lock className="w-3 h-3 text-amber-500" /> : <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />}
              <span>Speed</span>
            </button>

            <button
              id="nav-chat-tab"
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'chat'
                  ? 'bg-white text-slate-900 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              {!isUnlocked ? <Lock className="w-3 h-3 text-amber-500" /> : <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />}
              <span>Google Chat</span>
            </button>
          </nav>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2">
            {/* Membership Status Badge */}
            {isUnlocked ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-bold shadow-2xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Full Suite Unlocked</span>
                </div>
                {onLockSuite && (
                  <button
                    onClick={onLockSuite}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs transition-colors cursor-pointer"
                    title="Lock RAG Suite"
                  >
                    <Lock className="w-3.5 h-3.5 text-slate-500" />
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={() => setActiveTab('pricing')}
                className="flex items-center gap-1.5 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <Lock className="w-3 h-3" />
                <span>Unlock RAG Suite</span>
              </button>
            )}

            {/* API Keys Configuration popover */}
            <div className="relative">
              <button
                id="api-keys-toggle-btn"
                onClick={() => setShowKeyInput(!showKeyInput)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  groqApiKey
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
                title="Manage Groq API Key & Razorpay Credentials"
              >
                <Key className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden sm:inline">
                  {groqApiKey ? 'Groq Key Active' : 'API Keys'}
                </span>
              </button>

              {showKeyInput && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl p-4 shadow-xl z-50 space-y-3.5">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-indigo-600" /> API Keys & Credentials
                    </span>
                    <button
                      onClick={() => setShowKeyInput(false)}
                      className="text-[11px] text-slate-400 hover:text-slate-600 font-bold"
                    >
                      &times;
                    </button>
                  </div>

                  {/* Groq Key Input */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-slate-700">Groq API Key (Optional)</label>
                      <a
                        href="https://console.groq.com/keys"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-indigo-600 font-semibold hover:underline"
                      >
                        Get Key &rarr;
                      </a>
                    </div>
                    <input
                      type="password"
                      id="groq-key-input"
                      value={groqApiKey}
                      onChange={(e) => setGroqApiKey(e.target.value)}
                      placeholder="gsk_..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white font-mono"
                    />
                    <p className="text-[10px] text-slate-500">
                      Runs live 800+ tok/s inferences directly against Groq LPUs.
                    </p>
                  </div>

                  {/* Razorpay Quick Link / Jump */}
                  <div className="pt-2 border-t border-slate-100 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-slate-700">Razorpay Key ID & Secret</label>
                      <button
                        onClick={() => {
                          setShowKeyInput(false);
                          setActiveTab('pricing');
                        }}
                        className="text-[10px] text-indigo-600 font-bold hover:underline"
                      >
                        Open Keys Space &rarr;
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-500">
                      Configure your Razorpay Key ID, Secret, and Merchant VPA in the Razorpay & Pricing tab.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Export Code / Notebook */}
            <button
              id="export-code-btn"
              onClick={onOpenExport}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Code</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-200 gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('pricing')}
            className={`px-2.5 py-1 text-xs rounded-md whitespace-nowrap ${
              activeTab === 'pricing' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-600'
            }`}
          >
            Razorpay & Pricing
          </button>
          <button
            onClick={() => setActiveTab('notebook')}
            className={`px-2.5 py-1 text-xs rounded-md whitespace-nowrap ${
              activeTab === 'notebook' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-600'
            }`}
          >
            Code & Guide
          </button>
          <button
            onClick={() => setActiveTab('playground')}
            className={`px-2.5 py-1 text-xs rounded-md whitespace-nowrap ${
              activeTab === 'playground' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-600'
            }`}
          >
            Live RAG
          </button>
          <button
            onClick={() => setActiveTab('diff')}
            className={`px-2.5 py-1 text-xs rounded-md whitespace-nowrap ${
              activeTab === 'diff' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-600'
            }`}
          >
            OpenAI vs Groq
          </button>
          <button
            onClick={() => setActiveTab('benchmark')}
            className={`px-2.5 py-1 text-xs rounded-md whitespace-nowrap ${
              activeTab === 'benchmark' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-600'
            }`}
          >
            Benchmarks
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-2.5 py-1 text-xs rounded-md whitespace-nowrap ${
              activeTab === 'chat' ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'text-slate-600'
            }`}
          >
            Google Chat
          </button>
        </div>

      </div>
    </header>
  );
};
