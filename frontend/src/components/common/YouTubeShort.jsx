import React, { useMemo } from 'react';
import { AlertCircle, Youtube } from 'lucide-react';

/**
 * Extracts YouTube Video ID from various URL formats.
 * Supported formats:
 * - https://www.youtube.com/shorts/VIDEO_ID
 * - https://youtube.com/shorts/VIDEO_ID?si=...
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - Raw VIDEO_ID string
 *
 * @param {string} url - YouTube URL or Video ID
 * @returns {string|null} 11-character YouTube Video ID or null if invalid
 */
export const extractYouTubeId = (url) => {
  if (!url || typeof url !== 'string') return null;

  const trimmed = url.trim();
  if (!trimmed) return null;

  // 1. YouTube Shorts: youtube.com/shorts/VIDEO_ID
  if (trimmed.includes('/shorts/')) {
    const parts = trimmed.split('/shorts/')[1];
    const id = parts?.split('?')[0]?.split('&')[0]?.split('/')[0];
    if (id && id.length >= 5) return id;
  }

  // 2. Shortened link: youtu.be/VIDEO_ID
  if (trimmed.includes('youtu.be/')) {
    const parts = trimmed.split('youtu.be/')[1];
    const id = parts?.split('?')[0]?.split('&')[0]?.split('/')[0];
    if (id && id.length >= 5) return id;
  }

  // 3. Standard watch link: youtube.com/watch?v=VIDEO_ID
  if (trimmed.includes('watch?v=')) {
    const parts = trimmed.split('watch?v=')[1];
    const id = parts?.split('&')[0]?.split('?')[0];
    if (id && id.length >= 5) return id;
  }

  // 4. Embedded URL link: youtube.com/embed/VIDEO_ID
  if (trimmed.includes('/embed/')) {
    const parts = trimmed.split('/embed/')[1];
    const id = parts?.split('?')[0]?.split('&')[0]?.split('/')[0];
    if (id && id.length >= 5) return id;
  }

  // 5. Raw Video ID string (e.g. xxgUVVgamgo or dQw4w9WgXcQ)
  if (!trimmed.includes('/') && !trimmed.includes('.') && trimmed.length >= 5) {
    return trimmed;
  }

  return null;
};

/**
 * YouTubeShort Component
 * Modern, responsive 9:16 portrait YouTube Shorts player component.
 *
 * Requirements Met:
 * - Accept YouTube Shorts, watch, or youtu.be URLs as props
 * - Extract Video ID automatically
 * - Convert into an embed URL
 * - True 9:16 aspect ratio (aspect-[9/16])
 * - Maximum width of 360px (max-w-[360px])
 * - 100% width on mobile (w-full)
 * - Rounded corners 20px (rounded-[20px])
 * - Overflow hidden (overflow-hidden)
 * - Soft shadow (shadow-2xl)
 * - No borders (border-0)
 * - Centered horizontally (mx-auto)
 * - Graceful handling & fallback for invalid URLs ("Invalid YouTube URL")
 *
 * @param {Object} props
 * @param {string} props.url - YouTube Shorts, Watch, or Shortened URL or Video ID
 * @param {string} [props.title="YouTube Short"] - Accessibility title for iframe
 * @param {boolean} [props.autoplay=false] - Autoplay video on load
 * @param {boolean} [props.muted=false] - Start video muted
 * @param {boolean} [props.controls=true] - Show YouTube player controls
 * @param {string} [props.className=""] - Optional extra Tailwind CSS classes
 */
const YouTubeShort = ({
  url,
  title = "YouTube Short",
  autoplay = false,
  muted = false,
  controls = true,
  className = ""
}) => {
  const videoId = useMemo(() => extractYouTubeId(url), [url]);

  if (!videoId) {
    return (
      <div
        className={`w-full max-w-[360px] aspect-[9/16] rounded-[20px] bg-slate-900 border border-slate-800 text-slate-400 flex flex-col items-center justify-center p-6 text-center shadow-xl mx-auto ${className}`}
      >
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mb-4">
          <Youtube size={32} />
        </div>
        <div className="flex items-center gap-1.5 text-red-400 font-extrabold text-sm mb-1">
          <AlertCircle size={16} /> Invalid YouTube URL
        </div>
        <p className="text-xs text-slate-500 font-medium max-w-[240px] leading-relaxed">
          Please provide a valid YouTube Shorts, Watch, or youtu.be link.
        </p>
      </div>
    );
  }

  const queryParams = new URLSearchParams({
    autoplay: autoplay ? '1' : '0',
    mute: muted ? '1' : '0',
    controls: controls ? '1' : '0',
    enablejsapi: '1',
    playsinline: '1',
    rel: '0',
    modestbranding: '1',
    loop: '1',
    playlist: videoId
  }).toString();

  const embedUrl = `https://www.youtube.com/embed/${videoId}?${queryParams}`;

  return (
    <div
      className={`w-full max-w-[360px] aspect-[9/16] rounded-[20px] overflow-hidden shadow-2xl bg-black border-0 mx-auto select-none ${className}`}
    >
      <iframe
        src={embedUrl}
        title={title}
        className="w-full h-full border-0 rounded-[20px] pointer-events-auto"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
        loading="lazy"
      />
    </div>
  );
};

export default YouTubeShort;
