import React, { useState, useEffect, useRef } from 'react';
import PageMeta from '../components/common/PageMeta';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Coins,
  Truck,
  RotateCcw,
  FileText,
  ArrowRight,
  Search,
  MapPin,
  Heart,
  Calendar,
  Gauge,
  Fuel,
  CheckCircle2,
  TrendingDown,
  ChevronLeft,
  ChevronRight,
  X,
  Landmark,
  Key,
  Car,
  TrendingUp,
  Tag,
  Award,
  BadgeIndianRupee,
  CreditCard,
  Star
} from 'lucide-react';
import { API_URL } from '../config/api';
import NewTestimonials from '../components/home/NewTestimonials';
import FAQ from '../components/home/FAQ';
import CarCard from '../components/buy/CarCard';
import Reveal from '../components/common/Reveal';
import WhyChooseSection from '../components/home/WhySelectt/WhyChooseSection';
import StatCounter from '../components/animation/StatCounter';
import SectionReveal from '../components/animation/SectionReveal';
import { shortenLocation, getCarDetailsUrl } from '../utils/formatters';
import { getPersonalizedRecommendations, getRecentlyViewedCars, getUserPreferences } from '../utils/userPreferences';

const FALLBACK_CARS = [
  {
    id: 1,
    make: 'Hyundai',
    model: 'Creta SX ✦',
    variant: '1.5 Petrol',
    year: 2022,
    price: 1240000,
    km: 18200,
    fuelType: 'Petrol',
    transmission: 'Manual',
    image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 400'%3E%3Crect width='600' height='400' fill='%23f3f4f6'/%3E%3Ccircle cx='300' cy='200' r='40' fill='none' stroke='%23e5e7eb' stroke-width='8'/%3E%3Ccircle cx='300' cy='200' r='40' fill='none' stroke='%239ca3af' stroke-width='8' stroke-dasharray='160' stroke-dashoffset='80' stroke-linecap='round'%3E%3CanimateTransform attributeName='transform' type='rotate' from='0 300 200' to='360 300 200' dur='1s' repeatCount='indefinite'/%3E%3C/circle%3E%3C/svg%3E",
    location: 'Mumbai',
    tag: 'Verified'
  },
  {
    id: 2,
    make: 'Tata',
    model: 'Nexon EV Max',
    variant: 'XZ+ Lux',
    year: 2023,
    price: 1680000,
    km: 9800,
    fuelType: 'EV',
    transmission: 'Automatic',
    image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 400'%3E%3Crect width='600' height='400' fill='%23f3f4f6'/%3E%3Ccircle cx='300' cy='200' r='40' fill='none' stroke='%23e5e7eb' stroke-width='8'/%3E%3Ccircle cx='300' cy='200' r='40' fill='none' stroke='%239ca3af' stroke-width='8' stroke-dasharray='160' stroke-dashoffset='80' stroke-linecap='round'%3E%3CanimateTransform attributeName='transform' type='rotate' from='0 300 200' to='360 300 200' dur='1s' repeatCount='indefinite'/%3E%3C/circle%3E%3C/svg%3E",
    location: 'Delhi NCR',
    badgeText: 'Electric'
  },
  {
    id: 3,
    make: 'Honda',
    model: 'City ZX CVT',
    variant: 'i-VTEC Auto',
    year: 2021,
    price: 890000,
    km: 32000,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 400'%3E%3Crect width='600' height='400' fill='%23f3f4f6'/%3E%3Ccircle cx='300' cy='200' r='40' fill='none' stroke='%23e5e7eb' stroke-width='8'/%3E%3Ccircle cx='300' cy='200' r='40' fill='none' stroke='%239ca3af' stroke-width='8' stroke-dasharray='160' stroke-dashoffset='80' stroke-linecap='round'%3E%3CanimateTransform attributeName='transform' type='rotate' from='0 300 200' to='360 300 200' dur='1s' repeatCount='indefinite'/%3E%3C/circle%3E%3C/svg%3E",
    location: 'Bangalore',
    badgeText: 'Hot deal'
  }
];

const FOMO_SOLD_CARS = [
  { name: 'Tata Nexon EV', price: '16.8' },
  { name: 'Kia Seltos', price: '15.9' },
  { name: 'MG Hector', price: '18.2' },
  { name: 'Hyundai Creta', price: '13.5' },
  { name: 'Honda City', price: '9.2' },
  { name: 'Maruti Swift', price: '6.8' }
];

const INSPECTION_REPORTS = [
  {
    name: 'Hyundai Creta SX(O) 2022',
    overall: 93.4,
    engine: 96,
    body: 88,
    interior: 94,
    tyres: 91,
    ac: 98
  },
  {
    name: 'Tata Nexon EV Max 2023',
    overall: 95.8,
    engine: 98,
    body: 92,
    interior: 96,
    tyres: 94,
    ac: 99
  },
  {
    name: 'Honda City ZX CVT 2021',
    overall: 91.2,
    engine: 93,
    body: 86,
    interior: 92,
    tyres: 88,
    ac: 95
  },
  {
    name: 'Kia Seltos GTX Plus 2022',
    overall: 94.6,
    engine: 95,
    body: 90,
    interior: 95,
    tyres: 93,
    ac: 97
  }
];

const BODY_TYPES = [
  { name: 'Hatchback', icon: '/img/hatchback.png', hoverIcon: '/img/hatchback-hover.png' },
  { name: 'Sedan', icon: '/img/sedan.png', hoverIcon: '/img/sedan-hover.png' },
  { name: 'SUV', icon: '/img/suv.png', hoverIcon: '/img/suv-hover.png' },
  { name: 'MUV', icon: '/img/muv.png', hoverIcon: '/img/muv-hover.png' },
  { name: 'Luxury Sedan', icon: '/img/luxury-sedan.png', hoverIcon: '/img/luxury-sedan-hover.png' },
  { name: 'Luxury SUV', icon: '/img/luxury-suv.png', hoverIcon: '/img/luxury-suv-hover.png' },
];

const COMPARISON_FEATURES = [
  { name: '200-point inspection', selectt: true, spinny: true, cars24: false, cardekho: false },
  { name: 'AI fair pricing', selectt: true, spinny: false, cars24: false, cardekho: false },
  { name: '7-day return', selectt: true, spinny: true, cars24: false, cardekho: false },
  { name: 'Home test drive', selectt: true, spinny: true, cars24: true, cardekho: false },
  { name: 'Fixed honest price', selectt: true, spinny: true, cars24: false, cardekho: false },
  { name: 'Zero dealer fee', selectt: true, spinny: false, cars24: false, cardekho: false },
  { name: 'In-house financing', selectt: true, spinny: true, cars24: true, cardekho: true },
  { name: 'Full RC transfer support', selectt: true, spinny: true, cars24: false, cardekho: false }
];

const formatBadgeText = (text) => {
  if (!text) return '';
  return text
    .trim()
    .split(/\s+/)
    .map(word => {
      const lower = word.toLowerCase();
      if (['suv', 'cng', 'ev', 'mt', 'at', 'amt', 'cvt', 'dct'].includes(lower)) return lower.toUpperCase();
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
};

const getBadgeStyles = (tagText) => {
  const raw = (tagText || '').trim();
  const text = raw.toLowerCase();

  if (text.includes('luxury') || text.includes('selectt luxury')) {
    return {
      bg: 'bg-amber-100 dark:bg-amber-950/60',
      color: 'text-amber-900 dark:text-amber-300',
      border: 'border-amber-300/60',
      label: 'Selectt Luxury'
    };
  }

  if (text.includes('offer zone') || text.includes('discount') || text.includes('price drop')) {
    return {
      bg: 'bg-rose-50 dark:bg-rose-950/60',
      color: 'text-rose-700 dark:text-rose-300',
      border: 'border-rose-300/60',
      label: formatBadgeText(raw)
    };
  }

  if (text.includes('certified') || text.includes('verified') || text.includes('assured') || text.includes('like new')) {
    return {
      bg: 'bg-teal-50 dark:bg-teal-950/60',
      color: 'text-teal-800 dark:text-teal-300',
      border: 'border-teal-300/60',
      label: formatBadgeText(raw)
    };
  }

  if (text.includes('electric') || text.includes('hybrid') || text.includes('ev')) {
    return {
      bg: 'bg-emerald-50 dark:bg-emerald-950/60',
      color: 'text-emerald-800 dark:text-emerald-300',
      border: 'border-emerald-300/60',
      label: formatBadgeText(raw)
    };
  }

  if (text.includes('hot') || text.includes('deal') || text.includes('trending') || text.includes('top rated') || text.includes('rated')) {
    return {
      bg: 'bg-orange-50 dark:bg-orange-950/60',
      color: 'text-orange-800 dark:text-orange-300',
      border: 'border-orange-300/60',
      label: formatBadgeText(raw)
    };
  }

  return {
    bg: 'bg-slate-100 dark:bg-slate-800',
    color: 'text-slate-800 dark:text-slate-200',
    border: 'border-slate-300/60 dark:border-slate-700',
    label: formatBadgeText(raw)
  };
};

const hasPriceDrop = (car) => {
  if (!car || !car.price) return false;
  if (car.price_drop !== undefined) return Boolean(car.price_drop);
  if (car.is_price_drop !== undefined) return Boolean(car.is_price_drop);
  if (car.original_price && Number(car.original_price) > Number(car.price)) return true;
  if (car.originalPrice && Number(car.originalPrice) > Number(car.price)) return true;
  if (car.old_price && Number(car.old_price) > Number(car.price)) return true;
  if (car.oldPrice && Number(car.oldPrice) > Number(car.price)) return true;
  if (car.discount && Number(car.discount) > 0) return true;
  if (car.discount_amount && Number(car.discount_amount) > 0) return true;
  const tagStr = (car.tag || car.badgeText || '').toLowerCase();
  if (tagStr.includes('price drop') || tagStr.includes('reduced') || tagStr.includes('discount') || tagStr.includes('offer zone')) return true;
  return false;
};

const formatLabel = (label) => {
  if (!label) return '';
  return label.charAt(0).toUpperCase() + label.slice(1).toLowerCase();
};

const checkLocationMatch = (carLocation, userCity) => {
  if (!carLocation || !userCity) return true;
  const cLoc = carLocation.toLowerCase().trim();
  const uCity = userCity.toLowerCase().trim();

  if (cLoc === uCity) return true;

  if (uCity === 'delhi ncr') {
    return cLoc === 'delhi' || cLoc === 'new delhi' || cLoc === 'delhi ncr' || cLoc === 'noida' || cLoc === 'gurugram' || cLoc === 'gurgaon' || cLoc === 'ghaziabad' || cLoc === 'faridabad';
  }

  return cLoc.includes(uCity) || uCity.includes(cLoc);
};

// Body type button with hover image swap & micro-animation
function BodyTypeButton({ type, isActive, onClick }) {
  const [hovered, setHovered] = useState(false);
  const showHover = isActive || hovered;
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      data-active={isActive ? "true" : "false"}
      style={isActive ? {
        background: 'linear-gradient(135deg, rgba(0,204,179,0.35) 0%, rgba(0,180,160,0.18) 100%)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(0,228,192,0.55)',
        boxShadow: '0 4px 24px rgba(0,204,179,0.25), inset 0 1px 0 rgba(255,255,255,0.18)',
      } : {}}
      className={`group flex flex-col items-center justify-center gap-1.5 min-w-[100px] md:min-w-[120px] py-2.5 px-3 rounded-xl transition-all duration-300 shrink-0 cursor-pointer ${isActive
        ? 'text-white scale-[1.05] font-extrabold shadow-lg'
        : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent hover:scale-102 active:scale-95'
        }`}
    >
      <div className="w-18 h-10 flex items-center justify-center">
        <img
          src={showHover ? type.hoverIcon : type.icon}
          alt={type.name}
          className={`w-full h-full object-contain transition-all duration-300 ${
            showHover ? 'scale-110 -translate-y-0.5' : 'group-hover:scale-105'
          }`}
        />
      </div>
      <span className="text-[11px] md:text-[12px] font-bold tracking-tight leading-none">
        {type.name}
      </span>
    </button>
  );
}

const FINANCIAL_SERVICES_CAROUSEL = [
  {
    id: 1,
    title: 'Selectt Insurance',
    tag: 'RIGHT COVER · ZERO HASSLE',
    subtext: 'Instant digital policy • 50% NCB savings',
    ctaText: 'Get Quotes →',
    ctaLink: '/car-insurance',
    image: '/img/insurance_banner_1to1.png',
    badgeColor: 'bg-[#00C9AF] text-[#0C1B33] hover:bg-[#00E5C8]'
  },
  {
    id: 2,
    title: 'Used Car Loans',
    tag: 'LOW EMI · 24HR APPROVAL',
    subtext: 'From 8.9% ROI • 100% paperless process',
    ctaText: 'Apply Now →',
    ctaLink: '/used-car-loan',
    image: '/img/car_loan_banner_1to1.png',
    badgeColor: 'bg-[#00C9AF] text-[#0C1B33] hover:bg-[#00E5C8]'
  },
  {
    id: 3,
    title: '1-Year Warranty',
    tag: 'SELECTT ASSURED COVER',
    subtext: 'Engine, gearbox & electrical protection',
    ctaText: 'Explore Cover →',
    ctaLink: '/pricing',
    image: '/img/warranty_banner_1to1.png',
    badgeColor: 'bg-[#00C9AF] text-[#0C1B33] hover:bg-[#00E5C8]'
  }
];

const FinancialServicesCarousel = () => {
  const scrollRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % FINANCIAL_SERVICES_CAROUSEL.length;
        if (scrollRef.current) {
          const cardElem = scrollRef.current.children[nextIndex];
          if (cardElem) {
            scrollRef.current.scrollTo({
              left: cardElem.offsetLeft - 24,
              behavior: 'smooth'
            });
          }
        }
        return nextIndex;
      });
    }, 3500);

    return () => clearInterval(timer);
  }, []);

  const handleScroll = () => {
    if (scrollRef.current) {
      const scrollLeft = scrollRef.current.scrollLeft;
      const cardWidth = 230 + 14;
      const index = Math.round(scrollLeft / cardWidth);
      if (index >= 0 && index < FINANCIAL_SERVICES_CAROUSEL.length) {
        setActiveIndex(index);
      }
    }
  };

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-3.5 overflow-x-auto pb-3 snap-x scrollbar-none -mx-6 px-6"
      >
        {FINANCIAL_SERVICES_CAROUSEL.map((item) => (
          <div
            key={item.id}
            className="w-[220px] xs:w-[240px] aspect-square shrink-0 snap-center rounded-3xl relative overflow-hidden shadow-lg group border border-slate-700/50 text-left cursor-pointer"
          >
            {/* Background 1:1 Image with Darkening */}
            <img
              src={item.image}
              alt={item.title}
              className="absolute inset-0 w-full h-full object-cover object-center brightness-[0.65] contrast-[1.05] group-hover:scale-105 transition-transform duration-700 pointer-events-none"
            />
            {/* Dark Gradient Overlay for Crisp Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#060e1a] via-[#081528]/85 to-black/45 pointer-events-none"></div>

            {/* Top Tag Badge */}
            <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between z-10">
              <span className="text-[8.5px] font-black uppercase tracking-wider px-2.5 py-1 bg-black/60 backdrop-blur-md text-[#00C9AF] rounded-full border border-white/10">
                {item.tag}
              </span>
            </div>

            {/* Bottom Content Area */}
            <div className="absolute bottom-0 inset-x-0 p-4 z-10 flex flex-col justify-end">
              <h3 className="text-white text-base font-black tracking-tight leading-tight mb-1">
                {item.title}
              </h3>
              <p className="text-slate-200 text-[10px] font-medium leading-snug mb-2.5 line-clamp-1">
                {item.subtext}
              </p>
              <Link
                to={item.ctaLink}
                className={`w-full py-2.5 px-3 rounded-xl text-xs font-black text-center shadow-lg transition-all active:scale-95 block ${item.badgeColor}`}
              >
                {item.ctaText}
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Slide Indicators */}
      <div className="flex justify-center items-center gap-1.5 mt-1 select-none" style={{ height: '16px', lineHeight: 0 }}>
        {FINANCIAL_SERVICES_CAROUSEL.map((_, idx) => (
          <span
            key={idx}
            style={{
              height: '4px',
              minHeight: '4px',
              maxHeight: '4px',
              width: activeIndex === idx ? '18px' : '4px',
              minWidth: activeIndex === idx ? '18px' : '4px',
              maxWidth: activeIndex === idx ? '18px' : '4px',
              padding: 0,
              margin: 0,
              backgroundColor: activeIndex === idx ? '#00C9AF' : '#cbd5e1',
              borderRadius: '9999px',
              display: 'inline-block',
              transition: 'all 0.3s ease'
            }}
            className="shrink-0"
          />
        ))}
      </div>
    </div>
  );
};

