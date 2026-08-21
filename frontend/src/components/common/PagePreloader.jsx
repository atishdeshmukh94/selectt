import React, { useState, useEffect } from 'react';

export default function PagePreloader({ message = 'Loading Selectt...', minDisplayTime = 3500 }) {
  const [isVisible, setIsVisible] = useState(true);
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      const removeTimer = setTimeout(() => {
        setShouldRender(false);
      }, 500); // 500ms smooth fade out transition
      return () => clearTimeout(removeTimer);
    }, minDisplayTime);

    return () => clearTimeout(timer);
  }, [minDisplayTime]);

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white transition-opacity duration-500 ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="flex flex-col items-center justify-center space-y-4 p-4 text-center">
        <img
          src="/img/St.gif"
          alt="Selectt Loading..."
          className="w-48 sm:w-60 md:w-72 h-auto object-contain max-h-56 filter drop-shadow-xs"
          onError={(e) => {
            e.currentTarget.src = "/St.gif";
          }}
        />
        {message && (
          <p className="text-xs sm:text-sm font-semibold tracking-wider text-slate-700 uppercase animate-pulse">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
