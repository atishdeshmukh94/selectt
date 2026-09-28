import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DEFAULT_CAR_FALLBACK_IMAGE } from '../../config/api';

/**
 * SkeletonImage
 * Guideline 9:
 * - Lazy-loads with skeleton shimmer placeholder
 * - Fades in smoothly after loading
 * - Subtle zoom on hover (1.03 scale)
 * - Retains consistent rounded corners
 * - Automatic fallback for broken/missing images
 */
const SkeletonImage = ({
  src,
  alt,
  className = '',
  imageClassName = '',
  aspectRatio = 'aspect-[16/10]',
  hoverZoom = true,
  fallback = DEFAULT_CAR_FALLBACK_IMAGE,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [imgSrc, setImgSrc] = useState(src || fallback);

  useEffect(() => {
    setImgSrc(src || fallback);
  }, [src, fallback]);

  return (
    <div className={`relative overflow-hidden ${aspectRatio} ${className}`}>
      {/* Skeleton Shimmer Overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-slate-800/40 animate-shimmer z-10 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-[#00C9AF]/20 border-t-[#00C9AF] rounded-full animate-spin" />
        </div>
      )}

      {/* Actual Image */}
      <motion.img
        src={imgSrc}
        alt={alt}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          if (imgSrc !== fallback) {
            setImgSrc(fallback);
          }
          setIsLoaded(true);
        }}
        initial={{ opacity: 0, scale: 1 }}
        animate={{ opacity: isLoaded ? 1 : 0 }}
        whileHover={hoverZoom ? { scale: 1.03 } : {}}
        transition={{
          opacity: { duration: 0.5, ease: 'easeOut' },
          scale: { duration: 0.35, ease: [0.25, 1, 0.5, 1] },
        }}
        className={`w-full h-full object-cover gpu-accelerated ${imageClassName}`}
        {...props}
      />
    </div>
  );
};

export default SkeletonImage;

