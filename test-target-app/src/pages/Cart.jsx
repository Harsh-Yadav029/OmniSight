import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { CartList } from '../components/CartList';
import { CartSummary } from '../components/CartSummary';

export const Cart = () => {
  const { cart, totalItems } = useCart();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8" id="cart-page">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Shopping Cart
          </h1>
          <p className="text-slate-500 mt-1">
            {totalItems === 0
              ? 'Your cart is currently empty.'
              : `You have ${totalItems} item${totalItems > 1 ? 's' : ''} in your cart.`}
          </p>
        </div>

        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Continue Shopping</span>
        </Link>
      </div>

      {cart.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400 mb-4">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800">Your cart is empty</h3>
          <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
            Looks like you haven't added anything to your cart yet. Explore our product catalog!
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow transition"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2">
            <CartList items={cart} />
          </div>
          <div className="lg:col-span-1">
            <CartSummary />
          </div>
        </div>
      )}
    </div>
  );
};
