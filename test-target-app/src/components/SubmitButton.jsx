import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export const SubmitButton = ({ disabled = false, loading = false, onClick }) => {
  // CRITICAL: Clean, baseline responsive styling for SubmitButton.
  // This className string is the primary target for visual bug injection & self-healing in later phases.
  const buttonClassName = "w-full py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold text-base shadow-md hover:shadow-lg transition flex items-center justify-center gap-2";

  return (
    <button
      type="submit"
      id="submit-order-button"
      disabled={disabled || loading}
      onClick={onClick}
      className={buttonClassName}
    >
      <CheckCircle2 className="w-5 h-5" />
      <span>{loading ? 'Processing Order...' : 'Place Order'}</span>
    </button>
  );
};
