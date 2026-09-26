import React from 'react';
import { IKContext, IKImage } from 'imagekitio-react';

const URL_ENDPOINT = import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/selectt';
const PUBLIC_KEY = import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY || 'public_6cuIDfKYa22dql//M1rxKCv0Y0o=';

/**
 * High-performance ImageKit Image Component with Lazy Loading & Auto-Formatting
 *
 * @example
 * <ImageKitImage
 *   src={car.image}
 *   alt={car.title}
 *   width={600}
 *   height={400}
 *   className="w-full h-full object-cover rounded-xl"
 * />
 */
export default function ImageKitImage({
  src,
  alt = '',
  width,
  height,
  quality = 80,
  className = '',
  loading = 'lazy',
  lqip = true,
  transformation = [],
  ...props
}) {
  if (!src) return null;

  // Build transformation array
  const transforms = [...transformation];
  if (width || height || quality) {
    const tr = {
      ...(width && { width: String(width) }),
      ...(height && { height: String(height) }),
      quality: String(quality),
      format: 'auto'
    };
    transforms.unshift(tr);
  }

  // If already an external absolute URL (not ImageKit), fallback to standard img
  const isExternalNonIk = (src.startsWith('http://') || src.startsWith('https://')) && !src.includes('ik.imagekit.io');

  if (isExternalNonIk) {
    return (
      <img
        src={src}
        alt={alt}
        loading={loading}
        className={className}
        {...props}
      />
    );
  }

  // Clean path for ImageKit
  let path = src;
  if (src.includes('ik.imagekit.io')) {
    try {
      const parsed = new URL(src);
      path = parsed.pathname;
    } catch (e) {
      path = src;
    }
  }

  return (
    <IKContext
      urlEndpoint={URL_ENDPOINT}
      publicKey={PUBLIC_KEY}
    >
      <IKImage
        path={path.startsWith('/') ? path : `/${path}`}
        alt={alt}
        loading={loading}
        lqip={lqip ? { active: true, quality: 20 } : undefined}
        transformation={transforms}
        className={className}
        {...props}
      />
    </IKContext>
  );
}
