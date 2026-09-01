import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Search, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const Navbar = () => {
  const { totalItems } = useCart();
  const location = useLocation();

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur border-b border-slate-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Left: Brand + Shop link */}
        <div className="flex items-center gap-8">
          <Link
            to="/"
            className="text-2xl font-black text-[#904c1b] tracking-tight hover:opacity-90 transition font-serif italic"
            id="navbar-logo"
          >
            TinyCart
          </Link>

          <nav className="hidden sm:flex items-center gap-6 text-sm font-semibold text-[#3f4948]">
            <Link
              to="/"
              className={`transition pb-0.5 ${
                location.pathname === '/'
                  ? 'text-[#1d1b17] border-b-2 border-[#904c1b] font-bold'
                  : 'hover:text-[#1d1b17]'
              }`}
              id="nav-products-link"
            >
              Shop
            </Link>
          </nav>
        </div>

        {/* Right side: Search, Sign In, Heart, Cart */}
        <div className="flex items-center gap-4">
          <button className="p-1.5 text-[#3f4948] hover:text-[#1d1b17] transition" title="Search">
            <Search className="w-5 h-5" />
          </button>

          <button className="hidden sm:block text-sm font-semibold text-[#1d1b17] px-3 py-1.5 rounded-lg border border-[#E8E6E1] hover:bg-white transition">
            Sign In
          </button>

          <button className="p-1.5 text-[#3f4948] hover:text-[#1d1b17] transition" title="Favorites">
            <Heart className="w-5 h-5" />
          </button>

          <Link
            to="/cart"
            className="relative p-1.5 text-[#3f4948] hover:text-[#904c1b] transition"
            id="nav-cart-btn"
          >
            <ShoppingBag className="w-5 h-5" />
            {totalItems > 0 && (
              <span
                id="cart-badge-count"
                className="absolute -top-1 -right-1 bg-[#904c1b] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm"
              >
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
};
