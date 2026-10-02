import React, { useState } from 'react';
import { Shield, CheckSquare, RotateCcw, RefreshCw, BadgeIndianRupee, AlertTriangle, X, CheckCircle2 } from 'lucide-react';

export default function BenefitsAddons() {
  const [selectedBenefit, setSelectedBenefit] = useState(null);

  const benefits = [
    {
      id: 'warranty',
      icon: <span className="font-black text-xl inline-block -translate-y-[1px]">1</span>,
      title: "1 Year\nWarranty",
      subtitle: "Comprehensive Coverage",
      details: "Full 1-Year / 15,000 km warranty covering engine, gearbox, steering, and key electrical components with zero deductible.",
      colorClass: "text-amber-400 border-amber-400/80 bg-amber-500/20 shadow-[0_0_25px_rgba(251,191,36,0.6)]",
      ringColor: "border-amber-400",
      accentBg: "bg-amber-500/20 text-amber-300 border-amber-500/40"
    },
    {
      id: 'inspection',
      icon: <CheckSquare size={22} strokeWidth={2.5} />,
      title: "200-Points\nInspected",
      subtitle: "Engineer Certified",
      details: "Certified by master automotive engineers. Thorough 200-point inspection covering engine health, chassis structure, and road testing.",
      colorClass: "text-emerald-400 border-emerald-400/80 bg-emerald-500/20 shadow-[0_0_25px_rgba(52,211,153,0.6)]",
      ringColor: "border-emerald-400",
      accentBg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
    },
    {
      id: 'moneyback',
      icon: <RotateCcw size={22} strokeWidth={2.5} />,
      title: "5-Day\nMoney Back",
      subtitle: "No Questions Asked",
      details: "Not completely satisfied? Return the car within 5 days or 300 km for a 100% full refund with instant processing.",
      colorClass: "text-cyan-400 border-cyan-400/80 bg-cyan-500/20 shadow-[0_0_25px_rgba(34,211,238,0.6)]",
      ringColor: "border-cyan-400",
      accentBg: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
    },
    {
      id: 'buyback',
      icon: <RefreshCw size={22} strokeWidth={2.5} />,
      title: "Buyback\nGuarantee",
      subtitle: "Guaranteed Residual Value",
      details: "Assured buyback price lock for up to 3 years. Trade in or upgrade to another vehicle effortlessly whenever you choose.",
      colorClass: "text-indigo-400 border-indigo-400/80 bg-indigo-500/20 shadow-[0_0_25px_rgba(129,140,248,0.6)]",
      ringColor: "border-indigo-400",
      accentBg: "bg-indigo-500/20 text-indigo-300 border-indigo-500/40"
    },
    {
      id: 'fixedprice',
      icon: <BadgeIndianRupee size={22} strokeWidth={2.5} />,
      title: "Fixed Price\nAssurance",
      subtitle: "Fair Data-Driven Rate",
      details: "Transparent, non-negotiable fair pricing calculated with AI market analysis. No hidden dealer markups or extra fees.",
      colorClass: "text-[#00FFDC] border-[#00C9AF]/80 bg-[#00C9AF]/20 shadow-[0_0_25px_rgba(0,201,175,0.6)]",
      ringColor: "border-[#00C9AF]",
      accentBg: "bg-[#00C9AF]/20 text-[#00C9AF] border-[#00C9AF]/40"
    },
    {
      id: 'rsa',
      icon: <AlertTriangle size={22} strokeWidth={2.5} />,
      title: "Roadside\nAssistance",
      subtitle: "24x7 Support Across India",
      details: "Round-the-clock nationwide emergency support including towing, flat tire replacement, fuel delivery, and battery jumpstart.",
      colorClass: "text-rose-400 border-rose-400/80 bg-rose-500/20 shadow-[0_0_25px_rgba(244,63,94,0.6)]",
      ringColor: "border-rose-400",
      accentBg: "bg-rose-500/20 text-rose-300 border-rose-500/40"
    }
  ];

  return (
    <>
      <style>{`
        @keyframes radarRipple {
          0% { transform: scale(0.85); opacity: 0.7; }
          50% { transform: scale(1.18); opacity: 0.3; }
          100% { transform: scale(0.85); opacity: 0.7; }
        }
        @keyframes dynamicFloat {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-5px) scale(1.08); }
        }
        @keyframes fastGlowPulse {
          0%, 100% { filter: drop-shadow(0 0 6px currentColor); }
          50% { filter: drop-shadow(0 0 16px currentColor); }
        }
        .animate-radar-ring {
          animation: radarRipple 1.8s ease-in-out infinite;
        }
        .animate-radar-ring-delayed {
          animation: radarRipple 1.8s ease-in-out infinite 0.6s;
        }
        .animate-dynamic-float {
          animation: dynamicFloat 2.4s ease-in-out infinite;
        }
        .animate-fast-glow {
          animation: fastGlowPulse 1.5s ease-in-out infinite;
        }
      `}</style>

      <div className="mb-6 border border-slate-800 rounded-2xl p-5 lg:p-6 bg-[#0C1B33] text-white shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg md:text-xl font-bold text-white">Benefits &amp; Add-Ons</h2>
            <span className="bg-[#00C9AF] text-[#0A1C3A] text-[11px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-sm">
              <Shield size={11} fill="currentColor" className="text-[#0A1C3A]" /> Assured
            </span>
          </div>
          <span className="text-xs text-slate-400 font-semibold hidden sm:inline-block">Tap any benefit to learn more</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {benefits.map((item, idx) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedBenefit(item)}
              className="flex flex-col items-center justify-center text-center mx-auto w-full group cursor-pointer p-2 rounded-xl transition-all duration-300 active:scale-95 outline-none focus:outline-none"
            >
              {/* Icon Container with dynamic fast radar rings & float animation */}
              <div className="w-20 h-20 mb-2 relative flex items-center justify-center">
                <div className={`absolute inset-0 border-2 ${item.ringColor} opacity-50 rounded-full animate-radar-ring`} />
                <div className={`absolute inset-2 border-2 ${item.ringColor} opacity-35 rounded-full animate-radar-ring-delayed`} />
                <div className={`absolute inset-4 border-2 ${item.ringColor} opacity-25 rounded-full`} />

                {/* Inner element with fast float & neon glow pulse */}
                <div
                  className={`w-12 h-12 flex items-center justify-center relative z-10 border-2 rounded-2xl transition-all duration-300 bg-[#0A182E] animate-dynamic-float animate-fast-glow group-hover:scale-110 ${item.colorClass}`}
                  style={{ animationDelay: `${idx * 0.2}s` }}
                >
                  {item.icon}
                </div>
              </div>
              <div className="text-[13px] md:text-[13.5px] font-semibold text-white whitespace-pre-line leading-[1.35] text-center group-hover:text-[#00C9AF] transition-colors tracking-normal">
                {item.title}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Detail Modal / Sheet */}
      {selectedBenefit && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#0C1B33] border border-slate-700/80 rounded-2xl w-full max-w-md p-6 text-white relative shadow-2xl animate-in zoom-in-95 duration-200 text-left">
            <button
              onClick={() => setSelectedBenefit(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 ${selectedBenefit.colorClass}`}>
                {selectedBenefit.icon}
              </div>
              <div>
                <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded border ${selectedBenefit.accentBg}`}>
                  {selectedBenefit.subtitle}
                </span>
                <h3 className="text-lg font-bold text-white mt-1 leading-snug capitalize">
                  {selectedBenefit.title.replace('\n', ' ')}
                </h3>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed mb-6 bg-slate-900/60 p-4 rounded-xl border border-white/5">
              {selectedBenefit.details}
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
              className="w-full py-3 bg-[#00C9AF] hover:bg-[#00B4A0] text-[#0C1B33] font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-[#00C9AF]/20 active:scale-95"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </>
  );
}
