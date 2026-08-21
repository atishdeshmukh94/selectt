import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { API_URL } from '../../config/api';
const API = API_URL;

const FALLBACK_SLIDES = [
  {
    desktop: 'https://spn-sta.spinny.com/spinny-web/static-images/assets/images/pages/HomePage/components/TopBanner/assets/desktop_god_promise_home_finance.jpg?w=1500',
    mobile: 'https://mda.spinny.com/sp-file-system/public/2026-01-07/908b1d7b4e48483b838ae481e40da082/raw/file.jpg?q=85&w=400&dpr=3.0',
    btnText: 'Check finance offer',
    alt: 'Finance Offer'
  },
  {
    desktop: 'https://spn-sta.spinny.com/spinny-web/static-images/assets/images/pages/HomePage/components/TopBanner/assets/desktop_god_promise_home_sell.jpg?w=1500',
    mobile: 'https://spn-sta.spinny.com/spinny-web/static-images/assets/images/pages/HomePage/components/TopBannerV2/assets/god_promise_home_mobile_sell.jpg?q=85&w=400&dpr=3.0',
    btnText: 'Get price',
    alt: 'Sell your car'
  }
];

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState(FALLBACK_SLIDES);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Fetch both desktop and mobile banners for home page
    Promise.all([
      fetch(`${API}/api/banners?page=home&type=desktop`).then(r => r.json()),
      fetch(`${API}/api/banners?page=home&type=mobile`).then(r => r.json())
    ]).then(([desktopBanners, mobileBanners]) => {
      if (desktopBanners.length === 0) { setLoaded(true); return; }
      const combined = desktopBanners.map((d, idx) => ({
        desktop: d.image_url?.startsWith('/') ? `${API}${d.image_url}` : d.image_url,
        mobile: mobileBanners[idx]?.image_url
          ? (mobileBanners[idx].image_url.startsWith('/') ? `${API}${mobileBanners[idx].image_url}` : mobileBanners[idx].image_url)
          : (d.image_url?.startsWith('/') ? `${API}${d.image_url}` : d.image_url),
        btnText: d.cta_text || 'View offer',
        alt: d.title || d.subtitle || 'Banner',
        link: d.cta_link || '#'
      }));
      setSlides(combined);
      setLoaded(true);
    }).catch(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (!loaded || slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides, loaded]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  const announcementItems = [
    "No Hidden Charges",
    "Free Car Inspection",
    "100% Verified Cars",
    "5-Day Money Back Guarantee",
    "Free Delivery within 50km",
    "200-Points Inspection",
    "AI Based Valuation"
  ];

  return (
    <section className="relative w-full overflow-hidden bg-white md:bg-slate-50 flex flex-col">
      {/* Mobile Card Wrap (Midnight Blue Background) */}
      <div className="md:hidden absolute inset-x-0 top-0 bottom-0 bg-[#0C1B33] -z-10"></div>

      {/* Announcement Bar */}
      <div className="relative w-full bg-[#00C9AF] border-y border-white/10 py-2 md:py-3 overflow-hidden mt-0 order-1 md:order-2 mb-3 md:mb-0">
        <div className="flex whitespace-nowrap animate-marquee">
          <div className="flex items-center gap-12 px-6">
            {announcementItems.map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-white text-[10px] md:text-sm font-bold uppercase tracking-wider">
                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                <span>{item}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-12 px-6">
            {announcementItems.map((item, i) => (
              <div key={`dup-${i}`} className="flex items-center gap-2 text-white text-[10px] md:text-sm font-bold uppercase tracking-wider">
                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Slider Container */}
      <div className="relative order-2 md:order-1">
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide, idx) => (
            <div key={idx} className="w-full flex-shrink-0 relative px-4 md:px-0">
              <div className="relative rounded-2xl md:rounded-none overflow-hidden group">
                <picture className="w-full h-full block">
                  <source media="(max-width: 768px)" srcSet={slide.mobile} />
                  <img
                    src={slide.desktop}
                    alt={slide.alt}
                    className="w-full h-auto aspect-[4/5] md:aspect-[16/5.5] md:max-h-[500px] object-cover cursor-pointer"
                  />
                </picture>
                {/* Mobile Button Overlay */}
                <div className="md:hidden absolute bottom-0 left-0 w-full p-0">
                  <button
                    onClick={() => slide.link && slide.link !== '#' && (window.location.href = slide.link)}
                    className="w-full bg-[#00C9AF] text-[#0A1C3A] py-4 font-bold text-lg shadow-lg active:scale-95 transition-transform"
                  >
                    {slide.btnText}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        {slides.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/50 transition-all z-10 hidden md:flex"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/50 transition-all z-10 hidden md:flex"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </section>
  );
};

export default Hero;

