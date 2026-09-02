import React, { useState } from 'react';

export const NewRunModal = ({ isOpen, onClose, onTrigger, isTriggering }) => {
  const [targetUrl, setTargetUrl] = useState('https://omni-sight-seven.vercel.app');
  const [repo, setRepo] = useState('Harsh-Yadav029/OmniSight');
  const [branch, setBranch] = useState('main');
  const [activePreset, setActivePreset] = useState('demo');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!targetUrl.trim()) {
      setError('Target website URL is required.');
      return;
    }

    try {
      await onTrigger({
        targetUrl: targetUrl.trim(),
        repo: repo.trim() || 'Harsh-Yadav029/OmniSight',
        branch: branch.trim() || 'main',
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to trigger audit.');
    }
  };

  const setPreset = (type) => {
    setActivePreset(type);
    if (type === 'demo') {
      setTargetUrl('https://omni-sight-seven.vercel.app');
      setRepo('Harsh-Yadav029/OmniSight');
      setBranch('main');
    } else if (type === 'local') {
      setTargetUrl('http://localhost:5173');
      setRepo('Harsh-Yadav029/OmniSight');
      setBranch('main');
    } else {
      setTargetUrl('');
      setRepo('');
      setBranch('main');
    }
    setError('');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in font-sans"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#016464] text-white flex items-center justify-center shadow-sm shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-[#1d1b17] tracking-tight">Start New Visual Audit</h3>
              <p className="text-xs text-[#6f7979] font-medium">Scan any live URL or repository for visual regressions</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Quick Presets */}
        <div className="px-6 pt-5 pb-1 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">Presets:</span>
          
          <button
            type="button"
            onClick={() => setPreset('demo')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
              activePreset === 'demo'
                ? 'bg-[#016464] text-white border-[#016464] shadow-sm'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            TinyCart Demo
          </button>

          <button
            type="button"
            onClick={() => setPreset('local')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
              activePreset === 'local'
                ? 'bg-[#016464] text-white border-[#016464] shadow-sm'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            Local Dev (:5173)
          </button>

          <button
            type="button"
            onClick={() => setPreset('custom')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
              activePreset === 'custom'
                ? 'bg-[#016464] text-white border-[#016464] shadow-sm'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            Custom Website
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Target Website URL */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Target Website URL <span className="text-red-500">*</span>
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </div>
              <input
                type="url"
                required
                value={targetUrl}
                onChange={(e) => {
                  setTargetUrl(e.target.value);
                  setActivePreset('custom');
                }}
                placeholder="https://my-app.com or https://staging.mysite.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#016464] focus:bg-white transition"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              Playwright will capture and audit Mobile (375px), Tablet (768px), and Desktop (1440px) snapshots.
            </p>
          </div>

          {/* Repository & Branch Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                GitHub Repository
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={repo}
                  onChange={(e) => {
                    setRepo(e.target.value);
                    setActivePreset('custom');
                  }}
                  placeholder="username/repo-name"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#016464] focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Branch
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={branch}
                  onChange={(e) => {
                    setBranch(e.target.value);
                    setActivePreset('custom');
                  }}
                  placeholder="main"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#016464] focus:bg-white transition"
                />
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isTriggering}
              className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-semibold rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isTriggering}
              className="px-5 py-2.5 bg-[#016464] hover:bg-[#004f50] text-white text-sm font-bold rounded-xl shadow-sm hover:shadow transition flex items-center gap-2 disabled:opacity-50"
            >
              {isTriggering ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Launching Audit...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Start Audit</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
