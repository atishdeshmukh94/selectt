import React, { useState, useEffect } from 'react';
import { Heart, MapPin, Gauge, Fuel, ArrowUpRight, TrendingDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { API_URL, getCarImageUrl } from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import { shortenLocation, getCarDetailsUrl } from '../../utils/formatters';
import { trackCarView } from '../../utils/userPreferences';
import SkeletonImage from '../animation/SkeletonImage';
import { cardHoverVariants } from '../../utils/animationVariants';

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

  // Selectt Luxury
  if (text.includes('luxury') || text.includes('selectt luxury')) {
    return {
      bg: 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400',
      color: 'text-amber-950 font-normal',
      border: 'border-amber-200/90',
      glow: 'shadow-[0_0_14px_rgba(251,191,36,0.85)] ring-1 ring-amber-300/80',
      label: 'Selectt Luxury'
    };
  }

  // Offer Zone / Price Drop / Discount / Deal
  if (text.includes('offer zone') || text.includes('discount') || text.includes('price drop') || text.includes('deal')) {
    return {
      bg: 'bg-gradient-to-r from-rose-600 to-red-500',
      color: 'text-white font-normal',
      border: 'border-rose-300/80',
      glow: 'shadow-[0_0_14px_rgba(244,63,94,0.85)] ring-1 ring-rose-400/80',
      label: formatBadgeText(raw)
    };
  }

  // Like New - Distinct light radiant lime color with vivid glow
  if (text.includes('like new')) {
    return {
      bg: 'bg-gradient-to-r from-[#E2F952] via-[#BEF264] to-[#A3E635]',
      color: 'text-slate-950 font-normal',
      border: 'border-lime-400/90',
      glow: 'shadow-[0_0_14px_rgba(190,242,100,0.95)] ring-1 ring-lime-300/90',
      label: formatBadgeText(raw)
    };
  }

  // Certified / Verified / Assured
  if (text.includes('certified') || text.includes('verified') || text.includes('assured')) {
    return {
      bg: 'bg-gradient-to-r from-[#00E5C6] to-[#00B8A0]',
      color: 'text-slate-950 font-normal',
      border: 'border-teal-200/90',
      glow: 'shadow-[0_0_14px_rgba(0,229,198,0.85)] ring-1 ring-teal-300/80',
      label: formatBadgeText(raw)
    };
  }

  // Electric / EV / Hybrid
  if (text.includes('electric') || text.includes('hybrid') || text.includes('ev')) {
    return {
      bg: 'bg-gradient-to-r from-emerald-500 to-teal-500',
      color: 'text-white font-normal',
      border: 'border-emerald-200/80',
      glow: 'shadow-[0_0_14px_rgba(16,185,129,0.85)] ring-1 ring-emerald-300/80',
      label: formatBadgeText(raw)
    };
  }

  // Top Rated / Hot / Trending
  if (text.includes('top rated') || text.includes('rated') || text.includes('hot') || text.includes('trending')) {
    return {
      bg: 'bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500',
      color: 'text-white font-normal',
      border: 'border-amber-200/90',
      glow: 'shadow-[0_0_14px_rgba(249,115,22,0.85)] ring-1 ring-orange-300/80',
      label: formatBadgeText(raw)
    };
  }

  // Premium
  if (text.includes('premium')) {
    return {
      bg: 'bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-600',
      color: 'text-white font-normal',
      border: 'border-indigo-200/80',
      glow: 'shadow-[0_0_14px_rgba(99,102,241,0.85)] ring-1 ring-indigo-300/80',
      label: formatBadgeText(raw)
    };
  }

  // Refined Obsidian Glass Badge for features (German Engineered, Manual Fun, Low KM, Sunroof, etc.)
  return {
    bg: 'bg-slate-900/90 backdrop-blur-md',
    color: 'text-white font-normal',
    border: 'border-white/35',
    glow: 'shadow-[0_0_12px_rgba(255,255,255,0.35)] ring-1 ring-white/25',
    label: formatBadgeText(raw)
  };
};

