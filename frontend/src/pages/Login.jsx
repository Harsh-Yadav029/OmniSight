import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Login = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('qa_manager@omnisight.dev');
  const [password, setPassword] = useState('password123');
  const [role, setRole] = useState('qa_manager');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegistering) {
        if (!name.trim()) {
          throw new Error('Please enter your full name.');
        }
        await register(name.trim(), email.trim(), password, role);
        navigate('/');
      } else {
        await login(email.trim(), password);
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoPreset = (type) => {
    setIsRegistering(false);
    setError('');
    if (type === 'manager') {
      setEmail('qa_manager@omnisight.dev');
      setPassword('password123');
    } else {
      setEmail('viewer@omnisight.dev');
      setPassword('password123');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Background Ambience */}
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

      {/* Auth Card */}
      <div className="w-full max-w-md relative z-10">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E6E1] shadow-[0_4px_20px_-2px_rgba(26,26,26,0.05)] space-y-5">
          {/* Sign In vs Register Tabs */}
          <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200/60">
            <button
              type="button"
              onClick={() => { setIsRegistering(false); setError(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                !isRegistering
                  ? 'bg-white text-[#016464] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsRegistering(true); setError(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                isRegistering
                  ? 'bg-white text-[#016464] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Create Account
            </button>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegistering && (
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
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-bold text-[#6f7979] tracking-wider uppercase">
                  PASSWORD <span className="text-red-500">*</span>
                </label>
                {!isRegistering && (
                  <button
                    type="button"
                    onClick={() => handleDemoPreset('manager')}
                    className="text-xs font-semibold text-[#016464] hover:underline"
                  >
                    Reset Demo
                  </button>
                )}
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-slate-50 border border-[#E8E6E1] rounded-xl text-sm text-[#1d1b17] placeholder-[#bec9c8] focus:outline-none focus:border-[#016464] focus:ring-2 focus:ring-[#016464]/10 transition"
              />
            </div>

            {isRegistering && (
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
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-[#016464] hover:bg-[#004f50] text-white font-bold text-sm rounded-xl shadow-sm hover:shadow transition flex items-center justify-center gap-2 group disabled:opacity-50 mt-2"
            >
              <span>{loading ? (isRegistering ? 'Creating Account...' : 'Signing in...') : (isRegistering ? 'Create Account' : 'Sign In')}</span>
              <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </form>

          {/* Demo Login Quick Links */}
          {!isRegistering && (
            <div className="pt-3 border-t border-slate-100 flex flex-col items-center gap-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Quick Demo Login:</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDemoPreset('manager')}
                  className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-[#016464] text-xs font-semibold border border-teal-200/60 transition"
                >
                  QA Manager Demo
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoPreset('viewer')}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition"
                >
                  Viewer Demo
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
