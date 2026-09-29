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

const VideoCard = ({ item, isActive, onPlayChange }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const resolveUrl = (url) => url?.startsWith('/') ? `${API}${url}` : url;
  
  const rawUrl = item.youtube_url || item.video_url || item.video;
  const videoId = extractYouTubeId(rawUrl);

  const togglePlay = () => {
    if (videoId) return;
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
      onPlayChange?.(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
      onPlayChange?.(true);
    }
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  useEffect(() => {
    if (!isActive && videoRef.current && isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
      onPlayChange?.(false);
    }
  }, [isActive, isPlaying]);

  return (
    <div
      className="relative w-[calc(100vw-32px)] sm:w-[245px] md:w-[220px] lg:w-[calc((100%-6rem)/5)] aspect-[9/16] rounded-[1.75rem] sm:rounded-[2rem] overflow-hidden shadow-2xl transition-all duration-300 cursor-pointer snap-start shrink-0 group hover:border-[#00C9AF] border border-slate-700/60 bg-slate-900 isolate select-none"
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
            className="w-full h-full object-cover rounded-[2rem]"
          />

          {/* Dark gradient for MP4 video */}
          <div
            className="absolute inset-0 pointer-events-none z-10"
            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.85) 20%, rgba(0,0,0,0.55) 40%, rgba(0,0,0,0.15) 60%, transparent 75%)' }}
          />

          {/* Brand logo tag for MP4 video */}
          <div className="absolute top-5 left-5 flex items-center gap-1.5 bg-black/25 backdrop-blur-md py-1 px-3 rounded-full border border-white/10 z-10">
            <div className="w-4 h-4 bg-[#00C9AF] rounded-full flex items-center justify-center text-[9px] text-[#0A1C3A] font-extrabold">S</div>
            <span className="text-white text-[10px] font-medium tracking-tight">selectt</span>
          </div>

          {/* Play/Pause Button Overlay for MP4 video */}
          <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 z-10 ${isPlaying ? "opacity-0 group-hover:opacity-100" : "opacity-100"}`}>
            <div className="w-14 h-14 rounded-full bg-white/25 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-xl transition-transform group-hover:scale-110">
              {isPlaying ? <Pause size={24} className="text-white" fill="white" /> : <Play size={24} className="text-white ml-0.5" fill="white" />}
            </div>
          </div>

          {/* Mute Button for MP4 video */}
          <button
            onClick={toggleMute}
            className="absolute top-5 right-5 w-7 h-7 rounded-full bg-black/25 backdrop-blur-md flex items-center justify-center border border-white/10 hover:bg-black/40 transition-all z-10"
          >
            {isMuted ? <VolumeX size={12} className="text-white" /> : <Volume2 size={12} className="text-white" />}
          </button>

          {/* Testimonial info for MP4 video */}
          {item.name && (
            <div className="absolute bottom-6 left-5 right-5 text-white text-left z-10 pointer-events-none">
              <div className="flex items-center gap-2.5 mb-2.5">
                <div className="w-8 h-8 bg-[#00C9AF] border border-[#00C9AF]/60 rounded-full flex items-center justify-center shrink-0">
                  <User size={16} className="text-white" />
                </div>
                <div className="min-w-0">
                  <p className="font-extrabold text-sm tracking-tight text-white truncate drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">{item.name}</p>
                  <p className="text-[10px] text-slate-300 mt-0.5 truncate drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">{item.location}</p>
                </div>
              </div>
              <p className="text-xs leading-relaxed text-white/90 line-clamp-2 italic font-medium drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">"{item.testimony}"</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const NewTestimonials = () => {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [videoTestimonials, setVideoTestimonials] = useState([]);
  const [isHovered, setIsHovered] = useState(false);
  const playingCountRef = useRef(0);
  const autoScrollRef = useRef(null);

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

  // Auto-scroll: page-by-page every 4s, pause on hover or video play
  useEffect(() => {
    const startAutoScroll = () => {
      autoScrollRef.current = setInterval(() => {
        if (!scrollRef.current) return;
        if (isHovered || playingCountRef.current > 0) return;
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        const isMobile = window.innerWidth < 640;
        const step = isMobile ? clientWidth : clientWidth;
        
        if (scrollLeft >= scrollWidth - clientWidth - 10) {
          scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          scrollRef.current.scrollBy({ left: step, behavior: 'smooth' });
        }
      }, 4000);
    };
    startAutoScroll();
    return () => clearInterval(autoScrollRef.current);
  }, [isHovered, videoTestimonials]);

  const handlePlayChange = (playing) => {
    playingCountRef.current = Math.max(0, playingCountRef.current + (playing ? 1 : -1));
  };

  const scroll = (direction) => {
    if (!scrollRef.current) return;
    const isMobile = window.innerWidth < 640;
    const scrollAmount = isMobile 
      ? scrollRef.current.clientWidth 
      : scrollRef.current.clientWidth;
    scrollRef.current.scrollBy({ left: direction * scrollAmount, behavior: "smooth" });
  };

  if (videoTestimonials.length === 0) {
    return null;
  }

  return (
    <section className="py-10 px-4 md:px-8 lg:px-10 bg-[#192B46]/40 backdrop-blur-md text-[#f9f9f9] border-t border-white/5 relative">
      <div className="max-w-[1400px] mx-auto">

        {/* Header row */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div className="text-left">
            <span className="text-[#00CCB3] text-[11px] font-bold tracking-widest uppercase mb-3.5 block font-heading">
              TESTIMONIALS
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold font-heading text-white mb-3.5">
              What Motivates Us
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Real stories from 1M+ happy car buyers across India
            </p>
          </div>

          {/* Carousel Navigation Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll(-1)}
              disabled={!canScrollLeft}
              className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all cursor-pointer ${!canScrollLeft
                ? 'border-white/10 text-slate-600 bg-white/5 cursor-not-allowed'
                : 'border-white/20 text-white hover:text-[#00C9AF] hover:border-[#00C9AF] bg-[#00C9AF]/10 hover:bg-[#00C9AF]/20 active:scale-95'
                }`}
              title="Previous Videos"
            >
              <ChevronLeft size={18} strokeWidth={2.5} />
            </button>
            <button
              onClick={() => scroll(1)}
              disabled={!canScrollRight}
              className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all cursor-pointer ${!canScrollRight
                ? 'border-white/10 text-slate-600 bg-white/5 cursor-not-allowed'
                : 'border-white/20 text-white hover:text-[#00C9AF] hover:border-[#00C9AF] bg-[#00C9AF]/10 hover:bg-[#00C9AF]/20 active:scale-95'
                }`}
              title="Next Videos"
            >
              <ChevronRight size={18} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Smooth Horizontal Carousel Slider */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory pt-2 pb-4 -mb-4 px-1 hide-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {videoTestimonials.map((item, index) => (
            <VideoCard key={item.id || index} item={item} isActive={true} onPlayChange={handlePlayChange} />
          ))}
        </div>

      </div>
    </section>
  );
};

export default NewTestimonials;