const STATE_CODE_MAP = {
  'maharashtra': 'MH',
  'delhi': 'DL',
  'haryana': 'HR',
  'gujarat': 'GJ',
  'karnataka': 'KA',
  'uttar pradesh': 'UP',
  'rajasthan': 'RJ',
  'punjab': 'PB',
  'tamil nadu': 'TN',
  'telangana': 'TS',
  'andhra pradesh': 'AP',
  'kerala': 'KL',
  'madhya pradesh': 'MP',
  'west bengal': 'WB',
  'chandigarh': 'CH',
  'chhattisgarh': 'CG',
  'goa': 'GA',
  'odisha': 'OD',
  'bihar': 'BR',
  'jharkhand': 'JH',
  'uttarakhand': 'UK',
  'himachal pradesh': 'HP'
};

const getShortRtoOrState = (car) => {
  if (car.rto_code && String(car.rto_code).trim()) return String(car.rto_code).trim().toUpperCase();
  if (car.rto && String(car.rto).trim()) return String(car.rto).trim().toUpperCase();
  if (car.registration_no && String(car.registration_no).trim()) return String(car.registration_no).slice(0, 4).toUpperCase();
  const state = String(car.regState || '').trim();
  const lower = state.toLowerCase();
  if (STATE_CODE_MAP[lower]) return STATE_CODE_MAP[lower];
  return state ? (state.length > 4 ? state.slice(0, 2).toUpperCase() : state.toUpperCase()) : 'MH';
};

