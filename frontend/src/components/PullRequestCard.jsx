import React, { useState } from 'react';
import { GitPullRequest, ExternalLink, Check, X, ShieldAlert, Sparkles } from 'lucide-react';

export const PullRequestCard = ({ pullRequest, runId, onDecision }) => {
  const [loading, setLoading] = useState(false);
  const [decisionFeedback, setDecisionFeedback] = useState('');

  if (!pullRequest) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 text-center">
        <GitPullRequest className="w-8 h-8 mx-auto mb-2 text-slate-600 animate-pulse" />
        <h4 className="text-sm font-semibold text-slate-300">Pull Request Awaiting Verification</h4>
        <p className="text-xs text-slate-500 mt-1">Once visual regressions are healed, a GitHub Pull Request will be opened automatically.</p>
      </div>
    );
  }

  const currentDecision = pullRequest.decision || 'pending';

  const handleAction = async (decision) => {
    setLoading(true);
    try {
      await onDecision(decision, decisionFeedback);
    } catch (err) {
      console.error('Failed to update PR decision:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitPullRequest className="w-5 h-5 text-indigo-400" />
          <h3 className="text-base font-bold text-white">Automated GitHub Pull Request</h3>
        </div>

        {/* Decision Badge */}
        {currentDecision === 'approved' && (
          <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-bold flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5" />
            Approved by QA
          </span>
        )}
        {currentDecision === 'rejected' && (
          <span className="px-3 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/30 rounded-full text-xs font-bold flex items-center gap-1.5">
            <X className="w-3.5 h-3.5" />
            Rejected by QA
          </span>
        )}
        {currentDecision === 'pending' && (
          <span className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full text-xs font-bold animate-pulse">
            Pending QA Approval
          </span>
        )}
      </div>

      <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <p className="text-xs text-slate-400">Target Fix Branch:</p>
            <code className="text-xs font-mono text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
              {pullRequest.branchName || `omnisight/fix-${runId}`}
            </code>
          </div>

          {pullRequest.prUrl && (
            <a
              href={pullRequest.prUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/20 transition self-start sm:self-auto"
            >
              <span>View Pull Request</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>

      {/* Action Buttons for QA Manager */}
      {currentDecision === 'pending' && (
        <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row items-center gap-3">
          <button
            disabled={loading}
            onClick={() => handleAction('approved')}
            className="w-full sm:w-1/2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-lg shadow-emerald-600/20 transition flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>Approve & Merge Fix</span>
          </button>

          <button
            disabled={loading}
            onClick={() => handleAction('rejected')}
            className="w-full sm:w-1/2 py-2.5 px-4 bg-rose-600/10 hover:bg-rose-600/20 active:bg-rose-600/30 disabled:opacity-50 text-rose-400 border border-rose-500/30 font-semibold text-xs rounded-xl transition flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" />
            <span>Reject Fix</span>
          </button>
        </div>
      )}
    </div>
  );
};
