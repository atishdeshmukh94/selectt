import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Play, Pause, Volume2, VolumeX, User } from "lucide-react";
import { API_URL } from '../../config/api';

const API = API_URL;

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

const VideoCard = ({ item, isActive }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const resolveUrl = (url) => url?.startsWith('/') ? `${API}${url}` : url;

  const rawUrl = item.youtube_url || item.video_url || item.video;
  const videoId = extractYouTubeId(rawUrl);

  const togglePlay = () => {
    if (videoId) return;
    if (!videoRef.current) return;
    if (isPlaying) { videoRef.current.pause(); setIsPlaying(false); }
    else { videoRef.current.play(); setIsPlaying(true); }
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  useEffect(() => {
    if (!isActive && videoRef.current && isPlaying) { videoRef.current.pause(); setIsPlaying(false); }
  }, [isActive]);

  return (
    <div
      className="relative w-[85%] sm:w-[205px] md:w-[220px] lg:w-[230px] aspect-[9/16] rounded-[1.75rem] sm:rounded-[2rem] overflow-hidden shadow-2xl transition-all duration-300 cursor-pointer snap-start shrink-0 group hover:border-[#00C9AF] border border-slate-700/60 bg-slate-900 isolate select-none"
      onClick={togglePlay}
    >
      {videoId ? (
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=0`}
          title={item.name || "YouTube Short"}
          className="w-full h-full border-0 rounded-[2rem] pointer-events-auto"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      ) : (
        <>
          <video
            ref={videoRef}
            src={resolveUrl(rawUrl)}
            poster={resolveUrl(item.poster_url || item.poster)}
            muted={isMuted}
            loop
            playsInline
            preload="none"
            className="w-full h-full object-cover"
          />

          <div className="absolute inset-0 pointer-events-none z-10"
            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.85) 20%, rgba(0,0,0,0.55) 40%, rgba(0,0,0,0.15) 60%, transparent 75%)' }}
          />

          <div className="absolute top-6 left-6 flex items-center gap-2 bg-black/40 backdrop-blur-md py-1 px-3 rounded-full border border-white/20 z-10">
            <div className="w-5 h-5 bg-[#00C9AF] rounded-full flex items-center justify-center text-[10px] text-[#0A1C3A] font-bold">S</div>
            <span className="text-white text-xs font-medium">selectt</span>
          </div>

          <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 z-10 ${isPlaying ? "opacity-0 group-hover:opacity-100" : "opacity-100"}`}>
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-xl transition-transform group-hover:scale-110">
              {isPlaying ? <Pause size={28} className="text-white" fill="white" /> : <Play size={28} className="text-white ml-1" fill="white" />}
            </div>
          </div>

          <button
            onClick={toggleMute}
            className="absolute top-6 right-6 w-9 h-9 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/20 hover:bg-black/60 transition-all z-10"
          >
            {isMuted ? <VolumeX size={16} className="text-white" /> : <Volume2 size={16} className="text-white" />}
          </button>

          {item.name && (
            <div className="absolute bottom-8 left-6 right-6 text-white text-left z-10 pointer-events-none">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-[#00C9AF] border border-[#00C9AF]/60 rounded-full flex items-center justify-center shrink-0">
                  <User size={20} className="text-white" />
                </div>
                <div className="min-w-0">
                  <p className="font-extrabold text-base tracking-tight text-white truncate drop-shadow-md">{item.name}</p>
                  <p className="text-xs text-slate-300 mt-0.5 truncate drop-shadow-sm">{item.location}</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-white/90 line-clamp-2 italic font-medium drop-shadow-md">"{item.testimony}"</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const Testimonials = ({ bgClass = "bg-[#0A192F]", textClass = "text-slate-300", btnActive = "bg-white/10 text-white hover:bg-white/20 border-white/20", btnDisabled = "bg-white/5 text-slate-600 border-white/10" }) => {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [videoTestimonials, setVideoTestimonials] = useState([]);

  useEffect(() => {
    fetch(`${API}/api/video-testimonials`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setVideoTestimonials(data);
        }
      })
      .catch(() => {
        setVideoTestimonials([]);
      });
  }, []);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll);
    window.addEventListener("resize", checkScroll);
    checkScroll();
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [videoTestimonials]);

  const scroll = (direction) => {
    if (!scrollRef.current) return;
    const scrollAmount = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({ left: direction * scrollAmount, behavior: "smooth" });
  };

  if (videoTestimonials.length === 0) {
    return null;
  }

  return (
    <section className={`pt-1 pb-10 md:pb-16 px-4 ${bgClass}`}>
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-row items-center justify-between mb-2 gap-3">
          <div className="text-left">
            <p className={`${textClass} text-xs md:text-sm font-medium`}>Real stories from 1M+ happy car buyers across India</p>
          </div>
          <div className="flex gap-2 justify-end shrink-0">
            <button
              onClick={() => scroll(-1)}
              disabled={!canScrollLeft}
              className={`w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center shadow-sm transition-all cursor-pointer ${canScrollLeft ? btnActive : btnDisabled
                }`}
              style={bgClass.includes('transparent') ? {
                color: canScrollLeft ? '#ffffff' : 'rgba(255, 255, 255, 0.4)',
                backgroundColor: canScrollLeft ? 'rgba(30, 41, 59, 0.8)' : 'rgba(15, 23, 42, 0.3)',
                borderColor: canScrollLeft ? 'rgba(71, 85, 105, 0.8)' : 'rgba(51, 65, 85, 0.2)'
              } : undefined}
              title="Previous Videos"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => scroll(1)}
              disabled={!canScrollRight}
              className={`w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center shadow-sm transition-all cursor-pointer ${canScrollRight ? btnActive : btnDisabled
                }`}
              style={bgClass.includes('transparent') ? {
                color: canScrollRight ? '#ffffff' : 'rgba(255, 255, 255, 0.4)',
                backgroundColor: canScrollRight ? 'rgba(30, 41, 59, 0.8)' : 'rgba(15, 23, 42, 0.3)',
                borderColor: canScrollRight ? 'rgba(71, 85, 105, 0.8)' : 'rgba(51, 65, 85, 0.2)'
              } : undefined}
              title="Next Videos"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory pt-2 pb-4 -mb-4 hide-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {videoTestimonials.map((item, index) => (
            <VideoCard key={item.id || index} item={item} isActive={true} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
