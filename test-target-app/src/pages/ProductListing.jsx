import React from 'react';
import { ProductGrid } from '../components/ProductGrid';
import products from '../data/products.json';

export const ProductListing = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8" id="product-listing-page">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Featured Products
        </h1>
        <p className="text-slate-500 mt-2 text-base">
          Browse our curated selection of high-performance tech accessories.
        </p>
      </div>

      <ProductGrid products={products} />
    </div>
  );
};
