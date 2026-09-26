import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageMeta from '../components/common/PageMeta';
import {
  CheckCircle2,
  ShieldCheck,
  Zap,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Car,
  Briefcase,
  RefreshCw,
  Coins,
  BadgePercent,
  Clock,
  FileCheck2,
  TrendingDown,
  Building2,
  Banknote,
  Check
} from 'lucide-react';
import { motion } from 'framer-motion';
import EmiCalculator from '../components/shared/EmiCalculator';
import FAQ from '../components/home/FAQ';
import PageTransition from '../components/animation/PageTransition';
import SectionReveal from '../components/animation/SectionReveal';
import StaggerGroup, { StaggerItem } from '../components/animation/StaggerGroup';

const CityServicesSection = () => {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const services = [
    {
      id: 1,
      title: "Used Car Purchase Loan",
      tagline: "Up to 90% on-road funding",
      rate: "Starting 8.99% p.a.",
      icon: Car,
      gradient: "from-teal-500/20 to-emerald-500/5",
      iconColor: "text-[#00C9AF]",
      borderColor: "border-[#00C9AF]/30",
      pill: "Lowest EMI Guarantee",
      features: ["Up to 7 Years Tenure", "Instant Pre-Approval", "Minimal Paperwork"]
    },
    {
      id: 2,
      title: "Used Car Refinance",
      tagline: "Reduce your active EMI burden",
      rate: "Save up to ₹4,500/mo",
      icon: RefreshCw,
      gradient: "from-blue-500/20 to-indigo-500/5",
      iconColor: "text-blue-500",
      borderColor: "border-blue-500/30",
      pill: "Rate Reduction",
      features: ["Lower Interest Rates", "Flexible Repayment", "Zero Hidden Charges"]
    },
    {
      id: 3,
      title: "Loan Against Car",
      tagline: "Unlock cash without selling car",
      rate: "Up to 150% Car Valuation",
      icon: Banknote,
      gradient: "from-purple-500/20 to-pink-500/5",
      iconColor: "text-purple-500",
      borderColor: "border-purple-500/30",
      pill: "Instant Liquidity",
      features: ["Same-Day Disbursal", "Drive While Repaying", "Zero Prepayment Penalty"]
    },
    {
      id: 4,
      title: "Pre-Owned Top-Up Loan",
      tagline: "Quick funds on your active loan",
      rate: "Instant 1-Click Disbursal",
      icon: Coins,
      gradient: "from-amber-500/20 to-orange-500/5",
      iconColor: "text-amber-500",
      borderColor: "border-amber-500/30",
      pill: "Quick Cash",
      features: ["No Extra Documentation", "Direct Bank Credit", "Attractive ROI"]
    },
    {
      id: 5,
      title: "Loan Balance Transfer",
      tagline: "Switch to top banks effortlessly",
      rate: "Special APR Discounts",
      icon: TrendingDown,
      gradient: "from-sky-500/20 to-cyan-500/5",
      iconColor: "text-sky-500",
      borderColor: "border-sky-500/30",
      pill: "Smart Switch",
      features: ["Hassle-Free Foreclosure", "Top-Up Eligibility", "Doorstep Executive"]
    },
    {
      id: 6,
      title: "Commercial & Business Auto",
      tagline: "Fleet & self-employed financing",
      rate: "Customized Corporate ROI",
      icon: Briefcase,
      gradient: "from-emerald-500/20 to-teal-500/5",
      iconColor: "text-emerald-500",
      borderColor: "border-emerald-500/30",
      pill: "Business Fleet",
      features: ["Tax Advantage Deductions", "Fast-Track Processing", "Customized Schedules"]
    }
  ];

  // Automatic Smooth Card Rotation Timer
  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setActiveIdx(prev => (prev === services.length - 1 ? 0 : prev + 1));
    }, 2800);
    return () => clearInterval(timer);
  }, [isHovered, services.length]);

  const handlePrev = () => {
    setActiveIdx(prev => (prev === 0 ? services.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIdx(prev => (prev === services.length - 1 ? 0 : prev + 1));
  };

  return (
    <section className="py-16 lg:py-24 bg-[#F8FAFC] overflow-hidden relative border-t border-slate-200/80 text-slate-800">
      <PageMeta
        title="Used Car Loan in Mumbai — Low EMI, Instant Approval | Selectt"
        description="Get a used car loan in Mumbai with the lowest EMI and instant approval. Up to 90% on-road financing, flexible tenure up to 7 years, and minimal documentation with top partner banks."
        canonical="/used-car-loan"
      />
      {/* Background Subtle Gradient Glow */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-[#00C9AF]/5 rounded-full filter blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 bg-blue-500/5 rounded-full filter blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">

          {/* Left Column: Heading, Subtext, Trust Highlights */}
          <div className="lg:col-span-5 space-y-6 text-center lg:text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#00C9AF]/10 text-[#00a892] border border-[#00C9AF]/20">
              <Building2 size={13} /> Selectt Financial Suite
            </span>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0C1B33] leading-tight tracking-tight">
              Tailored car financing <br className="hidden sm:block" />
              <span className="text-slate-500 font-normal">for every need.</span>
            </h2>

            <p className="text-slate-600 font-normal text-sm sm:text-base leading-relaxed max-w-md mx-auto lg:mx-0">
              Whether you are purchasing your next vehicle, refinancing an existing loan, or unlocking liquidity, our network of 12+ partner banks provides the lowest rate guarantees.
            </p>

            <div className="space-y-3 pt-1 text-left max-w-sm mx-auto lg:mx-0">
              <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-slate-700">
                <div className="w-5 h-5 rounded-full bg-teal-50 text-[#00a892] flex items-center justify-center shrink-0 border border-teal-100">
                  <Check size={12} strokeWidth={3} />
                </div>
                <span>Pre-approved quotes without credit score impact</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-slate-700">
                <div className="w-5 h-5 rounded-full bg-teal-50 text-[#00a892] flex items-center justify-center shrink-0 border border-teal-100">
                  <Check size={12} strokeWidth={3} />
                </div>
                <span>Same-day digital disbursals directly to seller</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-slate-700">
                <div className="w-5 h-5 rounded-full bg-teal-50 text-[#00a892] flex items-center justify-center shrink-0 border border-teal-100">
                  <Check size={12} strokeWidth={3} />
                </div>
                <span>100% paperless documentation assistance</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  window.scrollTo({ top: 400, behavior: 'smooth' });
                }}
                className="bg-[#0C1B33] hover:bg-[#081324] text-white px-7 py-3 rounded-xl font-bold text-xs uppercase tracking-wider shadow-sm transition-all duration-200 cursor-pointer inline-flex items-center gap-2"
              >
                <span>Calculate EMI & Eligibility</span>
                <ArrowRight size={14} className="text-[#00C9AF]" />
              </button>
            </div>
          </div>

          {/* Right Column: 3D Stacked Card Fan Carousel */}
          <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="lg:col-span-7 relative flex flex-col items-center justify-center min-h-[380px]"
          >
            <div className="flex items-center justify-center w-full max-w-xl gap-2 sm:gap-4">

              {/* Left Chevron Nav Arrow */}
              <button
                onClick={handlePrev}
                className="w-10 h-10 rounded-full bg-white border border-slate-200/80 shadow-xs flex items-center justify-center text-slate-700 hover:text-[#00C9AF] hover:border-[#00C9AF]/40 transition-all cursor-pointer z-40 shrink-0"
                aria-label="Previous loan product"
              >
                <ChevronLeft size={20} strokeWidth={2.5} />
              </button>

              {/* Stacked Fan Cards Container */}
              <div className="relative w-[240px] sm:w-[270px] h-[350px] sm:h-[370px] flex items-center justify-center">
                {services.map((item, idx) => {
                  const total = services.length;
                  let offset = idx - activeIdx;
                  
                  // Wrap offset around circular array
                  if (offset < -Math.floor(total / 2)) offset += total;
                  if (offset > Math.floor(total / 2)) offset -= total;

                  const isCenter = offset === 0;
                  const isVisible = Math.abs(offset) <= 2; // Show 5 cards stacked cleanly

                  if (!isVisible) return null;

                  // Fluid Fan-Out Transform Math
                  const translateX = offset * 28;
                  const translateY = Math.abs(offset) * 4;
                  const rotateDeg = offset * 4;
                  const scale = isCenter ? 1.02 : 1 - Math.abs(offset) * 0.04;
                  const zIndex = 40 - Math.abs(offset);
                  const IconComponent = item.icon;

                  return (
                    <div
                      key={item.id}
                      onClick={() => setActiveIdx(idx)}
                      style={{
                        transform: `translateX(${translateX}px) translateY(${translateY}px) rotate(${rotateDeg}deg) scale(${scale})`,
                        zIndex,
                      }}
                      className={`absolute top-0 left-0 w-full h-full bg-white rounded-2xl border flex flex-col justify-between overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer select-none ${
                        isCenter
                          ? 'border-[#00C9AF]/50 shadow-[0_20px_45px_-10px_rgba(12,27,51,0.18)] ring-1 ring-[#00C9AF]/30'
                          : 'border-slate-200/90 shadow-md opacity-85 hover:opacity-100'
                      }`}
                    >
                      {/* Top Header Strip */}
                      <div className="p-5 pb-0 text-left space-y-3">
                        <div className="flex items-center justify-between">
                          <div className={`w-10 h-10 rounded-xl bg-slate-50 border ${item.borderColor} flex items-center justify-center ${item.iconColor} shadow-xs`}>
                            <IconComponent size={20} strokeWidth={2} />
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200/60">
                            {item.pill}
                          </span>
                        </div>

                        <div>
                          <h3 className="text-base font-bold text-slate-900 leading-snug">
                            {item.title}
                          </h3>
                          <p className="text-xs text-slate-500 font-normal mt-0.5">
                            {item.tagline}
                          </p>
                        </div>
                      </div>

                      {/* Middle Feature Highlights */}
                      <div className="px-5 py-2 space-y-2">
                        <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-100">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Offer Benchmark</span>
                          <span className="text-xs font-bold text-[#00a892] mt-0.5 block">{item.rate}</span>
                        </div>

                        <div className="space-y-1.5 pt-1">
                          {item.features.map((feat, fIdx) => (
                            <div key={fIdx} className="flex items-center gap-2 text-[11px] font-medium text-slate-600">
                              <CheckCircle2 size={12} className="text-[#00a892] shrink-0" />
                              <span>{feat}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Bottom Button */}
                      <div className="p-4 pt-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.scrollTo({ top: 400, behavior: 'smooth' });
                          }}
                          className={`w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                            isCenter
                              ? 'bg-[#0C1B33] hover:bg-[#081324] text-[#00C9AF]'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          <span>Apply Now</span>
                          <ArrowRight size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right Chevron Nav Arrow */}
              <button
                onClick={handleNext}
                className="w-10 h-10 rounded-full bg-white border border-slate-200/80 shadow-xs flex items-center justify-center text-slate-700 hover:text-[#00C9AF] hover:border-[#00C9AF]/40 transition-all cursor-pointer z-40 shrink-0"
                aria-label="Next loan product"
              >
                <ChevronRight size={20} strokeWidth={2.5} />
              </button>
            </div>

            {/* Pagination Indicator Dots */}
            <div className="flex items-center gap-1.5 mt-6 z-40">
              {services.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIdx(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    activeIdx === i
                      ? 'w-6 bg-[#00a892]'
                      : 'w-2 bg-slate-300 hover:bg-slate-400'
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};

const UsedCarLoanPage = () => {
  const [showSticky, setShowSticky] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);

    document.title = "Used Car Loan & Auto Financing - Pre-Approved Loans on Selectt";
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = "description";
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = "Get instant pre-approved used car loans on Selectt. Compare interest rates, calculate loan EMIs, and enjoy paperless digital approvals with zero hidden charges.";

    const handleScroll = () => {
      setShowSticky(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const partners = [
    { name: "HDFC Bank", logo: "/img/hdfc_v2.jpg" },
    { name: "ICICI Bank", logo: "/img/icici_v2.jpg" },
    { name: "IDFC FIRST Bank", logo: "/img/idfc_v2.jpg" },
    { name: "Axis Bank", logo: "/img/axis_v2.jpg" },
    { name: "Kotak Mahindra Bank", logo: "/img/kotak_v2.jpg" },
    { name: "AU Small Finance Bank", logo: "/img/au_v2.jpg" },
    { name: "Canara Bank", logo: "/img/canara_bank.png" },
    { name: "Bajaj Finance", logo: "/img/bajaj-finance_v2.jpg" },
    { name: "IndusInd Bank", logo: "/img/indusind_v2.jpg" },
    { name: "Mahindra Finance", logo: "/img/mahindra-finance_v2.jpg" },
    { name: "Piramal Finance", logo: "/img/piramal_v2.jpg" },
    { name: "TVS Credit", logo: "/img/tvs_v2.jpg" },
  ];

  return (
    <PageTransition className="min-h-screen bg-[#F8FAFC] font-sans w-full overflow-x-hidden pb-16 text-slate-800 antialiased selection:bg-[#00C9AF]/20 selection:text-[#0C1B33]">

      {/* ───────────── Hero Section ───────────── */}
      <section className="relative pt-20 pb-44 bg-[#0C1B33] border-b border-slate-800 overflow-hidden text-center">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0c1b33] via-[#0a162a] to-[#060d19] z-0"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#00C9AF] rounded-full mix-blend-screen filter blur-[140px] opacity-20 animate-pulse z-0"></div>
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-purple-600 rounded-full mix-blend-screen filter blur-[120px] opacity-15 z-0"></div>

        <SectionReveal className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10 space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#00C9AF]/15 text-[#00C9AF] border border-[#00C9AF]/20 w-fit mx-auto">
            <ShieldCheck size={14} /> Instant Pre-Approved Financing
          </span>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Financing made effortless <br className="hidden sm:block" />
            <span className="text-[#00C9AF]">for every car buyer.</span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base font-normal max-w-xl mx-auto leading-relaxed">
            Experience 100% paperless digital verification, lowest industry interest rates, and same-day disbursal with 12+ leading banking partners.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6 pt-3 text-xs sm:text-sm font-medium text-slate-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-[#00C9AF]" /> Zero hidden processing charges
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-[#00C9AF]" /> Approvals within 2 hours
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-[#00C9AF]" /> Up to 90% on-road funding
            </div>
          </div>
        </SectionReveal>
      </section>

      {/* ───────────── Floating EMI Calculator ───────────── */}
      <SectionReveal amount={0.3} className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 -mt-28 mb-16">
        <EmiCalculator price={800000} theme="white" className="shadow-xl shadow-slate-900/5 rounded-2xl border border-slate-200/80" />
      </SectionReveal>

      {/* ───────────── 4-Step Process ───────────── */}
      <section className="py-16 sm:py-20 bg-white relative overflow-hidden border-t border-slate-200/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative">
          <SectionReveal className="text-center max-w-xl mx-auto mb-14">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#00a892] mb-1.5 block">
              Transparent Workflow
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Get approved in 4 simple steps
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm font-normal mt-1.5 leading-relaxed">
              Fast, paperless digital verification designed to put you behind the wheel on the same day.
            </p>
          </SectionReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Step 1 */}
            <div className="bg-[#F8FAFC] p-6 rounded-2xl border border-slate-200/80 shadow-xs text-left space-y-3 relative group hover:border-slate-300 transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#0C1B33] text-[#00C9AF] flex items-center justify-center font-bold text-sm">
                01
              </div>
              <h3 className="text-base font-bold text-slate-900">Check Eligibility</h3>
              <p className="text-slate-500 text-xs font-normal leading-relaxed">
                Check pre-approved loan amounts and rates online in 2 minutes without affecting your credit score.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-[#F8FAFC] p-6 rounded-2xl border border-slate-200/80 shadow-xs text-left space-y-3 relative group hover:border-slate-300 transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#0C1B33] text-[#00C9AF] flex items-center justify-center font-bold text-sm">
                02
              </div>
              <h3 className="text-base font-bold text-slate-900">Digital KYC</h3>
              <p className="text-slate-500 text-xs font-normal leading-relaxed">
                Upload your KYC documents online for paperless verification by our automated credit underwriting system.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-[#F8FAFC] p-6 rounded-2xl border border-slate-200/80 shadow-xs text-left space-y-3 relative group hover:border-slate-300 transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#0C1B33] text-[#00C9AF] flex items-center justify-center font-bold text-sm">
                03
              </div>
              <h3 className="text-base font-bold text-slate-900">Instant Sanction</h3>
              <p className="text-slate-500 text-xs font-normal leading-relaxed">
                Select your preferred loan tenure and sanction letter issued on the same day by partner banks.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-[#F8FAFC] p-6 rounded-2xl border border-slate-200/80 shadow-xs text-left space-y-3 relative group hover:border-slate-300 transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#0C1B33] text-[#00C9AF] flex items-center justify-center font-bold text-sm">
                04
              </div>
              <h3 className="text-base font-bold text-slate-900">Drive Home</h3>
              <p className="text-slate-500 text-xs font-normal leading-relaxed">
                Loan funds are disbursed directly, and your certified Selectt Assured car is delivered to your doorstep.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── CTA Banner ───────────── */}
      <SectionReveal className="my-14 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl overflow-hidden bg-[#0C1B33] border border-slate-800 p-8 sm:p-10 text-white text-left flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
          <div className="space-y-2 max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#00C9AF]/15 text-[#00C9AF] border border-[#00C9AF]/20">
              <Sparkles size={12} /> Selectt Assured Advantage
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Ready to find your dream car?
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm font-normal leading-relaxed">
              Explore 5,000+ certified pre-owned vehicles with fixed price locks, 200-point inspection certificates, and instant loan approvals.
            </p>
          </div>

          <div className="shrink-0">
            <Link
              to="/buy-cars"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#00C9AF] hover:bg-[#00b29c] text-[#0C1B33] font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-xs"
            >
              <span>Browse Certified Cars</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </SectionReveal>

      {/* ───────────── Finance Banking Partners ───────────── */}
      <SectionReveal amount={0.25} className="py-16 bg-white border-t border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Banking Network
          </span>
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mb-8">
            Trusted Lending Partners
          </h3>
          <StaggerGroup className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {partners.map((p, i) => (
              <StaggerItem key={i}>
                <div 
                  className="h-20 bg-white rounded-xl border border-slate-200/90 flex items-center justify-center p-3.5 hover:border-slate-300 hover:shadow-xs transition-all"
                >
                  <img src={p.logo} alt={p.name} className="max-h-11 max-w-full object-contain transition-transform duration-200 hover:scale-105" />
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </SectionReveal>

      {/* ───────────── Team Selectt Financial Services 3D Card Stack Carousel ───────────── */}
      <CityServicesSection />

      {/* ───────────── FAQ ───────────── */}
      <section className="py-12 relative overflow-hidden">
        <FAQ dark={false} />
      </section>

    </PageTransition>
  );
};

export default UsedCarLoanPage;

