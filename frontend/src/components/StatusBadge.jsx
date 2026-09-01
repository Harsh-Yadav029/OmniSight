import React from 'react';

const statusConfig = {
  verified: {
    dotClass: 'pulse-sage',
    label: 'VERIFIED & HEALED',
    textColor: 'text-tertiary',
    bgColor: 'bg-tertiary/15',
    borderColor: 'border-tertiary/30',
  },
  completed: {
    dotClass: 'pulse-sage',
    label: 'COMPLETED',
    textColor: 'text-tertiary',
    bgColor: 'bg-tertiary/15',
    borderColor: 'border-tertiary/30',
  },
  pr_created: {
    dotClass: 'pulse-teal',
    label: 'PR CREATED',
    textColor: 'text-primary',
    bgColor: 'bg-primary/15',
    borderColor: 'border-primary/30',
  },
  analyzing: {
    dotClass: 'pulse-teal',
    label: 'ANALYZING',
    textColor: 'text-primary',
    bgColor: 'bg-primary/15',
    borderColor: 'border-primary/30',
  },
  fix_applied: {
    dotClass: 'pulse-coral',
    label: 'PATCH TESTING',
    textColor: 'text-secondary',
    bgColor: 'bg-secondary/15',
    borderColor: 'border-secondary/30',
  },
  screenshots_captured: {
    dotClass: 'pulse-teal',
    label: 'CAPTURED',
    textColor: 'text-primary',
    bgColor: 'bg-primary/15',
    borderColor: 'border-primary/30',
  },
  pending: {
    dotClass: 'pulse-coral',
    label: 'PENDING',
    textColor: 'text-secondary',
    bgColor: 'bg-secondary/15',
    borderColor: 'border-secondary/30',
  },
  failed: {
    dotClass: 'pulse-red',
    label: 'FAILED',
    textColor: 'text-error',
    bgColor: 'bg-error/15',
    borderColor: 'border-error/30',
  },
  approved: {
    dotClass: 'pulse-sage',
    label: 'APPROVED',
    textColor: 'text-tertiary',
    bgColor: 'bg-tertiary/15',
    borderColor: 'border-tertiary/30',
  },
  rejected: {
    dotClass: 'pulse-red',
    label: 'REJECTED',
    textColor: 'text-error',
    bgColor: 'bg-error/15',
    borderColor: 'border-error/30',
  },
};

export const StatusBadge = ({ status }) => {
  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${config.bgColor} border ${config.borderColor} ${config.textColor} text-label-caps tracking-wider font-bold`}
    >
      <span className={`status-dot ${config.dotClass}`} />
      <span>{config.label}</span>
    </span>
  );
};
