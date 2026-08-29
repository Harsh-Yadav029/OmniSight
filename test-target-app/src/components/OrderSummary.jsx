import React from 'react';
import { useCart } from '../context/CartContext';

export const OrderSummary = () => {
  const { cart, subtotal } = useCart();
  const tax = subtotal * 0.08;
  const shipping = subtotal > 0 ? 9.99 : 0;
  const total = subtotal + tax + shipping;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm" id="checkout-order-summary">
      <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4">
        Order Review
      </h3>

      <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 mb-4 pr-1">
        {cart.map((item) => (
          <div key={item.id} className="py-2.5 flex items-center justify-between gap-3 text-sm">
            <div className="flex items-center gap-3">
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-10 h-10 rounded-md object-cover bg-slate-100"
              />
              <div>
                <p className="font-medium text-slate-900 line-clamp-1">{item.name}</p>
                <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
              </div>
            </div>
            <span className="font-semibold text-slate-900">
              ${(item.price * item.quantity).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      <div className="pt-3 border-t border-slate-100 space-y-2 text-sm">
        <div className="flex justify-between text-slate-600">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-slate-600">
          <span>Tax (8%)</span>
          <span>${tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-slate-600">
          <span>Shipping</span>
          <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
        </div>
        <div className="pt-3 border-t border-slate-100 flex justify-between text-base font-bold text-slate-900">
          <span>Total</span>
          <span className="text-indigo-600">${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};
