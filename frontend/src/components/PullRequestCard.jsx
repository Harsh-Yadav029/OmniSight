import React, { useState } from 'react';

export const PullRequestCard = ({ pullRequest, runId, onDecision }) => {
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!pullRequest) {
    return (
      <div className="glass-panel p-5">
        <h3 className="text-title-base font-bold text-on-surface flex items-center space-x-2">
          <span className="material-symbols-outlined text-[20px] text-primary">merge</span>
          <span>Pull Request</span>
        </h3>
        <p className="text-body-sm text-on-surface-variant mt-2">No PR associated with this run yet.</p>
      </div>
    );
  }

  const isPending = !pullRequest.decision || pullRequest.decision === 'pending';

  const handleDecision = async (decision) => {
    setSubmitting(true);
    try {
      await onDecision(decision, rejectionReason);
    } catch (err) {
      console.error('Decision error:', err);
    }
    setSubmitting(false);
    setShowRejectInput(false);
    setRejectionReason('');
  };

  return (
    <div className="glass-panel p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-title-base font-bold text-on-surface flex items-center space-x-2">
          <span className="material-symbols-outlined text-[20px] text-primary">merge</span>
          <span>Automated GitHub Pull Request</span>
        </h3>
        <span className={`text-label-caps px-2.5 py-1 rounded-full border ${
          isPending
            ? 'bg-warning/10 text-warning-light border-warning/30'
            : pullRequest.decision === 'approved'
              ? 'bg-success/10 text-success-light border-success/30'
              : 'bg-error/10 text-error-light border-error/30'
        }`}>
          {isPending ? 'Pending QA Approval' : pullRequest.decision === 'approved' ? 'Approved' : 'Rejected'}
        </span>
      </div>

      {/* PR Details */}
      <div className="recessed-panel p-3 space-y-2">
        <div className="text-code-sm text-on-surface-variant">
          Target Fix Branch:
        </div>
        <div className="flex items-center justify-between">
          <code className="font-mono text-code-base text-tertiary-dim break-all">
            {pullRequest.branchName || `omnisight/fix-${runId}`}
          </code>
          {pullRequest.prUrl && (
            <a
              href={pullRequest.prUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-primary text-on-primary rounded-lg text-code-sm font-semibold hover:shadow-glow-primary transition-all shrink-0 ml-3"
            >
              <span>View Pull Request</span>
              <span className="material-symbols-outlined text-[14px]">open_in_new</span>
            </a>
          )}
        </div>
      </div>

      {/* Resolution Actions */}
      {isPending && (
        <div className="space-y-3 pt-2 border-t border-[#1e293b]">
          <h4 className="text-body-sm font-semibold text-on-surface-variant">Resolution Actions</h4>

          <button
            onClick={() => handleDecision('approved')}
            disabled={submitting}
            className="w-full bg-success/10 hover:bg-success/20 text-success-light border border-success/30 text-body-base font-semibold py-2.5 rounded-lg flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span>Approve Fix</span>
          </button>

          {!showRejectInput ? (
            <button
              onClick={() => setShowRejectInput(true)}
              disabled={submitting}
              className="w-full bg-transparent border border-[#1e293b] text-on-surface-variant hover:text-error-light hover:border-error/30 hover:bg-error/5 text-body-base font-semibold py-2.5 rounded-lg flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">cancel</span>
              <span>Reject Fix</span>
            </button>
          ) : (
            <div className="space-y-2">
              <input
                type="text"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Reason for rejection (optional)"
                className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-3 py-2 text-body-sm text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:border-error/50 transition"
              />
              <div className="flex space-x-2">
                <button
                  onClick={() => handleDecision('rejected')}
                  disabled={submitting}
                  className="flex-1 bg-error/10 text-error-light border border-error/30 text-body-sm font-semibold py-2 rounded-lg hover:bg-error/20 transition disabled:opacity-50"
                >
                  Confirm Reject
                </button>
                <button
                  onClick={() => { setShowRejectInput(false); setRejectionReason(''); }}
                  className="px-4 text-on-surface-variant hover:text-on-surface text-body-sm py-2 rounded-lg border border-outline-variant/20 hover:bg-surface-container-highest/30 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
