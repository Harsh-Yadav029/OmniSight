import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const Navbar = () => {
  const { totalItems } = useCart();

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-[#E8E6E1] shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2 text-xl font-extrabold text-[#1d1b17] tracking-tight hover:text-[#016464] transition"
          id="navbar-logo"
        >
          <div className="w-8 h-8 rounded-lg bg-[#016464] flex items-center justify-center text-white shadow-sm font-bold">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <span>TinyCart</span>
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            to="/"
            className="text-sm font-semibold text-[#3f4948] hover:text-[#016464] transition"
            id="nav-products-link"
          >
            Products
          </Link>
          <Link
            to="/cart"
            className="relative flex items-center gap-2 p-2 rounded-full text-[#1d1b17] hover:text-[#016464] hover:bg-[#f3ede6] transition"
            id="nav-cart-btn"
          >
            <ShoppingCart className="w-5 h-5" />
            {totalItems > 0 && (
              <span
                id="cart-badge-count"
                className="absolute -top-1 -right-1 bg-[#016464] text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm"
              >
                {totalItems}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
};
