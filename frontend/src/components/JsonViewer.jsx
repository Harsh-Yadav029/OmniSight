import React, { useState } from 'react';

export const JsonViewer = ({ data, title = 'Output' }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const jsonString = JSON.stringify(data, null, 2);

  // Syntax-colored JSON rendering for light mode
  const colorize = (str) => {
    return str
      .replace(/"([^"]+)":/g, '<span class="text-primary font-semibold">"$1"</span>:')
      .replace(/: "(.*?)"/g, ': <span class="text-secondary font-medium">"$1"</span>')
      .replace(/: (true|false)/g, ': <span class="text-tertiary font-bold">$1</span>')
      .replace(/: (\d+)/g, ': <span class="text-secondary font-mono">$1</span>')
      .replace(/: (null)/g, ': <span class="text-error font-mono">$1</span>');
  };

  return (
    <div className="card-ambient overflow-hidden bg-white">
      {/* Header */}
      <div className="p-4 border-b border-[#E8E6E1] flex items-center justify-between bg-surface-container-low">
        <h3 className="font-mono text-code-mono font-bold text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-primary">terminal</span>
          <span>{title}</span>
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-white text-body-sm font-medium transition border border-transparent hover:border-[#E8E6E1]"
          >
            <span className="material-symbols-outlined text-[16px]">{copied ? 'check' : 'content_copy'}</span>
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-on-surface-variant hover:text-on-surface p-1 rounded transition"
          >
            <span className="material-symbols-outlined text-[20px]">{collapsed ? 'expand_more' : 'expand_less'}</span>
          </button>
        </div>
      </div>

      {/* Body */}
      {!collapsed && (
        <div className="p-4 bg-[#FAFAF8] overflow-x-auto max-h-[400px] overflow-y-auto border-t border-[#E8E6E1]">
          <pre
            className="font-mono text-code-mono leading-relaxed whitespace-pre-wrap break-words text-on-surface"
            dangerouslySetInnerHTML={{ __html: colorize(jsonString) }}
          />
        </div>
      )}
    </div>
  );
};
