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
    <aside className="hidden md:flex flex-col h-screen py-6 w-64 bg-[#f9f3eb] border-r border-[#E8E6E1] shrink-0 font-sans select-none">
      {/* Brand Header */}
      <div className="px-6 pb-6 border-b border-[#E8E6E1] mb-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#016464] flex items-center justify-center text-white shadow-sm shrink-0">
            <span className="material-symbols-outlined text-white text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              all_inclusive
            </span>
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-extrabold text-[#016464] leading-tight truncate">OmniSight QA</h1>
            <p className="text-[11px] font-semibold text-[#6f7979] leading-tight truncate">Autonomous Inspection</p>
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
      </div>

      {/* User Session & Logout */}
      <div className="px-4 pt-4 border-t border-[#E8E6E1] mt-auto">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-[#3f4948] hover:bg-[#ede7e0] transition"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-full bg-[#016464] text-white flex items-center justify-center font-bold text-xs shrink-0">
              {user?.username?.[0]?.toUpperCase() || 'Q'}
            </div>
            <span className="text-sm font-semibold text-[#1d1b17] truncate">Logout</span>
          </div>
          <span className="material-symbols-outlined text-[18px] text-[#6f7979] shrink-0">logout</span>
        </button>
      </div>
    </aside>
  );
};
