import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Login = () => {
  const [email, setEmail] = useState('qa_manager@omnisight.dev');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Soft radial ambient gradient backgrounds */}
      <div className="absolute top-1/3 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-[#2d7d7d]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/3 translate-y-1/3 w-[500px] h-[500px] bg-[#ffa76e]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <div className="w-full max-w-md text-center mb-8 relative z-10">
        <div className="w-14 h-14 rounded-2xl bg-white border border-[#E8E6E1] shadow-sm flex items-center justify-center mx-auto mb-4">
          <div className="w-8 h-8 rounded-full border-2 border-[#016464] flex items-center justify-center">
            <span className="material-symbols-outlined text-[#016464] text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              all_inclusive
            </span>
          </div>
        </div>
        <h1 className="text-3xl font-extrabold text-[#016464] tracking-tight flex items-center justify-center gap-1">
          OmniSight <span className="text-sm font-bold text-[#6f7979] tracking-normal align-super">QA</span>
        </h1>
        <p className="mt-1.5 text-sm text-[#6f7979] font-medium">
          Autonomous Inspection Platform
        </p>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md relative z-10">
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-[#E8E6E1] shadow-[0_4px_20px_-2px_rgba(26,26,26,0.05)] space-y-6">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-red-600">error</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[11px] font-bold text-[#6f7979] tracking-wider uppercase mb-2">
                WORK EMAIL
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full px-4 py-3 bg-white border border-[#E8E6E1] rounded-xl text-sm text-[#1d1b17] placeholder-[#bec9c8] focus:outline-none focus:border-[#016464] focus:ring-2 focus:ring-[#016464]/10 transition"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[11px] font-bold text-[#6f7979] tracking-wider uppercase">
                  PASSWORD
                </label>
                <button
                  type="button"
                  onClick={() => { setEmail('qa_manager@omnisight.dev'); setPassword('password123'); }}
                  className="text-xs font-semibold text-[#016464] hover:underline"
                >
                  Forgot?
                </button>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-white border border-[#E8E6E1] rounded-xl text-sm text-[#1d1b17] placeholder-[#bec9c8] focus:outline-none focus:border-[#016464] focus:ring-2 focus:ring-[#016464]/10 transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-[#016464] hover:bg-[#004f50] text-white font-semibold text-sm rounded-xl shadow-sm transition flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              <span>{loading ? 'Signing in...' : 'Sign In'}</span>
              <span className="material-symbols-outlined text-[18px] group-hover:translate-x-0.5 transition-transform">
                arrow_forward
              </span>
            </button>
          </form>

          <div className="pt-2 border-t border-[#f3ede6] flex justify-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f9f3eb] text-[#6f7979] text-xs font-medium">
              <span className="material-symbols-outlined text-[14px]">info</span>
              <span>QA Manager access only.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
