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
    <div className="min-h-screen bg-canvas flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden antialiased selection:bg-primary-container selection:text-white">
      {/* Background glow highlights */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-tertiary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary via-secondary to-tertiary p-0.5 mx-auto shadow-glow-primary mb-4">
          <div className="w-full h-full bg-surface-container-lowest rounded-[14px] flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              workspaces
            </span>
          </div>
        </div>
        <h2 className="text-headline-lg sm:text-display-lg font-extrabold text-on-surface tracking-tight">
          OmniSight Cockpit
        </h2>
        <p className="mt-2 text-body-sm text-on-surface-variant max-w-sm mx-auto">
          Autonomous visual regression engine with multimodal AI analysis and self-healing pipelines.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="glass-panel p-6 sm:p-8 space-y-6 shadow-2xl">
          {error && (
            <div className="p-3.5 bg-error/10 border border-error/30 rounded-xl text-error-light text-body-sm flex items-center space-x-2">
              <span className="material-symbols-outlined text-[18px] text-error shrink-0">error</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-code-sm font-semibold text-on-surface-variant mb-1.5 font-mono">
                Work Email
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
                  className="w-full pl-10 pr-4 py-2.5 bg-surface-container-lowest border border-outline-variant/30 rounded-xl text-body-sm text-on-surface placeholder-on-surface-variant/40 focus:outline-none focus:border-primary/60 focus:shadow-glow-primary transition font-sans"
                  placeholder="qa_manager@omnisight.dev"
                />
              </div>
            </div>

            <div>
              <label className="block text-code-sm font-semibold text-on-surface-variant mb-1.5 font-mono">
                Password
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
                  className="w-full pl-10 pr-4 py-2.5 bg-surface-container-lowest border border-outline-variant/30 rounded-xl text-body-sm text-on-surface placeholder-on-surface-variant/40 focus:outline-none focus:border-primary/60 focus:shadow-glow-primary transition font-sans"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-primary text-on-primary font-semibold text-body-sm rounded-xl shadow-glow-primary hover:bg-primary-dim active:scale-[0.99] disabled:opacity-50 transition flex items-center justify-center space-x-2 mt-2"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Cockpit'}</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="pt-4 border-t border-[#1e293b] space-y-2">
            <p className="text-label-caps text-on-surface-variant uppercase tracking-wider text-center">
              Quick Login Roles
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('qa_manager@omnisight.dev', 'password123')}
                className="p-2.5 text-body-sm bg-surface-container-lowest hover:bg-surface-container-high border border-outline-variant/30 rounded-xl text-on-surface-variant transition text-left"
              >
                <p className="font-semibold text-primary-dim flex items-center space-x-1">
                  <span className="material-symbols-outlined text-[16px] text-success" style={{ fontVariationSettings: "'FILL' 1" }}>
                    verified
                  </span>
                  <span>QA Manager</span>
                </p>
                <p className="text-code-sm text-outline font-mono mt-0.5">Full Approval Rights</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('viewer@omnisight.dev', 'password123')}
                className="p-2.5 text-body-sm bg-surface-container-lowest hover:bg-surface-container-high border border-outline-variant/30 rounded-xl text-on-surface-variant transition text-left"
              >
                <p className="font-semibold text-on-surface flex items-center space-x-1">
                  <span className="material-symbols-outlined text-[16px] text-outline">
                    visibility
                  </span>
                  <span>Viewer</span>
                </p>
                <p className="text-code-sm text-outline font-mono mt-0.5">Read-Only Mode</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
