import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, ShieldCheck, Heart } from 'lucide-react';

import { API_URL } from '../../../config/api';
const API = API_URL;

// Premium Gold Glass style
const glassStyle = {
  background: 'linear-gradient(135deg, #181308 0%, #0e0b04 50%, #060402 100%)',
  backdropFilter: 'blur(20px) saturate(190%)',
  WebkitBackdropFilter: 'blur(20px) saturate(190%)',
  border: '1px solid rgba(229, 169, 59, 0.45)',
  boxShadow: '0 16px 40px rgba(0, 0, 0, 0.55), 0 0 25px rgba(229, 169, 59, 0.06)',
};

const FALLBACK_BANNERS = [
  {
    id: 'f1',
    title: "PRE-APPROVAL",
    subtitle: "within 2 minutes",
    cta_text: "Check EMI Offer",
    cta_link: "#",
    image_url: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=400&auto=format&fit=crop&q=60",
    icon: <Sparkles className="text-[#E5A93B]" size={16} />,
    blob: 'rgba(229,169,59,0.35)',
  },
  {
    id: 'f2',
    title: "GET UP TO",
    subtitle: "₹1.8 lakhs OFF on selected",
    cta_text: "Selectt Assured cars",
    cta_link: "#",
    image_url: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400&auto=format&fit=crop&q=60",
    icon: <ShieldCheck className="text-[#E5A93B]" size={16} />,
    blob: 'rgba(229,169,59,0.25)',
  },
  {
    id: 'f3',
    title: "Protect your car with",
    subtitle: "LIFETIME WARRANTY",
    cta_text: "More info",
    cta_link: "#",
    image_url: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=400&auto=format&fit=crop&q=60",
    icon: <Heart className="text-[#E5A93B]" size={16} />,
    blob: 'rgba(229,169,59,0.3)',
  }
];

// Glass Banner Card — shared between mobile and desktop
const GlassBannerCard = ({ banner, className = '' }) => (
  <a
    href={banner.cta_link || '#'}
    className={`relative block overflow-hidden rounded-2xl border border-[#E5A93B]/10 cursor-pointer group/banner transition-all duration-300 hover:shadow-[0_16px_45px_rgba(229,169,59,0.2)] hover:-translate-y-1 ${className}`}
  >
    {/* Image */}
    {banner.image_url ? (
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <img
          src={banner.image_url}
          alt="Promo Banner"
          className="w-full h-full object-fill transition-transform duration-600"
          style={{
            transform: banner.flip_image ? 'scaleX(-1)' : 'none',
          }}
        />
      </div>
    ) : (
      <div className="absolute inset-0 bg-[#0C1B33] flex items-center justify-center text-white text-xs">
        No Image Uploaded
      </div>
    )}
  </a>
);

const TopSearchAndBanners = () => {
  const scrollRef = useRef(null);
  const [banners, setBanners] = useState(FALLBACK_BANNERS);

  useEffect(() => {
    fetch(`${API}/api/banners?page=buy-cars&type=promo`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map((b, idx) => ({
            ...b,
            image_url: b.image_url?.startsWith('/') ? `${API}${b.image_url}` : b.image_url,
            icon: idx % 3 === 0 ? <Sparkles className="text-[#E5A93B]" size={16} /> :
              idx % 3 === 1 ? <ShieldCheck className="text-[#E5A93B]" size={16} /> :
                <Heart className="text-[#E5A93B]" size={16} />,
            blob: idx % 2 === 0 ? 'rgba(229,169,59,0.3)' : 'rgba(218,165,32,0.25)',
          }));
          setBanners(mapped);
        }
      })
      .catch(() => { });
  }, []);

  const mobileScrollRef = useRef(null);

  // Auto slide mobile banners
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      const el = mobileScrollRef.current;
      if (!el) return;
      
      const { scrollLeft, clientWidth, scrollWidth } = el;
      const cardWidth = clientWidth;
      
      if (scrollLeft + clientWidth >= scrollWidth - 10) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: cardWidth, behavior: 'smooth' });
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [banners]);

  return (
    <div className="mb-8">
      <style>{`
        @keyframes shimmerSweep {
          0% { transform: translateX(-150%) skewX(-20deg); }
          100% { transform: translateX(250%) skewX(-20deg); }
        }
      `}</style>
      
      {/* Mobile: horizontal scroll */}
      <div 
        ref={mobileScrollRef}
        className="flex md:hidden gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory w-full"
      >
        {banners.map(banner => (
          <GlassBannerCard
            key={`m-${banner.id}`}
            banner={banner}
            className="flex-shrink-0 w-full min-w-full h-[180px] sm:h-[200px] snap-start"
          />
        ))}
      </div>

      {/* md+: CSS Grid — fills container, no overflow */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-3 w-full">
        {banners.map(banner => (
          <GlassBannerCard
            key={`d-${banner.id}`}
            banner={banner}
            className="h-[190px]"
          />
        ))}
      </div>
    </div>
  );
};

export default TopSearchAndBanners;
