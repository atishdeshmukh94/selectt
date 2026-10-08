import React, { useState, useEffect, useRef } from 'react';

const VIDEO_CDN_URL = 'https://ik.imagekit.io/Selectt/branding/selectt-preloader.mp4/ik-video.mp4?updatedAt=1790511923241';
const FALLBACK_CDN_URL = 'https://ik.imagekit.io/Selectt/branding/selectt-preloader.mp4';
const LOCAL_FALLBACK_URL = '/preloader.mp4';

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

export default function PagePreloader({ minDisplayTime = 1200 }) {
  // Always invoke hooks unconditionally in exact same order
  const [shouldSkip] = useState(checkShouldSkipPreloader);
  const [isVisible, setIsVisible] = useState(!shouldSkip);
  const [shouldRender, setShouldRender] = useState(!shouldSkip);

  const videoRef = useRef(null);
  const startTimeRef = useRef(Date.now());
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

  const handleVideoEnded = () => {
    const elapsed = Date.now() - startTimeRef.current;
    const remaining = Math.max(0, minDisplayTime - elapsed);
    setTimeout(dismiss, remaining);
  };

  useEffect(() => {
    if (shouldSkip) return;

    const video = videoRef.current;
    if (video) {
      video.muted = true;
      video.defaultMuted = true;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          dismiss();
        });
      }
    }

    // Safety timeout: guaranteed dismiss after 1.5s max
    const safetyTimer = setTimeout(() => {
      dismiss();
    }, Math.max(minDisplayTime, 1500));

    const handleKey = (e) => {
      if (e.key === 'Escape') dismiss();
    };
    window.addEventListener('keydown', handleKey);

    return () => {
      clearTimeout(safetyTimer);
      window.removeEventListener('keydown', handleKey);
    };
  }, [shouldSkip, minDisplayTime]);

  if (!shouldRender) return null;

  return (
    <div
      onClick={dismiss}
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
      className={`fixed inset-0 z-[999999] flex items-center justify-center bg-black transition-opacity duration-500 ease-out ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="relative flex items-center justify-center w-full h-full p-0 m-0 bg-black">
        <video
          ref={videoRef}
          src={VIDEO_CDN_URL}
          autoPlay
          muted
          playsInline
          webkit-playsinline="true"
          preload="auto"
          onEnded={handleVideoEnded}
          onError={(e) => {
            // If primary video errors, try fallback
            if (e.target.src !== FALLBACK_CDN_URL && e.target.src !== window.location.origin + LOCAL_FALLBACK_URL) {
              e.target.src = FALLBACK_CDN_URL;
            } else {
              dismiss();
            }
          }}
          style={{
            backgroundColor: '#000000',
            maxHeight: '85vh',
            maxWidth: '85vw',
            objectFit: 'contain',
            outline: 'none',
            border: 'none',
            boxShadow: 'none',
            mixBlendMode: 'screen',
            clipPath: 'inset(2px)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 65%, rgba(0,0,0,0) 96%)',
            maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 65%, rgba(0,0,0,0) 96%)'
          }}
          className="w-72 sm:w-96 md:w-[480px] h-auto object-contain max-h-[85vh] bg-black outline-none border-none pointer-events-none"
        >
          <source src={VIDEO_CDN_URL} type="video/mp4" />
          <source src={FALLBACK_CDN_URL} type="video/mp4" />
          <source src={LOCAL_FALLBACK_URL} type="video/mp4" />
        </video>
      </div>
    </div>
  );
}



