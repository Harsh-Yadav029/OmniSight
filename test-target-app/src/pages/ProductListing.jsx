import React, { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import productsData from '../data/products.json';
import { useCart } from '../context/CartContext';

export const ProductListing = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { addToCart } = useCart();

  const filtered = productsData.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const gridProducts = filtered.filter((p) => !p.isFeatured);
  const featuredProduct = filtered.find((p) => p.isFeatured);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 font-sans space-y-10" id="product-listing-page">
      {/* Header with Search */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1d1b17] tracking-tight">
            Curated Essentials
          </h1>
          <p className="text-sm text-[#6f7979] mt-1.5 max-w-xl font-medium">
            Discover our latest collection of thoughtfully crafted apparel and everyday goods. Simple, functional, and durable.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-[#6f7979] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-[#E8E6E1] rounded-xl text-xs text-[#1d1b17] placeholder-[#bec9c8] focus:outline-none focus:border-[#016464] transition shadow-sm"
          />
        </div>
      </div>

      {/* 3-Column Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {gridProducts.map((product, idx) => (
          <div
            key={product.id}
            className="bg-white rounded-2xl border border-[#E8E6E1] p-5 shadow-[0_4px_20px_-2px_rgba(26,26,26,0.05)] hover:shadow-md transition flex flex-col justify-between"
            id={`product-card-${product.id}`}
          >
            <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-[#f9f3eb] mb-4">
              {product.tag && (
                <span className="absolute top-3 left-3 bg-[#ffdbc8] text-[#783a08] text-[11px] font-bold px-2.5 py-0.5 rounded-full z-10 shadow-sm flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#904c1b]" />
                  <span>{product.tag}</span>
                </span>
              )}
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover hover:scale-105 transition duration-500"
              />
            </div>

            <div className="space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-bold text-[#1d1b17] text-base leading-snug">
                    {product.name}
                  </h3>
                  <span className="font-extrabold text-[#1d1b17] text-base shrink-0">
                    ₹{product.price.toLocaleString('en-IN')}
                  </span>
                </div>
                <p className="text-xs text-[#6f7979] mt-1.5 leading-relaxed line-clamp-2">
                  {product.description}
                </p>
              </div>

              <button
                onClick={() => addToCart(product)}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-sm ${
                  idx === 0
                    ? 'bg-[#016464] hover:bg-[#004f50] text-white'
                    : 'bg-white hover:bg-[#FAF9F6] text-[#1d1b17] border border-[#E8E6E1]'
                }`}
                id={`add-to-cart-${product.id}`}
              >
                <Plus className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Featured Wide Banner Card */}
      {featuredProduct && (
        <div className="bg-white rounded-2xl border border-[#E8E6E1] p-6 sm:p-8 shadow-[0_4px_20px_-2px_rgba(26,26,26,0.05)] grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="aspect-[4/3] w-full rounded-xl overflow-hidden bg-[#f9f3eb]">
            <img
              src={featuredProduct.imageUrl}
              alt={featuredProduct.name}
              className="w-full h-full object-cover hover:scale-105 transition duration-500"
            />
          </div>

          <div className="space-y-4">
            <span className="inline-flex items-center gap-1.5 bg-[#e5ffe9] text-[#215034] text-[11px] font-bold px-3 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#356346]" />
              <span>Staff Pick</span>
            </span>

            <div className="flex items-baseline justify-between gap-4">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1d1b17] tracking-tight">
                {featuredProduct.name}
              </h2>
              <span className="text-2xl font-extrabold text-[#1d1b17]">
                ₹{featuredProduct.price.toLocaleString('en-IN')}
              </span>
            </div>

            <p className="text-sm text-[#6f7979] leading-relaxed">
              {featuredProduct.description}
            </p>

            <div className="flex items-center gap-4 pt-2">
              <button
                onClick={() => addToCart(featuredProduct)}
                className="bg-[#016464] hover:bg-[#004f50] text-white text-xs font-semibold px-5 py-3 rounded-xl shadow-sm transition flex items-center gap-2 active:scale-[0.98]"
              >
                <Plus className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>
              <button className="text-xs font-semibold text-[#1d1b17] hover:text-[#016464] transition">
                View Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="pt-10 border-t border-[#E8E6E1] flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-[#6f7979] font-mono">
        <p>© 2026 TinyCart</p>
        <div className="flex items-center gap-6">
          <a href="#" className="hover:text-[#1d1b17] transition">Terms</a>
          <a href="#" className="hover:text-[#1d1b17] transition">Privacy</a>
        </div>
      </footer>
    </div>
  );
};
