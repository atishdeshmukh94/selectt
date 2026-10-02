import React, { useRef, useState, useEffect } from 'react';
import { Sparkles, ShieldCheck, Heart } from 'lucide-react';
import SkeletonImage from '../../animation/SkeletonImage';
import { API_URL, DEFAULT_BANNER_FALLBACK_IMAGE } from '../../../config/api';

const API = API_URL;

// Local branded banners (No 3rd-party stock images)
const LOCAL_BRAND_BANNERS = [
  {
    id: 'f1',
    title: "PRE-APPROVAL",
    subtitle: "within 2 minutes",
    cta_text: "Check EMI Offer",
    cta_link: "/car-loan",
    image_url: "/img/car_loan_banner_1to1.webp",
  },
  {
    id: 'f2',
    title: "GET UP TO",
    subtitle: "Selectt Assured cars",
    cta_text: "Explore Cars",
    cta_link: "/buy-cars",
    image_url: "/img/insurance_banner_1to1.webp",
  },
  {
    id: 'f3',
    title: "Protect your car with",
    subtitle: "LIFETIME WARRANTY",
    cta_text: "More info",
    cta_link: "/warranty",
    image_url: "/img/warranty_banner_1to1.webp",
  }
];

// Banner Card — shared between mobile and desktop with responsive SkeletonImage preloader
const GlassBannerCard = ({ banner, className = '' }) => {
  const safeImg = (banner.image_url && !banner.image_url.includes('images.unsplash.com'))
    ? banner.image_url
    : DEFAULT_BANNER_FALLBACK_IMAGE;

  return (
    <a
      href={banner.cta_link || '#'}
      className={`relative block overflow-hidden rounded-2xl border border-slate-200/80 cursor-pointer group/banner transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 bg-[#F0F2F5] ${className}`}
    >
      <SkeletonImage
        src={safeImg}
        alt={banner.title || "Promo Banner"}
        className="w-full h-full"
        imageClassName="w-full h-full object-cover transition-transform duration-500 group-hover/banner:scale-102"
        aspectRatio="w-full h-full"
        hoverZoom={false}
        priority={true}
        fallback={DEFAULT_BANNER_FALLBACK_IMAGE}
      />
    </a>
  );
};

const TopSearchAndBanners = () => {
  const scrollRef = useRef(null);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadBanners = async () => {
      try {
        const [settingsRes, bannersRes] = await Promise.all([
          fetch(`${API}/api/settings/public`).catch(() => null),
          fetch(`${API}/api/banners?page=buy-cars&type=promo`).catch(() => null),
        ]);

        const settings = settingsRes && settingsRes.ok ? await settingsRes.json() : {};
        const bannerData = bannersRes && bannersRes.ok ? await bannersRes.json() : [];

        if (!isMounted) return;

        if (settings.buy_top_banner_1_img || settings.buy_top_banner_2_img || settings.buy_top_banner_3_img) {
          const list = [
            {
              id: 'top-1',
              image_url: settings.buy_top_banner_1_img ? (settings.buy_top_banner_1_img.startsWith('/') ? `${API}${settings.buy_top_banner_1_img}` : settings.buy_top_banner_1_img) : LOCAL_BRAND_BANNERS[0].image_url,
              cta_link: settings.buy_top_banner_1_link || '#',
            },
            {
              id: 'top-2',
              image_url: settings.buy_top_banner_2_img ? (settings.buy_top_banner_2_img.startsWith('/') ? `${API}${settings.buy_top_banner_2_img}` : settings.buy_top_banner_2_img) : LOCAL_BRAND_BANNERS[1].image_url,
              cta_link: settings.buy_top_banner_2_link || '#',
            },
            {
              id: 'top-3',
              image_url: settings.buy_top_banner_3_img ? (settings.buy_top_banner_3_img.startsWith('/') ? `${API}${settings.buy_top_banner_3_img}` : settings.buy_top_banner_3_img) : LOCAL_BRAND_BANNERS[2].image_url,
              cta_link: settings.buy_top_banner_3_link || '#',
            },
          ];
          setBanners(list);
        } else if (Array.isArray(bannerData) && bannerData.length > 0) {
          const mapped = bannerData.map((b) => ({
            ...b,
            image_url: b.image_url?.startsWith('/') ? `${API}${b.image_url}` : b.image_url,
          }));
          setBanners(mapped);
        } else {
          setBanners(LOCAL_BRAND_BANNERS);
        }
      } catch (e) {
        console.error("Failed loading top promo banners", e);
        if (isMounted) setBanners(LOCAL_BRAND_BANNERS);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadBanners();
    return () => { isMounted = false; };
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
      
      {/* Loading state: responsive preloader cards with centered circular spinner */}
      {loading ? (
        <>
          {/* Mobile preloader */}
          <div className="flex md:hidden gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory w-full">
            {[1, 2, 3].map(i => (
              <div
                key={`preload-m-${i}`}
                className="flex-shrink-0 w-full min-w-full h-[180px] sm:h-[200px] rounded-2xl bg-[#F0F2F5] border border-slate-200/80 flex items-center justify-center snap-start"
              >
                <div className="w-8 h-8 rounded-full border-[3px] border-slate-300/80 border-t-slate-500 animate-spin" />
              </div>
            ))}
          </div>
          {/* Desktop preloader */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-3 w-full">
            {[1, 2, 3].map(i => (
              <div
                key={`preload-d-${i}`}
                className="h-[190px] rounded-2xl bg-[#F0F2F5] border border-slate-200/80 flex items-center justify-center"
              >
                <div className="w-8 h-8 rounded-full border-[3px] border-slate-300/80 border-t-slate-500 animate-spin" />
              </div>
            ))}
          </div>
        </>
      ) : banners.length > 0 ? (
        <>
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
        </>
      ) : null}
    </div>
  );
};

export default TopSearchAndBanners;
