import React, { useState, useEffect } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';
import { Copy, Check, Download, Terminal, Sparkles, Cpu, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CodeViewerProps {
  code: string;
  language?: string;
  title?: string;
  highlightGroq?: boolean;
  showLineNumbers?: boolean;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({
  code,
  language = 'python',
  title,
  highlightGroq = true,
  showLineNumbers = true,
}) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    Prism.highlightAll();
  }, [code, language]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    confetti({
      particleCount: 25,
      spread: 50,
      origin: { y: 0.8 },
      colors: ['#f97316', '#fbbf24', '#34d399']
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title ? title.toLowerCase().replace(/[^a-z0-9]/g, '_') : 'rag_groq'}.${language === 'bash' ? 'sh' : 'py'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const lines = code.trim().split('\n');

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-200 text-xs">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
            <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
            <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
          </div>
          {title && (
            <span className="font-semibold text-slate-800 ml-2 flex items-center gap-1.5">
              {language === 'bash' ? (
                <Terminal className="w-3.5 h-3.5 text-indigo-600" />
              ) : (
                <Cpu className="w-3.5 h-3.5 text-indigo-600" />
              )}
              {title}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {highlightGroq && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 mr-1">
              <Flame className="w-3 h-3 text-indigo-600" /> ChatGroq &bull; Llama 3
            </span>
          )}

          <button
            onClick={handleDownload}
            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 rounded-md transition-colors"
            title="Download code snippet"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleCopy}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all font-medium text-xs border ${
              copied
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900 shadow-xs'
            }`}
            title="Copy to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Body */}
      <div className="relative overflow-x-auto text-xs sm:text-sm p-4 font-mono-code leading-relaxed max-h-[620px] overflow-y-auto bg-slate-50/50">
        <pre className={`language-${language} m-0 p-0 bg-transparent`}>
          <code className={`language-${language}`}>{code}</code>
        </pre>
      </div>
    </div>
  );
};
