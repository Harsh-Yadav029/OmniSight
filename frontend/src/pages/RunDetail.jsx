import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  GitBranch, 
  GitCommit, 
  Clock, 
  RefreshCw, 
  Layers, 
  ShieldCheck, 
  AlertCircle,
  LayoutGrid,
  ShoppingCart,
  CreditCard
} from 'lucide-react';
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
  const [activeViewport, setActiveViewport] = useState(375); // 375 | 768 | 1440
  const [activePage, setActivePage] = useState('checkout'); // 'checkout' | 'product_listing' | 'cart'

  // React Query fetching specific run with 5-second polling interval on in-progress runs
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

  // Mutation for updating QA approval decision
  const decisionMutation = useMutation({
    mutationFn: ({ decision, reason }) => api.updateDecision(id, decision, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['run', id] });
      queryClient.invalidateQueries({ queryKey: ['runs'] });
    }
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-4">
        <RefreshCw className="w-10 h-10 animate-spin text-indigo-400 mx-auto" />
        <h3 className="text-lg font-bold text-white">Loading Build Run Inspection #{id}...</h3>
        <p className="text-xs text-slate-400">Fetching visual diffs and self-healing timeline from backend...</p>
      </div>
    );
  }

  if (isError || !data?.run) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
        <h3 className="text-xl font-bold text-white">Build Run Not Found</h3>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          The requested run #{id} does not exist or backend server is unreachable.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Runs List</span>
        </Link>
      </div>
    );
  }

  const { run, fixAttempts = [], pullRequest } = data;
  const latestFix = fixAttempts.length > 0 ? fixAttempts[fixAttempts.length - 1] : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Navigation & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition" />
          <span>Back to All Runs</span>
        </Link>

        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-2 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold rounded-xl transition self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin text-indigo-400' : ''}`} />
          <span>{isFetching ? 'Syncing...' : 'Refresh Status'}</span>
        </button>
      </div>

      {/* Header Info Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Run #{String(run._id).substring(0, 24)}
              </h1>
              <StatusBadge status={run.status} />
            </div>
            <p className="text-xs text-slate-400">
              Triggered for repository <span className="font-semibold text-slate-200">{run.repo || 'TinyCart'}</span>
            </p>
          </div>

          {/* Controls: Page Switcher + Viewport Switcher */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Page Switcher */}
            <div className="flex items-center p-1 bg-slate-950 border border-slate-800 rounded-xl text-xs font-medium text-slate-400">
              <button
                onClick={() => setActivePage('product_listing')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${activePage === 'product_listing' ? 'bg-indigo-600 text-white font-semibold shadow' : 'hover:text-white'}`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Catalog</span>
              </button>
              <button
                onClick={() => setActivePage('cart')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${activePage === 'cart' ? 'bg-indigo-600 text-white font-semibold shadow' : 'hover:text-white'}`}
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Cart</span>
              </button>
              <button
                onClick={() => setActivePage('checkout')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${activePage === 'checkout' ? 'bg-indigo-600 text-white font-semibold shadow' : 'hover:text-white'}`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Checkout</span>
              </button>
            </div>

            {/* Viewport Switcher */}
            <ViewportSwitcher
              activeViewport={activeViewport}
              onSelectViewport={(vp) => setActiveViewport(vp)}
            />
          </div>
        </div>

        {/* Metadata Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 bg-slate-950/80 border border-slate-800/80 rounded-xl space-y-1">
            <span className="text-[11px] text-slate-500 font-medium">Branch</span>
            <p className="font-semibold text-white flex items-center gap-1.5">
              <GitBranch className="w-3.5 h-3.5 text-indigo-400" />
              <span>{run.branch || 'main'}</span>
            </p>
          </div>

          <div className="p-3.5 bg-slate-950/80 border border-slate-800/80 rounded-xl space-y-1">
            <span className="text-[11px] text-slate-500 font-medium">Commit SHA</span>
            <p className="font-mono text-indigo-300 flex items-center gap-1.5">
              <GitCommit className="w-3.5 h-3.5 text-slate-500" />
              <span>{(run.commitSha || 'unknown').substring(0, 8)}</span>
            </p>
          </div>

          <div className="p-3.5 bg-slate-950/80 border border-slate-800/80 rounded-xl space-y-1">
            <span className="text-[11px] text-slate-500 font-medium">Created At</span>
            <p className="text-slate-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>{run.createdAt ? new Date(run.createdAt).toLocaleTimeString() : 'Just now'}</span>
            </p>
          </div>

          <div className="p-3.5 bg-slate-950/80 border border-slate-800/80 rounded-xl space-y-1">
            <span className="text-[11px] text-slate-500 font-medium">Healing Status</span>
            <p className="font-semibold text-emerald-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{fixAttempts.length > 0 ? `${fixAttempts.length} Fix Cycles` : 'Clean Baseline'}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Visual Diff + Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Side-by-Side Screenshot Diff Viewer */}
        <div className="lg:col-span-2 space-y-8">
          <ScreenshotDiffViewer
            runId={run._id}
            pageName={activePage}
            viewport={activeViewport}
            latestFixAttempt={latestFix}
          />

          {/* VLM Inspection JSON Inspector */}
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

        {/* Right 1 Col: Self-Healing Timeline + PR Action Card */}
        <div className="space-y-8">
          {/* Pull Request Review & Approval Card */}
          <PullRequestCard
            pullRequest={pullRequest}
            runId={run._id}
            onDecision={async (decision, reason) => {
              await decisionMutation.mutateAsync({ decision, reason });
            }}
          />

          {/* Iterative Self-Healing Timeline */}
          <SelfHealingTimeline fixAttempts={fixAttempts} />
        </div>
      </div>
    </div>
  );
};
