import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PublicNav } from '../components/PublicNav';
import { PublicFooter } from '../components/PublicFooter';

export const DemoPage = () => {
  const [loadingRole, setLoadingRole] = useState(null);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLaunchDemo = async (role) => {
    setError('');
    setLoadingRole(role);
    const email = role === 'qa_manager' ? 'qa_manager@omnisight.dev' : 'viewer@omnisight.dev';
    const password = 'password123';

    try {
      await login(email, password);
      navigate('/app');
    } catch (err) {
      setError(err.message || 'Demo launch failed. Please verify server connectivity.');
    } finally {
      setLoadingRole(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF8] text-[#1A1A1A] font-sans antialiased selection:bg-[#016464] selection:text-white">
      <PublicNav />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Soft radial ambient background gradients */}
        <div className="absolute top-1/3 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-[#016464]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/3 translate-y-1/3 w-[500px] h-[500px] bg-[#ffa76e]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="w-full max-w-lg text-center mb-8 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-[#016464] text-xs font-bold uppercase tracking-wider mb-3 border border-teal-200/60">
            <span>INSTANT DEMO ENVIRONMENT</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#1A1A1A] tracking-tight">
            Explore OmniSight in 1-Click
          </h1>
          <p className="mt-2 text-sm sm:text-base text-[#6f7979] font-medium max-w-md mx-auto">
            Choose a pre-configured persona below to test autonomous visual auditing with zero setup.
          </p>
        </div>

        {/* Demo Cards Container */}
        <div className="w-full max-w-xl relative z-10 space-y-4">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs font-medium flex items-center gap-2.5">
              <svg className="w-4 h-4 shrink-0 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Persona 1: QA Manager */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E8E6E1] shadow-sm hover:shadow-md transition">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#016464] text-white flex items-center justify-center font-extrabold text-sm shadow-sm shrink-0">
                  QA
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-[#1A1A1A]">QA Manager Persona</h3>
                    <span className="px-2 py-0.5 bg-teal-50 text-[#016464] text-[10px] font-bold rounded-md border border-teal-200">
                      Full Decision Power
                    </span>
                  </div>
                  <p className="text-xs text-[#6f7979] font-medium mt-0.5">qa_manager@omnisight.dev</p>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-600 font-medium leading-relaxed mb-5">
              Full access to launch visual regression audits, approve/reject self-healing patches, and trigger automated GitHub Pull Requests.
            </p>

            <button
              type="button"
              disabled={loadingRole !== null}
              onClick={() => handleLaunchDemo('qa_manager')}
              className="w-full py-3 bg-[#016464] hover:bg-[#004f50] text-white font-bold text-sm rounded-xl shadow-sm hover:shadow transition flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50"
            >
              {loadingRole === 'qa_manager' ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Launching QA Manager...</span>
                </>
              ) : (
                <>
                  <span>Launch Demo as QA Manager</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </div>

          {/* Persona 2: Viewer */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E8E6E1] shadow-sm hover:shadow-md transition">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-slate-800 text-white flex items-center justify-center font-extrabold text-sm shadow-sm shrink-0">
                  V
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-[#1A1A1A]">Design & Stakeholder Viewer</h3>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-md border border-slate-200">
                      Read-Only Mode
                    </span>
                  </div>
                  <p className="text-xs text-[#6f7979] font-medium mt-0.5">viewer@omnisight.dev</p>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-600 font-medium leading-relaxed mb-5">
              Read-only stakeholder mode for UI/UX designers and product managers to inspect multi-viewport diffs without triggering PR mutations.
            </p>

            <button
              type="button"
              disabled={loadingRole !== null}
              onClick={() => handleLaunchDemo('viewer')}
              className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold text-sm rounded-xl shadow-sm hover:shadow transition flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50"
            >
              {loadingRole === 'viewer' ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Launching Viewer...</span>
                </>
              ) : (
                <>
                  <span>Launch Demo as Viewer</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </div>

          {/* Switch to Real User Sign In */}
          <div className="pt-4 text-center">
            <p className="text-xs text-slate-500 font-medium">
              Have your own credentials?{' '}
              <Link to="/login" className="text-[#016464] font-bold hover:underline">
                Sign In with Real Account
              </Link>
              {' '}or{' '}
              <Link to="/login?tab=register" className="text-[#016464] font-bold hover:underline">
                Create an Account
              </Link>
            </p>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
};
