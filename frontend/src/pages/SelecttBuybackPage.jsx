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
import { motion } from 'framer-motion';
import PageMeta from '../components/common/PageMeta';
import FAQ from '../components/home/FAQ';
import NeedAssistanceSection from '../components/common/NeedAssistanceSection';

export default function SelecttBuybackPage() {
  const [activeTenure, setActiveTenure] = useState('18');

  const [isMobile, setIsMobile] = useState(() => (typeof window !== 'undefined' ? window.innerWidth < 1024 : false));

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getAlternatingCardMotion = (idx) => {
    if (isMobile) {
      const isFromLeft = idx % 2 === 0;
      return {
        initial: { opacity: 0, x: isFromLeft ? -35 : 35 },
        whileInView: { opacity: 1, x: 0 },
        viewport: { once: false, amount: 0.1 },
        transition: { duration: 0.85, ease: [0.16, 1, 0.3, 1], delay: 0.03 },
        whileHover: { y: -4, scale: 1.01, transition: { duration: 0.15, ease: 'easeOut' } },
        whileTap: { scale: 0.98 }
      };
    }
    return {
      initial: { opacity: 0, y: 30 },
      whileInView: { opacity: 1, y: 0 },
      viewport: { once: false, amount: 0.12 },
      transition: { duration: 0.85, ease: [0.16, 1, 0.3, 1], delay: idx * 0.08 },
      whileHover: { y: -4, scale: 1.01, transition: { duration: 0.15, ease: 'easeOut' } },
      whileTap: { scale: 0.98 }
    };
  };

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
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 px-3.5 py-1.5 rounded-full text-[#00C9AF] font-semibold text-[12px] leading-[1.4] backdrop-blur-md mb-3.5">
                <RefreshCcw size={14} className="text-[#00C9AF]" />
                Selectt buyback guarantee
              </div>
              
              <h1 className="text-[28px] sm:text-[40px] lg:text-[48px] font-heading font-semibold text-white leading-[1.2] mb-3.5">
                Assured future resale value & effortless upgrades
              </h1>
              
              <p className="text-[#CBD5E1] text-[17px] sm:text-[18px] font-normal leading-[1.6] max-w-2xl mx-auto mb-8">
                Know your car's exact buyback value upfront before you purchase. Enjoy driving with zero depreciation anxiety for 12, 18, or 36 months.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/buy-cars"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#00C9AF] hover:bg-[#00b29c] text-slate-950 font-semibold py-3.5 px-8 rounded-xl shadow-xs transition-all text-[15px] leading-[1.45] cursor-pointer"
                >
                  Explore buyback-eligible cars <ArrowRight size={16} />
                </Link>
                <a
                  href="#how-it-works"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white border border-white/15 font-semibold py-3.5 px-6 rounded-xl transition-all text-[15px] leading-[1.45]"
                >
                  How buyback works
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ───────────── Core Pillar Highlights ───────────── */}
        <section className="py-20 bg-white border-b border-slate-200/80">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="inline-block text-[12px] font-medium text-[#008A79] bg-[#00C9AF]/10 px-3 py-1 rounded-full border border-[#00C9AF]/20 mb-3.5 leading-[1.4]">
                Core advantages
              </span>
              <h2 className="text-[28px] sm:text-[40px] font-heading font-semibold text-[#0F172A] leading-[1.2] mb-3.5">
                Why smart buyers choose Selectt buyback
              </h2>
              <p className="text-[#475569] text-[17px] sm:text-[18px] font-normal leading-[1.6]">
                Enjoy transparent terms and predictable resale valuation right from day one.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-7 sm:p-8 rounded-2xl bg-slate-50/60 border border-slate-200/80 text-left hover:border-slate-300 transition-all">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5 border border-emerald-100">
                  <ShieldCheck size={22} />
                </div>
                <h3 className="font-heading font-semibold text-[#0F172A] text-[20px] sm:text-[21px] mb-2.5 leading-[1.35]">Guaranteed locked-in price</h3>
                <p className="text-[#475569] text-[16px] sm:text-[17px] font-normal leading-[1.6]">
                  Your car's future resale value is calculated and printed on your purchase invoice on Day 1. No surprises or market swings.
                </p>
              </div>

              <div className="p-7 sm:p-8 rounded-2xl bg-slate-50/60 border border-slate-200/80 text-left hover:border-slate-300 transition-all">
                <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-5 border border-sky-100">
                  <TrendingUp size={22} />
                </div>
                <h3 className="font-heading font-semibold text-[#0F172A] text-[20px] sm:text-[21px] mb-2.5 leading-[1.35]">Seamless model upgrades</h3>
                <p className="text-[#475569] text-[16px] sm:text-[17px] font-normal leading-[1.6]">
                  Switch from a hatchback to a compact SUV or sedan whenever your family needs grow by rolling your buyback equity directly into the next car.
                </p>
              </div>

              <div className="p-7 sm:p-8 rounded-2xl bg-slate-50/60 border border-slate-200/80 text-left hover:border-slate-300 transition-all">
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-5 border border-purple-100">
                  <Calendar size={22} />
                </div>
                <h3 className="font-heading font-semibold text-[#0F172A] text-[20px] sm:text-[21px] mb-2.5 leading-[1.35]">Flexible tenures</h3>
                <p className="text-[#475569] text-[16px] sm:text-[17px] font-normal leading-[1.6]">
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
              <span className="inline-block text-[12px] font-medium text-slate-500 mb-3.5">Choose your plan</span>
              <h2 className="text-[28px] sm:text-[40px] font-heading font-semibold text-[#0F172A] leading-[1.2] mb-3.5">
                Guaranteed buyback tenures
              </h2>
              <p className="text-[#475569] text-[17px] sm:text-[18px] font-normal leading-[1.6]">
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
                        <span className="text-[12px] font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md leading-[1.4]">
                          {t.title}
                        </span>
                        {isSelected && (
                          <span className="w-6 h-6 rounded-full bg-[#00C9AF] text-slate-950 flex items-center justify-center font-bold text-xs">
                            <Check size={14} className="stroke-[3]" />
                          </span>
                        )}
                      </div>

                      <div className="mb-5">
                        <div className="text-3xl font-heading font-bold text-[#0F172A] tracking-tight">{t.value}</div>
                        <div className="text-[13px] text-slate-500 font-medium mt-1">{t.subtitle}</div>
                      </div>

                      <p className="text-[15px] sm:text-[16px] text-[#475569] font-normal leading-[1.6] mb-6">
                        {t.desc}
                      </p>

                      <div className="space-y-3 border-t border-slate-100 pt-5">
                        {t.benefits.map((b, idx) => (
                          <div key={idx} className="flex items-center gap-2.5 text-[14px] text-slate-600 font-medium">
                            <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                            <span>{b}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-6 mt-5">
                      <Link
                        to={`/buy-cars?buyback=${t.months}`}
                        className={`w-full py-3 rounded-xl font-semibold text-[15px] leading-[1.45] transition-all block text-center ${
                          isSelected
                            ? 'bg-[#0C1B33] text-white hover:bg-[#162a4d]'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80'
                        }`}
                      >
                        Browse {t.months}M cars
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ───────────── How It Works (3 Steps) ───────────── */}
        <section id="how-it-works" className="py-20 bg-white border-b border-slate-200/80 overflow-hidden">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="inline-block text-[12px] font-medium text-slate-500 mb-3.5">Simple process</span>
              <h2 className="text-[28px] sm:text-[40px] font-heading font-semibold text-[#0F172A] leading-[1.2] mb-3.5">
                How Selectt buyback works
              </h2>
              <p className="text-[#475569] text-[17px] sm:text-[18px] font-normal leading-[1.6]">
                Enjoy your car today with a guaranteed exit strategy tomorrow.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                {...getAlternatingCardMotion(0)}
                className="border border-slate-200/80 rounded-2xl p-7 sm:p-8 bg-slate-50/50 text-left cursor-pointer"
              >
                <div className="w-9 h-9 rounded-lg bg-[#0C1B33] text-white flex items-center justify-center font-bold text-xs mb-5">
                  01
                </div>
                <h3 className="font-heading font-semibold text-[#0F172A] text-[18px] sm:text-[20px] mb-2.5 leading-[1.35]">Choose & lock buyback</h3>
                <p className="text-[#475569] text-[15px] sm:text-[16px] font-normal leading-[1.6]">
                  Pick any certified car on Selectt and opt for your preferred buyback tenure (12, 18, or 36 months) during checkout.
                </p>
              </motion.div>

              <motion.div
                {...getAlternatingCardMotion(1)}
                className="border border-slate-200/80 rounded-2xl p-7 sm:p-8 bg-slate-50/50 text-left cursor-pointer"
              >
                <div className="w-9 h-9 rounded-lg bg-[#0C1B33] text-white flex items-center justify-center font-bold text-xs mb-5">
                  02
                </div>
                <h3 className="font-heading font-semibold text-[#0F172A] text-[18px] sm:text-[20px] mb-2.5 leading-[1.35]">Drive with complete freedom</h3>
                <p className="text-[#475569] text-[15px] sm:text-[16px] font-normal leading-[1.6]">
                  Enjoy your vehicle with full self-ownership, comprehensive warranty coverage, and zero per-kilometer restrictions.
                </p>
              </motion.div>

              <motion.div
                {...getAlternatingCardMotion(2)}
                className="border border-slate-200/80 rounded-2xl p-7 sm:p-8 bg-slate-50/50 text-left cursor-pointer"
              >
                <div className="w-9 h-9 rounded-lg bg-[#00C9AF] text-[#0C1B33] flex items-center justify-center font-bold text-xs mb-5">
                  03
                </div>
                <h3 className="font-heading font-semibold text-[#0F172A] text-[18px] sm:text-[20px] mb-2.5 leading-[1.35]">Return, upgrade, or keep</h3>
                <p className="text-[#475569] text-[15px] sm:text-[16px] font-normal leading-[1.6]">
                  At the end of tenure, either return the car for instant pre-agreed bank payout, upgrade to a newer model, or retain ownership.
                </p>
              </motion.div>
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

