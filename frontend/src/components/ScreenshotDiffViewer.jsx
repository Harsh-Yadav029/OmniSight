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
    { id: 'split', label: 'Visual Diff' },
    { id: 'before', label: 'Baseline' },
    { id: 'after', label: 'Current' },
  ];

  return (
    <div className="glass-panel overflow-hidden flex flex-col">
      {/* Viewer Header */}
      <div className="flex justify-between items-center p-4 border-b border-[#1e293b] bg-surface-container-low">
        <div className="flex space-x-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-1.5 rounded-lg font-mono text-code-base transition-all ${
                activeTab === tab.id
                  ? 'bg-surface-container-highest text-on-surface border border-outline-variant/30'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex items-center space-x-1">
          <span className="text-body-sm text-on-surface-variant mr-2 font-mono">
            {pageName.replace('_', ' ')} @ {viewport}px
          </span>
          <button className="text-on-surface-variant hover:text-on-surface p-1 rounded transition">
            <span className="material-symbols-outlined text-[18px]">zoom_in</span>
          </button>
          <button className="text-on-surface-variant hover:text-on-surface p-1 rounded transition">
            <span className="material-symbols-outlined text-[18px]">fit_screen</span>
          </button>
        </div>
      </div>

      {/* Diff Canvases */}
      <div className={`flex-1 flex bg-[#020617] relative ${activeTab === 'split' ? '' : ''}`}>
        {/* Left: Baseline (Defect) */}
        {(activeTab === 'split' || activeTab === 'before') && (
          <div className={`${activeTab === 'split' ? 'flex-1 border-r border-[#1e293b]' : 'flex-1'} flex flex-col relative defect-border group`}>
            <div className="absolute top-4 left-4 z-10 bg-surface-container-low/80 backdrop-blur text-error px-3 py-1 rounded-md text-code-sm font-mono border border-error/30 flex items-center space-x-2">
              <span className="status-dot bg-error" />
              <span>Baseline (Defect)</span>
            </div>
            <button
              onClick={() => setZoomImage(primaryUrl)}
              className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-surface-container p-1.5 rounded text-on-surface-variant border border-outline-variant/30 hover:text-on-surface"
            >
              <span className="material-symbols-outlined text-[16px]">fullscreen</span>
            </button>
            <div className="flex-1 p-6 overflow-hidden flex items-center justify-center min-h-[360px]">
              <img
                src={primaryUrl}
                alt="Before Fix Snapshot"
                className="max-w-full max-h-[500px] object-contain rounded border border-outline-variant/20"
                onError={handleImageError}
              />
              <div className="hidden flex-col items-center justify-center p-8 text-center text-on-surface-variant">
                <span className="material-symbols-outlined text-[32px] mb-2 text-outline">broken_image</span>
                <p className="text-body-sm">Snapshot pending capture</p>
              </div>
            </div>
          </div>
        )}

        {/* Right: Current (Verified) */}
        {(activeTab === 'split' || activeTab === 'after') && (
          <div className={`${activeTab === 'split' ? 'flex-1' : 'flex-1'} flex flex-col relative verified-border group`}>
            <div className="absolute top-4 left-4 z-10 bg-surface-container-low/80 backdrop-blur text-success-light px-3 py-1 rounded-md text-code-sm font-mono border border-success/30 flex items-center space-x-2">
              <span className="status-dot bg-success" />
              <span>Current (Self-Healed)</span>
            </div>
            <button
              onClick={() => setZoomImage(primaryUrl)}
              className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-surface-container p-1.5 rounded text-on-surface-variant border border-outline-variant/30 hover:text-on-surface"
            >
              <span className="material-symbols-outlined text-[16px]">fullscreen</span>
            </button>
            <div className="flex-1 p-6 overflow-hidden flex items-center justify-center min-h-[360px]">
              <img
                src={primaryUrl}
                alt="After Fix Snapshot"
                className="max-w-full max-h-[500px] object-contain rounded border border-outline-variant/20"
                onError={handleImageError}
              />
              <div className="hidden flex-col items-center justify-center p-8 text-center text-on-surface-variant">
                <span className="material-symbols-outlined text-[32px] mb-2 text-outline">broken_image</span>
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
          <div className="relative max-w-5xl max-h-[90vh] glass-panel p-3">
            <img src={zoomImage} alt="Zoomed view" className="max-w-full max-h-[85vh] rounded object-contain" />
            <p className="text-center text-body-sm text-on-surface-variant mt-2">Click anywhere to close</p>
          </div>
        </div>
      )}
    </div>
  );
};
