import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  RefreshCcw,
  Calendar,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  ArrowRight,
  Car,
  BadgeCheck,
  Percent,
  Clock,
  Sparkles,
  Check,
  HelpCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import PageMeta from '../components/common/PageMeta';
import FAQ from '../components/home/FAQ';
import NeedAssistanceSection from '../components/common/NeedAssistanceSection';

export default function SelecttBuybackPage() {
  const [activeTenure, setActiveTenure] = useState('18');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const tenures = [
    {
      months: '12',
      title: '12 Months Tenure',
      value: 'Up to 75%',
      subtitle: 'Guaranteed Buyback Price',
      desc: 'Ideal for short-term relocations or those who like driving the latest car models every year.',
      benefits: ['Maximum upfront value assurance', 'Zero hassle ownership transfer', 'Immediate upgrade option']
    },
    {
      months: '18',
      title: '18 Months Tenure',
      value: 'Up to 65%',
      subtitle: 'Guaranteed Buyback Price',
      desc: 'Our most popular plan offering the optimal balance between driving freedom and resale return.',
      benefits: ['Pre-agreed lock-in price', 'Comprehensive warranty included', 'Free annual health check']
    },
    {
      months: '36',
      title: '36 Months Tenure',
      value: 'Up to 50%',
      subtitle: 'Guaranteed Buyback Price',
      desc: 'Perfect for long-term peace of mind with total protection against market depreciation.',
      benefits: ['Long-term price protection', 'No market haggling anxiety', 'Guaranteed exit whenever ready']
    }
  ];

  return (
    <>
      <PageMeta
        title="Selectt BuyBack - Guaranteed Future Resale & Easy Upgrades | Selectt"
        description="Drive with complete freedom. Get a guaranteed future buyback price locked in upfront for 12, 18, or 36 months on any Selectt Assured car."
      />
      
      <div className="min-h-screen bg-[#F8FAFC] font-sans w-full overflow-x-hidden text-slate-800 antialiased selection:bg-[#00C9AF]/20 selection:text-[#0C1B33]">

        {/* ───────────── Hero Section ───────────── */}
        <section className="relative pt-16 lg:pt-24 pb-24 overflow-hidden bg-[#0C1B33] border-b border-slate-800">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0c1b33] via-[#0a162a] to-[#060d19] z-0"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#00C9AF] rounded-full mix-blend-screen filter blur-[140px] opacity-25 animate-pulse z-0"></div>
          <div className="absolute bottom-0 left-10 w-80 h-80 bg-purple-600 rounded-full mix-blend-screen filter blur-[120px] opacity-20 z-0"></div>

          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 px-3.5 py-1.5 rounded-full text-[#00C9AF] font-bold text-xs uppercase tracking-wider backdrop-blur-md mb-3.5">
                <RefreshCcw size={14} className="text-[#00C9AF]" />
                Selectt Buyback Guarantee
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight mb-3.5">
                Assured future resale value & effortless upgrades
              </h1>
              
              <p className="text-slate-300 text-base sm:text-lg font-normal leading-relaxed max-w-2xl mx-auto mb-8">
                Know your car's exact buyback value upfront before you purchase. Enjoy driving with zero depreciation anxiety for 12, 18, or 36 months.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/buy-cars"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#00C9AF] hover:bg-[#00b29c] text-[#0C1B33] font-bold py-3.5 px-8 rounded-xl shadow-xs transition-all text-xs uppercase tracking-wider cursor-pointer"
                >
                  Explore Buyback-Eligible Cars <ArrowRight size={15} />
                </Link>
                <a
                  href="#how-it-works"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white border border-white/15 font-bold py-3.5 px-6 rounded-xl transition-all text-xs tracking-wider"
                >
                  How Buyback Works
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ───────────── Core Pillar Highlights ───────────── */}
        <section className="py-20 bg-white border-b border-slate-200/80">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="inline-block text-xs font-bold uppercase tracking-wider text-[#00a892] bg-[#00C9AF]/10 px-3 py-1 rounded-full border border-[#00C9AF]/20 mb-3.5">
                Core Advantages
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-3.5">
                Why smart buyers choose Selectt Buyback
              </h2>
              <p className="text-slate-500 text-sm font-normal leading-relaxed">
                Enjoy transparent terms and predictable resale valuation right from day one.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-7 sm:p-8 rounded-2xl bg-slate-50/60 border border-slate-200/80 text-left hover:border-slate-300 transition-all">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5 border border-emerald-100">
                  <ShieldCheck size={22} />
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-2.5">Guaranteed Locked-in Price</h3>
                <p className="text-slate-500 text-xs font-normal leading-relaxed">
                  Your car's future resale value is calculated and printed on your purchase invoice on Day 1. No surprises or market swings.
                </p>
              </div>

              <div className="p-7 sm:p-8 rounded-2xl bg-slate-50/60 border border-slate-200/80 text-left hover:border-slate-300 transition-all">
                <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-5 border border-sky-100">
                  <TrendingUp size={22} />
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-2.5">Seamless Model Upgrades</h3>
                <p className="text-slate-500 text-xs font-normal leading-relaxed">
                  Switch from a hatchback to a compact SUV or sedan whenever your family needs grow by rolling your buyback equity directly into the next car.
                </p>
              </div>

              <div className="p-7 sm:p-8 rounded-2xl bg-slate-50/60 border border-slate-200/80 text-left hover:border-slate-300 transition-all">
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-5 border border-purple-100">
                  <Calendar size={22} />
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-2.5">Flexible Tenures</h3>
                <p className="text-slate-500 text-xs font-normal leading-relaxed">
                  Select between 12, 18, or 36 months tenure based on your career plans, family requirements, or relocation timelines.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ───────────── Interactive Tenure Plans ───────────── */}
        <section className="py-20 bg-[#F8FAFC] border-b border-slate-200/80">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3.5">Choose Your Plan</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-3.5">
                Guaranteed Buyback Tenures
              </h2>
              <p className="text-slate-500 text-sm font-normal leading-relaxed">
                Clear percentages locked into your purchase agreement.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {tenures.map((t) => {
                const isSelected = activeTenure === t.months;
                return (
                  <div
                    key={t.months}
                    onClick={() => setActiveTenure(t.months)}
                    className={`bg-white rounded-2xl p-7 sm:p-8 border transition-all cursor-pointer flex flex-col justify-between text-left shadow-xs ${
                      isSelected
                        ? 'border-[#00C9AF] ring-2 ring-[#00C9AF]/15'
                        : 'border-slate-200/80 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-5">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                          {t.title}
                        </span>
                        {isSelected && (
                          <span className="w-6 h-6 rounded-full bg-[#00C9AF] text-[#0C1B33] flex items-center justify-center font-bold text-xs">
                            <Check size={14} className="stroke-[3]" />
                          </span>
                        )}
                      </div>

                      <div className="mb-5">
                        <div className="text-3xl font-extrabold text-[#0C1B33] tracking-tight">{t.value}</div>
                        <div className="text-xs text-slate-400 font-medium mt-1">{t.subtitle}</div>
                      </div>

                      <p className="text-xs text-slate-600 font-normal leading-relaxed mb-6">
                        {t.desc}
                      </p>

                      <div className="space-y-3 border-t border-slate-100 pt-5">
                        {t.benefits.map((b, idx) => (
                          <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-600 font-medium">
                            <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                            <span>{b}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-6 mt-5">
                      <Link
                        to={`/buy-cars?buyback=${t.months}`}
                        className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all block text-center ${
                          isSelected
                            ? 'bg-[#0C1B33] text-white hover:bg-[#162a4d]'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80'
                        }`}
                      >
                        Browse {t.months}M Cars
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ───────────── How It Works (3 Steps) ───────────── */}
        <section id="how-it-works" className="py-20 bg-white border-b border-slate-200/80">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3.5">Simple Process</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-3.5">
                How Selectt Buyback Works
              </h2>
              <p className="text-slate-500 text-sm font-normal leading-relaxed">
                Enjoy your car today with a guaranteed exit strategy tomorrow.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border border-slate-200/80 rounded-2xl p-7 sm:p-8 bg-slate-50/50 text-left">
                <div className="w-9 h-9 rounded-lg bg-[#0C1B33] text-white flex items-center justify-center font-bold text-xs mb-5">
                  01
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-2.5">Choose & Lock Buyback</h3>
                <p className="text-slate-500 text-xs font-normal leading-relaxed">
                  Pick any certified car on Selectt and opt for your preferred buyback tenure (12, 18, or 36 months) during checkout.
                </p>
              </div>

              <div className="border border-slate-200/80 rounded-2xl p-7 sm:p-8 bg-slate-50/50 text-left">
                <div className="w-9 h-9 rounded-lg bg-[#0C1B33] text-white flex items-center justify-center font-bold text-xs mb-5">
                  02
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-2.5">Drive with Complete Freedom</h3>
                <p className="text-slate-500 text-xs font-normal leading-relaxed">
                  Enjoy your vehicle with full self-ownership, comprehensive warranty coverage, and zero per-kilometer restrictions.
                </p>
              </div>

              <div className="border border-slate-200/80 rounded-2xl p-7 sm:p-8 bg-slate-50/50 text-left">
                <div className="w-9 h-9 rounded-lg bg-[#00C9AF] text-[#0C1B33] flex items-center justify-center font-bold text-xs mb-5">
                  03
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-2.5">Return, Upgrade, or Keep</h3>
                <p className="text-slate-500 text-xs font-normal leading-relaxed">
                  At the end of tenure, either return the car for instant pre-agreed bank payout, upgrade to a newer model, or retain ownership.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ───────────── Need Further Assistance Section ───────────── */}
        <NeedAssistanceSection />

        {/* ───────────── FAQ Section ───────────── */}
        <FAQ dark={false} />

      </div>
    </>
  );
}

