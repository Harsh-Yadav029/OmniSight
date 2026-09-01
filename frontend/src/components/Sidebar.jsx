import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { icon: 'dashboard', label: 'Runs', path: '/' },
  { icon: 'history', label: 'Build History', path: '/' },
  { icon: 'settings', label: 'Settings', path: '/settings' },
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
    <nav className="hidden md:flex flex-col h-full py-6 w-64 fixed left-0 top-0 z-40 bg-surface-container-low border-r border-[#E8E6E1] shrink-0 overflow-y-auto">
      {/* Brand Header */}
      <div className="px-6 pb-6 border-b border-[#E8E6E1] mb-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center text-on-primary-container font-extrabold text-base shadow-sm">
            O
          </div>
          <div>
            <h1 className="text-title-sm font-bold text-primary leading-tight">OmniSight QA</h1>
            <p className="text-label-caps text-on-surface-variant opacity-70 leading-tight">Autonomous Inspection</p>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = (item.label === 'Runs' || item.label === 'Build History') && location.pathname === '/'
            ? (item.label === 'Runs')
            : location.pathname === item.path;

          return (
            <Link
              key={item.label}
              to={item.path}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-body-medium font-medium transition-all transform active:translate-x-0.5 ${
                isActive
                  ? 'bg-primary-container text-on-primary-container shadow-sm font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
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

      {/* User Section & Logout */}
      <div className="px-3 pt-4 border-t border-[#E8E6E1] mt-auto space-y-2">
        {user && (
          <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-white border border-[#E8E6E1] shadow-sm">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                {user.username?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-body-sm font-semibold text-on-surface truncate">{user.username}</p>
                <p className="text-label-caps text-on-surface-variant capitalize truncate">{user.role?.replace('_', ' ')}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1 text-on-surface-variant hover:text-error transition"
              title="Sign Out"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};
