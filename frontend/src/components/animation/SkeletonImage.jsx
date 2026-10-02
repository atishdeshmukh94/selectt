import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DEFAULT_CAR_FALLBACK_IMAGE } from '../../config/api';

/**
 * SkeletonImage
 * Follows web.dev/articles/preload-responsive-images:
 * - Pre-allocated aspect ratio container to eliminate Cumulative Layout Shift (CLS)
 * - Clean white / light-grey preloader placeholder with circular spinner ring
 * - Native decoding="async" and fetchPriority support
 * - Smooth fade-in transition on load
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

  // Sanitize initial src: if it's an unsplash stock photo, fallback immediately
  const cleanInitialSrc = (src && !src.includes('images.unsplash.com') && !src.includes('shutterstock.com')) 
    ? src 
    : fallback;

  const [imgSrc, setImgSrc] = useState(cleanInitialSrc);

  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
    const validSrc = (src && !src.includes('images.unsplash.com') && !src.includes('shutterstock.com'))
      ? src
      : fallback;
    setImgSrc(validSrc);
  }, [src, fallback]);

  return (
    <div className={`relative overflow-hidden bg-[#F0F2F5] ${aspectRatio} ${className}`}>
      {/* Circular Preloader Spinner (Shown while loading) */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-[#F0F2F5] z-10 flex items-center justify-center pointer-events-none">
          <div className="w-8 h-8 rounded-full border-[3px] border-slate-300/80 border-t-slate-500 animate-spin" />
        </div>
      )}

      {/* Actual Image */}
      <motion.img
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
        animate={{ opacity: isLoaded ? 1 : 0 }}
        whileHover={hoverZoom ? { scale: 1.03 } : {}}
        transition={{
          opacity: { duration: 0.35, ease: 'easeOut' },
          scale: { duration: 0.35, ease: [0.25, 1, 0.5, 1] },
        }}
        className={`w-full h-full object-cover gpu-accelerated ${imageClassName}`}
        {...props}
      />
    </div>
  );
};

export default SkeletonImage;

