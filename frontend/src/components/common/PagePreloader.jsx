import React, { useState, useEffect, useRef } from 'react';

const VIDEO_CDN_URL = 'https://ik.imagekit.io/Selectt/branding/selectt-preloader.mp4';
const LOCAL_FALLBACK_URL = '/preloader.mp4';

export default function PagePreloader({ minDisplayTime = 3200 }) {
  const [isVisible, setIsVisible] = useState(true);
  const [shouldRender, setShouldRender] = useState(true);
  const videoRef = useRef(null);

  const handleFinish = () => {
    setIsVisible(false);
    setTimeout(() => {
      setShouldRender(false);
    }, 500);
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }

    // Safety fallback timer so preloader never hangs
    const timer = setTimeout(() => {
      handleFinish();
    }, minDisplayTime);

    return () => clearTimeout(timer);
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
      className={`fixed inset-0 z-[999999] flex items-center justify-center bg-black transition-opacity duration-500 ease-out ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="relative flex items-center justify-center w-full h-full p-0 m-0 bg-black">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          onEnded={handleFinish}
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

