import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MOCK_CARS } from '../data/mockCars';
import { CheckCircle2, Phone, CreditCard, Gift, ShieldCheck, MapPin, Search, ChevronRight, ChevronDown, ChevronUp, ArrowLeft, Star, X, FileText, ArrowDown, ArrowRight, Check, Sparkles, RotateCcw, Car, Info, Navigation, Wrench, Plus, Calendar, Pencil, Building2, Tag, AlertCircle, Copy, Download, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { API_URL, getCarImageUrl, DEFAULT_CAR_FALLBACK_IMAGE } from '../config/api';
import PageMeta from '../components/common/PageMeta';
import TestDriveModal from '../components/buy/TestDriveModal';
import carLoanIcon from '../assets/car-loan-icon.png';
import { useSiteSettings } from '../context/SiteSettingsContext';
import VideoPreloader from '../components/common/VideoPreloader';

export const RupeeSignIcon = ({ className = "w-3 h-3 fill-current", ...props }) => (
  <svg
    viewBox="40 -1 170 250"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <path fill="currentColor" d="M153 23h41l15-23H55L40 23h26c27 0 52 2 62 25H55L40 71h91v1c0 17-14 43-60 43H48v22l90 113h41L85 133c39-2 75-24 80-62h29l15-23h-45c-1-9-5-18-11-25z" />
  </svg>
);

export const CheckoutDedicatedHeader = ({ currentStep = 2, car, carId, navigate, onOpenRefundPolicy }) => {
  const { getSiteImage, settings } = useSiteSettings();
  const siteLogo = getSiteImage('header_logo_light', '') || '/img/dark-logo.svg';
  const supportPhone = settings?.contact_phone || settings?.maintenance_phone || '+91 85746 67466';
  const supportPhoneClean = supportPhone.replace(/[^0-9+]/g, '');

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-slate-200/90 shadow-2xs w-full max-w-full">
        {/* ========================================================
          DESKTOP & TABLET HEADER ONLY (md:flex, hidden on mobile)
          PC Mode is unchanged: Logo (left), 3-step stepper (center), Phone (right)
         ======================================================== */}
      <div className="hidden md:flex max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 items-center justify-between gap-4">
        {/* Left: Logo */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Link to="/" className="flex items-center gap-2 group">
            <img
              src={siteLogo}
              alt="Selectt"
              className="h-8 sm:h-9 w-auto object-contain transition-transform group-hover:scale-102"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/img/dark-logo.svg";
              }}
            />
          </Link>
        </div>

        {/* Center: 3-Step Stepper (Desktop & Tablet) in Selectt Brand Color */}
        <div className="flex items-center justify-center flex-1 max-w-2xl px-2 lg:px-6">
          <div className="flex items-center w-full justify-center">
            {/* Step 1: Car selected */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-6 h-6 rounded-full bg-[#00A38D] text-white flex items-center justify-center shrink-0 shadow-2xs shadow-[#00A38D]/20">
                <Check size={13} strokeWidth={3.2} />
              </div>
              <span className="text-[13.5px] font-semibold text-[#1E293B] whitespace-nowrap">
                Car selected
              </span>
            </div>

            {/* Connecting Line 1 -> 2 (Solid Brand Teal) */}
            <div className="flex-1 max-w-[120px] min-w-[36px] h-[2px] bg-[#00A38D] mx-3 lg:mx-4 shrink-0 rounded-full" />

            {/* Step 2: Test drive preferences */}
            <div className="flex items-center gap-2 shrink-0">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-2xs transition-all ${currentStep > 2
                  ? 'bg-[#00A38D] text-white'
                  : 'bg-[#00A38D] text-white ring-4 ring-[#00A38D]/20'
                }`}>
                {currentStep > 2 ? <Check size={13} strokeWidth={3.2} /> : '2'}
              </div>
              <span className="text-[13.5px] font-semibold text-[#1E293B] whitespace-nowrap">
                Test drive preferences
              </span>
            </div>

            {/* Connecting Line 2 -> 3 (Grey / Brand Teal if step 3) */}
            <div className={`flex-1 max-w-[120px] min-w-[36px] h-[2px] mx-3 lg:mx-4 shrink-0 rounded-full transition-colors ${currentStep >= 3 ? 'bg-[#00A38D]' : 'bg-slate-300'
              }`} />

            {/* Step 3: Payment */}
            <div className="flex items-center gap-2 shrink-0">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-2xs transition-all ${currentStep >= 3
                  ? 'bg-[#00A38D] text-white ring-4 ring-[#00A38D]/20'
                  : 'bg-slate-300 text-white'
                }`}>
                3
              </div>
              <span className={`text-[13.5px] whitespace-nowrap transition-colors ${currentStep >= 3 ? 'text-[#1E293B] font-semibold' : 'text-slate-400 font-medium'
                }`}>
                Payment
              </span>
            </div>
          </div>
        </div>

        {/* Right: Phone / Support Number */}
        <div className="flex items-center shrink-0">
          <a
            href={`tel:${supportPhoneClean}`}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-full hover:bg-slate-50 transition-colors group text-slate-700"
            title={`Call support at ${supportPhone}`}
          >
            <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-[#00C9AF]/15 text-slate-700 group-hover:text-[#00A38D] flex items-center justify-center transition-colors shadow-2xs">
              <Phone size={15} />
            </div>
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold leading-none">Need help?</span>
              <span className="text-[13px] font-bold text-[#0F172A] leading-tight font-sans tracking-tight">
                {supportPhone}
              </span>
            </div>
          </a>
        </div>
      </div>

      {/* ========================================================
          MOBILE HEADER ONLY (md:hidden)
          No logo, no 3-step numbers.
          Row 1: Back arrow + "Checkout" title on left, Phone call on right
          Row 2: Sticky "Booking amount is 100% refundable ∨" link
         ======================================================== */}
      <div className="md:hidden bg-white">
        {/* Row 1: Back arrow + "Checkout" & Phone */}
        <div className="flex items-center justify-between px-4 h-13 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (window.history.length > 1) {
                  navigate(-1);
                } else {
                  navigate(`/car/${car?.id || carId}`);
                }
              }}
              className="p-1 -ml-1 text-[#0C1B33] hover:text-[#00A38D] transition-colors cursor-pointer active:scale-95"
              aria-label="Back"
            >
              <ArrowLeft size={20} strokeWidth={2.4} />
            </button>
            <h1 className="text-base sm:text-lg font-bold text-[#0C1B33] tracking-tight">
              Checkout
            </h1>
          </div>

          <a
            href={`tel:${supportPhoneClean}`}
            className="w-8.5 h-8.5 rounded-full bg-slate-100 active:bg-slate-200 text-[#00A38D] flex items-center justify-center transition-colors shadow-2xs"
            aria-label="Call support"
          >
            <Phone size={16} />
          </a>
        </div>

        {/* Row 2: Sticky Booking amount is 100% refundable ∨ */}
        <div className="px-4 py-2 bg-slate-50/70 border-b border-slate-200/70 flex items-center justify-center">
          <button
            type="button"
            onClick={onOpenRefundPolicy}
            className="group inline-flex items-center justify-center gap-1.5 text-xs sm:text-[13px] font-semibold text-[#00A38D] hover:text-[#008f7b] active:scale-98 transition-all cursor-pointer"
          >
            <span className="underline underline-offset-3 decoration-[#00A38D]/60 group-hover:decoration-[#00A38D]">
              Booking amount is 100% refundable
            </span>
            <ChevronDown size={14} strokeWidth={2.5} className="text-[#00A38D] group-hover:translate-y-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </header>
    {/* Spacer so the page content flows right below the fixed header without jumping or overlap */}
    <div className="h-[89px] md:h-[72px] w-full shrink-0" aria-hidden="true" />
  </>
);
};

export const getBookingAmount = (price) => {
  const numericPrice = Number(price) || 0;
  if (numericPrice <= 1000000) {
    return 5000; // 0 to 10 Lakhs (up to 10,00,000)
  } else if (numericPrice < 2000000) {
    return 11000; // Below 20 Lakhs (10L to 20L)
  } else {
    return 21000; // 20 Lakhs and above
  }
};

const DEFAULT_BUY_STEPS = [
  {
    stepNumber: 1,
    badge: 'Step 1',
    icon: <Search size={22} className="text-[#00C9AF]" />,
    title: '1. Discover your ride',
    desc: 'Book and reserve any car exclusively for yourself for up to 3 days.',
    bgClass: 'bg-gradient-to-br from-[#0C1B33] via-[#0E2242] to-[#122A4F] border-[#00C9AF]/40',
    glow: 'shadow-[#00C9AF]/15',
    accentColor: '#00C9AF',
    badgeBg: 'bg-[#00C9AF]/20 text-[#00C9AF] border-[#00C9AF]/40',
  },
  {
    stepNumber: 2,
    badge: 'Step 2',
    icon: <FileText size={22} className="text-cyan-400" />,
    title: '2. Submit documents effortlessly',
    desc: "We'll handle all the paperwork to make the process simple and stress-free.",
    bgClass: 'bg-gradient-to-br from-[#101F38] via-[#142646] to-[#1A2D52] border-cyan-500/40',
    glow: 'shadow-cyan-400/15',
    accentColor: '#22D3EE',
    badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40',
  },
  {
    stepNumber: 3,
    badge: 'Step 3',
    icon: <CreditCard size={22} className="text-purple-400" />,
    title: '3. Pay the balance, your way',
    desc: 'Choose from a range of payment options - pay in full or finance your purchase.',
    bgClass: 'bg-gradient-to-br from-[#18182E] via-[#1E1E3A] to-[#262642] border-purple-500/40',
    glow: 'shadow-purple-400/15',
    accentColor: '#C084FC',
    badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-400/40',
  },
  {
    stepNumber: 4,
    badge: 'Step 4',
    icon: <MapPin size={22} className="text-rose-400" />,
    title: '4. Delivered to your doorstep',
    desc: "Sit back and relax while we bring your dream car to your doorstep - it's that easy!",
    bgClass: 'bg-gradient-to-br from-[#1F1426] via-[#281830] to-[#331E3D] border-rose-500/40',
    glow: 'shadow-rose-400/15',
    accentColor: '#FB7185',
    badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-400/40',
  }
];

const ASSURED_BENEFIT_PAIRS = [
  [
    {
      id: 'warranty',
      icon: ShieldCheck,
      iconGrad: 'from-emerald-600 to-teal-400',
      title: '6 Months Warranty',
      badge: 'Comprehensive',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      desc: 'Engine, transmission & electrical coverage. Zero deductible.',
      border: 'border-emerald-200/80',
    },
    {
      id: 'moneyback',
      icon: RotateCcw,
      iconGrad: 'from-amber-500 to-yellow-400',
      title: '5-Day Money Back',
      badge: 'No Risk',
      badgeColor: 'bg-amber-100 text-amber-900',
      desc: 'Return within 5 days / 250 km for 100% full refund.',
      border: 'border-amber-200/80',
    },
  ],
  [
    {
      id: 'loans',
      icon: CreditCard,
      iconGrad: 'from-cyan-600 to-blue-400',
      title: 'Lowest EMIs & Loans',
      badge: 'From 8.9% ROI',
      badgeColor: 'bg-cyan-100 text-cyan-900',
      desc: 'Top bank approvals, 12–84 months tenure.',
      border: 'border-cyan-200/80',
    },
    {
      id: 'selection',
      icon: Car,
      iconGrad: 'from-rose-500 to-pink-500',
      title: '1 in 20 Selection',
      badge: 'Top 5% Only',
      badgeColor: 'bg-rose-100 text-rose-900',
      desc: '200-point check. Non-accidental, verified odometer.',
      border: 'border-rose-200/80',
    },
  ],
  [
    {
      id: 'refurbished',
      icon: Sparkles,
      iconGrad: 'from-indigo-600 to-sky-400',
      title: 'Quality Assured',
      badge: 'Refurbished',
      badgeColor: 'bg-indigo-100 text-indigo-900',
      desc: 'Mechanical restoration, paint polish & ozone sanitization.',
      border: 'border-indigo-200/80',
    },
    {
      id: 'buyback',
      icon: Gift,
      iconGrad: 'from-[#0C1B33] to-[#00C9AF]',
      title: 'Buyback Guarantee',
      badge: 'Assured Price',
      badgeColor: 'bg-[#00C9AF]/20 text-teal-900',
      desc: 'Locked valuation up to 12 months + ₹30,000 upgrade bonus.',
      border: 'border-teal-200/80',
    },
  ],
];

const FREEBET_CONFETTI_COLORS = [
  '#ffc600', // gold yellow
  '#159b36', // green
  '#00C9AF', // turquoise brand
  '#FF4757', // coral red
  '#8B5CF6', // purple
  '#3B82F6', // sky blue
  '#EC4899', // pink
  '#FFA502', // warm orange
];

