import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Activity, RefreshCw, CheckCircle2, AlertTriangle, 
  Clock, Eye, EyeOff, ShieldCheck, Key, ShieldAlert,
  ChevronDown, ChevronUp, ServerCrash, Cpu
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PingResult {
  name: string;
  key: string;
  type: string;
  status: 'Active' | 'Failed';
  latency: number;
  error?: string;
}

interface SystemHealthStatusProps {
  token: string;
}

export const SystemHealthStatus: React.FC<SystemHealthStatusProps> = ({ token }) => {
  const [results, setResults] = useState<PingResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedName, setExpandedName] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('All');

  const runDiagnostics = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post('/api/admin/keys/ping', { token });
      if (response.data && response.data.success) {
        setResults(response.data.results);
        setLastChecked(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      } else {
        setError(response.data.error || 'Failed to retrieve ping status.');
      }
    } catch (err: any) {
      console.error('Diagnostics error:', err);
      setError(err.response?.data?.error || err.message || 'An error occurred during diagnostics.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      runDiagnostics();
    }
  }, [token]);

  const toggleExpand = (name: string) => {
    setExpandedName(expandedName === name ? null : name);
  };

  const computedTypes = Array.from(new Set(results.map(r => r.type))).sort();
  const types = ['All', ...(computedTypes.length > 0 ? computedTypes : ['Gemini', 'Tavily', 'Serper'])];
  
  const filteredResults = filterType === 'All' 
    ? results 
    : results.filter(r => r.type.toLowerCase() === filterType.toLowerCase());

  const activeCount = results.filter(r => r.status === 'Active').length;
  const failedCount = results.filter(r => r.status === 'Failed').length;

  return (
    <div className="p-6 bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-900 rounded-3xl space-y-6 shadow-sm">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white flex items-center gap-2">
            <Activity size={16} className="text-cyan-500 animate-pulse" /> LIVE DIAGNOSTICS & SYSTEM STATUS
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Real-time latency check and functional status verification of external API keys.
          </p>
        </div>
        <button
          onClick={runDiagnostics}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-black uppercase tracking-wider active:scale-95 transition-all cursor-pointer border border-gray-100 dark:border-gray-800 disabled:opacity-50"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          {isLoading ? 'Pinging Keys...' : 'Trigger Diagnostics'}
        </button>
      </div>

      {/* Summary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl flex items-center gap-3 border border-gray-100 dark:border-gray-900">
          <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-950/40 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
            <Cpu size={18} />
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500">Total Key Nodes</div>
            <div className="text-lg font-extrabold text-gray-800 dark:text-white mt-0.5">{results.length}</div>
          </div>
        </div>

        <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/10 rounded-2xl flex items-center gap-3 border border-emerald-100/30 dark:border-emerald-900/20">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 size={18} />
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-500">Healthy & Active</div>
            <div className="text-lg font-extrabold text-emerald-700 dark:text-emerald-400 mt-0.5">{activeCount} / {results.length}</div>
          </div>
        </div>

        <div className="p-4 bg-red-50/50 dark:bg-red-950/10 rounded-2xl flex items-center gap-3 border border-red-100/30 dark:border-red-900/20">
          <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/40 flex items-center justify-center text-red-600 dark:text-red-400">
            <AlertTriangle size={18} />
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-wider text-red-600 dark:text-red-500">Failing / Quota Error</div>
            <div className="text-lg font-extrabold text-red-700 dark:text-red-400 mt-0.5">{failedCount} / {results.length}</div>
          </div>
        </div>
      </div>

      {/* Filter and Last checked section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-gray-100 dark:border-gray-900">
        <div className="flex items-center gap-1.5 flex-wrap">
          {types.map(t => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                filterType === t 
                  ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-950 shadow-sm'
                  : 'bg-gray-50 dark:bg-gray-900 text-gray-500 hover:text-gray-800 dark:hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        {lastChecked && (
          <div className="flex items-center gap-1 text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">
            <Clock size={12} /> Last Checked: {lastChecked}
          </div>
        )}
      </div>

      {/* Main Results Dashboard */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-2xl text-xs font-medium border border-red-500/10 flex items-center gap-2">
          <ShieldAlert size={14} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-900">
                <th className="py-3 px-4 text-[9px] font-black uppercase tracking-wider text-gray-400">Provider Node</th>
                <th className="py-3 px-4 text-[9px] font-black uppercase tracking-wider text-gray-400">Type</th>
                <th className="py-3 px-4 text-[9px] font-black uppercase tracking-wider text-gray-400">Masked Signature</th>
                <th className="py-3 px-4 text-[9px] font-black uppercase tracking-wider text-gray-400">Diagnostic Status</th>
                <th className="py-3 px-4 text-[9px] font-black uppercase tracking-wider text-gray-400 text-right">Latency</th>
                <th className="py-3 px-4 text-[9px] font-black uppercase tracking-wider text-gray-400"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-900">
              {isLoading && results.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400 dark:text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw size={24} className="animate-spin text-cyan-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest mt-1">Pinging all key nodes... Please wait</span>
                    </div>
                  </td>
                </tr>
              ) : filteredResults.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400 dark:text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <ServerCrash size={24} className="text-gray-300 dark:text-gray-700" />
                      <span className="text-[10px] font-black uppercase tracking-widest mt-1">No configured API keys matching category</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredResults.map((item, index) => {
                  const isExpanded = expandedName === item.name;
                  const statusColor = item.status === 'Active'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                    : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20';
                  
                  return (
                    <React.Fragment key={item.name + '-' + index}>
                      <tr className="hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-all">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${item.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                            <span className="font-mono font-black text-xs text-gray-800 dark:text-white uppercase tracking-tight">{item.name}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                            {item.type}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[10px] text-gray-500 font-bold dark:text-gray-400">
                          {item.key}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-wider ${statusColor}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-black text-xs text-gray-600 dark:text-gray-300">
                          {item.status === 'Active' ? (
                            <span className={`${item.latency > 1500 ? 'text-amber-500' : 'text-emerald-500'}`}>
                              {item.latency}ms
                            </span>
                          ) : '---'}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {item.error ? (
                            <button
                              onClick={() => toggleExpand(item.name)}
                              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors cursor-pointer"
                              title="Toggle diagnostics details"
                            >
                              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>
                          ) : (
                            <div className="w-6" />
                          )}
                        </td>
                      </tr>
                      {/* Expanded diagnostic output details */}
                      <AnimatePresence>
                        {isExpanded && item.error && (
                          <tr>
                            <td colSpan={6} className="bg-gray-50/50 dark:bg-gray-900/10 px-4 py-3">
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="p-3 bg-red-50/50 dark:bg-red-950/10 rounded-xl border border-red-500/10 text-[10px] font-mono text-red-600 dark:text-red-400 leading-relaxed whitespace-pre-wrap max-w-3xl">
                                  <div className="font-bold uppercase tracking-wider mb-1 flex items-center gap-1 text-red-700 dark:text-red-300">
                                    <ShieldAlert size={12} /> Failure Report:
                                  </div>
                                  {item.error}
                                </div>
                              </motion.div>
                            </td>
                          </tr>
                        )}
                      </AnimatePresence>
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
