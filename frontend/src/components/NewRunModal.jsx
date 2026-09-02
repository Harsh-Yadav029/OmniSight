import React, { useState } from 'react';

export const NewRunModal = ({ isOpen, onClose, onTrigger, isTriggering }) => {
  const [targetUrl, setTargetUrl] = useState('https://omni-sight-seven.vercel.app');
  const [repo, setRepo] = useState('Harsh-Yadav029/OmniSight');
  const [branch, setBranch] = useState('main');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in font-sans">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden transform transition-all animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#016464] text-white flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[20px]">add_circle</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#1d1b17]">Start New Visual Audit</h3>
              <p className="text-xs text-[#6f7979]">Scan any live URL or repository for visual regressions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center transition"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Quick Presets */}
        <div className="px-6 pt-4 flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Presets:</span>
          <button
            type="button"
            onClick={() => setPreset('demo')}
            className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-[#016464] text-xs font-semibold border border-teal-200/60 transition"
          >
            🚀 Live TinyCart Demo
          </button>
          <button
            type="button"
            onClick={() => setPreset('local')}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition"
          >
            💻 Local Dev (:5173)
          </button>
          <button
            type="button"
            onClick={() => setPreset('custom')}
            className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold border border-amber-200 transition"
          >
            🌐 Custom Website
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] shrink-0">error</span>
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Target Website URL <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">
                language
              </span>
              <input
                type="url"
                required
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="https://my-app.com or https://staging.mysite.com"
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#016464] focus:bg-white transition"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Playwright will capture and audit Mobile (375px), Tablet (768px), and Desktop (1440px) snapshots.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                GitHub Repository
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">
                  folder_git
                </span>
                <input
                  type="text"
                  value={repo}
                  onChange={(e) => setRepo(e.target.value)}
                  placeholder="username/repo-name"
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#016464] focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Branch
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">
                  fork_right
                </span>
                <input
                  type="text"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  placeholder="main"
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#016464] focus:bg-white transition"
                />
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isTriggering}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-semibold rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isTriggering}
              className="px-5 py-2 bg-[#016464] hover:bg-[#004f50] text-white text-sm font-bold rounded-xl shadow-md transition flex items-center gap-2 disabled:opacity-50"
            >
              {isTriggering ? (
                <>
                  <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                  <span>Launching Audit...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">play_arrow</span>
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