const GENERATED_FREEBET_CONFETTI = Array.from({ length: 38 }, (_, i) => {
  const rnd1 = ((i * 13 + 7) % 100) / 100;
  const rnd2 = ((i * 29 + 11) % 100) / 100;
  const rnd3 = ((i * 37 + 19) % 100) / 100;
  const rnd4 = ((i * 43 + 23) % 100) / 100;

  // top between 15% and 65%
  const top = 15 + rnd1 * 50;
  // spread across middle and right area: 28% to 96%
  const left = 28 + rnd2 * 68;
  // width: 6 to 9px
  const width = 6 + Math.floor(rnd3 * 4);
  // height: 3 to 5px
  const height = 3 + Math.floor(rnd4 * 3);
  // animation-delay: 0 to 2.8s
  const delay = (rnd1 * 2.8).toFixed(2);
  // animation-duration: 1.8s to 2.4s
  const duration = (1.8 + rnd2 * 0.6).toFixed(2);
  // color
  const color = FREEBET_CONFETTI_COLORS[i % FREEBET_CONFETTI_COLORS.length];
  // some are circles
  const isCircle = i % 5 === 0;

  return {
    id: i,
    top: `${top.toFixed(1)}%`,
    left: `${left.toFixed(1)}%`,
    width: `${width}px`,
    height: `${isCircle ? width : height}px`,
    color,
    borderRadius: isCircle ? '50%' : '1px',
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`,
  };
});

export const ConfettiSavingsBanner = ({ savingAmount = 15000, className = "" }) => {
  const canvasRef = React.useRef(null);
  const confettiInstanceRef = React.useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    try {
      confettiInstanceRef.current = confetti.create(canvasRef.current, {
        resize: true,
        useWorker: true
      });

      const shoot = () => {
        if (!confettiInstanceRef.current) return;
        confettiInstanceRef.current({
          particleCount: 22,
          spread: 70,
          origin: { x: 0.85, y: 0.5 },
          colors: ['#ffc600', '#159b36', '#00C9AF', '#FFA502', '#FF4757', '#8B5CF6'],
          scalar: 0.6,
          ticks: 80,
          gravity: 0.65,
          drift: -0.3,
          disableForReducedMotion: true
        });
      };

      const timer = setTimeout(shoot, 250);
      return () => {
        clearTimeout(timer);
        if (confettiInstanceRef.current) {
          try {
            confettiInstanceRef.current.reset();
          } catch {
            // ignore
          }
        }
      };
    } catch (e) {
      console.error('Confetti init error:', e);
    }
  }, []);

  const triggerPop = () => {
    if (confettiInstanceRef.current) {
      confettiInstanceRef.current({
        particleCount: 35,
        spread: 85,
        origin: { x: 0.8, y: 0.5 },
        colors: ['#ffc600', '#159b36', '#00C9AF', '#FFA502', '#FF4757', '#8B5CF6', '#3B82F6', '#EC4899'],
        scalar: 0.75,
        ticks: 100,
        gravity: 0.7,
        drift: -0.3,
        disableForReducedMotion: true
      });
    }
  };

  return (
    <div
      onClick={triggerPop}
      className={`relative overflow-hidden bg-gradient-to-r from-[#e8faf5] via-[#f0fdf9] to-[#e8faf5] border border-[#a1ebd9] rounded-2xl px-4 py-3 flex items-center justify-between text-emerald-900 text-[14px] font-bold shadow-xs select-none min-h-[46px] cursor-pointer hover:shadow-sm hover:border-[#00C9AF]/60 transition-all ${className}`}
      title="Click for celebration confetti!"
    >
      {/* Scoped Canvas Confetti Shower */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
      />

      {/* Shimmer light sweep */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent saving-banner-shimmer pointer-events-none" />

      {/* User-requested Confetti Pop & Fall Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl select-none z-1">
        {GENERATED_FREEBET_CONFETTI.map((p) => (
          <span
            key={p.id}
            className="freebet-confetti-particle"
            style={{
              top: p.top,
              left: p.left,
              width: p.width,
              height: p.height,
              backgroundColor: p.color,
              borderRadius: p.borderRadius,
              animationDelay: p.animationDelay,
              animationDuration: p.animationDuration,
            }}
          />
        ))}
      </div>

      {/* Persistent Celebratory Accents on the right */}
      <div className="absolute right-0 top-0 bottom-0 w-44 pointer-events-none overflow-hidden select-none z-0">
        {/* Confetti party cross `+` symbols */}
        <span className="absolute bottom-2.5 right-14 text-[#00C9AF] text-[13px] font-black leading-none opacity-85 animate-party-spin [animation-delay:0.2s]">
          +
        </span>
        <span className="absolute top-2 right-22 text-[#FF4757] text-[11px] font-black leading-none opacity-75 animate-party-spin [animation-delay:1s]">
          +
        </span>
      </div>

      {/* Banner Text with Rupee Badge */}
      <div className="flex items-center gap-2.5 relative z-10">
        <span className="w-6 h-6 rounded-full bg-[#00A38D] text-white flex items-center justify-center p-1 shrink-0 shadow-xs animate-confetti-pulse">
          <RupeeSignIcon className="w-3.5 h-3.5 fill-white" />
        </span>
        <span className="font-extrabold text-[#007a68] text-[13.5px] sm:text-[14.5px] tracking-tight">
          Yay! You are saving ₹{Number(savingAmount).toLocaleString('en-IN')}
        </span>
      </div>
    </div>
  );
};

export const CelebrationConfettiShower = () => {
  const containerRef = React.useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const confettiColors = ['#EF2964', '#00C09D', '#2D87B0', '#48485E', '#EFFF1D', '#F59E0B', '#8B5CF6', '#EC4899'];
    const confettiAnimations = ['slow', 'medium', 'fast'];

    let confettiContainer = el.querySelector('.confetti-container');
    if (!confettiContainer) {
      confettiContainer = document.createElement('div');
      confettiContainer.className = 'confetti-container';
      el.appendChild(confettiContainer);
    }

    const interval = setInterval(() => {
      if (!confettiContainer || !el) return;

      const confettiEl = document.createElement('div');
      const confettiSize = Math.floor(Math.random() * 4) + 7 + 'px';
      const confettiBg = confettiColors[Math.floor(Math.random() * confettiColors.length)];
      const confettiLeft = Math.floor(Math.random() * (window.innerWidth || 1200)) + 'px';
      const confettiAnimation = confettiAnimations[Math.floor(Math.random() * confettiAnimations.length)];

      confettiEl.classList.add('confetti', `confetti--animation-${confettiAnimation}`);
      confettiEl.style.left = confettiLeft;
      confettiEl.style.width = confettiSize;
      confettiEl.style.height = confettiSize;
      confettiEl.style.backgroundColor = confettiBg;
      confettiEl.style.borderRadius = Math.random() > 0.5 ? '50%' : '1px';

      setTimeout(() => {
        if (confettiEl && confettiEl.parentNode) {
          confettiEl.parentNode.removeChild(confettiEl);
        }
      }, 3000);

      confettiContainer.appendChild(confettiEl);
    }, 25);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="js-container fixed inset-0 pointer-events-none z-[9999999] overflow-hidden"
      style={{ top: '0px' }}
    />
  );
};

export const PriceInfoPopover = ({
  title,
  content,
  badge,
  tag,
  onViewDetails,
  onOpenModal
}) => {
  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onOpenModal) {
      onOpenModal();
    } else if (onViewDetails) {
      onViewDetails();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="w-5 h-5 rounded-full text-slate-400 hover:text-[#00A38D] hover:bg-[#00A38D]/10 active:scale-90 inline-flex items-center justify-center transition-all cursor-pointer focus:outline-none"
      aria-label={`View details about ${title}`}
      title={`Click for ${title} details`}
    >
      <Info size={13.5} className="shrink-0" />
    </button>
  );
};

const CheckoutPage = () => {
  const { carId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { settings } = useSiteSettings();
  const [car, setCar] = useState(null);

  const supportPhone = settings?.contact_phone || settings?.maintenance_phone || '+91 85746 67466';
  const supportPhoneClean = supportPhone.replace(/[^0-9+]/g, '');
  const supportEmail = settings?.contact_email || 'contact@selectt.in';

  const [existingBooking, setExistingBooking] = useState(null);

  useEffect(() => {
    // If not logged in, redirect home or login
    if (!user && !localStorage.getItem('customerToken')) {
      navigate('/');
      return;
    }

    // Check if customer already has a paid booking for this car
    const token = localStorage.getItem('customerToken');
    if (token) {
      fetch(`${API_URL}/api/bookings/check-car/${carId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(res => res.json())
        .then(data => {
          if (data && data.isBooked && data.booking) {
            setExistingBooking(data.booking);
          }
        })
        .catch(() => {});
    }

    // Fetch car details from API
    fetch(`${API_URL}/api/cars/${carId}`)
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(data => {
        if (data && data.status === 'coming_soon') {
          alert('This vehicle is currently "Coming Soon" and cannot be booked.');
          navigate('/buy-cars');
          return;
        }
        setCar(data);
      })
      .catch(() => {
        navigate('/buy-cars');
      });

    window.scrollTo(0, 0);
  }, [carId, user, navigate]);

  const [isBooking, setIsBooking] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [interestedInLoan, setInterestedInLoan] = useState(false);
  const [showLoanBoxOnMobile, setShowLoanBoxOnMobile] = useState(false);
  const [mobileLoanPromptVisible, setMobileLoanPromptVisible] = useState(true);
  const [mobilePromptStep, setMobilePromptStep] = useState(1); // 1: Loan prompt, 2: Test drive prompt
  const [isPriceSummaryOpen, setIsPriceSummaryOpen] = useState(false);
  const [isTestDriveOpen, setIsTestDriveOpen] = useState(false);
  const [testDriveLocation, setTestDriveLocation] = useState('hub');
  const [isTestDriveSkipped, setIsTestDriveSkipped] = useState(false);
  const [scheduledTestDrive, setScheduledTestDrive] = useState(null);
  const [steps, setSteps] = useState(DEFAULT_BUY_STEPS);

  // 1-Year Complete Maintenance Package state
  const [maintenancePackageAdded, setMaintenancePackageAdded] = useState(false);
  const [maintenancePaymentType, setMaintenancePaymentType] = useState('full'); // 'full' | 'monthly'
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [isMaintenanceDetailsOpen, setIsMaintenanceDetailsOpen] = useState(false);
  const [showCelebrationToast, setShowCelebrationToast] = useState(false);
  const [expandedFeature, setExpandedFeature] = useState(null); // 'warranty' | 'periodic' | 'rsa' | null (collapsed by default)
  const [openFaqIndex, setOpenFaqIndex] = useState(-1);
  const [activeBreakdownModal, setActiveBreakdownModal] = useState(null); // 'servicing' | 'fixes' | 'gst' | null
  const [isRefundPolicyOpen, setIsRefundPolicyOpen] = useState(false);

  // Payment Success Modal state
  const [showPaymentSuccessModal, setShowPaymentSuccessModal] = useState(false);
  const [paymentSuccessData, setPaymentSuccessData] = useState(null);
  const [copiedPaymentId, setCopiedPaymentId] = useState(false);

  // Auto-sliding Selectt Assured Benefits carousel state
  const [benefitSlide, setBenefitSlide] = useState(0);
  const [pauseBenefitSlide, setPauseBenefitSlide] = useState(false);

  useEffect(() => {
    if (pauseBenefitSlide) return;
    const timer = setInterval(() => {
      setBenefitSlide((prev) => (prev + 1) % 3);
    }, 3200);
    return () => clearInterval(timer);
  }, [pauseBenefitSlide]);

  // Coupon Code State & 30-Minute Expiry Countdown
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState(null);
  const [couponSuccess, setCouponSuccess] = useState(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [isPriceBreakdownExpanded, setIsPriceBreakdownExpanded] = useState(true);
  const [couponTimeLeft, setCouponTimeLeft] = useState(30 * 60);

  // Initialize or resume 30-minute countdown when coupon is applied
  useEffect(() => {
    if (!appliedCoupon) {
      setCouponTimeLeft(30 * 60);
      return;
    }

    const storageKey = `selectt_coupon_exp_${appliedCoupon.code}_${car?.id || 'default'}`;
    const savedExp = localStorage.getItem(storageKey);
    let targetExp;

    if (savedExp && Number(savedExp) > Date.now()) {
      targetExp = Number(savedExp);
    } else {
      targetExp = Date.now() + 30 * 60 * 1000; // 30 minutes
      localStorage.setItem(storageKey, String(targetExp));
    }

    const updateTimer = () => {
      const remainingSecs = Math.max(0, Math.floor((targetExp - Date.now()) / 1000));
      setCouponTimeLeft(remainingSecs);

      if (remainingSecs <= 0) {
        setAppliedCoupon(null);
        setCouponInput('');
        setCouponSuccess(null);
        setCouponError(`Coupon code "${appliedCoupon.code}" expired after 30 minutes.`);
        localStorage.removeItem(storageKey);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [appliedCoupon, car?.id]);

  const formatCountdown = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const rawBookingAmount = getBookingAmount(car?.price);

  // Booking Plan Settings (Dynamic Festive Special vs Standard Booking)
  const isSpecialBookingEnabled = settings?.booking_special_enabled !== 'false' && settings?.booking_special_enabled !== false;
  const [selectedBookingPlan, setSelectedBookingPlan] = useState('special'); // 'special' | 'standard'
  const [bookingLearnMoreModal, setBookingLearnMoreModal] = useState(null); // 'special' | 'standard' | null

  const getDynamicHoldDate = (days = 3) => {
    const d = new Date();
    d.setDate(d.getDate() + (Number(days) || 3));
    return d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  const festivalTitle = settings?.booking_special_title || "Reserve till Navratri";
  const festivalName = festivalTitle
    .replace(/^Reserve till /i, '')
    .replace(/ Special$/i, '')
    .trim() || 'Navratri';

  const getPaperworkDate = (dateStr) => {
    if (!dateStr) return 'Sat, 10 Oct';
    try {
      const parts = dateStr.includes(',') ? dateStr.split(',')[1].trim() : dateStr.trim();
      const currentYear = new Date().getFullYear();
      const parsed = new Date(`${parts} ${currentYear}`);
      if (!isNaN(parsed.getTime())) {
        parsed.setDate(parsed.getDate() - 1);
        const dayName = parsed.toLocaleDateString('en-US', { weekday: 'short' });
        const dayNum = parsed.getDate();
        const monthName = parsed.toLocaleDateString('en-US', { month: 'short' });
        return `${dayName}, ${dayNum} ${monthName}`;
      }
    } catch (e) {}
    return '1 day before delivery';
  };

  const activeBookingPlan = isSpecialBookingEnabled ? selectedBookingPlan : 'standard';
  const specialBookingAmount = Number(settings?.booking_special_amount) || 25000;
  const standardBookingAmount = Number(settings?.booking_standard_amount) > 0 ? Number(settings?.booking_standard_amount) : rawBookingAmount;

  // Final booking amount to pay based on chosen option
  const finalPayableBookingAmount = activeBookingPlan === 'special' ? specialBookingAmount : standardBookingAmount;

  const carPrice = Number(car?.price) || 0;
  const originalCarPrice = Number(car?.original_price || car?.originalPrice) || (carPrice > 0 ? carPrice + 5000 : 0);
  const saleDiscount = originalCarPrice > carPrice ? (originalCarPrice - carPrice) : 5000;
  const rcTransferFee = 4000;
  // TCS (Tax Collected at Source): 1% of vehicle price
  const tcsAmount = Math.round(carPrice * 0.01);
  const gstTax = 2430;

  // Coupon discount is applied strictly to overall car price as "Special Discount for you"
  const couponDiscount = appliedCoupon ? (Number(appliedCoupon.discount_amount) || 0) : 0;
  const savingsAmount = ((car?.original_price && Number(car.original_price) > Number(car?.price))
    ? (Number(car.original_price) - Number(car.price))
    : 15000) + couponDiscount;

  const totalVehicleAmount = Math.max(0, carPrice + (maintenancePackageAdded && maintenancePaymentType === 'full' ? 11287 : 0) - couponDiscount);
  const totalOnRoadPrice = Math.max(0, carPrice + rcTransferFee + tcsAmount + gstTax + (maintenancePackageAdded && maintenancePaymentType === 'full' ? 11287 : 0) - couponDiscount);
  const monthlyEmi = car?.emi || car?.emiStart || Math.round((carPrice || 400000) * 0.021) || 17500;

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }
    setIsApplyingCoupon(true);
    setCouponError(null);
    setCouponSuccess(null);

    try {
      const res = await fetch(`${API_URL}/api/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponInput.trim().toUpperCase(),
          booking_amount: rawBookingAmount,
          car_price: Number(car?.price) || 0
        })
      });

      const data = await res.json();
      if (!res.ok || !data.valid) {
        setCouponError(data.message || 'Invalid or expired coupon code');
        setAppliedCoupon(null);
      } else {
        setAppliedCoupon(data.coupon);
        setCouponSuccess(data.message || `Coupon "${data.coupon.code}" applied!`);
        setCouponError(null);
      }
    } catch (err) {
      setCouponError('Unable to apply coupon. Please try again.');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    if (appliedCoupon) {
      localStorage.removeItem(`selectt_coupon_exp_${appliedCoupon.code}_${car?.id || 'default'}`);
    }
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponError(null);
    setCouponSuccess(null);
  };

  const renderBestInClassValues = (isDesktop = false) => (
    <div className={`pt-2 ${isDesktop ? 'mt-3 border-t border-slate-200/90' : ''}`}>
      <div className="flex items-center justify-center gap-3 my-3">
        <div className="h-px bg-slate-200 flex-1 max-w-[80px]" />
        <span className="font-extrabold text-[#0C1B33] text-sm sm:text-base tracking-tight">
          Best-in-class values
        </span>
        <div className="h-px bg-slate-200 flex-1 max-w-[80px]" />
      </div>

      <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/90 shadow-2xs flex items-center gap-3.5 mb-3.5">
        <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed flex-1">
          Thorough inspection, expert refurbishment & cleaning has been conducted by our professionals.
        </p>
        <div className="shrink-0 flex items-center justify-center">
          <img
            src="/img/car-wash.gif"
            alt="Car inspection, cleaning and refurbishment"
            className="w-16 h-16 sm:w-18 sm:h-18 object-contain"
          />
        </div>
      </div>

      {/* SELECTT ASSURED BENEFITS — Horizontal Carousel (2 cards visible) */}
      <div className="bg-gradient-to-br from-slate-900 via-[#0C1B33] to-slate-900 rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 border border-slate-800 shadow-xl relative overflow-hidden">
        {/* Glowing decorative background */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#00C9AF]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between mb-3 relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-[#00C9AF]/15 border border-[#00C9AF]/40 px-2.5 py-1 rounded-full">
            <Sparkles size={11} className="text-[#00C9AF]" />
            <span className="text-[10.5px] font-black text-[#00C9AF] uppercase tracking-wider">Selectt Assured Benefits</span>
          </div>
          <span className="text-[9.5px] text-slate-400 font-bold uppercase tracking-widest hidden sm:inline-block">100% Peace of Mind</span>
        </div>

        {/* Auto-Slide Carousel Container — 2 cards visible */}
        <div
          className="relative z-10 overflow-hidden"
          onMouseEnter={() => setPauseBenefitSlide(true)}
          onMouseLeave={() => setPauseBenefitSlide(false)}
          onTouchStart={() => setPauseBenefitSlide(true)}
          onTouchEnd={() => setPauseBenefitSlide(false)}
        >
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${benefitSlide * 100}%)` }}
          >
            {ASSURED_BENEFIT_PAIRS.map((pair, pIdx) => (
              <div key={pIdx} className="w-full shrink-0 grid grid-cols-2 gap-2 pb-1">
                {pair.map((card) => {
                  const Icon = card.icon;
                  return (
                    <div
                      key={card.id}
                      className={`bg-white/95 rounded-xl p-3 sm:p-3.5 border ${card.border} shadow-2xs flex flex-col justify-between`}
                    >
                      <div className="flex items-start gap-2">
                        <div
                          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-tr ${card.iconGrad} text-white flex items-center justify-center shrink-0 shadow-2xs`}
                        >
                          <Icon size={16} className={card.id === 'buyback' ? 'text-amber-300' : ''} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1 mb-1 flex-wrap">
                            <h4 className="font-extrabold text-[#0C1B33] text-[11px] sm:text-xs leading-tight">
                              {card.title}
                            </h4>
                            <span
                              className={`text-[8px] sm:text-[9px] ${card.badgeColor} font-black px-1.5 py-0.5 rounded uppercase whitespace-nowrap`}
                            >
                              {card.badge}
                            </span>
                          </div>
                          <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium leading-snug">
                            {card.desc}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Auto-slide indicator dots (clickable) */}
        <div className="flex justify-center items-center gap-1.5 mt-3 relative z-10">
          {[0, 1, 2].map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => setBenefitSlide(i)}
              aria-label={`Slide ${i + 1}`}
              className="p-1 !min-h-0 !border-0 bg-transparent flex items-center justify-center cursor-pointer transition-all focus:outline-none"
              style={{ minHeight: 'unset', height: 'auto', padding: '4px' }}
            >
              <span
                className={`block h-1.5 rounded-full transition-all duration-300 ${benefitSlide === i
                    ? 'w-6 bg-[#00C9AF] opacity-100 shadow-sm shadow-[#00C9AF]/50'
                    : 'w-2 bg-slate-500/60 hover:bg-slate-400'
                  }`}
                style={{
                  height: '6px',
                  minHeight: '6px',
                  maxHeight: '6px',
                  width: benefitSlide === i ? '24px' : '8px',
                }}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const openTestDrive = (location = 'hub') => {
    setTestDriveLocation(location);
    setIsTestDriveOpen(true);
  };

  const handleConfirmMaintenance = () => {
    setMaintenancePackageAdded(true);
    setIsMaintenanceModalOpen(false);
    setShowCelebrationToast(true);
    setTimeout(() => {
      setShowCelebrationToast(false);
    }, 3500);
  };

  useEffect(() => {
    // Fetch dynamic buy steps from backend if customized
    fetch(`${API_URL}/api/banners?page=home&type=buy-step`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const active = data.filter(s => s.is_active !== 0).sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
          if (active.length > 0) {
            setSteps(DEFAULT_BUY_STEPS.map((def, idx) => {
              const live = active[idx];
              if (!live) return def;
              return {
                ...def,
                badge: live.cta_text || def.badge,
                title: live.title ? `${idx + 1}. ${live.title.replace(/^\d+\.\s*/, '')}` : def.title,
                desc: live.subtitle || def.desc,
              };
            }));
          }
        }
      })
      .catch(() => { });
  }, []);

  const loadScript = (src) => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  useEffect(() => {
    loadScript('https://checkout.razorpay.com/v1/checkout.js').then((res) => {
      setRazorpayLoaded(res);
    });
  }, []);

  const handleBooking = async () => {
    if (existingBooking) {
      alert('You have already paid the booking amount for this car. Please wait for confirmation — our team will connect with you shortly.');
      return;
    }
    if (isBooking || !razorpayLoaded) return;
    setIsBooking(true);

    const bookingAmount = finalPayableBookingAmount;

    try {
      // 1. Create a placeholder booking in backend
      const bookingResp = await fetch(`${API_URL}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('customerToken')}`
        },
        body: JSON.stringify({
          car_id: car.id,
          final_amount: totalVehicleAmount,
          booking_amount: bookingAmount,
          booking_plan: activeBookingPlan === 'special' ? (settings?.booking_special_title || 'Special Reservation') : (settings?.booking_standard_title || 'Standard booking'),
          hold_until: activeBookingPlan === 'special' ? (settings?.booking_special_date || 'Sun, 11 Oct') : getDynamicHoldDate(settings?.booking_standard_hold_days || 3),
          interested_in_loan: interestedInLoan ? 1 : 0,
          maintenance_package: maintenancePackageAdded ? 1 : 0,
          maintenance_plan_type: maintenancePackageAdded ? maintenancePaymentType : null,
          maintenance_price: maintenancePackageAdded ? (maintenancePaymentType === 'full' ? 11287 : 990) : null,
          coupon_code: appliedCoupon ? appliedCoupon.code : null,
          discount_amount: appliedCoupon ? appliedCoupon.discount_amount : 0
        })
      });

      if (bookingResp.status === 409) {
        const errData = await bookingResp.json().catch(() => ({}));
        setExistingBooking(errData.booking || { booking_no: errData.booking_no, id: errData.booking_id, booking_amount: bookingAmount });
        alert(errData.message || 'You have already paid the booking amount for this car.');
        setIsBooking(false);
        return;
      }

      if (!bookingResp.ok) throw new Error('Failed to create booking');
      const bookingData = await bookingResp.json();
      const bookingId = bookingData.id;

      // 2. Create Razorpay Order
      const orderResp = await fetch(`${API_URL}/api/payments/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('customerToken')}`
        },
        body: JSON.stringify({
          amount: bookingAmount,
          currency: 'INR',
          receipt: bookingData.booking_no
        })
      });

      if (!orderResp.ok) {
        const errData = await orderResp.json();
        throw new Error(errData.message || 'Failed to create payment order');
      }
      const orderData = await orderResp.json();

      // 3. Get Public Key (I'll need to implement this endpoint or just fetch it here if I had it)
      const settingsResp = await fetch(`${API_URL}/api/settings/public`);
      const settingsData = await settingsResp.json();
      const razorpayKey = settingsData.razorpay_key_id;

      // 4. Open Razorpay Checktout
      const options = {
        key: razorpayKey,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Selectt Cars',
        description: `Booking for ${car.year} ${car.make} ${car.model}`,
        image: '/img/payment-logo.png',
        order_id: orderData.id,
        handler: async function (response) {
          try {
            // 5. Verify Payment
            const verifyResp = await fetch(`${API_URL}/api/payments/verify`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('customerToken')}`
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                booking_id: bookingId
              })
            });

            if (verifyResp.ok) {
              // Trigger confetti animation
              try {
                confetti({
                  particleCount: 120,
                  spread: 80,
                  origin: { y: 0.6 }
                });
              } catch (_) { }

              setPaymentSuccessData({
                bookingPk: bookingId,
                bookingNo: bookingData?.booking_no || `BK-${bookingId}`,
                bookingId: bookingData?.booking_no || `BK-${bookingId}`,
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                amount: finalPayableBookingAmount,
                date: new Date().toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }),
                car,
                customerName: `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'Valued Customer',
                customerPhone: user?.phone,
                maintenancePackageAdded,
                testDriveLocation
              });

              setShowPaymentSuccessModal(true);
            } else {
              alert('Payment verification failed. Please contact support.');
            }
          } catch (err) {
            console.error('Payment verification error:', err);
            alert('Payment verification failed. Please check your bookings tab.');
          } finally {
            setIsBooking(false);
          }
        },
        modal: {
          ondismiss: function () {
            setIsBooking(false);
          }
        },
        prefill: {
          name: `${user.first_name} ${user.last_name}`,
          email: user.email,
          contact: user.phone
        },
        theme: {
          color: '#00A884'
        }
      };

      console.log('Initializing Razorpay with options:', { ...options, key: 'MASKED' });
      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      console.error('Booking error:', error);
      alert(error.message || 'Failed to initialize payment. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  if (!car || !user) return (
    <>
      <PageMeta title="Checkout - Secure Car Booking | Selectt" description="Securely book your certified pre-owned car at Selectt." />
      <VideoPreloader fullScreen={true} />
    </>
  );

  const originalPrice = car.price + 22000;

  return (
    <div className="w-full max-w-full overflow-x-clip min-h-screen">
      <PageMeta title={`Checkout - Reserve ${car.year} ${car.make} ${car.model} | Selectt`} description={`Complete booking deposit for your ${car.year} ${car.make} ${car.model}.`} />

      {/* Dedicated Checkout Header with Logo (left), 3-step Stepper (center), Phone Support (right) */}
      <CheckoutDedicatedHeader
        currentStep={scheduledTestDrive || isTestDriveSkipped ? 3 : 2}
        car={car}
        carId={carId}
        navigate={navigate}
        onOpenRefundPolicy={() => setIsRefundPolicyOpen(true)}
      />

      <div className="bg-[#f9f9f9] min-h-screen pt-3 sm:pt-6 pb-56 sm:pb-64 lg:pb-20 font-sans text-slate-800 relative w-full max-w-full overflow-x-clip">
        {/* Mobile-Only Savings Banner (non-sticky, scrolls normally) */}
        <div className="md:hidden px-4 pt-1 pb-3">
          <ConfettiSavingsBanner
            savingAmount={savingsAmount}
            className="w-full shadow-2xs"
          />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 lg:gap-8 items-start">
            {/* Left Column: Flow Options (7 cols on desktop) - STICKY IN COLUMN ON DESKTOP */}
            <div className="lg:col-span-7 flex flex-col gap-3.5 sm:gap-5 lg:sticky lg:top-[88px] lg:self-start pr-0.5">

              {/* Already Booked Notice Banner */}
              {existingBooking && (
                <div className="bg-gradient-to-r from-emerald-50 via-teal-50/70 to-emerald-50 border-2 border-emerald-400/80 rounded-2xl p-4 sm:p-5 shadow-xs mb-1">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                      <CheckCircle2 size={22} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider">
                          Booking Amount Paid
                        </span>
                        <span className="text-xs text-slate-500 font-bold">
                          Ref: #{existingBooking.booking_no}
                        </span>
                      </div>
                      <h3 className="text-sm sm:text-base font-extrabold text-[#0C1B33] leading-snug">
                        You have already paid the booking amount for this car
                      </h3>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        Please wait for confirmation — our team will connect with you shortly. You can also check your registered WhatsApp or Email ID for booking receipts and next-step notifications.
                      </p>
                      <div className="mt-3 flex items-center gap-2.5 flex-wrap">
                        <a
                          href={`${API_URL}/api/bookings/${existingBooking.id}/receipt?token=${localStorage.getItem('customerToken')}&format=pdf`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                        >
                          <Download size={14} />
                          <span>Download Receipt (PDF)</span>
                        </a>
                        <button
                          type="button"
                          onClick={() => navigate('/profile?tab=bookings')}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#0C1B33] hover:bg-[#1a2d4c] text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                        >
                          <span>Go to My Bookings</span>
                          <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Main Title Area (Top of left column, side-by-side with savings banner on right) */}
              <div className="flex items-end justify-between mb-0.5">
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-[28px] xl:text-3xl font-heading font-bold text-[#0F172A] mb-1.5 leading-tight">
                    Reserve this car for <span className="text-[#00C9AF] font-bold font-price">₹{finalPayableBookingAmount.toLocaleString('en-IN')}</span>
                  </h1>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm sm:text-base text-slate-600 font-normal">and find out if it's your perfect match</p>
                    <span className="text-slate-300 hidden sm:inline">•</span>
                    <button
                      type="button"
                      onClick={() => setIsRefundPolicyOpen(true)}
                      className="hidden sm:inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-slate-700 hover:text-[#00A38D] cursor-pointer group"
                    >
                      <span>Booking amount is</span>
                      <span className="font-bold underline decoration-slate-400 group-hover:decoration-[#00A38D]">100% refundable</span>
                      <ChevronDown size={14} className="text-slate-400 group-hover:text-[#00A38D]" />
                    </button>
                  </div>
                </div>
              </div>

              {/* 1. 1-Year Complete Maintenance Package (Glowing Multicolor Animated Border - Matching Reference) */}
              <div className="rainbow-glow-card-container my-1.5 mx-0.5">
                <div className="bg-white rounded-[13.5px] p-4 sm:p-5 w-full transition-all">
                  {/* Dark Pill Badge with Light Font */}
                  <div className="inline-flex items-center gap-1.5 bg-[#0C1B33] text-[#00DFB8] border border-[#00C9AF]/30 text-[10.5px] font-black uppercase tracking-wider px-3 py-1 rounded-full mb-3 shadow-sm">
                    <Sparkles size={11} className="text-[#00DFB8]" />
                    <span>SAVE ₹31,263</span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4">
                    {/* Left Icon & Info */}
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="shrink-0 flex items-center justify-center">
                        <img
                          src="/amc.gif"
                          alt="1-Year Complete Maintenance Package"
                          className="w-20 h-20 sm:w-22 sm:h-22 object-contain drop-shadow-sm"
                        />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-extrabold text-[#0C1B33] text-sm sm:text-base leading-snug">
                          1-Year complete <span className="block sm:inline">maintenance package</span>
                        </h3>
                        <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                          Warranty, service, RSA & buyback
                        </p>
                        <button
                          type="button"
                          onClick={() => setIsMaintenanceDetailsOpen(true)}
                          className="text-xs text-[#00A38D] font-bold inline-flex items-center gap-0.5 mt-1.5 hover:underline cursor-pointer"
                        >
                          <span>See details</span>
                          <ChevronRight size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Right Price & Add/Added Button */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center shrink-0 gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <div className="text-left sm:text-right flex sm:flex-col items-baseline sm:items-end gap-1.5 sm:gap-0 sm:space-y-0.5">
                        <span className="text-base sm:text-lg font-bold text-[#0C1B33] tracking-tight leading-snug font-price">
                          ₹10,801
                        </span>
                        <span className="text-xs text-slate-500 font-medium leading-normal tracking-normal">
                          or <span className="font-bold text-slate-700">₹947</span>/m
                        </span>
                      </div>

                      {maintenancePackageAdded ? (
                        <button
                          type="button"
                          onClick={() => setIsMaintenanceModalOpen(true)}
                          className="py-1.5 px-4.5 rounded-xl border border-[#00A38D] bg-emerald-50 text-[#00A38D] font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs hover:bg-emerald-100/60"
                        >
                          <Check size={14} strokeWidth={2.5} />
                          <span>Added</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setIsMaintenanceModalOpen(true)}
                          className="py-1.5 px-5 rounded-xl border border-[#00C9AF] text-[#00A38D] hover:bg-[#00C9AF]/10 bg-teal-50/40 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-2xs"
                        >
                          <Plus size={14} strokeWidth={2.5} />
                          <span>Add</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Interested in Car Loan? (Matching Spinny Reference Screenshot 1) */}
              <div className={`${!showLoanBoxOnMobile && !interestedInLoan ? 'hidden lg:block' : 'block'} bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm relative overflow-hidden transition-all hover:border-slate-300 animate-in fade-in duration-200`}>
                <h4 className="font-extrabold text-[#0F172A] text-sm sm:text-base mb-1">
                  Interested in car loan?
                </h4>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium mb-3">
                  Get your car financed at attractive interest rates.{' '}
                  <a href="/used-car-loan" className="text-[#00A38D] font-bold hover:underline">
                    Learn more
                  </a>
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setInterestedInLoan(false)}
                    className={`py-2.5 px-3 rounded-xl border text-xs sm:text-sm font-bold transition-all cursor-pointer text-center ${!interestedInLoan
                        ? 'border-slate-400 bg-white text-slate-800 shadow-2xs font-extrabold'
                        : 'border-slate-200 bg-slate-50/70 text-slate-400 hover:bg-white'
                      }`}
                  >
                    Not Interested
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setInterestedInLoan(true);
                      setShowLoanBoxOnMobile(true);
                    }}
                    className={`py-2.5 px-3 rounded-xl border text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${interestedInLoan
                        ? 'border-[#00A38D] bg-teal-50/70 text-[#008975] ring-2 ring-[#00A38D]/25 shadow-xs font-black'
                        : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
                      }`}
                  >
                    {interestedInLoan && (
                      <Check size={15} strokeWidth={3} className="text-[#00A38D] shrink-0" />
                    )}
                    <span>Yes, I'm interested</span>
                  </button>
                </div>
              </div>

              {/* 3. Test Drive Preferences & Details (Screenshot 2 & Spinny Reference Screenshot 3) */}
              {scheduledTestDrive ? (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="font-heading font-extrabold text-[#0C1B33] text-sm sm:text-base">
                      Test drive details
                    </h4>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full">
                      ✓ Scheduled
                    </span>
                  </div>

                  <div
                    onClick={() => openTestDrive(scheduledTestDrive.location || 'hub')}
                    className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 hover:border-[#00C9AF] shadow-sm space-y-3 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-[#00A38D] shrink-0">
                          <Calendar size={17} />
                        </div>
                        <span className="font-black text-[#0F172A] text-sm sm:text-base">
                          {scheduledTestDrive.date_day || 'Wed, 30 Sep'} • {scheduledTestDrive.slot || '4pm - 5pm'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openTestDrive(scheduledTestDrive.location || 'hub');
                        }}
                        className="text-[#00A38D] group-hover:text-[#008f7b] font-bold text-xs sm:text-sm flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50/80 group-hover:bg-teal-100/70 border border-teal-200/80 transition-all cursor-pointer shadow-2xs"
                      >
                        <Pencil size={12} />
                        <span>Change / Edit</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-600 font-semibold pl-1">
                      <MapPin size={15} className="text-[#00A38D] shrink-0" />
                      <span>{scheduledTestDrive.location === 'hub' ? (scheduledTestDrive.hub_name || 'Selectt Car Hub, Pune') : (scheduledTestDrive.hub_address || 'Your Location (Doorstep)')}</span>
                    </div>

                    <div className="border-t border-slate-100 pt-2.5 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                      <span>We'll assign an agent during your test drive. Tap to change date, time, or location.</span>
                      <ChevronRight size={14} className="text-slate-400 group-hover:translate-x-1 group-hover:text-[#00A38D] shrink-0 ml-2 transition-all" />
                    </div>
                  </div>
                </div>
              ) : !isTestDriveSkipped ? (
                <div className="hidden md:block bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-3.5 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between">
                    <p className="text-xs sm:text-sm text-slate-500 font-medium">
                      You haven’t taken a test drive yet.
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsTestDriveSkipped(true)}
                      className="text-xs font-bold text-slate-400 hover:text-slate-700 underline cursor-pointer"
                    >
                      Skip
                    </button>
                  </div>
                  <h4 className="font-black text-[#0F172A] text-base sm:text-lg">
                    Where would you prefer to take it?
                  </h4>
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => openTestDrive('doorstep')}
                      className="py-3.5 px-3 rounded-xl bg-gradient-to-r from-[#00A38D] to-[#00BFA5] hover:from-[#008f7b] hover:to-[#00aa93] text-white font-black text-xs sm:text-sm uppercase tracking-wider transition-all duration-150 shadow-md shadow-[#00A38D]/20 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5 group"
                    >
                      <MapPin size={15} className="text-white shrink-0 group-hover:scale-110 transition-transform" />
                      <span>YOUR LOCATION</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => openTestDrive('hub')}
                      className="py-3.5 px-3 rounded-xl bg-gradient-to-r from-[#008975] to-[#00A38D] hover:from-[#007362] hover:to-[#008f7b] text-white font-black text-xs sm:text-sm uppercase tracking-wider transition-all duration-150 shadow-md shadow-[#008975]/20 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5 group"
                    >
                      <Building2 size={15} className="text-white shrink-0 group-hover:scale-110 transition-transform" />
                      <span>AT SELECTT HUB</span>
                    </button>
                  </div>
                </div>
              ) : null}

            </div>

            {/* Right Column: Order Summary & Price Breakdown (5 cols on desktop) */}
            <div className="lg:col-span-5 flex flex-col gap-3.5 sm:gap-4">

              {/* Savings Banner with Confetti Effect (Desktop only, mobile has it at the top) */}
              <div className="hidden lg:block">
                <ConfettiSavingsBanner
                  savingAmount={savingsAmount}
                  className="w-full shadow-2xs"
                />
              </div>

              {/* Order Summary & Breakdown Card */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
                {/* Car Info Header - Clicking opens car details page */}
                <Link
                  to={`/car/${car?.id || carId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 sm:p-5 flex items-center gap-4 border-b border-slate-100 hover:bg-slate-50/80 transition-colors group cursor-pointer block text-left"
                  title="View car details"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-28 h-20 bg-slate-100 rounded-xl overflow-hidden shrink-0 border border-slate-100 relative group-hover:shadow-xs transition-shadow">
                      <img
                        src={getCarImageUrl(car?.image || car?.images?.[0])}
                        alt={car?.model || 'Car'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src = DEFAULT_CAR_FALLBACK_IMAGE;
                        }}
                      />
                    </div>
                    <div className="flex flex-col justify-center min-w-0 flex-1">
                      <h3 className="font-heading font-extrabold text-[#0F172A] text-[15px] sm:text-[16px] leading-snug mb-1 truncate group-hover:text-[#00A38D] transition-colors">
                        {car.year} {car.make} {car.model} {car.variant || ''}
                      </h3>
                      <div className="text-[12px] text-slate-500 font-medium flex items-center gap-1.5 mb-1.5 truncate">
                        <span>{(car.km || 73000).toLocaleString()} Km</span> • <span>{car.fuelType || 'Petrol'}</span> • <span>{car.transmission || 'Manual'}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-baseline gap-2">
                          <span className="font-price font-extrabold text-[#0F172A] text-lg sm:text-xl whitespace-nowrap leading-none">
                            ₹{(carPrice / 100000).toFixed(2)} Lakh
                          </span>
                          {originalCarPrice > carPrice && (
                            <span className="text-xs sm:text-[13px] text-slate-400 line-through font-normal font-price whitespace-nowrap">
                              ₹{(originalCarPrice / 100000).toFixed(2)} Lakh
                            </span>
                          )}
                        </div>

                        {/* EMI Badge matching reference screenshot: EMI ₹17,500/mo */}
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200/90 whitespace-nowrap shadow-2xs font-sans">
                          EMI ₹{Number(monthlyEmi).toLocaleString('en-IN')}/mo
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setIsPriceSummaryOpen(true);
                        }}
                        className="text-xs font-semibold text-slate-500 hover:text-[#00A38D] underline decoration-dotted underline-offset-2 flex items-center gap-1 cursor-pointer mt-1.5 transition-colors w-fit"
                      >
                        <span>View breakup</span>
                        <ChevronDown size={13} className="text-slate-400" />
                      </button>
                    </div>
                  </div>
                </Link>

                {/* Booking Options Selection (Special Festive Plan & Standard Booking) */}
                <div className="p-4 pb-1 space-y-4">
                  {/* Option 1: Special Festive Reservation */}
                  {isSpecialBookingEnabled && (
                    <div
                      onClick={() => setSelectedBookingPlan('special')}
                      className={`relative p-4 sm:p-5 rounded-3xl transition-all cursor-pointer border-2 ${
                        activeBookingPlan === 'special'
                          ? 'border-[#00A38D] bg-[#F0FDF9] shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      {/* Pill Badge floating top-left */}
                      <div className="absolute -top-3.5 left-5 px-3 py-1 rounded-full bg-white border border-amber-500/80 shadow-xs flex items-center gap-1.5 text-xs font-bold text-amber-900">
                        <span>{settings?.booking_special_badge || "🪔 Navratri Special"}</span>
                      </div>

                      <div className="flex items-start justify-between gap-3 pt-1">
                        <div className="flex items-start gap-3">
                          {/* Custom Radio Button */}
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                              activeBookingPlan === 'special'
                                ? 'border-[#00A38D] bg-white'
                                : 'border-slate-300 bg-white'
                            }`}
                          >
                            {activeBookingPlan === 'special' && (
                              <div className="w-2.5 h-2.5 rounded-full bg-[#00A38D]" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-extrabold text-[#0C1B33] text-sm sm:text-base leading-tight">
                              {settings?.booking_special_title || "Reserve till Navratri"}
                            </h4>
                            <p className="text-xs sm:text-[13px] text-slate-600 mt-1 font-medium">
                              {settings?.booking_special_subtext || `Car held for you till ${settings?.booking_special_date || "Sun, 11 Oct"}`}
                            </p>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setBookingLearnMoreModal('special');
                              }}
                              className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-[#00A38D] hover:underline mt-2 cursor-pointer"
                            >
                              <Info size={13} className="text-[#00A38D]" />
                              <span>Learn more</span>
                            </button>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-extrabold font-price text-base sm:text-lg text-[#0C1B33]">
                            ₹ {specialBookingAmount.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Option 2: Standard Booking */}
                  <div
                    onClick={() => setSelectedBookingPlan('standard')}
                    className={`p-4 sm:p-5 rounded-3xl transition-all cursor-pointer border-2 ${
                      activeBookingPlan === 'standard'
                        ? 'border-[#00A38D] bg-[#F0FDF9] shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        {/* Custom Radio Button */}
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                            activeBookingPlan === 'standard'
                              ? 'border-[#00A38D] bg-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {activeBookingPlan === 'standard' && (
                            <div className="w-2.5 h-2.5 rounded-full bg-[#00A38D]" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-[#0C1B33] text-sm sm:text-base leading-tight">
                            {settings?.booking_standard_title || "Standard booking"}
                          </h4>
                          <p className="text-xs sm:text-[13px] text-slate-600 mt-1 font-medium">
                            Car held for {settings?.booking_standard_hold_days || 3} days until {getDynamicHoldDate(settings?.booking_standard_hold_days || 3)}
                          </p>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setBookingLearnMoreModal('standard');
                            }}
                            className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-[#00A38D] hover:underline mt-2 cursor-pointer"
                          >
                            <Info size={13} className="text-[#00A38D]" />
                            <span>Learn more</span>
                          </button>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-extrabold font-price text-base sm:text-lg text-[#0C1B33] inline-flex items-center gap-1.5">
                          <span>₹ {standardBookingAmount.toLocaleString('en-IN')}</span>
                          <Pencil size={12} className="text-[#00A38D]" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Price Summary Section — Desktop shows a clickable trigger; breakdown opens in popup */}
                <div id="price-summary-section" className="p-4 sm:p-5 pt-3">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-heading font-extrabold text-[#0F172A] text-[15px] sm:text-[16px]">
                      Price breakdown
                    </h4>
                  </div>

                  {/* Mobile only: Clickable button to open full popup modal */}
                  <button
                    type="button"
                    onClick={() => setIsPriceSummaryOpen(true)}
                    className="lg:hidden w-full p-3.5 rounded-2xl border border-slate-200/90 bg-white hover:border-[#00C9AF] active:scale-[0.99] transition-all flex items-center justify-between cursor-pointer group shadow-2xs text-left mb-3"
                    title="Open full price breakdown"
                  >
                    <div className="flex items-center gap-2.5 text-xs sm:text-sm font-bold text-[#0F172A]">
                      <FileText size={16} className="text-[#00A38D] group-hover:scale-110 transition-transform" />
                      <span>Total on-road price</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-price font-extrabold text-sm text-[#0C1B33]">
                        ₹{(totalOnRoadPrice / 100000).toFixed(2)} Lakh
                      </span>
                      <ChevronDown size={17} className="text-slate-400 group-hover:text-[#00A38D] transition-transform" />
                    </div>
                  </button>

                  {/* Desktop only: Active Price Breakdown Box (directly visible as active tab) */}
                  <div className="hidden lg:block bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-3 text-xs sm:text-[13px]">
                    {/* Car Price */}
                    <div className="flex justify-between items-center text-slate-700">
                      <span className="font-medium text-slate-600">Car price</span>
                      <span className="font-bold text-[#0C1B33] font-price">
                        ₹{originalCarPrice.toLocaleString('en-IN')}
                      </span>
                    </div>

                    {/* Sale Discount */}
                    <div className="flex justify-between items-center text-emerald-600 font-bold">
                      <span className="flex items-center gap-1.5">
                        <Sparkles size={14} className="text-emerald-500" />
                        <span>Sale Discount</span>
                      </span>
                      <span className="font-price">
                        - ₹{saleDiscount.toLocaleString('en-IN')}
                      </span>
                    </div>

                    {/* RC Transfer Facilitation */}
                    <div className="flex justify-between items-center text-slate-700">
                      <span className="font-medium text-slate-600">RC transfer facilitation</span>
                      <span className="font-bold text-[#0C1B33] font-price">
                        + ₹{rcTransferFee.toLocaleString('en-IN')}
                      </span>
                    </div>

                    {/* TCS (Tax Collected at Source) */}
                    <div className="flex justify-between items-start text-slate-700">
                      <div>
                        <div className="font-medium text-slate-600 flex items-center gap-1.5">
                          <span>TCS (Tax Collected at Source)</span>
                          <PriceInfoPopover
                            title="TCS (Tax Collected at Source)"
                            onOpenModal={() => setActiveBreakdownModal('tcs')}
                          />
                        </div>
                        <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                          This amount will come back to you as a tax credit
                        </p>
                      </div>
                      <span className="font-bold text-[#0C1B33] font-price">
                        + ₹{tcsAmount.toLocaleString('en-IN')}
                      </span>
                    </div>

                    {/* Servicing, Cleaning, Fuel */}
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 font-medium flex items-center gap-1.5">
                        <span>Servicing, cleaning, fuel & more</span>
                        <PriceInfoPopover
                          title="Servicing, cleaning, fuel & more"
                          onOpenModal={() => setActiveBreakdownModal('servicing')}
                        />
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 line-through font-normal text-xs font-price">₹8,700</span>
                        <span className="text-emerald-600 font-bold">Included</span>
                      </div>
                    </div>

                    {/* Warranty */}
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 font-medium flex items-center gap-1.5">
                        <span>Warranty (Protect)</span>
                        <PriceInfoPopover
                          title="Warranty (Protect)"
                          onOpenModal={() => setActiveBreakdownModal('warranty')}
                        />
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 line-through font-normal text-xs font-price">₹5,500</span>
                        <span className="text-emerald-600 font-bold">Included</span>
                      </div>
                    </div>

                    {/* Fixes & Upgrades */}
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 font-medium flex items-center gap-1.5">
                        <span>Fixes & upgrades</span>
                        <PriceInfoPopover
                          title="Fixes & upgrades"
                          onOpenModal={() => setActiveBreakdownModal('fixes')}
                        />
                      </span>
                      <span className="text-emerald-600 font-bold">Included</span>
                    </div>

                    {/* GST Taxes */}
                    <div className="flex justify-between items-center text-slate-700">
                      <span className="font-medium text-slate-600 flex items-center gap-1.5">
                        <span>GST (govt. taxes)</span>
                        <PriceInfoPopover
                          title="GST (govt. taxes)"
                          onOpenModal={() => setActiveBreakdownModal('gst')}
                        />
                      </span>
                      <span className="font-bold text-[#0C1B33] font-price">
                        ₹{gstTax.toLocaleString('en-IN')}
                      </span>
                    </div>

                    {maintenancePackageAdded && (
                      <div className="flex justify-between items-center text-[#00A38D] font-bold pt-1.5 border-t border-slate-100">
                        <span>1-Year Complete Maintenance ({maintenancePaymentType === 'full' ? 'Paid in Full' : 'Monthly'})</span>
                        <span className="font-price">
                          {maintenancePaymentType === 'full' ? '+ ₹11,287' : '+ ₹990/m'}
                        </span>
                      </div>
                    )}

                    {/* Special Discount for you (Coupon Discount) */}
                    {appliedCoupon && couponDiscount > 0 && (
                      <div className="flex justify-between items-center text-emerald-600 font-bold pt-1.5 border-t border-slate-100">
                        <span className="flex items-center gap-1.5">
                          <Sparkles size={14} className="text-emerald-500" />
                          <span>Special Discount for you</span>
                          {appliedCoupon.code && (
                            <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-black">
                              {appliedCoupon.code}
                            </span>
                          )}
                        </span>
                        <span className="font-price font-extrabold text-emerald-600">
                          - ₹{couponDiscount.toLocaleString('en-IN')}
                        </span>
                      </div>
                    )}

                    {/* Total On-road Price Divider */}
                    <div className="pt-3.5 mt-1 border-t border-dashed border-slate-200 flex justify-between items-center">
                      <span className="font-heading font-extrabold text-[#0C1B33] text-sm sm:text-base">
                        Total on-road price
                      </span>
                      <span className="font-heading font-black text-[#0C1B33] text-base sm:text-lg font-price">
                        ₹{totalOnRoadPrice.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Coupon Code Input & Applied Card (Aligned properly as requested) */}
                  <div className="mt-3.5 pt-3 border-t border-slate-100">
                    {!appliedCoupon ? (
                      <div className="space-y-1.5">
                        <div className="flex items-center rounded-xl border border-slate-200 focus-within:border-[#00A38D] focus-within:ring-2 focus-within:ring-[#00A38D]/20 bg-slate-50/70 focus-within:bg-white transition-all overflow-hidden p-1 shadow-2xs">
                          <div className="pl-3 pr-2 text-slate-400 flex items-center justify-center shrink-0">
                            <Tag size={15} />
                          </div>
                          <input
                            type="text"
                            value={couponInput}
                            onChange={(e) => {
                              setCouponInput(e.target.value.toUpperCase().replace(/\s+/g, ''));
                              if (couponError) setCouponError(null);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleApplyCoupon();
                              }
                            }}
                            placeholder="ENTER COUPON CODE"
                            className="w-full py-2 bg-transparent text-xs font-bold uppercase tracking-wider placeholder:tracking-normal placeholder:font-semibold placeholder:text-slate-400 text-[#0C1B33] focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={handleApplyCoupon}
                            disabled={isApplyingCoupon || !couponInput.trim()}
                            className="px-4 py-2 bg-[#0C1B33] hover:bg-[#00A38D] disabled:opacity-35 disabled:hover:bg-[#0C1B33] text-white rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center shrink-0 min-w-[70px]"
                          >
                            {isApplyingCoupon ? (
                              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              'APPLY'
                            )}
                          </button>
                        </div>
                        {couponError && (
                          <p className="text-[11px] text-rose-500 font-semibold flex items-center gap-1 mt-1 animate-in fade-in duration-150">
                            <AlertCircle size={12} className="shrink-0" />
                            <span>{couponError}</span>
                          </p>
                        )}
                        {couponSuccess && !couponError && (
                          <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1 animate-in fade-in duration-150">
                            <Check size={12} strokeWidth={3} className="shrink-0" />
                            <span>{couponSuccess}</span>
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-emerald-50/90 border border-emerald-200/90 shadow-2xs animate-in fade-in zoom-in-95 duration-200 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-6 h-6 rounded-md bg-emerald-500 text-white flex items-center justify-center text-xs shadow-xs shrink-0">
                              <Check size={12} strokeWidth={3} />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono font-black text-xs text-emerald-950 tracking-wider">
                                  {appliedCoupon.code}
                                </span>
                                <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-emerald-200 text-emerald-900 tracking-wider">
                                  APPLIED
                                </span>
                              </div>
                              <p className="text-[11px] text-emerald-700 font-semibold truncate leading-tight mt-0.5">
                                Special discount of ₹{appliedCoupon.discount_amount.toLocaleString('en-IN')} applied on car price!
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={handleRemoveCoupon}
                            className="text-xs font-bold text-rose-500 hover:text-rose-700 hover:underline px-2 py-1 cursor-pointer shrink-0 transition-colors"
                          >
                            Remove
                          </button>
                        </div>

                        {/* ⏱️ 30 Mins Coupon Validity Countdown in Red */}
                        <div className="pt-2 border-t border-red-200/80 flex items-center justify-between text-xs font-bold bg-red-50/90 px-2.5 py-1.5 rounded-lg border border-red-200/70">
                          <span className="flex items-center gap-1.5 text-[11.5px] text-red-600 font-bold">
                            <Clock size={13} className="animate-pulse text-red-600 shrink-0" />
                            <span>Coupon valid for:</span>
                          </span>
                          <span className="font-mono font-black text-xs text-red-600 bg-white px-2 py-0.5 rounded border border-red-300 tracking-wider shadow-2xs">
                            {formatCountdown(couponTimeLeft)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* CTA Proceed to Pay inside right card */}
                  {!existingBooking && (
                    <div className="mt-4 pt-3.5 border-t border-slate-100 space-y-3">
                      <style>{`
                        @keyframes btnShine {
                          0%   { transform: translateX(-100%) skewX(-15deg); }
                          100% { transform: translateX(250%) skewX(-15deg); }
                        }
                        .btn-shine::after {
                          content: '';
                          position: absolute;
                          top: 0; left: 0;
                          width: 40%;
                          height: 100%;
                          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent);
                          animation: btnShine 2.2s ease-in-out infinite;
                          pointer-events: none;
                        }
                      `}</style>
                      <button
                        onClick={handleBooking}
                        disabled={isBooking}
                        className={`btn-shine relative overflow-hidden w-full bg-gradient-to-r from-[#00C9AF] via-[#00DFB8] to-[#00A884] hover:from-[#00b4a0] hover:to-[#009170] text-[#0C1B33] font-black py-3.5 px-5 rounded-2xl transition-all duration-300 shadow-lg shadow-[#00C9AF]/30 hover:shadow-xl hover:shadow-[#00C9AF]/40 flex items-center justify-between cursor-pointer text-sm uppercase tracking-wider ${isBooking ? 'opacity-70 cursor-not-allowed' : 'active:scale-[0.99]'}`}
                      >
                        {isBooking ? (
                          <div className="flex items-center justify-center gap-2.5 w-full py-0.5">
                            <div className="w-4 h-4 border-2 border-[#0C1B33] border-t-transparent rounded-full animate-spin" />
                            <span>Processing...</span>
                          </div>
                        ) : (
                          <>
                            <span className="font-black text-sm tracking-wider">PROCEED TO PAY</span>
                            <div className="flex items-center gap-2 font-price">
                              {appliedCoupon && appliedCoupon.applies_to === 'booking_amount' && (
                                <span className="line-through text-slate-700/70 text-xs font-bold">
                                  ₹{rawBookingAmount.toLocaleString('en-IN')}
                                </span>
                              )}
                              <span className="bg-[#0C1B33] text-white px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-extrabold shadow-sm tracking-tight">
                                ₹{finalPayableBookingAmount.toLocaleString('en-IN')}
                              </span>
                            </div>
                          </>
                        )}
                      </button>
                      <p className="text-center text-[11px] text-slate-400 font-semibold">
                        100% refundable deposit • Cancel anytime
                      </p>
                    </div>
                  )}
                </div>

                {/* Security Footer */}
                <div className="bg-slate-50/80 py-2.5 px-4 text-center border-t border-slate-100 flex items-center justify-center gap-1.5 text-slate-500 text-xs font-medium">
                  <ShieldCheck size={14} className="text-[#00A38D]" />
                  <span>100% secure payment gateway</span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* What Happens Next - Expanded Dynamic Step-by-Step Section */}
        <div className="max-w-7xl mx-auto px-4 mt-16 sm:mt-20 w-full overflow-hidden">
          <div className="text-center mb-10">
            <h3 className="text-xl sm:text-2xl font-heading font-bold text-[#0F172A] text-center flex items-center justify-center gap-2 sm:gap-4 overflow-hidden">
              <div className="hidden sm:block h-px bg-slate-200 flex-1 max-w-[150px]" />
              <span className="shrink-0">What happens next</span>
              <div className="hidden sm:block h-px bg-slate-200 flex-1 max-w-[150px]" />
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5 font-medium">
              Simple, transparent 4-step process from online reservation to doorstep delivery.
            </p>
          </div>

          {/* DESKTOP VIEW (Horizontal 4-Grid with Connectors) */}
          <div className="hidden lg:grid grid-cols-4 gap-6 relative">
            {steps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.12 }}
                transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1], delay: idx * 0.08 }}
                whileHover={{ y: -4, scale: 1.01, transition: { duration: 0.15, ease: 'easeOut' } }}
                className="relative flex flex-col cursor-pointer"
              >
                <div
                  className={`p-6 sm:p-7 rounded-2xl flex flex-col items-center text-center border hover:-translate-y-1.5 transition-all duration-300 shadow-xl ${step.bgClass} ${step.glow} h-full relative overflow-hidden group`}
                >
                  {/* Subtle Top Glow Pill */}
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider mb-4 border ${step.badgeBg}`}>
                    {step.badge || `Step ${idx + 1}`}
                  </span>

                  <div className="w-13 h-13 p-3 border border-white/20 rounded-2xl flex items-center justify-center bg-white/10 mb-4 shadow-md shrink-0 group-hover:scale-110 transition-transform duration-300">
                    {step.icon}
                  </div>

                  <h4 className="font-heading font-bold text-white text-[16px] mb-2 leading-snug">
                    {step.title}
                  </h4>
                  <p className="text-[13px] text-slate-300 font-normal leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* MOBILE / TABLET VIEW (Smooth Alternating Left/Right In-view Animation with Down Arrows) */}
          <div className="flex flex-col gap-0 lg:hidden max-w-md sm:max-w-lg mx-auto w-full overflow-hidden px-1">
            {steps.map((step, idx) => {
              const isEven = idx % 2 === 0;

              return (
                <div key={idx} className="flex flex-col items-center w-full">
                  {/* Step Card with Alternating Left / Right In-View Animation */}
                  <motion.div
                    initial={{ opacity: 0, x: isEven ? -35 : 35 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: false, amount: 0.1 }}
                    transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1], delay: 0.03 }}
                    whileHover={{ y: -4, scale: 1.01, transition: { duration: 0.15, ease: 'easeOut' } }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full p-6 rounded-2xl flex flex-col items-center text-center border shadow-xl ${step.bgClass} ${step.glow} relative overflow-hidden`}
                  >
                    {/* Step Badge & Directional Indicator */}
                    <div className="flex items-center justify-between w-full mb-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${step.badgeBg}`}>
                        {step.badge || `Step ${idx + 1}`}
                      </span>
                      <span className="text-[11px] font-mono font-bold text-slate-400">
                        {isEven ? "Step " + (idx + 1) + " →" : "← Step " + (idx + 1)}
                      </span>
                    </div>

                    <div className="w-13 h-13 p-3 border border-white/20 rounded-2xl flex items-center justify-center bg-white/10 mb-3 shadow-md shrink-0">
                      {step.icon}
                    </div>

                    <h4 className="font-heading font-bold text-white text-[16px] sm:text-[17px] mb-2 leading-snug">
                      {step.title}
                    </h4>
                    <p className="text-[13px] text-slate-300 font-normal leading-relaxed">
                      {step.desc}
                    </p>
                  </motion.div>

                  {/* Animated Prominent Downward Connector Arrow between boxes */}
                  {idx < steps.length - 1 && (
                    <div className="flex flex-col items-center justify-center py-3 my-1 relative">
                      <div
                        className="w-1 h-6 rounded-full opacity-80"
                        style={{ backgroundColor: step.accentColor }}
                      />
                      <motion.div
                        animate={{ y: [0, 6, 0] }}
                        transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                        className="w-12 h-12 rounded-full bg-slate-900 border-[2.5px] shadow-2xl flex items-center justify-center my-1 z-10"
                        style={{
                          borderColor: step.accentColor,
                          boxShadow: `0 8px 24px -4px ${step.accentColor}40`
                        }}
                      >
                        <ArrowDown size={22} strokeWidth={2.5} style={{ color: step.accentColor }} />
                      </motion.div>
                      <div
                        className="w-1 h-6 rounded-full opacity-80"
                        style={{ backgroundColor: steps[idx + 1].accentColor }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {/* Mobile spacing spacer so content never gets hidden behind sticky footer prompts */}
          <div className="h-20 lg:hidden" />
        </div>
      </div>
      <TestDriveModal
        car={car}
        isOpen={isTestDriveOpen}
        onClose={() => setIsTestDriveOpen(false)}
        onSuccess={(details) => {
          setScheduledTestDrive(details);
          setMobileLoanPromptVisible(false);
        }}
        initialLocation={testDriveLocation}
        initialData={scheduledTestDrive}
      />


      {/* Mobile-Only Sticky Bottom CTA Bar — only after loan/test-drive steps dismissed */}
      {!mobileLoanPromptVisible && (
        <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-slate-200/80 shadow-[0_-6px_24px_rgba(0,0,0,0.10)] px-4 pt-2.5 pb-4 space-y-2">
          <style>{`
            @keyframes btnShine {
              0%   { transform: translateX(-100%) skewX(-15deg); }
              100% { transform: translateX(250%) skewX(-15deg); }
            }
            .btn-shine::after {
              content: '';
              position: absolute;
              top: 0; left: 0;
              width: 40%;
              height: 100%;
              background: linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent);
              animation: btnShine 2.2s ease-in-out infinite;
              pointer-events: none;
            }
          `}</style>

          {/* Phone Line */}
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-slate-500 font-medium">
              This car will be booked on{' '}
              <a
                href={`tel:+91${user?.phone || '8574667466'}`}
                className="text-[#0C1B33] font-bold hover:underline"
              >
                {user?.phone || '8574667466'}
              </a>
            </p>
            <button
              type="button"
              onClick={() => navigate('/profile?edit=phone')}
              className="text-[10px] font-bold text-[#00A38D] uppercase tracking-wider cursor-pointer hover:underline"
            >
              EDIT
            </button>
          </div>

          {/* PROCEED TO PAY Button OR Already Paid Notice on Mobile */}
          {existingBooking ? (
            <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-3 text-center space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-800 flex items-center gap-1.5">
                  <CheckCircle2 size={15} className="text-emerald-600" /> Already Booked (#{existingBooking.booking_no})
                </span>
                <span className="text-xs font-bold text-emerald-700">₹{Number(existingBooking.booking_amount || rawBookingAmount).toLocaleString('en-IN')}</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-snug">
                You have already paid the booking deposit. We will contact you shortly!
              </p>
              <div className="grid grid-cols-2 gap-2 pt-0.5">
                <a
                  href={`${API_URL}/api/bookings/${existingBooking.id}/receipt?token=${localStorage.getItem('customerToken')}&format=pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 shadow-xs"
                >
                  <Download size={13} />
                  <span>Receipt</span>
                </a>
                <button
                  type="button"
                  onClick={() => navigate('/profile?tab=bookings')}
                  className="py-2 bg-[#0C1B33] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 shadow-xs"
                >
                  <span>My Bookings</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={handleBooking}
                disabled={isBooking}
                className={`btn-shine relative overflow-hidden w-full py-3.5 px-5 bg-gradient-to-r from-[#00C9AF] via-[#00DFB8] to-[#00A884] text-[#0C1B33] font-black text-sm rounded-2xl shadow-lg shadow-[#00C9AF]/30 flex items-center justify-between transition-all cursor-pointer uppercase tracking-wider ${isBooking ? 'opacity-70 cursor-not-allowed' : 'hover:from-[#00b4a0] hover:to-[#009170] active:scale-[0.99]'}`}
              >
                {isBooking ? (
                  <div className="flex items-center justify-center gap-2.5 w-full py-0.5">
                    <div className="w-4 h-4 border-2 border-[#0C1B33] border-t-transparent rounded-full animate-spin" />
                    <span>Processing...</span>
                  </div>
                ) : (
                  <>
                    <span className="font-black text-[13px] tracking-wider">PROCEED TO PAY</span>
                    <div className="flex items-center gap-2 font-price">
                      {appliedCoupon && appliedCoupon.applies_to === 'booking_amount' && (
                        <span className="line-through text-slate-700/70 text-xs font-bold">
                          ₹{rawBookingAmount.toLocaleString('en-IN')}
                        </span>
                      )}
                      <span className="bg-[#0C1B33] text-white px-3.5 py-1.5 rounded-xl text-xs font-extrabold shadow-sm tracking-tight">
                        ₹{finalPayableBookingAmount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </>
                )}
              </button>

              {/* Refundable note */}
              <p className="text-center text-[10px] text-slate-400 font-semibold">
                100% refundable
              </p>
            </>
          )}
        </div>
      )}


      {isMaintenanceModalOpen && (
        <div className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="fixed inset-0" onClick={() => setIsMaintenanceModalOpen(false)} />
          <div className="bg-white rounded-t-[28px] sm:rounded-3xl w-full max-w-md relative z-10 shadow-2xl p-5 sm:p-6 space-y-4 animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-200 border border-slate-200/90">

            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-bold sm:font-semibold text-[#0F172A]">
                Select payment type
              </h3>
              <button
                type="button"
                onClick={() => setIsMaintenanceModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center cursor-pointer transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* 2 Payment Type Toggle Cards */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              {/* Option 1: Pay in Full */}
              <button
                type="button"
                onClick={() => setMaintenancePaymentType('full')}
                className={`p-3.5 pt-4 rounded-2xl border-2 text-center transition-all cursor-pointer relative ${maintenancePaymentType === 'full'
                    ? 'border-[#00C9AF] bg-[#00C9AF]/10 text-[#008975] shadow-xs ring-1 ring-[#00C9AF]/30'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
              >
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[#00C9AF] text-[#0C1B33] text-[9px] font-bold sm:font-semibold uppercase px-2 py-0.5 rounded-full whitespace-nowrap shadow-2xs">
                  SAVE EXTRA ₹594
                </span>
                <span className="block text-xs font-bold sm:font-semibold uppercase tracking-wider mb-0.5">
                  Pay in full
                </span>
                <span className="block text-sm font-bold sm:font-semibold text-[#0F172A]">
                  ₹11,287
                </span>
              </button>

              {/* Option 2: Pay monthly */}
              <button
                type="button"
                onClick={() => setMaintenancePaymentType('monthly')}
                className={`p-3.5 pt-4 rounded-2xl border-2 text-center transition-all cursor-pointer ${maintenancePaymentType === 'monthly'
                    ? 'border-[#00C9AF] bg-[#00C9AF]/10 text-[#008975] shadow-xs ring-1 ring-[#00C9AF]/30'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
              >
                <span className="block text-xs font-bold sm:font-semibold uppercase tracking-wider mb-0.5">
                  Pay monthly
                </span>
                <span className="block text-xs font-bold sm:font-semibold text-slate-800">
                  ₹990/m · <span className="text-[10px] text-slate-500 font-normal">for 12 months</span>
                </span>
              </button>
            </div>

            {/* Breakdown Card */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-slate-600 font-medium">
                <span>Total price</span>
                <span className="font-bold sm:font-semibold text-slate-800">₹13,201</span>
              </div>
              <div className="flex items-center justify-between text-[#00A884] font-bold sm:font-semibold">
                <span>Package discount</span>
                <span>- ₹1,320</span>
              </div>
              {maintenancePaymentType === 'full' && (
                <div className="flex items-center justify-between text-[#00A884] font-bold sm:font-semibold">
                  <span>Full payment discount</span>
                  <span>- ₹594</span>
                </div>
              )}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-slate-600 font-medium">
                <span>Subtotal</span>
                <span className="font-bold sm:font-semibold text-slate-800">
                  {maintenancePaymentType === 'full' ? '₹11,287' : '₹11,881'}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-sm">
                <span className="font-bold sm:font-semibold text-[#0F172A]">You pay</span>
                <span className="font-bold sm:font-semibold text-[#0F172A] text-sm sm:text-base">
                  {maintenancePaymentType === 'full' ? '₹11,287' : '₹990/m (for 12 months)'}
                </span>
              </div>
              {maintenancePaymentType === 'monthly' && (
                <p className="text-[11px] text-slate-400 font-medium text-center pt-1">
                  You can setup an UPI autopay on the delivery day
                </p>
              )}
            </div>

            {/* Confirm Button */}
            <button
              type="button"
              onClick={handleConfirmMaintenance}
              className="w-full py-3.5 bg-gradient-to-r from-[#00C9AF] via-[#00DFB8] to-[#00A884] hover:from-[#00b4a0] hover:to-[#009170] text-[#0C1B33] rounded-xl font-black text-sm shadow-md shadow-[#00C9AF]/25 transition-all cursor-pointer"
            >
              Confirm
            </button>

            {maintenancePackageAdded && (
              <button
                type="button"
                onClick={() => {
                  setMaintenancePackageAdded(false);
                  setIsMaintenanceModalOpen(false);
                }}
                className="w-full text-center text-xs font-bold text-rose-500 hover:text-rose-700 py-1 cursor-pointer"
              >
                Remove package from booking
              </button>
            )}

            {/* Validity Footer */}
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-medium pt-1">
              <Calendar size={13} />
              <span>Valid for 1 years from delivery</span>
            </div>

          </div>
        </div>
      )}

      {/* Celebration / Confetti Modal (Screenshot 3) */}
      {showCelebrationToast && (
        <>
          <CelebrationConfettiShower />
          <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-250 text-center border border-slate-100">
              {/* Green Top Wave Banner */}
              <div className="bg-[#00C9AF] text-[#0C1B33] px-4 py-2.5 text-xs font-black flex items-center justify-center gap-1.5 shadow-xs">
                <span>🎉 Saving ₹1,320 on package + upto ₹30,000 on upgrade</span>
              </div>

              <div className="p-6 pt-5 space-y-3">
                {/* Central 3D Graphic */}
                <div className="relative inline-flex items-center justify-center mx-auto my-2">
                  <div className="w-20 h-20 flex items-center justify-center">
                    <img
                      src="/amc.gif"
                      alt="Complete Maintenance Package"
                      className="w-18 h-18 object-contain"
                    />
                  </div>
                  <span className="absolute -top-1 -right-1 text-lg animate-bounce">✨</span>
                  <span className="absolute -bottom-1 -left-1 text-lg animate-pulse">🎊</span>
                </div>

                <div>
                  <h4 className="font-black text-[#0F172A] text-base sm:text-lg leading-tight">
                    1-Year complete maintenance package added
                  </h4>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    Enjoy complete ownership package for 1-Year
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowCelebrationToast(false)}
                  className="w-full py-2.5 bg-[#00C9AF] hover:bg-[#00b29a] text-[#0C1B33] font-black text-xs rounded-xl shadow-md cursor-pointer transition-all mt-2"
                >
                  Great!
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Full-Fidelity Complete Maintenance Package Details Modal / Drawer (Matching Screenshots 1, 2, 3, 4, 5) */}
      {isMaintenanceDetailsOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="fixed inset-0" onClick={() => setIsMaintenanceDetailsOpen(false)} />
          <div className="bg-[#F8FAFC] w-full max-w-lg h-full sm:h-[92vh] sm:rounded-3xl relative z-10 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-250 border border-slate-200">

            {/* Top Navigation Bar */}
            <div className="bg-white px-4 py-3.5 border-b border-slate-100 flex items-center justify-between shrink-0 shadow-2xs z-20">
              <button
                type="button"
                onClick={() => setIsMaintenanceDetailsOpen(false)}
                className="flex items-center gap-2 text-xs sm:text-sm font-black text-[#0F172A] hover:text-[#00A38D] cursor-pointer"
              >
                <ArrowLeft size={18} />
                <span>Complete Maintenance Package</span>
              </button>
              <button
                type="button"
                onClick={() => setIsMaintenanceDetailsOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Content Container */}
            <div className="flex-1 overflow-y-auto pb-28">

              {/* Hero Dark Teal Header Card */}
              <div className="bg-gradient-to-br from-[#0C1B33] via-[#1E293B] to-[#04433d] text-white p-5 pt-6 relative overflow-hidden">
                <div className="flex items-start justify-between relative z-10">
                  <div className="max-w-[62%]">
                    <h2 className="text-xl sm:text-2xl font-black leading-tight">
                      <span className="relative inline-block text-[#00C9AF]">
                        1-Year
                        <svg className="absolute -bottom-1 left-0 w-full h-2 text-amber-400" viewBox="0 0 100 20" preserveAspectRatio="none" fill="none" stroke="currentColor" strokeWidth="4">
                          <path d="M0,10 Q50,20 100,10" />
                        </svg>
                      </span> complete maintenance package
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300 font-semibold mt-2">
                      {maintenancePaymentType === 'full' ? '₹11,287 in full' : '₹11,881 or ₹990/m (for 12 months)'}
                    </p>
                  </div>

                  {/* 3D Toolbox Graphic Card */}
                  <div className="w-24 h-24 sm:w-28 sm:h-28 relative flex items-center justify-center shrink-0">
                    <img
                      src="/images/maintenance-package-icon.png"
                      alt="Complete Maintenance Package"
                      className="w-20 h-20 sm:w-22 sm:h-22 rounded-3xl object-cover shadow-2xl border border-white/20 transform rotate-2"
                    />
                  </div>
                </div>

                {/* Scalloped Green Wave Top Ribbon */}
                <div className="mt-4 -mx-5 -mb-5 bg-[#00C9AF] text-[#0C1B33] px-4 py-2.5 text-xs font-black flex items-center justify-center gap-1.5 shadow-md">
                  <span>🎉 Saving ₹1,320 on package + upto ₹30,000 on upgrade</span>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="p-4 sm:p-5 space-y-4">

                {/* 1. Warranty - Super Protect Card (Expandable) */}
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden transition-all">
                  <div
                    onClick={() => setExpandedFeature(expandedFeature === 'warranty' ? null : 'warranty')}
                    className="p-4 flex items-start justify-between cursor-pointer hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-200/60 flex items-center justify-center shrink-0">
                        <Wrench size={22} className="text-amber-500 animate-wrench-wiggle" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black text-[#0F172A]">Warranty - Super Protect</h4>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium">Covers all parts for upto 1 year</p>
                        <div className="flex items-center gap-2 mt-1.5 text-xs font-black">
                          <span className="text-emerald-700">₹7,437</span>
                          <span className="text-slate-400 line-through font-semibold text-[11px]">₹8,263</span>
                          <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-black px-1.5 py-0.5 rounded-md uppercase">
                            SAVE ₹826
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-slate-400 pt-1">
                      {expandedFeature === 'warranty' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </div>

                  {/* Expanded Accordion Body (Matching Screenshot 5) */}
                  {expandedFeature === 'warranty' && (
                    <div className="px-4 pb-4 pt-2 border-t border-slate-100 space-y-3.5 text-xs animate-in fade-in duration-150">

                      {/* Powertrain coverage */}
                      <div>
                        <div className="text-xs font-black text-[#0F172A] mb-1.5">
                          Powertrain coverage <span className="text-[10px] text-slate-400 font-semibold">(For 12 months/ 12,000 km)</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[11px]">
                            <Car size={13} className="text-[#00C9AF]" /> Engine & peripherals
                          </span>
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[11px]">
                            <RotateCcw size={13} className="text-[#00C9AF]" /> Transmission
                          </span>
                        </div>
                      </div>

                      {/* Key Systems */}
                      <div>
                        <div className="text-xs font-black text-[#0F172A] mb-1.5">
                          Key Systems <span className="text-[10px] text-slate-400 font-semibold">(For 3 months/ 3,000 km)</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[11px]">
                            <ShieldCheck size={13} className="text-[#00C9AF]" /> Steering system
                          </span>
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[11px]">
                            <CheckCircle2 size={13} className="text-[#00C9AF]" /> Braking system
                          </span>
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[11px]">
                            <Sparkles size={13} className="text-[#00C9AF]" /> Air conditioning
                          </span>
                        </div>
                      </div>

                      {/* Functional */}
                      <div>
                        <div className="text-xs font-black text-[#0F172A] mb-1.5">
                          Functional <span className="text-[10px] text-slate-400 font-semibold">(For 3 months/ 3,000 km)</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[11px]">
                            <ShieldCheck size={13} className="text-[#00C9AF]" /> Suspension
                          </span>
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[11px]">
                            <Info size={13} className="text-[#00C9AF]" /> Electrical & electronic systems
                          </span>
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[11px]">
                            <Sparkles size={13} className="text-[#00C9AF]" /> Infotainment & comfort features
                          </span>
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[11px]">
                            <Sparkles size={13} className="text-[#00C9AF]" /> Interior & exterior functional components
                          </span>
                        </div>
                      </div>

                      {/* Disclaimer Note */}
                      <div className="pt-2 border-t border-dashed border-slate-200 text-[10px] text-slate-400 leading-relaxed font-medium">
                        Note: Does not cover accident damage, wear & tear consumables, cosmetic issues, misuse, flooding, or modifications.
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Periodic Service Card (Expandable) */}
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden transition-all">
                  <div
                    onClick={() => setExpandedFeature(expandedFeature === 'periodic' ? null : 'periodic')}
                    className="p-4 flex items-start justify-between cursor-pointer hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className="w-11 h-11 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center shrink-0 shadow-2xs">
                        <Wrench size={20} className="text-[#00A38D] animate-gear-rotate" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black text-[#0F172A]">Periodic service</h4>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium">Scheduled service for every 12,000 km driven</p>
                        <div className="flex items-center gap-2 mt-1.5 text-xs font-black">
                          <span className="text-emerald-700">₹3,905</span>
                          <span className="text-slate-400 line-through font-semibold text-[11px]">₹4,339</span>
                          <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-black px-1.5 py-0.5 rounded-md uppercase">
                            SAVE ₹434
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-slate-400 pt-1">
                      {expandedFeature === 'periodic' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </div>

                  {/* Expanded Accordion Body (Matching Screenshot 6) */}
                  {expandedFeature === 'periodic' && (
                    <div className="px-4 pb-4 pt-2 border-t border-slate-100 space-y-3.5 text-xs animate-in fade-in duration-150">
                      <div>
                        <div className="text-xs font-black text-[#0F172A] mb-2">Standard service</div>
                        <ul className="space-y-2 text-[11px] text-slate-700 font-medium">
                          <li className="flex items-center gap-2"><Check size={14} className="text-[#00C9AF] shrink-0" /> Engine oil & oil filter replacement</li>
                          <li className="flex items-center gap-2"><Check size={14} className="text-[#00C9AF] shrink-0" /> Air filter replacement</li>
                          <li className="flex items-center gap-2"><Check size={14} className="text-[#00C9AF] shrink-0" /> Basic brake servicing & fluid top-ups</li>
                          <li className="flex items-center gap-2"><Check size={14} className="text-[#00C9AF] shrink-0" /> Coolant & washer fluid replenishment</li>
                          <li className="flex items-center gap-2"><Check size={14} className="text-[#00C9AF] shrink-0" /> Car health scan & essential checks</li>
                          <li className="flex items-center gap-2"><Check size={14} className="text-[#00C9AF] shrink-0" /> Interior vacuuming & exterior wash</li>
                        </ul>
                      </div>

                      {/* 2 Boxes: What this covers / What this doesn't cover */}
                      <div className="grid grid-cols-2 gap-2.5 pt-1">
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <span className="font-bold text-[#0F172A] flex items-center gap-1 text-[11px] mb-1">
                            <Check size={12} className="text-[#00C9AF]" /> What this covers
                          </span>
                          <p className="text-[10px] text-slate-500 font-medium leading-tight">
                            One scheduled annual service <strong className="text-[#00C9AF]">12 months</strong> (or 12,000 km)
                          </p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <span className="font-bold text-[#0F172A] flex items-center gap-1 text-[11px] mb-1">
                            <X size={12} className="text-rose-500" /> What this doesn't cover
                          </span>
                          <p className="text-[10px] text-slate-500 font-medium leading-tight">
                            Repairs or part replacements outside the service scope.
                          </p>
                        </div>
                      </div>

                      {/* Partner badge */}
                      <div className="text-center pt-2 text-[10px] font-bold text-slate-400">
                        POWERED BY <strong className="text-slate-700">SELECTT CERTIFIED WORKSHOPS</strong>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Roadside Assistance 24x7 Card (Expandable) */}
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden transition-all">
                  <div
                    onClick={() => setExpandedFeature(expandedFeature === 'rsa' ? null : 'rsa')}
                    className="p-4 flex items-start justify-between cursor-pointer hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className="w-11 h-11 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center shrink-0 shadow-2xs">
                        <Navigation size={20} className="text-orange-500 animate-float-nav" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black text-[#0F172A]">Roadside side assistance 24x7</h4>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium">Stuck on the road? We've got you - 24x7</p>
                        <div className="flex items-center gap-2 mt-1.5 text-xs font-black">
                          <span className="text-emerald-700">₹539</span>
                          <span className="text-slate-400 line-through font-semibold text-[11px]">₹599</span>
                          <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-black px-1.5 py-0.5 rounded-md uppercase">
                            SAVE ₹60
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-slate-400 pt-1">
                      {expandedFeature === 'rsa' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </div>

                  {/* Expanded Accordion Body (Matching Screenshot 7) */}
                  {expandedFeature === 'rsa' && (
                    <div className="px-4 pb-4 pt-2 border-t border-slate-100 space-y-2.5 text-xs animate-in fade-in duration-150">
                      <div className="text-xs font-black text-[#0F172A] mb-1.5">Benefits</div>
                      <ul className="space-y-2 text-[11px] text-slate-700 font-medium">
                        <li className="flex items-center gap-2"><Check size={14} className="text-[#00C9AF] shrink-0" /> Dead battery? On-spot jump-start</li>
                        <li className="flex items-center gap-2"><Check size={14} className="text-[#00C9AF] shrink-0" /> Flat tyre? Repaired or spare fitted, roadside</li>
                        <li className="flex items-center gap-2"><Check size={14} className="text-[#00C9AF] shrink-0" /> Locked your keys in? Lockout help</li>
                        <li className="flex items-center gap-2"><Check size={14} className="text-[#00C9AF] shrink-0" /> Out of fuel? We bring enough to reach the pump</li>
                        <li className="flex items-center gap-2"><Check size={14} className="text-[#00C9AF] shrink-0" /> Minor breakdown? On-spot fix to get you moving</li>
                        <li className="flex items-center gap-2"><Check size={14} className="text-[#00C9AF] shrink-0" /> Can't be fixed roadside? Free towing to nearest garage</li>
                      </ul>
                    </div>
                  )}
                </div>

                {/* Plus (+) Separator */}
                <div className="flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-slate-200/80 text-slate-600 flex items-center justify-center text-xs font-black shadow-2xs">
                    +
                  </div>
                </div>

                {/* 4. Upgrade Discount Card (With Green FREE Ribbon) */}
                <div className="bg-white rounded-2xl border border-emerald-200 overflow-hidden shadow-2xs relative flex">
                  <div className="bg-[#00C9AF] text-[#0C1B33] px-2 py-4 flex items-center justify-center font-black text-[10px] uppercase tracking-widest [writing-mode:vertical-rl] rotate-180 shrink-0">
                    FREE
                  </div>
                  <div className="p-4 flex-1">
                    <h4 className="font-black text-[#0F172A] text-sm">
                      Get up-to ₹30,000 off on upgrade
                    </h4>
                    <p className="text-[11px] text-slate-600 font-medium mt-1 leading-relaxed">
                      Sell this car back to Selectt when you upgrade and get <strong className="text-emerald-700">₹10,000 assured coupon</strong> + up to <strong className="text-emerald-700">₹20,000 off</strong> your next purchase.
                    </p>
                  </div>
                </div>

                {/* Trust Stats Strip (Teal brand style) */}
                <div className="bg-teal-50/70 border border-teal-200/80 rounded-2xl p-3.5 grid grid-cols-3 divide-x divide-teal-200 text-center">
                  <div>
                    <span className="block text-xs font-black text-[#0F172A]">4.8 ★</span>
                    <span className="block text-[9px] font-black text-slate-500 uppercase tracking-wider">AVG RATING</span>
                  </div>
                  <div>
                    <span className="block text-xs font-black text-[#0F172A]">3,556+</span>
                    <span className="block text-[9px] font-black text-slate-500 uppercase tracking-wider">HAPPY OWNERS</span>
                  </div>
                  <div>
                    <span className="block text-xs font-black text-[#0F172A]">₹20,000</span>
                    <span className="block text-[9px] font-black text-slate-500 uppercase tracking-wider">SAVED ON REPAIRS</span>
                  </div>
                </div>

                {/* FAQs Section (Matching Screenshots 3, 4, 5) */}
                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-3">
                  <h3 className="font-black text-[#0F172A] text-base">FAQs</h3>

                  <div className="divide-y divide-slate-100">
                    {[
                      {
                        q: "What is the Complete Maintenance Package (CMP)?",
                        a: "CMP is a single bundle that covers your car after purchase — Extended Warranty, Periodic Service, 24x7 Roadside Assistance, an Upgrade Voucher for your next Selectt car, and (on eligible cars) a 90-day Buyback assurance. Buying them together costs less than buying each separately."
                      },
                      {
                        q: "What does the warranty cover, and what's not covered?",
                        a: "Super Protect covers 100% of engine components, transmission (manual & automatic), steering, braking, AC, suspension, and electrical systems. It does not cover accidental damage, regular wear-and-tear consumables (wipers, tyres), cosmetic damages, or external flooding."
                      },
                      {
                        q: "How do I pay for CMP — all at once or monthly?",
                        a: "You can choose either 'Pay in full' for ₹11,287 (which gives you an extra ₹594 discount) or 'Pay monthly' at ₹990/month for 12 months with easy zero-cost UPI autopay setup on delivery day."
                      },
                      {
                        q: "When does my coverage start?",
                        a: "Your coverage begins on the exact day of vehicle delivery and remains valid for a full 12 months or 12,000 km (whichever occurs first)."
                      },
                      {
                        q: "What is the 90-day Buyback assurance?",
                        a: "If you decide to upgrade or sell within 90 days, Selectt guarantees a pre-determined locked valuation with minimal depreciation."
                      },
                      {
                        q: "Can I choose only some services instead of the full package?",
                        a: "CMP is specifically curated as an all-inclusive bundle to give you maximum savings (saving ₹31,320+ across 1 year). Individual services cost significantly more when purchased separately."
                      },
                      {
                        q: "How does the Upgrade Voucher work?",
                        a: "When you trade-in or sell this car back to Selectt in future, you get an instant ₹10,000 assured upgrade coupon + up to ₹20,000 discount on your next vehicle purchase."
                      },
                      {
                        q: "Can I buy CMP or the warranty after I've booked, or after delivery?",
                        a: "Yes, you can add CMP anytime before or on the delivery day. After delivery, special bundled pricing may expire."
                      },
                      {
                        q: "What happens to my coverage if a monthly payment fails?",
                        a: "We provide a 5-day grace period with automatic payment retry links sent to your WhatsApp and SMS so your coverage never gets interrupted."
                      },
                      {
                        q: "Can I cancel, and will I get a refund?",
                        a: "Yes, if you cancel your car booking prior to delivery, the CMP is 100% refunded along with your booking token deposit."
                      },
                      {
                        q: "How does Roadside Assistance work, and how is my service fulfilled?",
                        a: "Simply call our dedicated 24x7 helpline or click 'Request RSA' from your Selectt profile. A certified breakdown support team is dispatched to your GPS location with an average arrival time under 45 minutes."
                      }
                    ].map((faq, fIdx) => (
                      <div key={fIdx} className="py-2.5">
                        <button
                          type="button"
                          onClick={() => setOpenFaqIndex(openFaqIndex === fIdx ? -1 : fIdx)}
                          className="w-full text-left flex items-center justify-between gap-3 text-xs font-black text-[#0F172A] hover:text-[#00A38D] cursor-pointer"
                        >
                          <span>{faq.q}</span>
                          <span className="text-slate-400 shrink-0">
                            {openFaqIndex === fIdx ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </span>
                        </button>
                        {openFaqIndex === fIdx && (
                          <p className="text-[11px] text-slate-600 font-medium mt-2 leading-relaxed animate-in fade-in duration-150">
                            {faq.a}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Terms Footer */}
                <div className="text-center pt-1 pb-4">
                  <span className="text-[11px] text-slate-400 underline font-medium cursor-pointer">
                    Terms & Conditions apply
                  </span>
                </div>

              </div>
            </div>

            {/* Sticky Bottom Bar */}
            <div className="absolute bottom-0 inset-x-0 bg-white/95 backdrop-blur-md p-4 border-t border-slate-200/90 shadow-[0_-8px_25px_rgba(0,0,0,0.08)] z-30 text-center space-y-2">
              <p className="text-xs font-black text-[#0F172A]">
                {maintenancePaymentType === 'full'
                  ? 'You are paying in full ₹11,287'
                  : 'You are paying monthly ₹990/m for 12 months'}
              </p>
              <button
                type="button"
                onClick={() => {
                  setIsMaintenanceDetailsOpen(false);
                  setIsMaintenanceModalOpen(true);
                }}
                className="w-full py-3.5 bg-gradient-to-r from-[#00C9AF] via-[#00DFB8] to-[#00A884] hover:from-[#00b4a0] hover:to-[#009170] text-[#0C1B33] rounded-2xl font-black text-sm shadow-md shadow-[#00C9AF]/25 transition-all cursor-pointer"
              >
                {maintenancePackageAdded ? 'Change Payment Type' : 'Add Maintenance Package'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Mobile Sticky Footer Popup for Car Loan & Test Drive (Mobile Only) */}
      {mobileLoanPromptVisible && (
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-50 p-4 pb-5 bg-white rounded-t-3xl shadow-[0_-10px_35px_rgba(0,0,0,0.18)] border-t border-slate-200/90 animate-in slide-in-from-bottom duration-300 w-full max-w-full overflow-hidden">
          <div className="max-w-md mx-auto w-full">
            {mobilePromptStep === 1 ? (
              <div className="animate-in fade-in duration-200">
                <div className="flex items-start gap-3 mb-3.5">
                  <img
                    src={carLoanIcon}
                    alt="Car Loan"
                    className="w-8 h-8 sm:w-9 sm:h-9 object-contain shrink-0 drop-shadow-sm"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-[#0C1B33] text-[15px] leading-tight mb-1">
                      Interested in car loan?
                    </h4>
                    <p className="text-xs text-slate-500 leading-snug">
                      Get your car financed at attractive interest rates.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setInterestedInLoan(false);
                      setMobilePromptStep(2);
                    }}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-[0.98] text-slate-700 font-bold text-xs sm:text-sm transition-all duration-150 cursor-pointer"
                  >
                    No, thanks
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setInterestedInLoan(true);
                      setShowLoanBoxOnMobile(true);
                      setMobilePromptStep(2);
                    }}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-[#00C9AF] hover:bg-[#00b29a] active:scale-[0.98] text-[#0C1B33] font-black text-xs sm:text-sm shadow-md shadow-[#00C9AF]/25 transition-all duration-150 cursor-pointer"
                  >
                    Yes, I'm interested
                  </button>
                </div>
              </div>
            ) : (
              <div className="animate-in fade-in duration-200 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-500 font-medium">
                    You haven't taken a test drive yet.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsTestDriveSkipped(true);
                      setMobileLoanPromptVisible(false);
                    }}
                    className="text-xs font-bold text-slate-400 hover:text-slate-700 underline cursor-pointer"
                  >
                    Skip
                  </button>
                </div>

                <h4 className="font-black text-[#0F172A] text-sm sm:text-base leading-tight">
                  Where would you prefer to take it?
                </h4>

                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileLoanPromptVisible(false);
                      openTestDrive('doorstep');
                    }}
                    className="py-2.5 px-2 rounded-xl bg-gradient-to-r from-[#00A38D] to-[#00C9AF] hover:from-[#008f7b] hover:to-[#00aa93] text-[#0C1B33] font-black text-[11px] sm:text-xs uppercase tracking-wider transition-all duration-150 shadow-md shadow-[#00A38D]/20 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <MapPin size={13} className="text-[#0C1B33] shrink-0" />
                    <span>YOUR LOCATION</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileLoanPromptVisible(false);
                      openTestDrive('hub');
                    }}
                    className="py-2.5 px-2 rounded-xl bg-gradient-to-r from-[#008975] to-[#00A38D] hover:from-[#007362] hover:to-[#008f7b] text-white font-black text-[11px] sm:text-xs uppercase tracking-wider transition-all duration-150 shadow-md shadow-[#008975]/20 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Building2 size={13} className="text-white shrink-0" />
                    <span>AT SELECTT HUB</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Price Summary Breakdown Popup Modal (Mobile + Desktop) */}
      {isPriceSummaryOpen && car && (
        <div className="fixed inset-0 z-[99999] bg-black/65 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
          <div
            className="fixed inset-0"
            onClick={() => setIsPriceSummaryOpen(false)}
          />
          <div className="bg-[#f8f9fa] rounded-t-3xl sm:rounded-3xl max-w-xl sm:max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 relative z-10 animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-250 flex flex-col">

            {/* Modal Sticky Header with Title and Confetti Savings Banner */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-md z-30 border-b border-slate-200/80 shadow-2xs">
              <div className="px-5 py-3.5 sm:py-4 flex items-center justify-between">
                <h3 className="font-heading font-extrabold text-[#0C1B33] text-lg sm:text-xl">
                  Price Breakdown
                </h3>
                <button
                  type="button"
                  onClick={() => setIsPriceSummaryOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Close price summary"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Fixed / Sticky Confetti Savings Banner with CSS & Canvas Animation */}
              <div className="px-4 pb-3.5 sm:px-6 sm:pb-4">
                <ConfettiSavingsBanner
                  savingAmount={savingsAmount}
                  className="w-full shadow-xs"
                />
              </div>
            </div>

            <div className="p-4 sm:p-6 space-y-4">

              {/* White Breakdown Box */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3.5 text-xs sm:text-sm">

                {/* Subtotal / Car Price */}
                <div className="flex justify-between items-center text-slate-700">
                  <span className="font-medium">Car price</span>
                  <span className="font-bold text-[#0C1B33] font-price">
                    ₹{originalCarPrice.toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Sale Discount */}
                <div className="flex justify-between items-center text-emerald-600 font-bold">
                  <span className="flex items-center gap-1.5">
                    <Sparkles size={14} className="text-emerald-500" /> Sale Discount
                  </span>
                  <span className="font-price">
                    - ₹{saleDiscount.toLocaleString('en-IN')}
                  </span>
                </div>

                {/* RC Transfer Facilitation */}
                <div className="flex justify-between items-center text-slate-700">
                  <span className="font-medium">RC transfer facilitation</span>
                  <span className="font-bold text-[#0C1B33] font-price">+ ₹{rcTransferFee.toLocaleString('en-IN')}</span>
                </div>

                {/* TCS (Tax Collected at Source) - Circled in reference screenshot */}
                <div className="flex justify-between items-start text-slate-700">
                  <div>
                    <div className="font-medium flex items-center gap-1.5">
                      <span>TCS (Tax Collected at Source)</span>
                      <PriceInfoPopover
                        title="TCS (Tax Collected at Source)"
                        onOpenModal={() => setActiveBreakdownModal('tcs')}
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium">
                      This amount will come back to you as a tax credit
                    </p>
                  </div>
                  <span className="font-bold text-[#0C1B33] font-price">
                    + ₹{tcsAmount.toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Servicing, Cleaning, Fuel */}
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-medium flex items-center gap-1.5">
                    <span>Servicing, cleaning, fuel & more</span>
                    <PriceInfoPopover
                      title="Servicing, cleaning, fuel & more"
                      onOpenModal={() => setActiveBreakdownModal('servicing')}
                    />
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 line-through font-normal text-xs font-price">₹8,700</span>
                    <span className="text-emerald-600 font-bold">Included</span>
                  </div>
                </div>

                {/* Warranty */}
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-medium flex items-center gap-1.5">
                    <span>Warranty (Protect)</span>
                    <PriceInfoPopover
                      title="Warranty (Protect)"
                      onOpenModal={() => setActiveBreakdownModal('warranty')}
                    />
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 line-through font-normal text-xs font-price">₹5,500</span>
                    <span className="text-emerald-600 font-bold">Included</span>
                  </div>
                </div>

                {/* Fixes & Upgrades */}
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-medium flex items-center gap-1.5">
                    <span>Fixes & upgrades</span>
                    <PriceInfoPopover
                      title="Fixes & upgrades"
                      onOpenModal={() => setActiveBreakdownModal('fixes')}
                    />
                  </span>
                  <span className="text-emerald-600 font-bold">Included</span>
                </div>

                {/* GST Taxes */}
                <div className="flex justify-between items-center text-slate-700">
                  <span className="font-medium flex items-center gap-1.5">
                    <span>GST (govt. taxes)</span>
                    <PriceInfoPopover
                      title="GST (govt. taxes)"
                      onOpenModal={() => setActiveBreakdownModal('gst')}
                    />
                  </span>
                  <span className="font-bold text-[#0C1B33] font-price">₹{gstTax.toLocaleString('en-IN')}</span>
                </div>

                {maintenancePackageAdded && (
                  <div className="flex justify-between items-center text-[#00A38D] font-bold pt-1 border-t border-slate-100">
                    <span>1-Year Complete Maintenance ({maintenancePaymentType === 'full' ? 'Paid in Full' : 'Monthly'})</span>
                    <span className="font-price">
                      {maintenancePaymentType === 'full' ? '+ ₹11,287' : '+ ₹990/m'}
                    </span>
                  </div>
                )}

                {/* Special Discount for you (Coupon Discount) */}
                {appliedCoupon && couponDiscount > 0 && (
                  <div className="flex justify-between items-center text-emerald-600 font-bold pt-2 border-t border-slate-100">
                    <span className="flex items-center gap-1.5">
                      <Sparkles size={14} className="text-emerald-500" />
                      <span>Special Discount for you</span>
                      {appliedCoupon.code && (
                        <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-black">
                          {appliedCoupon.code}
                        </span>
                      )}
                    </span>
                    <span className="font-price font-extrabold text-emerald-600">
                      - ₹{couponDiscount.toLocaleString('en-IN')}
                    </span>
                  </div>
                )}

                {/* Total On-road Price Divider */}
                <div className="pt-4 mt-2 border-t border-dashed border-slate-200 flex justify-between items-center">
                  <span className="font-heading font-extrabold text-[#0C1B33] text-sm sm:text-base">
                    Total on-road price
                  </span>
                  <span className="font-heading font-black text-[#0C1B33] text-lg sm:text-xl font-price">
                    ₹{totalOnRoadPrice.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Best-in-class values Section (Reused across Mobile & Desktop with upgraded legible sizes) */}
              {renderBestInClassValues(false)}
            </div>
          </div>
        </div>
      )}

      {/* 5 Price Breakdown Info Modals (TCS, Servicing, Warranty, Fixes, GST) */}
      {activeBreakdownModal && (
        <div
          className="fixed inset-0 z-[100000] flex items-center justify-center p-3.5 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setActiveBreakdownModal(null)}
        >
          <div
            className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-lg sm:max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200 p-5 sm:p-7 relative text-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 1. Servicing, cleaning, fuel & more Modal (Screenshot 3) */}
            {activeBreakdownModal === 'servicing' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-heading font-extrabold text-lg sm:text-xl text-[#0C1B33]">
                    Servicing, cleaning, fuel & more
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveBreakdownModal(null)}
                    className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                    aria-label="Close"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Card with border */}
                <div className="rounded-2xl border border-slate-200 divide-y divide-slate-100 bg-white">
                  <div className="p-3.5 sm:p-4 flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-sm sm:text-base text-[#0C1B33]">Car cleaning & dry cleaning</h4>
                      <p className="text-xs sm:text-[13px] text-slate-500 mt-0.5">Upon delivery</p>
                    </div>
                    <span className="font-bold text-sm sm:text-base text-[#0C1B33] font-price shrink-0">₹4,000</span>
                  </div>

                  <div className="p-3.5 sm:p-4 flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-sm sm:text-base text-[#0C1B33]">Pre delivery servicing cost</h4>
                      <p className="text-xs sm:text-[13px] text-slate-500 mt-0.5">Oil and air filter change, wheel balancing and alignment</p>
                    </div>
                    <span className="font-bold text-sm sm:text-base text-[#0C1B33] font-price shrink-0">₹8,000</span>
                  </div>

                  <div className="p-3.5 sm:p-4 flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-sm sm:text-base text-[#0C1B33]">Fuel top-up</h4>
                      <p className="text-xs sm:text-[13px] text-slate-500 mt-0.5">At the time of delivery</p>
                    </div>
                    <span className="font-bold text-sm sm:text-base text-[#0C1B33] font-price shrink-0">₹500</span>
                  </div>
                </div>

                {/* Highlight banner */}
                <div className="mt-3.5 p-3 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-between text-xs sm:text-sm font-semibold text-emerald-800">
                  <span>Pre-Delivery Total Value (₹12,500)</span>
                  <span className="font-bold text-emerald-700 uppercase">100% Included Free</span>
                </div>

                {/* Centered OKAY Button */}
                <div className="mt-6 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setActiveBreakdownModal(null)}
                    className="px-12 py-2.5 bg-[#00A38D] hover:bg-[#008f7b] text-white font-extrabold tracking-wider uppercase text-sm rounded-xl shadow-md shadow-[#00A38D]/25 transition-all cursor-pointer active:scale-95"
                  >
                    OKAY
                  </button>
                </div>
              </div>
            )}

            {/* 2. Fixes & upgrades Modal (Screenshot 4) */}
            {activeBreakdownModal === 'fixes' && (
              <div>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <h3 className="font-heading font-extrabold text-lg sm:text-xl text-[#0C1B33]">
                    Fixes & upgrades
                  </h3>
                  <div className="flex items-center gap-2">
                    {/* Car inspection graphic illustration */}
                    <div className="w-16 h-11 bg-slate-50 border border-slate-200/90 rounded-xl flex items-center justify-center p-1 shadow-2xs">
                      <svg className="w-12 h-9 text-[#00A38D]" viewBox="0 0 52 36" fill="none">
                        <rect x="2" y="14" width="36" height="18" rx="4" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="1.5" />
                        <path d="M6 14l5-8h16l5 8" stroke="#94A3B8" strokeWidth="1.5" fill="#E2E8F0" />
                        <circle cx="10" cy="32" r="3.5" fill="#334155" />
                        <circle cx="30" cy="32" r="3.5" fill="#334155" />
                        <circle cx="39" cy="15" r="9" fill="white" stroke="#00A38D" strokeWidth="2.2" />
                        <path d="M35 15l3 3 5-5" stroke="#00A38D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M45 21l5 5" stroke="#00A38D" strokeWidth="2.5" strokeLinecap="round" />
                      </svg>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveBreakdownModal(null)}
                      className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                      aria-label="Close"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>

                <div className="border-t border-dashed border-slate-200 my-3" />

                <div className="space-y-3 text-xs sm:text-[13px] text-slate-600 leading-relaxed">
                  <p>
                    Every Selectt vehicle undergoes a rigorous <strong>200-point physical and mechanical inspection</strong> before delivery. All mechanical wear, paint/scratch buffing, suspension calibration, and electrical tuning are completed by expert technicians.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                      <span className="font-bold text-[#0C1B33] block mb-0.5">Mechanical Tuning</span>
                      <span className="text-[11px] text-slate-500">Brakes, clutch, suspension, and steering calibrated to OEM specs.</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                      <span className="font-bold text-[#0C1B33] block mb-0.5">Diagnostics & AC</span>
                      <span className="text-[11px] text-slate-500">OBD scanner check, battery health, AC cooling & electrical systems.</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                      <span className="font-bold text-[#0C1B33] block mb-0.5">Paint & Body Polish</span>
                      <span className="text-[11px] text-slate-500">Minor scratches touched up, high-grade sealant & dent removal.</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                      <span className="font-bold text-[#0C1B33] block mb-0.5">Tires & Wheel Alignment</span>
                      <span className="text-[11px] text-slate-500">Laser balancing & 70%+ tread life assured across all wheels.</span>
                    </div>
                  </div>

                  <div className="mt-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200/70 flex items-center justify-between text-xs sm:text-sm font-semibold text-emerald-800">
                    <span>Refurbishment Cost to Customer</span>
                    <span className="font-bold text-emerald-700 uppercase">₹0 (100% Included)</span>
                  </div>
                </div>

                {/* Centered OKAY Button */}
                <div className="mt-6 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setActiveBreakdownModal(null)}
                    className="px-12 py-2.5 bg-[#00A38D] hover:bg-[#008f7b] text-white font-extrabold tracking-wider uppercase text-sm rounded-xl shadow-md shadow-[#00A38D]/25 transition-all cursor-pointer active:scale-95"
                  >
                    OKAY
                  </button>
                </div>
              </div>
            )}

            {/* 3. GST (govt. taxes) Modal (Screenshot 5) */}
            {activeBreakdownModal === 'gst' && (
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-heading font-extrabold text-lg sm:text-xl text-[#0C1B33]">
                      GST (govt. taxes)
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Selectt has no role to play in taxes levied by the govt.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveBreakdownModal(null)}
                    className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                    aria-label="Close"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="mt-3 rounded-2xl border border-slate-200 p-4 sm:p-5 bg-white space-y-3.5">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-slate-700 font-medium">GST on car cleaning & dry cleaning</span>
                    <span className="font-bold text-[#0C1B33] font-price">₹720</span>
                  </div>
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-slate-700 font-medium">GST on pre-delivery servicing cost</span>
                    <span className="font-bold text-[#0C1B33] font-price">₹1,440</span>
                  </div>
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-slate-700 font-medium">GST on warranty plan</span>
                    <span className="font-bold text-[#0C1B33] font-price">₹2,588</span>
                  </div>

                  <div className="pt-3 border-t border-dashed border-slate-200 flex items-center justify-between text-xs sm:text-sm font-bold">
                    <span className="text-slate-800">Total</span>
                    <span className="text-base sm:text-lg font-black text-[#0C1B33] font-price">₹4,748</span>
                  </div>
                </div>

                <p className="mt-2.5 text-[11px] text-slate-400 text-center">
                  * Statutory taxes under GST Act applied on professional facilitation services
                </p>

                {/* Centered OKAY Button */}
                <div className="mt-6 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setActiveBreakdownModal(null)}
                    className="px-12 py-2.5 bg-[#00A38D] hover:bg-[#008f7b] text-white font-extrabold tracking-wider uppercase text-sm rounded-xl shadow-md shadow-[#00A38D]/25 transition-all cursor-pointer active:scale-95"
                  >
                    OKAY
                  </button>
                </div>
              </div>
            )}

            {/* 4. Warranty & Insurance Breakup Modal (Screenshot 2) */}
            {activeBreakdownModal === 'warranty' && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-heading font-extrabold text-lg sm:text-xl text-[#0C1B33]">
                    Insurance breakup
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveBreakdownModal(null)}
                    className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                    aria-label="Close"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="rounded-2xl border border-slate-200 p-4 sm:p-5 bg-white space-y-3">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <div>
                      <div className="font-bold text-[#0C1B33]">Third party premium</div>
                      <div className="text-[11px] text-slate-500">By Digit</div>
                    </div>
                    <span className="font-bold text-[#0C1B33] font-price">₹7,897</span>
                  </div>

                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <div>
                      <div className="font-bold text-[#0C1B33]">Personal accident cover</div>
                      <div className="text-[11px] text-slate-500">Cover by Digit</div>
                    </div>
                    <span className="font-bold text-[#0C1B33] font-price">₹330</span>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs sm:text-sm">
                    <div>
                      <div className="font-bold text-[#0C1B33]">Total Premium</div>
                      <div className="text-[11px] text-slate-500">GST@18%</div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-[#0C1B33] font-price">₹8,227</span>
                      <span className="block text-[11px] text-slate-500">+ ₹1,482</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-dashed border-slate-200 flex items-center justify-between text-xs sm:text-sm font-bold">
                    <span className="text-slate-800">Total amount</span>
                    <span className="text-base sm:text-lg font-black text-[#0C1B33] font-price">₹9,709</span>
                  </div>
                </div>

                <div className="mt-3.5 space-y-2 text-[11.5px] sm:text-xs text-slate-600 leading-relaxed">
                  <div className="flex items-start gap-2">
                    <span className="text-[#00A38D] font-bold">•</span>
                    <span>Third-party insurance is mandatory by law.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[#00A38D] font-bold">•</span>
                    <span>Compulsory Personal Accident Cover for owner-driver under motor insurance policy is provided by GoDigit General Insurance vide product. UIN No- IRDAN158RP0038V03201819 <span className="text-[#00A38D]">T&C applied</span>.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[#00A38D] font-bold">•</span>
                    <span>This does not cover damage or loss to your own car due to accident, fire, or theft.</span>
                  </div>
                </div>

                <div className="mt-3.5 p-3 rounded-2xl bg-teal-50/80 border border-teal-200/70 text-xs text-teal-900 font-semibold text-center">
                  Upgrade to comprehensive insurance to fully protect your car.
                </div>

                <div className="mt-2 text-center text-[11px] text-slate-400">
                  Powered by <strong className="text-slate-600">Digit Insurance</strong> • T&C applied
                </div>

                {/* Centered OKAY Button */}
                <div className="mt-6 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setActiveBreakdownModal(null)}
                    className="px-12 py-2.5 bg-[#00A38D] hover:bg-[#008f7b] text-white font-extrabold tracking-wider uppercase text-sm rounded-xl shadow-md shadow-[#00A38D]/25 transition-all cursor-pointer active:scale-95"
                  >
                    OKAY
                  </button>
                </div>
              </div>
            )}

            {/* 5. TCS (Tax Collected at Source) Modal */}
            {activeBreakdownModal === 'tcs' && (
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-heading font-extrabold text-lg sm:text-xl text-[#0C1B33]">
                      TCS (Tax Collected at Source)
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      This amount will come back to you as a tax credit
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveBreakdownModal(null)}
                    className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                    aria-label="Close"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="mt-3 rounded-2xl border border-slate-200 p-4 sm:p-5 bg-white space-y-3">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-slate-700 font-medium">Statutory Tax Rate (Section 206C(1F))</span>
                    <span className="font-bold text-[#0C1B33]">1%</span>
                  </div>
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-slate-700 font-medium">TCS Collected on this Vehicle</span>
                    <span className="font-bold text-[#0C1B33] font-price">+ ₹{tcsAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="pt-3 border-t border-dashed border-slate-200 flex items-center justify-between text-xs sm:text-sm font-bold">
                    <span className="text-slate-800">Claimable Credit in ITR</span>
                    <span className="text-emerald-700 font-bold uppercase">100% Tax Credit</span>
                  </div>
                </div>

                <div className="mt-3.5 space-y-2 text-[11.5px] sm:text-xs text-slate-600 leading-relaxed">
                  <div className="flex items-start gap-2">
                    <span className="text-[#00A38D] font-bold">•</span>
                    <span>As per Section 206C(1F) of the Income Tax Act, 1% TCS is legally collected by the seller on motor vehicle transactions exceeding regulatory thresholds.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[#00A38D] font-bold">•</span>
                    <span>The collected tax is deposited directly against your PAN and will be reflected in your <strong>Form 26AS / AIS</strong>.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[#00A38D] font-bold">•</span>
                    <span>You can adjust this amount against your annual income tax liability or claim a full refund when filing your annual ITR.</span>
                  </div>
                </div>

                {/* Centered OKAY Button */}
                <div className="mt-6 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setActiveBreakdownModal(null)}
                    className="px-12 py-2.5 bg-[#00A38D] hover:bg-[#008f7b] text-white font-extrabold tracking-wider uppercase text-sm rounded-xl shadow-md shadow-[#00A38D]/25 transition-all cursor-pointer active:scale-95"
                  >
                    OKAY
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cancel Anytime, Fully Refundable Bottom Sheet / Modal */}
      {isRefundPolicyOpen && (
        <div className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="fixed inset-0" onClick={() => setIsRefundPolicyOpen(false)} />
          <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-lg relative z-10 shadow-2xl p-6 sm:p-7 space-y-4 animate-in slide-in-from-bottom sm:zoom-in-95 duration-200 border border-slate-200 max-h-[90vh] overflow-y-auto">
            {/* Top Drag Handle for Mobile */}
            <div className="w-12 h-1 bg-slate-300 rounded-full mx-auto sm:hidden -mt-1 mb-2" />

            {/* Header: Title + Refund Icon */}
            <div className="flex items-center justify-between gap-3 pt-1">
              <h3 className="font-heading font-extrabold text-lg sm:text-xl text-[#0C1B33] leading-snug">
                Cancel Anytime, Fully Refundable
              </h3>
              <div className="w-10 h-10 rounded-full bg-[#00A38D]/10 border border-[#00A38D]/25 flex items-center justify-center text-[#00A38D] shrink-0">
                <svg className="w-6 h-6 text-[#00A38D]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="12" cy="12" r="9" />
                  <circle cx="12" cy="12" r="6" strokeDasharray="2 2" />
                  <path d="M12 9v6M10 11h4M10 13h3" />
                </svg>
              </div>
            </div>

            {/* Body paragraphs matching Selectt refund guarantee contract */}
            <div className="space-y-3.5 text-xs sm:text-[13.5px] text-slate-700 leading-relaxed font-normal pt-1">
              <p>
                For any payment you make to book the car is 100% refundable till the car delivery date.
              </p>

              <p>
                Additionally, you can return it within 5 days from the date of car delivery for a 100% refund with our no-questions-asked 5-Day Money Back Guarantee.
              </p>

              <p>
                You can avail a 100% refund by requesting return from Selectt app or by visiting your nearest Selectt Car Hub or requesting a home pick-up by calling us on our after sales support helpline number{' '}
                <a href={`tel:${supportPhoneClean}`} className="text-[#00A38D] font-bold hover:underline">
                  +91 85746 67466
                </a>{' '}
                or writing to us at{' '}
                <a href="mailto:contact@selectt.in" className="text-[#00A38D] font-bold hover:underline">
                  contact@selectt.in
                </a>.
              </p>

              <p className="text-slate-500 text-[11.5px] sm:text-xs">
                In order for your purchased Selectt Assured car to be eligible under the 5-Day Money Back Guarantee, please refer to our{' '}
                <Link
                  to="/terms"
                  onClick={() => setIsRefundPolicyOpen(false)}
                  className="text-[#00A38D] font-semibold underline hover:text-[#008f7b]"
                >
                  Fair usage policy
                </Link>.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsRefundPolicyOpen(false)}
                className="w-full py-3 bg-[#00A38D] hover:bg-[#008f7b] text-white rounded-xl font-bold text-sm shadow-md shadow-[#00A38D]/20 transition-all cursor-pointer"
              >
                Got it, thanks
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Success Popup Modal on Same Checkout Page */}
      {showPaymentSuccessModal && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
          <CelebrationConfettiShower />

          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl relative border border-slate-100 animate-in zoom-in-95 duration-250 flex flex-col max-h-[92vh]">

            {/* Top Banner with Selectt Branding & Glowing Checkmark */}
            <div className="bg-gradient-to-r from-[#0C1B33] via-[#092e27] to-[#0C1B33] text-white p-6 pb-7 text-center relative overflow-hidden shrink-0">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#00C9AF]/20 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />

              <button
                type="button"
                onClick={() => setShowPaymentSuccessModal(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X size={16} />
              </button>

              <div className="relative inline-flex items-center justify-center mx-auto mb-3">
                <div className="w-16 h-16 rounded-full bg-[#00C9AF] text-[#0C1B33] flex items-center justify-center shadow-lg shadow-[#00C9AF]/50">
                  <Check size={32} strokeWidth={3.2} />
                </div>
                <span className="absolute -top-1 -right-1 text-xl animate-pulse">✨</span>
              </div>

              <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-white tracking-tight">
                Payment Successful!
              </h2>
              <div className="inline-flex items-center gap-1.5 bg-[#00C9AF]/15 border border-[#00C9AF]/40 px-3 py-1 rounded-full mt-2">
                <Sparkles size={11} className="text-[#00DFB8]" />
                <span className="text-[11px] font-black text-[#00DFB8] uppercase tracking-wider">
                  Car Booking Confirmed
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-2 max-w-sm mx-auto leading-relaxed">
                Thank you, <strong className="text-white font-bold">{paymentSuccessData?.customerName || user?.first_name || 'Customer'}</strong>! We have received your booking amount and reserved this car exclusively for you.
              </p>
            </div>

            {/* Scrollable Details Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4">

              {/* 1. Car Details Summary Card */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 flex items-center gap-3.5">
                <div className="w-20 h-16 sm:w-24 sm:h-20 bg-slate-200 rounded-xl overflow-hidden shrink-0 relative border border-slate-200">
                  <img
                    src={getCarImageUrl(car?.image || car?.images?.[0])}
                    alt={`${car?.year} ${car?.make} ${car?.model}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = DEFAULT_CAR_FALLBACK_IMAGE;
                    }}
                  />
                  <span className="absolute top-1 left-1 bg-black/70 backdrop-blur-xs text-white text-[9px] font-black px-1.5 py-0.5 rounded">
                    {car?.year}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-extrabold text-[#0C1B33] text-sm sm:text-base leading-snug truncate">
                    {car?.year} {car?.make} {car?.model}
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold truncate mt-0.5">
                    {car?.variant || (car?.fuel_type + ' • ' + car?.transmission)}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold mt-1.5 flex-wrap">
                    <span>{Number(car?.km_driven || car?.km || 0).toLocaleString('en-IN')} KM</span>
                    <span>•</span>
                    <span>{car?.fuel_type || 'Petrol'}</span>
                    <span>•</span>
                    <span>{car?.transmission || 'Manual'}</span>
                  </div>
                </div>
              </div>

              {/* 2. Payment Receipt Details Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-2.5 text-xs">
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Booking Amount Paid</span>
                  <div className="text-right">
                    <span className="text-base sm:text-lg font-extrabold text-emerald-600 font-price">
                      ₹{paymentSuccessData?.amount?.toLocaleString('en-IN') || '5,000'}
                    </span>
                    <span className="block text-[9.5px] font-bold text-slate-400">100% Refundable Deposit</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Payment ID</span>
                  <div className="flex items-center gap-1.5 font-mono font-bold text-slate-700 bg-slate-50 px-2 py-0.5 rounded border border-slate-200/80">
                    <span className="text-[11px] truncate max-w-[150px]">{paymentSuccessData?.paymentId || 'pay_confirmed'}</span>
                    <button
                      type="button"
                      onClick={() => {
                        if (paymentSuccessData?.paymentId) {
                          navigator.clipboard?.writeText(paymentSuccessData.paymentId);
                          setCopiedPaymentId(true);
                          setTimeout(() => setCopiedPaymentId(false), 2000);
                        }
                      }}
                      className="text-slate-400 hover:text-slate-700 cursor-pointer"
                      title="Copy Payment ID"
                    >
                      {copiedPaymentId ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Booking Reference</span>
                  <span className="font-bold text-slate-800 font-mono">
                    #{paymentSuccessData?.bookingId ? paymentSuccessData.bookingId : 'CONFIRMED'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Date & Time</span>
                  <span className="font-semibold text-slate-700">
                    {paymentSuccessData?.date || new Date().toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Payment Status</span>
                  <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full text-[10.5px]">
                    <CheckCircle2 size={11} />
                    Verified & Paid
                  </span>
                </div>

                {maintenancePackageAdded && (
                  <div className="flex items-center justify-between pt-2 border-t border-dashed border-slate-100">
                    <span className="text-slate-500 font-medium">1-Year Maintenance Package</span>
                    <span className="font-bold text-teal-700">Included</span>
                  </div>
                )}
              </div>

              {/* 3. WhatsApp Notification Note (Zero 3rd party vendor mentions) */}
              <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-3.5 flex items-start gap-2.5">
                <ShieldCheck size={20} className="text-[#00A38D] shrink-0 mt-0.5" />
                <div className="text-xs text-slate-600 leading-relaxed">
                  <strong className="text-[#0C1B33] block mb-0.5">WhatsApp Confirmation Sent!</strong>
                  Your booking receipt and verification details have been dispatched to your registered WhatsApp number. Our Selectt Relationship Manager will call you shortly to assist with next steps.
                </div>
              </div>

              {/* 4. Action CTA Buttons (Two buttons in one line: 1st is Download Receipt, 2nd is See Booking Details) */}
              <div className="pt-2">
                <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                  {/* Button 1: Download Receipt */}
                  <button
                    type="button"
                    onClick={() => {
                      const id = paymentSuccessData?.bookingPk || paymentSuccessData?.bookingId || bookingId;
                      const token = localStorage.getItem('customerToken') || '';
                      window.open(`${API_URL}/api/bookings/${id}/receipt?token=${token}&format=pdf`, '_blank');
                    }}
                    className="py-3 px-2 sm:px-4 rounded-xl border-2 border-[#00A38D]/30 hover:border-[#00A38D] bg-teal-50/60 hover:bg-teal-50 text-[#0C1B33] font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 shadow-xs transition-all cursor-pointer active:scale-95"
                  >
                    <Download size={15} className="text-[#00A38D] shrink-0" />
                    <span className="truncate">Download Receipt</span>
                  </button>

                  {/* Button 2: See Booking Details */}
                  <button
                    type="button"
                    onClick={() => navigate('/profile?tab=bookings&payment=success')}
                    className="py-3 px-2 sm:px-4 bg-[#00A38D] hover:bg-[#008f7b] text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md shadow-[#00A38D]/25 flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer transition-all hover:scale-[1.01] active:scale-95"
                  >
                    <span className="truncate">See Booking Details</span>
                    <ArrowRight size={15} className="shrink-0" />
                  </button>
                </div>

                <div className="mt-2.5 text-center">
                  <button
                    type="button"
                    onClick={() => setShowPaymentSuccessModal(false)}
                    className="text-xs text-slate-400 hover:text-slate-700 font-semibold cursor-pointer transition-colors"
                  >
                    Stay on this page
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Learn More Modal for Booking Options (Matching Reference Screenshots 1 & 2) */}
      {bookingLearnMoreModal && (
        <div
          className="fixed inset-0 z-[100001] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setBookingLearnMoreModal(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200 relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <h3 className="text-base sm:text-lg font-black text-[#0C1B33] tracking-tight">
                {bookingLearnMoreModal === 'special'
                  ? `How ${festivalName} reservation works`
                  : 'Selectt Satisfaction Assurance'}
              </h3>
              <button
                type="button"
                onClick={() => setBookingLearnMoreModal(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-800 flex items-center justify-center cursor-pointer transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body: Special Festival Stepper (Screenshot 1) */}
            {bookingLearnMoreModal === 'special' ? (
              <div className="py-6 px-1 space-y-6">
                {/* Step 1 */}
                <div className="relative flex items-start gap-4">
                  <div className="relative flex flex-col items-center">
                    <div className="w-7 h-7 rounded-full bg-teal-50 border border-teal-200 text-[#00A38D] font-bold text-xs flex items-center justify-center shrink-0 z-10 shadow-2xs">
                      1
                    </div>
                    <div className="w-[1.5px] bg-teal-200 absolute top-7 bottom-[-24px] left-1/2 -translate-x-1/2 z-0" />
                  </div>
                  <div className="min-w-0 flex-1 pt-0.5">
                    <h4 className="text-sm sm:text-[15px] font-bold text-[#0C1B33]">
                      Pay ₹{specialBookingAmount.toLocaleString('en-IN')} to book
                    </h4>
                    <p className="text-xs sm:text-[13px] text-slate-500 mt-0.5 leading-relaxed font-normal">
                      The car is taken off the website and held only for you till {settings?.booking_special_date || 'Sun, 11 Oct'}.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="relative flex items-start gap-4">
                  <div className="relative flex flex-col items-center">
                    <div className="w-7 h-7 rounded-full bg-teal-50 border border-teal-200 text-[#00A38D] font-bold text-xs flex items-center justify-center shrink-0 z-10 shadow-2xs">
                      2
                    </div>
                    <div className="w-[1.5px] bg-teal-200 absolute top-7 bottom-[-24px] left-1/2 -translate-x-1/2 z-0" />
                  </div>
                  <div className="min-w-0 flex-1 pt-0.5">
                    <h4 className="text-sm sm:text-[15px] font-bold text-[#0C1B33]">
                      Finish paperwork before {festivalName}
                    </h4>
                    <p className="text-xs sm:text-[13px] text-slate-500 mt-0.5 leading-relaxed font-normal">
                      Upload RC documents, get your loan approved and pay the balance by {getPaperworkDate(settings?.booking_special_date)}.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="relative flex items-start gap-4">
                  <div className="relative flex flex-col items-center">
                    <div className="w-7 h-7 rounded-full bg-teal-50 border border-teal-200 text-[#00A38D] font-bold text-xs flex items-center justify-center shrink-0 z-10 shadow-2xs">
                      3
                    </div>
                  </div>
                  <div className="min-w-0 flex-1 pt-0.5">
                    <h4 className="text-sm sm:text-[15px] font-bold text-[#0C1B33]">
                      Drive home on {festivalName}
                    </h4>
                    <p className="text-xs sm:text-[13px] text-slate-500 mt-0.5 leading-relaxed font-normal">
                      Take delivery on {settings?.booking_special_date || 'Sun, 11 Oct'}. We will call you to fix the time.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* Modal Body: Standard Assurance (Screenshot 2) */
              <div className="py-5 space-y-3.5 text-xs sm:text-[13.5px] text-slate-700 leading-relaxed">
                <p>
                  Placing a booking deposit allows us to reserve this car exclusively for you, for a total of {settings?.booking_standard_hold_days || 3} days. Use this time to freely decide if the car is your perfect fit.
                </p>
                <p>
                  If you’re not 100% satisfied with the car, we’ll refund your entire booking amount no-questions-asked.
                </p>
              </div>
            )}

            {/* Shared Callout Box (Screenshot 1 & 2) */}
            <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-4 sm:p-5 space-y-2 text-xs sm:text-[13px] leading-relaxed">
              <p className="text-slate-600">
                <strong className="font-bold text-[#0C1B33]">100% refundable</strong>{' '}
                Cancel any time before delivery and get the full amount back. No questions asked.
              </p>
              <p className="text-slate-600">
                <strong className="font-bold text-[#0C1B33]">Not an extra charge</strong>{' '}
                The ₹{(bookingLearnMoreModal === 'special' ? specialBookingAmount : standardBookingAmount).toLocaleString('en-IN')} is part of your car price. Think of it as a down payment on your car.
              </p>
            </div>

            {/* Bottom Full-Width "Got it" Button (Selectt Brand Teal) */}
            <button
              type="button"
              onClick={() => setBookingLearnMoreModal(null)}
              className="w-full mt-5 py-3.5 rounded-xl bg-[#00A38D] hover:bg-[#008f7b] active:scale-[0.99] text-white font-bold text-sm sm:text-base shadow-md shadow-[#00A38D]/25 transition-all cursor-pointer text-center"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
