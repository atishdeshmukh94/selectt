import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, ShieldCheck, RotateCcw, CreditCard, Car, Info } from 'lucide-react';
import confetti from 'canvas-confetti';

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

  const top = 15 + rnd1 * 50;
  const left = 28 + rnd2 * 68;
  const width = 6 + Math.floor(rnd3 * 4);
  const height = 3 + Math.floor(rnd4 * 3);
  const delay = (rnd1 * 2.8).toFixed(2);
  const duration = (1.8 + rnd2 * 0.6).toFixed(2);
  const color = FREEBET_CONFETTI_COLORS[i % FREEBET_CONFETTI_COLORS.length];
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

const ConfettiSavingsBanner = ({ savingAmount = 15000, className = "" }) => {
  const canvasRef = useRef(null);
  const confettiInstanceRef = useRef(null);

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
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
      />

      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent saving-banner-shimmer pointer-events-none" />

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

      <div className="absolute right-0 top-0 bottom-0 w-44 pointer-events-none overflow-hidden select-none z-0">
        <span className="absolute bottom-2.5 right-14 text-[#00C9AF] text-[13px] font-black leading-none opacity-85 animate-party-spin [animation-delay:0.2s]">
          +
        </span>
        <span className="absolute top-2 right-22 text-[#FF4757] text-[11px] font-black leading-none opacity-75 animate-party-spin [animation-delay:1s]">
          +
        </span>
      </div>

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

const PriceInfoPopover = ({ title, onOpenModal }) => {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onOpenModal && onOpenModal();
      }}
      className="w-5 h-5 rounded-full text-slate-400 hover:text-[#00A38D] hover:bg-[#00A38D]/10 active:scale-90 inline-flex items-center justify-center transition-all cursor-pointer focus:outline-none"
      aria-label={`View details about ${title}`}
      title={`Click for ${title} details`}
    >
      <Info size={13.5} className="shrink-0" />
    </button>
  );
};

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
      icon: RotateCcw,
      iconGrad: 'from-purple-600 to-indigo-400',
      title: 'Quality Assured',
      badge: 'Refurbished',
      badgeColor: 'bg-purple-100 text-purple-900',
      desc: 'Mechanical tune-up, multi-stage polish & sanitization.',
      border: 'border-purple-200/80',
    },
    {
      id: 'buyback',
      icon: ShieldCheck,
      iconGrad: 'from-emerald-700 to-teal-500',
      title: 'Buyback Guarantee',
      badge: 'Assured Price',
      badgeColor: 'bg-teal-100 text-teal-900',
      desc: 'Locked valuation up to 12 months + ₹30,000 upgrade bonus.',
      border: 'border-teal-200/80',
    },
  ],
];

