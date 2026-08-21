import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  MapPin,
  Car,
  Banknote,
  Clock,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Award,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';
import SellCarFormWidget from '../components/sell/SellCarFormWidget';
import Testimonials from '../components/home/Testimonials';
import SectionDivider from '../components/common/SectionDivider';
import FAQ from '../components/home/FAQ';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config/api';

const MAKES_AND_MODELS = {
  'Maruti Suzuki': {
    Swift: { basePrice: 7.8, fuels: ['Petrol', 'CNG'], demand: 1.12 },
    Baleno: { basePrice: 8.8, fuels: ['Petrol', 'CNG'], demand: 1.1 },
    Dzire: { basePrice: 8.6, fuels: ['Petrol', 'CNG'], demand: 1.11 },
    Brezza: { basePrice: 10.8, fuels: ['Petrol', 'CNG'], demand: 1.08 },
    Ertiga: { basePrice: 11.6, fuels: ['Petrol', 'CNG'], demand: 1.08 },
    XL6: { basePrice: 13.2, fuels: ['Petrol', 'Hybrid'], demand: 1.05 },
    Fronx: { basePrice: 9.2, fuels: ['Petrol', 'CNG'], demand: 1.09 },
    'Grand Vitara': { basePrice: 14.8, fuels: ['Petrol', 'Hybrid', 'CNG'], demand: 1.08 },
    'e Vitara': { basePrice: 18.8, fuels: ['Electric'], demand: 1.06 }
  },
  Hyundai: {
    i20: { basePrice: 8.6, fuels: ['Petrol'], demand: 1.03 },
    Venue: { basePrice: 11.2, fuels: ['Petrol', 'Diesel'], demand: 1.05 },
    Verna: { basePrice: 13.6, fuels: ['Petrol'], demand: 1.01 },
    Creta: { basePrice: 16.8, fuels: ['Petrol', 'Diesel'], demand: 1.14 },
    Alcazar: { basePrice: 18.9, fuels: ['Petrol', 'Diesel'], demand: 1.04 },
    'Kona Electric': { basePrice: 23.5, fuels: ['Electric'], demand: 0.95 },
    CretaEV: { basePrice: 18.5, fuels: ['Electric'], demand: 1.05 }
  },
  Tata: {
    Altroz: { basePrice: 8.8, fuels: ['Petrol', 'Diesel', 'CNG'], demand: 1 },
    Punch: { basePrice: 9.1, fuels: ['Petrol', 'CNG'], demand: 1.12 },
    Nexon: { basePrice: 13.4, fuels: ['Petrol', 'Diesel'], demand: 1.13 },
    Harrier: { basePrice: 20.6, fuels: ['Diesel'], demand: 1.04 },
    Safari: { basePrice: 23.8, fuels: ['Diesel'], demand: 1.02 },
    'Tiago EV': { basePrice: 9.6, fuels: ['Electric'], demand: 1.06 },
    'Punch EV': { basePrice: 12.4, fuels: ['Electric'], demand: 1.08 },
    'Nexon EV': { basePrice: 15.8, fuels: ['Electric'], demand: 1.1 },
    'Curvv EV': { basePrice: 19.4, fuels: ['Electric'], demand: 1.07 }
  },
  Mahindra: {
    XUV3XO: { basePrice: 10.4, fuels: ['Petrol', 'Diesel'], demand: 1.05 },
    ScorpioN: { basePrice: 18.8, fuels: ['Petrol', 'Diesel'], demand: 1.12 },
    XUV700: { basePrice: 21.2, fuels: ['Petrol', 'Diesel'], demand: 1.14 },
    Thar: { basePrice: 15.4, fuels: ['Petrol', 'Diesel'], demand: 1.1 },
    'XUV400 EV': { basePrice: 15.6, fuels: ['Electric'], demand: 1.04 },
    'BE 6': { basePrice: 19.8, fuels: ['Electric'], demand: 1.07 }
  },
  Kia: {
    Sonet: { basePrice: 10.8, fuels: ['Petrol', 'Diesel'], demand: 1.07 },
    Carens: { basePrice: 13.8, fuels: ['Petrol', 'Diesel'], demand: 1.06 },
    Seltos: { basePrice: 16.5, fuels: ['Petrol', 'Diesel'], demand: 1.12 },
    'EV6': { basePrice: 63, fuels: ['Electric'], demand: 0.96 }
  },
  Toyota: {
    Glanza: { basePrice: 8.7, fuels: ['Petrol', 'CNG'], demand: 1.03 },
    Hyryder: { basePrice: 15.6, fuels: ['Petrol', 'Hybrid', 'CNG'], demand: 1.09 },
    InnovaCrysta: { basePrice: 25.2, fuels: ['Diesel'], demand: 1.07 },
    InnovaHycross: { basePrice: 28.8, fuels: ['Petrol', 'Hybrid'], demand: 1.12 }
  },
  Honda: {
    Amaze: { basePrice: 8.2, fuels: ['Petrol'], demand: 1 },
    City: { basePrice: 14.2, fuels: ['Petrol', 'Hybrid'], demand: 1.04 },
    Elevate: { basePrice: 13.6, fuels: ['Petrol'], demand: 1.04 }
  },
  MG: {
    Astor: { basePrice: 13.6, fuels: ['Petrol'], demand: 0.98 },
    Hector: { basePrice: 18.6, fuels: ['Petrol', 'Diesel'], demand: 0.97 },
    Comet: { basePrice: 8.2, fuels: ['Electric'], demand: 1.01 },
    ZSEV: { basePrice: 20.2, fuels: ['Electric'], demand: 0.99 },
    WindsorEV: { basePrice: 15.8, fuels: ['Electric'], demand: 1.04 }
  }
};

