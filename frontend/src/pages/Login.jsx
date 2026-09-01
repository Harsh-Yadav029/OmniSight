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

  const handleQuickLogin = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-primary-container selection:text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <div className="w-12 h-12 rounded-xl bg-primary-container text-white flex items-center justify-center font-extrabold text-xl mx-auto shadow-md mb-4">
          O
        </div>
        <h2 className="text-display-lg font-extrabold text-on-surface tracking-tight">
          OmniSight QA
        </h2>
        <p className="mt-2 text-body-base text-on-surface-variant max-w-sm mx-auto">
          Autonomous visual regression engine & self-healing QA platform.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="card-ambient p-8 space-y-6 bg-white">
          {error && (
            <div className="p-3.5 bg-error/10 border border-error/20 rounded-xl text-error text-body-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-error shrink-0">error</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-label-caps text-on-surface-variant font-bold mb-1.5">
                WORK EMAIL
              </label>
              <div className="relative">
                <span className="material-symbols-outlined text-[18px] text-outline absolute left-3.5 top-1/2 -translate-y-1/2">
                  mail
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low border border-[#E8E6E1] rounded-xl text-body-sm text-on-surface placeholder-on-surface-variant/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition"
                  placeholder="qa_manager@omnisight.dev"
                />
              </div>
            </div>

            <div>
              <label className="block text-label-caps text-on-surface-variant font-bold mb-1.5">
                PASSWORD
              </label>
              <div className="relative">
                <span className="material-symbols-outlined text-[18px] text-outline absolute left-3.5 top-1/2 -translate-y-1/2">
                  lock
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low border border-[#E8E6E1] rounded-xl text-body-sm text-on-surface placeholder-on-surface-variant/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-primary-container text-white font-semibold text-body-base rounded-xl shadow-sm hover:bg-primary active:scale-[0.99] disabled:opacity-50 transition flex items-center justify-center gap-2 mt-2"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to QA Cockpit'}</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="pt-4 border-t border-[#E8E6E1] space-y-2">
            <p className="text-label-caps text-on-surface-variant uppercase tracking-wider text-center font-bold">
              QUICK LOGIN ROLES
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('qa_manager@omnisight.dev', 'password123')}
                className="p-3 text-body-sm bg-surface-container-low hover:bg-surface-container border border-[#E8E6E1] rounded-xl text-on-surface-variant transition text-left"
              >
                <p className="font-bold text-primary flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>
                    verified
                  </span>
                  <span>QA Manager</span>
                </p>
                <p className="text-label-caps text-outline mt-0.5">Full Approval Rights</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('viewer@omnisight.dev', 'password123')}
                className="p-3 text-body-sm bg-surface-container-low hover:bg-surface-container border border-[#E8E6E1] rounded-xl text-on-surface-variant transition text-left"
              >
                <p className="font-bold text-on-surface flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-outline">
                    visibility
                  </span>
                  <span>Viewer</span>
                </p>
                <p className="text-label-caps text-outline mt-0.5">Read-Only Mode</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
