import React from 'react';

const viewports = [
  { width: 375, icon: 'smartphone', label: 'Mobile' },
  { width: 768, icon: 'tablet_mac', label: 'Tablet' },
  { width: 1440, icon: 'desktop_windows', label: 'Desktop' },
];

export const ViewportSwitcher = ({ activeViewport, onSelectViewport }) => {
  return (
    <div className="bg-surface-container-lowest/90 rounded-full p-1 flex items-center border border-outline-variant/30">
      {viewports.map((vp) => {
        const isActive = activeViewport === vp.width;
        return (
          <button
            key={vp.width}
            onClick={() => onSelectViewport(vp.width)}
            className={`p-1.5 rounded-full flex items-center justify-center relative transition-all duration-200 ${
              isActive
                ? 'bg-primary text-white shadow-glow-primary'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
            title={`${vp.label} (${vp.width}px)`}
          >
            <span className="material-symbols-outlined text-[18px]">{vp.icon}</span>
            {isActive && (
              <span className="absolute -bottom-1 -right-1 bg-surface-container-highest text-[8px] px-1 rounded font-mono border border-outline-variant/50 text-on-surface">
                {vp.width}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
