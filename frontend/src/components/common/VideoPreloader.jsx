import React, { useEffect, useRef } from 'react';
import lottie from 'lottie-web';
import searchingCarAnimation from '../../assets/searching-car.json';

/**
 * Universal Selectt Lottie Preloader Component
 * Shows the animated "Searching for a car" vector animation with smooth looping.
 */
export default function VideoPreloader({
  fullScreen = true,
  loop = true,
  message = '',
  className = ''
}) {
  const containerRef = useRef(null);
  const animInstanceRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    try {
      animInstanceRef.current = lottie.loadAnimation({
        container: containerRef.current,
        renderer: 'svg',
        loop: loop,
        autoplay: true,
        animationData: searchingCarAnimation
      });
    } catch (err) {
      console.warn('Lottie preloader animation failed', err);
    }
    return () => {
      if (animInstanceRef.current) {
        animInstanceRef.current.destroy();
      }
    };
  }, [loop]);

  if (fullScreen) {
    return (
      <div
        style={{
          backgroundColor: '#FFFFFF',
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
        className={`fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-white ${className}`}
      >
        <div className="relative flex flex-col items-center justify-center w-full h-full p-4">
          <div
            ref={containerRef}
            className="w-56 h-56 sm:w-72 sm:h-72 md:w-80 md:h-80 flex items-center justify-center"
            style={{ minHeight: '220px' }}
          />
          <p className="text-xs sm:text-sm font-bold text-slate-700 tracking-wide mt-2 text-center animate-pulse">
            {message || 'Finding your perfect car...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{ backgroundColor: '#F8FAFC' }}
      className={`w-full min-h-[340px] flex flex-col items-center justify-center bg-slate-50/90 rounded-2xl p-6 overflow-hidden ${className}`}
    >
      <div
        ref={containerRef}
        className="w-48 h-48 sm:w-60 sm:h-60 flex items-center justify-center"
        style={{ minHeight: '180px' }}
      />
      {message && (
        <p className="text-xs font-semibold text-slate-600 mt-2 tracking-wider text-center animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
}