const CarCard = ({ car, lightBg = false }) => {
  const { user, token, openLoginModal } = useAuth();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isWishlisting, setIsWishlisting] = useState(false);

  useEffect(() => {
    if (!user || !car || !token) return;
    fetch(`${API_URL}/api/wishlist/check/${car.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setIsWishlisted(data.isWishlisted))
      .catch(console.error);
  }, [user, car, token]);

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      openLoginModal(window.location.pathname);
      return;
    }
    setIsWishlisting(true);
    try {
      const res = await fetch(`${API_URL}/api/wishlist/${car.id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setIsWishlisted(data.isWishlisted);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsWishlisting(false);
    }
  };

  const containerBgClass = lightBg
    ? 'bg-white border-slate-200/80 hover:border-[#00C9AF]/30'
    : 'bg-[#162947]/40 border-white/[0.08] backdrop-blur-md';

  const heartBtnClass = isWishlisted
    ? 'bg-red-500/10 text-red-500 border-red-500/20'
    : lightBg
      ? 'bg-slate-50 text-slate-500 hover:text-red-500 hover:bg-slate-100 border-slate-200/60 shadow-sm'
      : 'bg-slate-950/40 text-white/80 hover:text-red-500 hover:bg-white/10 border-white/10';

  // Filter out any video embeds / iframes / streaming URLs so only real car photos loop
  const isImageOnly = (url) => {
    if (!url || typeof url !== 'string') return false;
    const trimmed = url.trim().toLowerCase();
    if (
      trimmed.includes('iframe') ||
      trimmed.includes('embed') ||
      trimmed.includes('mediadelivery.net') ||
      trimmed.includes('youtube') ||
      trimmed.includes('youtu.be') ||
      trimmed.includes('vimeo') ||
      trimmed.endsWith('.mp4') ||
      trimmed.endsWith('.webm') ||
      trimmed.endsWith('.mov') ||
      trimmed.includes('/video/')
    ) {
      return false;
    }
    return true;
  };

  // Collect 3 to 4 genuine car photos in loop
  const carImages = React.useMemo(() => {
    const list = [];
    if (isImageOnly(car.image)) {
      list.push(car.image);
    }
    const extraList = Array.isArray(car.moreImages) 
      ? car.moreImages 
      : (Array.isArray(car.images) ? car.images : []);

    for (const img of extraList) {
      if (isImageOnly(img) && !list.includes(img)) {
        list.push(img);
        if (list.length >= 4) break; // Limit to 3-4 photos as requested
      }
    }
    if (list.length === 0 && car.image) {
      list.push(car.image);
    }
    return list;
  }, [car.image, car.moreImages, car.images]);

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Slow-mode automatic image slide loop (changes every 3.8s)
  useEffect(() => {
    if (carImages.length <= 1) return;
    const interval = setInterval(() => {
      setActiveImageIndex(prev => (prev + 1) % carImages.length);
    }, 3800);
    return () => clearInterval(interval);
  }, [carImages.length]);

  // Preload additional images in background
  useEffect(() => {
    if (carImages.length <= 1) return;
    carImages.forEach(img => {
      if (img) {
        const preload = new Image();
        preload.src = getCarImageUrl(img);
      }
    });
  }, [carImages]);

  return (
    <motion.div
      variants={cardHoverVariants}
      initial="initial"
      whileHover="hover"
      whileTap="tap"
      className={`rounded-[20px] overflow-hidden group flex flex-col w-full h-full relative border gpu-accelerated ${containerBgClass}`}
    >
      <Link 
        to={getCarDetailsUrl(car)} 
        onClick={() => trackCarView(car)}
        className="block flex-grow flex flex-col h-full w-full"
      >

        {/* Image Container with Slow-Mode Image Loop */}
        <div className={`relative h-[155px] overflow-hidden shrink-0 m-3 rounded-[14px] ${lightBg ? 'bg-slate-100' : 'bg-slate-950/20'}`}>
          {carImages.map((img, idx) => (
            <div
              key={`${img}-${idx}`}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                idx === activeImageIndex ? 'opacity-100 z-[1]' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <SkeletonImage
                src={getCarImageUrl(img)}
                alt={`${car.year || ''} ${car.make || ''} ${car.model || ''} ${car.variant || ''} - Photo ${idx + 1}`}
                aspectRatio="h-full w-full"
                hoverZoom={true}
                priority={idx === 0}
              />
            </div>
          ))}

          {/* Subtle Slide Indicators */}
          {carImages.length > 1 && (
            <div className="absolute bottom-2 inset-x-0 flex items-center justify-center gap-1 z-20 pointer-events-none">
              {carImages.map((_, idx) => (
                <span
                  key={idx}
                  className={`h-1 rounded-full transition-all duration-500 ${
                    idx === activeImageIndex
                      ? 'w-4 bg-white shadow-xs'
                      : 'w-1.5 bg-white/50 backdrop-blur-xs'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Sold Out Overlay */}
          {car.status === 'sold_out' && (
            <div className="absolute inset-0 bg-slate-950/70 flex items-center justify-center z-10">
              <div className="bg-red-600 text-white font-black px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-widest shadow-xl border border-red-500 animate-pulse">
                Sold Out
              </div>
            </div>
          )}

          {/* Coming Soon Badge Overlay - Placed at bottom of image with white background & clean medium text */}
          {car.status === 'coming_soon' && (
            <div className="absolute bottom-2.5 left-2.5 z-20">
              <div className="bg-white text-[#0C1B33] px-3 py-1 rounded-full text-[10.5px] font-sans font-bold flex items-center shadow-md border border-slate-200/90 tracking-wide uppercase">
                <span>COMING SOON</span>
              </div>
            </div>
          )}

          {/* Regular Tag Badge (if not coming soon) - Glowing & Shining */}
          {(car.badgeText || car.tag) && car.status !== 'coming_soon' && (() => {
            const badge = getBadgeStyles(car.badgeText || car.tag);
            return (
              <div className="absolute top-2.5 left-2.5 z-20 pointer-events-none">
                <div className={`badge-glow-shine ${badge.bg} ${badge.color} ${badge.border} ${badge.glow} border px-2.5 py-0.5 rounded-full text-[10.5px] font-sans font-normal tracking-wide flex items-center`}>
                  <span className="relative z-10">{badge.label}</span>
                </div>
              </div>
            );
          })()}

          {/* Heart Wishlist Icon with Spring Animation */}
          <motion.button
            disabled={isWishlisting}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.88 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            className={`w-8 h-8 min-w-[32px] min-h-[32px] max-w-[32px] max-h-[32px] aspect-square rounded-full p-0 flex items-center justify-center absolute top-2.5 right-2.5 transition-colors z-20 border cursor-pointer shrink-0 shadow-xs overflow-hidden ${heartBtnClass}`}
            style={{ width: '32px', height: '32px', minWidth: '32px', minHeight: '32px', borderRadius: '9999px', aspectRatio: '1 / 1', padding: 0 }}
            onClick={handleWishlistToggle}
            aria-label="Wishlist"
          >
            <Heart size={14} strokeWidth={2.2} fill={isWishlisted ? 'currentColor' : 'none'} className="shrink-0" />
          </motion.button>
        </div>

        {/* Content details */}
        <div className="px-3.5 sm:px-3.5 md:px-4 pb-4.5 sm:pb-4 md:pb-5 pt-1 flex-grow flex flex-col justify-between gap-2.5">
          <div>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h3 className={`text-[15px] sm:text-[16px] font-heading font-extrabold leading-snug truncate transition-colors duration-200 ${lightBg ? 'text-slate-800 group-hover:text-[#00C9AF]' : 'text-white group-hover:text-[#00C9AF]'}`}>
                  {car.title || `${car.year} ${car.make} ${car.model}`}
                </h3>
                <div className="flex items-center gap-1.5 mt-1 text-[11.5px] sm:text-[12px] font-medium text-slate-500 dark:text-slate-400">
                  <MapPin size={12} className="text-[#00C9AF] shrink-0" />
                  <span className="truncate" title={car.location || car.hub || 'Mumbai'}>
                    {(() => {
                      let loc = (car.location || car.hub || 'Mumbai').trim();
                      loc = loc.replace(/^(selectt\s+hub|hub)\s*[\-•:]\s*/i, '').trim();
                      return loc || 'Mumbai';
                    })()}
                  </span>
                </div>
              </div>
              {hasPriceDrop(car) && (() => {
                const orig = Number(car.original_price || car.originalPrice || car.old_price || car.oldPrice || 0);
                const current = Number(car.price || 0);
                let dropBadgeText = "Price Drop";
                if (orig > current && orig > 0) {
                  const diff = orig - current;
                  const pct = Math.round((diff / orig) * 100);
                  if (pct > 0) {
                    dropBadgeText = `${pct}% OFF`;
                  }
                }
                return (
                  <div className="shrink-0 pt-0.5">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-[#FFF0F3] text-[#E11D48] border border-[#FFE0E6] shadow-xs tracking-tight">
                      <TrendingDown size={12} strokeWidth={2.5} className="shrink-0 text-[#E11D48]" />
                      <span>{dropBadgeText}</span>
                    </span>
                  </div>
                );
              })()}
            </div>

            {/* Spec pills: KM, Fuel, Transmission, RTO Code (Comfortable on mobile, +1.2pt on desktop/laptop, spacious on 15.5"+ desktop) */}
            <div className="flex items-center gap-1.5 sm:gap-0.5 md:gap-0.5 xl:gap-1 2xl:gap-1.5 mt-2.5 sm:mt-2 flex-nowrap overflow-x-auto no-scrollbar">
              <div className={`px-2 sm:px-1 md:px-1 xl:px-1.5 2xl:px-2 py-0.5 rounded-lg sm:rounded-md xl:rounded-md 2xl:rounded-lg flex items-center gap-1.5 sm:gap-0.5 xl:gap-1 2xl:gap-1 shrink-0 border whitespace-nowrap shadow-2xs ${lightBg ? 'bg-slate-50 border-slate-200/80 text-slate-800' : 'bg-white/5 border-white/10 text-slate-200'}`}>
                <Gauge size={12} className="text-[#00C9AF] shrink-0 w-3 h-3 sm:w-2 sm:h-2 md:w-2 md:h-2 xl:w-2.5 xl:h-2.5 2xl:w-3 2xl:h-3" />
                <span className="text-[11px] sm:text-[8.5px] md:text-[8.5px] lg:text-[8.5px] xl:text-[9.7px] 2xl:text-[11.2px] font-bold tracking-tight">
                  {(Number(car.km) || 0).toLocaleString('en-IN')} km
                </span>
              </div>
              <div className={`px-2 sm:px-1 md:px-1 xl:px-1.5 2xl:px-2 py-0.5 rounded-lg sm:rounded-md xl:rounded-md 2xl:rounded-lg flex items-center gap-1.5 sm:gap-0.5 xl:gap-1 2xl:gap-1 shrink-0 border whitespace-nowrap shadow-2xs ${lightBg ? 'bg-slate-50 border-slate-200/80 text-slate-800' : 'bg-white/5 border-white/10 text-slate-200'}`}>
                <Fuel size={12} className="text-[#00C9AF] shrink-0 w-3 h-3 sm:w-2 sm:h-2 md:w-2 md:h-2 xl:w-2.5 xl:h-2.5 2xl:w-3 2xl:h-3" />
                <span className="text-[11px] sm:text-[8.5px] md:text-[8.5px] lg:text-[8.5px] xl:text-[9.7px] 2xl:text-[11.2px] font-bold tracking-tight">
                  {car.fuelType || car.fuel_type || 'Petrol'}
                </span>
              </div>
              <div className={`px-2 sm:px-1 md:px-1 xl:px-1.5 2xl:px-2 py-0.5 rounded-lg sm:rounded-md xl:rounded-md 2xl:rounded-lg flex items-center shrink-0 border whitespace-nowrap shadow-2xs ${lightBg ? 'bg-slate-50 border-slate-200/80 text-slate-800' : 'bg-white/5 border-white/10 text-slate-200'}`}>
                <span className="text-[11px] sm:text-[8.5px] md:text-[8.5px] lg:text-[8.5px] xl:text-[9.7px] 2xl:text-[11.2px] font-bold tracking-tight">
                  {car.transmission || 'Manual'}
                </span>
              </div>
              <div className={`px-2 sm:px-1 md:px-1 xl:px-1.5 2xl:px-2 py-0.5 rounded-lg sm:rounded-md xl:rounded-md 2xl:rounded-lg flex items-center shrink-0 border whitespace-nowrap shadow-2xs ${lightBg ? 'bg-slate-50 border-slate-200/80 text-slate-800' : 'bg-white/5 border-white/10 text-slate-200'}`}>
                <span className="text-[11px] sm:text-[8.5px] md:text-[8.5px] lg:text-[8.5px] xl:text-[9.7px] 2xl:text-[11.2px] font-bold tracking-tight">
                  {getShortRtoOrState(car)}
                </span>
              </div>
            </div>
          </div>

          {/* Pricing and Action button */}
          <div className={`flex items-center justify-between border-t pt-3 mt-1 pb-0 ${lightBg ? 'border-slate-100' : 'border-white/5'}`}>
            <div className="flex flex-col items-start text-left min-w-0 pr-2">
              {/* If there is an offer/discount, show strikethrough original price; otherwise render invisible placeholder of exact same height so horizontal divider line stays at identical position */}
              {(() => {
                const orig = Number(car.original_price || car.originalPrice || car.old_price || car.oldPrice || 0);
                const current = Number(car.price || 0);
                const hasDiscount = orig > current && orig > 0;

                if (hasDiscount) {
                  return (
                    <span className={`block text-[12px] font-medium line-through leading-none mb-1.5 ${lightBg ? 'text-slate-400' : 'text-slate-500'}`}>
                      ₹{(orig / 100000).toFixed(2)} Lakh
                    </span>
                  );
                }

                return (
                  <span className="block text-[12px] font-medium leading-none mb-1.5 invisible select-none pointer-events-none" aria-hidden="true">
                    ₹0.00 Lakh
                  </span>
                );
              })()}
              <div className="whitespace-nowrap flex items-baseline gap-1">
                <span className={`text-[18px] sm:text-[20px] font-extrabold tracking-tight leading-none ${lightBg ? 'text-slate-900' : 'text-white'}`}>
                  ₹{(car.price / 100000).toFixed(2)} Lakh
                </span>
              </div>
              <span className={`text-[12px] font-bold leading-none mt-1.5 whitespace-nowrap ${lightBg ? 'text-teal-700' : 'text-[#00C9AF]'}`}>
                EMI ₹{car.emi ? car.emi.toLocaleString('en-IN') : '0'}/m*
              </span>
            </div>

            <div className={`px-3.5 py-2.5 rounded-xl text-[12px] font-heading font-semibold transition-all duration-300 shrink-0 shadow-xs flex items-center gap-1 cursor-pointer ${lightBg 
              ? 'bg-[#0C1B33] text-white hover:bg-[#00C9AF] hover:text-[#0C1B33]' 
              : 'bg-[#00C9AF] text-[#0C1B33] hover:bg-white hover:text-[#0C1B33]'
            }`}>
              <span className={lightBg ? 'text-white' : 'text-[#0C1B33]'}>View</span>
              <ArrowUpRight size={14} className={`stroke-[2.5] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${lightBg ? 'text-white' : 'text-[#0C1B33]'}`} />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default CarCard;

