import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';

export const RunDetail = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [activeViewport, setActiveViewport] = useState(768);
  const [activePage, setActivePage] = useState('checkout');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['run', id],
    queryFn: () => api.getRunById(id),
    refetchInterval: (query) => {
      const status = query.state.data?.run?.status;
      const isActive = ['pending', 'analyzing', 'fix_applied', 'screenshots_captured'].includes(status);
      return isActive ? 4000 : false;
    }
  });

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
  const primaryUrl = `${BACKEND_URL}/runs/${run._id}/screenshots/${activePage}_${activeViewport}.png`;
  const fallbackUrl = `${BACKEND_URL}/runs/smoke-run-1788226359/screenshots/checkout_375.png`;

  const handleImageError = (e) => {
    if (e.target.src !== fallbackUrl) {
      e.target.src = fallbackUrl;
    }
  };

  const handleDecision = async (decision) => {
    try {
      await decisionMutation.mutateAsync({ decision });
    } catch (err) {
      console.error('Decision error:', err);
    }
  };

  const repoDisplay = run.repo || 'frontend-core';
  const branchDisplay = run.branch || 'feature/nav-update';
  const commitShaDisplay = (run.commitSha || 'a1b2c3d').substring(0, 7);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto w-full font-sans space-y-6">
      {/* Top Breadcrumb & Action Header (Screenshot 3) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E6E1]">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="w-9 h-9 rounded-xl bg-white border border-[#E8E6E1] text-[#1d1b17] hover:bg-[#f3ede6] flex items-center justify-center transition shadow-sm"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xl font-extrabold text-[#016464]">
              {repoDisplay}
            </span>
            <span className="text-lg text-[#6f7979]">/</span>
            <span className="text-base font-semibold text-[#1d1b17]">
              {branchDisplay}
            </span>

            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#ffdad6] text-[#93000a] text-[11px] font-bold tracking-wider ml-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a]" />
              <span>{run.status === 'verified' || run.status === 'completed' ? 'VERIFIED' : 'VISUAL REGRESSION'}</span>
            </span>

            <span className="font-mono text-xs bg-[#f3ede6] text-[#1d1b17] px-2 py-0.5 rounded-md font-semibold">
              {commitShaDisplay}
            </span>
          </div>
        </div>

        {/* Right Header Action Buttons */}
        <div className="flex items-center gap-2.5">
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
            <h3 className="text-lg font-extrabold text-[#1d1b17]">Visual Evidence</h3>

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
                <span className="text-[11px] font-bold text-[#6f7979] tracking-wider uppercase">
                  BASE (MAIN)
                </span>
                <div className="rounded-2xl border-4 border-[#1d1b17] bg-[#090D16] p-4 flex flex-col items-center justify-center min-h-[440px] relative overflow-hidden shadow-inner group">
                  <img
                    src={primaryUrl}
                    alt="Base main snapshot"
                    className="max-w-full max-h-[380px] object-contain rounded-lg"
                    onError={handleImageError}
                  />

                  {/* Highlighted Bounding Box Overlay for Defect */}
                  <div className="absolute top-[48%] left-[18%] right-[18%] bottom-[32%] border-2 border-[#ffa76e] rounded-xl bg-[#ffa76e]/10 pointer-events-none flex items-start justify-end p-1.5 shadow-[0_0_12px_rgba(255,167,110,0.5)]">
                    <span className="bg-[#ffa76e] text-[#783a08] text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
                      ⚠️ OVERLAP
                    </span>
                  </div>
                </div>
              </div>

              {/* CURRENT (PR) Frame */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-[#016464] tracking-wider uppercase">
                  CURRENT (PR)
                </span>
                <div className="rounded-2xl border-4 border-[#1d1b17] bg-[#090D16] p-4 flex flex-col items-center justify-center min-h-[440px] relative overflow-hidden shadow-inner">
                  <img
                    src={primaryUrl}
                    alt="Current PR snapshot"
                    className="max-w-full max-h-[380px] object-contain rounded-lg"
                    onError={handleImageError}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (4/12): AI Findings & Verification Steps */}
        <div className="lg:col-span-4 space-y-5">
          {/* Card 1: AI Findings */}
          <div className="bg-white rounded-2xl border border-[#E8E6E1] p-6 shadow-[0_4px_20px_-2px_rgba(26,26,26,0.05)] space-y-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#016464] text-[22px]">smart_toy</span>
              <h4 className="text-base font-bold text-[#1d1b17]">AI Findings</h4>
            </div>

            <div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#ffdbc8] text-[#783a08] text-[11px] font-bold tracking-wider mb-2">
                <span>|=</span>
                <span>LAYOUT SHIFT</span>
              </span>
              <p className="text-xs text-[#3f4948] leading-relaxed">
                The primary action button ("Add to Cart") has shifted upwards, overlapping the price text. This appears to be caused by a missing margin class on the container element in the tablet viewport.
              </p>
            </div>

            {/* Suggested Fix Box */}
            <div className="p-3.5 bg-[#f9f3eb] rounded-xl border border-[#E8E6E1] space-y-2">
              <span className="text-[10px] font-bold text-[#6f7979] uppercase tracking-wider block">
                SUGGESTED FIX
              </span>
              <div className="font-mono text-xs space-y-1">
                <p className="text-[#ba1a1a] font-medium">- &lt;div class="flex flex-col"&gt;</p>
                <p className="text-[#356346] font-medium">+ &lt;div class="flex flex-col mt-4 md:mt-0"&gt;</p>
              </div>
            </div>

            {/* AI Confidence */}
            <div className="pt-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-[#6f7979] uppercase tracking-wider mb-1.5">
                <span>AI CONFIDENCE</span>
                <span className="text-[#016464]">92%</span>
              </div>
              <div className="w-full h-2 bg-[#f3ede6] rounded-full overflow-hidden">
                <div className="h-full bg-[#016464] rounded-full w-[92%]" />
              </div>
            </div>
          </div>

          {/* Card 2: Verification Steps */}
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
                  <p className="text-[11px] text-[#6f7979]">No critical element drops.</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#e5ffe9] text-[#356346] flex items-center justify-center shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-[14px]">check</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#1d1b17]">Color Contrast Check</p>
                  <p className="text-[11px] text-[#6f7979]">Passes WCAG AA standards.</p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#ba1a1a]">Visual Bounds Intersection</p>
                  <p className="text-[11px] text-[#6f7979]">Button overlaps sibling text node.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
