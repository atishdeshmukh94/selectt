import React, { useState, useEffect, useRef } from 'react';

export default function PagePreloader({ minDisplayTime = 3200 }) {
  const [isVisible, setIsVisible] = useState(true);
  const [shouldRender, setShouldRender] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    // Set html & body background to pure black during preloader
    const prevBodyBg = document.body.style.backgroundColor;
    const prevHtmlBg = document.documentElement.style.backgroundColor;
    document.body.style.backgroundColor = '#000000';
    document.documentElement.style.backgroundColor = '#000000';

    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }

    const timer = setTimeout(() => {
      setIsVisible(false);
      const removeTimer = setTimeout(() => {
        setShouldRender(false);
        // Restore background once preloader finishes
        document.body.style.backgroundColor = prevBodyBg;
        document.documentElement.style.backgroundColor = prevHtmlBg;
      }, 600);
      return () => clearTimeout(removeTimer);
    }, minDisplayTime);

    return () => {
      clearTimeout(timer);
      document.body.style.backgroundColor = prevBodyBg;
      document.documentElement.style.backgroundColor = prevHtmlBg;
    };
  }, [minDisplayTime]);

  if (!shouldRender) return null;

  return (
    <div
      style={{
        backgroundColor: '#000000',
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
      className={`fixed inset-0 z-[999999] flex items-center justify-center bg-black transition-opacity duration-600 ease-in-out ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div
        style={{
          backgroundColor: '#000000',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: 0,
          padding: 0
        }}
        className="relative flex items-center justify-center w-full h-full p-0 m-0 bg-black"
      >
        {!videoError ? (
          <video
            ref={videoRef}
            src="/preloader.mov"
            autoPlay
            loop
            muted
            playsInline
            onError={() => setVideoError(true)}
            style={{
              backgroundColor: '#000000',
              maxHeight: '85vh',
              objectFit: 'contain',
              outline: 'none',
              border: 'none',
              boxShadow: 'none'
            }}
            className="w-72 sm:w-96 md:w-[480px] max-w-full h-auto object-contain max-h-[85vh] bg-black outline-none border-none shadow-none"
          >
            <source src="/preloader.mov" type="video/quicktime" />
            <source src="/preloader.mov" type="video/mp4" />
          </video>
        ) : (
          <img
            src="/spiral-css-preloader.gif"
            onError={(e) => { e.currentTarget.src = '/St.gif'; }}
            alt="Loading..."
            style={{ backgroundColor: '#000000' }}
            className="w-56 sm:w-72 md:w-80 h-auto object-contain bg-black"
          />
        )}
      </div>
    </div>
  );
}