const DEFAULT_STEPS = [
  {
    id: 1,
    title: "1. Get Online Valuation",
    description: "Enter your car's details in our instant estimate tool to get a transparent price range in seconds.",
    imageUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80",
    badge: "Instant Estimate"
  },
  {
    id: 2,
    title: "2. Free Doorstep Inspection",
    description: "Schedule a free evaluation at your preferred time. Our certified inspector will perform a 200-point physical check.",
    imageUrl: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=800&auto=format&fit=crop&q=80",
    badge: "Free Doorstep Inspection"
  },
  {
    id: 3,
    title: "3. Get Bids from 1500+ Buyers",
    description: "We list your car report across our network of verified dealers to secure you the highest competitive offer.",
    imageUrl: "https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?w=800&auto=format&fit=crop&q=80",
    badge: "Best Offer Guarantee"
  },
  {
    id: 4,
    title: "4. Instant Payout & Pickup",
    description: "Accept the bid to receive payment directly in your bank account instantly, followed by free pickup and RC transfer.",
    imageUrl: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80",
    badge: "Quick Payout"
  }
];

const calculateEstimate = (formData) => {
  if (!formData) {
    return {
      low: 5.0,
      high: 8.0,
      bestPrice: 6.5,
      expectedKm: 50000,
      age: 3,
      strengths: ['Standard market demand and profile support this estimate.'],
      caution: ['No major negative pricing signals from the entered data.'],
      headline: 'Estimated Selectt procurement range'
    };
  }

  const make = String(formData.brandName || formData.brand || '');
  const model = String(formData.model || '');
  const variant = String(formData.variant || '');
  const year = Number(formData.year || 2020);
  const kilometers = Number(formData.km || 0);
  const ownership = String(formData.ownership || '');
  const city = String(formData.location || 'Mumbai');

  const owners = ownership === '4+ Owner' || ownership === '4th+ Owner' ? 4 : Number(ownership.replace(/\D/g, '') || 1);

  const matchedMakeKey = Object.keys(MAKES_AND_MODELS).find(
    key => key.toLowerCase() === make.toLowerCase()
  );
  const makeData = matchedMakeKey ? MAKES_AND_MODELS[matchedMakeKey] : null;

  let carMeta = null;
  if (makeData) {
    const matchedModelKey = Object.keys(makeData).find(
      key => key.toLowerCase() === model.toLowerCase()
    );
    if (matchedModelKey) {
      carMeta = makeData[matchedModelKey];
    }
  }

  if (!carMeta) {
    carMeta = { basePrice: 10.0, demand: 1.0, fuels: ['Petrol'] };
  }

  const age = Math.max(1, 2026 - year);
  const expectedKm = Math.max(age * 12000, 10000);
  const kmDelta = kilometers - expectedKm;

  const cityMultiplierMap = {
    Mumbai: 1.03, Delhi: 1.01, Bengaluru: 1.04, Pune: 1.02, Hyderabad: 1.01, Chennai: 1,
    Ahmedabad: 0.99, Kolkata: 0.98, Jaipur: 0.99, Chandigarh: 1, Lucknow: 0.98,
    Indore: 0.98, Surat: 0.99, Kochi: 1, Nagpur: 0.98, Goa: 1.01
  };

  const fuel = variant.toLowerCase().includes('diesel') ? 'Diesel'
    : variant.toLowerCase().includes('cng') ? 'CNG'
      : variant.toLowerCase().includes('electric') || variant.toLowerCase().includes('ev') ? 'Electric'
        : variant.toLowerCase().includes('hybrid') ? 'Hybrid' : 'Petrol';

  const transmission = variant.toLowerCase().includes('automatic') || variant.toLowerCase().includes('amt') || variant.toLowerCase().includes('at') ? 'Automatic' : 'Manual';

  const fuelMultiplierMap = {
    Petrol: 1, Diesel: 0.97, CNG: 0.94, Hybrid: 1.05,
    Electric: city === 'Bengaluru' || city === 'Mumbai' || city === 'Delhi' || city === 'Pune' ? 1.08 : 1.03
  };

  const ownerPenalty = Math.max(0.82, 1 - (owners - 1) * 0.06);
  const agePenalty = Math.max(0.42, 1 - age * 0.085);
  const kmPenalty = kmDelta > 0 ? Math.max(0.8, 1 - kmDelta / 250000) : Math.min(1.06, 1 + Math.abs(kmDelta) / 300000);
  const fuelMultiplier = fuelMultiplierMap[fuel] || 1;
  const transmissionMultiplier = transmission === 'Automatic' ? 1.02 : 0.99;
  const cityMultiplier = cityMultiplierMap[city] || 1;
  const demandMultiplier = carMeta.demand || 1;
  const procurementBoost = age <= 5 && owners === 1 ? 1.03 : 1.01;

  const fairValue = carMeta.basePrice * agePenalty * kmPenalty * ownerPenalty * fuelMultiplier * transmissionMultiplier * cityMultiplier * demandMultiplier * procurementBoost;
  const bestPrice = Math.max(1.25, fairValue);
  const low = Math.max(1, bestPrice * 0.96);
  const high = bestPrice * 1.04;

  const strengths = [];
  if (owners === 1) strengths.push('single-owner profile improves procurement appeal');
  if (kilometers <= expectedKm) strengths.push('kilometers are healthy for the car age');
  if (fuel === 'Hybrid' || fuel === 'Electric') strengths.push('alternative fuel demand supports stronger pricing');
  if ((carMeta.demand || 1) >= 1.08) strengths.push('this model has strong resale demand in India');
  if (city === 'Mumbai' || city === 'Bengaluru' || city === 'Pune') strengths.push('your city has solid used-car demand');

  const caution = [];
  if (kilometers > expectedKm + 20000) caution.push('higher-than-average running lowers the offer range');
  if (owners >= 3) caution.push('multiple ownership history affects buyer confidence');
  if (age >= 8) caution.push('older age pushes the car closer to Selectt policy limits');
  if (fuel === 'Diesel' && city === 'Delhi') caution.push('diesel demand can be softer around NCR restrictions');

  return {
    low,
    high,
    bestPrice,
    expectedKm,
    age,
    strengths: strengths.length ? strengths : ['Standard market demand and profile support this estimate.'],
    caution: caution.length ? caution : ['No major negative pricing signals from the entered data.'],
    headline: `Estimated Selectt procurement range for your ${year} ${make} ${model} ${variant}`
  };
};

