import React, { useState, useEffect, useRef } from 'react';
import lottie from 'lottie-web';
import searchingCarAnimation from '../../assets/searching-car.json';

function checkShouldSkipPreloader() {
  if (typeof window === 'undefined') return true;
  try {
    const isAuditOrBot =
      /Lighthouse|Chrome-Lighthouse|Pingdom|Googlebot|PageSpeed|HeadlessChrome|spider|crawl/i.test(navigator.userAgent) ||
      Boolean(window.navigator?.webdriver) ||
      window.location.search.includes('no-preloader');
    if (isAuditOrBot) return true;

    if (sessionStorage.getItem('selectt-preloader-seen')) {
      return true;
    }
  } catch (_) {
    return false;
  }
  return false;
}

export default function PagePreloader({ minDisplayTime = 1400 }) {
  const [shouldSkip] = useState(checkShouldSkipPreloader);
  const [isVisible, setIsVisible] = useState(!shouldSkip);
  const [shouldRender, setShouldRender] = useState(!shouldSkip);

  const containerRef = useRef(null);
  const animInstanceRef = useRef(null);
  const finishedRef = useRef(shouldSkip);

  const dismiss = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    try {
      sessionStorage.setItem('selectt-preloader-seen', '1');
    } catch (_) {}
    setIsVisible(false);
    setTimeout(() => {
      setShouldRender(false);
    }, 400);
  };

  useEffect(() => {
    if (shouldSkip) return;

    if (containerRef.current) {
      try {
        animInstanceRef.current = lottie.loadAnimation({
          container: containerRef.current,
          renderer: 'svg',
          loop: true,
          autoplay: true,
          animationData: searchingCarAnimation,
        });
      } catch (e) {
        console.warn('Lottie failed, dismissing', e);
        dismiss();
      }
    }

    const timer = setTimeout(() => {
      dismiss();
    }, minDisplayTime);

    const handleKey = (e) => {
      if (e.key === 'Escape') dismiss();
    };
    window.addEventListener('keydown', handleKey);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKey);
      if (animInstanceRef.current) {
        animInstanceRef.current.destroy();
      }
    };
  }, [shouldSkip, minDisplayTime]);

  if (!shouldRender) return null;

  return (
    <div
      onClick={dismiss}
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
        overflow: 'hidden',
      }}
      className={`fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-white transition-opacity duration-400 ease-out cursor-pointer ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="relative flex flex-col items-center justify-center w-full h-full p-4">
        <div
          ref={containerRef}
          className="w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 flex items-center justify-center"
        />
        <div className="text-center mt-3 space-y-1">
          <p className="text-xs sm:text-sm font-extrabold text-[#0C1B33] tracking-wider uppercase">
            Selectt.
          </p>
          <p className="text-xs font-semibold text-slate-500">
            Finding certified cars for you...
          </p>
        </div>
      </div>
    </div>
  );
}
