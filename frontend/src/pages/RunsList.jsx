import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

const getRunIcon = (status, repo) => {
  if (status === 'analyzing' || status === 'pending') return { icon: 'analytics', bg: 'bg-[#e5ffe9] text-[#016464]' };
  if (status === 'screenshots_captured') return { icon: 'photo_library', bg: 'bg-[#f3ede6] text-[#6f7979]' };
  if (status === 'fix_applied') return { icon: 'build', bg: 'bg-[#ffdbc8] text-[#904c1b]' };
  if (status === 'verified' || status === 'completed') return { icon: 'check_circle', bg: 'bg-[#e5ffe9] text-[#356346]' };
  if (status === 'pr_created') return { icon: 'code', bg: 'bg-[#dafffe] text-[#016464]' };
  if (status === 'failed' || status === 'rejected') return { icon: 'cancel', bg: 'bg-[#ffdad6] text-[#ba1a1a]' };
  return { icon: 'widgets', bg: 'bg-[#f3ede6] text-[#6f7979]' };
};

const getStatusBadgeConfig = (status) => {
  switch (status) {
    case 'analyzing':
      return { label: 'ANALYZING', bg: 'bg-[#e5ffe9]', text: 'text-[#016464]', dot: 'bg-[#016464] animate-pulse' };
    case 'screenshots_captured':
      return { label: 'SCREENSHOTS CAPTURED', bg: 'bg-[#f3ede6]', text: 'text-[#3f4948]', dot: 'bg-[#6f7979]' };
    case 'fix_applied':
      return { label: 'FIX APPLIED', bg: 'bg-[#ffdbc8]', text: 'text-[#783a08]', dot: 'bg-[#904c1b]' };
    case 'verified':
    case 'completed':
    case 'approved':
      return { label: 'VERIFIED', bg: 'bg-[#e5ffe9]', text: 'text-[#215034]', dot: 'bg-[#356346]' };
    case 'pr_created':
      return { label: 'PR OPENED', bg: 'bg-[#dafffe]', text: 'text-[#004f50]', dot: 'bg-[#016464]' };
    case 'failed':
    case 'rejected':
      return { label: 'REJECTED', bg: 'bg-[#ffdad6]', text: 'text-[#93000a]', dot: 'bg-[#ba1a1a]' };
    default:
      return { label: 'PENDING', bg: 'bg-[#f3ede6]', text: 'text-[#3f4948]', dot: 'bg-[#6f7979]' };
  }
};

const formatTimeAgo = (dateString) => {
  if (!dateString) return 'Just now';
  const diff = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return 'Yesterday';
};

export const RunsList = () => {
  const [triggering, setTriggering] = useState(false);

  const { data: runs = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['runs'],
    queryFn: () => api.getRuns(),
    refetchInterval: (query) => {
      const activeRuns = query.state.data?.some((r) =>
        ['pending', 'analyzing', 'fix_applied', 'screenshots_captured'].includes(r.status)
      );
      return activeRuns ? 4000 : false;
    }
  });

  const handleTriggerRun = async () => {
    setTriggering(true);
    try {
      await fetch('http://localhost:8000/webhook/build-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repo: 'frontend-webapp',
          branch: 'feature/new-nav',
          commitSha: Math.random().toString(36).substring(2, 9)
        })
      });
      setTimeout(() => { refetch(); setTriggering(false); }, 1200);
    } catch (e) {
      refetch(); setTriggering(false);
    }
  };

  return (
    <div className="p-8 md:p-12 max-w-6xl mx-auto w-full font-sans">
      {/* Page Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
        <div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1d1b17] tracking-tight mb-1">
            Build Runs
          </h2>
          <p className="text-sm sm:text-base text-[#6f7979] font-medium">
            AI-powered visual QA, watching every push.
          </p>
        </div>

        <button
          onClick={handleTriggerRun}
          disabled={triggering}
          className="bg-[#016464] hover:bg-[#004f50] text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-2 active:scale-[0.98] disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[18px]">
            {triggering ? 'sync' : 'play_arrow'}
          </span>
          <span>{triggering ? 'Triggering...' : 'New Run'}</span>
        </button>
      </header>

      {/* Runs Card Rows */}
      {isLoading ? (
        <div className="p-16 text-center bg-white rounded-2xl border border-[#E8E6E1] shadow-sm space-y-3">
          <span className="material-symbols-outlined text-[36px] animate-spin text-[#016464]">progress_activity</span>
          <p className="text-sm font-semibold text-[#6f7979]">Loading build runs...</p>
        </div>
      ) : runs.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-2xl border border-[#E8E6E1] shadow-sm space-y-3">
          <span className="material-symbols-outlined text-[36px] text-[#6f7979]">inbox</span>
          <h3 className="text-lg font-bold text-[#1d1b17]">No Build Runs Found</h3>
          <p className="text-sm text-[#6f7979] max-w-sm mx-auto">
            Click "New Run" to initiate an autonomous visual regression inspection.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {runs.map((run) => {
            const iconConfig = getRunIcon(run.status, run.repo);
            const badgeConfig = getStatusBadgeConfig(run.status);
            const repoName = run.repo?.includes('/') ? run.repo.split('/')[1] : run.repo || 'frontend-webapp';

            return (
              <Link
                key={run._id}
                to={`/runs/${run._id}`}
                className="group bg-white rounded-2xl p-5 border border-[#E8E6E1] shadow-[0_4px_20px_-2px_rgba(26,26,26,0.05)] hover:bg-[#FAF9F6] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left side: Icon + Repo Details */}
                <div className="flex items-center gap-4 min-w-0">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${iconConfig.bg}`}>
                    <span className="material-symbols-outlined text-[22px]">
                      {iconConfig.icon}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-base font-bold text-[#1d1b17] truncate">
                        {repoName}
                      </span>
                      <span className="font-mono text-xs bg-[#f3ede6] text-[#1d1b17] font-semibold px-2.5 py-0.5 rounded-md">
                        {run.branch || 'main'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider ${badgeConfig.bg} ${badgeConfig.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${badgeConfig.dot}`} />
                        <span>{badgeConfig.label}</span>
                      </span>

                      <span className="text-xs text-[#6f7979] font-medium">
                        {formatTimeAgo(run.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right side: Diff metrics + Chevron */}
                <div className="flex items-center justify-end gap-6 text-[#6f7979]">
                  <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-[#6f7979]">
                    <span className="material-symbols-outlined text-[16px]">compare</span>
                    <span>12 Diff</span>
                  </div>

                  <span className="material-symbols-outlined text-[#6f7979] group-hover:text-[#016464] group-hover:translate-x-0.5 transition-all text-[22px]">
                    chevron_right
                  </span>
                </div>
              </Link>
            );
          })}

          {/* Load More Button */}
          <div className="pt-4 flex justify-center">
            <button
              onClick={() => refetch()}
              className="px-6 py-2.5 bg-[#f3ede6] hover:bg-[#ede7e0] text-[#1d1b17] text-sm font-semibold rounded-xl transition"
            >
              Load More Runs
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
