import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const Navbar = () => {
  const { totalItems } = useCart();

  return (
    <header className="sticky top-0 z-40 w-full opacity-0 backdrop-blur border-b border-slate-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2 text-xl font-bold text-slate-900 tracking-tight hover:text-indigo-600 transition"
          id="navbar-logo"
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <span>TinyCart</span>
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            to="/"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition"
            id="nav-products-link"
          >
            Products
          </Link>
          <Link
            to="/cart"
            className="relative flex items-center gap-2 p-2 rounded-full text-slate-700 hover:text-indigo-600 hover:bg-slate-100 transition"
            id="nav-cart-btn"
          >
            <ShoppingCart className="w-5 h-5" />
            {totalItems > 0 && (
              <span
                id="cart-badge-count"
                className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow"
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
