import React from 'react';
import { Plus } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  return (
    <div
      className="bg-white rounded-2xl border border-[#E8E6E1] overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
      id={`product-card-${product.id}`}
    >
      <div className="aspect-square w-full bg-[#f9f3eb] overflow-hidden">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover hover:scale-105 transition duration-300"
          loading="lazy"
        />
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-[#1d1b17] text-base leading-snug line-clamp-1">
            {product.name}
          </h3>
          <p className="text-xs text-[#3f4948] mt-1 line-clamp-2">
            {product.description}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-[#E8E6E1] flex items-center justify-between">
          <span className="text-lg font-extrabold text-[#1d1b17]">
            ₹{product.price.toLocaleString('en-IN')}
          </span>
          <button
            onClick={() => addToCart(product)}
            className="inline-flex items-center gap-1.5 bg-[#016464] hover:bg-[#2d7d7d] active:scale-[0.98] text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition shadow-sm"
            id={`add-to-cart-${product.id}`}
          >
            <Plus className="w-4 h-4" />
            <span>Add to Cart</span>
          </button>
        </div>
      </div>
    </div>
  );
};
