import React, { useState, useEffect } from 'react';
import { Heart, MapPin, Gauge, Fuel, ArrowUpRight, TrendingDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { API_URL } from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import { shortenLocation, getCarDetailsUrl } from '../../utils/formatters';
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

const getBadgeStyles = (tagText) => {
  const text = (tagText || '').trim().toLowerCase();

  if (text.includes('like new') || text.includes('certified')) {
    return { bg: 'bg-[#00C9AF]', color: 'text-[#0A1C3A]', icon: '✓', label: tagText };
  }
  if (text.includes('verified')) {
    return { bg: 'bg-[#00C9AF]', color: 'text-[#0A1C3A]', icon: '✓', label: tagText };
  }
  if (text.includes('electric') || text.includes('efficient') || text.includes('hardly') || text.includes('low')) {
    return { bg: 'bg-emerald-500', color: 'text-white', icon: '⚡', label: tagText };
  }
  if (text.includes('luxury') || text.includes('selectt luxury')) {
    return { bg: 'bg-gradient-to-r from-amber-400 to-yellow-500', color: 'text-slate-900', icon: '👑', label: 'Selectt Luxury' };
  }
  if (text.includes('offer zone') || text.includes('discount')) {
    return { bg: 'bg-gradient-to-r from-red-500 to-rose-500', color: 'text-white', icon: '🏷️', label: 'Offer Zone' };
  }
  if (text.includes('hot') || text.includes('deal') || text.includes('trending')) {
    return { bg: 'bg-[#FF2A55]', color: 'text-white', icon: '🔥', label: tagText };
  }
  if (text.includes('top rated') || text.includes('rated')) {
    return { bg: 'bg-orange-500', color: 'text-white', icon: '🔥', label: tagText };
  }
  if (text.includes('premium')) {
    return { bg: 'bg-violet-600', color: 'text-white', icon: '💎', label: tagText };
  }
  return { bg: 'bg-slate-700', color: 'text-white', icon: '✓', label: tagText };
};

const formatLabel = (label) => {
  if (!label) return '';
  return label.charAt(0).toUpperCase() + label.slice(1).toLowerCase();
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

  const imageSrc = car.image?.startsWith('/') ? `${API_URL}${car.image}` : car.image;

  return (
    <motion.div
      variants={cardHoverVariants}
      initial="initial"
      whileHover="hover"
      whileTap="tap"
      className={`rounded-[20px] overflow-hidden group flex flex-col w-full h-full relative border gpu-accelerated ${containerBgClass}`}
    >
      <Link to={getCarDetailsUrl(car)} className="block flex-grow flex flex-col h-full w-full">

        {/* Image Container with Skeleton & Subtle Hover Zoom */}
        <div className={`relative h-[155px] overflow-hidden shrink-0 m-3 rounded-[14px] ${lightBg ? 'bg-slate-100' : 'bg-slate-950/20'}`}>
          <SkeletonImage
            src={imageSrc}
            alt={`${car.year} ${car.make} ${car.model}`}
            aspectRatio="h-full w-full"
            hoverZoom={true}
          />

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

          {/* Regular Tag Badge (if not coming soon) */}
          {(car.badgeText || car.tag) && car.status !== 'coming_soon' && (() => {
            const badge = getBadgeStyles(car.badgeText || car.tag);
            return (
              <div className="absolute top-2.5 left-2.5 z-20">
                <div className={`${badge.bg} ${badge.color} px-2.5 py-1 rounded-full text-[10px] font-extrabold flex items-center gap-1 shadow-lg tracking-wide relative overflow-hidden`}>
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full animate-shimmer pointer-events-none" />
                  <span>{badge.icon}</span>
                  <span>{formatLabel(badge.label)}</span>
                </div>
              </div>
            );
          })()}

          {/* Heart Wishlist Icon with Spring Animation */}
          <motion.button
            disabled={isWishlisting}
            whileHover={{ scale: 1.2, rotate: 5 }}
            whileTap={{ scale: 0.85 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            className={`backdrop-blur-md rounded-full p-2 absolute top-2.5 right-2.5 transition-colors z-20 border cursor-pointer ${heartBtnClass}`}
            onClick={handleWishlistToggle}
          >
            <Heart size={13} strokeWidth={2} fill={isWishlisted ? 'currentColor' : 'none'} />
          </motion.button>
        </div>

        {/* Content details */}
        <div className="px-5 pb-5 pt-1 flex-grow flex flex-col justify-between gap-3">
          <div>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h3 className={`text-[14px] font-heading font-bold leading-snug truncate transition-colors duration-200 ${lightBg ? 'text-slate-800 group-hover:text-[#00C9AF]' : 'text-white group-hover:text-[#00C9AF]'}`}>
                  {car.year} {car.make} {car.model}
                </h3>
                <span className={`text-[11px] font-medium block truncate mt-0.5 ${lightBg ? 'text-slate-500' : 'text-slate-400'}`}>
                  {car.variant || car.fuelType}
                </span>
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
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-extrabold bg-[#FFF0F3] text-[#E11D48] border border-[#FFE0E6] shadow-xs tracking-tight">
                      <TrendingDown size={11} strokeWidth={2.5} className="shrink-0 text-[#E11D48]" />
                      <span>{dropBadgeText}</span>
                    </span>
                  </div>
                );
              })()}
            </div>

            {/* Spec pills */}
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              <div className={`px-2.5 py-1 rounded-full flex items-center gap-1.5 shrink-0 border ${lightBg ? 'bg-slate-50 border-slate-200/50' : 'bg-white/5 border-white/[0.05]'}`}>
                <Gauge size={11} className="text-[#00C9AF]" />
                <span className={`text-[10px] font-semibold ${lightBg ? 'text-slate-600' : 'text-slate-300'}`}>{(car.km / 1000).toFixed(0)}k km</span>
              </div>
              <div className={`px-2.5 py-1 rounded-full flex items-center gap-1.5 shrink-0 border ${lightBg ? 'bg-slate-50 border-slate-200/50' : 'bg-white/5 border-white/[0.05]'}`}>
                <Fuel size={11} className="text-[#00C9AF]" />
                <span className={`text-[10px] font-semibold ${lightBg ? 'text-slate-600' : 'text-slate-300'}`}>{car.fuelType || car.fuel_type}</span>
              </div>
              {car.location && (
                <div className={`px-2.5 py-1 rounded-full flex items-center gap-1.5 shrink-0 border ${lightBg ? 'bg-slate-50 border-slate-200/50' : 'bg-white/5 border-white/[0.05]'}`}>
                  <MapPin size={11} className="text-[#00C9AF]" />
                  <span title={car.location} className={`text-[10px] font-semibold truncate max-w-[85px] ${lightBg ? 'text-slate-600' : 'text-slate-300'}`}>{shortenLocation(car.location)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Pricing and Action button */}
          <div className={`flex items-center justify-between border-t pt-3 mt-1 pb-0 ${lightBg ? 'border-slate-100' : 'border-white/5'}`}>
            <div className="flex flex-col items-start text-left min-w-0 pr-2">
              {/* Only show strikethrough if there's a real original price */}
              {(car.original_price || car.originalPrice || car.old_price || car.oldPrice) && (
                <span className={`text-[11px] font-medium line-through leading-none mb-1.5 ${lightBg ? 'text-slate-400' : 'text-slate-500'}`}>
                  ₹{(((car.original_price || car.originalPrice || car.old_price || car.oldPrice)) / 100000).toFixed(2)} Lakh
                </span>
              )}
              <div className="whitespace-nowrap flex items-baseline gap-1">
                <span className={`text-[17px] sm:text-[19px] font-bold tracking-tight leading-none ${lightBg ? 'text-slate-900' : 'text-white'}`}>
                  ₹{(car.price / 100000).toFixed(2)} Lakh
                </span>
              </div>
              <span className={`text-[11px] font-medium leading-none mt-1.5 whitespace-nowrap ${lightBg ? 'text-teal-600' : 'text-[#00C9AF]'}`}>
                EMI ₹{car.emi ? car.emi.toLocaleString('en-IN') : '0'}/m*
              </span>
            </div>

            <div className={`px-3.5 py-2 rounded-xl text-[11px] font-sans font-bold uppercase tracking-wider transition-all duration-300 shrink-0 shadow-xs flex items-center gap-1 cursor-pointer ${lightBg 
              ? 'bg-[#0C1B33] text-white group-hover:bg-[#00C9AF] group-hover:text-[#0C1B33]' 
              : 'bg-[#00C9AF] text-[#0C1B33] group-hover:bg-white group-hover:text-[#0C1B33]'
            }`}>
              <span>View Details</span>
              <ArrowUpRight size={13} className="stroke-[2.5] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default CarCard;

