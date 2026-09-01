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

  // Syntax-colored JSON rendering
  const colorize = (str) => {
    return str
      .replace(/"([^"]+)":/g, '<span class="text-success-light">"$1"</span>:')
      .replace(/: "(.*?)"/g, ': <span class="text-primary-dim">"$1"</span>')
      .replace(/: (true|false)/g, ': <span class="text-tertiary-dim">$1</span>')
      .replace(/: (\d+)/g, ': <span class="text-warning-light">$1</span>')
      .replace(/: (null)/g, ': <span class="text-error-light">$1</span>');
  };

  return (
    <div className="glass-panel overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-[#1e293b] flex items-center justify-between bg-surface-container-low">
        <h3 className="font-mono text-code-base text-on-surface-variant flex items-center space-x-2">
          <span className="material-symbols-outlined text-[16px]">terminal</span>
          <span>{title}</span>
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest/50 text-code-sm font-mono transition"
          >
            <span className="material-symbols-outlined text-[14px]">{copied ? 'check' : 'content_copy'}</span>
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-on-surface-variant hover:text-on-surface p-1 rounded transition"
          >
            <span className="material-symbols-outlined text-[18px]">{collapsed ? 'expand_more' : 'expand_less'}</span>
          </button>
        </div>
      </div>

      {/* Body */}
      {!collapsed && (
        <div className="recessed-panel m-3 p-4 overflow-x-auto max-h-[400px] overflow-y-auto">
          <pre
            className="font-mono text-code-sm leading-relaxed whitespace-pre-wrap break-words"
            dangerouslySetInnerHTML={{ __html: colorize(jsonString) }}
          />
        </div>
      )}
    </div>
  );
};
