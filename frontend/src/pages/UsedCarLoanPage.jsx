import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  ShieldCheck,
  Zap,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import EmiCalculator from '../components/shared/EmiCalculator';
import FAQ from '../components/home/FAQ';
import PageTransition from '../components/animation/PageTransition';
import SectionReveal from '../components/animation/SectionReveal';
import StaggerGroup, { StaggerItem } from '../components/animation/StaggerGroup';
import AnimatedButton from '../components/animation/AnimatedButton';

const CityServicesSection = () => {
  const [activeIdx, setActiveIdx] = useState(3);
  const [isHovered, setIsHovered] = useState(false);

  const services = [
    {
      id: 1,
      title: "Business Loan",
      illustration: (
        <svg viewBox="0 0 160 120" className="w-36 h-32 object-contain">
          {/* Briefcase */}
          <rect x="35" y="42" width="90" height="62" rx="10" fill="#B47B57" stroke="#1E1E1E" strokeWidth="3.5" />
          <path d="M60 42 V32 C60 28 64 24 68 24 H92 C96 24 100 28 100 32 V42" fill="none" stroke="#1E1E1E" strokeWidth="3.5" strokeLinecap="round" />
          {/* Straps */}
          <line x1="55" y1="42" x2="55" y2="104" stroke="#1E1E1E" strokeWidth="3" />
          <line x1="105" y1="42" x2="105" y2="104" stroke="#1E1E1E" strokeWidth="3" />
          {/* Buckles */}
          <rect x="51" y="60" width="8" height="12" rx="2" fill="#FDE047" stroke="#1E1E1E" strokeWidth="2" />
          <rect x="101" y="60" width="8" height="12" rx="2" fill="#FDE047" stroke="#1E1E1E" strokeWidth="2" />
          {/* Lock latch */}
          <rect x="75" y="55" width="10" height="7" rx="2" fill="#FDE047" stroke="#1E1E1E" strokeWidth="2" />
          {/* Gold Coin */}
          <g transform="translate(100, 10)">
            <circle cx="22" cy="22" r="18" fill="#FACC15" stroke="#1E1E1E" strokeWidth="3.5" />
            <circle cx="22" cy="22" r="14" fill="#FDE047" stroke="#1E1E1E" strokeWidth="2" />
            <text x="17" y="29" fill="#1E1E1E" fontSize="20" fontWeight="900">$</text>
          </g>
        </svg>
      )
    },
    {
      id: 2,
      title: "Loan Against Car",
      illustration: (
        <svg viewBox="0 0 160 120" className="w-36 h-32 object-contain">
          {/* Car */}
          <rect x="25" y="55" width="110" height="35" rx="10" fill="#EF4444" stroke="#1E1E1E" strokeWidth="3.5" />
          <path d="M45 55 L60 32 L100 32 L115 55 Z" fill="#F87171" stroke="#1E1E1E" strokeWidth="3.5" />
          <circle cx="48" cy="90" r="12" fill="#1E293B" stroke="#1E1E1E" strokeWidth="3" />
          <circle cx="48" cy="90" r="5" fill="#94A3B8" />
          <circle cx="112" cy="90" r="12" fill="#1E293B" stroke="#1E1E1E" strokeWidth="3" />
          <circle cx="112" cy="90" r="5" fill="#94A3B8" />
          <circle cx="132" cy="68" r="4" fill="#FDE047" />
          {/* Loan Tag */}
          <g transform="translate(68, 10) rotate(12)">
            <rect x="0" y="0" width="56" height="32" rx="6" fill="#F97316" stroke="#1E1E1E" strokeWidth="2.5" />
            <circle cx="10" cy="16" r="3" fill="#FFFFFF" />
            <text x="18" y="21" fill="#FFFFFF" fontSize="12" fontWeight="900">% LOAN</text>
          </g>
        </svg>
      )
    },
    {
      id: 3,
      title: "Used Car Refinance",
      illustration: (
        <svg viewBox="0 0 160 120" className="w-36 h-32 object-contain">
          {/* Car */}
          <rect x="25" y="55" width="110" height="35" rx="10" fill="#3B82F6" stroke="#1E1E1E" strokeWidth="3.5" />
          <path d="M45 55 L60 32 L100 32 L115 55 Z" fill="#60A5FA" stroke="#1E1E1E" strokeWidth="3.5" />
          <circle cx="48" cy="90" r="12" fill="#1E293B" stroke="#1E1E1E" strokeWidth="3" />
          <circle cx="48" cy="90" r="5" fill="#94A3B8" />
          <circle cx="112" cy="90" r="12" fill="#1E293B" stroke="#1E1E1E" strokeWidth="3" />
          <circle cx="112" cy="90" r="5" fill="#94A3B8" />
          {/* Refinance Tag */}
          <g transform="translate(62, 8)">
            <rect x="0" y="0" width="62" height="32" rx="6" fill="#6366F1" stroke="#1E1E1E" strokeWidth="2.5" />
            <text x="7" y="21" fill="#FFFFFF" fontSize="10" fontWeight="900">REFINANCE</text>
          </g>
        </svg>
      )
    },
    {
      id: 4,
      title: "Used Car Purchase Loan",
      illustration: (
        <svg viewBox="0 0 160 120" className="w-36 h-32 object-contain">
          {/* Car */}
          <rect x="25" y="55" width="110" height="35" rx="10" fill="#00C9AF" stroke="#1E1E1E" strokeWidth="3.5" />
          <path d="M45 55 L60 32 L100 32 L115 55 Z" fill="#2DD4BF" stroke="#1E1E1E" strokeWidth="3.5" />
          <circle cx="48" cy="90" r="12" fill="#1E293B" stroke="#1E1E1E" strokeWidth="3" />
          <circle cx="48" cy="90" r="5" fill="#94A3B8" />
          <circle cx="112" cy="90" r="12" fill="#1E293B" stroke="#1E1E1E" strokeWidth="3" />
          <circle cx="112" cy="90" r="5" fill="#94A3B8" />
          {/* Approved Tag */}
          <g transform="translate(62, 10)">
            <rect x="0" y="0" width="60" height="32" rx="6" fill="#10B981" stroke="#1E1E1E" strokeWidth="2.5" />
            <text x="6" y="21" fill="#FFFFFF" fontSize="10" fontWeight="900">APPROVED</text>
          </g>
        </svg>
      )
    },
    {
      id: 5,
      title: "Pre-Owned Car Top-Up",
      illustration: (
        <svg viewBox="0 0 160 120" className="w-36 h-32 object-contain">
          <rect x="25" y="55" width="110" height="35" rx="10" fill="#8B5CF6" stroke="#1E1E1E" strokeWidth="3.5" />
          <path d="M45 55 L60 32 L100 32 L115 55 Z" fill="#A78BFA" stroke="#1E1E1E" strokeWidth="3.5" />
          <circle cx="48" cy="90" r="12" fill="#1E293B" stroke="#1E1E1E" strokeWidth="3" />
          <circle cx="48" cy="90" r="5" fill="#94A3B8" />
          <circle cx="112" cy="90" r="12" fill="#1E293B" stroke="#1E1E1E" strokeWidth="3" />
          <circle cx="112" cy="90" r="5" fill="#94A3B8" />
          {/* Top-Up Tag */}
          <g transform="translate(64, 10)">
            <rect x="0" y="0" width="56" height="32" rx="6" fill="#EC4899" stroke="#1E1E1E" strokeWidth="2.5" />
            <text x="8" y="21" fill="#FFFFFF" fontSize="10" fontWeight="900">TOP-UP</text>
          </g>
        </svg>
      )
    },
    {
      id: 6,
      title: "Balance Transfer",
      illustration: (
        <svg viewBox="0 0 160 120" className="w-36 h-32 object-contain">
          <rect x="25" y="55" width="110" height="35" rx="10" fill="#F59E0B" stroke="#1E1E1E" strokeWidth="3.5" />
          <path d="M45 55 L60 32 L100 32 L115 55 Z" fill="#FBBF24" stroke="#1E1E1E" strokeWidth="3.5" />
          <circle cx="48" cy="90" r="12" fill="#1E293B" stroke="#1E1E1E" strokeWidth="3" />
          <circle cx="48" cy="90" r="5" fill="#94A3B8" />
          <circle cx="112" cy="90" r="12" fill="#1E293B" stroke="#1E1E1E" strokeWidth="3" />
          <circle cx="112" cy="90" r="5" fill="#94A3B8" />
          {/* Transfer Tag */}
          <g transform="translate(60, 10)">
            <rect x="0" y="0" width="62" height="32" rx="6" fill="#3B82F6" stroke="#1E1E1E" strokeWidth="2.5" />
            <text x="5" y="21" fill="#FFFFFF" fontSize="10" fontWeight="900">TRANSFER</text>
          </g>
        </svg>
      )
    },
    {
      id: 7,
      title: "Personal Car Loan",
      illustration: (
        <svg viewBox="0 0 160 120" className="w-36 h-32 object-contain">
          <rect x="25" y="55" width="110" height="35" rx="10" fill="#10B981" stroke="#1E1E1E" strokeWidth="3.5" />
          <path d="M45 55 L60 32 L100 32 L115 55 Z" fill="#34D399" stroke="#1E1E1E" strokeWidth="3.5" />
          <circle cx="48" cy="90" r="12" fill="#1E293B" stroke="#1E1E1E" strokeWidth="3" />
          <circle cx="48" cy="90" r="5" fill="#94A3B8" />
          <circle cx="112" cy="90" r="12" fill="#1E293B" stroke="#1E1E1E" strokeWidth="3" />
          <circle cx="112" cy="90" r="5" fill="#94A3B8" />
          <g transform="translate(64, 10)">
            <rect x="0" y="0" width="56" height="32" rx="6" fill="#8B5CF6" stroke="#1E1E1E" strokeWidth="2.5" />
            <text x="8" y="21" fill="#FFFFFF" fontSize="10" fontWeight="900">INSTANT</text>
          </g>
        </svg>
      )
    }
  ];

  // Automatic Smooth Card Rotation Timer
  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setActiveIdx(prev => (prev === services.length - 1 ? 0 : prev + 1));
    }, 3200);
    return () => clearInterval(timer);
  }, [isHovered, services.length]);

  const handlePrev = () => {
    setActiveIdx(prev => (prev === 0 ? services.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIdx(prev => (prev === services.length - 1 ? 0 : prev + 1));
  };

  return (
    <section className="py-10 lg:py-14 bg-[#f4f8fc] overflow-hidden relative border-t border-slate-200/60">
      {/* Background Subtle Lines Texture */}
      <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

          {/* Left Column: Heading, Subtext, CTA Button */}
          <div className="lg:col-span-5 space-y-4 text-center lg:text-left">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#1E3A34] leading-tight tracking-tight">
              <span className="text-[#1E3A34]">Team Selectt</span> is <br className="hidden sm:block" />
              <span className="text-[#334155] font-normal">in your city.</span>
            </h2>
            <p className="text-slate-600 font-medium text-sm sm:text-base leading-relaxed max-w-sm mx-auto lg:mx-0">
              To provide the best services to help you fulfil your needs.
            </p>
            <div>
              <button
                onClick={() => {
                  window.scrollTo({ top: 300, behavior: 'smooth' });
                }}
                className="bg-[#0C1B33] hover:bg-[#061224] text-[#14FFEC] px-6 py-2.5 rounded-lg font-black text-xs sm:text-sm shadow-md shadow-[#0C1B33]/25 border border-[#00C9AF]/40 hover:border-[#14FFEC] transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95 cursor-pointer inline-flex items-center gap-2"
              >
                Talk to our experts
              </button>
            </div>
          </div>

          {/* Right Column: Exact 3D Stacked Card Fan Carousel (Compact Size with Auto Rotation) */}
          <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="lg:col-span-7 relative flex flex-col items-center justify-center min-h-[350px]"
          >
            <div className="flex items-center justify-center w-full max-w-xl gap-1 sm:gap-4">

              {/* Left Chevron Nav Arrow */}
              <button
                onClick={handlePrev}
                className="text-[#00C9AF] hover:text-[#14FFEC] transition-transform transform hover:scale-125 active:scale-90 cursor-pointer z-40 p-1.5 shrink-0"
                aria-label="Previous card"
              >
                <ChevronLeft size={32} strokeWidth={3} />
              </button>

              {/* Stacked Fan Cards Container */}
              <div className="relative w-[210px] sm:w-[230px] h-[300px] sm:h-[320px] flex items-center justify-center">
                {services.map((item, idx) => {
                  const total = services.length;
                  let offset = idx - activeIdx;
                  
                  // Wrap offset around circular array
                  if (offset < -Math.floor(total / 2)) offset += total;
                  if (offset > Math.floor(total / 2)) offset -= total;

                  const isCenter = offset === 0;
                  const isVisible = Math.abs(offset) <= 3; // Show 7 cards stacked in fan

                  if (!isVisible) return null;

                  // Compact Fan-Out Transform Math
                  const translateX = offset * 22; // Compact horizontal spacing
                  const translateY = Math.abs(offset) * 2; // Slight vertical stack depth
                  const rotateDeg = offset * 3.2; // Symmetrical card fan rotation
                  const scale = isCenter ? 1.04 : 1 - Math.abs(offset) * 0.02;
                  const zIndex = 40 - Math.abs(offset);

                  return (
                    <div
                      key={item.id}
                      onClick={() => setActiveIdx(idx)}
                      style={{
                        transform: `translateX(${translateX}px) translateY(${translateY}px) rotate(${rotateDeg}deg) scale(${scale})`,
                        zIndex,
                      }}
                      className={`absolute top-0 left-0 w-full h-full bg-white rounded-[1.3rem] shadow-lg border border-slate-100 flex flex-col justify-between overflow-hidden transition-all duration-500 ease-out cursor-pointer select-none ${
                        isCenter
                          ? 'shadow-[0_16px_40px_rgba(0,0,0,0.12)] ring-1 ring-black/5'
                          : 'hover:opacity-100 opacity-95'
                      }`}
                    >
                      {/* Top Title inside card */}
                      <div className="pt-4 px-2 text-center">
                        <h3 className="text-base sm:text-lg font-extrabold text-[#1E3A34] tracking-tight leading-tight">
                          {item.title}
                        </h3>
                      </div>

                      {/* Center Illustration */}
                      <div className="flex-1 flex items-center justify-center p-1">
                        <div className="transform scale-85">
                          {item.illustration}
                        </div>
                      </div>

                      {/* Bottom Full-Width Brand Button Band */}
                      <div className="w-full">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.scrollTo({ top: 300, behavior: 'smooth' });
                          }}
                          className="w-full py-2.5 bg-[#0C1B33] hover:bg-[#061224] text-[#14FFEC] font-extrabold text-xs sm:text-sm tracking-wide transition-colors cursor-pointer rounded-b-[1.3rem] border-t border-[#00C9AF]/30"
                        >
                          Apply Now
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right Chevron Nav Arrow */}
              <button
                onClick={handleNext}
                className="text-[#00C9AF] hover:text-[#14FFEC] transition-transform transform hover:scale-125 active:scale-90 cursor-pointer z-40 p-1.5 shrink-0"
                aria-label="Next card"
              >
                <ChevronRight size={32} strokeWidth={3} />
              </button>
            </div>

            {/* Pagination Indicator Dots */}
            <div className="flex items-center gap-1.5 mt-6 z-40">
              {services.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIdx(i)}
                  className={`rounded-full transition-all duration-300 cursor-pointer ${
                    activeIdx === i
                      ? 'w-2.5 h-2.5 bg-[#00C9AF] scale-110'
                      : 'w-1.5 h-1.5 bg-slate-300 hover:bg-slate-400'
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

    // Set page title and meta description for SEO
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
    <PageTransition className="min-h-screen bg-slate-50 font-sans w-full overflow-x-hidden pb-[72px] lg:pb-[80px]">

      {/* ───────────── Hero Section ───────────── */}
      <section className="relative pt-12 lg:pt-20 pb-48 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0c1b33] via-[#0a162a] to-[#060d19] z-0"></div>
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] z-0"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#00C9AF] rounded-full mix-blend-screen filter blur-[120px] opacity-20 animate-pulse z-0"></div>
        <div className="absolute bottom-0 left-10 w-72 h-72 bg-purple-600 rounded-full mix-blend-screen filter blur-[100px] opacity-15 z-0"></div>
        <div className="absolute top-0 right-0 p-10 opacity-10 hidden lg:block z-0">
          <Zap size={240} className="text-[#00C9AF] fill-[#00C9AF] rotate-12" />
        </div>

        <SectionReveal className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-2 rounded-full mb-6 text-[#00C9AF] font-bold shadow-sm backdrop-blur-md">
              <ShieldCheck size={18} className="text-[#00C9AF]" />
              Selectt pre-approved Loan
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-black text-white leading-tight mb-4 tracking-tight">
              Financing made possible for every car buyer
            </h1>
            <div className="flex items-center justify-center gap-6 mt-8">
              <div className="flex items-center gap-2 font-bold text-white font-body">
                <CheckCircle2 size={18} className="text-[#00C9AF]" /> Zero hidden charges
              </div>
              <div className="flex items-center gap-2 font-bold text-white font-body">
                <CheckCircle2 size={18} className="text-[#00C9AF]" /> Instant approval
              </div>
            </div>
          </div>
        </SectionReveal>
      </section>

      {/* ───────────── Floating EMI Calculator ───────────── */}
      <SectionReveal amount={0.3} className="relative z-20 max-w-5xl mx-auto px-4 -mt-32 mb-20">
        <EmiCalculator price={800000} theme="white" className="shadow-2xl shadow-slate-200/50 outline outline-4 outline-white" />
      </SectionReveal>

      {/* ───────────── How It Works — Steps with Scroll Reveal ───────────── */}
      <section className="py-20 bg-white relative overflow-hidden border-t border-slate-100">
        <div className="max-w-5xl mx-auto px-6 relative">
          <SectionReveal className="text-center max-w-xl mx-auto mb-16 md:mb-20">
            <span className="text-[#00C9AF] text-[11px] font-subheading tracking-widest uppercase mb-2.5 block">
              HOW IT WORKS
            </span>
            <h2 className="text-3xl md:text-4xl font-heading font-black text-[#0C1B33] tracking-tight mb-4">The smart way to loan</h2>
            <p className="text-slate-500 font-body text-sm leading-relaxed">
              With completely digital checks, Selectt pre-approved loans let you experience a hassle-free, same-day approval.
            </p>
          </SectionReveal>

          <div className="space-y-12 relative">

            {/* ── Step 1 (Scroll Reveal) ── */}
            <motion.div
              initial={{ opacity: 0, y: 45 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col lg:flex-row items-center gap-6 lg:gap-[76px] lg:pt-[30px] relative z-10 gpu-accelerated"
            >
              <div className="w-full lg:w-[55%] flex items-center gap-6 lg:pl-[117px]">
                <svg width="47" height="114" viewBox="0 0 47 114" fill="none" className="w-10 md:w-12 h-auto shrink-0 select-none pointer-events-none">
                  <path d="M16.5259 112.361V112.861H17.0259H45.7439H46.2439V112.361V1.63867V1.13867H45.7439H1.25586H0.755859V1.63867V26.0407V26.5407H1.25586H16.5259V112.361Z" fill="none" stroke="#ADADAD" strokeWidth="1.5"></path>
                </svg>
                <div className="flex-1">
                  <h3 className="text-lg md:text-xl font-heading font-extrabold text-[#0C1B33] mb-2">
                    Check your used car loan eligibility
                  </h3>
                  <p className="text-slate-500 font-body text-sm leading-relaxed">
                    Fill in a form online to know your car loan eligibility in minutes, without impacting your credit score.{' '}
                    <span onClick={() => window.scrollTo({ top: 300, behavior: 'smooth' })} className="text-blue-600 font-medium hover:underline cursor-pointer">
                      Calculate car loan EMI now!
                    </span>
                  </p>
                </div>
              </div>
              <div className="w-full lg:w-[40%] flex justify-center lg:justify-start lg:-ml-12">
                <motion.div 
                  whileHover={{ scale: 1.06, y: -4 }}
                  transition={{ duration: 0.3 }}
                  className="max-w-[260px] md:max-w-[300px]"
                >
                  <img src="https://spn-sta.spinny.com/spinny-web/static-images/assets/images/pages/UsedCarLoan/assets/loan-eligibility.svg?q=85&w=360&dpr=1.3" alt="Check Eligibility" className="w-full h-auto object-contain drop-shadow-md" />
                </motion.div>
              </div>
            </motion.div>

            {/* Dotted Line 1→2 */}
            <div className="hidden lg:flex justify-center pointer-events-none select-none -my-10">
              <img src="https://spn-sta.spinny.com/spinny-web/static-images/assets/images/components/InstructionSteps/assets/AfterOddLine.svg?q=85&w=900&dpr=1.3" alt="" className="w-[72%] max-w-3xl h-auto opacity-80" />
            </div>

            {/* ── Step 2 (Scroll Reveal) ── */}
            <motion.div
              initial={{ opacity: 0, y: 45 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col lg:flex-row-reverse items-center gap-6 lg:gap-[76px] lg:pt-[30px] relative z-10 gpu-accelerated"
            >
              <div className="w-full lg:w-[55%] flex items-center gap-6 lg:pr-[117px]">
                <div className="flex-1">
                  <h3 className="text-lg md:text-xl font-heading font-extrabold text-[#0C1B33] mb-2">
                    Upload documents
                  </h3>
                  <p className="text-slate-500 font-body text-sm leading-relaxed">
                    Upload your documents online and you'll be served the best used car loan deal, customized just for you by our finance partners.
                  </p>
                </div>
                <svg width="93" height="117" viewBox="0 0 93 117" fill="none" className="w-16 md:w-20 h-auto shrink-0 select-none pointer-events-none">
                  <path d="M92.2436 90.7045V90.2045H91.7436H56.8289L74.4878 73.8069L74.4888 73.8061C84.5009 64.4614 91.0816 54.7105 91.0816 40.5725C91.0816 26.1275 84.6915 17.5414 80.1451 12.995C75.0824 7.9322 65.331 1.39453 48.5836 1.39453C34.6845 1.39453 24.4276 5.92138 16.856 13.493C10.9672 19.3818 4.59333 29.9602 4.42563 44.5508L4.41981 45.0565H4.92559H34.6396H35.1183L35.1391 44.5783C35.2207 42.7026 35.5478 40.2058 36.182 37.7511C36.8178 35.2899 37.7507 32.9166 39.0191 31.2504C40.7633 29.0322 43.7783 26.9625 48.2516 26.9625C51.7645 26.9625 54.4516 28.3984 56.0156 30.1189C57.5903 31.851 58.3944 34.117 58.8005 36.1273C59.2054 38.1313 59.2056 39.8339 59.2056 40.4065C59.2056 47.3959 56.284 52.7724 53.309 57.4002L53.309 57.4001L53.3061 57.4048C48.0187 65.8315 40.5735 74.9343 30.6255 85.3797L2.57196 114.761L1.76488 115.607H2.93359H91.7436H92.2436V115.107V90.7045Z" fill="none" stroke="#ADADAD" strokeWidth="1.5"></path>
                </svg>
              </div>
              <div className="w-full lg:w-[40%] flex justify-center lg:justify-end lg:-mr-12">
                <motion.div 
                  whileHover={{ scale: 1.06, y: -4 }}
                  transition={{ duration: 0.3 }}
                  className="max-w-[260px] md:max-w-[300px]"
                >
                  <img src="https://spn-sta.spinny.com/spinny-web/static-images/assets/images/pages/UsedCarLoan/assets/upload-document.svg?q=85&w=360&dpr=1.3" alt="Upload Documents" className="w-full h-auto object-contain drop-shadow-md" />
                </motion.div>
              </div>
            </motion.div>

            {/* Dotted Line 2→3 */}
            <div className="hidden lg:flex justify-center pointer-events-none select-none -my-10">
              <img src="https://spn-sta.spinny.com/spinny-web/static-images/assets/images/components/InstructionSteps/assets/AfterEvenLine.svg?q=85&w=900&dpr=1.3" alt="" className="w-[72%] max-w-3xl h-auto opacity-80" />
            </div>

            {/* ── Step 3 (Scroll Reveal) ── */}
            <motion.div
              initial={{ opacity: 0, y: 45 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col lg:flex-row items-center gap-6 lg:gap-[76px] lg:pt-[30px] relative z-10 gpu-accelerated"
            >
              <div className="w-full lg:w-[55%] flex items-center gap-6 lg:pl-[117px]">
                <svg width="91" height="118" viewBox="0 0 91 118" fill="none" className="w-16 md:w-20 h-auto shrink-0 select-none pointer-events-none">
                  <path d="M1.25586 76.0124H0.707189L0.758009 76.5588C2.09934 90.9781 8.97624 100.549 14.6952 105.764C24.4454 114.841 36.0383 117.35 46.7399 117.35C63.2995 117.35 74.0528 111.493 80.1274 105.418C84.8458 100.7 90.0679 92.7769 90.0679 80.8284C90.0679 74.4353 88.5517 69.0221 85.3336 64.2797L85.3295 64.2737C83.0857 61.0683 79.3126 56.941 73.0039 54.3621C76.5384 52.3538 78.8467 49.625 80.7099 46.2095C83.2487 41.639 84.0919 37.2359 84.0919 32.3564C84.0919 23.7477 80.5458 16.1532 74.9814 10.5889L74.9778 10.5853C66.5399 2.31613 55.4233 0.648438 47.0719 0.648438C36.3796 0.648438 25.7643 2.98795 17.4988 11.5884C12.4407 16.6482 7.23811 25.5577 6.56667 37.3079L6.53647 37.8364H7.06586H33.7919H34.2919V37.3364C34.2919 33.9486 35.5885 30.113 37.951 27.9021L37.9573 27.9021L37.9634 27.896C39.5107 26.3487 42.195 25.2204 45.5779 25.2204C48.6298 25.2204 51.6457 26.3494 53.3583 28.062C54.911 29.6147 56.1999 32.8006 56.1999 35.6764C56.1999 38.0361 55.2562 40.8808 52.7204 43.1006C50.506 44.9978 46.9989 46.6149 41.3326 45.8055L40.7619 45.7239V46.3004V65.7224V66.4162L41.42 66.1968C42.8455 65.7216 44.2814 65.5584 46.0759 65.5584C49.5116 65.5584 53.6887 66.3812 56.3808 68.5974C58.2765 70.1776 60.5159 73.3635 60.5159 78.0064C60.5159 81.2261 59.717 84.0878 57.3251 86.8009C55.2364 89.0486 51.8761 91.4504 46.4079 91.4504C41.705 91.4504 37.863 89.8294 35.4846 87.2925L35.4791 87.2866L35.4734 87.2809C32.9228 84.7302 31.2995 80.5423 31.1375 76.4925L31.1183 76.0124H30.6379H1.25586Z" fill="none" stroke="#ADADAD" strokeWidth="1.5"></path>
                </svg>
                <div className="flex-1">
                  <h3 className="text-lg md:text-xl font-heading font-extrabold text-[#0C1B33] mb-2">
                    Same-day approval
                  </h3>
                  <p className="text-slate-500 font-body text-sm leading-relaxed">
                    With Selectt, get same-day approval and complete disbursal formalities at your convenience.
                  </p>
                </div>
              </div>
              <div className="w-full lg:w-[40%] flex justify-center lg:justify-start lg:-ml-12">
                <motion.div 
                  whileHover={{ scale: 1.06, y: -4 }}
                  transition={{ duration: 0.3 }}
                  className="max-w-[260px] md:max-w-[300px]"
                >
                  <img src="https://spn-sta.spinny.com/spinny-web/static-images/assets/images/pages/UsedCarLoan/assets/loan-approval.svg?q=85&w=360&dpr=1.3" alt="Same Day Approval" className="w-full h-auto object-contain drop-shadow-md" />
                </motion.div>
              </div>
            </motion.div>

            {/* Dotted Line 3→4 */}
            <div className="hidden lg:flex justify-center pointer-events-none select-none -my-10">
              <img src="https://spn-sta.spinny.com/spinny-web/static-images/assets/images/components/InstructionSteps/assets/AfterOddLine.svg?q=85&w=900&dpr=1.3" alt="" className="w-[72%] max-w-3xl h-auto opacity-80" />
            </div>

            {/* ── Step 4 (Scroll Reveal) ── */}
            <motion.div
              initial={{ opacity: 0, y: 45 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col lg:flex-row-reverse items-center gap-6 lg:gap-[76px] lg:pt-[30px] relative z-10 gpu-accelerated"
            >
              <div className="w-full lg:w-[55%] flex items-center gap-6 lg:pr-[117px]">
                <div className="flex-1">
                  <h3 className="text-lg md:text-xl font-heading font-extrabold text-[#0C1B33] mb-2">
                    Home delivery
                  </h3>
                  <p className="text-slate-500 font-body text-sm leading-relaxed">
                    Your polished, cleaned and serviced Selectt Assured® car is delivered the same day, right at your doorstep.
                  </p>
                </div>
                <svg width="96" height="113" viewBox="0 0 96 113" fill="none" className="w-16 md:w-20 h-auto shrink-0 select-none pointer-events-none">
                  <path d="M81.7981 1.13867V0.638672H81.2981H43.7821H43.4985L43.3529 0.882158L0.690931 72.2622L0.620117 72.3806V72.5187V90.9447V91.4447H1.12012H54.2381V111.861V112.361H54.7381H81.2981H81.7981V111.861V91.4447H94.7441H95.2441V90.9447V68.8667V68.3667H94.7441H81.7981V1.13867ZM54.2381 25.5811V68.3667H29.542L54.2381 25.5811Z" fill="none" stroke="#ADADAD" strokeWidth="1.5"></path>
                </svg>
              </div>
              <div className="w-full lg:w-[40%] flex justify-center lg:justify-end lg:-mr-12">
                <motion.div 
                  whileHover={{ scale: 1.06, y: -4 }}
                  transition={{ duration: 0.3 }}
                  className="max-w-[260px] md:max-w-[300px]"
                >
                  <img src="https://spn-sta.spinny.com/spinny-web/static-images/assets/images/pages/UsedCarLoan/assets/home-delivery.svg?q=85&w=360&dpr=1.3" alt="Home Delivery" className="w-full h-auto object-contain drop-shadow-md" />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ───────────── CTA Banner ───────────── */}
      <SectionReveal className="my-10 max-w-7xl mx-auto px-4">
        <div className="relative rounded-[2.5rem] overflow-hidden group shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10"></div>
          <img
            src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1200&q=80"
            alt="Used cars in lot"
            className="w-full h-[260px] md:h-[280px] object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-x-0 bottom-0 p-8 lg:p-12 z-20 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2 className="text-3xl lg:text-4xl font-heading font-black text-white mb-2 tracking-tight">Make a wish, get your dream car!</h2>
              <p className="text-slate-200 font-body font-medium text-lg">Pick out your dream car today. Find from our exciting inventory of 5,000+ Assured cars.</p>
            </div>
            <AnimatedButton variant="solid" className="whitespace-nowrap px-8 py-4 rounded-xl text-sm font-button uppercase tracking-wider">
              BROWSE CARS
            </AnimatedButton>
          </div>
        </div>
      </SectionReveal>

      {/* ───────────── Finance Partners ───────────── */}
      <SectionReveal amount={0.25} className="py-20 bg-slate-50/50 border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h3 className="text-xl font-heading font-bold text-[#3B295A] tracking-tight mb-12 flex items-center justify-center gap-4">
            <div className="h-px bg-slate-200 w-16 md:w-24"></div>
            Our Finance Partners
            <div className="h-px bg-slate-200 w-16 md:w-24"></div>
          </h3>
          <StaggerGroup className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {partners.map((p, i) => (
              <StaggerItem key={i}>
                <motion.div 
                  whileHover={{ y: -4, scale: 1.03 }}
                  transition={{ duration: 0.2 }}
                  className="h-24 bg-white rounded-[1.25rem] shadow-sm hover:shadow-md flex items-center justify-center p-6 transition-all cursor-pointer border border-slate-100"
                >
                  <img src={p.logo} alt={p.name} className="w-full h-full object-contain" />
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </SectionReveal>

      {/* ───────────── Team Selectt In Your City — 3D Card Stack Carousel ───────────── */}
      <CityServicesSection />

      {/* ───────────── FAQ ───────────── */}
      <section className="relative overflow-hidden mb-4">
        <div className="absolute bottom-0 right-0 w-[500px] h-[300px] bg-[#00C9AF] rounded-full mix-blend-screen filter blur-[160px] opacity-5 pointer-events-none"></div>
        <div className="absolute top-0 left-0 w-[400px] h-[300px] bg-purple-700 rounded-full mix-blend-screen filter blur-[160px] opacity-5 pointer-events-none"></div>
        <FAQ dark={false} />
      </section>



    </PageTransition>
  );
};

export default UsedCarLoanPage;
