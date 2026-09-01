import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { ViewportSwitcher } from '../components/ViewportSwitcher';
import { ScreenshotDiffViewer } from '../components/ScreenshotDiffViewer';
import { SelfHealingTimeline } from '../components/SelfHealingTimeline';
import { PullRequestCard } from '../components/PullRequestCard';
import { JsonViewer } from '../components/JsonViewer';

export const RunDetail = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [activeViewport, setActiveViewport] = useState(375);
  const [activePage, setActivePage] = useState('checkout');

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['run', id],
    queryFn: () => api.getRunById(id),
    refetchInterval: (query) => {
      const status = query.state.data?.run?.status;
      const isActive = ['pending', 'analyzing', 'fix_applied', 'screenshots_captured'].includes(status);
      return isActive ? 5000 : false;
    }
  });

  // Auto-detect page from defect details
  useEffect(() => {
    if (data?.fixAttempts && data.fixAttempts.length > 0) {
      const latest = data.fixAttempts[data.fixAttempts.length - 1];
      const issue = `${latest.issueType || ''} ${latest.description || ''} ${latest.selector || ''}`.toLowerCase();
      if (issue.includes('header') || issue.includes('navbar') || issue.includes('product') || issue.includes('logo')) {
        setActivePage('product_listing');
      } else if (issue.includes('cart-item') || issue.includes('proceed-to-checkout')) {
        setActivePage('cart');
      } else {
        setActivePage('checkout');
      }
    }
  }, [data]);

  const decisionMutation = useMutation({
    mutationFn: ({ decision, reason }) => api.updateDecision(id, decision, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['run', id] });
      queryClient.invalidateQueries({ queryKey: ['runs'] });
    }
  });

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-20">
        <div className="text-center space-y-3">
          <span className="material-symbols-outlined text-[40px] animate-spin text-primary">progress_activity</span>
          <h3 className="text-headline-md font-bold text-on-surface">Loading Run Inspection</h3>
          <p className="text-body-sm text-on-surface-variant">Fetching visual diffs and self-healing telemetry...</p>
        </div>
      </div>
    );
  }

  if (isError || !data?.run) {
    return (
      <div className="flex-1 flex items-center justify-center p-20">
        <div className="text-center space-y-4 card-ambient p-8 bg-white max-w-md">
          <span className="material-symbols-outlined text-[48px] text-error">error</span>
          <h3 className="text-headline-md font-bold text-on-surface">Build Run Not Found</h3>
          <p className="text-body-sm text-on-surface-variant">
            Run #{id} does not exist or the backend server is unreachable.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-container text-white rounded-xl text-body-sm font-semibold hover:bg-primary transition shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Back to All Runs</span>
          </Link>
        </div>
      </div>
    );
  }

  const { run, fixAttempts = [], pullRequest } = data;
  const latestFix = fixAttempts.length > 0 ? fixAttempts[fixAttempts.length - 1] : null;

  const pages = [
    { id: 'product_listing', label: 'Catalog', icon: 'grid_view' },
    { id: 'cart', label: 'Cart', icon: 'shopping_cart' },
    { id: 'checkout', label: 'Checkout', icon: 'credit_card' },
  ];

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto w-full space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="w-9 h-9 rounded-xl bg-white border border-[#E8E6E1] text-on-surface-variant hover:text-on-surface flex items-center justify-center shadow-sm transition"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-title-sm font-bold text-on-surface">Run #{String(run._id).substring(0, 16)}</span>
              <StatusBadge status={run.status} />
            </div>
            <p className="text-body-sm text-on-surface-variant">
              Repository: <span className="font-semibold text-on-surface">{run.repo || 'TinyCart'}</span> · Branch: <span className="font-mono text-primary font-bold">{run.branch || 'main'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <ViewportSwitcher
            activeViewport={activeViewport}
            onSelectViewport={(vp) => setActiveViewport(vp)}
          />

          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="px-3.5 py-2 bg-white border border-[#E8E6E1] text-on-surface-variant hover:text-on-surface rounded-xl shadow-sm text-body-sm font-medium transition flex items-center gap-1.5"
          >
            <span className={`material-symbols-outlined text-[18px] ${isFetching ? 'animate-spin text-primary' : ''}`}>sync</span>
            <span className="hidden sm:inline">{isFetching ? 'Syncing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Metadata & Page Switcher Card */}
      <div className="card-ambient p-6 bg-white space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E8E6E1]">
          <div>
            <h3 className="text-label-caps text-on-surface-variant font-bold mb-1">TARGET AUDIT VIEW</h3>
            <p className="text-title-sm font-bold text-on-surface">Interactive Viewport & State Inspection</p>
          </div>

          {/* Page Switcher */}
          <div className="flex items-center p-1 bg-surface-container-low border border-[#E8E6E1] rounded-xl text-body-sm">
            {pages.map((page) => (
              <button
                key={page.id}
                onClick={() => setActivePage(page.id)}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg transition-all ${
                  activePage === page.id
                    ? 'bg-primary-container text-white font-semibold shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">{page.icon}</span>
                <span>{page.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Metadata Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3 bg-surface-container-low rounded-xl border border-[#E8E6E1] space-y-0.5">
            <span className="text-label-caps text-on-surface-variant font-bold">BRANCH</span>
            <p className="font-bold text-on-surface text-body-sm flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-primary">fork_right</span>
              <span>{run.branch || 'main'}</span>
            </p>
          </div>
          <div className="p-3 bg-surface-container-low rounded-xl border border-[#E8E6E1] space-y-0.5">
            <span className="text-label-caps text-on-surface-variant font-bold">COMMIT SHA</span>
            <p className="font-mono text-primary font-bold text-body-sm flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px] text-outline">commit</span>
              <span>{(run.commitSha || 'unknown').substring(0, 8)}</span>
            </p>
          </div>
          <div className="p-3 bg-surface-container-low rounded-xl border border-[#E8E6E1] space-y-0.5">
            <span className="text-label-caps text-on-surface-variant font-bold">CREATED AT</span>
            <p className="text-on-surface text-body-sm flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px] text-outline">schedule</span>
              <span>{run.createdAt ? new Date(run.createdAt).toLocaleTimeString() : 'Just now'}</span>
            </p>
          </div>
          <div className="p-3 bg-surface-container-low rounded-xl border border-[#E8E6E1] space-y-0.5">
            <span className="text-label-caps text-on-surface-variant font-bold">HEALING STATUS</span>
            <p className="font-bold text-tertiary text-body-sm flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              <span>{fixAttempts.length > 0 ? `${fixAttempts.length} Fix Cycles` : 'Clean Baseline'}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Main Diagnostic 3-Column Cockpit Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Diff Viewer + JSON Inspector */}
        <div className="lg:col-span-2 space-y-6">
          <ScreenshotDiffViewer
            runId={run._id}
            pageName={activePage}
            viewport={activeViewport}
            latestFixAttempt={latestFix}
          />
          <JsonViewer
            data={{
              runId: run._id,
              status: run.status,
              viewport: activeViewport,
              page: activePage,
              latestFixAttempt: latestFix,
              pullRequest: pullRequest
            }}
            title="Multimodal VLM Inspection & State Graph Output"
          />
        </div>

        {/* Right 1 Col: PR Card + Timeline */}
        <div className="space-y-6">
          <PullRequestCard
            pullRequest={pullRequest}
            runId={run._id}
            onDecision={async (decision, reason) => {
              await decisionMutation.mutateAsync({ decision, reason });
            }}
          />
          <SelfHealingTimeline fixAttempts={fixAttempts} />
        </div>
      </div>
    </div>
  );
};
