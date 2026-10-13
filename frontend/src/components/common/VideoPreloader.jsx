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
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative w-14 h-14 flex items-center justify-center">
        {/* Spinning gradient ring */}
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#00C9AF] border-r-[#00C9AF] animate-spin" />
        {/* Signature Brand Badge */}
        <div className="w-9 h-9 rounded-full bg-[#00C9AF] text-[#0C1B33] flex items-center justify-center text-sm font-extrabold shadow-[0_0_15px_rgba(0,201,175,0.5)]">
          S
        </div>
      </div>
      <span className="text-white text-xs font-semibold tracking-wider uppercase opacity-80">
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
