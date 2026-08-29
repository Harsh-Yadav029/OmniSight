import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { CheckoutForm } from '../components/CheckoutForm';
import { OrderSummary } from '../components/OrderSummary';
import { SubmitButton } from '../components/SubmitButton';

export const Checkout = () => {
  const { cart, clearCart, totalItems } = useCart();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    address: '',
    city: '',
    zipCode: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOrdered, setIsOrdered] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsOrdered(true);
      clearCart();
    }, 800);
  };

  if (isOrdered) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center" id="order-success-screen">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900">Order Placed Successfully!</h2>
        <p className="text-slate-600 mt-2">
          Thank you for your order, {formData.fullName || 'Customer'}. We've sent a confirmation email to {formData.email || 'your email'}.
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl shadow transition"
        >
          Return to Store
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8" id="checkout-page">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Checkout
          </h1>
          <p className="text-slate-500 mt-1">Complete your order details below.</p>
        </div>

        <Link
          to="/cart"
          className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Cart</span>
        </Link>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-6">
            <CheckoutForm formData={formData} onChange={handleInputChange} />
          </div>

          <div className="lg:col-span-1 space-y-6">
            <OrderSummary />
            <div id="checkout-submit-wrapper">
              <SubmitButton
                disabled={totalItems === 0}
                loading={isSubmitting}
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
