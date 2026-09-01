import React from 'react';

export const SelfHealingTimeline = ({ fixAttempts = [] }) => {
  if (!fixAttempts || fixAttempts.length === 0) {
    return (
      <div className="glass-panel p-5">
        <h3 className="text-title-base font-bold text-on-surface flex items-center space-x-2 mb-3">
          <span className="material-symbols-outlined text-[20px] text-secondary">auto_fix_high</span>
          <span>Self-Healing History</span>
        </h3>
        <p className="text-body-sm text-on-surface-variant">No healing cycles recorded for this run.</p>
      </div>
    );
  }

  return (
    <div className="glass-panel p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-title-base font-bold text-on-surface flex items-center space-x-2">
          <span className="material-symbols-outlined text-[20px] text-secondary">auto_fix_high</span>
          <span>Self-Healing Iteration History</span>
        </h3>
        <span className="text-label-caps text-on-surface-variant bg-surface-container-highest px-2.5 py-1 rounded-full border border-outline-variant/30">
          {fixAttempts.length} {fixAttempts.length === 1 ? 'Attempt' : 'Attempts'}
        </span>
      </div>

      <div className="space-y-4">
        {fixAttempts.map((fix, idx) => (
          <div
            key={idx}
            className="relative pl-6 border-l-2 border-outline-variant/30 pb-4 last:pb-0"
          >
            {/* Timeline Dot */}
            <div className={`absolute -left-[5px] top-1 status-dot ${fix.resolved || fix.verified ? 'pulse-emerald' : 'pulse-amber'}`} />

            {/* Content */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-title-base font-bold text-on-surface">
                  #{fix.attemptNumber || idx + 1}
                </span>
                <span className="text-body-sm font-semibold text-on-surface capitalize">
                  {fix.issueType || 'Visual Defect'}
                </span>
                <span className={`text-label-caps px-2 py-0.5 rounded-full border ${
                  fix.resolved || fix.verified
                    ? 'bg-success/10 text-success-light border-success/30'
                    : 'bg-warning/10 text-warning-light border-warning/30'
                }`}>
                  {fix.resolved || fix.verified ? 'Patch Tested' : 'Testing'}
                </span>
              </div>

              <p className="text-body-sm text-on-surface-variant">
                {fix.description || 'Visual defect detected and patched.'}
              </p>

              {fix.selector && (
                <div className="text-code-sm text-on-surface-variant">
                  <span className="material-symbols-outlined text-[12px] align-middle mr-1">code</span>
                  Injected Tailwind Classes on <span className="text-primary-dim font-semibold">{fix.selector}</span>:
                </div>
              )}

              {fix.tailwindClasses && (
                <div className="recessed-panel p-3 font-mono text-code-sm text-tertiary-dim leading-relaxed break-all">
                  {fix.tailwindClasses}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
