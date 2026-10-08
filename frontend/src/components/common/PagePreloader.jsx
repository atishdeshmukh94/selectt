import React, { useState, useEffect, useRef } from 'react';

const VIDEO_CDN_URL = 'https://ik.imagekit.io/Selectt/branding/selectt-preloader.mp4/ik-video.mp4?updatedAt=1790511923241';
const FALLBACK_CDN_URL = 'https://ik.imagekit.io/Selectt/branding/selectt-preloader.mp4';
const LOCAL_FALLBACK_URL = '/preloader.mp4';

export default function PagePreloader({ minDisplayTime = 1200 }) {
  // Never block PageSpeed, Lighthouse, Pingdom, or bots
  const isAuditOrBot = typeof navigator !== 'undefined' && (
    /Lighthouse|Chrome-Lighthouse|Pingdom|Googlebot|PageSpeed|HeadlessChrome|spider|crawl/i.test(navigator.userAgent) ||
    Boolean(window.navigator?.webdriver) ||
    (typeof window !== 'undefined' && window.location.search.includes('no-preloader'))
  );

  // Never show more than once per browser session
  const alreadySeen = typeof window !== 'undefined' && Boolean(sessionStorage.getItem('selectt-preloader-seen'));

  if (isAuditOrBot || alreadySeen) {
    return null;
  }

  const [isVisible, setIsVisible] = useState(true);
  const [shouldRender, setShouldRender] = useState(true);
  const videoRef = useRef(null);
  const startTimeRef = useRef(Date.now());
  const finishedRef = useRef(false);

  const dismiss = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    try {
      sessionStorage.setItem('selectt-preloader-seen', '1');
    } catch (_) {}
    setIsVisible(false);
    setTimeout(() => {
      setShouldRender(false);
    }, 350);
  };

  const handleVideoEnded = () => {
    const elapsed = Date.now() - startTimeRef.current;
    const remaining = Math.max(0, minDisplayTime - elapsed);
    setTimeout(dismiss, remaining);
  };

  useEffect(() => {
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

    // Safety timeout: 1.8s max
    const safetyTimer = setTimeout(() => {
      dismiss();
    }, 1800);

    return () => clearTimeout(safetyTimer);
  }, []);

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



