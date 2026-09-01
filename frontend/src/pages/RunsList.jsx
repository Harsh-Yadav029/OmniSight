import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';

export const RunsList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [triggering, setTriggering] = useState(false);

  const { data: runs = [], isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['runs'],
    queryFn: () => api.getRuns(),
    refetchInterval: (query) => {
      const activeRuns = query.state.data?.some((r) =>
        ['pending', 'analyzing', 'fix_applied', 'screenshots_captured'].includes(r.status)
      );
      return activeRuns ? 5000 : false;
    }
  });

  const handleTriggerRun = async () => {
    setTriggering(true);
    try {
      await fetch('http://localhost:8000/webhook/build-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repo: 'Harsh-Yadav029/OmniSight',
          branch: 'main',
          commitSha: Math.random().toString(36).substring(2, 9)
        })
      });
      setTimeout(() => { refetch(); setTriggering(false); }, 1200);
    } catch (e) {
      refetch(); setTriggering(false);
    }
  };

  const filteredRuns = runs.filter((run) => {
    const matchesSearch =
      (run.repo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (run.branch || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (run.commitSha || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (run._id || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'ALL' ||
      run.status === statusFilter ||
      (statusFilter === 'pr_created' && ['verified', 'pr_created', 'completed'].includes(run.status));
    return matchesSearch && matchesStatus;
  });

  const totalRuns = runs.length;
  const verifiedRuns = runs.filter((r) => ['verified', 'pr_created', 'completed'].includes(r.status)).length;
  const activeRuns = runs.filter((r) => ['pending', 'analyzing', 'fix_applied', 'screenshots_captured'].includes(r.status)).length;

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Top App Bar */}
      <header className="bg-canvas/80 backdrop-blur-md border-b border-outline-variant/30 flex justify-between items-center w-full px-6 h-16 shrink-0 sticky top-0 z-50">
        <h2 className="text-headline-md font-bold text-on-surface">Build History</h2>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleTriggerRun}
            disabled={triggering}
            className="flex items-center space-x-2 px-4 py-2 bg-primary text-on-primary text-body-sm font-semibold rounded-xl hover:shadow-glow-primary transition-all active:scale-[0.98] disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">{triggering ? 'sync' : 'play_arrow'}</span>
            <span>{triggering ? 'Triggering...' : 'Trigger Visual Audit'}</span>
          </button>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center space-x-2 px-3 py-2 bg-surface-container border border-outline-variant/30 text-on-surface-variant text-body-sm font-semibold rounded-xl hover:text-on-surface transition disabled:opacity-50"
          >
            <span className={`material-symbols-outlined text-[18px] ${isFetching ? 'animate-spin' : ''}`}>sync</span>
            <span>{isFetching ? 'Syncing...' : 'Refresh'}</span>
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="p-6 space-y-6 overflow-y-auto flex-1">
        {/* Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-panel p-5 hover:glow-primary-box transition-all">
            <div className="flex items-center justify-between">
              <span className="text-body-sm font-semibold text-on-surface-variant">Total Build Runs</span>
              <span className="material-symbols-outlined text-[20px] text-primary">layers</span>
            </div>
            <p className="text-display-lg font-extrabold text-on-surface mt-2">{totalRuns}</p>
          </div>
          <div className="glass-panel p-5 hover:glow-primary-box transition-all">
            <div className="flex items-center justify-between">
              <span className="text-body-sm font-semibold text-success-light">Verified & Healed</span>
              <span className="material-symbols-outlined text-[20px] text-success" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
            </div>
            <p className="text-display-lg font-extrabold text-on-surface mt-2">{verifiedRuns}</p>
          </div>
          <div className="glass-panel p-5 hover:glow-primary-box transition-all">
            <div className="flex items-center justify-between">
              <span className="text-body-sm font-semibold text-secondary">Active Pipelines</span>
              <span className="material-symbols-outlined text-[20px] text-secondary">auto_fix_high</span>
            </div>
            <p className="text-display-lg font-extrabold text-on-surface mt-2">{activeRuns}</p>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 glass-panel p-4">
          <div className="relative flex-1">
            <span className="material-symbols-outlined text-[18px] text-outline absolute left-3.5 top-1/2 -translate-y-1/2">search</span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search runs by commit, branch, or repo..."
              className="w-full pl-10 pr-4 py-2.5 bg-surface-container-lowest border border-outline-variant/30 rounded-xl text-body-sm text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:border-primary/50 focus:shadow-glow-primary transition font-sans"
            />
          </div>
          <div className="flex items-center space-x-2">
            <span className="material-symbols-outlined text-[18px] text-outline">filter_list</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-3 py-2.5 text-body-sm font-medium text-on-surface-variant focus:outline-none focus:border-primary/50"
            >
              <option value="ALL">All Statuses</option>
              <option value="verified">Verified & Healed</option>
              <option value="pr_created">PR Created</option>
              <option value="analyzing">AI Analyzing</option>
              <option value="fix_applied">Fix Applied</option>
              <option value="screenshots_captured">Screenshots Captured</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        {/* Runs Table */}
        {isLoading ? (
          <div className="p-12 text-center text-on-surface-variant space-y-3">
            <span className="material-symbols-outlined text-[32px] animate-spin text-primary">progress_activity</span>
            <p className="text-body-base font-semibold">Loading build runs...</p>
          </div>
        ) : filteredRuns.length === 0 ? (
          <div className="p-12 text-center glass-panel text-on-surface-variant space-y-3">
            <span className="material-symbols-outlined text-[32px] text-outline">visibility_off</span>
            <h3 className="text-title-base font-bold text-on-surface">No Build Runs Found</h3>
            <p className="text-body-sm text-on-surface-variant max-w-sm mx-auto">
              Click "Trigger Visual Audit" or run <code className="font-mono text-primary-dim">python scripts/smoke_test.py</code>
            </p>
          </div>
        ) : (
          <div className="glass-panel overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-body-sm">
                <thead className="bg-surface-container-lowest border-b border-[#1e293b]">
                  <tr className="text-label-caps text-on-surface-variant uppercase tracking-wider">
                    <th className="px-6 py-4">Build Run ID</th>
                    <th className="px-6 py-4">Branch & Repository</th>
                    <th className="px-6 py-4">Commit SHA</th>
                    <th className="px-6 py-4">Lifecycle Status</th>
                    <th className="px-6 py-4">Timestamp</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/15">
                  {filteredRuns.map((run) => (
                    <tr key={run._id} className="hover:bg-surface-container/50 transition group">
                      <td className="px-6 py-4 font-mono text-code-base font-bold text-on-surface">
                        {String(run._id).substring(0, 18)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-1.5 font-semibold text-on-surface text-body-sm">
                          <span className="material-symbols-outlined text-[16px] text-primary">fork_right</span>
                          <span>{run.branch || 'main'}</span>
                        </div>
                        <p className="text-code-sm text-on-surface-variant mt-0.5 font-mono">{run.repo || 'Harsh-Yadav029/OmniSight'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="inline-flex items-center space-x-1 font-mono text-code-base text-on-surface-variant bg-surface-container-lowest px-2 py-1 rounded border border-outline-variant/20">
                          <span className="material-symbols-outlined text-[14px] text-outline">commit</span>
                          <span>{(run.commitSha || 'unknown').substring(0, 7)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={run.status} />
                      </td>
                      <td className="px-6 py-4 text-on-surface-variant whitespace-nowrap">
                        <div className="flex items-center space-x-1 text-code-sm font-mono">
                          <span className="material-symbols-outlined text-[14px] text-outline">schedule</span>
                          <span>{run.createdAt ? new Date(run.createdAt).toLocaleTimeString() : 'Just now'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          to={`/runs/${run._id}`}
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-primary text-on-primary rounded-lg text-code-sm font-semibold hover:shadow-glow-primary transition-all group-hover:scale-105"
                        >
                          <span>Inspect</span>
                          <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
