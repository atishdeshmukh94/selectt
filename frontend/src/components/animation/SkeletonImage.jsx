import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { DEFAULT_CAR_FALLBACK_IMAGE } from '../../config/api';

/**
 * SkeletonImage
 * Follows web.dev/articles/preload-responsive-images:
 * - Pre-allocated aspect ratio container to eliminate Cumulative Layout Shift (CLS)
 * - Clean white / light-grey preloader placeholder with circular spinner ring
 * - Native decoding="async" and fetchPriority support
 * - Fast native image cache detection (never gets stuck in infinite spinner)
 * - Automatic 2.5s failsafe timeout so images always display
 * - Fallback to clean neutral blank SVG if image fails or backend stops
 */
const SkeletonImage = ({
  src,
  alt = '',
  className = '',
  imageClassName = '',
  aspectRatio = 'aspect-[16/10]',
  hoverZoom = true,
  fallback = DEFAULT_CAR_FALLBACK_IMAGE,
  priority = false,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);

  // Sanitize initial src: if it's an unsplash stock photo, fallback immediately
  const cleanInitialSrc = (src && !src.includes('images.unsplash.com') && !src.includes('shutterstock.com')) 
    ? src 
    : fallback;

  const [imgSrc, setImgSrc] = useState(cleanInitialSrc);

  useEffect(() => {
    let isMounted = true;
    const validSrc = (src && !src.includes('images.unsplash.com') && !src.includes('shutterstock.com'))
      ? src
      : fallback;

    setImgSrc(validSrc);
    setHasError(false);

    // 1. Instant cache check if already present in DOM
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      setIsLoaded(true);
      return;
    }

    // 2. Native DOM Image loader to handle browser cached assets reliably
    const preloader = new Image();
    preloader.src = validSrc;
    if (preloader.complete && preloader.naturalWidth > 0) {
      setIsLoaded(true);
    } else {
      preloader.onload = () => {
        if (isMounted) setIsLoaded(true);
      };
      preloader.onerror = () => {
        if (isMounted) {
          setHasError(true);
          setImgSrc(fallback);
          setIsLoaded(true);
        }
      };
    }

    // 3. Fail-safe timer: reveal after 2.5s maximum so user never sees a stuck spinner
    const timer = setTimeout(() => {
      if (isMounted) setIsLoaded(true);
    }, 2500);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      preloader.onload = null;
      preloader.onerror = null;
    };
  }, [src, fallback]);

  return (
    <div className={`relative overflow-hidden bg-[#F0F2F5] ${aspectRatio} ${className}`}>
      {/* Preloader Spinner (Positioned in background; never blocks loaded images) */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-[#F0F2F5] z-0 flex items-center justify-center pointer-events-none transition-opacity duration-300">
          <div className="w-7 h-7 rounded-full border-[2.5px] border-slate-300/80 border-t-[#00C9AF] animate-spin" />
        </div>
      )}

      {/* Actual Image */}
      <motion.img
        ref={imgRef}
        src={imgSrc}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          if (!hasError && imgSrc !== fallback) {
            setHasError(true);
            setImgSrc(fallback);
          }
          setIsLoaded(true);
        }}
        initial={{ opacity: 0, scale: 1 }}
        animate={{ opacity: isLoaded ? 1 : 0.05 }}
        whileHover={hoverZoom ? { scale: 1.03 } : {}}
        transition={{
          opacity: { duration: 0.25, ease: 'easeOut' },
          scale: { duration: 0.35, ease: [0.25, 1, 0.5, 1] },
        }}
        className={`relative z-[1] w-full h-full object-cover gpu-accelerated ${imageClassName}`}
        {...props}
      />
    </div>
  );
};

export default SkeletonImage;
