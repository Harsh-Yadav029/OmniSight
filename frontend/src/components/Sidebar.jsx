import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="hidden md:flex flex-col h-full py-6 w-64 fixed left-0 top-0 z-40 bg-[#f9f3eb] border-r border-[#E8E6E1] shrink-0 font-sans">
      {/* Brand Header */}
      <div className="px-6 pb-6 mb-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#016464] flex items-center justify-center text-white font-black text-lg shadow-sm">
            <span className="material-symbols-outlined text-white text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              all_inclusive
            </span>
          </div>
          <div>
            <h1 className="text-base font-extrabold text-[#016464] leading-tight">OmniSight QA</h1>
            <p className="text-[11px] font-semibold text-[#6f7979] leading-tight">Autonomous Inspection</p>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 px-4 space-y-1.5">
        <Link
          to="/"
          className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
            location.pathname === '/' || location.pathname.startsWith('/runs')
              ? 'bg-[#016464] text-white shadow-sm'
              : 'text-[#3f4948] hover:bg-[#ede7e0] hover:text-[#1d1b17]'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            grid_view
          </span>
          <span>Runs</span>
        </Link>

        <Link
          to="/settings"
          className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-[#3f4948] hover:bg-[#ede7e0] hover:text-[#1d1b17] transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">
            settings
          </span>
          <span>Settings</span>
        </Link>
      </div>

      {/* User Session & Logout */}
      <div className="px-4 pt-4 mt-auto">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium text-[#3f4948] hover:bg-[#ede7e0] transition"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#016464] text-white flex items-center justify-center font-bold text-xs">
              {user?.username?.[0]?.toUpperCase() || 'Q'}
            </div>
            <span className="text-sm font-semibold text-[#1d1b17]">Logout</span>
          </div>
          <span className="material-symbols-outlined text-[20px] text-[#6f7979]">logout</span>
        </button>
      </div>
    </nav>
  );
};
