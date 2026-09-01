import React from 'react';

const viewports = [
  { width: 375, icon: 'smartphone', label: 'Mobile' },
  { width: 768, icon: 'tablet_mac', label: 'Tablet' },
  { width: 1440, icon: 'desktop_windows', label: 'Desktop' },
];

export const ViewportSwitcher = ({ activeViewport, onSelectViewport }) => {
  return (
    <div className="bg-white rounded-full p-1 flex items-center border border-[#E8E6E1] shadow-sm">
      {viewports.map((vp) => {
        const isActive = activeViewport === vp.width;
        return (
          <button
            key={vp.width}
            onClick={() => onSelectViewport(vp.width)}
            className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all duration-200 ${
              isActive
                ? 'bg-primary-container text-white shadow-sm font-semibold'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/50'
            }`}
            title={`${vp.label} (${vp.width}px)`}
          >
            <span className="material-symbols-outlined text-[16px]">{vp.icon}</span>
            <span className="text-body-sm hidden sm:inline">{vp.label}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
              isActive ? 'bg-white/20 text-white' : 'bg-surface-container-high text-on-surface-variant'
            }`}>
              {vp.width}px
            </span>
          </button>
        );
      })}
    </div>
  );
};
