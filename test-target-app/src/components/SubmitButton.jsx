import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export const SubmitButton = ({ disabled = false, loading = false, onClick }) => {
  // CRITICAL: Clean, baseline responsive styling for SubmitButton.
  // This className string is the primary target for visual bug injection & self-healing in later phases.
  const buttonClassName = "";

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
