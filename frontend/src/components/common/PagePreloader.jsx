import React, { useState, useEffect } from 'react';

export default function PagePreloader({ minDisplayTime = 1400 }) {
  const [isVisible, setIsVisible] = useState(true);
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      const removeTimer = setTimeout(() => {
        setShouldRender(false);
      }, 500);
      return () => clearTimeout(removeTimer);
    }, minDisplayTime);

    return () => clearTimeout(timer);
  }, [minDisplayTime]);

  if (!shouldRender) return null;

  return (
    <div
      style={{
        backgroundColor: '#0C1B33',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 999999,
        margin: 0,
        padding: 0,
        overflow: 'hidden'
      }}
      className={`fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-[#0C1B33] transition-opacity duration-500 ease-out ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="relative flex flex-col items-center justify-center gap-5 select-none">
        {/* Glowing Animated Ring around Logo */}
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-3 border-[#00C9AF]/20 border-t-[#00C9AF] animate-[spin_1s_linear_infinite]" />
          <div className="absolute inset-2 rounded-full border-2 border-[#13EDE5]/15 border-b-[#13EDE5] animate-[spin_1.5s_linear_infinite_reverse]" />
          <img
            src="/img/light-logo.svg"
            alt="Selectt"
            className="w-14 h-14 sm:w-16 sm:h-16 object-contain animate-pulse"
            onError={(e) => {
              e.currentTarget.src = '/favicon.png';
            }}
          />
        </div>

        {/* Brand Text & Status */}
        <div className="flex flex-col items-center gap-1.5 text-center">
          <h1 className="text-xl sm:text-2xl font-black tracking-wider text-white font-['Plus_Jakarta_Sans',sans-serif]">
            SELECTT<span className="text-[#00C9AF]">.</span>
          </h1>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00C9AF] animate-ping inline-block" />
            <span className="text-xs sm:text-sm font-semibold tracking-widest text-emerald-300/80 uppercase">
              Certified Cars & Instant Quotes
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

