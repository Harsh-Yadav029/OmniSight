import React, { useState } from 'react';

export const PullRequestCard = ({ pullRequest, runId, onDecision }) => {
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!pullRequest) {
    return (
      <div className="card-ambient p-6">
        <h3 className="text-title-sm font-bold text-on-surface flex items-center gap-2">
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
    <div className="card-ambient p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-title-sm font-bold text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-primary">merge</span>
          <span>Automated GitHub PR</span>
        </h3>
        <span className={`text-label-caps px-2.5 py-1 rounded-full border font-bold ${
          isPending
            ? 'bg-secondary/15 text-secondary border-secondary/30'
            : pullRequest.decision === 'approved'
              ? 'bg-tertiary/15 text-tertiary border-tertiary/30'
              : 'bg-error/15 text-error border-error/30'
        }`}>
          {isPending ? 'PENDING APPROVAL' : pullRequest.decision === 'approved' ? 'APPROVED' : 'REJECTED'}
        </span>
      </div>

      {/* PR Details */}
      <div className="p-3.5 bg-surface-container-low rounded-xl border border-[#E8E6E1] space-y-2">
        <div className="text-label-caps text-on-surface-variant">
          TARGET FIX BRANCH
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <code className="font-mono text-code-mono text-primary font-bold break-all">
            {pullRequest.branchName || `omnisight/fix-${runId}`}
          </code>
          {pullRequest.prUrl && (
            <a
              href={pullRequest.prUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary-container text-white rounded-lg text-body-sm font-semibold hover:bg-primary transition shrink-0 shadow-sm"
            >
              <span>View PR on GitHub</span>
              <span className="material-symbols-outlined text-[14px]">open_in_new</span>
            </a>
          )}
        </div>
      </div>

      {/* Resolution Actions */}
      {isPending && (
        <div className="space-y-3 pt-3 border-t border-[#E8E6E1]">
          <h4 className="text-label-caps text-on-surface-variant font-bold">RESOLUTION ACTIONS</h4>

          <button
            onClick={() => handleDecision('approved')}
            disabled={submitting}
            className="w-full bg-primary-container hover:bg-primary text-white text-body-medium font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-sm transition disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span>Approve & Merge Fix</span>
          </button>

          {!showRejectInput ? (
            <button
              onClick={() => setShowRejectInput(true)}
              disabled={submitting}
              className="w-full bg-white border border-[#E8E6E1] hover:bg-surface-container-low text-error hover:border-error/30 text-body-medium font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-50"
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
                className="w-full bg-white border border-[#E8E6E1] rounded-xl px-3 py-2 text-body-sm text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:border-error focus:ring-2 focus:ring-error/15 transition"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => handleDecision('rejected')}
                  disabled={submitting}
                  className="flex-1 bg-error text-white text-body-sm font-semibold py-2 rounded-xl hover:bg-error-light transition disabled:opacity-50 shadow-sm"
                >
                  Confirm Reject
                </button>
                <button
                  onClick={() => { setShowRejectInput(false); setRejectionReason(''); }}
                  className="px-4 text-on-surface-variant hover:text-on-surface text-body-sm py-2 rounded-xl border border-[#E8E6E1] hover:bg-surface-container-high transition"
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