const SellCarPage = () => {
  const { user } = useAuth();
  const [widgetStep, setWidgetStep] = useState(1);
  const [submittedData, setSubmittedData] = useState(null);
  const [leadName, setLeadName] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [notes, setNotes] = useState('');
  const [bookingSubmitted, setBookingSubmitted] = useState(false);
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState('');

  const [steps, setSteps] = useState(DEFAULT_STEPS);
  const [activeStep, setActiveStep] = useState(0);
  const [sellBanner, setSellBanner] = useState(null);
  const [loadingBanners, setLoadingBanners] = useState(true);

  useEffect(() => {
    // Set page title and meta description for SEO
    document.title = "Sell Your Car Instantly - Best Valuation Guaranteed | Selectt";
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = "description";
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = "Get a free instant valuation for your car online on Selectt. Sell your car from home, get free inspection, instant payment, and hassle-free RC transfer.";

    Promise.all([
      fetch(`${API_URL}/api/banners?page=sell-car&type=promo`).then(res => res.json()).catch(() => []),
      fetch(`${API_URL}/api/banners?page=sell-car&type=step`).then(res => res.json()).catch(() => [])
    ]).then(([promoData, stepData]) => {
      if (Array.isArray(promoData) && promoData.length > 0) {
        setSellBanner(promoData[0]);
      }
      if (Array.isArray(stepData) && stepData.length > 0) {
        const mapped = stepData.map((b, index) => ({
          id: b.id,
          title: b.title || `Step ${index + 1}`,
          description: b.subtitle || '',
          imageUrl: b.image_url?.startsWith('/') ? `${API_URL}${b.image_url}` : b.image_url,
          badge: b.cta_text || ''
        }));
        setSteps(mapped);
      }
      setLoadingBanners(false);
    }).catch(() => {
      setLoadingBanners(false);
    });
  }, []);

  const getBannerImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return `${API_URL}${path}`;
  };

  const prevStep = () => {
    setActiveStep((prev) => (prev === 0 ? steps.length - 1 : prev - 1));
  };

  const nextStep = () => {
    setActiveStep((prev) => (prev === steps.length - 1 ? 0 : prev + 1));
  };

  const getCardClasses = (idx) => {
    const diff = idx - activeStep;
    let offset = diff;
    if (offset < -1) offset += steps.length;
    if (offset > steps.length - 2) offset -= steps.length;

    const base = "absolute inset-0 m-auto w-[300px] md:w-[380px] h-[300px] md:h-[380px] rounded-[1.75rem] overflow-hidden shadow-[0_15px_35px_rgba(0,0,0,0.3)] transition-all duration-500 ease-out select-none";

    if (offset === 0) {
      return `${base} translate-x-0 scale-[1.03] md:scale-105 opacity-100 z-30 cursor-default`;
    } else if (offset === -1) {
      return `${base} -translate-x-[55%] md:-translate-x-[78%] scale-[0.78] md:scale-[0.82] opacity-50 md:opacity-60 z-20 cursor-pointer brightness-[1.15]`;
    } else if (offset === 1) {
      return `${base} translate-x-[55%] md:translate-x-[78%] scale-[0.78] md:scale-[0.82] opacity-50 md:opacity-60 z-20 cursor-pointer brightness-[1.15]`;
    } else {
      return `${base} ${offset < 0 ? '-translate-x-[130%] md:-translate-x-[160%]' : 'translate-x-[130%] md:translate-x-[160%]'} scale-75 opacity-0 z-10 pointer-events-none`;
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Autoplay slider effect (auto swing every 4 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      nextStep();
    }, 4000);
    return () => clearInterval(interval);
  }, [activeStep]);

  useEffect(() => {
    if (submittedData) {
      setLeadName(user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : '');
      setLeadPhone(submittedData.formData.phone || user?.phone || '');
      window.scrollTo(0, 0);
    }
  }, [submittedData, user]);

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setBookingError('');
    setBookingSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/sell-requests/${submittedData?.createdRequestId || submittedData?.id}/inspection`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: leadName,
          phone: leadPhone,
          appointmentDate,
          time: appointmentTime,
          notes
        })
      });

      const responseData = await res.json();
      if (!res.ok) {
        throw new Error(responseData.message || 'Booking failed');
      }

      setBookingSubmitted(true);
    } catch (err) {
      setBookingError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setBookingSubmitting(false);
    }
  };

  const advantages = [
    {
      icon: <TrendingUp size={24} />,
      title: "Best Price Guarantee",
      desc: "We leverage vast market data to ensure you get the highest possible value for your car.",
      themeColor: "#00C9AF",
      bg: "linear-gradient(135deg, #09131F 0%, #06282E 100%)",
      border: "rgba(0, 196, 175, 0.3)"
    },
    {
      icon: <Clock size={24} />,
      title: "Sell in 1 Hour",
      desc: "Our streamlined process means from evaluation to payment, it only takes 60 minutes.",
      themeColor: "#3B82F6",
      bg: "linear-gradient(135deg, #09131F 0%, #0D2040 100%)",
      border: "rgba(59, 130, 246, 0.3)"
    },
    {
      icon: <Award size={24} />,
      title: "Free RC Transfer",
      desc: "We handle all the pesky RTO paperwork and RC transfer documentation entirely free of cost.",
      themeColor: "#10B981",
      bg: "linear-gradient(135deg, #09131F 0%, #072F22 100%)",
      border: "rgba(16, 185, 129, 0.3)"
    },
    {
      icon: <ShieldCheck size={24} />,
      title: "Safe & Secure",
      desc: "A completely transparent process. Zero hidden charges, reliable payment systems.",
      themeColor: "#A855F7",
      bg: "linear-gradient(135deg, #09131F 0%, #20133F 100%)",
      border: "rgba(168, 85, 247, 0.3)"
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0C1B33] font-sans pb-20 w-full overflow-x-hidden">

      {/* 1. FULL BLEED HERO WIDGET SECTION */}
      <section className="relative w-full overflow-hidden bg-[#F8FAFC]">
        <SellCarFormWidget onSubmitted={setSubmittedData} onStepChange={setWidgetStep} />
      </section>

      {/* LOWER PAGE SECTIONS (Only visible when on initial Step 1) */}
      {widgetStep === 1 && (
        <>
          {/* 2. HOW IT WORKS */}
          <section className="py-8 bg-slate-50 border-y border-slate-200 shadow-inner relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 relative z-10">
              <div className="text-center mb-0">
                <h2 className="text-3xl lg:text-5xl font-black text-[#0C1B33] mb-3 tracking-tight">
                  Sell your car in 4 easy steps
                </h2>
                <p className="text-slate-500 text-lg max-w-2xl mx-auto font-semibold">
                  Its fast, reliable and hassle free.
                </p>
              </div>

              {/* Carousel Slider Container */}
              <div className="relative w-full max-w-[950px] h-[420px] md:h-[520px] mx-auto flex items-center justify-center">

                {/* Left navigation arrow */}
                <button
                  onClick={prevStep}
                  className="absolute left-2 md:-left-16 z-40 bg-white hover:bg-slate-100 border border-slate-200/80 p-3 md:p-4 rounded-full shadow-lg text-slate-700 hover:text-black transition-all hover:scale-110 active:scale-95 flex items-center justify-center focus:outline-none"
                  aria-label="Previous Step"
                >
                  <ChevronLeft size={22} className="stroke-[3]" />
                </button>

                {/* Steps Track */}
                <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                  {loadingBanners ? (
                    <>
                      {/* Left Skeleton Card */}
                      <div className="absolute inset-y-0 left-4 m-auto w-[300px] md:w-[380px] h-[300px] md:h-[380px] rounded-[1.75rem] bg-slate-200 animate-pulse border border-slate-300 scale-75 opacity-40 shrink-0 hidden md:block" />
                      {/* Active Skeleton Card */}
                      <div className="absolute inset-0 m-auto w-[300px] md:w-[380px] h-[300px] md:h-[380px] rounded-[1.75rem] bg-slate-200 animate-pulse border border-slate-350 shadow-xl flex flex-col justify-end p-7">
                        <div className="w-1/3 h-5 bg-slate-300 rounded mb-2.5" />
                        <div className="w-2/3 h-4 bg-slate-300 rounded" />
                      </div>
                      {/* Right Skeleton Card */}
                      <div className="absolute inset-y-0 right-4 m-auto w-[300px] md:w-[380px] h-[300px] md:h-[380px] rounded-[1.75rem] bg-slate-200 animate-pulse border border-slate-300 scale-75 opacity-40 shrink-0 hidden md:block" />
                    </>
                  ) : (
                    steps.map((step, idx) => {
                      const diff = idx - activeStep;
                      let offset = diff;
                      if (offset < -1) offset += steps.length;
                      if (offset > steps.length - 2) offset -= steps.length;
                      const isActive = offset === 0;

                      return (
                        <div
                          key={step.id}
                          className={getCardClasses(idx)}
                          onClick={() => {
                            if (!isActive) {
                              setActiveStep(idx);
                            }
                          }}
                        >
                          {/* Background Image — full image shown, no crop */}
                          <img
                            src={step.imageUrl}
                            alt={step.title}
                            className="absolute inset-0 w-full h-full object-contain bg-black"
                          />

                          {/* Dark gradient overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/100 via-black/45 to-transparent z-10" />

                          {/* Content over image */}
                          <div className="absolute inset-x-0 bottom-0 p-5 md:p-7 z-20 flex flex-col text-left">
                            {/* Step Number + Title */}
                            <h3 className="text-base md:text-lg font-black text-white leading-tight mb-1.5 tracking-wide drop-shadow-md">
                              {step.title}
                            </h3>

                            {/* Description */}
                            <p className="text-slate-300 text-[10px] md:text-xs font-semibold leading-relaxed line-clamp-3">
                              {step.description}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Right navigation arrow */}
                <button
                  onClick={nextStep}
                  className="absolute right-2 md:-right-16 z-40 bg-white hover:bg-slate-100 border border-slate-200/80 p-3 md:p-4 rounded-full shadow-lg text-slate-700 hover:text-black transition-all hover:scale-110 active:scale-95 flex items-center justify-center focus:outline-none"
                  aria-label="Next Step"
                >
                  <ChevronRight size={22} className="stroke-[3]" />
                </button>
              </div>

              {/* Dots Indicator */}
              <div className="flex justify-center items-center gap-2.5 mt-3">
                {steps.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveStep(idx)}
                    className={`h-2 rounded-full transition-all duration-300 ${activeStep === idx
                      ? 'w-7 bg-[#00C9AF] shadow-sm shadow-[#00C9AF]/30'
                      : 'w-2 bg-slate-300 hover:bg-slate-400'
                      }`}
                    aria-label={`Go to step ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* 3. WHY CHOOSE US (BENEFITS) */}
          <section className="py-20 bg-transparent">
            <div className="max-w-7xl mx-auto px-4">
              <div className="mb-16 md:flex md:items-end md:justify-between">
                <div className="max-w-2xl">
                  <span className="text-[#00C9AF] font-bold text-sm tracking-wider uppercase mb-2 block">The Selectt Advantage</span>
                  <h2 className="text-3xl lg:text-4xl font-extrabold text-[#0C1B33]">Why Sell To Us?</h2>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {advantages.map((item, idx) => (
                  <div
                    key={idx}
                    className="relative p-8 rounded-3xl overflow-hidden transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1 group cursor-default shadow-[0_12px_40px_rgba(0,0,0,0.25)] border text-left"
                    style={{
                      background: item.bg,
                      borderColor: item.border,
                    }}
                  >
                    {/* Glossy top sheen */}
                    <div
                      className="absolute top-0 left-0 right-0 h-[40%] rounded-t-3xl pointer-events-none"
                      style={{
                        background: 'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, transparent 100%)',
                      }}
                    />

                    {/* Liquid blob glow */}
                    <div
                      className="absolute -bottom-6 -right-6 w-28 h-28 rounded-full pointer-events-none opacity-25 group-hover:opacity-45 transition-opacity duration-500"
                      style={{
                        background: `radial-gradient(circle, ${item.themeColor} 0%, transparent 70%)`,
                        filter: 'blur(16px)',
                      }}
                    />
                    <div
                      className="absolute -top-6 -left-6 w-20 h-20 rounded-full pointer-events-none opacity-15 group-hover:opacity-30 transition-opacity duration-500"
                      style={{
                        background: `radial-gradient(circle, ${item.themeColor} 0%, transparent 70%)`,
                        filter: 'blur(12px)',
                      }}
                    />

                    {/* Header Icon */}
                    <div className="flex justify-between items-start mb-8 relative z-10">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110"
                        style={{
                          background: `radial-gradient(circle, ${item.themeColor}33 0%, ${item.themeColor}11 100%)`,
                          color: item.themeColor,
                          border: `1px solid ${item.themeColor}44`,
                        }}
                      >
                        {item.icon}
                      </div>
                    </div>

                    {/* Title & Desc */}
                    <div className="relative z-10">
                      <h3 className="text-xl font-extrabold text-white mb-2 tracking-tight group-hover:text-[#00C9AF] transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-slate-400 text-sm font-medium leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 4. CTA BANNER */}
          <section className="py-20 bg-white border-y border-slate-200">
            <div className="max-w-5xl mx-auto px-4">
              {loadingBanners ? (
                <div className="w-full h-[280px] md:h-[360px] bg-slate-200 animate-pulse rounded-3xl" />
              ) : sellBanner ? (
                <Link
                  to={sellBanner.cta_link || '#'}
                  className="relative block border border-slate-200/80 dark:border-slate-800/10 rounded-3xl overflow-hidden shadow-2xl group/banner h-[280px] md:h-[360px] w-full"
                >
                  {/* Background Image */}
                  {sellBanner.image_url ? (
                    <img
                      src={getBannerImageUrl(sellBanner.image_url)}
                      alt="Promo Banner"
                      className="w-full h-full object-fill transition-transform duration-700 group-hover/banner:scale-105"
                      style={{
                        transform: sellBanner.flip_image ? 'scaleX(-1)' : 'none',
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-[#0C1B33] flex items-center justify-center text-white text-xs">
                      No Image Uploaded
                    </div>
                  )}
                </Link>
              ) : (
                <div className="relative overflow-hidden rounded-3xl shadow-2xl" style={{ background: 'linear-gradient(135deg, #040d18 0%, #081424 40%, #0c1b33 70%, #071120 100%)' }}>
                  {/* Subtle grid texture */}
                  <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '44px 44px' }} />

                  {/* Animated teal orb top-right */}
                  <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(0,201,175,0.22) 0%, rgba(0,201,175,0.06) 45%, transparent 70%)', filter: 'blur(40px)' }} />

                  {/* Animated purple orb bottom-left */}
                  <div className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.18) 0%, rgba(139,92,246,0.05) 45%, transparent 70%)', filter: 'blur(50px)' }} />

                  {/* Gold accent orb center-top */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 pointer-events-none" style={{ background: 'radial-gradient(ellipse, rgba(229,169,59,0.08) 0%, transparent 70%)', filter: 'blur(20px)' }} />

                  {/* Border glow */}
                  <div className="absolute inset-0 rounded-3xl border border-white/[0.06] pointer-events-none" />
                  <div className="absolute inset-0 rounded-3xl border border-[#00C9AF]/10 pointer-events-none" />

                  {/* Content */}
                  <div className="relative z-10 flex flex-col lg:flex-row items-center gap-10 lg:gap-16 p-8 lg:p-14">

                    {/* Center: Text */}
                    <div className="flex-1 text-center lg:text-left">
                      <p className="text-[#00C9AF] font-bold text-xs tracking-[0.25em] uppercase mb-3 opacity-80">Looking to buy instead?</p>
                      <h2 className="text-3xl lg:text-4xl xl:text-5xl font-black text-white leading-tight mb-4" style={{ textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}>
                        Change Your Mind?<br />
                        <span style={{ background: 'linear-gradient(135deg, #00C9AF 0%, #00e5cf 50%, #00C9AF 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                          Ready to Buy?
                        </span>
                      </h2>
                      <p className="text-[#00C9AF] text-base lg:text-lg font-medium leading-relaxed max-w-lg">
                        Maybe you're looking to upgrade instead? Explore thousands of fully inspected, assured cars waiting for you.
                      </p>

                      {/* Stats row */}
                      <div className="flex gap-6 mt-5 justify-center lg:justify-start">
                        {[['10,000+', 'Cars Listed'], ['100%', 'Inspected'], ['Instant', 'Booking']].map(([val, label]) => (
                          <div key={label} className="text-center lg:text-left">
                            <div className="text-white font-black text-base leading-none">{val}</div>
                            <div className="text-slate-500 text-[10px] font-semibold mt-0.5">{label}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right: CTA Button */}
                    <div className="shrink-0">
                      <Link
                        to="/buy-cars"
                        className="group/btn relative inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-base overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                        style={{ background: 'linear-gradient(135deg, #00C9AF 0%, #00b89e 100%)', color: '#040d18', boxShadow: '0 8px 30px rgba(0,201,175,0.35), 0 0 0 1px rgba(0,201,175,0.2)' }}
                      >
                        {/* Button shimmer */}
                        <div className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 60%)' }} />
                        <span className="relative">Explore Cars</span>
                        <ChevronRight size={20} className="relative transition-transform duration-300 group-hover/btn:translate-x-1" />
                      </Link>
                    </div>

                  </div>
                </div>
              )}
            </div>
          </section>

          <SectionDivider title="What Motivates Us" align="left" bgClass="bg-[#f9f9f9]" textClass="text-[#0C1B33]" />
          <Testimonials
            bgClass="bg-transparent md:bg-transparent"
            textClass="text-slate-600"
            btnActive="bg-white border border-slate-300 text-slate-700 hover:bg-[#00C9AF] hover:border-[#00C9AF] hover:text-[#0C1B33] hover:shadow-md"
            btnDisabled="bg-slate-200/50 border border-slate-300/80 text-slate-400 cursor-not-allowed"
          />
          <div className="">
            <FAQ dark={false} />
          </div>
        </>
      )}
    </div>
  );
};

export default SellCarPage;
