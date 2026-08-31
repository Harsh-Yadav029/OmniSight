import React from 'react';
import { 
  Clock, 
  Search, 
  Wrench, 
  Camera, 
  CheckCircle2, 
  GitPullRequest, 
  CheckCheck, 
  AlertCircle 
} from 'lucide-react';

export const StatusBadge = ({ status }) => {
  const getBadgeConfig = (st) => {
    switch (st?.toLowerCase()) {
      case 'pending':
        return {
          bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
          dot: 'bg-amber-400',
          icon: Clock,
          label: 'Pending'
        };
      case 'screenshots_captured':
        return {
          bg: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
          dot: 'bg-sky-400',
          icon: Camera,
          label: 'Screenshots Captured'
        };
      case 'analyzing':
        return {
          bg: 'bg-purple-500/10 text-purple-400 border-purple-500/20 animate-pulse',
          dot: 'bg-purple-400',
          icon: Search,
          label: 'VLM Analyzing'
        };
      case 'fix_applied':
        return {
          bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
          dot: 'bg-indigo-400',
          icon: Wrench,
          label: 'Fix Applied'
        };
      case 'verified':
        return {
          bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          dot: 'bg-emerald-400',
          icon: CheckCircle2,
          label: 'Self-Healed & Verified'
        };
      case 'pr_created':
        return {
          bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
          dot: 'bg-blue-400',
          icon: GitPullRequest,
          label: 'PR Opened'
        };
      case 'completed':
        return {
          bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          dot: 'bg-emerald-400',
          icon: CheckCheck,
          label: 'Completed'
        };
      case 'failed':
        return {
          bg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
          dot: 'bg-rose-400',
          icon: AlertCircle,
          label: 'Failed'
        };
      default:
        return {
          bg: 'bg-slate-800 text-slate-300 border-slate-700',
          dot: 'bg-slate-400',
          icon: Clock,
          label: st || 'Unknown'
        };
    }
  };

  const config = getBadgeConfig(status);
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${config.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <Icon className="w-3.5 h-3.5" />
      <span>{config.label}</span>
    </span>
  );
};
