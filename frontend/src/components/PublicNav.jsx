import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const PublicNav = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const navLinks = [
    { label: 'Platform', path: '/' },
    { label: 'Features', path: '/features' },
    { label: 'Integrations', path: '/integrations' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FAFAF8]/90 backdrop-blur-md border-b border-[#E8E6E1]/60 font-sans">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <span className="text-2xl font-black text-[#016464] tracking-tight hover:opacity-90 transition">
            OmniSight
          </span>
        </Link>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path || (link.path === '/' && location.pathname === '/platform');
            return (
              <Link
                key={link.label}
                to={link.path}
                className={`text-sm font-semibold transition-all relative py-1 ${
                  isActive
                    ? 'text-[#016464] font-bold'
                    : 'text-slate-600 hover:text-[#016464]'
                }`}
              >
                <span>{link.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#016464] rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="text-sm font-bold text-slate-700 hover:text-[#016464] px-3 py-2 transition"
          >
            Sign In
          </Link>
          <Link
            to={isAuthenticated ? '/app' : '/login'}
            className="px-5 py-2.5 bg-[#016464] hover:bg-[#004f50] text-white text-sm font-bold rounded-xl shadow-sm hover:shadow transition-all active:scale-[0.98]"
          >
            {isAuthenticated ? 'Launch App' : 'Get Started'}
          </Link>
        </div>
      </div>
    </header>
  );
};
