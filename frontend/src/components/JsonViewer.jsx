import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Copy, Check, Terminal } from 'lucide-react';

export const JsonViewer = ({ data, title = 'VLM Raw Inspection Output (JSON)' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const jsonString = JSON.stringify(data, null, 2);

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between bg-slate-900/90 hover:bg-slate-800/80 cursor-pointer transition text-left select-none"
      >
        <div className="flex items-center gap-2.5">
          <Terminal className="w-4 h-4 text-indigo-400" />
          <span className="text-sm font-bold text-slate-200">{title}</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleCopy}
            className="p-1.5 text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition flex items-center gap-1"
            title="Copy JSON"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="text-[11px]">{copied ? 'Copied!' : 'Copy'}</span>
          </button>

          {isOpen ? (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-slate-400" />
          )}
        </div>
      </div>

      {isOpen && (
        <div className="p-4 bg-slate-950 border-t border-slate-800/80">
          <pre className="p-4 bg-slate-900/80 rounded-xl text-xs font-mono text-emerald-400 border border-slate-800 overflow-x-auto max-h-96">
            {jsonString}
          </pre>
        </div>
      )}
    </div>
  );
};
