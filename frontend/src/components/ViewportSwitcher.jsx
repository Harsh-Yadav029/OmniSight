import React from 'react';
import { Smartphone, Tablet, Monitor } from 'lucide-react';

export const ViewportSwitcher = ({ activeViewport, onSelectViewport }) => {
  const viewports = [
    { id: 375, name: 'Mobile', width: '375px', icon: Smartphone, desc: 'iPhone / Mobile' },
    { id: 768, name: 'Tablet', width: '768px', icon: Tablet, desc: 'iPad / Tablet' },
    { id: 1440, name: 'Desktop', width: '1440px', icon: Monitor, desc: 'Desktop / FHD' },
  ];

  return (
    <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 border border-slate-800 rounded-xl">
      {viewports.map((vp) => {
        const Icon = vp.icon;
        const isActive = activeViewport === vp.id;
        return (
          <button
            key={vp.id}
            onClick={() => onSelectViewport(vp.id)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
              isActive
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{vp.name}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded ${isActive ? 'bg-indigo-700/60 text-indigo-100' : 'bg-slate-800 text-slate-400'}`}>
              {vp.width}
            </span>
          </button>
        );
      })}
    </div>
  );
};
