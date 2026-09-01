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
        <div className="text-center space-y-4">
          <span className="material-symbols-outlined text-[40px] animate-spin text-primary">progress_activity</span>
          <h3 className="text-headline-md font-bold text-on-surface">Loading Run Inspection</h3>
          <p className="text-body-sm text-on-surface-variant">Fetching visual diffs and self-healing timeline...</p>
        </div>
      </div>
    );
  }

  if (isError || !data?.run) {
    return (
      <div className="flex-1 flex items-center justify-center p-20">
        <div className="text-center space-y-4">
          <span className="material-symbols-outlined text-[40px] text-error">error</span>
          <h3 className="text-headline-md font-bold text-on-surface">Build Run Not Found</h3>
          <p className="text-body-sm text-on-surface-variant max-w-md mx-auto">
            Run #{id} does not exist or backend server is unreachable.
          </p>
          <Link
            to="/"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-surface-container border border-outline-variant/30 text-on-surface rounded-xl text-body-sm font-semibold hover:bg-surface-container-high transition"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Back to Runs List</span>
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
    <div className="flex-1 flex flex-col min-w-0">
      {/* Top App Bar */}
      <header className="bg-canvas/80 backdrop-blur-md border-b border-outline-variant/30 flex justify-between items-center w-full px-6 h-16 shrink-0 sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <Link to="/" className="text-on-surface-variant hover:text-on-surface transition p-1">
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </Link>
          <h2 className="text-headline-md font-bold text-on-surface flex items-center space-x-2">
            <span className="text-on-surface-variant">Build</span>
            <span className="material-symbols-outlined text-outline text-[16px]">chevron_right</span>
            <span>#{String(run._id).substring(0, 12)}</span>
          </h2>
        </div>
        <div className="flex items-center space-x-4">
          {/* AI Analysis Status */}
          <div className="flex items-center space-x-3">
            <span className="text-body-sm text-on-surface-variant hidden sm:block">AI Analysis:</span>
            <div className="flex items-center space-x-2 bg-surface-container-low px-3 py-1 rounded-full border border-outline-variant/30">
              <span className={`status-dot ${
                ['analyzing', 'fix_applied'].includes(run.status) ? 'pulse-purple' :
                ['verified', 'completed', 'pr_created'].includes(run.status) ? 'pulse-emerald' :
                'pulse-amber'
              }`} />
              <span className="text-label-caps text-secondary tracking-wider">
                {['analyzing', 'fix_applied'].includes(run.status) ? 'ACTIVE' :
                 ['verified', 'completed', 'pr_created'].includes(run.status) ? 'COMPLETE' :
                 'PENDING'}
              </span>
            </div>
          </div>

          <div className="w-px h-6 bg-outline-variant/30 hidden sm:block" />

          {/* Viewport Switcher */}
          <ViewportSwitcher
            activeViewport={activeViewport}
            onSelectViewport={(vp) => setActiveViewport(vp)}
          />

          <div className="w-px h-6 bg-outline-variant/30 hidden sm:block" />

          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center space-x-2 px-3 py-1.5 bg-surface-container border border-outline-variant/30 text-on-surface-variant text-body-sm font-semibold rounded-xl hover:text-on-surface transition disabled:opacity-50"
          >
            <span className={`material-symbols-outlined text-[16px] ${isFetching ? 'animate-spin' : ''}`}>sync</span>
            <span className="hidden sm:block">{isFetching ? 'Syncing...' : 'Refresh'}</span>
          </button>
        </div>
      </header>

      {/* Content Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Header Info Banner */}
        <div className="glass-panel p-6 space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1e293b]">
            <div className="space-y-1">
              <div className="flex items-center space-x-3">
                <h1 className="text-headline-lg font-bold text-on-surface tracking-tight">
                  Run #{String(run._id).substring(0, 24)}
                </h1>
                <StatusBadge status={run.status} />
              </div>
              <p className="text-body-sm text-on-surface-variant">
                Triggered for repository <span className="font-semibold text-on-surface">{run.repo || 'TinyCart'}</span>
              </p>
            </div>

            {/* Page Switcher */}
            <div className="flex items-center p-1 bg-surface-container-lowest border border-outline-variant/30 rounded-full text-body-sm">
              {pages.map((page) => (
                <button
                  key={page.id}
                  onClick={() => setActivePage(page.id)}
                  className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-full transition-all ${
                    activePage === page.id
                      ? 'bg-primary text-on-primary font-semibold shadow-glow-primary'
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
            <div className="p-3.5 bg-surface-container-lowest border border-outline-variant/15 rounded-lg space-y-1">
              <span className="text-code-sm text-on-surface-variant font-mono">Branch</span>
              <p className="font-semibold text-on-surface flex items-center space-x-1.5 text-body-sm">
                <span className="material-symbols-outlined text-[16px] text-primary">fork_right</span>
                <span>{run.branch || 'main'}</span>
              </p>
            </div>
            <div className="p-3.5 bg-surface-container-lowest border border-outline-variant/15 rounded-lg space-y-1">
              <span className="text-code-sm text-on-surface-variant font-mono">Commit SHA</span>
              <p className="font-mono text-primary-dim flex items-center space-x-1.5 text-code-base">
                <span className="material-symbols-outlined text-[14px] text-outline">commit</span>
                <span>{(run.commitSha || 'unknown').substring(0, 8)}</span>
              </p>
            </div>
            <div className="p-3.5 bg-surface-container-lowest border border-outline-variant/15 rounded-lg space-y-1">
              <span className="text-code-sm text-on-surface-variant font-mono">Created At</span>
              <p className="text-on-surface flex items-center space-x-1.5 text-body-sm">
                <span className="material-symbols-outlined text-[14px] text-outline">schedule</span>
                <span>{run.createdAt ? new Date(run.createdAt).toLocaleTimeString() : 'Just now'}</span>
              </p>
            </div>
            <div className="p-3.5 bg-surface-container-lowest border border-outline-variant/15 rounded-lg space-y-1">
              <span className="text-code-sm text-on-surface-variant font-mono">Healing Status</span>
              <p className="font-semibold text-success-light flex items-center space-x-1.5 text-body-sm">
                <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                <span>{fixAttempts.length > 0 ? `${fixAttempts.length} Fix Cycles` : 'Clean Baseline'}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Grid: Visual Diff + Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Screenshot Diff + JSON Inspector */}
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
    </div>
  );
};
