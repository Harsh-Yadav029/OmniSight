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
    <div className="p-6 md:p-10 max-w-7xl mx-auto w-full space-y-8">
      {/* Header Banner */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-2">
        <div>
          <h2 className="text-display-lg font-extrabold text-on-surface mb-1 tracking-tight">Build Runs</h2>
          <p className="text-body-base text-on-surface-variant">AI-powered visual QA, watching every push.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleTriggerRun}
            disabled={triggering}
            className="bg-primary-container text-white font-body-medium font-semibold px-5 py-2.5 rounded-xl hover:bg-primary shadow-sm hover:shadow transition flex items-center gap-2 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[20px]">{triggering ? 'sync' : 'play_arrow'}</span>
            <span>{triggering ? 'Triggering...' : 'New Run'}</span>
          </button>

          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="px-3.5 py-2.5 bg-white border border-[#E8E6E1] text-on-surface-variant hover:text-on-surface rounded-xl shadow-sm text-body-sm font-medium transition flex items-center gap-1.5"
          >
            <span className={`material-symbols-outlined text-[18px] ${isFetching ? 'animate-spin text-primary' : ''}`}>sync</span>
            <span className="hidden sm:inline">{isFetching ? 'Syncing...' : 'Refresh'}</span>
          </button>
        </div>
      </header>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-ambient p-5 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-label-caps text-on-surface-variant font-bold">TOTAL BUILD RUNS</span>
            <span className="material-symbols-outlined text-[22px] text-primary">layers</span>
          </div>
          <p className="text-display-lg font-extrabold text-on-surface mt-2">{totalRuns}</p>
        </div>
        <div className="card-ambient p-5 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-label-caps text-tertiary font-bold">VERIFIED & HEALED</span>
            <span className="material-symbols-outlined text-[22px] text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
          </div>
          <p className="text-display-lg font-extrabold text-tertiary mt-2">{verifiedRuns}</p>
        </div>
        <div className="card-ambient p-5 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-label-caps text-secondary font-bold">ACTIVE PIPELINES</span>
            <span className="material-symbols-outlined text-[22px] text-secondary">auto_fix_high</span>
          </div>
          <p className="text-display-lg font-extrabold text-secondary mt-2">{activeRuns}</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 card-ambient p-4 bg-white">
        <div className="relative flex-1">
          <span className="material-symbols-outlined text-[20px] text-outline absolute left-3.5 top-1/2 -translate-y-1/2">search</span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search runs by commit, branch, or repo..."
            className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low border border-[#E8E6E1] rounded-xl text-body-sm text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition font-sans"
          />
        </div>
        <div className="flex items-center space-x-2">
          <span className="material-symbols-outlined text-[18px] text-outline">filter_list</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-surface-container-low border border-[#E8E6E1] rounded-xl px-3 py-2.5 text-body-sm font-medium text-on-surface focus:outline-none focus:border-primary"
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

      {/* Runs Bento List */}
      {isLoading ? (
        <div className="p-16 text-center text-on-surface-variant space-y-3 card-ambient bg-white">
          <span className="material-symbols-outlined text-[36px] animate-spin text-primary">progress_activity</span>
          <p className="text-body-base font-semibold">Loading build runs...</p>
        </div>
      ) : filteredRuns.length === 0 ? (
        <div className="p-16 text-center card-ambient bg-white text-on-surface-variant space-y-3">
          <span className="material-symbols-outlined text-[36px] text-outline">visibility_off</span>
          <h3 className="text-title-sm font-bold text-on-surface">No Build Runs Found</h3>
          <p className="text-body-sm text-on-surface-variant max-w-sm mx-auto">
            Click "New Run" or run <code className="font-mono text-primary font-semibold">python scripts/smoke_test.py</code>
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredRuns.map((run) => (
            <Link
              key={run._id}
              to={`/runs/${run._id}`}
              className="group bg-white rounded-2xl p-5 card-ambient hover:bg-[#FAF9F6] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden"
            >
              <div className="flex items-start gap-4 w-full md:w-auto">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                  ['analyzing', 'fix_applied'].includes(run.status)
                    ? 'bg-primary/10 text-primary'
                    : ['verified', 'completed', 'pr_created'].includes(run.status)
                    ? 'bg-tertiary/10 text-tertiary'
                    : 'bg-surface-container-high text-on-surface-variant'
                }`}>
                  <span className="material-symbols-outlined text-[22px]">
                    {['analyzing', 'fix_applied'].includes(run.status) ? 'analytics' :
                     ['verified', 'completed', 'pr_created'].includes(run.status) ? 'task_alt' : 'photo_library'}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-title-sm font-bold text-on-surface">
                      {run.repo || 'OmniSight'}
                    </span>
                    <span className="font-mono text-code-mono bg-surface-container-high text-on-surface px-2 py-0.5 rounded-md font-semibold">
                      {run.branch || 'main'}
                    </span>
                    <span className="font-mono text-code-mono text-on-surface-variant text-[12px]">
                      {(run.commitSha || '').substring(0, 7)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={run.status} />
                    <span className="text-body-sm text-on-surface-variant font-medium">
                      {run.createdAt ? new Date(run.createdAt).toLocaleTimeString() : 'Just now'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end w-full md:w-auto gap-4">
                <div className="hidden lg:flex items-center gap-3 text-on-surface-variant text-body-sm">
                  <span className="font-mono text-code-mono bg-surface-container-low px-2 py-1 rounded border border-[#E8E6E1]">
                    ID: {String(run._id).substring(0, 12)}
                  </span>
                </div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-surface-container-low text-on-surface-variant group-hover:bg-primary group-hover:text-white transition-all transform group-hover:translate-x-1 duration-200">
                  <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