const TRUST_NUMBERS_CAROUSEL = [
  {
    id: 1,
    title: '4.8 / 5',
    subtext: 'Google & Social Media Verified Rating',
    image: '/img/trust_banner_1.png',
    bgTheme: 'from-[#0C1B33] via-[#0C1B33]/85 to-[#0C1B33]/45',
    titleColor: 'text-[#00C9AF]',
    subtextColor: 'text-slate-200',
    stars: true
  },
  {
    id: 2,
    title: '3.5L+',
    subtext: 'Happy car buyers & sellers in India',
    image: '/img/trust_banner_2.png',
    bgTheme: 'from-[#0C1B33] via-[#0C1B33]/85 to-[#0C1B33]/45',
    titleColor: 'text-[#00C9AF]',
    subtextColor: 'text-slate-200',
    stars: false
  },
  {
    id: 3,
    title: '200-pt',
    subtext: 'Technician inspection on every vehicle',
    image: '/img/trust_banner_3.png',
    bgTheme: 'from-[#0C1B33] via-[#0C1B33]/85 to-[#0C1B33]/45',
    titleColor: 'text-[#00C9AF]',
    subtextColor: 'text-slate-200',
    stars: false
  }
];

const NumbersThatTrustUsCarousel = () => {
  const scrollRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % TRUST_NUMBERS_CAROUSEL.length;
        if (scrollRef.current) {
          const cardElem = scrollRef.current.children[nextIndex];
          if (cardElem) {
            scrollRef.current.scrollTo({
              left: cardElem.offsetLeft - 24,
              behavior: 'smooth'
            });
          }
        }
        return nextIndex;
      });
    }, 3800);

    return () => clearInterval(timer);
  }, []);

  const handleScroll = () => {
    if (scrollRef.current) {
      const scrollLeft = scrollRef.current.scrollLeft;
      const cardWidth = 300;
      const index = Math.round(scrollLeft / cardWidth);
      if (index >= 0 && index < TRUST_NUMBERS_CAROUSEL.length) {
        setActiveIndex(index);
      }
    }
  };

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-3 overflow-x-auto pb-2 snap-x scrollbar-none -mx-6 px-6"
      >
        {TRUST_NUMBERS_CAROUSEL.map((item) => (
          <div
            key={item.id}
            className="w-[calc(100vw-54px)] sm:w-[320px] shrink-0 snap-center rounded-3xl relative overflow-hidden shadow-sm border border-slate-700/40 h-[115px] flex items-center justify-between p-4 sm:p-5 text-left group cursor-pointer"
          >
            {/* Background Generated Banner Image - 100% Full Cover */}
            <img
              src={item.image}
              alt={item.title}
              className="absolute inset-0 w-full h-full object-cover object-center opacity-80 group-hover:scale-105 transition-transform duration-700 pointer-events-none"
            />
            {/* Gradient Overlay for Readable Text */}
            <div className={`absolute inset-0 bg-gradient-to-r ${item.bgTheme} z-0 pointer-events-none`}></div>

            <div className="relative z-10 max-w-[65%]">
              <div className="flex items-center gap-1.5 mb-1">
                <span className={`text-2xl sm:text-3xl font-black tracking-tight font-price ${item.titleColor}`}>
                  {item.title}
                </span>
                {item.stars && (
                  <div className="flex gap-0.5 text-amber-400">
                    <Star size={13} className="fill-amber-400 stroke-none" />
                    <Star size={13} className="fill-amber-400 stroke-none" />
                    <Star size={13} className="fill-amber-400 stroke-none" />
                    <Star size={13} className="fill-amber-400 stroke-none" />
                    <Star size={13} className="fill-amber-400 stroke-none" />
                  </div>
                )}
              </div>
              <p className={`text-xs font-semibold leading-snug ${item.subtextColor}`}>
                {item.subtext}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Slide Indicators */}
      <div className="flex justify-center items-center gap-1.5 mt-1.5 select-none" style={{ height: '16px', lineHeight: 0 }}>
        {TRUST_NUMBERS_CAROUSEL.map((_, idx) => (
          <span
            key={idx}
            style={{
              height: '4px',
              minHeight: '4px',
              maxHeight: '4px',
              width: activeIndex === idx ? '18px' : '4px',
              minWidth: activeIndex === idx ? '18px' : '4px',
              maxWidth: activeIndex === idx ? '18px' : '4px',
              padding: 0,
              margin: 0,
              backgroundColor: activeIndex === idx ? '#00C9AF' : '#cbd5e1',
              borderRadius: '9999px',
              display: 'inline-block',
              transition: 'all 0.3s ease'
            }}
            className="shrink-0"
          />
        ))}
      </div>
    </div>
  );
};

const HOW_IT_WORKS_STEPS = [
  {
    step: '01',
    title: 'Browse & Shortlist',
    desc: 'Filter by brand, budget. Every listing shows real inspection scores and AI-verified pricing.',
    icon: '/icons/Browse & shortlist.png',
    accentColor: '#6366F1',
    bgGradient: 'linear-gradient(145deg, rgba(99,102,241,0.15) 0%, rgba(25,43,70,0.7) 60%)',
    borderColor: 'rgba(99,102,241,0.3)',
    shadowColor: 'rgba(99,102,241,0.15)'
  },
  {
    step: '02',
    title: 'Book Test Drive',
    desc: 'Book a free doorstep test drive or visit nearest hub at your preferred time.',
    icon: '/icons/Book test drive.png',
    accentColor: '#FFAE00',
    bgGradient: 'linear-gradient(145deg, rgba(255,174,0,0.15) 0%, rgba(25,43,70,0.7) 60%)',
    borderColor: 'rgba(255,174,0,0.3)',
    shadowColor: 'rgba(255,174,0,0.15)'
  },
  {
    step: '03',
    title: 'Get Financed',
    desc: 'Pay online securely, apply for instant loans, or reserve with a small refundable deposit.',
    icon: '/icons/Get financed.png',
    accentColor: '#00C4AF',
    bgGradient: 'linear-gradient(145deg, rgba(0,196,175,0.15) 0%, rgba(25,43,70,0.7) 60%)',
    borderColor: 'rgba(0,196,175,0.3)',
    shadowColor: 'rgba(0,196,175,0.15)'
  },
  {
    step: '04',
    title: 'Drive It Home',
    desc: 'Get your certified car delivered to your home with RC transfer & 5-day money-back guarantee.',
    icon: '/icons/Drive it home.png',
    accentColor: '#EC4899',
    bgGradient: 'linear-gradient(145deg, rgba(236,72,153,0.15) 0%, rgba(25,43,70,0.7) 60%)',
    borderColor: 'rgba(236,72,153,0.3)',
    shadowColor: 'rgba(236,72,153,0.15)'
  }
];

