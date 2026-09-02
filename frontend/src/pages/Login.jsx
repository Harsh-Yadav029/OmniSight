import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Login = () => {
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register' | 'demo'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('qa_manager');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleRealAuthSubmit = async (e) => {
    e?.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (authMode === 'register') {
        if (!name.trim()) {
          throw new Error('Please enter your full name.');
        }
        if (!email.trim() || !password) {
          throw new Error('Email and password are required.');
        }
        await register(name.trim(), email.trim(), password, role);
        navigate('/');
      } else {
        if (!email.trim() || !password) {
          throw new Error('Email and password are required.');
        }
        await login(email.trim(), password);
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleInstantDemoLogin = async (demoRole) => {
    setError('');
    setLoading(true);
    const demoEmail = demoRole === 'qa_manager' ? 'qa_manager@omnisight.dev' : 'viewer@omnisight.dev';
    const demoPassword = 'password123';

    try {
      await login(demoEmail, demoPassword);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Demo login failed. Please verify server connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Soft radial ambient background gradients */}
      <div className="absolute top-1/3 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-[#016464]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/3 translate-y-1/3 w-[500px] h-[500px] bg-[#ffa76e]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <div className="w-full max-w-md text-center mb-6 relative z-10">
        <div className="w-12 h-12 rounded-2xl bg-white border border-[#E8E6E1] shadow-sm flex items-center justify-center mx-auto mb-3">
          <div className="w-7 h-7 rounded-lg bg-[#016464] flex items-center justify-center text-white font-bold text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#016464] tracking-tight flex items-center justify-center gap-1.5">
          OmniSight <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-teal-50 text-[#016464] border border-teal-200">QA</span>
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-[#6f7979] font-medium">
          Autonomous Visual Regression & Self-Healing
        </p>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-md relative z-10 space-y-4">
        {/* Navigation Mode Tabs */}
        <div className="grid grid-cols-3 rounded-2xl bg-slate-200/70 p-1 border border-slate-300/60 shadow-inner">
          <button
            type="button"
            onClick={() => { setAuthMode('login'); setError(''); }}
            className={`py-2 text-xs font-bold rounded-xl transition ${
              authMode === 'login'
                ? 'bg-white text-[#016464] shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('register'); setError(''); }}
            className={`py-2 text-xs font-bold rounded-xl transition ${
              authMode === 'register'
                ? 'bg-white text-[#016464] shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Register
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('demo'); setError(''); }}
            className={`py-2 text-xs font-bold rounded-xl transition ${
              authMode === 'demo'
                ? 'bg-[#016464] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Demo Access
          </button>
        </div>

        {/* Card Content */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E6E1] shadow-[0_4px_20px_-2px_rgba(26,26,26,0.05)]">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium flex items-center gap-2 mb-5">
              <svg className="w-4 h-4 shrink-0 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* SECTION 1: REAL USER LOGIN */}
          {authMode === 'login' && (
            <form onSubmit={handleRealAuthSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-[#6f7979] tracking-wider uppercase mb-1.5">
                  WORK EMAIL <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-[#E8E6E1] rounded-xl text-sm text-[#1d1b17] placeholder-[#bec9c8] focus:outline-none focus:border-[#016464] focus:ring-2 focus:ring-[#016464]/10 transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#6f7979] tracking-wider uppercase mb-1.5">
                  PASSWORD <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-[#E8E6E1] rounded-xl text-sm text-[#1d1b17] placeholder-[#bec9c8] focus:outline-none focus:border-[#016464] focus:ring-2 focus:ring-[#016464]/10 transition"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-[#016464] hover:bg-[#004f50] text-white font-bold text-sm rounded-xl shadow-sm hover:shadow transition flex items-center justify-center gap-2 group disabled:opacity-50 mt-2"
              >
                <span>{loading ? 'Signing in...' : 'Sign In'}</span>
                <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>

              <div className="pt-3 border-t border-slate-100 text-center">
                <button
                  type="button"
                  onClick={() => setAuthMode('demo')}
                  className="text-xs font-semibold text-[#016464] hover:underline"
                >
                  Want to explore first? Try Instant Demo Access
                </button>
              </div>
            </form>
          )}

          {/* SECTION 2: REAL USER REGISTRATION */}
          {authMode === 'register' && (
            <form onSubmit={handleRealAuthSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-[#6f7979] tracking-wider uppercase mb-1.5">
                  FULL NAME <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Morgan"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-[#E8E6E1] rounded-xl text-sm text-[#1d1b17] placeholder-[#bec9c8] focus:outline-none focus:border-[#016464] focus:ring-2 focus:ring-[#016464]/10 transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#6f7979] tracking-wider uppercase mb-1.5">
                  WORK EMAIL <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-[#E8E6E1] rounded-xl text-sm text-[#1d1b17] placeholder-[#bec9c8] focus:outline-none focus:border-[#016464] focus:ring-2 focus:ring-[#016464]/10 transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#6f7979] tracking-wider uppercase mb-1.5">
                  PASSWORD <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-[#E8E6E1] rounded-xl text-sm text-[#1d1b17] placeholder-[#bec9c8] focus:outline-none focus:border-[#016464] focus:ring-2 focus:ring-[#016464]/10 transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#6f7979] tracking-wider uppercase mb-1.5">
                  ROLE
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-[#E8E6E1] rounded-xl text-sm text-[#1d1b17] focus:outline-none focus:border-[#016464] focus:ring-2 focus:ring-[#016464]/10 transition"
                >
                  <option value="qa_manager">QA Manager (Full Review & PR Control)</option>
                  <option value="viewer">Viewer (Read-Only Inspection)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-[#016464] hover:bg-[#004f50] text-white font-bold text-sm rounded-xl shadow-sm hover:shadow transition flex items-center justify-center gap-2 group disabled:opacity-50 mt-2"
              >
                <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
                <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </form>
          )}

          {/* SECTION 3: INSTANT DEMO ACCESS */}
          {authMode === 'demo' && (
            <div className="space-y-4">
              <div className="p-3 bg-teal-50/60 border border-teal-200/60 rounded-2xl text-center">
                <h4 className="text-xs font-bold text-[#016464] uppercase tracking-wider">Instant Demo Mode</h4>
                <p className="text-xs text-[#6f7979] mt-0.5">Explore the live visual QA engine with 1-click pre-seeded profiles.</p>
              </div>

              {/* QA Manager Profile Card */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#016464] text-white flex items-center justify-center font-bold text-xs">
                      QA
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#1d1b17]">QA Manager</h4>
                      <p className="text-xs text-slate-500">qa_manager@omnisight.dev</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-teal-100 text-[#016464] text-[10px] font-bold rounded-md">
                    Full Control
                  </span>
                </div>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleInstantDemoLogin('qa_manager')}
                  className="w-full py-2 bg-[#016464] hover:bg-[#004f50] text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                  <span>Launch as QA Manager</span>
                </button>
              </div>

              {/* Viewer Profile Card */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-slate-700 text-white flex items-center justify-center font-bold text-xs">
                      V
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#1d1b17]">Viewer</h4>
                      <p className="text-xs text-slate-500">viewer@omnisight.dev</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-slate-200 text-slate-700 text-[10px] font-bold rounded-md">
                    Read-Only
                  </span>
                </div>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleInstantDemoLogin('viewer')}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                  <span>Launch as Viewer</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
