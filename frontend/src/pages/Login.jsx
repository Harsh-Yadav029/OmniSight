import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PublicNav } from '../components/PublicNav';
import { PublicFooter } from '../components/PublicFooter';

export const Login = () => {
  const [searchParams] = useSearchParams();
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('qa_manager');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (searchParams.get('tab') === 'register') {
      setAuthMode('register');
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
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
        navigate('/app');
      } else {
        if (!email.trim() || !password) {
          throw new Error('Email and password are required.');
        }
        await login(email.trim(), password);
        navigate('/app');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF8] text-[#1A1A1A] font-sans antialiased selection:bg-[#016464] selection:text-white">
      <PublicNav />

      <main className="flex-1 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Soft radial ambient background gradients */}
        <div className="absolute top-1/3 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-[#016464]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/3 translate-y-1/3 w-[500px] h-[500px] bg-[#ffa76e]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="w-full max-w-md text-center mb-6 relative z-10">
          <h1 className="text-2xl sm:text-3xl font-black text-[#1A1A1A] tracking-tight">
            {authMode === 'login' ? 'Sign in to OmniSight' : 'Create your Account'}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#6f7979] font-medium">
            {authMode === 'login'
              ? 'Enter your work email and password to access your dashboard'
              : 'Register your organization to start autonomous visual inspection'}
          </p>
        </div>

        {/* Auth Card Container */}
        <div className="w-full max-w-md relative z-10 space-y-4">
          {/* Sign In vs Register Tabs */}
          <div className="flex rounded-2xl bg-slate-200/70 p-1 border border-slate-300/60 shadow-inner">
            <button
              type="button"
              onClick={() => { setAuthMode('login'); setError(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
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
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
                authMode === 'register'
                  ? 'bg-white text-[#016464] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Register New Account
            </button>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E6E1] shadow-[0_4px_20px_-2px_rgba(26,26,26,0.05)]">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium flex items-center gap-2 mb-5">
                <svg className="w-4 h-4 shrink-0 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {authMode === 'register' && (
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
              )}

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

              {authMode === 'register' && (
                <div>
                  <label className="block text-[11px] font-bold text-[#6f7979] tracking-wider uppercase mb-1.5">
                    ROLE
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-[#E8E6E1] rounded-xl text-sm text-[#1d1b17] focus:outline-none focus:border-[#016464] focus:ring-2 focus:ring-[#016464]/10 transition"
                  >
                    <option value="qa_manager">QA Manager (Full Review & PR Authority)</option>
                    <option value="viewer">Viewer (Read-Only Inspection)</option>
                  </select>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-[#016464] hover:bg-[#004f50] text-white font-bold text-sm rounded-xl shadow-sm hover:shadow transition flex items-center justify-center gap-2 group disabled:opacity-50 mt-2"
              >
                <span>{loading ? 'Processing...' : (authMode === 'login' ? 'Sign In' : 'Create Account')}</span>
                <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </form>

            {/* Link to Dedicated Demo Page */}
            <div className="pt-4 mt-5 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-500 font-medium">
                Want to test without registering?{' '}
                <Link to="/demo" className="text-[#016464] font-bold hover:underline">
                  Launch 1-Click Demo
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
};
