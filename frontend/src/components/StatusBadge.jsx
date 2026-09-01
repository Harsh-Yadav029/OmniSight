import React from 'react';

const statusConfig = {
  verified: {
    dotClass: 'pulse-emerald',
    label: 'Self-Healed & Verified',
    textColor: 'text-success-light',
    bgColor: 'bg-success/10',
    borderColor: 'border-success/30',
  },
  completed: {
    dotClass: 'pulse-emerald',
    label: 'Completed',
    textColor: 'text-success-light',
    bgColor: 'bg-success/10',
    borderColor: 'border-success/30',
  },
  pr_created: {
    dotClass: 'pulse-indigo',
    label: 'PR Created',
    textColor: 'text-primary-dim',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/30',
  },
  analyzing: {
    dotClass: 'pulse-purple',
    label: 'AI Analyzing',
    textColor: 'text-secondary-dim',
    bgColor: 'bg-secondary/10',
    borderColor: 'border-secondary/30',
  },
  fix_applied: {
    dotClass: 'pulse-amber',
    label: 'Patch Testing',
    textColor: 'text-warning-light',
    bgColor: 'bg-warning/10',
    borderColor: 'border-warning/30',
  },
  screenshots_captured: {
    dotClass: 'pulse-purple',
    label: 'Capturing',
    textColor: 'text-tertiary-dim',
    bgColor: 'bg-tertiary/10',
    borderColor: 'border-tertiary/30',
  },
  pending: {
    dotClass: 'pulse-amber',
    label: 'Pending',
    textColor: 'text-warning-light',
    bgColor: 'bg-warning/10',
    borderColor: 'border-warning/30',
  },
  failed: {
    dotClass: 'pulse-rose',
    label: 'Failed',
    textColor: 'text-error-light',
    bgColor: 'bg-error/10',
    borderColor: 'border-error/30',
  },
  approved: {
    dotClass: 'pulse-emerald',
    label: 'Approved',
    textColor: 'text-success-light',
    bgColor: 'bg-success/10',
    borderColor: 'border-success/30',
  },
  rejected: {
    dotClass: 'pulse-rose',
    label: 'Rejected',
    textColor: 'text-error-light',
    bgColor: 'bg-error/10',
    borderColor: 'border-error/30',
  },
};

export const StatusBadge = ({ status }) => {
  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${config.bgColor} border ${config.borderColor} ${config.textColor}`}
    >
      <span className={`status-dot ${config.dotClass}`} />
      <span className="text-label-caps font-bold uppercase tracking-wider">
        {config.label}
      </span>
    </span>
  );
};
