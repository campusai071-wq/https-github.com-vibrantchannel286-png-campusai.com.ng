import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Activity, Globe, Calculator, Newspaper, Brain, CheckCircle2, Clock, Smartphone } from 'lucide-react';

const services = [
  { name: 'Platform Website', status: 'Online', icon: <Globe size={20} />, uptime: '99.9%' },
  { name: 'Aggregate Calculator', status: 'Online', icon: <Calculator size={20} />, uptime: '100%' },
  { name: 'News Feed Sync', status: 'Online', icon: <Newspaper size={20} />, uptime: '98.5%' },
  { name: 'AI Assistant Core', status: 'Online', icon: <Brain size={20} />, uptime: '99.9%' },
  { name: 'Authentication System', status: 'Online', icon: <ShieldCheck size={20} />, uptime: '99.9%' },
];

const StatusPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 py-24">
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex items-center gap-4 mb-12">
          <div className="w-16 h-16 bg-emerald-600 rounded-[24px] flex items-center justify-center text-white shadow-2xl shadow-emerald-500/20">
            <Activity size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tight">System Status</h1>
            <div className="flex items-center gap-2 text-emerald-500 font-bold text-xs uppercase tracking-widest mt-1">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              All Systems Operational
            </div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-[40px] border border-gray-100 dark:border-gray-800 overflow-hidden mb-12">
          <div className="p-8 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-between">
            <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">Service Reliability</h2>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Clock size={12} /> Last updated: Just now
            </span>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {services.map((service, idx) => (
              <div key={idx} className="p-8 flex items-center justify-between hover:bg-white dark:hover:bg-gray-800 transition-colors">
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center text-gray-400">
                    {service.icon}
                  </div>
                  <div>
                    <h3 className="font-black text-gray-900 dark:text-white uppercase text-sm tracking-tight">{service.name}</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Uptime: {service.uptime}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-emerald-500 font-black text-[10px] uppercase tracking-widest">{service.status}</span>
                  <CheckCircle2 size={20} className="text-emerald-500" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-8 bg-blue-600 rounded-[32px] text-white shadow-2xl shadow-blue-500/20">
            <h4 className="font-black uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
              <Smartphone size={16} /> Global Latency
            </h4>
            <div className="text-4xl font-black mb-2">4.2ms</div>
            <p className="text-xs font-bold text-blue-100 leading-relaxed">
              Optimized routing through Akure_Hub nodes ensures instant calculation results across all networks.
            </p>
          </div>
          <div className="p-8 bg-gray-900 rounded-[32px] text-white border border-white/5">
            <h4 className="font-black uppercase tracking-widest text-xs mb-4 flex items-center gap-2 text-cyan-400">
              <ShieldCheck size={16} /> Security Node
            </h4>
            <div className="text-2xl font-black mb-2 text-white uppercase tracking-tight">Active & Protected</div>
            <p className="text-xs font-bold text-gray-400 leading-relaxed">
              Real-time threat monitoring and SSL encryption synchronized across all user session intelligence.
            </p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-widest">
            Experiencing an issue? <button onClick={() => window.dispatchEvent(new CustomEvent('campusai_open_support'))} className="text-blue-600 hover:underline">Contact Command Desk</button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default StatusPage;
