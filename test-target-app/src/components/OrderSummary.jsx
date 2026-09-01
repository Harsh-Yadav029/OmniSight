import React from 'react';
import { useCart } from '../context/CartContext';

export const OrderSummary = () => {
  const { cart, subtotal } = useCart();
  const tax = subtotal * 0.18; // 18% GST
  const shipping = subtotal > 0 ? (subtotal > 2000 ? 0 : 149) : 0;
  const total = subtotal + tax + shipping;

  return (
    <div className="bg-white rounded-2xl border border-[#E8E6E1] p-6 shadow-[0_4px_20px_-2px_rgba(26,26,26,0.05)] font-sans" id="checkout-order-summary">
      <h3 className="text-lg font-bold text-[#1d1b17] border-b border-[#E8E6E1] pb-3 mb-4">
        Order Summary
      </h3>

      <div className="max-h-64 overflow-y-auto divide-y divide-[#f3ede6] mb-4 pr-1">
        {cart.map((item) => (
          <div key={item.id} className="py-3 flex items-center justify-between gap-3 text-sm">
            <div className="flex items-center gap-3">
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-11 h-11 rounded-xl object-cover bg-[#f9f3eb] border border-[#E8E6E1]"
              />
              <div>
                <p className="font-semibold text-[#1d1b17] line-clamp-1 text-xs">{item.name}</p>
                <p className="text-[11px] text-[#6f7979]">Qty: {item.quantity}</p>
              </div>
            </div>
            <span className="font-bold text-[#1d1b17] text-xs">
              ₹{(item.price * item.quantity).toLocaleString('en-IN')}
            </span>
          </div>
        ))}
      </div>

      <div className="pt-3 border-t border-[#E8E6E1] space-y-2 text-xs">
        <div className="flex justify-between text-[#6f7979]">
          <span>Subtotal</span>
          <span className="font-bold text-[#1d1b17]">₹{subtotal.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex justify-between text-[#6f7979]">
          <span>GST (18%)</span>
          <span className="font-bold text-[#1d1b17]">₹{tax.toFixed(0).toLocaleString('en-IN')}</span>
        </div>
        <div className="flex justify-between text-[#6f7979]">
          <span>Shipping</span>
          <span className="font-bold text-[#1d1b17]">{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
        </div>
        <div className="pt-3 border-t border-[#E8E6E1] flex justify-between text-base font-extrabold text-[#1d1b17]">
          <span>Total</span>
          <span className="text-[#016464]">₹{total.toFixed(0).toLocaleString('en-IN')}</span>
        </div>
      </div>
    </div>
  );
};
