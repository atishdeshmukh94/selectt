import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import PageMeta from '../components/common/PageMeta';
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
  Sparkles,
  ShieldAlert,
  FileCheck,
  HelpCircle,
  ChevronDown
} from 'lucide-react';
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
    title: "3. Receive Final Offer & Get Paid",
    description: "Accept our best competitive offer and receive full payment via secure bank transfer within 24 hours.",
    imageUrl: "https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?w=800&auto=format&fit=crop&q=80",
    badge: "Instant Payment"
  },
  {
    id: 4,
    title: "4. Hassle-Free Paperwork",
    description: "100% free RC transfer and comprehensive Seller Protection Policy until ownership transfer completes.",
    imageUrl: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80",
    badge: "Free RC Transfer"
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
  const { citySlug } = useParams();
  const { user } = useAuth();
  
  // Dynamic City Resolution
  const rawCity = citySlug
    ? citySlug.charAt(0).toUpperCase() + citySlug.slice(1).toLowerCase()
    : localStorage.getItem('selectedCity') || 'Mumbai';
  const displayCity = rawCity === 'All' ? 'Mumbai' : rawCity;

  const [widgetStep, setWidgetStep] = useState(1);
  const [submittedData, setSubmittedData] = useState(null);
  const [leadName, setLeadName] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('10:00 AM - 11:00 AM');
  const [notes, setNotes] = useState('');
  const [bookingSubmitted, setBookingSubmitted] = useState(false);
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  const [steps, setSteps] = useState(DEFAULT_STEPS);
  const [activeStep, setActiveStep] = useState(0);
  const [sellBanner, setSellBanner] = useState(null);
  const [loadingBanners, setLoadingBanners] = useState(true);

  useEffect(() => {
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
      desc: `We leverage real-time auction bids across 1,500+ verified dealers to ensure you get top market value in ${displayCity}.`,
      themeColor: "#00C9AF",
      bg: "linear-gradient(135deg, #09131F 0%, #06282E 100%)",
      border: "rgba(0, 196, 175, 0.3)"
    },
    {
      icon: <Clock size={24} />,
      title: "Instant 24-Hour Payment",
      desc: "Receive 100% payment directly in your bank account immediately upon accepting our transparent offer.",
      themeColor: "#3B82F6",
      bg: "linear-gradient(135deg, #09131F 0%, #0D2040 100%)",
      border: "rgba(59, 130, 246, 0.3)"
    },
    {
      icon: <Award size={24} />,
      title: "100% Free RC Transfer",
      desc: "Our RTO specialists handle all legal documentation, hypothecation removal, and registration transfers for free.",
      themeColor: "#10B981",
      bg: "linear-gradient(135deg, #09131F 0%, #072F22 100%)",
      border: "rgba(16, 185, 129, 0.3)"
    },
    {
      icon: <ShieldCheck size={24} />,
      title: "Seller Protection Policy",
      desc: "You are legally protected from all traffic challans, accidents, or misuse liabilities until the RC is transferred.",
      themeColor: "#A855F7",
      bg: "linear-gradient(135deg, #09131F 0%, #20133F 100%)",
      border: "rgba(168, 85, 247, 0.3)"
    }
  ];

  const sellerFaqs = [
    {
      q: `How do I sell my car online in ${displayCity} with Selectt?`,
      a: `Enter your car's registration number on our website for an instant online valuation. Then, book a free doorstep inspection at your convenience. If you accept our final offer, we process the payment instantly and handle all the paperwork.`
    },
    {
      q: "How long does it take to get paid for my car?",
      a: "Selectt ensures you receive the full payment for your car via a secure bank transfer within 24 hours of accepting our offer."
    },
    {
      q: `Is the car inspection really free?`,
      a: `Yes, our comprehensive 200-point car inspection is completely free of charge, with no obligation to sell. We can conduct it at your home or office anywhere in ${displayCity}.`
    },
    {
      q: "What documents are required to sell my car?",
      a: "You will need the original RC (Registration Certificate), valid insurance, PUC certificate, all car keys, and your PAN card. If the car is on loan, a foreclosure letter from the bank is also needed."
    },
    {
      q: "How does Selectt handle the RC transfer?",
      a: "We manage the entire RC transfer process for free. Our team handles all RTO paperwork, and you are covered by our Seller Protection Policy until the ownership is officially transferred."
    }
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": sellerFaqs.map(item => ({
      "@type": "Question",
      "name": item.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.a
      }
    }))
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0C1B33] font-sans pb-20 w-full overflow-x-hidden">
      <PageMeta
        title={`Sell Used Car in ${displayCity} for the Best Price | Instant Payment | Selectt`}
        description={`Get the best price for your used car in ${displayCity} with Selectt. Enjoy a free doorstep inspection, instant payment within 24 hours, and a hassle-free RC transfer. Get your quote now!`}
        canonical={citySlug ? `/sell-car-in-${citySlug.toLowerCase()}` : '/sell-car'}
        schema={faqSchema}
      />

      {/* 1. FULL BLEED HERO WIDGET SECTION */}
      <section className="relative w-full overflow-hidden bg-[#F8FAFC]">
        <SellCarFormWidget onSubmitted={setSubmittedData} onStepChange={setWidgetStep} defaultCity={displayCity} />
      </section>

      {/* LOWER PAGE SECTIONS (Only visible when on initial Step 1) */}
      {widgetStep === 1 && (
        <>
          {/* 2. HOW IT WORKS */}
          <section className="py-12 bg-slate-50 border-y border-slate-200 shadow-inner relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 relative z-10">
              <div className="text-center mb-8">
                <span className="text-[#00A38D] font-heading font-black text-xs uppercase tracking-widest block mb-1">
                  Transparent 4-Step Process
                </span>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-black text-[#0C1B33] mb-2 tracking-tight">
                  How Selling Your Car Works in {displayCity}
                </h2>
                <p className="text-slate-500 text-sm sm:text-base max-w-2xl mx-auto font-medium">
                  Fast, transparent, and completely hassle-free from online valuation to doorstep pickup.
                </p>
              </div>

              {/* Carousel Slider Container */}
              <div className="relative w-full max-w-[950px] h-[420px] md:h-[500px] mx-auto flex items-center justify-center">

                {/* Left navigation arrow */}
                <button
                  onClick={prevStep}
                  className="absolute left-2 md:-left-16 z-40 bg-white hover:bg-slate-100 border border-slate-200/80 p-3 md:p-4 rounded-full shadow-lg text-slate-700 hover:text-black transition-all hover:scale-110 active:scale-95 flex items-center justify-center focus:outline-none cursor-pointer"
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
                            className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 hover:scale-105"
                          />

                          {/* Dark gradient overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent z-10" />

                          {/* Content over image */}
                          <div className="absolute inset-x-0 bottom-0 p-5 md:p-7 z-20 flex flex-col text-left">
                            <span className="inline-block bg-[#00C9AF] text-slate-950 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md mb-2 w-max">
                              {step.badge || `Step ${idx + 1}`}
                            </span>
                            {/* Step Number + Title */}
                            <h3 className="text-base md:text-lg font-black text-white leading-tight mb-1.5 tracking-wide drop-shadow-md">
                              {step.title}
                            </h3>

                            {/* Description */}
                            <p className="text-slate-300 text-[11px] md:text-xs font-semibold leading-relaxed line-clamp-3">
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
                  className="absolute right-2 md:-right-16 z-40 bg-white hover:bg-slate-100 border border-slate-200/80 p-3 md:p-4 rounded-full shadow-lg text-slate-700 hover:text-black transition-all hover:scale-110 active:scale-95 flex items-center justify-center focus:outline-none cursor-pointer"
                  aria-label="Next Step"
                >
                  <ChevronRight size={22} className="stroke-[3]" />
                </button>
              </div>

              {/* Dots Indicator */}
              <div className="flex justify-center items-center gap-1.5 mt-3 select-none" style={{ height: '16px', lineHeight: 0 }}>
                {steps.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveStep(idx)}
                    style={{
                      height: '4px',
                      minHeight: '4px',
                      maxHeight: '4px',
                      width: activeStep === idx ? '18px' : '4px',
                      minWidth: activeStep === idx ? '18px' : '4px',
                      maxWidth: activeStep === idx ? '18px' : '4px',
                      padding: 0,
                      margin: 0,
                      border: 'none',
                      outline: 'none',
                      boxSizing: 'border-box',
                      backgroundColor: activeStep === idx ? '#00C9AF' : '#cbd5e1',
                      borderRadius: '9999px',
                      display: 'inline-block',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    className="shrink-0"
                    aria-label={`Go to step ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* 3. THE SELECTT SELLER PROTECTION GUARANTEE */}
          <section className="py-12 sm:py-16 bg-white border-b border-slate-200">
            <div className="max-w-6xl mx-auto px-4">
              <div className="bg-gradient-to-br from-[#061426] via-[#0C1B33] to-[#061426] rounded-3xl p-6 sm:p-10 md:p-12 border border-[#00C9AF]/30 shadow-2xl relative overflow-hidden text-white text-left">
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#00C9AF]/10 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 w-full">
                  <div className="inline-flex items-center gap-2 bg-[#00C9AF]/20 border border-[#00C9AF]/40 px-3.5 py-1.5 rounded-full text-[#00C9AF] font-heading font-black text-xs uppercase tracking-wider mb-4">
                    <ShieldCheck size={16} /> 100% Peace of Mind
                  </div>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-black tracking-tight text-white mb-4">
                    The Selectt Seller Protection Guarantee
                  </h2>
                  <p className="text-slate-300 text-sm sm:text-base font-normal leading-relaxed mb-8 max-w-4xl">
                    Selling your car shouldn't come with post-handover anxiety. We protect you from all legal and financial liabilities from the exact minute of car handover until the RC transfer is officially registered in RTO records.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 w-full">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-xs hover:border-[#00C9AF]/30 transition-all">
                      <div className="w-10 h-10 rounded-xl bg-[#00C9AF]/20 text-[#00C9AF] flex items-center justify-center font-bold mb-3">
                        <ShieldAlert size={20} />
                      </div>
                      <h3 className="text-sm font-heading font-bold text-white mb-1">Zero Traffic Challan Liability</h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Any e-challans or traffic fines incurred post-handover are 100% indemnified and covered by Selectt.
                      </p>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-xs hover:border-[#00C9AF]/30 transition-all">
                      <div className="w-10 h-10 rounded-xl bg-[#00C9AF]/20 text-[#00C9AF] flex items-center justify-center font-bold mb-3">
                        <FileCheck size={20} />
                      </div>
                      <h3 className="text-sm font-heading font-bold text-white mb-1">Free RTO Documentation</h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Complete management of Form 29, 30, and state NOC clearance handled without any fees.
                      </p>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-xs hover:border-[#00C9AF]/30 transition-all">
                      <div className="w-10 h-10 rounded-xl bg-[#00C9AF]/20 text-[#00C9AF] flex items-center justify-center font-bold mb-3">
                        <CheckCircle2 size={20} />
                      </div>
                      <h3 className="text-sm font-heading font-bold text-white mb-1">Live Status Tracking</h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Track your RC transfer live at every step on your Selectt dashboard with instant SMS updates.
                      </p>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-xs hover:border-[#00C9AF]/30 transition-all">
                      <div className="w-10 h-10 rounded-xl bg-[#00C9AF]/20 text-[#00C9AF] flex items-center justify-center font-bold mb-3">
                        <Banknote size={20} />
                      </div>
                      <h3 className="text-sm font-heading font-bold text-white mb-1">Instant Bank Transfer</h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        100% secure payment directly into your bank account before vehicle handover. Zero escrow risk.
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 flex flex-wrap gap-4 items-center">
                    <Link
                      to="/selectt-inspection-process"
                      className="text-xs sm:text-sm font-heading font-bold text-[#00C9AF] hover:underline inline-flex items-center gap-1"
                    >
                      Learn about our 200-point inspection <ChevronRight size={16} />
                    </Link>
                    <span className="text-slate-600 hidden sm:inline">|</span>
                    <Link
                      to="/faq"
                      className="text-xs sm:text-sm font-heading font-semibold text-slate-300 hover:text-white hover:underline"
                    >
                      Have more questions? Visit our FAQ Hub
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 4. WHY CHOOSE US (BENEFITS) */}
          <section className="py-16 bg-transparent">
            <div className="max-w-7xl mx-auto px-4">
              <div className="mb-12 text-center md:text-left">
                <span className="text-[#00A38D] font-heading font-black text-xs tracking-wider uppercase mb-1 block">The Selectt Advantage</span>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-black text-[#0C1B33]">
                  Why Sell Your Car to Selectt in {displayCity}?
                </h2>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {advantages.map((item, idx) => (
                  <div
                    key={idx}
                    className="relative p-7 rounded-3xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 group cursor-default shadow-xl border text-left"
                    style={{
                      background: item.bg,
                      borderColor: item.border,
                    }}
                  >
                    <div className="flex justify-between items-start mb-6 relative z-10">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
                        style={{
                          background: `radial-gradient(circle, ${item.themeColor}33 0%, ${item.themeColor}11 100%)`,
                          color: item.themeColor,
                          border: `1px solid ${item.themeColor}44`,
                        }}
                      >
                        {item.icon}
                      </div>
                    </div>

                    <div className="relative z-10">
                      <h3 className="text-[15px] sm:text-base lg:text-[14px] xl:text-[16px] font-heading font-extrabold text-white mb-2 tracking-tight whitespace-nowrap overflow-hidden text-ellipsis group-hover:text-[#00C9AF] transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-slate-400 text-xs font-medium leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 5. CTA BANNER */}
          <section className="py-6 sm:py-8 bg-white border-y border-slate-200">
            <div className="max-w-5xl mx-auto px-4">
              {loadingBanners ? (
                <div className="w-full h-36 sm:h-52 md:h-64 bg-slate-200 animate-pulse rounded-2xl sm:rounded-3xl" />
              ) : sellBanner ? (
                <Link
                  to={sellBanner.cta_link || '#'}
                  className="relative block rounded-2xl sm:rounded-3xl overflow-hidden shadow-md hover:shadow-xl group/banner w-full border border-slate-200/80 bg-slate-900"
                >
                  {sellBanner.image_url ? (
                    <img
                      src={getBannerImageUrl(sellBanner.image_url)}
                      alt="Promo Banner"
                      className="w-full h-auto block rounded-2xl sm:rounded-3xl object-contain object-center transition-transform duration-700 group-hover/banner:scale-[1.01]"
                      style={{
                        transform: sellBanner.flip_image ? 'scaleX(-1)' : 'none',
                      }}
                    />
                  ) : (
                    <div className="w-full h-44 bg-[#0C1B33] flex items-center justify-center text-white text-xs rounded-2xl sm:rounded-3xl">
                      No Image Uploaded
                    </div>
                  )}
                </Link>
              ) : (
                <div className="relative overflow-hidden rounded-3xl shadow-2xl" style={{ background: 'linear-gradient(135deg, #040d18 0%, #081424 40%, #0c1b33 70%, #071120 100%)' }}>
                  <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '44px 44px' }} />
                  <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(0,201,175,0.22) 0%, rgba(0,201,175,0.06) 45%, transparent 70%)', filter: 'blur(40px)' }} />
                  <div className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.18) 0%, rgba(139,92,246,0.05) 45%, transparent 70%)', filter: 'blur(50px)' }} />
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 pointer-events-none" style={{ background: 'radial-gradient(ellipse, rgba(229,169,59,0.08) 0%, transparent 70%)', filter: 'blur(20px)' }} />
                  <div className="absolute inset-0 rounded-3xl border border-white/[0.06] pointer-events-none" />
                  <div className="absolute inset-0 rounded-3xl border border-[#00C9AF]/10 pointer-events-none" />

                  <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8 lg:gap-16 p-8 lg:p-12 text-center lg:text-left">
                    <div className="flex-1">
                      <p className="text-[#00C9AF] font-heading font-black text-xs tracking-[0.25em] uppercase mb-2">Looking to upgrade instead?</p>
                      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-black text-white leading-tight mb-3">
                        Change Your Mind? <br />
                        <span className="text-[#00C9AF]">Explore Certified Pre-Owned Cars</span>
                      </h2>
                      <p className="text-slate-300 text-sm font-normal leading-relaxed max-w-lg">
                        Browse 500+ verified cars with 200-point inspection and 1-year warranty in {displayCity}.
                      </p>
                    </div>
                    <div className="shrink-0">
                      <Link
                        to="/buy-cars"
                        className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl font-heading font-black text-sm text-slate-950 bg-[#00C9AF] hover:bg-[#00B4A0] shadow-lg shadow-[#00C9AF]/35 transition-all hover:-translate-y-0.5 cursor-pointer"
                      >
                        Explore Cars <ChevronRight size={18} />
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* 6. SOCIAL PROOF */}
          <SectionDivider title={`Trusted by Sellers Across ${displayCity}`} align="left" bgClass="bg-[#f9f9f9]" textClass="text-[#0C1B33]" />
          <Testimonials
            bgClass="bg-transparent md:bg-transparent"
            textClass="text-slate-600"
            btnActive="bg-white border border-slate-300 text-slate-700 hover:bg-[#00C9AF] hover:border-[#00C9AF] hover:text-[#0C1B33] hover:shadow-md"
            btnDisabled="bg-slate-200/50 border border-slate-300/80 text-slate-400 cursor-not-allowed"
          />

          {/* 7. DEDICATED SELLER FAQ SECTION */}
          <section className="py-16 bg-white border-t border-slate-200">
            <div className="max-w-4xl mx-auto px-4 text-left">
              <div className="text-center mb-10">
                <span className="text-[#00A38D] font-heading font-black text-xs uppercase tracking-widest block mb-1">
                  Got Questions?
                </span>
                <h2 className="text-2xl sm:text-3xl font-heading font-black text-[#0C1B33]">
                  Frequently Asked Questions About Selling Your Car
                </h2>
                <p className="text-slate-500 text-sm mt-1">
                  Everything you need to know about pricing, inspection, and payment.
                </p>
              </div>

              <div className="space-y-3">
                {sellerFaqs.map((faq, idx) => {
                  const isOpen = openFaqIndex === idx;
                  return (
                    <div
                      key={idx}
                      className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/60 transition-colors"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaqIndex(isOpen ? -1 : idx)}
                        className="w-full flex items-center justify-between p-4 sm:p-5 text-left font-heading font-bold text-sm sm:text-base text-slate-900 hover:text-[#00A38D] cursor-pointer"
                      >
                        <span className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-[#00C9AF]/15 text-[#00A38D] text-xs font-black flex items-center justify-center shrink-0">
                            Q
                          </span>
                          {faq.q}
                        </span>
                        <ChevronDown
                          size={18}
                          className={`text-slate-500 transition-transform duration-300 shrink-0 ml-2 ${isOpen ? 'rotate-180 text-[#00A38D]' : ''}`}
                        />
                      </button>
                      {isOpen && (
                        <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 font-normal leading-relaxed border-t border-slate-200/50 bg-white">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default SellCarPage;
