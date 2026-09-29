import React, { useState, useEffect } from 'react';
import { ShieldCheck, Youtube, Sparkles, ChevronDown } from 'lucide-react';
import PageMeta from '../components/common/PageMeta';
import { API_URL } from '../config/api';

export const extractYouTubeId = (url) => {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  if (trimmed.includes('src=')) {
    const match = trimmed.match(/src=["']([^"']+)["']/);
    if (match && match[1]) return extractYouTubeId(match[1]);
  }

  if (trimmed.includes('/shorts/')) {
    const parts = trimmed.split('/shorts/')[1];
    return parts?.split('?')[0]?.split('&')[0]?.split('/')[0]?.split('"')[0];
  }
  if (trimmed.includes('youtu.be/')) {
    const parts = trimmed.split('youtu.be/')[1];
    return parts?.split('?')[0]?.split('&')[0]?.split('/')[0]?.split('"')[0];
  }
  if (trimmed.includes('watch?v=')) {
    const parts = trimmed.split('watch?v=')[1];
    return parts?.split('&')[0]?.split('?')[0]?.split('"')[0];
  }
  if (trimmed.includes('/embed/')) {
    const parts = trimmed.split('/embed/')[1];
    return parts?.split('?')[0]?.split('&')[0]?.split('/')[0]?.split('"')[0];
  }
  if (!trimmed.includes('/') && !trimmed.includes('.') && trimmed.length >= 5) {
    return trimmed;
  }
  return null;
};

export default function CustomerReviewsPage() {
  const [videoReviews, setVideoReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [displayLimit, setDisplayLimit] = useState(20);

  useEffect(() => {
    window.scrollTo(0, 0);

    fetch(`${API_URL}/api/video-testimonials`)
      .then((res) => res.json())
      .then((data) => {
        setVideoReviews(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error('Error fetching video reviews:', err);
        setVideoReviews([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <PageMeta
        title="Customer Video Reviews | Selectt"
        description="Watch genuine video reviews from happy Selectt car buyers and sellers across India."
      />

      <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-24">
        {/* Dark Hero Header */}
        <div className="relative pt-24 pb-16 text-center border-b border-slate-800/80 bg-[#0C1B33] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0c1b33] via-[#0a162a] to-[#060d19] z-0"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#00C9AF] rounded-full mix-blend-screen filter blur-[120px] opacity-25 animate-pulse z-0"></div>

          <div className="max-w-5xl mx-auto px-6 relative z-10">
            <span className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-[#00C9AF] text-xs font-extrabold uppercase tracking-widest px-4 py-1.5 rounded-full mb-3.5 backdrop-blur-md">
              <ShieldCheck size={16} /> Verified Video Reviews
            </span>
            <h1 className="text-3xl md:text-5xl font-black text-white mb-3.5">
              Loved by Thousands of Car Joy Owners
            </h1>
            <p className="text-slate-300 text-sm md:text-base font-semibold max-w-2xl mx-auto leading-relaxed mt-3">
              Watch real stories from customers who bought and sold their cars through Selectt. 100% verified experiences.
            </p>
          </div>
        </div>

        {/* 5 Cards in 1 Row Layout */}
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 mt-14">
          {loading ? (
            <div className="py-24 text-center">
              <div className="w-10 h-10 border-4 border-[#00C9AF] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-slate-500 font-bold text-sm">Loading video reviews...</p>
            </div>
          ) : videoReviews.length === 0 ? (
            <div className="py-24 text-center bg-white rounded-3xl border border-slate-200 shadow-sm max-w-2xl mx-auto p-12 space-y-3">
              <Youtube size={48} className="mx-auto text-slate-300" />
              <h3 className="text-xl font-black text-slate-800">No Video Reviews Published Yet</h3>
              <p className="text-xs text-slate-500 font-medium">Check back soon for new customer stories and YouTube Shorts!</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4 md:gap-5 justify-items-center">
                {videoReviews.slice(0, displayLimit).map((item, idx) => {
                  const rawUrl = item.youtube_url || item.video_url;
                  const videoId = extractYouTubeId(rawUrl);
                  const embedSrc = videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=0` : null;

                  return (
                    <div
                      key={item.id || idx}
                      className="relative w-full aspect-[9/16] rounded-2xl sm:rounded-[1.5rem] overflow-hidden border border-slate-700/60 shadow-xl bg-slate-900 group hover:border-[#00C9AF]/60 transition-all transform hover:-translate-y-1 select-none"
                    >
                      {embedSrc ? (
                        <iframe
                          src={embedSrc}
                          title={item.name || "YouTube Short"}
                          className="w-full h-full border-0 rounded-2xl sm:rounded-[1.5rem] pointer-events-auto"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          referrerPolicy="strict-origin-when-cross-origin"
                          allowFullScreen
                        />
                      ) : (
                        <video
                          src={item.video_url}
                          controls
                          playsInline
                          className="w-full h-full object-cover rounded-2xl sm:rounded-[1.5rem]"
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Load More Button if video count > 20 */}
              {videoReviews.length > displayLimit && (
                <div className="mt-12 text-center">
                  <button
                    onClick={() => setDisplayLimit((prev) => prev + 20)}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00C9AF] to-[#00B4A0] hover:from-[#00B4A0] hover:to-[#009A88] text-[#0C1B33] px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-[#00C9AF]/20 cursor-pointer active:scale-95"
                  >
                    <Sparkles size={16} />
                    Load More Reviews ({videoReviews.length - displayLimit} Remaining)
                    <ChevronDown size={14} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