const PriceSummaryModal = ({ isOpen, onClose, car, carPrice, onBookNow }) => {
  const [benefitSlide, setBenefitSlide] = useState(0);
  const [pauseBenefitSlide, setPauseBenefitSlide] = useState(false);
  const [activeBreakdownModal, setActiveBreakdownModal] = useState(null);

  useEffect(() => {
    if (!isOpen || pauseBenefitSlide) return;
    const timer = setInterval(() => {
      setBenefitSlide((prev) => (prev + 1) % 3);
    }, 2800);
    return () => clearInterval(timer);
  }, [isOpen, pauseBenefitSlide]);

  if (!isOpen) return null;

  const carObj = car || (carPrice ? { price: carPrice } : null);
  const rawPrice = Number(carObj?.price) || 0;
  const originalCarPrice = Number(carObj?.original_price || carObj?.originalPrice) || (rawPrice > 0 ? rawPrice + 5000 : 0);
  const saleDiscount = originalCarPrice > rawPrice ? (originalCarPrice - rawPrice) : 5000;
  const rcTransferFee = 4000;
  const tcsAmount = Math.round(rawPrice * 0.01);
  const gstTax = 2430;
  const totalOnRoadPrice = Math.max(0, rawPrice + rcTransferFee + tcsAmount + gstTax);
  const savingsAmount = ((carObj?.original_price && Number(carObj.original_price) > Number(carObj?.price))
    ? (Number(carObj.original_price) - Number(carObj.price))
    : 15000);

  return (
    <div className="fixed inset-0 z-[99999] bg-black/65 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div
        className="fixed inset-0"
        onClick={onClose}
      />
      <div className="bg-[#f8f9fa] rounded-t-3xl sm:rounded-3xl max-w-xl sm:max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 relative z-10 animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-250 flex flex-col text-slate-800">

        {/* Modal Sticky Header with Title and Confetti Savings Banner */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md z-30 border-b border-slate-200/80 shadow-2xs">
          <div className="px-5 py-3.5 sm:py-4 flex items-center justify-between">
            <h3 className="font-heading font-extrabold text-[#0C1B33] text-lg sm:text-xl">
              Price Breakdown
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-100 hover:bg-slate-200 active:scale-90 text-slate-700 hover:text-slate-900 flex items-center justify-center transition-all cursor-pointer border border-slate-200/80 shadow-2xs shrink-0"
              aria-label="Close price summary"
            >
              <X size={20} className="stroke-[2.5]" />
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

        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto">

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

            {/* TCS (Tax Collected at Source) */}
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

          {/* Best-in-class values Section */}
          <div className="pt-2">
            <div className="flex items-center justify-center gap-3 my-4">
              <div className="h-px bg-slate-200 flex-1 max-w-[80px]" />
              <span className="font-extrabold text-[#0C1B33] text-base sm:text-lg tracking-tight">
                Best-in-class values
              </span>
              <div className="h-px bg-slate-200 flex-1 max-w-[80px]" />
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center gap-3.5 mb-4">
              <p className="text-xs text-slate-600 font-medium leading-relaxed flex-1">
                Thorough inspection, expert refurbishment & cleaning has been conducted by our professionals.
              </p>
              <div className="shrink-0 flex items-center justify-center">
                <img
                  src="/img/car-wash.gif"
                  alt="Car inspection, cleaning and refurbishment"
                  className="w-18 h-18 sm:w-20 sm:h-20 object-contain"
                />
              </div>
            </div>

            {/* SELECTT ASSURED BENEFITS — Horizontal Carousel (2 cards visible) */}
            <div className="bg-gradient-to-br from-slate-900 via-[#0C1B33] to-slate-900 rounded-3xl p-4 border border-slate-800 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#00C9AF]/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Header */}
              <div className="flex items-center justify-between mb-3 relative z-10">
                <div className="inline-flex items-center gap-1.5 bg-[#00C9AF]/15 border border-[#00C9AF]/40 px-2.5 py-1 rounded-full">
                  <Sparkles size={11} className="text-[#00C9AF]" />
                  <span className="text-[10px] font-black text-[#00C9AF] uppercase tracking-wider">Selectt Assured Benefits</span>
                </div>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest hidden sm:inline-block">100% Peace of Mind</span>
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
                    <div key={pIdx} className="w-full shrink-0 grid grid-cols-2 gap-2.5 pb-1">
                      {pair.map((card) => {
                        const Icon = card.icon;
                        return (
                          <div
                            key={card.id}
                            className={`bg-white/95 rounded-xl p-2.5 border ${card.border} shadow-sm flex flex-col justify-between`}
                          >
                            <div className="flex items-start gap-2">
                              <div
                                className={`w-7 h-7 rounded-lg bg-gradient-to-tr ${card.iconGrad} text-white flex items-center justify-center shrink-0 shadow-xs`}
                              >
                                <Icon size={14} className={card.id === 'buyback' ? 'text-amber-300' : ''} />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1 mb-0.5 flex-wrap">
                                  <h4 className="font-extrabold text-[#0C1B33] text-[10px] leading-tight">
                                    {card.title}
                                  </h4>
                                  <span
                                    className={`text-[7px] ${card.badgeColor} font-black px-1 py-0.5 rounded uppercase whitespace-nowrap`}
                                  >
                                    {card.badge}
                                  </span>
                                </div>
                                <p className="text-[9px] text-slate-500 font-medium leading-snug">
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

              {/* Auto-slide indicator dots */}
              <div className="flex justify-center items-center gap-1.5 mt-3 relative z-10">
                {[0, 1, 2].map((i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setBenefitSlide(i);
                      setPauseBenefitSlide(true);
                      setTimeout(() => setPauseBenefitSlide(false), 3500);
                    }}
                    className="p-1 cursor-pointer focus:outline-none"
                    aria-label={`Slide ${i + 1}`}
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
        </div>

        {/* Modal Sticky Bottom Action Bar */}
        <div className="sticky bottom-0 bg-white/95 backdrop-blur-md px-4 py-3 sm:px-6 sm:py-3.5 border-t border-slate-200 z-30 flex items-center gap-3 shadow-lg mt-auto">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-3 rounded-xl border border-slate-300 font-extrabold text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-95 transition-all cursor-pointer shrink-0"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              if (onBookNow) {
                onBookNow();
              } else if (carObj?.id) {
                window.location.href = `/checkout/${carObj.id}`;
              }
            }}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-[#0C1B33] to-[#162A47] hover:from-[#112442] hover:to-[#0C1B33] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Book This Car</span>
          </button>
        </div>
      </div>

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
            {/* 1. Servicing, cleaning, fuel & more Modal */}
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

                <div className="mt-3.5 p-3 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-between text-xs sm:text-sm font-semibold text-emerald-800">
                  <span>Pre-Delivery Total Value (₹12,500)</span>
                  <span className="font-bold text-emerald-700 uppercase">100% Included Free</span>
                </div>

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

            {/* 2. Fixes & upgrades Modal */}
            {activeBreakdownModal === 'fixes' && (
              <div>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <h3 className="font-heading font-extrabold text-lg sm:text-xl text-[#0C1B33]">
                    Fixes & upgrades
                  </h3>
                  <div className="flex items-center gap-2">
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

            {/* 3. GST (govt. taxes) Modal */}
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

            {/* 4. Warranty & Insurance Breakup Modal */}
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

                <div className="mt-3 text-xs text-slate-500 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  Under section 206C(1F) of the Income Tax Act, TCS is collected on the sale of motor vehicles exceeding ₹10 Lakh. You can claim full credit for this amount when filing your Income Tax Return.
                </div>

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
    </div>
  );
};

export default PriceSummaryModal;
