import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { icon: 'dashboard', label: 'Dashboard', path: '/' },
  { icon: 'history', label: 'Build History', path: '/' },
  { icon: 'settings', label: 'Settings', path: '/settings' },
];

const footerItems = [
  { icon: 'analytics', label: 'System Status' },
  { icon: 'menu_book', label: 'Documentation' },
];

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-surface-container-low border-r border-outline-variant/20 w-64 flex flex-col h-screen p-4 space-y-2 shrink-0 overflow-y-auto">
      {/* Brand */}
      <Link to="/" className="flex items-center space-x-3 mb-8 px-2 group">
        <div className="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center shrink-0 shadow-glow-primary group-hover:shadow-lg transition-shadow">
          <span className="material-symbols-outlined text-on-primary-container text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            workspaces
          </span>
        </div>
        <div>
          <h1 className="text-title-base font-bold text-on-surface leading-tight">OmniSight</h1>
          <p className="text-body-sm text-on-surface-variant leading-tight">Autonomous QA</p>
        </div>
      </Link>

      {/* Navigation Links */}
      <div className="space-y-1 flex-grow">
        {navItems.map((item) => {
          const isActive = item.label === 'Build History' && location.pathname === '/'
            ? true
            : location.pathname === item.path && item.label !== 'Build History';

          return (
            <Link
              key={item.label}
              to={item.path}
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-body-sm transition-all duration-150 ${
                isActive
                  ? 'nav-link-active'
                  : 'nav-link-inactive'
              }`}
            >
              <span
                className="material-symbols-outlined text-[20px]"
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* New Build CTA */}
      <button
        onClick={() => {
          fetch('http://localhost:8000/webhook/build-event', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              repo: 'Harsh-Yadav029/OmniSight',
              branch: 'main',
              commitSha: Math.random().toString(36).substring(2, 9)
            })
          }).catch(() => {});
        }}
        className="w-full bg-primary text-on-primary text-body-base font-semibold py-2.5 rounded-xl mb-4 hover:shadow-glow-primary transition-all active:scale-[0.98]"
      >
        New Build
      </button>

      {/* Footer Links */}
      <div className="space-y-1 pt-4 border-t border-outline-variant/20">
        {footerItems.map((item) => (
          <a
            key={item.label}
            href="#"
            className="flex items-center space-x-3 px-3 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container-highest/50 transition-all duration-150 text-body-sm nav-link-inactive"
          >
            <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
            <span>{item.label}</span>
          </a>
        ))}

        {/* User Info */}
        {user && (
          <div className="flex items-center justify-between px-3 py-2.5 mt-3 rounded-lg bg-surface-container/50 border border-outline-variant/10">
            <div className="flex items-center space-x-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-secondary-container flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-on-secondary-container text-[14px]">person</span>
              </div>
              <div className="min-w-0">
                <p className="text-body-sm font-semibold text-on-surface truncate">{user.username}</p>
                <p className="text-code-sm text-on-surface-variant capitalize truncate">{user.role?.replace('_', ' ')}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-lg transition"
              title="Sign Out"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};
