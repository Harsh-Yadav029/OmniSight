import React from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();

  return (
    <div
      className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-sm gap-4"
      id={`cart-item-${item.id}`}
    >
      <div className="flex items-center gap-4">
        <img
          src={item.imageUrl}
          alt={item.name}
          className="w-16 h-16 rounded-lg object-cover bg-slate-100 border border-slate-100"
        />
        <div>
          <h4 className="font-semibold text-slate-900 text-sm sm:text-base line-clamp-1">
            {item.name}
          </h4>
          <p className="text-sm font-medium text-slate-500 mt-0.5">
            ${item.price.toFixed(2)} each
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
          <button
            onClick={() => updateQuantity(item.id, -1)}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-l-lg transition"
            id={`qty-minus-${item.id}`}
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span
            className="px-3 py-1 text-xs font-semibold text-slate-900"
            id={`qty-count-${item.id}`}
          >
            {item.quantity}
          </span>
          <button
            onClick={() => updateQuantity(item.id, 1)}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-r-lg transition"
            id={`qty-plus-${item.id}`}
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="text-right min-w-[70px]">
          <span className="font-bold text-slate-900 text-sm sm:text-base">
            ${(item.price * item.quantity).toFixed(2)}
          </span>
        </div>

        <button
          onClick={() => removeFromCart(item.id)}
          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
          id={`remove-item-${item.id}`}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
