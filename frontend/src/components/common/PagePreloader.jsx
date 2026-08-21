import React, { useState, useEffect } from 'react';

export default function PagePreloader({ minDisplayTime = 3500 }) {
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
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-white transition-opacity duration-500 ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="flex items-center justify-center p-4 text-center">
        <img
          src="/img/St.gif"
          alt="Selectt Loading"
          className="w-52 sm:w-64 md:w-80 h-auto object-contain max-h-64 filter drop-shadow-xs"
          onError={(e) => {
            e.currentTarget.src = "/St.gif";
          }}
        />
      </div>
    </div>
  );
}
