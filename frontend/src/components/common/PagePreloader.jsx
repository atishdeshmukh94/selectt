import React, { useState, useEffect, useRef } from 'react';

const VIDEO_CDN_URL = 'https://ik.imagekit.io/Selectt/branding/selectt-preloader.mp4';
const LOCAL_FALLBACK_URL = '/preloader.mp4';

export default function PagePreloader({ minDisplayTime = 2500 }) {
  // Only show on home page on initial session entry to prevent black screen on direct car pages or refreshes
  const shouldSkip = () => {
    try {
      if (typeof window === 'undefined') return true;
      const path = window.location.pathname;
      // Skip if visiting a specific car, search, admin, or sub-page directly
      if (path !== '/' && path !== '' && path !== '/new-home2' && path !== '/home-2') {
        return true;
      }
      const alreadySeen = sessionStorage.getItem('selectt_preloader_seen');
      if (alreadySeen) return true;
    } catch (_) {}
    return false;
  };

  const [skipInitial] = useState(shouldSkip);
  const [isVisible, setIsVisible] = useState(!skipInitial);
  const [shouldRender, setShouldRender] = useState(!skipInitial);
  const videoRef = useRef(null);
  const startTimeRef = useRef(Date.now());
  const finishedRef = useRef(false);

  const dismiss = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    try {
      sessionStorage.setItem('selectt_preloader_seen', 'true');
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
    if (skipInitial) return;

    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // If autoplay fails, dismiss immediately to prevent blank black screen
        dismiss();
      });
    }

    // Maximum timeout guarantee
    const timer = setTimeout(() => {
      dismiss();
    }, Math.max(minDisplayTime, 2800));

    return () => clearTimeout(timer);
  }, [minDisplayTime, skipInitial]);

  if (!shouldRender || skipInitial) return null;

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
      className={`fixed inset-0 z-[999999] flex items-center justify-center bg-black transition-opacity duration-400 ease-out ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="relative flex items-center justify-center w-full h-full p-0 m-0 bg-black">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          onEnded={handleVideoEnded}
          onError={dismiss}
          style={{
            backgroundColor: '#000000',
            maxHeight: '85vh',
            maxWidth: '85vw',
            objectFit: 'contain',
            outline: 'none',
            border: 'none',
            boxShadow: 'none'
          }}
          className="w-80 sm:w-[420px] md:w-[480px] h-auto object-contain max-h-[85vh] bg-black outline-none border-none"
        >
          <source src={VIDEO_CDN_URL} type="video/mp4" />
          <source src={LOCAL_FALLBACK_URL} type="video/mp4" />
          <source src="/preloader.mov" type="video/quicktime" />
        </video>
      </div>
    </div>
  );
}