const HowItWorksCarousel = () => {
  const scrollRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % HOW_IT_WORKS_STEPS.length;
        if (scrollRef.current) {
          const cardElem = scrollRef.current.children[nextIndex];
          if (cardElem) {
            scrollRef.current.scrollTo({
              left: cardElem.offsetLeft - 24,
              behavior: 'smooth'
            });
          }
        }
        return nextIndex;
      });
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  const handleScroll = () => {
    if (scrollRef.current) {
      const scrollLeft = scrollRef.current.scrollLeft;
      const cardWidth = scrollRef.current.offsetWidth * 0.82;
      const index = Math.round(scrollLeft / cardWidth);
      if (index >= 0 && index < HOW_IT_WORKS_STEPS.length) {
        setActiveIndex(index);
      }
    }
  };

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex flex-row sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-6 overflow-x-auto sm:overflow-visible pb-4 sm:pb-0 snap-x snap-mandatory scrollbar-none relative max-w-6xl mx-auto -mx-6 px-6 sm:mx-auto sm:px-0"
      >
        {HOW_IT_WORKS_STEPS.map((item, idx) => (
          <div
            key={item.step}
            className={`w-[calc(100vw-48px)] sm:w-auto shrink-0 snap-center sm:snap-start rounded-[2rem] p-7 md:p-8 flex flex-col justify-between transition-all duration-500 hover:-translate-y-2 h-[420px] group cursor-default relative overflow-hidden ${
              activeIndex === idx ? 'ring-2 ring-[#00C9AF]/60 scale-[1.01]' : 'opacity-95'
            }`}
            style={{
              background: item.bgGradient,
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: `1px solid ${item.borderColor}`,
              boxShadow: `0 8px 32px ${item.shadowColor}, inset 0 1px 0 rgba(255,255,255,0.1)`
            }}
          >
            <div className="flex flex-col items-start gap-2.5">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-black shadow-md"
                style={{ backgroundColor: item.accentColor }}
              >
                {item.step}
              </div>
              <div
                className="w-7 h-[3px] rounded-full"
                style={{ backgroundColor: item.accentColor }}
              ></div>
            </div>

            <div className="flex-1 flex items-center justify-center py-4">
              <img
                src={item.icon}
                alt={item.title}
                className="max-h-[145px] w-auto object-contain transition-transform duration-500 group-hover:scale-105"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>

            <div className="text-left mt-auto">
              <h3 className="font-extrabold text-[18px] sm:text-[19px] text-white mb-2.5 leading-snug">
                {item.title}
              </h3>
              <p className="text-slate-300 text-[13px] sm:text-[13.5px] leading-[1.85] min-h-[85px]">
                {item.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile Auto-Slide Indicators */}
      <div className="flex sm:hidden justify-center items-center gap-1.5 mt-4 select-none" style={{ height: '16px', lineHeight: 0 }}>
        {HOW_IT_WORKS_STEPS.map((step, idx) => (
          <button
            key={step.step}
            type="button"
            onClick={() => {
              setActiveIndex(idx);
              if (scrollRef.current) {
                const cardElem = scrollRef.current.children[idx];
                if (cardElem) {
                  scrollRef.current.scrollTo({
                    left: cardElem.offsetLeft - 24,
                    behavior: 'smooth'
                  });
                }
              }
            }}
            aria-label={`Go to step ${idx + 1}`}
            style={{
              height: '4px',
              minHeight: '4px',
              maxHeight: '4px',
              width: activeIndex === idx ? '18px' : '4px',
              minWidth: activeIndex === idx ? '18px' : '4px',
              maxWidth: activeIndex === idx ? '18px' : '4px',
              padding: 0,
              margin: 0,
              border: 'none',
              outline: 'none',
              boxSizing: 'border-box',
              backgroundColor: activeIndex === idx ? '#00C9AF' : 'rgba(255, 255, 255, 0.35)',
              borderRadius: '9999px',
              display: 'inline-block',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            className="shrink-0"
          />
        ))}
      </div>
    </div>
  );
};

const NewHome = () => {
  const navigate = useNavigate();
  const brandCarouselRef = useRef(null);
  const resolveUrl = (url) => url?.startsWith('/') ? `${API_URL}${url}` : url;

  const [coords, setCoords] = useState({ x: 0, y: 0 });

  // SEO handled via PageMeta component in return

  useEffect(() => {
    const handleMouseMove = (e) => {
      setCoords({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const [activeMobileType, setActiveMobileType] = useState('All');

  // Mobile typing placeholder states
  const searchWords = ["year", "type", "color", "make", "km driven", "fuel type", "transmission"];
  const [searchWordIndex, setSearchWordIndex] = useState(0);
  const [typingSearchText, setTypingSearchText] = useState("");
  const [isDeletingSearch, setIsDeletingSearch] = useState(false);
  const [mobileSearchText, setMobileSearchText] = useState("");
  const [mobileSearchResults, setMobileSearchResults] = useState([]);
  const [mobileSearchLoading, setMobileSearchLoading] = useState(false);
  const [showMobileSearchDropdown, setShowMobileSearchDropdown] = useState(false);
  const mobileSearchContainerRef = useRef(null);

  const [heroContent, setHeroContent] = useState({
    mobile_hero_video: '',
    mobile_hero_image: '/img/mobile_hero_cover.png',
    mobile_hero_heading: 'the master',
    mobile_hero_subheading: "India's most-trusted car home*",
    mobile_hero_btn_text: 'Buy Car',
  });
  const [isScrolled, setIsScrolled] = useState(false);
  const [city, setCity] = useState(localStorage.getItem('user_city') || 'Delhi NCR');

  const getMobileRecommendedCars = () => {
    const sourceCars = (allCars.length ? allCars : FALLBACK_CARS).filter(car => checkLocationMatch(car.location, city));

    if (activeMobileType === 'All') {
      return sourceCars.slice(0, 3);
    }
    if (activeMobileType === 'EV') {
      const evs = sourceCars.filter(car => car.fuelType?.toUpperCase() === 'EV' || car.fuelType?.toLowerCase().includes('electric'));
      return evs.length ? evs.slice(0, 3) : sourceCars.slice(0, 3);
    }
    if (activeMobileType === 'Luxury Sedan') {
      const filtered = sourceCars.filter(car => (car.bodyType === 'Sedan' || car.bodyType === 'Luxury Sedan') && car.price >= 2000000);
      return filtered.length ? filtered.slice(0, 3) : sourceCars.slice(0, 3);
    }
    if (activeMobileType === 'Luxury SUV') {
      const filtered = sourceCars.filter(car => (car.bodyType === 'SUV' || car.bodyType === 'Luxury SUV') && car.price >= 2000000);
      return filtered.length ? filtered.slice(0, 3) : sourceCars.slice(0, 3);
    }
    const filtered = sourceCars.filter(car => car.bodyType?.toLowerCase() === activeMobileType.toLowerCase());
    return filtered.length ? filtered.slice(0, 3) : sourceCars.slice(0, 3);
  };

  // Search filter states
  const [budget, setBudget] = useState('All budgets');
  const [brand, setBrand] = useState('All brands');
  const [fuelType, setFuelType] = useState('All types');

  // Dynamic API data
  const [allCars, setAllCars] = useState([]);
  const [featuredCars, setFeaturedCars] = useState([]);
  const [heroCars, setHeroCars] = useState(FALLBACK_CARS);
  const [brands, setBrands] = useState([]);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeBodyType, setActiveBodyType] = useState('Hatchback');
  const [bodyTypeCarouselIdx, setBodyTypeCarouselIdx] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(4);
  const [bodyTypeHovered, setBodyTypeHovered] = useState(false);
  const bodyTypeTabsContainerRef = useRef(null);
  const [selectedForYouCars, setSelectedForYouCars] = useState([]);
  const [featuredTab, setFeaturedTab] = useState('featured');

  // Stats count-up states
  const [listedCars, setListedCars] = useState(12400);
  const [happyBuyers, setHappyBuyers] = useState(98);
  const [avgSellTime, setAvgSellTime] = useState(24);

  const [loadingCars, setLoadingCars] = useState(true);
  const [loadingBrands, setLoadingBrands] = useState(true);
  const [carouselHovered, setCarouselHovered] = useState(false);
  const [showFomo, setShowFomo] = useState(false);
  const [fomoIndex, setFomoIndex] = useState(0);
  const [buySteps, setBuySteps] = useState([]);
  const [buyStepIdx, setBuyStepIdx] = useState(0);
  const [buySliderHovered, setBuySliderHovered] = useState(false);
  const [mobileHeroIdx, setMobileHeroIdx] = useState(0);
  const [mobileHeroHovered, setMobileHeroHovered] = useState(false);
  const [mobileTouchStart, setMobileTouchStart] = useState(null);
  const [mobileTouchEnd, setMobileTouchEnd] = useState(null);

  const mobileHeroSlides = [
    {
      id: 'slide-1',
      badge: "India's Most Trusted",
      badgeIcon: "✨",
      heading: heroContent.mobile_hero_heading || 'THE MASTER',
      subheading: heroContent.mobile_hero_subheading || "India's most-trusted car home*",
      btnText: heroContent.mobile_hero_btn_text || 'Buy Car',
      btnLink: '/buy-cars',
      image: resolveUrl(heroContent.mobile_hero_image || '/img/mobile_hero_cover.png'),
    },
    {
      id: 'slide-2',
      badge: 'Low EMI · 24hr Approval',
      badgeIcon: '⚡',
      heading: 'USED CAR LOANS',
      subheading: 'Pre-approved loans starting at 8.9% ROI with paperless process',
      btnText: 'Apply Loan',
      btnLink: '/used-car-loan',
      image: '/img/car_loan_banner_1to1.png',
    },
    {
      id: 'slide-3',
      badge: 'Selectt Assured Cover',
      badgeIcon: '🛡️',
      heading: '1-YEAR WARRANTY',
      subheading: '200-point inspection with 7-day money-back guarantee',
      btnText: 'Explore Cover',
      btnLink: '/pricing',
      image: '/img/warranty_banner_1to1.png',
    }
  ];

  // Fetch live backend data
  useEffect(() => {
    // scroll listener for back-to-top button and mobile search header
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
      setIsScrolled(window.scrollY > 60);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Location changed listener
    const handleLocationChange = () => {
      const activeCity = localStorage.getItem('user_city') || 'Delhi NCR';
      setCity(activeCity);
      fetch(`${API_URL}/api/cars`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            const availableCars = data.filter(car => car.status !== 'sold_out');
            setAllCars(availableCars);
            const personalized = getPersonalizedRecommendations(availableCars, {
              limit: 8,
              city: activeCity
            });
            setSelectedForYouCars(personalized);
          }
        })
        .catch(() => {});
    };
    window.addEventListener('location-changed', handleLocationChange);

    // Fetch site content for mobile hero details
    fetch(`${API_URL}/api/site-content`)
      .then(r => r.json())
      .then(data => {
        if (data && typeof data === 'object') {
          setHeroContent(prev => ({ ...prev, ...data }));
        }
      })
      .catch(() => { });

    // Fetch buy steps
    fetch(`${API_URL}/api/banners?page=home&type=buy-step`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const active = data.filter(s => s.is_active).sort((a, b) => a.sort_order - b.sort_order);
          if (active.length > 0) setBuySteps(active);
        }
      })
      .catch(() => { });

    // 1. Fetch live cars
    fetch(`${API_URL}/api/cars`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const availableCars = data.filter(car => car.status !== 'sold_out');
          setAllCars(availableCars);
          setFeaturedCars(availableCars.slice(0, 4));

          // Personalized recommendations based on past user behavior & affinities
          const userCity = localStorage.getItem('user_city') || 'Mumbai';
          const personalized = getPersonalizedRecommendations(availableCars, {
            limit: 8,
            city: userCity
          });
          setSelectedForYouCars(personalized);
          setFeaturedTab('selected');

          // Use the first 3 cars for the Hero section floating cards if they exist!
          if (availableCars.length >= 3) {
            const heroData = availableCars.slice(0, 3).map((car, index) => ({
              ...car,
              // Fallback default images if DB doesn't have good images
              image: car.image || FALLBACK_CARS[index].image,
              tag: car.tag || (index === 0 ? 'Verified' : undefined),
              badgeText: car.badgeText || (index === 1 ? 'Electric' : index === 2 ? 'Hot deal' : undefined)
            }));
            setHeroCars(heroData);
          } else if (availableCars.length > 0) {
            // Mix database and fallback
            const heroData = [...FALLBACK_CARS];
            availableCars.forEach((car, index) => {
              if (index < 3) {
                heroData[index] = {
                  ...car,
                  image: car.image || FALLBACK_CARS[index].image
                };
              }
            });
            setHeroCars(heroData);
          }
        }
        setLoadingCars(false);
      })
      .catch(err => {
        console.error('Error fetching cars:', err);
        setLoadingCars(false);
      });

    // 2. Fetch live brands & counts
    Promise.all([
      fetch(`${API_URL}/api/brands`).then(res => res.json()),
      fetch(`${API_URL}/api/car-counts-by-brand`).then(res => res.json())
    ])
      .then(([brandList, countList]) => {
        const STATIC_BRANDS = [
          { name: 'Maruti Suzuki', logo: '/img/maruti-suzuki.png' },
          { name: 'Hyundai', logo: '/img/hyundai.webp' },
          { name: 'Honda', logo: '/img/honda.webp' },
          { name: 'Tata', logo: '/img/tata.webp' },
          { name: 'Renault', logo: '/img/renault.webp' },
          { name: 'Kia', logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSP_u8Wi6qwILgnAKXw6gW127b4ZKqPzw6rXw&s' },
          { name: 'Ford', logo: '/img/Fored.webp' },
          { name: 'Volkswagen', logo: '/img/Volkswagen_logo.webp' },
          { name: 'Mahindra', logo: '/img/mahindra.webp' },
          { name: 'BMW', logo: '/img/bmw.png' },
          { name: 'Mercedes', logo: '/img/mercedes-benz.webp' },
        ];

        // 1. Map static popular brands with live counts
        const mergedStatic = STATIC_BRANDS.map(b => {
          const foundCount = countList.find(c => c.name.toLowerCase() === b.name.toLowerCase());
          return {
            name: b.name,
            count: foundCount ? foundCount.count : 0,
            logo: b.logo
          };
        });

        // 2. Map any additional brands from brandList not in STATIC_BRANDS
        const additionalMerged = brandList
          .filter(brandItem => !STATIC_BRANDS.some(b => b.name.toLowerCase() === brandItem.name.toLowerCase()))
          .map(brandItem => {
            const foundCount = countList.find(c => c.name.toLowerCase() === brandItem.name.toLowerCase());
            return {
              name: brandItem.name,
              count: foundCount ? foundCount.count : 0,
              logo: brandItem.logo_url?.startsWith('/') ? `${API_URL}${brandItem.logo_url}` : brandItem.logo_url
            };
          });

        const merged = [...mergedStatic, ...additionalMerged];
        setBrands(merged);
        setLoadingBrands(false);
      })
      .catch(err => {
        console.error('Error fetching brand counts:', err);
        setLoadingBrands(false);
      });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('location-changed', handleLocationChange);
    };
  }, []);


  // Handle resizing for Explore by Body Type items per view
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setItemsPerView(1);
      } else if (window.innerWidth < 1024) {
        setItemsPerView(2);
      } else {
        setItemsPerView(4);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Reset body type carousel index when active body type changes
  useEffect(() => {
    setBodyTypeCarouselIdx(0);
  }, [activeBodyType]);


  // 4. Slow Continuous Auto-Scrolling for Brand Explorer Carousel (Stops on Hover)
  useEffect(() => {
    if (carouselHovered || loadingBrands || !brands.length) return;

    const interval = setInterval(() => {
      if (brandCarouselRef.current) {
        const container = brandCarouselRef.current;
        if (container.scrollLeft >= container.scrollWidth - container.clientWidth - 2) {
          container.scrollLeft = 0;
        } else {
          container.scrollLeft += 1;
        }
      }
    }, 30); // ~33px per second scrolling

    return () => clearInterval(interval);
  }, [carouselHovered, brands, loadingBrands]);

  // Auto-sliding for Buy steps slider (Stops on Hover)
  useEffect(() => {
    if (buySliderHovered || !buySteps.length) return;

    const interval = setInterval(() => {
      setBuyStepIdx((prev) => (prev + 1) % buySteps.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [buySliderHovered, buySteps.length]);

  // Auto-sliding for Mobile Hero Banner Carousel
  useEffect(() => {
    if (mobileHeroHovered) return;
    const interval = setInterval(() => {
      setMobileHeroIdx((prev) => (prev + 1) % mobileHeroSlides.length);
    }, 3800);
    return () => clearInterval(interval);
  }, [mobileHeroHovered, mobileHeroSlides.length]);

  const handleMobileHeroTouchStart = (e) => {
    setMobileTouchStart(e.targetTouches[0].clientX);
  };
  const handleMobileHeroTouchMove = (e) => {
    setMobileTouchEnd(e.targetTouches[0].clientX);
  };
  const handleMobileHeroTouchEnd = () => {
    if (!mobileTouchStart || !mobileTouchEnd) return;
    const distance = mobileTouchStart - mobileTouchEnd;
    if (distance > 40) {
      setMobileHeroIdx((prev) => (prev + 1) % mobileHeroSlides.length);
    } else if (distance < -40) {
      setMobileHeroIdx((prev) => (prev - 1 + mobileHeroSlides.length) % mobileHeroSlides.length);
    }
    setMobileTouchStart(null);
    setMobileTouchEnd(null);
  };

  // Mobile typing search placeholder effect
  useEffect(() => {
    let timer;
    const currentWord = searchWords[searchWordIndex];
    if (isDeletingSearch) {
      if (typingSearchText === "") {
        setIsDeletingSearch(false);
        setSearchWordIndex((prev) => (prev + 1) % searchWords.length);
      } else {
        timer = setTimeout(() => {
          setTypingSearchText(typingSearchText.substring(0, typingSearchText.length - 1));
        }, 50);
      }
    } else {
      if (typingSearchText === currentWord) {
        timer = setTimeout(() => {
          setIsDeletingSearch(true);
        }, 2000);
      } else {
        timer = setTimeout(() => {
          setTypingSearchText(currentWord.substring(0, typingSearchText.length + 1));
        }, 100);
      }
    }
    return () => clearTimeout(timer);
  }, [typingSearchText, isDeletingSearch, searchWordIndex]);

  // Debounced live search effect for mobile hero input
  useEffect(() => {
    const trimmed = mobileSearchText.trim();
    if (trimmed.length < 2) {
      setMobileSearchResults([]);
      setMobileSearchLoading(false);
      setShowMobileSearchDropdown(false);
      return;
    }
    setMobileSearchLoading(true);
    setShowMobileSearchDropdown(true);

    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`${API_URL}/api/cars?search=${encodeURIComponent(trimmed)}`);
        const data = await response.json();
        setMobileSearchResults(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching mobile live search results:', error);
        setMobileSearchResults([]);
      } finally {
        setMobileSearchLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [mobileSearchText]);

  // Click outside listener to close mobile search suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileSearchContainerRef.current && !mobileSearchContainerRef.current.contains(event.target)) {
        setShowMobileSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // 5. Hero Stats Count-Up Easing Animation on Mount
  useEffect(() => {
    let start = 0;
    const duration = 1500; // 1.5s
    const intervalTime = 30; // 30ms step
    const steps = duration / intervalTime;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const ease = progress * (2 - progress); // easeOutQuad

      setListedCars(Math.round(ease * 12400));
      setHappyBuyers(Math.round(ease * 98));
      setAvgSellTime(Math.round(ease * 24));

      if (currentStep >= steps) {
        clearInterval(timer);
        setListedCars(12400);
        setHappyBuyers(98);
        setAvgSellTime(24);
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let showTimer;
    let hideTimer;
    let count = 0;
    const maxCount = 2; // Maximum 2 times total as requested by user

    const scheduleNextToast = (delayMs) => {
      showTimer = setTimeout(() => {
        if (count >= maxCount) return;

        setFomoIndex((prevIndex) => (prevIndex + 1) % FOMO_SOLD_CARS.length);
        setShowFomo(true);
        count++;

        // Hides after 3.5 seconds
        hideTimer = setTimeout(() => {
          setShowFomo(false);

          // Schedule 2nd appearance in 45 seconds if count < 2
          if (count < maxCount) {
            scheduleNextToast(45000);
          }
        }, 3500);
      }, delayMs);
    };

    // 1st Toast appears 12 seconds after page load
    scheduleNextToast(12000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  // Responsive itemsPerView handler
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1280) {
        setItemsPerView(4);
      } else if (window.innerWidth >= 1024) {
        setItemsPerView(3);
      } else if (window.innerWidth >= 640) {
        setItemsPerView(2);
      } else {
        setItemsPerView(1);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-Slide Effect for Browse by Body Type (Slides cards & cycles categories automatically)
  useEffect(() => {
    if (bodyTypeHovered) return;

    const timer = setInterval(() => {
      const filtered = getFilteredCars();
      const maxIdx = Math.max(0, filtered.length - itemsPerView);

      // If current body type has more cards to slide, slide to next card
      if (maxIdx > 0 && bodyTypeCarouselIdx < maxIdx) {
        setBodyTypeCarouselIdx(prev => prev + 1);
      } else {
        // Otherwise smoothly switch to the next body type and reset index
        setBodyTypeCarouselIdx(0);
        setActiveBodyType(prevType => {
          const currentIdx = BODY_TYPES.findIndex(b => b.name === prevType);
          const nextIdx = (currentIdx + 1) % BODY_TYPES.length;
          return BODY_TYPES[nextIdx].name;
        });
      }
    }, 3500);

    return () => clearInterval(timer);
  }, [bodyTypeHovered, activeBodyType, bodyTypeCarouselIdx, allCars, city, itemsPerView]);

  // Smoothly scroll active tab button inside horizontal container ONLY (never scrolls the window/page)
  useEffect(() => {
    const container = bodyTypeTabsContainerRef.current;
    if (container) {
      const activeEl = container.querySelector('[data-active="true"]');
      if (activeEl) {
        const containerRect = container.getBoundingClientRect();
        const activeRect = activeEl.getBoundingClientRect();
        const targetScrollLeft = container.scrollLeft + (activeRect.left - containerRect.left) - (containerRect.width / 2) + (activeRect.width / 2);
        container.scrollTo({
          left: Math.max(0, targetScrollLeft),
          behavior: 'smooth'
        });
      }
    }
  }, [activeBodyType]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (brand !== 'All brands') params.append('brand', brand);
    if (fuelType !== 'All types') params.append('fuelType', fuelType);
    if (budget !== 'All budgets') params.append('budget', budget);

    localStorage.setItem('user_city', city);
    window.dispatchEvent(new Event('location-changed'));

    navigate(`/buy-cars?${params.toString()}`);
  };

  const handleBrandClick = (brandName) => {
    navigate(`/buy-cars?brand=${encodeURIComponent(brandName)}`);
  };

  const handleViewAllBodyType = () => {
    const baseFilters = { budget: '', budget_max: 25, certification: '', brands: [], models: [], fuel: '', transmission: '', owners: [], year_min: null, km_max: null, body_type: [] };
    let query = { ...baseFilters };

    if (activeBodyType === 'Luxury Sedan') {
      query.body_type = ['Sedan'];
      query.budget = '10 L +';
    } else if (activeBodyType === 'Luxury SUV') {
      query.body_type = ['SUV'];
      query.budget = '10 L +';
    } else {
      query.body_type = [activeBodyType];
    }

    navigate('/buy-cars', { state: { filters: query } });
  };

  const prevBodyTypeSlide = () => {
    if (bodyTypeCarouselIdx > 0) {
      setBodyTypeCarouselIdx(bodyTypeCarouselIdx - 1);
    }
  };

  const nextBodyTypeSlide = () => {
    const filtered = getFilteredCars();
    if (bodyTypeCarouselIdx < filtered.length - itemsPerView) {
      setBodyTypeCarouselIdx(bodyTypeCarouselIdx + 1);
    }
  };

  const getFilteredCars = () => {
    return allCars.filter(car => {
      if (!checkLocationMatch(car.location, city)) return false;
      if (activeBodyType === 'Hatchback') return car.bodyType === 'Hatchback';
      if (activeBodyType === 'Sedan') return car.bodyType === 'Sedan' && car.price < 2000000;
      if (activeBodyType === 'SUV') return car.bodyType === 'SUV' && car.price < 2000000;
      if (activeBodyType === 'MUV') return car.bodyType === 'MUV';
      if (activeBodyType === 'Luxury Sedan') return car.bodyType === 'Sedan' && car.price >= 2000000;
      if (activeBodyType === 'Luxury SUV') return car.bodyType === 'SUV' && car.price >= 2000000;
      return false;
    });
  };

  const getFeaturedCars = () => {
    return allCars
      .filter(car => checkLocationMatch(car.location, city))
      .slice(0, 4);
  };

  const getCountForBodyType = (typeName) => {
    const cityCars = allCars.filter(car => checkLocationMatch(car.location, city));
    if (typeName === 'Luxury Sedan') return cityCars.filter(car => (car.bodyType === 'Sedan' || car.bodyType === 'Luxury Sedan') && car.price >= 2000000).length;
    if (typeName === 'Luxury SUV') return cityCars.filter(car => (car.bodyType === 'SUV' || car.bodyType === 'Luxury SUV') && car.price >= 2000000).length;
    if (typeName === 'Hatchback') return cityCars.filter(car => car.bodyType === 'Hatchback').length;
    if (typeName === 'Sedan') return cityCars.filter(car => car.bodyType === 'Sedan' && car.price < 2000000).length;
    if (typeName === 'SUV') return cityCars.filter(car => car.bodyType === 'SUV' && car.price < 2000000).length;
    if (typeName === 'MUV') return cityCars.filter(car => car.bodyType === 'MUV').length;
    return 0;
  };

  // Carousel scroll functions
  const scrollLeft = () => {
    if (brandCarouselRef.current) {
      brandCarouselRef.current.scrollBy({ left: -240, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (brandCarouselRef.current) {
      brandCarouselRef.current.scrollBy({ left: 240, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative bg-gradient-to-b from-[#162947] via-[#0C1B33] to-[#050B16] text-white min-h-screen overflow-x-hidden font-sans">
      <PageMeta
        title={`Selectt — Buy & Sell Certified Pre-Owned Cars in ${city || 'Delhi NCR'}`}
        description={`Selectt is ${city || 'Delhi NCR'}'s premier pre-owned car marketplace. Browse 200+ certified pre-owned cars with 200-point inspection, free doorstep test drives, and easy financing across ${city || 'Delhi NCR'}.`}
        canonical="/"
      />
      {/* Global blueprint grid lines background */}
      <div className="absolute inset-0 pointer-events-none z-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:60px_60px]"></div>


      {/* 1. MOBILE HERO SECTION (Hidden on Desktop) */}
      <div
        onMouseEnter={() => setMobileHeroHovered(true)}
        onMouseLeave={() => setMobileHeroHovered(false)}
        onTouchStart={handleMobileHeroTouchStart}
        onTouchMove={handleMobileHeroTouchMove}
        onTouchEnd={handleMobileHeroTouchEnd}
        className="relative w-full h-[485px] bg-gradient-to-br from-[#0C1B33] via-[#0A162A] to-[#060D1A] overflow-hidden rounded-b-3xl pb-24 pt-2 block md:hidden select-none"
      >
        {/* Background Banner Slides with Fade/Zoom Transition */}
        {mobileHeroSlides.map((slide, idx) => (
          <div
            key={slide.id}
            className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out pointer-events-none ${
              mobileHeroIdx === idx ? 'opacity-100 z-0' : 'opacity-0 z-0'
            }`}
          >
            <img
              src={slide.image}
              alt={slide.heading}
              className="absolute top-0 right-0 w-[85%] h-full object-cover object-center opacity-90 transition-transform duration-1000 scale-100"
              style={{
                maskImage: 'linear-gradient(to right, transparent 0%, black 40%)',
                WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 40%)',
              }}
              onError={(e) => {
                e.target.src = '/img/mobile_hero_cover.png';
              }}
            />
          </div>
        ))}

        {/* Search Input with Live Typing and Submit */}
        <div ref={mobileSearchContainerRef} className={`z-[100] px-4 w-full transition-all duration-300 ${isScrolled ? 'fixed top-0 left-0 pt-3 pb-3 bg-[#0C1B33]/95 backdrop-blur-md shadow-lg' : 'absolute top-[64px] left-0 bg-transparent'}`}>
          <Reveal direction="down" delay={0.3}>
            <div className="relative w-full">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setShowMobileSearchDropdown(false);
                  if (mobileSearchText.trim()) {
                    navigate(`/buy-cars?search=${encodeURIComponent(mobileSearchText.trim())}`);
                  } else {
                    navigate('/buy-cars');
                  }
                }}
                className="w-full rounded-[25px] bg-[#162947]/85 backdrop-blur-md flex items-center px-4 py-3 shadow-lg border border-white/20 relative z-10"
              >
                <button type="submit" aria-label="Search" className="mr-3 text-[#00C9AF] hover:text-white shrink-0 cursor-pointer">
                  <Search size={19} />
                </button>
                <div className="relative flex-1 flex items-center">
                  <input
                    type="text"
                    value={mobileSearchText}
                    onChange={(e) => {
                      setMobileSearchText(e.target.value);
                      if (e.target.value.trim().length >= 2) {
                        setShowMobileSearchDropdown(true);
                      }
                    }}
                    onFocus={() => {
                      if (mobileSearchText.trim().length >= 2) {
                        setShowMobileSearchDropdown(true);
                      }
                    }}
                    placeholder=""
                    className="bg-transparent border-none outline-none text-[15px] font-bold text-white tracking-wide w-full relative z-10 focus:ring-0 focus:outline-none placeholder-transparent"
                  />
                  {!mobileSearchText && (
                    <div className="absolute left-0 pointer-events-none flex items-center text-[14px] tracking-wide text-left">
                      <span className="text-white/60 font-normal mr-1">Search by</span>
                      <span className="text-[#00C9AF] font-bold">{typingSearchText}</span>
                      <span className="w-[1.5px] h-[16px] bg-[#00C9AF] ml-[1px] animate-pulse"></span>
                    </div>
                  )}
                </div>
                {mobileSearchText && (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileSearchText('');
                      setShowMobileSearchDropdown(false);
                    }}
                    className="text-white/60 hover:text-white ml-2 shrink-0 cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                )}
              </form>

              {/* Autocomplete Dropdown Panel */}
              {showMobileSearchDropdown && mobileSearchText.trim().length >= 2 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#0C1B33] border border-[#00C9AF]/30 rounded-2xl shadow-2xl z-[120] p-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 text-left">
                  {mobileSearchLoading ? (
                    <div className="py-4 text-center text-xs font-bold text-[#00C9AF] flex items-center justify-center gap-2">
                      <span className="w-3.5 h-3.5 border-2 border-[#00C9AF] border-t-transparent rounded-full animate-spin"></span>
                      <span>Searching matching cars...</span>
                    </div>
                  ) : mobileSearchResults.length > 0 ? (
                    <>
                      <div className="flex flex-col gap-1 max-h-[280px] overflow-y-auto divide-y divide-slate-800/60 scrollbar-none">
                        {mobileSearchResults.slice(0, 5).map((car) => {
                          const carImg = car.image?.startsWith('/') ? `${API_URL}${car.image}` : car.image;
                          return (
                            <Link
                              key={car.id}
                              to={getCarDetailsUrl(car)}
                              onClick={() => setShowMobileSearchDropdown(false)}
                              className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800/70 transition-colors group text-left active:bg-slate-800"
                            >
                              <div className="w-14 h-11 bg-slate-800 rounded-lg overflow-hidden shrink-0 border border-slate-700/50 flex items-center justify-center">
                                <img
                                  src={carImg}
                                  alt={`${car.make} ${car.model}`}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.src = 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=200';
                                  }}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-xs font-black text-white group-hover:text-[#00C9AF] transition-colors truncate">
                                  {car.year} {car.make} {car.model}
                                </h4>
                                <p className="text-[10px] font-semibold text-slate-400 truncate mt-0.5">
                                  {(car.km || 0).toLocaleString()} km · {car.fuelType} · {car.transmission}
                                </p>
                              </div>
                              <div className="text-right shrink-0">
                                <span className="text-xs font-black text-[#00C9AF] block">
                                  ₹{(car.price / 100000).toFixed(2)}L
                                </span>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setShowMobileSearchDropdown(false);
                          if (mobileSearchText.trim()) {
                            navigate(`/buy-cars?search=${encodeURIComponent(mobileSearchText.trim())}`);
                          }
                        }}
                        className="w-full mt-1.5 py-2.5 bg-[#00C9AF] text-[#0C1B33] text-xs font-black rounded-xl hover:bg-white transition-colors text-center uppercase tracking-wider block cursor-pointer"
                      >
                        View all results ({mobileSearchResults.length})
                      </button>
                    </>
                  ) : (
                    <div className="py-4 text-center text-xs font-bold text-slate-400">
                      No cars found matching "{mobileSearchText}"
                    </div>
                  )}
                </div>
              )}
            </div>
          </Reveal>
        </div>

        {/* Hero Banner Gradient Mask for Content Sync */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0C1B33] via-[#0C1B33]/85 to-transparent pointer-events-none z-5" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0C1B33] via-transparent to-black/30 pointer-events-none z-5" />

        {/* Hero Banner Content Slider */}
        <div className="absolute bottom-24 left-5 right-5 z-10 text-left max-w-[340px] sm:max-w-none">
          {mobileHeroSlides.map((slide, idx) => {
            if (mobileHeroIdx !== idx) return null;
            return (
              <div key={slide.id} className="animate-in fade-in slide-in-from-bottom-3 duration-500">
                {/* High-Contrast Glassmorphic Badge */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#00C9AF]/15 border border-[#00C9AF]/30 rounded-full text-xs font-black text-[#00C9AF] uppercase tracking-wider mb-2.5 backdrop-blur-md shadow-sm">
                  <span>{slide.badgeIcon || '✨'}</span>
                  <span>{slide.badge}</span>
                </div>

                {/* Big Hero Heading */}
                <h1 className="text-2xl xs:text-3xl sm:text-4xl font-black leading-[1.05] tracking-tight mb-2 uppercase text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)] whitespace-pre-line">
                  {typeof slide.heading === 'string' && slide.heading.toUpperCase().includes('YOUR CAR') ? (
                    <>
                      YOUR CAR DESERVES A <br />
                      <span className="text-[#00C9AF] bg-gradient-to-r from-[#00C9AF] via-[#52F6E2] to-[#00C9AF] bg-clip-text text-transparent">
                        FAIR PRICE.
                      </span>
                    </>
                  ) : (
                    slide.heading
                  )}
                </h1>

                {/* Subtitle */}
                <p className="text-slate-100 font-extrabold text-xs sm:text-sm tracking-tight mb-5 leading-snug drop-shadow-md line-clamp-2">
                  {slide.subheading}
                </p>

                {/* Premium Action Buttons Row (Primary CTA + Quick Buy/Sell Buttons) */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => navigate(slide.btnLink)}
                    className="bg-gradient-to-r from-[#00C9AF] via-[#00E4C0] to-[#00C9AF] hover:from-white hover:to-white text-[#0C1B33] px-4.5 py-2.5 rounded-full font-black text-xs sm:text-sm shadow-[0_6px_20px_rgba(0,201,175,0.45)] transition-all active:scale-95 cursor-pointer inline-flex items-center gap-1.5 uppercase tracking-wider group shrink-0"
                  >
                    <span>{slide.btnText}</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </button>

                  {/* Quick Access Secondary Buttons */}
                  {slide.btnText?.toUpperCase() !== 'BUY CAR' && (
                    <button
                      onClick={() => navigate('/buy-cars')}
                      className="bg-white/15 hover:bg-white/30 text-white border border-white/30 backdrop-blur-md px-3.5 py-2.5 rounded-full font-black text-[11px] transition-all active:scale-95 cursor-pointer inline-flex items-center gap-1 uppercase tracking-wider shrink-0 shadow-sm"
                    >
                      <span>Buy Car</span>
                    </button>
                  )}
                  {slide.btnText?.toUpperCase() !== 'SELL CAR' && (
                    <button
                      onClick={() => navigate('/sell-car')}
                      className="bg-white/15 hover:bg-white/30 text-white border border-white/30 backdrop-blur-md px-3.5 py-2.5 rounded-full font-black text-[11px] transition-all active:scale-95 cursor-pointer inline-flex items-center gap-1 uppercase tracking-wider shrink-0 shadow-sm"
                    >
                      <span>Sell Car</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Auto-Slide Dots Indicator - Ultra Slim Micro-Pills */}
        <div 
          style={{ height: '16px', lineHeight: 0 }} 
          className="absolute bottom-6 inset-x-0 flex items-center justify-center gap-1.5 z-20 pointer-events-auto select-none"
        >
          {mobileHeroSlides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setMobileHeroIdx(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              style={{
                height: '4px',
                minHeight: '4px',
                maxHeight: '4px',
                width: mobileHeroIdx === idx ? '18px' : '4px',
                minWidth: mobileHeroIdx === idx ? '18px' : '4px',
                maxWidth: mobileHeroIdx === idx ? '18px' : '4px',
                padding: 0,
                margin: 0,
                border: 'none',
                outline: 'none',
                boxSizing: 'border-box',
                backgroundColor: mobileHeroIdx === idx ? '#00C9AF' : 'rgba(255, 255, 255, 0.45)',
                borderRadius: '9999px',
                display: 'inline-block',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              className="shrink-0"
            />
          ))}
        </div>
      </div>

      {/* MOBILE-ONLY BROWSE & RECOMMENDATIONS SECTION */}
      <div className="block md:hidden relative z-20 bg-[#F4F6F9] rounded-t-[32px] -mt-6 pt-6 pb-6 px-4">
        {/* Browse by Type */}
        <div className="text-left mb-6">
          <h3 className="text-sm font-extrabold text-[#0C1B33] uppercase tracking-wider mb-2">Browse by type</h3>
          <div className="flex gap-3 overflow-x-auto pt-2.5 pb-3.5 px-4 -mx-4 scrollbar-none">
            {[
              { id: 'All', label: 'All', img: '/img/hatchback.png', hoverImg: '/img/hatchback-hover.png' },
              { id: 'Hatchback', label: 'Hatchback', img: '/img/hatchback.png', hoverImg: '/img/hatchback-hover.png' },
              { id: 'Sedan', label: 'Sedan', img: '/img/sedan.png', hoverImg: '/img/sedan-hover.png' },
              { id: 'SUV', label: 'SUV', img: '/img/suv.png', hoverImg: '/img/suv-hover.png' },
              { id: 'MUV', label: 'MUV', img: '/img/muv.png', hoverImg: '/img/muv-hover.png' },
              { id: 'Luxury Sedan', label: 'Luxury Sedan', img: '/img/luxury-sedan.png', hoverImg: '/img/luxury-sedan-hover.png' },
              { id: 'Luxury SUV', label: 'Luxury SUV', img: '/img/luxury-suv.png', hoverImg: '/img/luxury-suv-hover.png' },
              { id: 'EV', label: 'EV', img: '/img/suv.png', hoverImg: '/img/suv-hover.png' }
            ].map((type) => {
              const isActive = activeMobileType === type.id;
              return (
                <button
                  key={type.id}
                  onClick={() => setActiveMobileType(type.id)}
                  className={`group flex flex-col items-center justify-center w-[80px] h-[80px] rounded-[18px] transition-all duration-300 shrink-0 relative cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-b from-[#E6FAF7] to-[#D6F6F1] border-2 border-[#00C9AF] shadow-[0_4px_16px_rgba(0,201,175,0.3)] ring-2 ring-[#00C9AF]/35 scale-[1.02]'
                      : 'bg-white border border-slate-200/80 hover:border-slate-300 shadow-xs hover:shadow-sm active:scale-95'
                  }`}
                >
                  {type.id === 'EV' && (
                    <span className="absolute top-1 right-1 text-[9px] bg-emerald-500 text-white rounded-full w-4 h-4 flex items-center justify-center font-black shadow-xs">⚡</span>
                  )}
                  <div className="w-13 h-7 flex items-center justify-center mb-1">
                    <img
                      src={isActive ? type.hoverImg : type.img}
                      alt={type.label}
                      className={`w-full h-full object-contain transition-transform duration-300 ${
                        isActive ? 'scale-110 -translate-y-0.5' : 'group-hover:scale-105'
                      }`}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                  <span className={`text-[11.5px] font-extrabold leading-tight text-center px-0.5 tracking-tight transition-colors ${
                    isActive ? 'text-[#008A77]' : 'text-[#0C1B33]'
                  }`}>
                    {type.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Recommended for You List */}
        <div className="text-left">
          <h3 className="text-sm sm:text-base font-extrabold text-[#0C1B33] uppercase tracking-wider mb-3">Recommended for you</h3>

          <div className="flex flex-col gap-3">
            {getMobileRecommendedCars().map((car) => {
              const badge = getBadgeStyles(car.badgeText || car.tag);
              return (
                <Link
                  key={car.id}
                  to={getCarDetailsUrl(car)}
                  className="bg-white border border-slate-200/70 rounded-2xl p-3.5 flex gap-4 hover:shadow-md transition-all duration-300 text-slate-900"
                >
                  {/* Left: Car Image inside soft background */}
                  <div className={`w-[115px] h-[90px] rounded-xl overflow-hidden shrink-0 flex items-center justify-center ${car.fuelType === 'EV' ? 'bg-[#EBF7F2]' : 'bg-[#EBF3FC]'}`}>
                    <img
                      src={car.image?.startsWith('/') ? `${API_URL}${car.image}` : car.image}
                      alt={`${car.year} ${car.make} ${car.model}`}
                      className="w-full h-full object-cover mix-blend-multiply"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=200';
                      }}
                    />
                  </div>

                  {/* Right: Info */}
                  <div className="flex-grow flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex items-center justify-between gap-1.5 min-w-0">
                        <span className="text-xs font-black text-[#00C9AF] tracking-wider uppercase leading-none truncate min-w-0">
                          {car.make}
                        </span>
                        {badge.label && (
                          <div className={`${badge.bg} ${badge.color} ${badge.border || 'border-slate-200'} border px-2.5 py-0.5 rounded-full text-[11px] font-extrabold shrink-0 whitespace-nowrap shadow-xs max-w-[140px]`}>
                            <span className="truncate">{badge.label}</span>
                          </div>
                        )}
                      </div>

                      <h4 className="text-[15px] font-extrabold text-[#0C1B33] leading-snug mt-0.5 truncate w-full">
                        {car.model}
                      </h4>

                      <span className="text-xs font-semibold text-slate-600 block leading-none mt-1 truncate">
                        {car.year} · {car.km ? car.km.toLocaleString('en-IN') : '18,200'} km · {car.fuelType}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-lg font-black text-[#0C1B33] leading-none">
                          ₹{(car.price / 100000).toFixed(2)}L
                        </span>
                        {hasPriceDrop(car) && (
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-[#FFF0F3] text-[#E11D48] border border-[#FFE0E6] shadow-xs tracking-tight">
                            <TrendingDown size={11} strokeWidth={2.5} className="shrink-0 text-[#E11D48]" />
                            <span>Price Drop</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Buy / Sell Cards - Both in 1 Same Row with Short Height */}
        <div className="pt-4 pb-2 grid grid-cols-2 gap-3">
          {/* BUY CAR CARD - SHORT HEIGHT IN 1 ROW */}
          <Link
            to="/buy-cars"
            className="bg-[#0C1B33] rounded-2xl p-3.5 flex flex-col justify-between h-[100px] relative overflow-hidden shadow-sm border border-slate-700/50 group active:scale-[0.98] transition-all text-left"
          >
            {/* Background Image & Gradient Overlay */}
            <img
              src="/img/buy_car_banner.png"
              alt="Buy Cars"
              className="absolute right-0 top-0 w-[60%] h-full object-cover object-center opacity-75 group-hover:scale-105 transition-transform duration-500 rounded-r-2xl pointer-events-none"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0C1B33] via-[#0C1B33]/85 to-transparent z-0 pointer-events-none"></div>

            <div className="z-10 relative">
              <span className="text-xs font-black text-[#00C9AF] uppercase tracking-wider block leading-none mb-1">
                12.4K+ Stock
              </span>
              <h3 className="text-white text-base font-black tracking-tight leading-tight">
                Buy Car
              </h3>
            </div>

            <div className="z-10 relative">
              <span className="inline-flex items-center gap-0.5 px-3 py-1 bg-[#00C9AF] text-[#0C1B33] text-xs font-black rounded-lg shadow-xs group-hover:bg-white transition-colors">
                Browse →
              </span>
            </div>
          </Link>

          {/* SELL CAR CARD - SHORT HEIGHT IN 1 ROW */}
          <Link
            to="/sell-car"
            className="bg-[#00A38D] rounded-2xl p-3.5 flex flex-col justify-between h-[100px] relative overflow-hidden shadow-sm group active:scale-[0.98] transition-all text-left"
          >
            {/* Background Image & Gradient Overlay */}
            <img
              src="/img/sell_car_banner.png"
              alt="Sell Cars"
              className="absolute right-0 top-0 w-[60%] h-full object-cover object-center opacity-80 group-hover:scale-105 transition-transform duration-500 rounded-r-2xl pointer-events-none"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#00C9AF] via-[#00C9AF]/85 to-transparent z-0 pointer-events-none"></div>

            <div className="z-10 relative">
              <span className="text-xs font-black text-white/90 uppercase tracking-wider block leading-none mb-1">
                Keys In Hand
              </span>
              <h3 className="text-white text-base font-black tracking-tight leading-tight">
                Sell Car
              </h3>
            </div>

            <div className="z-10 relative">
              <span className="inline-flex items-center gap-0.5 px-3 py-1 bg-[#0C1B33] text-white text-xs font-black rounded-lg shadow-xs group-hover:bg-slate-900 transition-colors">
                Valuate →
              </span>
            </div>
          </Link>
        </div>

        {/* Quick Services Grid - Brand Suitable Cohesive Color Scale */}
        <div className="my-4 bg-white border border-slate-100 rounded-3xl p-5 shadow-sm text-left">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
              Quick Services
            </span>
            <span className="w-2 h-2 rounded-full bg-[#00C9AF] animate-pulse"></span>
          </div>

          <div className="grid grid-cols-3 gap-y-5 gap-x-3">
            {[
              {
                label: 'Offer Zone',
                icon: <Tag size={20} />,
                badgeStyle: 'bg-[#E6FAF7] text-[#009684] border-[#00C9AF]/30',
                path: '/buy-cars',
                state: { filters: { tag: 'Offer Zone' } }
              },
              {
                label: 'Selectt Luxury',
                icon: <Award size={20} />,
                badgeStyle: 'bg-amber-50 text-amber-700 border-amber-200/80',
                path: '/buy-cars',
                state: { filters: { tag: 'Selectt Luxury' } }
              },
              {
                label: 'Car Valuation',
                icon: <BadgeIndianRupee size={20} />,
                badgeStyle: 'bg-[#E6FAF7] text-[#009684] border-[#00C9AF]/30',
                path: '/sell-car'
              },
              {
                label: 'Exchange',
                icon: <RotateCcw size={20} />,
                badgeStyle: 'bg-[#E6FAF7] text-[#009684] border-[#00C9AF]/30',
                path: '/sell-car',
                state: { mode: 'exchange' }
              },
              {
                label: 'EMI Calculator',
                icon: <CreditCard size={20} />,
                badgeStyle: 'bg-[#E6FAF7] text-[#009684] border-[#00C9AF]/30',
                path: '/pricing'
              },
              {
                label: 'Customer Stories',
                icon: <Star size={20} />,
                badgeStyle: 'bg-[#E6FAF7] text-[#009684] border-[#00C9AF]/30',
                path: '/customer-reviews'
              }
            ].map((item, idx) => (
              <Link
                to={item.path}
                state={item.state}
                key={idx}
                className="group flex flex-col items-center text-center cursor-pointer active:scale-95 transition-transform"
              >
                <div className={`w-13 h-13 rounded-2xl flex items-center justify-center font-extrabold mb-2 border shadow-2xs transition-all group-hover:scale-105 ${item.badgeStyle}`}>
                  {item.icon}
                </div>
                <span className="text-[11px] font-bold text-slate-800 leading-tight">
                  {item.label}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Highlight Video */}
        <div className="w-full aspect-video bg-black my-6 rounded-2xl overflow-hidden shadow-md">
          <video
            src="https://mda-dev.spinny.com/sp-file-system/public/2026-02-16/3f7957ad509b4fc888114ae91d3690be/raw/file.mp4"
            autoPlay loop muted playsInline
            className="w-full h-full object-cover"
          />
        </div>

        {/* Numbers That Trust Us - Auto-Sliding Generated Banner Carousel */}
        <div className="py-4">
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-xs font-extrabold text-[#0C1B33] uppercase tracking-widest text-left">
              Numbers that trust us
            </h2>
            <span className="text-[10px] font-bold text-[#00C9AF] uppercase">Verified Ratings</span>
          </div>

          <NumbersThatTrustUsCarousel />
        </div>

        {/* Explore Financial Services - 1:1 Auto-Sliding Carousel */}
        <div className="py-4">
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-xs font-extrabold text-[#0C1B33] uppercase tracking-widest text-left">
              Financial Services
            </h2>
            <span className="text-[10px] font-bold text-[#00C9AF] uppercase">Auto Slide</span>
          </div>

          <FinancialServicesCarousel />
        </div>
      </div>

      {/* 1. HERO SECTION (DARK BACKGROUND - Sleek & Glowy - Hidden on mobile) */}
      <section className="hidden md:flex relative min-h-[85vh] items-center pt-0 pb-16 px-6 md:px-12 overflow-hidden bg-transparent z-10">

        {/* Glow meshes & Orbs */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_80%_68%_at_66%_36%,rgba(0,242,200,0.12)_0%,transparent_58%),radial-gradient(ellipse_50%_50%_at_14%_80%,rgba(0,90,255,0.08)_0%,transparent_60%),radial-gradient(ellipse_40%_40%_at_90%_80%,rgba(180,0,255,0.05)_0%,transparent_60%)]"></div>
          <div className="absolute w-[600px] h-[600px] top-[-150px] right-[-100px] bg-[radial-gradient(circle,rgba(0,242,200,0.09)_0%,transparent_70%)] animate-float-orb"></div>
          <div className="absolute w-[500px] h-[500px] bottom-[-100px] left-[25%] bg-[radial-gradient(circle,rgba(0,90,255,0.07)_0%,transparent_70%)] animate-float-orb-delayed"></div>
        </div>

        <div className="max-w-7xl mx-auto w-full relative z-10 flex flex-col gap-12">

          {/* Main Hero Content (Left text + right floating cards) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Text Column */}
            <div className="space-y-6 text-left  mt-10">
              <div className="inline-flex items-center gap-2 bg-[#E6FAF7] border border-[#00C9AF]/30 text-[#0A524A] px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase">
                India's most trusted car marketplace
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black font-heading leading-[1.08] tracking-tight">
                Find the perfect car. <br />
                At a <span className="text-[#00C9AF] bg-gradient-to-r from-[#00C9AF] to-[#00F2C8] bg-clip-text text-transparent">fair price</span>. <br />
                Always.
              </h1>

              <p className="text-slate-300 md:text-slate-200 text-base md:text-lg max-w-lg leading-relaxed font-medium">
                Every vehicle is 200-point inspected, priced right, and backed by a 7-day return policy. No dealers. No drama.
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <button
                  onClick={() => navigate('/buy-cars')}
                  className="px-8 py-4 bg-[#00C9AF] hover:bg-[#00A391] text-[#06090F] font-bold rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg shadow-[#00C9AF]/20 text-[15px]"
                >
                  Browse Cars
                </button>
                <button
                  onClick={() => navigate('/sell-car')}
                  className="px-8 py-4 bg-transparent border-2 border-slate-700 hover:border-white text-white font-bold rounded-xl transition-all duration-300 text-[15px]"
                >
                  Sell My Car
                </button>
              </div>
            </div>

            {/* Right Floating Visual Column: Real Cars clickable with visible gaps */}
            <div className="relative h-[480px] w-full hidden sm:flex items-center justify-center lg:justify-end">
              {/* Card 1: Floating slow, dark, clickable */}
              <Link
                to={`/car/${heroCars[0]?.id}`}
                className="absolute w-[230px] md:w-[245px] bg-[#192B46] border border-slate-700/60 rounded-2xl shadow-2xl animate-float-card-1 left-[-25px] md:left-[-40px] top-[8%] transition-[border-color,box-shadow] duration-300 group cursor-pointer z-10 hover:border-slate-500 hover:scale-[1.02]"
              >
                <div className="p-3 pb-0">
                  <div className="h-[120px] w-full rounded-xl overflow-hidden relative">
                    <img
                      src={heroCars[0]?.image?.startsWith('/') ? `${API_URL}${heroCars[0].image}` : heroCars[0]?.image}
                      alt={`${heroCars[0]?.make} ${heroCars[0]?.model}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.target.src = FALLBACK_CARS[0].image;
                      }}
                    />
                  </div>
                </div>
                <div className="p-3">
                  <div className="text-[9px] font-bold text-[#00C9AF] tracking-wider uppercase">{heroCars[0]?.make}</div>
                  <div className="text-[14px] font-medium text-white/95 mt-0.5 group-hover:text-[#00C9AF] transition-colors leading-tight truncate">
                    {heroCars[0]?.make} {heroCars[0]?.model}
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-700/50">
                    <span className="text-[19px] font-black text-white font-price">
                      ₹{heroCars[0]?.price ? (heroCars[0].price / 100000).toFixed(2) + 'L' : '12.40L'}
                    </span>
                    <span className="text-[9px] px-2 py-0.5 bg-[#00C9AF]/10 border border-[#00C9AF]/20 text-[#00C9AF] rounded-full font-bold">
                      {heroCars[0]?.tag || 'Verified'}
                    </span>
                  </div>
                  <div className="text-[9px] text-slate-400 mt-1">
                    {heroCars[0]?.year} · {heroCars[0]?.km ? heroCars[0].km.toLocaleString() : '18,200'} km · {heroCars[0]?.fuelType}
                  </div>
                </div>
              </Link>

              {/* Card 2: Floating slow, dark, clickable */}
              <Link
                to={`/car/${heroCars[1]?.id}`}
                className="absolute w-[230px] md:w-[245px] bg-[#192B46] border border-slate-700/60 rounded-2xl shadow-2xl animate-float-card-2 right-[-25px] md:right-[-30px] top-[26%] transition-[border-color,box-shadow] duration-300 group cursor-pointer z-10 hover:border-slate-500 hover:scale-[1.02]"
              >
                <div className="p-3 pb-0">
                  <div className="h-[120px] w-full rounded-xl overflow-hidden relative">
                    <img
                      src={heroCars[1]?.image?.startsWith('/') ? `${API_URL}${heroCars[1].image}` : heroCars[1]?.image}
                      alt={`${heroCars[1]?.make} ${heroCars[1]?.model}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.target.src = FALLBACK_CARS[1].image;
                      }}
                    />
                  </div>
                </div>
                <div className="p-3">
                  <div className="text-[9px] font-bold text-[#00C9AF] tracking-wider uppercase">{heroCars[1]?.make}</div>
                  <div className="text-[14px] font-medium text-white/95 mt-0.5 group-hover:text-[#00C9AF] transition-colors leading-tight truncate">
                    {heroCars[1]?.make} {heroCars[1]?.model}
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-700/50">
                    <span className="text-[19px] font-black text-white font-price">
                      ₹{heroCars[1]?.price ? (heroCars[1].price / 100000).toFixed(2) + 'L' : '16.80L'}
                    </span>
                    <span className="text-[9px] px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full font-bold">
                      {heroCars[1]?.badgeText || 'Electric'}
                    </span>
                  </div>
                  <div className="text-[9px] text-slate-400 mt-1">
                    {heroCars[1]?.year} · {heroCars[1]?.km ? heroCars[1].km.toLocaleString() : '9,800'} km · {heroCars[1]?.fuelType}
                  </div>
                </div>
              </Link>

              {/* Card 3: Floating slow, dark, clickable */}
              <Link
                to={`/car/${heroCars[2]?.id}`}
                className="absolute w-[230px] md:w-[245px] bg-[#192B46] border border-slate-700/60 rounded-2xl shadow-2xl animate-float-card-3 left-[60%] -translate-x-1/2 bottom-[4%] transition-[border-color,box-shadow] duration-300 group group-hover:z-30 cursor-pointer z-20 hover:border-slate-500 hover:scale-[1.02]"
              >
                <div className="p-3 pb-0">
                  <div className="h-[120px] w-full rounded-xl overflow-hidden relative">
                    <img
                      src={heroCars[2]?.image?.startsWith('/') ? `${API_URL}${heroCars[2].image}` : heroCars[2]?.image}
                      alt={`${heroCars[2]?.make} ${heroCars[2]?.model}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.target.src = FALLBACK_CARS[2].image;
                      }}
                    />
                  </div>
                </div>
                <div className="p-3">
                  <div className="text-[9px] font-bold text-[#00C9AF] tracking-wider uppercase">{heroCars[2]?.make}</div>
                  <div className="text-[14px] font-medium text-white/95 mt-0.5 group-hover:text-[#00C9AF] transition-colors leading-tight truncate">
                    {heroCars[2]?.make} {heroCars[2]?.model}
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-700/50">
                    <span className="text-[19px] font-black text-white font-price">
                      ₹{heroCars[2]?.price ? (heroCars[2].price / 100000).toFixed(2) + 'L' : '8.90L'}
                    </span>
                    <span className="text-[9px] px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full font-bold">
                      {heroCars[2]?.badgeText || 'Hot Deal'}
                    </span>
                  </div>
                  <div className="text-[9px] text-slate-400 mt-1">
                    {heroCars[2]?.year} · {heroCars[2]?.km ? heroCars[2].km.toLocaleString() : '32,000'} km · {heroCars[2]?.fuelType}
                  </div>
                </div>
              </Link>

            </div>
          </div>

          {/* 2. STATS & SEARCH SECTION IN ONE ROW (DARK BLOCK WITH WHITE SEARCH CARD) */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 w-full mt-4">

            {/* Stats Block (Left Side) - No white background, white text */}
            <div className="flex w-full lg:w-auto justify-between sm:justify-start gap-4 md:gap-8 text-white py-4 shrink-0">
              <div className="w-[110px] md:w-[135px] shrink-0">
                <StatCounter value={12400} suffix="+" duration={1.5} className="text-2xl md:text-3xl font-black text-white leading-none block tabular-nums" />
                <div className="text-[10px] text-slate-400 font-extrabold mt-2 uppercase tracking-wider leading-tight">Cars listed</div>
              </div>
              <div className="w-[95px] md:w-[115px] shrink-0">
                <StatCounter value={98} suffix="%" duration={1.5} className="text-2xl md:text-3xl font-black text-white leading-none block tabular-nums" />
                <div className="text-[10px] text-slate-400 font-extrabold mt-2 uppercase tracking-wider leading-tight">Happy buyers</div>
              </div>
              <div className="w-[95px] md:w-[115px] shrink-0">
                <StatCounter value={24} suffix="hr" duration={1.5} className="text-2xl md:text-3xl font-black text-white leading-none block tabular-nums" />
                <div className="text-[10px] text-slate-400 font-extrabold mt-2 uppercase tracking-wider leading-tight">Avg sell time</div>
              </div>
            </div>

            {/* Search Block (Right Side) - White card container */}
            <div className="flex-1 w-full bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-2xl text-slate-900">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 md:gap-4 items-end">
                {/* Budget */}
                <div className="text-left">
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-600 mb-1.5">Budget</label>
                  <div className="relative">
                    <select
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] text-slate-900 focus:outline-none focus:border-[#00C9AF] transition-colors appearance-none cursor-pointer font-semibold"
                    >
                      <option>All budgets</option>
                      <option>Under ₹5L</option>
                      <option>₹5L – ₹10L</option>
                      <option>₹10L – ₹20L</option>
                      <option>Above ₹20L</option>
                    </select>
                  </div>
                </div>

                {/* Brand */}
                <div className="text-left">
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-600 mb-1.5">Brand</label>
                  <div className="relative">
                    <select
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] text-slate-900 focus:outline-none focus:border-[#00C9AF] transition-colors appearance-none cursor-pointer font-semibold"
                    >
                      <option>All brands</option>
                      {brands.map((b, idx) => (
                        <option key={idx} value={b.name}>{b.name}</option>
                      ))}
                      {!brands.length && (
                        <>
                          <option>Maruti Suzuki</option>
                          <option>Hyundai</option>
                          <option>Tata</option>
                          <option>Honda</option>
                          <option>Kia</option>
                          <option>Toyota</option>
                          <option>Mahindra</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>

                {/* Fuel Type */}
                <div className="text-left">
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-600 mb-1.5">Fuel Type</label>
                  <div className="relative">
                    <select
                      value={fuelType}
                      onChange={(e) => setFuelType(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] text-slate-900 focus:outline-none focus:border-[#00C9AF] transition-colors appearance-none cursor-pointer font-semibold"
                    >
                      <option>All types</option>
                      <option>Petrol</option>
                      <option>Diesel</option>
                      <option>Electric</option>
                      <option>CNG</option>
                    </select>
                  </div>
                </div>

                {/* City */}
                <div className="text-left">
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-600 mb-1.5">City</label>
                  <div className="relative">
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] text-slate-900 focus:outline-none focus:border-[#00C9AF] transition-colors appearance-none cursor-pointer font-semibold"
                    >
                      <option>Mumbai</option>
                      <option>Delhi NCR</option>
                      <option>Bangalore</option>
                      <option>Pune</option>
                      <option>Hyderabad</option>
                      <option>Chennai</option>
                    </select>
                  </div>
                </div>

                {/* Search Button */}
                <div>
                  <button
                    onClick={handleSearch}
                    className="w-full bg-[#06090F] hover:bg-slate-900 text-white font-bold rounded-xl py-3 px-3 flex items-center justify-center gap-1.5 transition-all duration-300 transform hover:scale-[1.02] cursor-pointer text-xs md:text-[13px] whitespace-nowrap"
                  >
                    Search cars →
                  </button>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 3. TRUST BAR (Hidden on mobile) */}
      <section className="hidden md:block bg-[#192B46]/40 backdrop-blur-md text-white py-8 px-6 md:px-12 border-b border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-6 md:gap-4">

          <div className="flex items-center gap-3.5 min-w-[200px] group cursor-default">
            <div className="w-[42px] h-[42px] bg-white/5 border border-white/10 rounded-[10px] flex items-center justify-center text-xl shrink-0 shadow-sm transition-all duration-300 transform group-hover:scale-120 group-hover:rotate-12 group-hover:shadow-md">
              🏆
            </div>
            <div>
              <h4 className="font-extrabold text-[13px] text-white leading-tight group-hover:text-[#00CCB3] transition-colors">200-pt Inspection</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Every car, no exceptions</p>
            </div>
          </div>

          <div className="w-[1px] h-9 bg-white/10 hidden md:block"></div>

          <div className="flex items-center gap-3.5 min-w-[200px] group cursor-default">
            <div className="w-[42px] h-[42px] bg-white/5 border border-white/10 rounded-[10px] flex items-center justify-center text-xl shrink-0 shadow-sm transition-all duration-300 transform group-hover:scale-120 group-hover:rotate-12 group-hover:shadow-md">
              🤖
            </div>
            <div>
              <h4 className="font-extrabold text-[13px] text-white leading-tight group-hover:text-[#00CCB3] transition-colors">AI Fair Pricing</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">50,000+ data points</p>
            </div>
          </div>

          <div className="w-[1px] h-9 bg-white/10 hidden md:block"></div>

          <div className="flex items-center gap-3.5 min-w-[200px] group cursor-default">
            <div className="w-[42px] h-[42px] bg-white/5 border border-white/10 rounded-[10px] flex items-center justify-center text-xl shrink-0 shadow-sm transition-all duration-300 transform group-hover:scale-120 group-hover:rotate-12 group-hover:shadow-md">
              🚚
            </div>
            <div>
              <h4 className="font-extrabold text-[13px] text-white leading-tight group-hover:text-[#00CCB3] transition-colors">Doorstep Delivery</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Available in 30+ cities</p>
            </div>
          </div>

          <div className="w-[1px] h-9 bg-white/10 hidden md:block"></div>

          <div className="flex items-center gap-3.5 min-w-[200px] group cursor-default">
            <div className="w-[42px] h-[42px] bg-white/5 border border-white/10 rounded-[10px] flex items-center justify-center text-xl shrink-0 shadow-sm transition-all duration-300 transform group-hover:scale-120 group-hover:rotate-12 group-hover:shadow-md">
              ↩️
            </div>
            <div>
              <h4 className="font-extrabold text-[13px] text-white leading-tight group-hover:text-[#00CCB3] transition-colors">7-Day Returns</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">No questions asked return</p>
            </div>
          </div>

          <div className="w-[1px] h-9 bg-white/10 hidden md:block"></div>

          <div className="flex items-center gap-3.5 min-w-[200px] group cursor-default">
            <div className="w-[42px] h-[42px] bg-white/5 border border-white/10 rounded-[10px] flex items-center justify-center text-xl shrink-0 shadow-sm transition-all duration-300 transform group-hover:scale-120 group-hover:rotate-12 group-hover:shadow-md">
              📋
            </div>
            <div>
              <h4 className="font-extrabold text-[13px] text-white leading-tight group-hover:text-[#00CCB3] transition-colors">RC Transfer</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Complete end-to-end help</p>
            </div>
          </div>

        </div>
      </section>



      {/* 5. FEATURED CARS / SELECTED FOR YOU SECTION */}
      <section className="pt-10 md:pt-12 pb-2 px-6 md:px-12 bg-[#fff] backdrop-blur-md text-white border-t border-white/5 relative z-10">
        <div className="w-full max-w-[1440px] mx-auto">

          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-[#00CCB3] text-[11px] font-bold tracking-widest uppercase mb-2 block font-heading">
                {featuredTab === 'selected' ? 'Selected For You' : 'Handpicked Stock'}
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold font-heading text-[#0C1B33]">
                {featuredTab === 'selected' ? 'Handpicked For You' : 'Featured Cars'}
              </h2>
              <p className="text-[#0C1B33] text-sm mt-1">
                {featuredTab === 'selected'
                  ? 'Based on cars you recently viewed and searched'
                  : 'Hand-picked premium cars inspected by Selectt engineers.'
                }
              </p>
            </div>
            <Link
              to="/buy-cars"
              className="inline-flex items-center gap-2 text-[#00CCB3] hover:text-[#00FFDF] font-bold text-sm transition-colors group"
            >
              See all 12,400+ cars
              <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Tab switcher if user has recently viewed/searched cars */}
          {selectedForYouCars.length > 0 && (
            <div className="flex gap-6 mb-8 border-b border-white/10">
              <button
                onClick={() => setFeaturedTab('selected')}
                className={`pb-3 font-bold text-sm transition-all relative cursor-pointer ${featuredTab === 'selected'
                  ? 'text-[#00CCB3] font-extrabold'
                  : 'text-slate-400 hover:text-slate-200'
                  }`}
              >
                Selected for You
                {featuredTab === 'selected' && (
                  <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#00CCB3] rounded-full"></div>
                )}
              </button>
              <button
                onClick={() => setFeaturedTab('featured')}
                className={`pb-3 font-bold text-sm transition-all relative cursor-pointer ${featuredTab === 'featured'
                  ? 'text-[#00CCB3] font-extrabold'
                  : 'text-slate-400 hover:text-slate-200'
                  }`}
              >
                Featured Listings
                {featuredTab === 'featured' && (
                  <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#00CCB3] rounded-full"></div>
                )}
              </button>
            </div>
          )}

          {loadingCars ? (
            <div className="flex flex-row md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 overflow-x-auto md:overflow-visible pb-4 md:pb-0 snap-x snap-mandatory scrollbar-none -mx-6 px-6 md:mx-0 md:px-0">
              {[1, 2, 3, 4].map(idx => (
                <div key={idx} className="w-[calc(100vw-48px)] md:w-auto shrink-0 md:shrink snap-center md:snap-start bg-[#192B46] border border-white/5 rounded-2xl p-4 h-[350px] animate-pulse">
                  <div className="h-[160px] bg-slate-700/50 rounded-xl mb-4"></div>
                  <div className="h-4 bg-slate-700/50 rounded w-[60%] mb-3"></div>
                  <div className="h-3 bg-slate-700/50 rounded w-[80%] mb-6"></div>
                  <div className="h-8 bg-slate-700/50 rounded w-full"></div>
                </div>
              ))}
            </div>
          ) : (featuredTab === 'selected' ? selectedForYouCars.slice(0, 4) : getFeaturedCars()).length > 0 ? (
            <div className="flex flex-row md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 overflow-x-auto md:overflow-visible pb-4 md:pb-0 snap-x snap-mandatory scrollbar-none -mx-6 px-6 md:mx-0 md:px-0">
              {(featuredTab === 'selected' ? selectedForYouCars.slice(0, 4) : getFeaturedCars()).map(car => (
                <div key={car.id} className="w-[calc(100vw-48px)] md:w-auto shrink-0 md:shrink snap-center md:snap-start transition-all duration-300 hover:-translate-y-1">
                  <CarCard car={car} lightBg={true} />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 font-bold bg-[#192B46] rounded-2xl border border-white/5 shadow-none w-full">
              <p className="text-sm">No featured cars found in {city}</p>
              <p className="text-xs opacity-60 font-medium mt-1">Try changing your location or check back later</p>
            </div>
          )}

        </div>
      </section>

      {/* 6. BRAND EXPLORER (LIGHT BLUE-GRAY BACKGROUND - Carousel/Grid style with Real Admin Uploads) */}
      <section className="py-4 px-4 sm:px-6 md:px-12 bg-[#fff] relative z-10">
        <div className="w-full max-w-[1440px] mx-auto bg-slate-50/80 border border-slate-200/90 rounded-3xl p-5 sm:p-7 shadow-xs">

          <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
            <div>
              <span className="text-[#00CCB3] text-[10px] font-bold tracking-widest uppercase mb-1.5 block font-heading">Choose Brand</span>
              <h2 className="text-xl md:text-3xl font-extrabold font-heading text-black tracking-tight mb-2 sm:mb-2.5">Explore Popular Brands</h2>
              <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">Directly view stock segments matching your favourite brand with live counts.</p>
            </div>

            {/* Carousel Buttons */}
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={scrollLeft}
                className="w-8 h-8 rounded-full bg-[#0C1B33] border border-white/10 hover:border-[#00CCB3] flex items-center justify-center text-white transition-colors shadow-none cursor-pointer"
              >
                <ChevronLeft size={16} strokeWidth={2.5} />
              </button>
              <button
                onClick={scrollRight}
                className="w-8 h-8 rounded-full bg-[#0C1B33] border border-white/10 hover:border-[#00CCB3] flex items-center justify-center text-white transition-colors shadow-none cursor-pointer"
              >
                <ChevronRight size={16} strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {loadingBrands ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {[1, 2, 3, 4, 5, 6].map(idx => (
                <div key={idx} className="bg-[#0C1B33] border border-white/5 rounded-2xl p-3 h-[60px] animate-pulse"></div>
              ))}
            </div>
          ) : (
            <>
              {/* Desktop View (Carousel) */}
              <div
                ref={brandCarouselRef}
                className="hidden md:flex gap-3 overflow-x-auto hide-scrollbar py-2 px-1 -mx-1 brand-scroller-mask"
                onMouseEnter={() => setCarouselHovered(true)}
                onMouseLeave={() => setCarouselHovered(false)}
              >
                {brands.map((brand, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleBrandClick(brand.name)}
                    className="bg-white border border-[#00CCB3]/20 hover:border-[#00CCB3]/50 rounded-xl p-3 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-black/15 transform hover:-translate-y-0.5 group min-w-[110px] md:min-w-[130px] h-[64px] flex-shrink-0"
                  >
                    <div className="h-7 w-full flex items-center justify-center">
                      <img
                        src={brand.logo}
                        alt={brand.name}
                        className={`max-h-full max-w-full object-contain filter brightness-100 group-hover:scale-105 transition-transform duration-300`}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          const parent = e.target.parentElement;
                          if (parent) {
                            const fallbackSpan = document.createElement('span');
                            fallbackSpan.className = "text-xl font-black text-slate-700 uppercase";
                            fallbackSpan.innerText = brand.name.substring(0, 2);
                            parent.appendChild(fallbackSpan);
                          }
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Mobile View (3-Column Grid) */}
              <div className="grid grid-cols-3 gap-3 px-0 md:hidden mt-2">
                {brands.slice(0, 9).map((brand, index) => (
                  <div
                    key={index}
                    onClick={() => handleBrandClick(brand.name)}
                    className="bg-white border border-[#00CCB3]/20 rounded-2xl p-2.5 flex flex-col items-center justify-center cursor-pointer active:scale-95 transition-transform h-16"
                  >
                    <div className="h-8 flex items-center justify-center w-full">
                      <img
                        src={brand.logo}
                        alt={brand.name}
                        className="max-h-full max-w-full object-contain"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          const parent = e.target.parentElement;
                          if (parent && !parent.querySelector('.fallback-text')) {
                            const fallbackSpan = document.createElement('span');
                            fallbackSpan.className = "fallback-text text-sm font-black text-slate-700 uppercase";
                            fallbackSpan.innerText = brand.name.substring(0, 2);
                            parent.appendChild(fallbackSpan);
                          }
                        }}
                      />
                    </div>
                  </div>
                ))}

                {/* Selectt Luxury custom banner tile */}
                <div
                  onClick={() => navigate('/buy-cars', { state: { filters: { tag: 'Selectt Luxury' } } })}
                  className="col-span-2 bg-gradient-to-br from-amber-50/70 to-yellow-50/30 border border-amber-300/40 rounded-2xl p-4 flex items-center justify-between cursor-pointer active:scale-95 transition-transform text-left shadow-sm"
                >
                  <div className="flex flex-col text-amber-700 font-black leading-none">
                    <div className="flex items-center gap-1 mb-1.5">
                      <span className="text-[16px] leading-none mb-0.5">👑</span>
                      <span className="text-[10px] tracking-tight text-amber-600 font-extrabold">Selectt</span>
                    </div>
                    <span className="text-xl tracking-tight font-black text-amber-600 uppercase">Luxury</span>
                  </div>
                  <div className="flex flex-wrap items-center justify-end gap-2 w-[50%]">
                    <img src="/img/bmw.png" alt="BMW" className="w-5 h-5 object-contain" onError={(e) => e.target.style.display = 'none'} />
                    <img src="/img/mercedes-benz.webp" alt="Mercedes" className="w-5 h-5 object-contain" onError={(e) => e.target.style.display = 'none'} />
                    <div className="text-amber-700 font-black text-[11px] bg-amber-500/10 border border-amber-300/30 px-1.5 py-0.5 rounded-md">Jeep</div>
                  </div>
                </div>

                {/* View all brands tile */}
                <div
                  onClick={() => navigate('/buy-cars')}
                  className="col-span-1 bg-gradient-to-br from-[#00C9AF] to-[#00B5A2] border border-[#00CCB3]/40 rounded-2xl p-3 flex items-center justify-center cursor-pointer active:scale-95 transition-all duration-300 shadow-[0_4px_14px_rgba(0,201,175,0.25)] hover:shadow-[0_6px_20px_rgba(0,201,175,0.4)]"
                >
                  <p className="text-[13px] font-extrabold text-white text-center leading-tight">
                    View all<br />brands <span className="text-white font-extrabold ml-0.5">&gt;</span>
                  </p>
                </div>
              </div>
            </>
          )}

        </div>
      </section>

      {/* 7. HOW IT WORKS SECTION (LIGHT PREMIUM DESIGN) */}
      <section className="py-12 px-6 md:px-12 bg-[#0C1B33]/30 backdrop-blur-md text-white border-t border-white/5 relative overflow-hidden z-10">
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,rgba(0,196,175,0.05)_0%,transparent_60%)]"></div>
        </div>

        <div className="w-full max-w-[1440px] mx-auto relative z-10">

          <div className="text-center max-w-xl mx-auto mb-8">
            <span className="text-[#00CCB3] text-[11px] font-bold tracking-widest uppercase mb-2 block font-heading">
              HOW IT WORKS
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold font-heading text-white tracking-tight leading-none mb-4">
              How Selectt Works
            </h2>
            <p className="text-slate-350 text-sm leading-relaxed">
              We removed every friction point. From browse to keys done in days, not weeks.
            </p>
          </div>

          <HowItWorksCarousel />
        </div>
      </section>

      {/* 7.05 INFINITE MOVING TEXT MARQUEE */}
      <section className="relative overflow-hidden bg-[#0C1B33]/30 backdrop-blur-md py-4 border-t border-b border-white/5 z-10">
        <div className="overflow-hidden flex w-full">
          <div className="flex whitespace-nowrap gap-16 items-center animate-marquee-left">
            {/* Copy 1 */}
            <div className="flex gap-16 items-center">
              <span className="text-xl md:text-3xl font-black uppercase bg-gradient-to-r from-[#00D3B7] to-[#00B4A0] bg-clip-text text-transparent tracking-normal">Zero Commission</span>
              <span className="text-[#00D3B7] text-xl md:text-3xl font-black leading-none">•</span>
              <span className="text-xl md:text-3xl font-black uppercase text-slate-400 tracking-normal">200-Point Inspected</span>
              <span className="text-[#00D3B7] text-xl md:text-3xl font-black leading-none">•</span>
              <span className="text-xl md:text-3xl font-black uppercase bg-gradient-to-r from-[#00D3B7] to-[#00B4A0] bg-clip-text text-transparent tracking-normal">Fair Priced</span>
              <span className="text-[#00D3B7] text-xl md:text-3xl font-black leading-none">•</span>
              <span className="text-xl md:text-3xl font-black uppercase text-slate-400 tracking-normal">Assured</span>
              <span className="text-[#00D3B7] text-xl md:text-3xl font-black leading-none">•</span>
              <span className="text-xl md:text-3xl font-black uppercase bg-gradient-to-r from-[#00D3B7] to-[#00B4A0] bg-clip-text text-transparent tracking-normal">7-Day Returns</span>
              <span className="text-[#00D3B7] text-xl md:text-3xl font-black leading-none">•</span>
              <span className="text-xl md:text-3xl font-black uppercase text-slate-400 tracking-normal">AI Verified</span>
              <span className="text-[#00D3B7] text-xl md:text-3xl font-black leading-none">•</span>
              <span className="text-xl md:text-3xl font-black uppercase bg-gradient-to-r from-[#00D3B7] to-[#00B4A0] bg-clip-text text-transparent tracking-normal">Premium</span>
              <span className="text-[#00D3B7] text-xl md:text-3xl font-black leading-none">•</span>
            </div>
            {/* Copy 2 (Duplicated for seamless looping) */}
            <div className="flex gap-16 items-center">
              <span className="text-xl md:text-3xl font-black uppercase bg-gradient-to-r from-[#00D3B7] to-[#00B4A0] bg-clip-text text-transparent tracking-normal">Zero Commission</span>
              <span className="text-[#00D3B7] text-xl md:text-3xl font-black leading-none">•</span>
              <span className="text-xl md:text-3xl font-black uppercase text-slate-400 tracking-normal">200-Point Inspected</span>
              <span className="text-[#00D3B7] text-xl md:text-3xl font-black leading-none">•</span>
              <span className="text-xl md:text-3xl font-black uppercase bg-gradient-to-r from-[#00D3B7] to-[#00B4A0] bg-clip-text text-transparent tracking-normal">Fair Priced</span>
              <span className="text-[#00D3B7] text-xl md:text-3xl font-black leading-none">•</span>
              <span className="text-xl md:text-3xl font-black uppercase text-slate-400 tracking-normal">Assured</span>
              <span className="text-[#00D3B7] text-xl md:text-3xl font-black leading-none">•</span>
              <span className="text-xl md:text-3xl font-black uppercase bg-gradient-to-r from-[#00D3B7] to-[#00B4A0] bg-clip-text text-transparent tracking-normal">7-Day Returns</span>
              <span className="text-[#00D3B7] text-xl md:text-3xl font-black leading-none">•</span>
              <span className="text-xl md:text-3xl font-black uppercase text-slate-400 tracking-normal">AI Verified</span>
              <span className="text-[#00D3B7] text-xl md:text-3xl font-black leading-none">•</span>
              <span className="text-xl md:text-3xl font-black uppercase bg-gradient-to-r from-[#00D3B7] to-[#00B4A0] bg-clip-text text-transparent tracking-normal">Premium</span>
              <span className="text-[#00D3B7] text-xl md:text-3xl font-black leading-none">•</span>
            </div>
          </div>
        </div>

        {/* CSS Keyframe Styles for Infinite Scrolling */}
        <style>{`
          @keyframes marqueeLeft {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          @keyframes marqueeRight {
            0% { transform: translateX(-50%); }
            100% { transform: translateX(0); }
          }
          .animate-marquee-left {
            display: flex;
            animation: marqueeLeft 55s linear infinite;
          }
          .animate-marquee-right {
            display: flex;
            animation: marqueeRight 55s linear infinite;
          }
          .animate-marquee-left:hover,
          .animate-marquee-right:hover {
            animation-play-state: paused;
          }
        `}</style>
      </section>


      {/* 7.1 EXPLORE BY BODY TYPE (LIGHT PREMIUM SECTION) */}
      <section
        onMouseEnter={() => setBodyTypeHovered(true)}
        onMouseLeave={() => setBodyTypeHovered(false)}
        onTouchStart={() => setBodyTypeHovered(true)}
        onTouchEnd={() => setBodyTypeHovered(false)}
        className="py-12 px-6 md:px-12 bg-[#fff] border-t border-white/5 relative overflow-hidden z-10"
      >
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,rgba(0,196,175,0.05)_0%,transparent_60%)]"></div>
        </div>

        <div className="w-full max-w-[1440px] mx-auto relative z-10">

          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-[#00CCB3] text-[11px] font-bold tracking-widest uppercase mb-2 block font-heading">
                BROWSE BY TYPE
              </span>
              <h2 className="text-2xl md:text-4xl font-extrabold font-heading text-[#0C1B33]">
                What are you looking for?
              </h2>
              <p className="text-[#0C1B33] text-xs md:text-sm mt-1">
                Filter our inventory by your preferred vehicle body shape.
              </p>
            </div>

            {/* Carousel Navigation & View All link (Top-Right) */}
            <div className="flex items-center gap-6">
              <button
                onClick={handleViewAllBodyType}
                className="inline-flex items-center gap-1.5 text-[#00CCB3] hover:text-[#00B5A2] font-bold text-sm transition-colors group cursor-pointer bg-transparent border-none outline-none"
              >
                View All Cars
                <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
              </button>

              {getFilteredCars().length > itemsPerView && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={prevBodyTypeSlide}
                    disabled={bodyTypeCarouselIdx === 0}
                    className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all cursor-pointer ${bodyTypeCarouselIdx === 0
                      ? 'border-slate-200 text-slate-350 bg-slate-100/50 pointer-events-none'
                      : 'border-slate-350 text-slate-700 hover:text-[#00CCB3] hover:border-[#00CCB3] bg-white hover:bg-slate-50'
                      }`}
                  >
                    <ChevronLeft size={16} strokeWidth={2.5} />
                  </button>
                  <button
                    onClick={nextBodyTypeSlide}
                    disabled={bodyTypeCarouselIdx >= getFilteredCars().length - itemsPerView}
                    className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all cursor-pointer ${bodyTypeCarouselIdx >= getFilteredCars().length - itemsPerView
                      ? 'border-slate-200 text-slate-350 bg-slate-100/50 pointer-events-none'
                      : 'border-slate-350 text-slate-700 hover:text-[#00CCB3] hover:border-[#00CCB3] bg-white hover:bg-slate-50'
                      }`}
                  >
                    <ChevronRight size={16} strokeWidth={2.5} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Body Type Filter Tabs (Horizontal List) - No counts */}
          <div
            ref={bodyTypeTabsContainerRef}
            className="mb-10 border border-white/5 rounded-2xl max-w-full md:max-w-[960px] mx-auto bg-[#0C1B33] p-2 flex flex-nowrap md:flex-wrap items-center justify-start md:justify-center gap-3 md:gap-6 overflow-x-auto scrollbar-none w-full md:w-full"
          >
            {BODY_TYPES.map((type, index) => {
              const isActive = activeBodyType === type.name;
              return (
                <BodyTypeButton
                  key={index}
                  type={type}
                  isActive={isActive}
                  onClick={() => {
                    setActiveBodyType(type.name);
                    setBodyTypeCarouselIdx(0);
                  }}
                />
              );
            })}
          </div>

          {/* Carousel Slide Container */}
          <div className="overflow-hidden pb-4 sm:pb-0 -mx-6 px-6 sm:mx-0 sm:px-0">
            {getFilteredCars().length > 0 ? (
              <div
                className="flex gap-4 transition-transform duration-700 ease-out will-change-transform"
                style={{
                  transform: `translateX(calc(-${bodyTypeCarouselIdx} * (100% + 16px) / ${itemsPerView}))`
                }}
              >
                {getFilteredCars().map((car) => (
                  <div
                    key={car.id}
                    className="flex-none transition-all duration-500"
                    style={{
                      width: itemsPerView === 1 ? 'calc(100vw - 48px)' : `calc((100% - (${itemsPerView} - 1) * 16px) / ${itemsPerView})`
                    }}
                  >
                    <div className="transition-all duration-300 hover:-translate-y-1">
                      <CarCard car={car} lightBg={true} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400 font-bold bg-[#0C1B33] border border-white/5 rounded-3xl shadow-none">
                <p className="text-xs">No results found for {activeBodyType} in this hub</p>
                <p className="text-[10px] opacity-60 font-medium mt-1">Try selecting another body type above</p>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* 7.5 WHY SELECTT / HONEST MARKETPLACE & LIVE INSPECTION */}
      <WhyChooseSection />


      {/* 7.6 FEATURE COMPARISON TABLE - Compact Glass morphism */}
      <section className="py-16 px-6 md:px-12 bg-[#f9f9f9] backdrop-blur-md text-[#0C1B33] border-t border-white/5 relative z-10">
        <div className="max-w-6xl mx-auto">

          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-[#00D3B7] text-xs font-extrabold tracking-[0.2em] uppercase mb-2 block font-heading">
              VS COMPETITION
            </span>
            <h2 className="text-2xl md:text-4xl font-white font-heading text-black tracking-tight">
              Why Selectt beats the rest
            </h2>
          </div>

          <div className="max-w-4xl mx-auto rounded-3xl overflow-hidden shadow-2xl border border-slate-800 bg-[#0C1B33]">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-800 text-xs text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-5 px-6 min-w-[200px]">Feature</th>
                    <th className="py-5 px-6 text-center text-white bg-[#060D1A] min-w-[140px] font-extrabold border-x border-teal-500/20 relative shadow-[0_4px_20px_rgba(0,196,175,0.08)]">
                      <span className="inline-flex items-center gap-1.5 text-[#00C9AF] font-black text-sm"><span className="text-base">🏆</span> SELECTT</span>
                    </th>
                    <th className="py-5 px-6 text-center min-w-[100px] text-slate-400 font-semibold">Spinny</th>
                    <th className="py-5 px-6 text-center min-w-[100px] text-slate-400 font-semibold">Cars24</th>
                    <th className="py-5 px-6 text-center min-w-[100px] text-slate-400 font-semibold">CarDekho</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-xs md:text-sm font-medium">
                  {COMPARISON_FEATURES.map((feature, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/20 transition-colors duration-150">
                      <td className="py-4 px-6 text-slate-200 font-semibold">{feature.name}</td>
                      <td className="py-4 px-6 text-center bg-[#00D3B7]/[0.03] border-x border-[#00C9AF]/15">
                        {feature.selectt ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#00C9AF]/15 text-[#00C9AF] text-xs font-black border border-[#00C9AF]/30 shadow-[0_0_15px_rgba(0,196,175,0.15)]">✓</span>
                        ) : (
                          <span className="inline-flex items-center justify-center w-5.5 h-5.5 rounded-full bg-rose-500/10 text-rose-400 text-[10px] font-bold border border-rose-500/20">✕</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-center">
                        {feature.spinny ? (
                          <span className="inline-flex items-center justify-center w-5.5 h-5.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold border border-emerald-500/20">✓</span>
                        ) : (
                          <span className="inline-flex items-center justify-center w-5.5 h-5.5 rounded-full bg-rose-500/10 text-rose-400 text-[10px] font-bold border border-rose-500/20">✕</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-center">
                        {feature.cars24 ? (
                          <span className="inline-flex items-center justify-center w-5.5 h-5.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold border border-emerald-500/20">✓</span>
                        ) : (
                          <span className="inline-flex items-center justify-center w-5.5 h-5.5 rounded-full bg-rose-500/10 text-rose-400 text-[10px] font-bold border border-rose-500/20">✕</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-center">
                        {feature.cardekho ? (
                          <span className="inline-flex items-center justify-center w-5.5 h-5.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold border border-emerald-500/20">✓</span>
                        ) : (
                          <span className="inline-flex items-center justify-center w-5.5 h-5.5 rounded-full bg-rose-500/10 text-rose-400 text-[10px] font-bold border border-rose-500/20">✕</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </section>

      {/* HOW TO BUY SLIDER (dynamic from admin, shows only when steps are uploaded) */}
      {buySteps.length > 0 && (() => {
        const total = buySteps.length;
        const getBuyStepImg = (url) => url?.startsWith('/') ? `${API_URL}${url}` : url;

        const getBuyCardClasses = (idx) => {
          const diff = idx - buyStepIdx;
          let offset = diff;
          if (offset < -1) offset += total;
          if (offset > total - 2) offset -= total;
          const base = "absolute inset-0 m-auto w-[300px] md:w-[380px] h-[300px] md:h-[380px] rounded-[1.75rem] overflow-hidden shadow-[0_15px_35px_rgba(0,0,0,0.3)] transition-all duration-500 ease-out select-none";
          if (offset === 0) return `${base} translate-x-0 scale-[1.03] md:scale-105 opacity-100 z-30 cursor-default`;
          if (offset === -1) return `${base} -translate-x-[55%] md:-translate-x-[78%] scale-[0.78] md:scale-[0.82] opacity-50 md:opacity-60 z-20 cursor-pointer brightness-[1.15]`;
          if (offset === 1) return `${base} translate-x-[55%] md:translate-x-[78%] scale-[0.78] md:scale-[0.82] opacity-50 md:opacity-60 z-20 cursor-pointer brightness-[1.15]`;
          return `${base} ${offset < 0 ? '-translate-x-[130%] md:-translate-x-[160%]' : 'translate-x-[130%] md:translate-x-[160%]'} scale-75 opacity-0 z-10 pointer-events-none`;
        };

        return (
          <section
            onMouseEnter={() => setBuySliderHovered(true)}
            onMouseLeave={() => setBuySliderHovered(false)}
            className="py-8 bg-slate-50 border-y border-slate-200 shadow-inner relative overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-4 relative z-10">
              <div className="text-center mb-0">
                <span className="text-[#00D3B7] text-xs font-extrabold tracking-[0.2em] uppercase mb-2 block">Step by Step</span>
                <h2 className="text-3xl lg:text-5xl font-black text-[#0C1B33] mb-3 tracking-tight">Buy your car in easy steps</h2>
                <p className="text-slate-500 text-lg max-w-2xl mx-auto font-semibold">Fast, transparent, and hassle-free.</p>
              </div>

              {/* Carousel Container */}
              <div className="relative w-full max-w-[950px] h-[420px] md:h-[520px] mx-auto flex items-center justify-center">

                {/* Left arrow */}
                <button
                  onClick={() => setBuyStepIdx(prev => prev === 0 ? total - 1 : prev - 1)}
                  className="absolute left-2 md:-left-16 z-40 bg-white hover:bg-slate-100 border border-slate-200/80 p-3 md:p-4 rounded-full shadow-lg text-slate-700 hover:text-black transition-all hover:scale-110 active:scale-95 flex items-center justify-center focus:outline-none"
                >
                  <ChevronLeft size={22} className="stroke-[3]" />
                </button>

                {/* Track */}
                <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                  {buySteps.map((s, idx) => (
                    <div
                      key={s.id || idx}
                      className={getBuyCardClasses(idx)}
                      onClick={() => { if (idx !== buyStepIdx) setBuyStepIdx(idx); }}
                    >
                      <img
                        src={getBuyStepImg(s.image_url)}
                        alt={s.title}
                        className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent z-10" />
                      <div className="absolute inset-x-0 bottom-0 p-5 md:p-7 z-20 flex flex-col text-left">
                        <h3 className="text-base md:text-lg font-black text-white leading-tight mb-1.5 tracking-wide drop-shadow-md">{s.title}</h3>
                        {s.subtitle && <p className="text-slate-300 text-[10px] md:text-xs font-semibold leading-relaxed line-clamp-3">{s.subtitle}</p>}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Right arrow */}
                <button
                  onClick={() => setBuyStepIdx(prev => prev === total - 1 ? 0 : prev + 1)}
                  className="absolute right-2 md:-right-16 z-40 bg-white hover:bg-slate-100 border border-slate-200/80 p-3 md:p-4 rounded-full shadow-lg text-slate-700 hover:text-black transition-all hover:scale-110 active:scale-95 flex items-center justify-center focus:outline-none"
                >
                  <ChevronRight size={22} className="stroke-[3]" />
                </button>
              </div>

              {/* Dots */}
              <div className="flex justify-center items-center gap-1.5 mt-3 select-none" style={{ height: '16px', lineHeight: 0 }}>
                {buySteps.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setBuyStepIdx(i)}
                    aria-label={`Go to step ${i + 1}`}
                    style={{
                      height: '4px',
                      minHeight: '4px',
                      maxHeight: '4px',
                      width: buyStepIdx === i ? '18px' : '4px',
                      minWidth: buyStepIdx === i ? '18px' : '4px',
                      maxWidth: buyStepIdx === i ? '18px' : '4px',
                      padding: 0,
                      margin: 0,
                      border: 'none',
                      outline: 'none',
                      boxSizing: 'border-box',
                      backgroundColor: buyStepIdx === i ? '#00C9AF' : '#cbd5e1',
                      borderRadius: '9999px',
                      display: 'inline-block',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    className="shrink-0"
                  />
                ))}
              </div>

            </div>
          </section>
        );
      })()}



      {/* 7.8 WHAT MOTIVATES US (LIGHT BACKGROUND - Testimonials Carousel) */}
      <NewTestimonials />

      {/* FAQ section from old home page */}
      <FAQ dark={false} />

      {/* Redesigned Premium & Modern PromoSection */}
      <section className="pt-6 pb-8 md:py-20 px-4 md:px-12 bg-[#fff] border-t border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4 sm:gap-8 pb-0 max-w-6xl mx-auto px-0">

            {/* Instant Car Loan Card */}
            <Link
              to="/profile?tab=loan"
              className="w-full relative overflow-hidden rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-10 bg-gradient-to-br from-[#0B1528] to-[#0A2535] border border-[#00CCB3]/20 hover:border-[#00CCB3]/50 transition-all duration-500 shadow-[0_12px_40px_rgba(0,0,0,0.2)] hover:shadow-[0_12px_45px_rgba(0,204,179,0.08)] transform hover:-translate-y-1 group flex flex-row items-start sm:items-center gap-4 sm:gap-6 md:gap-8 cursor-pointer text-decoration-none"
            >
              {/* Glow light overlay */}
              <div className="absolute -right-16 -bottom-16 w-48 h-48 bg-[#00CCB3]/5 rounded-full blur-3xl group-hover:bg-[#00CCB3]/15 transition-all duration-500 pointer-events-none"></div>

              {/* Left Icon */}
              <div className="relative z-10 shrink-0">
                <div className="w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-[#0F223D] border border-[#00CCB3]/30 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-500">
                  <Landmark className="w-7 h-7 sm:w-9 sm:h-9 text-[#00CCB3]" />
                </div>
              </div>

              {/* Right Content */}
              <div className="relative z-10 flex-1 min-w-0 text-left">
                <h3 className="text-lg sm:text-2xl md:text-3xl font-black text-white mb-1 sm:mb-2.5 tracking-tight">
                  Instant Car Loan
                </h3>
                <p className="text-slate-400 text-xs sm:text-sm mb-3 sm:mb-5 max-w-xs leading-snug font-medium">
                  Interest rates starting at just <span className="text-[#00CCB3] font-bold">11.49%</span>. Fast processing, zero paperwork.
                </p>
                <span className="inline-flex items-center gap-1.5 bg-[#00CCB3] hover:bg-[#00CCB3]/90 text-[#0C1B33] px-4 py-2 sm:px-6 sm:py-3 rounded-xl font-bold transition-all text-[10px] sm:text-xs uppercase tracking-wider">
                  Check Eligibility
                </span>
              </div>
            </Link>

            {/* Assured Buyback Card */}
            <Link
              to="/about-us"
              className="w-full relative overflow-hidden rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-10 bg-gradient-to-br from-[#0B1528] to-[#1C1236] border border-purple-500/25 hover:border-purple-500/50 transition-all duration-500 shadow-[0_12px_40px_rgba(0,0,0,0.2)] hover:shadow-[0_12px_45px_rgba(168,85,247,0.08)] transform hover:-translate-y-1 group flex flex-row items-start sm:items-center gap-4 sm:gap-6 md:gap-8 cursor-pointer text-decoration-none"
            >
              {/* Glow light overlay */}
              <div className="absolute -right-16 -bottom-16 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/18 transition-all duration-500 pointer-events-none"></div>

              {/* Left Icon */}
              <div className="relative z-10 shrink-0">
                <div className="w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-[#1E123F] border border-purple-500/30 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-500">
                  <ShieldCheck className="w-7 h-7 sm:w-9 sm:h-9 text-purple-400" />
                </div>
              </div>

              {/* Right Content */}
              <div className="relative z-10 flex-1 min-w-0 text-left">
                <h3 className="text-lg sm:text-2xl md:text-3xl font-black text-white mb-1 sm:mb-2.5 tracking-tight">
                  Assured Buyback
                </h3>
                <p className="text-slate-400 text-xs sm:text-sm mb-3 sm:mb-5 max-w-xs leading-snug font-medium">
                  Get a pre-fixed buyback price for up to <span className="text-purple-400 font-bold">3 years</span> from the date of purchase.
                </p>
                <span className="inline-flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-xl font-bold transition-all text-[10px] sm:text-xs uppercase tracking-wider">
                  Learn More
                </span>
              </div>
            </Link>

          </div>
        </div>
      </section>



      {/* 8. SELLER CALL TO ACTION BANNER (DARK BACKGROUND - Exact ref-1.html replica) */}
      <section className="py-24 px-6 md:px-12 bg-[#06090F]/30 backdrop-blur-md border-t border-slate-900 relative overflow-hidden text-center z-10">
        {/* Glow meshes */}
        <div className="absolute top-[-80px] left-1/2 -translate-x-1/2 w-[900px] h-[700px] bg-[radial-gradient(ellipse,rgba(0,242,200,0.08)_0%,transparent_62%)] pointer-events-none z-0"></div>
        <div className="absolute bottom-[-60px] left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[radial-gradient(ellipse,rgba(0,90,255,0.05)_0%,transparent_62%)] pointer-events-none z-0"></div>

        <div className="max-w-4xl mx-auto relative z-10 space-y-6">
          <h2 className=" uppercase text-4xl md:text-5xl font-black font-heading text-white tracking-tight leading-tight">
            Your car deserves a <span className="text-[#00C9AF]">fair price.</span>
          </h2>
          <p className="text-slate-300 text-sm md:text-base max-w-lg mx-auto leading-relaxed font-medium">
            Enter your registration number. Get a real offer in 60 seconds. Sell in as little as 24 hours.
          </p>

          {/* Integrated Luxury Indian Number Plate Valuation Widget */}
          <div className="max-w-xl mx-auto pt-2">
            <div className="bg-slate-900/80 p-2 sm:p-2.5 rounded-2xl sm:rounded-full border border-white/15 shadow-[0_10px_40px_rgba(0,0,0,0.5),0_0_25px_rgba(0,201,175,0.15)] flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 backdrop-blur-xl focus-within:border-[#00C9AF]/80 focus-within:shadow-[0_0_35px_rgba(0,201,175,0.3)] transition-all duration-300">
              
              {/* Indian HSRP License Plate Box */}
              <div className="flex items-stretch flex-1 bg-white rounded-xl sm:rounded-full overflow-hidden border border-slate-300/80 shadow-inner">
                {/* Authentic Blue IND Badge */}
                <div className="bg-[#0B3C95] text-white px-3 sm:px-4 py-2.5 flex flex-col items-center justify-center shrink-0 self-stretch gap-0.5 select-none">
                  <div className="w-3.5 h-3.5 rounded-full border border-white/60 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/90"></div>
                  </div>
                  <span className="text-[10px] font-black tracking-widest leading-none">IND</span>
                </div>

                {/* Number Plate Input */}
                <input
                  type="text"
                  placeholder="MH 04 AB 1234"
                  className="flex-1 bg-transparent px-3 sm:px-4 py-3 text-slate-900 text-lg sm:text-xl font-black text-center sm:text-left focus:outline-none placeholder:text-slate-400 placeholder:font-bold font-heading tracking-[0.2em] uppercase"
                  id="hero-reg-input"
                  maxLength={13}
                  onInput={(e) => {
                    let raw = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
                    let formatted = '';
                    if (raw.length > 0) formatted += raw.slice(0, 2);
                    if (raw.length > 2) formatted += ' ' + raw.slice(2, 4);
                    if (raw.length > 4) formatted += ' ' + raw.slice(4, 6);
                    if (raw.length > 6) formatted += ' ' + raw.slice(6, 10);
                    e.target.value = formatted;
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const input = document.getElementById('hero-reg-input');
                      const reg = input?.value?.trim();
                      navigate(reg ? `/sell-car?reg=${encodeURIComponent(reg)}` : '/sell-car');
                    }
                  }}
                />
              </div>

              {/* Branded Glowing CTA Button */}
              <button
                type="button"
                onClick={() => {
                  const input = document.getElementById('hero-reg-input');
                  const reg = input?.value?.trim();
                  navigate(reg ? `/sell-car?reg=${encodeURIComponent(reg)}` : '/sell-car');
                }}
                className="bg-gradient-to-r from-[#00C9AF] via-[#14FFEC] to-[#00C9AF] text-[#0C1B33] font-button font-black text-xs sm:text-sm uppercase tracking-wider py-3.5 px-6 sm:px-7 rounded-xl sm:rounded-full shadow-lg shadow-[#00C9AF]/25 hover:shadow-[#00C9AF]/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer shrink-0"
              >
                <span>GET INSTANT OFFER</span>
                <span className="text-base font-black">→</span>
              </button>

            </div>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-2.5 sm:gap-4 pt-6">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.06] border border-white/10 text-slate-100 text-xs sm:text-sm font-semibold shadow-xs hover:border-[#00C9AF]/40 hover:bg-white/[0.1] transition-colors">
              <span className="text-[#00C9AF] font-black text-sm">✓</span> Free home pickup
            </div>
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.06] border border-white/10 text-slate-100 text-xs sm:text-sm font-semibold shadow-xs hover:border-[#00C9AF]/40 hover:bg-white/[0.1] transition-colors">
              <span className="text-[#00C9AF] font-black text-sm">✓</span> Instant bank transfer
            </div>
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.06] border border-white/10 text-slate-100 text-xs sm:text-sm font-semibold shadow-xs hover:border-[#00C9AF]/40 hover:bg-white/[0.1] transition-colors">
              <span className="text-[#00C9AF] font-black text-sm">✓</span> No commission
            </div>
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.06] border border-white/10 text-slate-100 text-xs sm:text-sm font-semibold shadow-xs hover:border-[#00C9AF]/40 hover:bg-white/[0.1] transition-colors">
              <span className="text-[#00C9AF] font-black text-sm">✓</span> Best price guaranteed
            </div>
          </div>
        </div>
      </section>


      {/* CUSTOM TRANSITION & ANIMATION STYLES */}
      <style>{`
        @keyframes float-orb {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }
        @keyframes float-orb-delayed {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(20px) scale(1.03); }
        }
        @keyframes float-card-1 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-5px) rotate(-0.3deg); }
        }
        @keyframes float-card-2 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-6px) rotate(0.4deg); }
        }
        @keyframes float-card-3 {
          0%, 100% { transform: translateX(-50%) translateY(0) rotate(0deg); }
          50% { transform: translateX(-50%) translateY(-4px) rotate(-0.3deg); }
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        
        .animate-float-orb {
          animation: float-orb 12s ease-in-out infinite;
        }
        .animate-float-orb-delayed {
          animation: float-orb-delayed 15s ease-in-out infinite 3s;
        }
        .animate-float-card-1 {
          animation: float-card-1 9s ease-in-out infinite both;
        }
        .animate-float-card-2 {
          animation: float-card-2 11s ease-in-out infinite 1s both;
        }
        .animate-float-card-3 {
          transform: translateX(-50%);
          animation: float-card-3 10s ease-in-out infinite 2s both;
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        @keyframes pulse-step-active {
          0%, 100% { box-shadow: 0 0 0 0px rgba(0, 196, 175, 0.4); }
          50% { box-shadow: 0 0 0 12px rgba(0, 196, 175, 0); }
        }
        .animate-pulse-step-active {
          animation: pulse-step-active 2s infinite ease-in-out;
        }
        .active-card-highlight {
          border-color: transparent !important;
          background: transparent !important;
          box-shadow: none !important;
        }

        .animated-border-box, .animated-border-box-glow {
          position: absolute;
          top: 0;
          bottom: 0;
          left: 0;
          right: 0;
          overflow: hidden; 
          z-index: 0;
          border-radius: 16px;
        }

        .animated-border-box-glow {
          filter: blur(8px);
          opacity: 0.35;
        }

        .animated-border-box:before, .animated-border-box-glow:before {
          content: '';
          z-index: -2;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(0deg);
          position: absolute;
          width: 900px;
          height: 900px;
          background-repeat: no-repeat;
          background-position: 0 0;
          background-image: conic-gradient(rgba(0,0,0,0), rgba(255, 255, 255, 0.95), rgba(0,0,0,0) 25%);
          animation: border-rotate 8s linear infinite; /* slowed down from 4s to 8s */
        }

        .animated-border-box:after {
          content: '';
          position: absolute;
          z-index: -1;
          left: 1px; /* reduced border thickness to 1px */
          top: 1px;
          width: calc(100% - 2px);
          height: calc(100% - 2px);
          background: #0f172a;
          border-radius: 15px;
        }

        @keyframes border-rotate {
          100% {
            transform: translate(-50%, -50%) rotate(1turn);
          }
        }

        .brand-scroller-mask {
          mask-image: linear-gradient(to right, transparent, white 6%, white 94%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, white 6%, white 94%, transparent);
        }

        @keyframes shimmer-shine {
          0% { left: -150%; }
          50% { left: 150%; }
          100% { left: 150%; }
        }
        .silver-shimmer {
          position: relative;
          overflow: hidden;
        }
        .silver-shimmer::after {
          content: '';
          position: absolute;
          top: -50%;
          left: -150%;
          width: 80%;
          height: 200%;
          background: linear-gradient(
            to right,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.4) 30%,
            rgba(255, 255, 255, 0.6) 50%,
            rgba(255, 255, 255, 0.4) 70%,
            rgba(255, 255, 255, 0) 100%
          );
          transform: rotate(30deg);
          animation: shimmer-shine 6s ease-in-out infinite;
          pointer-events: none;
          z-index: 5;
        }

        /* Testimonials Background Spacing Corrections */
        .new-home-testimonials section {
          background-color: transparent !important;
          padding-top: 0 !important;
          padding-bottom: 0 !important;
          padding-left: 0 !important;
          padding-right: 0 !important;
        }
      `}</style>

      {/* Floating FOMO Notification Badge (Right-Side Vertically Centered) */}
      <div
        style={{ fontFamily: "'Inter', sans-serif" }}
        className={`fixed top-1/2 -translate-y-1/2 right-3 sm:right-6 md:right-8 z-50 bg-white text-slate-900 rounded-2xl p-3 sm:p-4 shadow-[0_12px_32px_rgba(0,0,0,0.14),0_2px_6px_rgba(0,0,0,0.04)] flex items-center gap-2.5 sm:gap-3.5 min-w-[210px] max-w-[250px] sm:max-w-[310px] border border-slate-100/90 transition-all duration-500 ease-out transform ${showFomo ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-[130%] opacity-0 scale-95 pointer-events-none'
          }`}
      >
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 bg-[#EAFAF4] border border-[#d1f4e7]">
          🎉
        </div>
        <div className="flex-1 text-left pr-3">
          <div className="text-[13.5px] font-bold text-slate-900 leading-snug tracking-tight font-['Inter']">Just Booked!</div>
          <div className="text-[12px] text-slate-500 font-medium mt-0.5 leading-normal tracking-normal font-['Inter']">
            {FOMO_SOLD_CARS[fomoIndex]?.name} <span className="text-slate-300 mx-1">·</span> <span className="font-semibold text-slate-700">₹{FOMO_SOLD_CARS[fomoIndex]?.price}L</span>
          </div>
        </div>
        <button
          onClick={() => setShowFomo(false)}
          className="absolute top-2.5 right-2.5 text-slate-400 hover:text-slate-700 p-1 rounded-full transition-colors cursor-pointer"
          aria-label="Close notification"
        >
          <X size={14} />
        </button>
      </div>

    </div>
  );
};

export default NewHome;
