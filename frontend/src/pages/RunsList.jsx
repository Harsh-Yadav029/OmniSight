import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  GitBranch, 
  GitCommit, 
  Clock, 
  ArrowRight, 
  Search, 
  Filter, 
  Layers, 
  CheckCircle2, 
  Wrench, 
  RefreshCw,
  Eye
} from 'lucide-react';
import { api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';

export const RunsList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // React Query fetching runs with 5-second polling on in-progress runs
  const { data: runs = [], isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['runs'],
    queryFn: () => api.getRuns(),
    refetchInterval: (query) => {
      const activeRuns = query.state.data?.some((r) => 
        ['pending', 'analyzing', 'fix_applied', 'screenshots_captured'].includes(r.status)
      );
      return activeRuns ? 5000 : false;
    }
  });

  const filteredRuns = runs.filter((run) => {
    const matchesSearch = 
      (run.repo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (run.branch || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (run.commitSha || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (run._id || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || run.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate high-level summary metrics
  const totalRuns = runs.length;
  const verifiedRuns = runs.filter((r) => r.status === 'verified' || r.status === 'pr_created' || r.status === 'completed').length;
  const activeRuns = runs.filter((r) => ['pending', 'analyzing', 'fix_applied', 'screenshots_captured'].includes(r.status)).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Build Regression Runs
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Automated multi-viewport visual audits, Gemini defect analysis, and self-healed pull requests.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="self-start md:self-auto flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold rounded-xl transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin text-indigo-400' : ''}`} />
          <span>{isFetching ? 'Syncing Runs...' : 'Refresh'}</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Build Runs</span>
            <Layers className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-extrabold text-white mt-2">{totalRuns}</p>
        </div>

        <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-400">Verified & Healed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-extrabold text-white mt-2">{verifiedRuns}</p>
        </div>

        <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-400">Active Pipelines</span>
            <Wrench className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-extrabold text-white mt-2">{activeRuns}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 bg-slate-900/40 border border-slate-800 rounded-2xl">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search runs by commit, branch, or repo..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="verified">Verified & Healed</option>
            <option value="pr_created">PR Created</option>
            <option value="analyzing">VLM Analyzing</option>
            <option value="fix_applied">Fix Applied</option>
            <option value="screenshots_captured">Screenshots Captured</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Runs Table / Cards */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-400 space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-400" />
          <p className="text-sm font-semibold">Loading build runs from MongoDB...</p>
        </div>
      ) : filteredRuns.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-2xl text-slate-400 space-y-3">
          <Eye className="w-8 h-8 mx-auto text-slate-600" />
          <h3 className="text-base font-bold text-slate-200">No Build Runs Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Trigger a CI webhook event or run `ml-service/main.py` to initiate visual regression testing.
          </p>
        </div>
      ) : (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-6 py-4">Build Run ID</th>
                  <th className="px-6 py-4">Branch & Repository</th>
                  <th className="px-6 py-4">Commit SHA</th>
                  <th className="px-6 py-4">Lifecycle Status</th>
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredRuns.map((run) => (
                  <tr key={run._id} className="hover:bg-slate-800/40 transition group">
                    <td className="px-6 py-4 font-mono font-bold text-slate-200">
                      {run._id}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 font-semibold text-white">
                        <GitBranch className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span>{run.branch || 'main'}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{run.repo || 'test/repo'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 font-mono text-slate-300 bg-slate-950 px-2 py-1 rounded border border-slate-800 w-fit">
                        <GitCommit className="w-3 h-3 text-slate-500" />
                        <span>{(run.commitSha || 'unknown').substring(0, 7)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={run.status} />
                    </td>
                    <td className="px-6 py-4 text-slate-400 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-[11px]">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{run.createdAt ? new Date(run.createdAt).toLocaleString() : 'Just now'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/runs/${run._id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/20 transition group-hover:scale-105"
                      >
                        <span>View Details</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
