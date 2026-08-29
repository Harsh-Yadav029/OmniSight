import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const CartSummary = () => {
  const { subtotal, totalItems } = useCart();
  const navigate = useNavigate();

  const tax = subtotal * 0.08;
  const shipping = subtotal > 0 ? 9.99 : 0;
  const total = subtotal + tax + shipping;

  return (
    <div
      className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm sticky bottom-0 sm:static"
      id="cart-summary"
    >
      <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
        Order Summary
      </h3>

      <div className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between text-slate-600">
          <span>Subtotal ({totalItems} items)</span>
          <span className="font-semibold text-slate-900">${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-slate-600">
          <span>Estimated Tax (8%)</span>
          <span className="font-semibold text-slate-900">${tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-slate-600">
          <span>Shipping</span>
          <span className="font-semibold text-slate-900">
            {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
          </span>
        </div>
        <div className="pt-3 border-t border-slate-100 flex justify-between text-base font-bold text-slate-900">
          <span>Estimated Total</span>
          <span className="text-indigo-600">${total.toFixed(2)}</span>
        </div>
      </div>

      <button
        onClick={() => navigate('/checkout')}
        disabled={totalItems === 0}
        className="mt-6 w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl shadow transition"
        id="proceed-to-checkout-btn"
      >
        <span>Proceed to Checkout</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};
