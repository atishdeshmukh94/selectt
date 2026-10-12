import React, { useEffect, useRef } from 'react';
import lottie from 'lottie-web';
import brandPreloaderAnimation from '../../assets/selectt-brand-preloader.json';

/**
 * Universal Selectt Brand Lottie Preloader Component (from IMG_4600.lottie)
 * Displays the signature Selectt animated logo and car reveal.
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
        animationData: brandPreloaderAnimation,
        rendererSettings: {
          preserveAspectRatio: 'xMidYMid meet'
        }
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
        className={`fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-black ${className}`}
      >
        <div className="relative flex flex-col items-center justify-center w-full h-full p-4 sm:p-6">
          <div
            ref={containerRef}
            className="w-full max-w-[360px] sm:max-w-[480px] md:max-w-[580px] aspect-[16/9] flex items-center justify-center overflow-hidden"
          />
        </div>
      </div>
    );
  }

  return (
    <div
      style={{ backgroundColor: '#090D16' }}
      className={`w-full min-h-[300px] flex flex-col items-center justify-center bg-[#090D16] rounded-2xl p-6 overflow-hidden border border-slate-800/60 shadow-xl ${className}`}
    >
      <div
        ref={containerRef}
        className="w-full max-w-[280px] sm:max-w-[340px] aspect-[16/9] flex items-center justify-center overflow-hidden"
      />
    </div>
  );
}
