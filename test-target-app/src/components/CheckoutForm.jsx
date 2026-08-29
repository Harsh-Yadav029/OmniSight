import React from 'react';

export const CheckoutForm = ({ formData, onChange }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm" id="checkout-form-container">
      <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4">
        Shipping Information
      </h3>

      <div className="space-y-4">
        <div>
          <label htmlFor="fullName" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
            Full Name
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName || ''}
            onChange={onChange}
            placeholder="Jane Doe"
            required
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-slate-900 placeholder:text-slate-400"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email || ''}
            onChange={onChange}
            placeholder="jane@example.com"
            required
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-slate-900 placeholder:text-slate-400"
          />
        </div>

        <div>
          <label htmlFor="address" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
            Street Address
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address || ''}
            onChange={onChange}
            placeholder="123 Market Street, Apt 4B"
            required
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-slate-900 placeholder:text-slate-400"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="city" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              City
            </label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city || ''}
              onChange={onChange}
              placeholder="San Francisco"
              required
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-slate-900 placeholder:text-slate-400"
            />
          </div>
          <div>
            <label htmlFor="zipCode" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              ZIP Code
            </label>
            <input
              type="text"
              id="zipCode"
              name="zipCode"
              value={formData.zipCode || ''}
              onChange={onChange}
              placeholder="94105"
              required
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-slate-900 placeholder:text-slate-400"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
