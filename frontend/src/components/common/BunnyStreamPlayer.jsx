import React from 'react';

const DEFAULT_LIBRARY_ID = import.meta.env.VITE_BUNNY_STREAM_LIBRARY_ID || '';

/**
 * Responsive Bunny Stream Video Player Component
 *
 * @example
 * <BunnyStreamPlayer
 *   videoId="4a32b694-814c-4734-..."
 *   autoplay={false}
 *   title="Luxury Car Walkaround"
 *   className="rounded-2xl overflow-hidden shadow-2xl"
 * />
 */
export default function BunnyStreamPlayer({
  videoId,
  libraryId = DEFAULT_LIBRARY_ID,
  autoplay = false,
  loop = false,
  muted = false,
  preload = true,
  title = 'Video Player',
  className = '',
  aspectRatio = '16/9'
}) {
  if (!videoId) return null;

  // If passed a full embed or video URL, extract videoId
  let cleanVideoId = videoId;
  if (videoId.includes('/embed/')) {
    const parts = videoId.split('/');
    cleanVideoId = parts[parts.length - 1].split('?')[0];
  }

  const queryParams = new URLSearchParams({
    autoplay: autoplay ? 'true' : 'false',
    loop: loop ? 'true' : 'false',
    muted: muted ? 'true' : 'false',
    preload: preload ? 'true' : 'false',
    responsive: 'true'
  }).toString();

  const embedUrl = `https://iframe.mediadelivery.net/embed/${libraryId}/${cleanVideoId}?${queryParams}`;

  return (
    <div
      className={`relative w-full overflow-hidden bg-black ${className}`}
      style={{ aspectRatio }}
    >
      <iframe
        src={embedUrl}
        loading="lazy"
        title={title}
        style={{
          border: 0,
          position: 'absolute',
          top: 0,
          left: 0,
          height: '100%',
          width: '100%'
        }}
        allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;"
        allowFullScreen
      />
    </div>
  );
}
