import React from 'react';

/**
 * Lightweight Selectt Brand Preloader Component
 * High performance, zero external libraries (0KB bundle overhead), instant rendering.
 */
export default function VideoPreloader({
  fullScreen = true,
  message = '',
  className = ''
}) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-5">
      <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center">
        {/* Soft glowing ambient circle */}
        <div className="absolute w-28 h-28 rounded-full bg-[#00C9AF]/15 blur-xl animate-pulse" />
        {/* Outer subtle track ring */}
        <div className="w-full h-full border-4 border-slate-200/20 rounded-full" />
        {/* Spinning gradient ring */}
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#00C9AF] border-r-[#00C9AF] animate-spin" />
      </div>
      <span className="text-white text-xs sm:text-sm font-bold tracking-[0.2em] uppercase opacity-90">
        {message || 'Selectt Certified'}
      </span>
    </div>
  );

  if (fullScreen) {
    return (
      <div
        className={`fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-[#0C1B33]/90 backdrop-blur-md ${className}`}
        aria-live="polite"
        role="status"
      >
        {content}
      </div>
    );
  }

  return (
    <div
      className={`w-full min-h-[220px] flex flex-col items-center justify-center bg-[#0C1B33]/50 rounded-2xl p-6 border border-white/5 shadow-xl ${className}`}
      aria-live="polite"
      role="status"
    >
      {content}
    </div>
  );
}
