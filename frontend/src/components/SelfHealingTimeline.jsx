import React from 'react';

export const SelfHealingTimeline = ({ fixAttempts = [] }) => {
  if (!fixAttempts || fixAttempts.length === 0) {
    return (
      <div className="card-ambient p-6">
        <h3 className="text-title-sm font-bold text-on-surface flex items-center gap-2 mb-3">
          <span className="material-symbols-outlined text-[20px] text-primary">auto_fix_high</span>
          <span>Self-Healing History</span>
        </h3>
        <p className="text-body-sm text-on-surface-variant">No healing cycles recorded for this run.</p>
      </div>
    );
  }

  return (
    <div className="card-ambient p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-title-sm font-bold text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-primary">auto_fix_high</span>
          <span>Self-Healing Iteration History</span>
        </h3>
        <span className="text-label-caps text-on-surface-variant bg-surface-container-high px-2.5 py-1 rounded-full border border-[#E8E6E1]">
          {fixAttempts.length} {fixAttempts.length === 1 ? 'Attempt' : 'Attempts'}
        </span>
      </div>

      <div className="space-y-4">
        {fixAttempts.map((fix, idx) => (
          <div
            key={idx}
            className="relative pl-6 border-l-2 border-[#E8E6E1] pb-4 last:pb-0"
          >
            {/* Timeline Dot */}
            <div className={`absolute -left-[5px] top-1.5 status-dot ${fix.resolved || fix.verified ? 'pulse-sage' : 'pulse-coral'}`} />

            {/* Content */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-body-medium font-bold text-on-surface">
                  Cycle #{fix.attemptNumber || idx + 1}
                </span>
                <span className="text-body-sm font-medium text-on-surface-variant capitalize">
                  {fix.issueType || 'Visual Defect'}
                </span>
                <span className={`text-label-caps px-2 py-0.5 rounded-full border font-bold ${
                  fix.resolved || fix.verified
                    ? 'bg-tertiary/15 text-tertiary border-tertiary/30'
                    : 'bg-secondary/15 text-secondary border-secondary/30'
                }`}>
                  {fix.resolved || fix.verified ? 'TESTED & VERIFIED' : 'TESTING'}
                </span>
              </div>

              <p className="text-body-sm text-on-surface-variant">
                {fix.description || 'Visual defect detected and patched.'}
              </p>

              {fix.selector && (
                <div className="text-code-mono text-on-surface-variant">
                  <span className="material-symbols-outlined text-[14px] align-middle mr-1">code</span>
                  Target Selector: <span className="text-primary font-bold">{fix.selector}</span>
                </div>
              )}

              {fix.tailwindClasses && (
                <div className="p-3 bg-surface-container-low rounded-xl border border-[#E8E6E1] font-mono text-code-mono text-primary leading-relaxed break-all">
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
