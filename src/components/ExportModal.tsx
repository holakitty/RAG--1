import React, { useState } from 'react';
import { RAG_PARTS } from '../data/ragCodeSnippets';
import { generateJupyterNotebook } from '../utils/ragEngine';
import { X, Download, FileCode, BookOpen, Terminal, Check, Copy, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const [activeFormat, setActiveFormat] = useState<'python' | 'notebook' | 'requirements'>('python');
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const fullScript = RAG_PARTS.find(p => p.id === 'full-production-script')?.groqCode || '';
  const requirementsTxt = `langchain>=0.2.0
langchain-groq>=0.1.9
langchain-huggingface>=0.0.3
sentence-transformers>=3.0.0
chromadb>=0.5.0
langchain-community>=0.2.0
beautifulsoup4>=4.12.0
tiktoken>=0.7.0`;

  const getExportContent = () => {
    switch (activeFormat) {
      case 'python':
        return fullScript;
      case 'notebook':
        return generateJupyterNotebook(fullScript, 'RAG From Scratch with Groq & Llama 3');
      case 'requirements':
        return requirementsTxt;
    }
  };

  const handleDownload = () => {
    const content = getExportContent();
    let filename = 'rag_groq_llama3.py';
    let mimeType = 'text/x-python';

    if (activeFormat === 'notebook') {
      filename = 'rag_groq_llama3.ipynb';
      mimeType = 'application/json';
    } else if (activeFormat === 'requirements') {
      filename = 'requirements.txt';
      mimeType = 'text/plain';
    }

    const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    confetti({
      particleCount: 30,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#f97316', '#34d399', '#38bdf8']
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getExportContent());
    setCopied(true);
    confetti({
      particleCount: 20,
      spread: 40,
      origin: { y: 0.7 }
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Download className="w-4 h-4" />
            </span>
            <h3 className="font-bold text-slate-900 text-base">Export Converted RAG Code</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Format Tabs */}
          <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setActiveFormat('python')}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg font-medium transition-all ${
                activeFormat === 'python'
                  ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              Python Script (.py)
            </button>
            <button
              onClick={() => setActiveFormat('notebook')}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg font-medium transition-all ${
                activeFormat === 'notebook'
                  ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Jupyter (.ipynb)
            </button>
            <button
              onClick={() => setActiveFormat('requirements')}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg font-medium transition-all ${
                activeFormat === 'requirements'
                  ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              requirements.txt
            </button>
          </div>

          {/* Preview Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 max-h-72 overflow-y-auto font-mono-code text-xs text-slate-800">
            <pre className="whitespace-pre overflow-x-auto leading-relaxed">
              {getExportContent()}
            </pre>
          </div>

          {/* Quick instructions */}
          <p className="text-xs text-slate-500 leading-relaxed">
            {activeFormat === 'python' && 'Includes ready-to-execute CLI arguments, streaming output loop, and automatic GROQ_API_KEY checking.'}
            {activeFormat === 'notebook' && 'Standard format compatible with Google Colab, VS Code, and JupyterLab.'}
            {activeFormat === 'requirements' && 'Pip dependency file with tested compatible versions of LangChain, Groq, Chroma, and HuggingFace.'}
          </p>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-all shadow-xs"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Copied to Clipboard</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copy Code</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download {activeFormat === 'python' ? '.py File' : activeFormat === 'notebook' ? '.ipynb File' : 'requirements.txt'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
