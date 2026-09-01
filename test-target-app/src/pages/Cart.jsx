import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, Lock, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const Cart = () => {
  const { cart, updateQuantity, removeFromCart, cartTotal } = useCart();
  const navigate = useNavigate();

  // Mock initial demo items matching Screenshot 5 if cart is empty
  const displayItems = cart.length > 0 ? cart : [
    {
      id: 'demo-1',
      name: 'Artisan Ceramic Dripper',
      variant: 'Matte White',
      price: 45.00,
      quantity: 1,
      imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&auto=format&fit=crop&q=80'
    },
    {
      id: 'demo-2',
      name: 'Precision Gooseneck Kettle',
      variant: 'Matte Black • 1L',
      price: 89.00,
      quantity: 1,
      imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80'
    }
  ];

  const total = cart.length > 0
    ? cartTotal
    : displayItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 font-sans space-y-8" id="cart-page">
      <h1 className="text-3xl font-extrabold text-[#1d1b17] tracking-tight">
        Your Cart
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Cart Items */}
        <div className="lg:col-span-8 space-y-4">
          {displayItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-[#E8E6E1] p-5 shadow-[0_4px_20px_-2px_rgba(26,26,26,0.05)] flex flex-col sm:flex-row sm:items-center justify-between gap-5"
              id={`cart-item-${item.id}`}
            >
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-[#f9f3eb] shrink-0">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div>
                  <h3 className="font-bold text-[#1d1b17] text-base leading-snug">
                    {item.name}
                  </h3>
                  <p className="text-xs text-[#6f7979] mt-0.5">
                    {item.variant || 'Standard'}
                  </p>
                  <p className="text-sm font-extrabold text-[#1d1b17] mt-2 sm:hidden">
                    ${item.price.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-6 pt-3 sm:pt-0 border-t sm:border-0 border-[#f3ede6]">
                <div className="text-right hidden sm:block">
                  <span className="font-extrabold text-[#1d1b17] text-base">
                    ${item.price.toFixed(2)}
                  </span>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center border border-[#E8E6E1] rounded-xl bg-white px-2 py-1 shadow-sm">
                  <button
                    onClick={() => updateQuantity(item.id, (item.quantity || 1) - 1)}
                    className="p-1 text-[#6f7979] hover:text-[#1d1b17] transition"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-3 text-xs font-bold text-[#1d1b17] min-w-[20px] text-center">
                    {item.quantity || 1}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)}
                    className="p-1 text-[#6f7979] hover:text-[#1d1b17] transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="flex items-center gap-1 text-[11px] font-bold text-[#ba1a1a] hover:opacity-80 transition tracking-wider uppercase"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>REMOVE</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Order Summary (Screenshot 5) */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-2xl border border-[#E8E6E1] p-6 shadow-[0_4px_20px_-2px_rgba(26,26,26,0.05)] space-y-5">
            <h2 className="text-lg font-bold text-[#1d1b17]">
              Order Summary
            </h2>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-[#6f7979]">
                <span>Subtotal</span>
                <span className="font-bold text-[#1d1b17]">${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#6f7979]">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="flex justify-between text-[#6f7979]">
                <span>Taxes</span>
                <span>Calculated at checkout</span>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E8E6E1] flex justify-between items-baseline">
              <span className="text-sm font-bold text-[#1d1b17]">Estimated Total</span>
              <span className="text-xl font-extrabold text-[#1d1b17]">${total.toFixed(2)}</span>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-3.5 px-4 bg-[#016464] hover:bg-[#004f50] text-white font-semibold text-sm rounded-xl shadow-sm transition flex items-center justify-center gap-2 active:scale-[0.98]"
              id="proceed-to-checkout-btn"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-1.5 text-xs text-[#6f7979]">
              <Lock className="w-3.5 h-3.5" />
              <span>Secure Checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
