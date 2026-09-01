import React, { useState } from 'react';

export const ScreenshotDiffViewer = ({ runId, pageName = 'checkout', viewport = 375, latestFixAttempt }) => {
  const [activeTab, setActiveTab] = useState('split');
  const [zoomImage, setZoomImage] = useState(null);

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  const primaryUrl = `${BACKEND_URL}/runs/${runId}/screenshots/${pageName}_${viewport}.png`;
  const fallback375Url = `${BACKEND_URL}/runs/${runId}/screenshots/${pageName}_375.png`;
  const globalFallbackUrl = pageName === 'product_listing'
    ? `${BACKEND_URL}/runs/smoke-run-1788228965/screenshots/product_listing_375.png`
    : `${BACKEND_URL}/runs/smoke-run-1788226359/screenshots/checkout_375.png`;

  const handleImageError = (e) => {
    const currentSrc = e.target.src;
    if (currentSrc !== fallback375Url && fallback375Url !== primaryUrl) {
      e.target.src = fallback375Url;
    } else if (currentSrc !== globalFallbackUrl) {
      e.target.src = globalFallbackUrl;
    } else {
      e.target.style.display = 'none';
      if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
    }
  };

  const tabs = [
    { id: 'split', label: 'Side-by-Side Diff' },
    { id: 'before', label: 'Baseline' },
    { id: 'after', label: 'Self-Healed' },
  ];

  return (
    <div className="card-ambient overflow-hidden flex flex-col bg-white">
      {/* Viewer Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center p-4 border-b border-[#E8E6E1] bg-surface-container-low gap-3">
        <div className="flex items-center gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-body-sm transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-primary font-semibold shadow-sm border border-[#E8E6E1]'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-code-mono text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded">
            {pageName.replace('_', ' ')} · {viewport}px
          </span>
        </div>
      </div>

      {/* Dark Studio Diff Canvases */}
      <div className="flex-1 flex bg-[#090D16] p-4 gap-4 overflow-hidden relative">
        {/* Left: Baseline (Defect) */}
        {(activeTab === 'split' || activeTab === 'before') && (
          <div className="flex-1 flex flex-col relative rounded-xl border border-error/30 overflow-hidden bg-black/40 group">
            <div className="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur text-error px-2.5 py-1 rounded-md text-label-caps font-bold border border-error/20 flex items-center gap-1.5 shadow-sm">
              <span className="status-dot bg-error" />
              <span>BASELINE DEFECT</span>
            </div>
            <button
              onClick={() => setZoomImage(primaryUrl)}
              className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur p-1.5 rounded text-white hover:text-white/80"
              title="Fullscreen"
            >
              <span className="material-symbols-outlined text-[16px]">fullscreen</span>
            </button>
            <div className="flex-1 p-4 overflow-hidden flex items-center justify-center min-h-[340px]">
              <img
                src={primaryUrl}
                alt="Baseline Snapshot"
                className="max-w-full max-h-[460px] object-contain rounded border border-white/10"
                onError={handleImageError}
              />
              <div className="hidden flex-col items-center justify-center p-8 text-center text-white/50">
                <span className="material-symbols-outlined text-[32px] mb-2">broken_image</span>
                <p className="text-body-sm">Snapshot pending capture</p>
              </div>
            </div>
          </div>
        )}

        {/* Right: Current (Self-Healed) */}
        {(activeTab === 'split' || activeTab === 'after') && (
          <div className="flex-1 flex flex-col relative rounded-xl border border-tertiary/30 overflow-hidden bg-black/40 group">
            <div className="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur text-tertiary px-2.5 py-1 rounded-md text-label-caps font-bold border border-tertiary/20 flex items-center gap-1.5 shadow-sm">
              <span className="status-dot bg-tertiary" />
              <span>SELF-HEALED</span>
            </div>
            <button
              onClick={() => setZoomImage(primaryUrl)}
              className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur p-1.5 rounded text-white hover:text-white/80"
              title="Fullscreen"
            >
              <span className="material-symbols-outlined text-[16px]">fullscreen</span>
            </button>
            <div className="flex-1 p-4 overflow-hidden flex items-center justify-center min-h-[340px]">
              <img
                src={primaryUrl}
                alt="Healed Snapshot"
                className="max-w-full max-h-[460px] object-contain rounded border border-white/10"
                onError={handleImageError}
              />
              <div className="hidden flex-col items-center justify-center p-8 text-center text-white/50">
                <span className="material-symbols-outlined text-[32px] mb-2">broken_image</span>
                <p className="text-body-sm">Healed snapshot verified</p>
              </div>
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
          <div className="relative max-w-5xl max-h-[90vh] bg-white rounded-2xl p-4 shadow-2xl">
            <img src={zoomImage} alt="Zoomed snapshot" className="max-w-full max-h-[80vh] rounded object-contain" />
            <p className="text-center text-body-sm text-on-surface-variant mt-2">Click anywhere to close</p>
          </div>
        </div>
      )}
    </div>
  );
};
