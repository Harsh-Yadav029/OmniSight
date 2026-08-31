import React, { useState } from 'react';
import { Maximize2, Sparkles, ImageOff, Layers, CheckCircle2 } from 'lucide-react';

export const ScreenshotDiffViewer = ({ runId, pageName = 'checkout', viewport = 375, latestFixAttempt }) => {
  const [activeTab, setActiveTab] = useState('split'); // 'split' | 'before' | 'after'
  const [zoomImage, setZoomImage] = useState(null);

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  // Format screenshot URLs
  const beforeUrl = `${BACKEND_URL}/runs/${runId}/screenshots/${pageName}_${viewport}.png`;
  const afterUrl = `${BACKEND_URL}/runs/${runId}/screenshots/${pageName}_${viewport}.png`;

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Visual Regression Inspection</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Inspecting <span className="font-semibold text-slate-200">{pageName}</span> @ {viewport}px viewport
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center p-1 bg-slate-950 border border-slate-800 rounded-xl text-xs font-medium text-slate-400">
          <button
            onClick={() => setActiveTab('split')}
            className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'split' ? 'bg-indigo-600 text-white font-semibold shadow' : 'hover:text-white'}`}
          >
            Side-by-Side
          </button>
          <button
            onClick={() => setActiveTab('before')}
            className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'before' ? 'bg-indigo-600 text-white font-semibold shadow' : 'hover:text-white'}`}
          >
            Before Fix
          </button>
          <button
            onClick={() => setActiveTab('after')}
            className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'after' ? 'bg-indigo-600 text-white font-semibold shadow' : 'hover:text-white'}`}
          >
            After Fix
          </button>
        </div>
      </div>

      {/* Screenshot Comparison Grid */}
      <div className={`grid gap-6 ${activeTab === 'split' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
        {/* BEFORE FIX */}
        {(activeTab === 'split' || activeTab === 'before') && (
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                Original Build (Defect Present)
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                {pageName}_{viewport}.png
              </span>
            </div>

            <div className="relative group bg-slate-950 border border-slate-800 rounded-xl overflow-hidden min-h-[360px] flex items-center justify-center">
              <img
                src={beforeUrl}
                alt="Before Fix Snapshot"
                className="w-full h-auto max-h-[500px] object-contain mx-auto"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="hidden flex-col items-center justify-center p-8 text-center text-slate-500">
                <ImageOff className="w-8 h-8 mb-2 text-slate-600" />
                <p className="text-xs">Initial snapshot not generated</p>
              </div>

              <button
                onClick={() => setZoomImage(beforeUrl)}
                className="absolute top-3 right-3 p-2 bg-slate-900/80 backdrop-blur hover:bg-slate-800 text-white rounded-lg opacity-0 group-hover:opacity-100 transition shadow-lg"
                title="Expand screenshot"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* AFTER FIX */}
        {(activeTab === 'split' || activeTab === 'after') && (
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Autonomous Self-Healed Build
              </span>
              <span className="text-[11px] text-emerald-500/80 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Verified Clean
              </span>
            </div>

            <div className="relative group bg-slate-950 border border-emerald-500/30 rounded-xl overflow-hidden min-h-[360px] flex items-center justify-center ring-1 ring-emerald-500/20">
              <img
                src={afterUrl}
                alt="After Fix Snapshot"
                className="w-full h-auto max-h-[500px] object-contain mx-auto"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="hidden flex-col items-center justify-center p-8 text-center text-slate-500">
                <ImageOff className="w-8 h-8 mb-2 text-slate-600" />
                <p className="text-xs">Self-healed snapshot in progress</p>
              </div>

              <button
                onClick={() => setZoomImage(afterUrl)}
                className="absolute top-3 right-3 p-2 bg-slate-900/80 backdrop-blur hover:bg-slate-800 text-white rounded-lg opacity-0 group-hover:opacity-100 transition shadow-lg"
                title="Expand screenshot"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Zoom Viewer */}
      {zoomImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setZoomImage(null)}
        >
          <div className="relative max-w-5xl max-h-[90vh] bg-slate-900 p-2 rounded-2xl border border-slate-800 shadow-2xl">
            <img src={zoomImage} alt="Zoomed view" className="max-w-full max-h-[85vh] rounded-xl object-contain" />
            <p className="text-center text-xs text-slate-400 mt-2">Click anywhere to close preview</p>
          </div>
        </div>
      )}
    </div>
  );
};
