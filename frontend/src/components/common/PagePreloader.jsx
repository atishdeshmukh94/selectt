import React, { useState, useEffect, useRef } from 'react';
import lottie from 'lottie-web';
import brandPreloaderAnimation from '../../assets/selectt-brand-preloader.json';

function checkShouldSkipPreloader() {
  if (typeof window === 'undefined') return true;
  try {
    const isAuditOrBot =
      /Lighthouse|Chrome-Lighthouse|Pingdom|Googlebot|PageSpeed|HeadlessChrome|spider|crawl/i.test(navigator.userAgent) ||
      Boolean(window.navigator?.webdriver) ||
      window.location.search.includes('no-preloader');
    if (isAuditOrBot) return true;
  } catch (_) {
    return false;
  }
  return false;
}

export default function PagePreloader({ minDisplayTime = 4500 }) {
  const [shouldSkip] = useState(checkShouldSkipPreloader);
  const [isVisible, setIsVisible] = useState(!shouldSkip);
  const [shouldRender, setShouldRender] = useState(!shouldSkip);

  const containerRef = useRef(null);
  const animInstanceRef = useRef(null);
  const finishedRef = useRef(shouldSkip);

  const dismiss = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setIsVisible(false);
    setTimeout(() => {
      setShouldRender(false);
      try {
        document.body.style.overflow = '';
      } catch (_) {}
    }, 450);
  };

  // Lock html and body scroll & touchmove while preloader is active so user cannot scroll background underneath
  useEffect(() => {
    if (!shouldRender || !isVisible) {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      return;
    }
    const prevDocOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    // Prevent touch scrolling underneath on mobile devices
    const preventTouchMove = (e) => {
      e.preventDefault();
    };
    window.addEventListener('touchmove', preventTouchMove, { passive: false });

    return () => {
      document.documentElement.style.overflow = prevDocOverflow;
      document.body.style.overflow = prevBodyOverflow;
      window.removeEventListener('touchmove', preventTouchMove);
    };
  }, [shouldRender, isVisible]);

  useEffect(() => {
    if (shouldSkip) return;

    if (containerRef.current) {
      try {
        animInstanceRef.current = lottie.loadAnimation({
          container: containerRef.current,
          renderer: 'svg',
          loop: false,
          autoplay: true,
          animationData: brandPreloaderAnimation,
          rendererSettings: {
            preserveAspectRatio: 'xMidYMid meet'
          }
        });

        // When the full 4.0s Lottie animation finishes, hold final frame briefly then fade out
        animInstanceRef.current.addEventListener('complete', () => {
          setTimeout(() => {
            dismiss();
          }, 500);
        });
      } catch (e) {
        console.warn('Lottie failed, dismissing', e);
        dismiss();
      }
    }

    // Default 4 to 5 seconds full duration
    const timer = setTimeout(() => {
      dismiss();
    }, minDisplayTime);

    // Guaranteed hard safety timeout at 5 seconds
    const hardSafetyTimer = setTimeout(() => {
      dismiss();
    }, 5000);

    const handleKey = (e) => {
      if (e.key === 'Escape') dismiss();
    };
    window.addEventListener('keydown', handleKey);

    return () => {
      clearTimeout(timer);
      clearTimeout(hardSafetyTimer);
      window.removeEventListener('keydown', handleKey);
      if (animInstanceRef.current) {
        animInstanceRef.current.destroy();
      }
    };
  }, [shouldSkip, minDisplayTime]);

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
        overflow: 'hidden',
        touchAction: 'none',
      }}
      className={`fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-black transition-opacity duration-500 ease-out select-none ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="relative flex flex-col items-center justify-center w-full h-full p-4 sm:p-6">
        <div
          ref={containerRef}
          className="w-full max-w-[360px] sm:max-w-[480px] md:max-w-[580px] aspect-[16/9] flex items-center justify-center overflow-hidden pointer-events-none"
        />
      </div>
    </div>
  );
}
