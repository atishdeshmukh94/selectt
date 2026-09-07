import React, { useState, useEffect, useRef } from 'react';

export default function PagePreloader({ minDisplayTime = 3200 }) {
  const [isVisible, setIsVisible] = useState(true);
  const [shouldRender, setShouldRender] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }

    const timer = setTimeout(() => {
      setIsVisible(false);
      const removeTimer = setTimeout(() => {
        setShouldRender(false);
      }, 600);
      return () => clearTimeout(removeTimer);
    }, minDisplayTime);

    return () => clearTimeout(timer);
  }, [minDisplayTime]);

  if (!shouldRender) return null;

  return (
    <div
      style={{ backgroundColor: '#000000' }}
      className={`fixed inset-0 z-[99999] flex items-center justify-center bg-black transition-opacity duration-600 ease-in-out ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="relative flex items-center justify-center w-full h-full p-0 m-0 bg-black">
        {!videoError ? (
          <video
            ref={videoRef}
            src="/preloader.mov"
            autoPlay
            loop
            muted
            playsInline
            onError={() => setVideoError(true)}
            className="w-72 sm:w-96 md:w-[480px] max-w-full h-auto object-contain max-h-[85vh] bg-black outline-none border-none shadow-none"
          >
            <source src="/preloader.mov" type="video/quicktime" />
            <source src="/preloader.mov" type="video/mp4" />
          </video>
        ) : (
          <img
            src="/img/spiral-css-preloader.gif"
            alt="Loading..."
            className="w-56 sm:w-72 md:w-80 h-auto object-contain bg-black"
          />
        )}
      </div>
    </div>
  );
}
