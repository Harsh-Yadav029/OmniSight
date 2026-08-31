import React from 'react';
import { Wrench, CheckCircle2, XCircle, Code2, ArrowRight, Activity } from 'lucide-react';

export const SelfHealingTimeline = ({ fixAttempts = [] }) => {
  if (!fixAttempts || fixAttempts.length === 0) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 text-center">
        <Activity className="w-8 h-8 mx-auto mb-2 text-slate-600 animate-pulse" />
        <h4 className="text-sm font-semibold text-slate-300">Self-Healing Pipeline Standing By</h4>
        <p className="text-xs text-slate-500 mt-1">Fix attempts and iterative patches will appear here in real time.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wrench className="w-5 h-5 text-indigo-400" />
          <h3 className="text-base font-bold text-white">Self-Healing Iteration History</h3>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
          {fixAttempts.length} {fixAttempts.length === 1 ? 'Attempt' : 'Attempts'}
        </span>
      </div>

      <div className="space-y-4">
        {fixAttempts.map((attempt, index) => {
          const isResolved = attempt.resolved;
          return (
            <div
              key={attempt._id || index}
              className={`p-4 rounded-xl border transition ${
                isResolved
                  ? 'bg-emerald-950/20 border-emerald-500/30'
                  : 'bg-slate-950/80 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-indigo-600/20 text-indigo-400 font-bold text-xs flex items-center justify-center border border-indigo-500/30">
                    #{attempt.attemptNumber || index + 1}
                  </span>
                  <span className="text-sm font-semibold text-white capitalize">
                    {attempt.issueType || 'Visual Layout Discrepancy'}
                  </span>
                </div>

                {isResolved ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Resolved
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                    <XCircle className="w-3.5 h-3.5" />
                    Patch Tested
                  </span>
                )}
              </div>

              {attempt.description && (
                <p className="text-xs text-slate-300 mb-3">{attempt.description}</p>
              )}

              {/* Injected classes preview */}
              {attempt.tailwindClasses && (
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
                    <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Injected Tailwind Classes on <code>{attempt.selector || '#submit-order-button'}</code>:</span>
                  </div>
                  <pre className="p-2.5 bg-slate-900 rounded-lg text-xs font-mono text-indigo-300 border border-slate-800 overflow-x-auto whitespace-pre-wrap">
                    {attempt.tailwindClasses}
                  </pre>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
