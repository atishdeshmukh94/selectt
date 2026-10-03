import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Shield, CheckSquare, RotateCcw, RefreshCw, BadgeIndianRupee, AlertTriangle, X, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';

export default function BenefitsAddons() {
  const [selectedBenefit, setSelectedBenefit] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const autoSlideRef = useRef(null);

  const VISIBLE = 3; // cards visible at a time on desktop

  const benefits = [
    {
      id: 'warranty',
      icon: <Shield size={24} strokeWidth={2.5} />,
      badge: 'COMPREHENSIVE',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      title: '6 Months Warranty',
      desc: 'Complete engine, transmission, steering & electrical coverage with zero deductible.',
      colorClass: 'text-emerald-400',
      iconBg: 'bg-emerald-500/20 border-emerald-400/60',
      accentColor: '#34d399',
    },
    {
      id: 'moneyback',
      icon: <RotateCcw size={24} strokeWidth={2.5} />,
      badge: 'NO RISK',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      title: '5-Day Money Back',
      desc: 'Love your car or return it within 5 days / 250 km for a 100% full refund. No questions asked.',
      colorClass: 'text-rose-400',
      iconBg: 'bg-rose-500/20 border-rose-400/60',
      accentColor: '#fb7185',
    },
    {
      id: 'emi',
      icon: <BadgeIndianRupee size={24} strokeWidth={2.5} />,
      badge: 'FROM 8.9% ROI',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      title: 'Lowest EMIs & Loans',
      desc: 'Fast on-spot loan approvals from top partner banks with flexible 12 to 84 months tenure.',
      colorClass: 'text-amber-400',
      iconBg: 'bg-amber-500/20 border-amber-400/60',
      accentColor: '#fbbf24',
    },
    {
      id: 'inspection',
      icon: <CheckSquare size={24} strokeWidth={2.5} />,
      badge: 'TOP 5% ONLY',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      title: '1 in 20 Selection',
      desc: '200-point rigorous check: 100% non-accidental, non-flooded, verified odometer history.',
      colorClass: 'text-cyan-400',
      iconBg: 'bg-cyan-500/20 border-cyan-400/60',
      accentColor: '#22d3ee',
    },
    {
      id: 'quality',
      icon: <RefreshCw size={24} strokeWidth={2.5} />,
      badge: 'REFURBISHED',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
      title: 'Quality Assured',
      desc: 'Detailed mechanical restoration, multi-stage paint polish, and deep ozone sanitization.',
      colorClass: 'text-indigo-400',
      iconBg: 'bg-indigo-500/20 border-indigo-400/60',
      accentColor: '#818cf8',
    },
    {
      id: 'buyback',
      icon: <AlertTriangle size={24} strokeWidth={2.5} />,
      badge: 'ASSURED PRICE',
      badgeColor: 'bg-[#00C9AF]/20 text-[#00C9AF] border-[#00C9AF]/40',
      title: 'Buyback Guarantee',
      desc: 'Guaranteed locked valuation for up to 12 months with up to ₹30,000 extra upgrade bonus.',
      colorClass: 'text-[#00C9AF]',
      iconBg: 'bg-[#00C9AF]/20 border-[#00C9AF]/60',
      accentColor: '#00C9AF',
    },
  ];

  const totalSlides = benefits.length - VISIBLE + 1; // 4 stop positions

  const goNext = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % benefits.length);
  }, [benefits.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex(prev => (prev - 1 + benefits.length) % benefits.length);
  }, [benefits.length]);

  // Auto-slide every 3 seconds (slow)
  useEffect(() => {
    if (isPaused) return;
    autoSlideRef.current = setInterval(goNext, 3000);
    return () => clearInterval(autoSlideRef.current);
  }, [isPaused, goNext]);

  // Build infinite visible slice: always show 3
  const getVisibleCards = () => {
    const result = [];
    for (let i = 0; i < VISIBLE; i++) {
      result.push(benefits[(currentIndex + i) % benefits.length]);
    }
    return result;
  };

  const visibleCards = getVisibleCards();

  return (
    <>
      <style>{`
        @keyframes benefitSlideIn {
          from { opacity: 0; transform: translateX(24px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .benefit-card-enter {
          animation: benefitSlideIn 0.4s cubic-bezier(0.22,1,0.36,1) both;
        }
        @keyframes dotPulse {
          0%, 100% { transform: scaleX(1); }
          50%       { transform: scaleX(1.5); }
        }
        .dot-active { animation: dotPulse 1.2s ease-in-out infinite; }
      `}</style>

      <div
        className="mb-6 border border-slate-800 rounded-2xl p-5 lg:p-6 bg-[#0C1B33] text-white shadow-xl relative overflow-hidden select-none"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 border border-[#00C9AF]/40 bg-[#00C9AF]/10 rounded-full px-3 py-1">
              <Shield size={13} fill="#00C9AF" className="text-[#00C9AF]" />
              <span className="text-[#00C9AF] text-[11px] font-black uppercase tracking-widest">Selectt Assured Benefits</span>
            </div>
          </div>
          <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider hidden sm:inline-block">100% Peace of Mind</span>
        </div>

        {/* Carousel Track */}
        <div className="relative">
          {/* Prev Button */}
          <button
            type="button"
            onClick={() => { goPrev(); setIsPaused(true); setTimeout(() => setIsPaused(false), 4000); }}
            className="hidden sm:flex absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-slate-800 border border-slate-700 hover:bg-slate-700 hover:border-[#00C9AF]/50 items-center justify-center text-slate-300 hover:text-white transition-all shadow-lg cursor-pointer"
          >
            <ChevronLeft size={16} />
          </button>

          {/* Cards Grid — 3 on desktop, 1 on mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 px-0 sm:px-6">
            {visibleCards.map((item, i) => (
              <button
                key={`${item.id}-${currentIndex}-${i}`}
                type="button"
                onClick={() => setSelectedBenefit(item)}
                className="benefit-card-enter bg-white/[0.06] hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-2xl p-4 text-left transition-all duration-300 cursor-pointer group active:scale-[0.98] focus:outline-none"
                style={{ animationDelay: `${i * 0.07}s` }}
              >
                {/* Icon + Badge row */}
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${item.iconBg} ${item.colorClass} shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                    {item.icon}
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${item.badgeColor} whitespace-nowrap ml-2 mt-0.5`}>
                    {item.badge}
                  </span>
                </div>

                {/* Title */}
                <h4 className="text-[13px] font-black text-white leading-snug mb-1 group-hover:text-[#00C9AF] transition-colors">
                  {item.title}
                </h4>

                {/* Desc */}
                <p className="text-[11px] text-slate-400 leading-relaxed font-medium line-clamp-3">
                  {item.desc}
                </p>
              </button>
            ))}
          </div>

          {/* Next Button */}
          <button
            type="button"
            onClick={() => { goNext(); setIsPaused(true); setTimeout(() => setIsPaused(false), 4000); }}
            className="hidden sm:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-slate-800 border border-slate-700 hover:bg-slate-700 hover:border-[#00C9AF]/50 items-center justify-center text-slate-300 hover:text-white transition-all shadow-lg cursor-pointer"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Dot Indicators */}
        <div className="flex items-center justify-center gap-1.5 mt-4">
          {benefits.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to benefit ${i + 1}`}
              onClick={() => { setCurrentIndex(i); setIsPaused(true); setTimeout(() => setIsPaused(false), 4000); }}
              className={`p-0 border-0 outline-none appearance-none cursor-pointer rounded-full transition-all duration-300 block ${
                i === currentIndex
                  ? 'w-6 h-2 bg-[#00C9AF] shadow-[0_0_8px_rgba(0,201,175,0.7)]'
                  : 'w-2 h-2 bg-slate-600 hover:bg-slate-400'
              }`}
              style={{ minHeight: '8px', maxHeight: '8px', padding: 0, border: 'none' }}
            />
          ))}
        </div>

      </div>

      {/* Interactive Detail Modal */}
      {selectedBenefit && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#0C1B33] border border-slate-700/80 rounded-2xl w-full max-w-md p-6 text-white relative shadow-2xl animate-in zoom-in-95 duration-200 text-left">
            <button
              onClick={() => setSelectedBenefit(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${selectedBenefit.iconBg} ${selectedBenefit.colorClass}`}>
                {selectedBenefit.icon}
              </div>
              <div>
                <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded border ${selectedBenefit.badgeColor}`}>
                  {selectedBenefit.badge}
                </span>
                <h3 className="text-lg font-bold text-white mt-1 leading-snug">
                  {selectedBenefit.title}
                </h3>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed mb-6 bg-slate-900/60 p-4 rounded-xl border border-white/5">
              {selectedBenefit.desc}
            </p>

            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <CheckCircle2 size={15} className="text-[#00C9AF] shrink-0" />
                <span>Verified by Selectt Quality Assurance Team</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <CheckCircle2 size={15} className="text-[#00C9AF] shrink-0" />
                <span>Includes 100% digital RC &amp; paperwork support</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedBenefit(null)}
              className="w-full py-3 bg-[#00C9AF] hover:bg-[#00B4A0] text-[#0C1B33] font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-[#00C9AF]/20 active:scale-95 cursor-pointer"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </>
  );
}
