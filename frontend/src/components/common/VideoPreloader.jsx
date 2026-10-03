import React, { useEffect, useRef } from 'react';

export const PRELOADER_VIDEO_URL = 'https://ik.imagekit.io/Selectt/branding/selectt-preloader.mp4/ik-video.mp4?updatedAt=1790511923241';
export const PRELOADER_FALLBACK_URL = 'https://ik.imagekit.io/Selectt/branding/selectt-preloader.mp4';
export const PRELOADER_LOCAL_URL = '/preloader.mp4';

/**
 * Universal Selectt Video Preloader Component
 * Shows the branded animated video preloader with automatic fallback and smooth looping.
 */
export default function VideoPreloader({
  fullScreen = true,
  loop = true,
  message = '',
  className = ''
}) {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = true;
      video.defaultMuted = true;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Browser autoplay policy suppression handled
        });
      }
    }
  }, []);

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
        <div className="relative flex flex-col items-center justify-center w-full h-full p-4 bg-black">
          <video
            ref={videoRef}
            src={PRELOADER_VIDEO_URL}
            autoPlay
            muted
            loop={loop}
            playsInline
            webkit-playsinline="true"
            preload="auto"
            onError={(e) => {
              if (
                e.target.src !== PRELOADER_FALLBACK_URL &&
                e.target.src !== window.location.origin + PRELOADER_LOCAL_URL
              ) {
                e.target.src = PRELOADER_FALLBACK_URL;
              }
            }}
            style={{
              backgroundColor: '#000000',
              maxHeight: '80vh',
              maxWidth: '85vw',
              objectFit: 'contain',
              outline: 'none',
              border: 'none'
            }}
            className="w-72 sm:w-96 md:w-[460px] h-auto object-contain bg-black outline-none border-none pointer-events-none"
          >
            <source src={PRELOADER_VIDEO_URL} type="video/mp4" />
            <source src={PRELOADER_FALLBACK_URL} type="video/mp4" />
            <source src={PRELOADER_LOCAL_URL} type="video/mp4" />
          </video>
          {message && (
            <p className="text-xs font-semibold text-slate-400 mt-2 tracking-wider uppercase animate-pulse">
              {message}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{ backgroundColor: '#000000' }}
      className={`w-full min-h-[50vh] flex flex-col items-center justify-center bg-black rounded-2xl p-6 overflow-hidden ${className}`}
    >
      <video
        ref={videoRef}
        src={PRELOADER_VIDEO_URL}
        autoPlay
        muted
        loop={loop}
        playsInline
        webkit-playsinline="true"
        preload="auto"
        onError={(e) => {
          if (
            e.target.src !== PRELOADER_FALLBACK_URL &&
            e.target.src !== window.location.origin + PRELOADER_LOCAL_URL
          ) {
            e.target.src = PRELOADER_FALLBACK_URL;
          }
        }}
        style={{
          backgroundColor: '#000000',
          maxHeight: '55vh',
          maxWidth: '80vw',
          objectFit: 'contain',
          outline: 'none',
          border: 'none'
        }}
        className="w-64 sm:w-80 h-auto object-contain bg-black outline-none border-none pointer-events-none"
      >
        <source src={PRELOADER_VIDEO_URL} type="video/mp4" />
        <source src={PRELOADER_FALLBACK_URL} type="video/mp4" />
        <source src={PRELOADER_LOCAL_URL} type="video/mp4" />
      </video>
      {message && (
        <p className="text-xs font-semibold text-slate-400 mt-2 tracking-wider uppercase animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
}
