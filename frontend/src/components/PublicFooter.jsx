import React from 'react';
import { Link } from 'react-router-dom';

export const PublicFooter = () => {
  return (
    <footer className="border-t border-[#E8E6E1] bg-[#FAFAF8] py-10 px-6 sm:px-8 font-sans mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* Left: Brand Logo */}
        <Link to="/" className="text-xl font-black text-[#016464] tracking-tight">
          OmniSight
        </Link>

        {/* Center: Legal & Status Links */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-500">
          <Link to="#" className="hover:text-[#016464] transition">Privacy Policy</Link>
          <Link to="#" className="hover:text-[#016464] transition">Terms of Service</Link>
          <Link to="#" className="hover:text-[#016464] transition">Security</Link>
          <Link to="#" className="hover:text-[#016464] transition">Status</Link>
        </div>

        {/* Right: Copyright */}
        <div className="text-xs text-slate-400 font-medium">
          © {new Date().getFullYear()} OmniSight AI. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
