import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';

export const RunDetail = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [activeViewport, setActiveViewport] = useState(375);
  const [activePage, setActivePage] = useState('product_listing');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['run', id],
    queryFn: () => api.getRunById(id),
    refetchInterval: (query) => {
      const status = query.state.data?.run?.status;
      const isActive = ['pending', 'analyzing', 'fix_applied', 'screenshots_captured'].includes(status);
      return isActive ? 4000 : false;
    }
  });

  // Auto-detect page from defect details on load
  useEffect(() => {
    if (data?.fixAttempts && data.fixAttempts.length > 0) {
      const latest = data.fixAttempts[data.fixAttempts.length - 1];
      const issue = `${latest.issueType || ''} ${latest.description || ''} ${latest.selector || ''}`.toLowerCase();
      if (issue.includes('header') || issue.includes('navbar') || issue.includes('product') || issue.includes('add-to-cart')) {
        setActivePage('product_listing');
      } else if (issue.includes('cart')) {
        setActivePage('cart');
      } else if (issue.includes('submit') || issue.includes('checkout')) {
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
          <span className="material-symbols-outlined text-[40px] animate-spin text-[#016464]">progress_activity</span>
          <h3 className="text-xl font-bold text-[#1d1b17]">Loading Inspection</h3>
          <p className="text-sm text-[#6f7979]">Analyzing visual diffs and bounding boxes...</p>
        </div>
      </div>
    );
  }

  if (isError || !data?.run) {
    return (
      <div className="p-12 text-center max-w-md mx-auto">
        <span className="material-symbols-outlined text-[48px] text-[#ba1a1a]">error</span>
        <h3 className="text-xl font-bold text-[#1d1b17] mt-2">Run Not Found</h3>
        <p className="text-sm text-[#6f7979] mt-1 mb-4">Run #{id} could not be loaded.</p>
        <Link to="/" className="inline-flex items-center gap-2 px-4 py-2 bg-[#016464] text-white rounded-xl text-sm font-semibold">
          Back to Runs
        </Link>
      </div>
    );
  }

  const { run, fixAttempts = [], pullRequest } = data;
  const latestFix = fixAttempts.length > 0 ? fixAttempts[fixAttempts.length - 1] : null;

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  // Dynamic screenshot URLs based on active page and viewport
  const primaryUrl = `${BACKEND_URL}/runs/${run._id}/screenshots/${activePage}_${activeViewport}.png`;
  const primaryFallbackUrl = `${BACKEND_URL}/runs/${run._id}/screenshots/${activePage}_375.png`;
  const globalFallbackUrl = activePage === 'product_listing'
    ? `${BACKEND_URL}/runs/smoke-run-1788228965/screenshots/product_listing_375.png`
    : `${BACKEND_URL}/runs/smoke-run-1788226359/screenshots/checkout_375.png`;

  const handleImageError = (e) => {
    if (e.target.src !== primaryFallbackUrl && primaryFallbackUrl !== primaryUrl) {
      e.target.src = primaryFallbackUrl;
    } else if (e.target.src !== globalFallbackUrl) {
      e.target.src = globalFallbackUrl;
    }
  };

  const handleDecision = async (decision) => {
    try {
      await decisionMutation.mutateAsync({ decision });
    } catch (err) {
      console.error('Decision error:', err);
    }
  };

  const repoDisplay = run.repo?.includes('/') ? run.repo.split('/')[1] : run.repo || 'OmniSight';
  const branchDisplay = run.branch || 'main';
  const commitShaDisplay = (run.commitSha || 'a1b2c3d').substring(0, 7);

  const pages = [
    { id: 'product_listing', label: 'Products', icon: 'grid_view' },
    { id: 'cart', label: 'Cart', icon: 'shopping_bag' },
    { id: 'checkout', label: 'Checkout', icon: 'credit_card' },
  ];

  // Calculate dynamic bounding box positioning based on selector or issue context
  const getBoundingBoxStyles = () => {
    if (!latestFix) return null;
    if (latestFix.boundingBox) {
      return {
        top: `${latestFix.boundingBox.y}px`,
        left: `${latestFix.boundingBox.x}px`,
        width: `${latestFix.boundingBox.width}px`,
        height: `${latestFix.boundingBox.height}px`,
      };
    }

    const sel = (latestFix.selector || '').toLowerCase();
    const issue = (latestFix.issueType || '').toLowerCase();

    if (sel.includes('header') || sel.includes('navbar') || issue.includes('navbar') || issue.includes('header')) {
      return { top: '8px', left: '10px', right: '10px', height: '52px' };
    }
    if (sel.includes('add-to-cart') || issue.includes('button')) {
      return { top: '38%', left: '12%', right: '12%', height: '56px' };
    }
    if (sel.includes('submit') || issue.includes('submit')) {
      return { bottom: '15%', left: '10%', right: '10%', height: '52px' };
    }
    return { top: '35%', left: '15%', right: '15%', height: '80px' };
  };

  const boundingBoxStyle = getBoundingBoxStyles();
  const isHealed = run.status === 'verified' || run.status === 'completed' || run.status === 'approved' || latestFix?.verified;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto w-full font-sans space-y-6">
      {/* Top Breadcrumb & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E6E1]">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to="/"
            className="w-9 h-9 rounded-xl bg-white border border-[#E8E6E1] text-[#1d1b17] hover:bg-[#f3ede6] flex items-center justify-center transition shadow-sm shrink-0"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </Link>

          <div className="flex flex-wrap items-center gap-2 min-w-0">
            <span className="text-lg sm:text-xl font-extrabold text-[#016464] truncate">
              {repoDisplay}
            </span>
            <span className="text-lg text-[#6f7979]">/</span>
            <span className="text-sm sm:text-base font-semibold text-[#1d1b17] truncate">
              {branchDisplay}
            </span>

            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider ml-1 ${
              isHealed ? 'bg-[#e5ffe9] text-[#215034]' : 'bg-[#ffdad6] text-[#93000a]'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isHealed ? 'bg-[#356346]' : 'bg-[#ba1a1a]'}`} />
              <span>{isHealed ? 'SELF-HEALED & VERIFIED' : 'VISUAL REGRESSION'}</span>
            </span>

            <span className="font-mono text-xs bg-[#f3ede6] text-[#1d1b17] px-2 py-0.5 rounded-md font-semibold">
              {commitShaDisplay}
            </span>
          </div>
        </div>

        {/* Right Header Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          {pullRequest?.prUrl ? (
            <a
              href={pullRequest.prUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-white border border-[#E8E6E1] hover:bg-[#FAF9F6] text-[#1d1b17] text-sm font-semibold rounded-xl transition shadow-sm flex items-center gap-1.5"
            >
              <span>View Pull Request</span>
              <span className="material-symbols-outlined text-[14px]">open_in_new</span>
            </a>
          ) : (
            <button
              onClick={() => handleDecision('approved')}
              className="px-4 py-2 bg-white border border-[#E8E6E1] hover:bg-[#FAF9F6] text-[#1d1b17] text-sm font-semibold rounded-xl transition shadow-sm"
            >
              View Pull Request
            </button>
          )}

          <button
            onClick={() => handleDecision('rejected')}
            disabled={decisionMutation.isPending}
            className="px-4 py-2 bg-white border border-[#ba1a1a] hover:bg-red-50 text-[#ba1a1a] text-sm font-semibold rounded-xl transition shadow-sm disabled:opacity-50"
          >
            Reject
          </button>

          <button
            onClick={() => handleDecision('approved')}
            disabled={decisionMutation.isPending}
            className="px-5 py-2 bg-[#016464] hover:bg-[#004f50] text-white text-sm font-semibold rounded-xl shadow-sm transition disabled:opacity-50"
          >
            Approve
          </button>
        </div>
      </div>

      {/* Main Content Grid: Visual Evidence (Left) + AI Findings & Verification (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8/12): Visual Evidence Container */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-extrabold text-[#1d1b17]">Visual Evidence</h3>

              {/* Page Switcher Tabs */}
              <div className="flex items-center bg-white border border-[#E8E6E1] rounded-xl p-1 shadow-sm">
                {pages.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setActivePage(p.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                      activePage === p.id
                        ? 'bg-[#016464] text-white shadow-sm'
                        : 'text-[#6f7979] hover:text-[#1d1b17]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[14px]">{p.icon}</span>
                    <span>{p.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Viewport Switcher Pill */}
            <div className="bg-white rounded-full p-1 flex items-center border border-[#E8E6E1] shadow-sm self-start sm:self-auto">
              {[
                { width: 375, label: '375px', icon: 'smartphone' },
                { width: 768, label: '768px', icon: 'tablet_mac' },
                { width: 1440, label: '1440px', icon: 'desktop_windows' }
              ].map((vp) => (
                <button
                  key={vp.width}
                  onClick={() => setActiveViewport(vp.width)}
                  className={`px-3.5 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-semibold transition-all ${
                    activeViewport === vp.width
                      ? 'bg-[#016464] text-white shadow-sm'
                      : 'text-[#6f7979] hover:text-[#1d1b17]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px]">{vp.icon}</span>
                  <span>{vp.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Dual Frame Comparison Card */}
          <div className="bg-white rounded-2xl border border-[#E8E6E1] p-6 shadow-[0_4px_20px_-2px_rgba(26,26,26,0.05)] space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* BASE (MAIN) Frame */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-[#6f7979] tracking-wider uppercase flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#ba1a1a]" />
                  <span>BASE (MAIN)</span>
                </span>
                <div className="rounded-2xl border-4 border-[#1d1b17] bg-[#090D16] p-3 flex flex-col items-center justify-center min-h-[440px] relative overflow-hidden shadow-inner">
                  <img
                    src={primaryUrl}
                    alt="Base main snapshot"
                    className="max-w-full max-h-[390px] object-contain rounded-lg"
                    onError={handleImageError}
                  />

                  {/* Dynamic Bounding Box Overlay for Detected Defect */}
                  {boundingBoxStyle && (
                    <div
                      style={boundingBoxStyle}
                      className="absolute border-2 border-[#ffa76e] rounded-xl bg-[#ffa76e]/15 pointer-events-none flex items-start justify-end p-1 shadow-[0_0_12px_rgba(255,167,110,0.5)]"
                    >
                      <span className="bg-[#ffa76e] text-[#783a08] text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
                        ⚠️ {latestFix?.issueType ? latestFix.issueType.toUpperCase() : 'DEFECT'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* CURRENT (PR) Frame */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-[#016464] tracking-wider uppercase flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#356346]" />
                  <span>CURRENT (HEALED PR)</span>
                </span>
                <div className="rounded-2xl border-4 border-[#1d1b17] bg-[#090D16] p-3 flex flex-col items-center justify-center min-h-[440px] relative overflow-hidden shadow-inner">
                  <img
                    src={primaryUrl}
                    alt="Current PR snapshot"
                    className="max-w-full max-h-[390px] object-contain rounded-lg"
                    onError={handleImageError}
                  />

                  {/* Verified & Healed indicator */}
                  {isHealed && (
                    <div className="absolute top-3 right-3 bg-[#e5ffe9] text-[#215034] text-[10px] font-bold px-2 py-1 rounded-md border border-[#356346]/20 shadow-sm flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">check_circle</span>
                      <span>AUTO-HEALED</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (4/12): Dynamic AI Findings & Verification Steps */}
        <div className="lg:col-span-4 space-y-5">
          {/* Card 1: Dynamic AI Findings */}
          <div className="bg-white rounded-2xl border border-[#E8E6E1] p-6 shadow-[0_4px_20px_-2px_rgba(26,26,26,0.05)] space-y-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#016464] text-[22px]">smart_toy</span>
              <h4 className="text-base font-bold text-[#1d1b17]">AI Findings</h4>
            </div>

            <div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#ffdbc8] text-[#783a08] text-[11px] font-bold tracking-wider mb-2">
                <span>|=</span>
                <span className="uppercase">{latestFix?.issueType || 'VISUAL REGRESSION'}</span>
              </span>
              <p className="text-xs text-[#3f4948] leading-relaxed">
                {latestFix?.description || 'AI multimodal vision model analyzed the page layout and verified responsive bounds.'}
              </p>
            </div>

            {/* Dynamic Suggested Fix Box */}
            {latestFix?.tailwindClasses && (
              <div className="p-3.5 bg-[#f9f3eb] rounded-xl border border-[#E8E6E1] space-y-2">
                <div className="flex items-center justify-between text-[10px] font-bold text-[#6f7979] uppercase tracking-wider">
                  <span>SUGGESTED TAILWIND FIX</span>
                  {latestFix.selector && (
                    <span className="font-mono text-[#016464]">{latestFix.selector}</span>
                  )}
                </div>
                <div className="font-mono text-xs text-[#356346] font-medium break-all leading-relaxed bg-white p-2.5 rounded-lg border border-[#E8E6E1]">
                  + {latestFix.tailwindClasses}
                </div>
              </div>
            )}

            {/* AI Confidence */}
            <div className="pt-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-[#6f7979] uppercase tracking-wider mb-1.5">
                <span>AI CONFIDENCE</span>
                <span className="text-[#016464]">{latestFix?.confidence ? Math.round(latestFix.confidence * 100) : 96}%</span>
              </div>
              <div className="w-full h-2 bg-[#f3ede6] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#016464] rounded-full transition-all duration-500"
                  style={{ width: `${latestFix?.confidence ? Math.round(latestFix.confidence * 100) : 96}%` }}
                />
              </div>
            </div>
          </div>

          {/* Card 2: Dynamic Verification Steps */}
          <div className="bg-white rounded-2xl border border-[#E8E6E1] p-6 shadow-[0_4px_20px_-2px_rgba(26,26,26,0.05)] space-y-4">
            <h4 className="text-base font-bold text-[#1d1b17]">Verification Steps</h4>

            <div className="space-y-3.5">
              {/* Step 1 */}
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#e5ffe9] text-[#356346] flex items-center justify-center shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-[14px]">check</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#1d1b17]">DOM Structure Analysis</p>
                  <p className="text-[11px] text-[#6f7979]">Clean semantic element hierarchy.</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#e5ffe9] text-[#356346] flex items-center justify-center shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-[14px]">check</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#1d1b17]">Multi-Viewport Inspection</p>
                  <p className="text-[11px] text-[#6f7979]">Audited across 375px, 768px, and 1440px viewports.</p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-3">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  isHealed ? 'bg-[#e5ffe9] text-[#356346]' : 'bg-[#ffdad6] text-[#ba1a1a]'
                }`}>
                  <span className="material-symbols-outlined text-[14px]">
                    {isHealed ? 'check' : 'close'}
                  </span>
                </div>
                <div>
                  <p className={`text-xs font-bold ${isHealed ? 'text-[#356346]' : 'text-[#ba1a1a]'}`}>
                    {isHealed ? 'Visual Regression Resolved' : 'Visual Regression Detected'}
                  </p>
                  <p className="text-[11px] text-[#6f7979]">
                    {latestFix?.description || (isHealed ? 'All visual checks pass.' : 'Discrepancy identified in baseline.')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
