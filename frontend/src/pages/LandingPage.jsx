import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PublicNav } from '../components/PublicNav';
import { PublicFooter } from '../components/PublicFooter';
import { useAuth } from '../context/AuthContext';

export const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const [activeViewport, setActiveViewport] = useState('desktop');
  const [activeDiffMode, setActiveDiffMode] = useState('healed');

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF8] text-[#1A1A1A] font-sans antialiased selection:bg-[#016464] selection:text-white">
      {/* Public Header */}
      <PublicNav />

      {/* Hero Section */}
      <section className="pt-16 sm:pt-24 pb-16 px-6 sm:px-8 text-center max-w-6xl mx-auto">
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-[#1A1A1A] tracking-tight leading-[1.08] max-w-4xl mx-auto">
          Never let a broken layout<br className="hidden sm:inline" /> reach production again.
        </h1>

        <p className="mt-6 text-base sm:text-xl text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed">
          OmniSight crawls your app across viewports, audits with Gemini Vision, and self-heals your Tailwind CSS automatically.
        </p>

        {/* Hero Actions */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to={isAuthenticated ? '/app' : '/login'}
            className="w-full sm:w-auto px-7 py-3.5 bg-[#016464] hover:bg-[#004f50] text-white font-bold text-base rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
          >
            {isAuthenticated ? 'Launch App' : 'Get Started'}
          </Link>
          <a
            href="#bento-grid"
            className="w-full sm:w-auto px-7 py-3.5 bg-white hover:bg-slate-50 text-slate-800 font-bold text-base rounded-xl border border-slate-300/80 shadow-sm transition-all flex items-center justify-center gap-2.5"
          >
            <svg className="w-4 h-4 text-[#016464]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            <span>Watch Demo</span>
          </a>
        </div>
      </section>

      {/* Bento Grid Features Showcase */}
      <section id="bento-grid" className="pb-24 px-6 sm:px-8 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

          {/* CARD 1: Multimodal Vision (7 Cols on desktop) */}
          <div className="md:col-span-7 bg-white rounded-3xl p-7 sm:p-8 border border-[#E8E6E1] shadow-sm flex flex-col justify-between hover:shadow-md transition">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E5FFE9] text-[#016464] text-xs font-bold uppercase tracking-wider mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-[#016464]" />
                <span>VISION</span>
              </div>
              <h3 className="text-2xl font-black text-[#1A1A1A] tracking-tight mb-2">
                Multimodal Vision
              </h3>
              <p className="text-sm text-slate-600 font-medium leading-relaxed mb-6">
                Analyze pixel screenshots with Gemini Flash. Detects minute layout shifts and un-styled elements instantly.
              </p>
            </div>

            {/* Simulated Code Window */}
            <div className="bg-[#0B0F19] rounded-2xl p-6 text-slate-300 font-mono text-xs sm:text-sm leading-relaxed border border-slate-800 shadow-inner overflow-x-auto">
              <p className="text-slate-500">// Simulated Inspection View</p>
              <p className="mt-1">
                <span className="text-cyan-400 font-bold">await</span> OmniSight.<span className="text-indigo-300 font-bold">audit</span>({'{'}
              </p>
              <p className="pl-4">
                viewport: <span className="text-amber-300">'desktop'</span>,
              </p>
              <p className="pl-4">
                model: <span className="text-emerald-300">'gemini-1.5-flash'</span>
              </p>
              <p>{'}'});</p>
            </div>
          </div>

          {/* CARD 2: Self-Healing (5 Cols on desktop) */}
          <div className="md:col-span-5 bg-white rounded-3xl p-7 sm:p-8 border border-[#E8E6E1] shadow-sm flex flex-col justify-between hover:shadow-md transition">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF1E8] text-[#D95B1A] text-xs font-bold uppercase tracking-wider mb-4">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>HEAL</span>
              </div>
              <h3 className="text-2xl font-black text-[#1A1A1A] tracking-tight mb-2">
                Self-Healing
              </h3>
              <p className="text-sm text-slate-600 font-medium leading-relaxed mb-6">
                Autonomously generates surgical CSS patches to fix broken layouts.
              </p>
            </div>

            {/* Diff Box */}
            <div className="p-4 rounded-2xl bg-[#FFF8F3] border border-[#FFE7D6] space-y-3">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-slate-600 font-bold">Detected</span>
                <span className="px-2.5 py-1 bg-[#FDE8E8] text-[#C53030] font-mono font-bold rounded-lg border border-red-200">
                  pt-4
                </span>
              </div>
              <div className="flex items-center justify-between text-xs font-medium pt-2 border-t border-[#FFE7D6]">
                <span className="text-slate-600 font-bold">Proposed</span>
                <span className="px-2.5 py-1 bg-[#DDF5E6] text-[#22543D] font-mono font-bold rounded-lg border border-emerald-200">
                  py-8 lg:py-12
                </span>
              </div>
            </div>
          </div>

          {/* CARD 3: PR Engine (5 Cols on desktop) */}
          <div className="md:col-span-5 bg-white rounded-3xl p-7 sm:p-8 border border-[#E8E6E1] shadow-sm flex flex-col justify-between hover:shadow-md transition">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E5F6F6] text-[#016464] text-xs font-bold uppercase tracking-wider mb-4">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>AUTOMATION</span>
              </div>
              <h3 className="text-2xl font-black text-[#1A1A1A] tracking-tight mb-2">
                PR Engine
              </h3>
              <p className="text-sm text-slate-600 font-medium leading-relaxed mb-6">
                Opens ready-to-merge GitHub Pull Requests with visual diffs attached.
              </p>
            </div>

            {/* PR Mockup Badge */}
            <div className="p-4 rounded-2xl bg-slate-100/80 border border-slate-200 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#016464] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-[#1A1A1A] truncate">Fix: Header alignment</p>
                <p className="text-xs text-slate-500 truncate font-medium">omnisight-bot authored</p>
              </div>
            </div>
          </div>

          {/* CARD 4: QA Dashboard (7 Cols on desktop) */}
          <div className="md:col-span-7 bg-white rounded-3xl p-7 sm:p-8 border border-[#E8E6E1] shadow-sm flex flex-col justify-between hover:shadow-md transition">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3EDE6] text-[#6F7979] text-xs font-bold uppercase tracking-wider mb-4">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>REVIEW</span>
              </div>
              <h3 className="text-2xl font-black text-[#1A1A1A] tracking-tight mb-2">
                QA Dashboard
              </h3>
              <p className="text-sm text-slate-600 font-medium leading-relaxed mb-6">
                Dark-mode review portal with viewport switchers to inspect every angle.
              </p>
            </div>

            {/* Interactive Dark Review Portal Mockup */}
            <div className="bg-[#0B0F19] rounded-2xl p-4 sm:p-6 border border-slate-800 shadow-inner space-y-4">
              {/* Viewport Pill Switcher */}
              <div className="flex justify-center">
                <div className="bg-slate-900/90 rounded-full p-1 border border-slate-800 flex items-center">
                  <button
                    type="button"
                    onClick={() => setActiveViewport('desktop')}
                    className={`px-3.5 py-1 rounded-full text-xs font-bold transition ${
                      activeViewport === 'desktop'
                        ? 'bg-[#016464] text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Desktop 1280px
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveViewport('mobile')}
                    className={`px-3.5 py-1 rounded-full text-xs font-bold transition ${
                      activeViewport === 'mobile'
                        ? 'bg-[#016464] text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Mobile 375px
                  </button>
                </div>
              </div>

              {/* Original vs Healed Display Box */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveDiffMode('original')}
                  className={`py-2 text-center rounded-xl text-xs font-bold uppercase tracking-wider transition ${
                    activeDiffMode === 'original'
                      ? 'bg-slate-800 text-slate-200 border border-slate-700'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  ORIGINAL
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDiffMode('healed')}
                  className={`py-2 text-center rounded-xl text-xs font-bold uppercase tracking-wider transition ${
                    activeDiffMode === 'healed'
                      ? 'bg-[#016464]/30 text-teal-300 border border-[#016464]'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  HEALED
                </button>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Public Footer */}
      <PublicFooter />
    </div>
  );
};
