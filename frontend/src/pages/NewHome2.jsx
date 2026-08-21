import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Coins,
  Truck,
  RotateCcw,
  FileText,
  ArrowRight,
  Search,
  MapPin,
  Heart,
  Calendar,
  Gauge,
  Fuel,
  CheckCircle2,
  TrendingDown,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Award,
  BadgeCheck
} from 'lucide-react';
import { API_URL } from '../config/api';
import FAQ from '../components/home/FAQ';
import Reveal from '../components/common/Reveal';

const FALLBACK_CARS = [
  {
    id: 1,
    make: 'Hyundai',
    model: 'Creta SX ✦',
    variant: '1.5 Petrol',
    year: 2022,
    price: 1240000,
    km: 18200,
    fuelType: 'Petrol',
    transmission: 'Manual',
    image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 400'%3E%3Crect width='600' height='400' fill='%23f3f4f6'/%3E%3Ccircle cx='300' cy='200' r='40' fill='none' stroke='%23e5e7eb' stroke-width='8'/%3E%3Ccircle cx='300' cy='200' r='40' fill='none' stroke='%239ca3af' stroke-width='8' stroke-dasharray='160' stroke-dashoffset='80' stroke-linecap='round'%3E%3CanimateTransform attributeName='transform' type='rotate' from='0 300 200' to='360 300 200' dur='1s' repeatCount='indefinite'/%3E%3C/circle%3E%3C/svg%3E",
    location: 'Mumbai',
    tag: 'Verified'
  },
  {
    id: 2,
    make: 'Tata',
    model: 'Nexon EV Max',
    variant: 'XZ+ Lux',
    year: 2023,
    price: 1680000,
    km: 9800,
    fuelType: 'EV',
    transmission: 'Automatic',
    image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 400'%3E%3Crect width='600' height='400' fill='%23f3f4f6'/%3E%3Ccircle cx='300' cy='200' r='40' fill='none' stroke='%23e5e7eb' stroke-width='8'/%3E%3Ccircle cx='300' cy='200' r='40' fill='none' stroke='%239ca3af' stroke-width='8' stroke-dasharray='160' stroke-dashoffset='80' stroke-linecap='round'%3E%3CanimateTransform attributeName='transform' type='rotate' from='0 300 200' to='360 300 200' dur='1s' repeatCount='indefinite'/%3E%3C/circle%3E%3C/svg%3E",
    location: 'Delhi NCR',
    badgeText: 'Electric'
  },
  {
    id: 3,
    make: 'Honda',
    model: 'City ZX CVT',
    variant: 'i-VTEC Auto',
    year: 2021,
    price: 890000,
    km: 32000,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 400'%3E%3Crect width='600' height='400' fill='%23f3f4f6'/%3E%3Ccircle cx='300' cy='200' r='40' fill='none' stroke='%23e5e7eb' stroke-width='8'/%3E%3Ccircle cx='300' cy='200' r='40' fill='none' stroke='%239ca3af' stroke-width='8' stroke-dasharray='160' stroke-dashoffset='80' stroke-linecap='round'%3E%3CanimateTransform attributeName='transform' type='rotate' from='0 300 200' to='360 300 200' dur='1s' repeatCount='indefinite'/%3E%3C/circle%3E%3C/svg%3E",
    location: 'Bangalore',
    badgeText: 'Hot Deal'
  }
];

// Interactive Mouse Tracker & 3D Tilt Card Wrapper Component
function InteractiveTiltCard({ children, className = "", onClick }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Maps coordinates to degrees of rotation
  const rotateX = useTransform(y, [-150, 150], [10, -10]);
  const rotateY = useTransform(x, [-150, 150], [-10, 10]);

  function handleMouseMove(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = event.clientX - rect.left - width / 2;
    const mouseY = event.clientY - rect.top - height / 2;
    x.set(mouseX);
    y.set(mouseY);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      onClick={onClick}
      className={`relative cursor-pointer transition-shadow duration-300 hover:shadow-2xl hover:shadow-[#00e4c0]/10 border border-white/5 hover:border-[#00e4c0]/30 rounded-2xl overflow-hidden bg-[#162947] ${className}`}
    >
      {children}
    </motion.div>
  );
}

export default function NewHome2() {
  const navigate = useNavigate();
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [allCars, setAllCars] = useState([]);
  const [brands, setBrands] = useState([]);
  const [selectedCity, setSelectedCity] = useState(localStorage.getItem('user_city') || 'Delhi NCR');
  const [budget, setBudget] = useState('All budgets');
  const [brand, setBrand] = useState('All brands');
  const [bodyType, setBodyType] = useState('All types');
  const [activePromiseTab, setActivePromiseTab] = useState(0);

  // Stats Counters
  const [listedCount, setListedCount] = useState(0);
  const [buyerCount, setBuyerCount] = useState(0);
  const [deliveryCount, setDeliveryCount] = useState(0);

  // Fetch mouse position for radial gradient trailing light
  useEffect(() => {
    const handleMouseMove = (e) => {
      setCoords({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Fetch live cars and brands
  useEffect(() => {
    fetch(`${API_URL}/api/cars`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const available = data.filter(car => car.status !== 'sold_out');
          setAllCars(available.slice(0, 6));
        }
      })
      .catch((e) => console.error("Error loading cars:", e));

    fetch(`${API_URL}/api/car-counts-by-brand`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setBrands(data.slice(0, 8));
        }
      })
      .catch((e) => console.error("Error loading brands:", e));

    // Animate statistics counters
    const interval = setInterval(() => {
      setListedCount((prev) => (prev < 1250 ? prev + 25 : 1250));
      setBuyerCount((prev) => (prev < 9800 ? prev + 200 : 9800));
      setDeliveryCount((prev) => (prev < 24 ? prev + 1 : 24));
    }, 30);

    return () => clearInterval(interval);
  }, []);

  // Filter submit handler
  const handleSearchSubmit = () => {
    let query = `/buy-cars?city=${encodeURIComponent(selectedCity)}`;
    if (budget !== 'All budgets') query += `&budget=${encodeURIComponent(budget)}`;
    if (brand !== 'All brands') query += `&brand=${encodeURIComponent(brand)}`;
    if (bodyType !== 'All types') query += `&type=${encodeURIComponent(bodyType)}`;
    navigate(query);
  };

  const promiseTabs = [
    {
      title: "200-Points Inspected",
      description: "Every Selectt car undergoes an exhaustive multi-point inspection process covering engine, suspension, electronics, transmission, and body paint. You receive the complete detailed checklist.",
      details: ["Engine Compression Check", "Suspension & Braking Test", "Paint & Body Panel Audit", "Interior & Aircon Functionality"],
      icon: <ShieldCheck className="size-8 text-[#00e4c0]" />
    },
    {
      title: "5-Day Return Guarantee",
      description: "Love it or return it. Drive your Selectt car for up to 5 days or 300 kms. If you feel it's not the right match, return it for a complete 100% refund with zero cancellation fees.",
      details: ["100% Refund Assured", "No Questions Asked policy", "Max 300 km test period", "Zero hidden paperwork fees"],
      icon: <RotateCcw className="size-8 text-[#00e4c0]" />
    },
    {
      title: "Pan-India Home Delivery",
      description: "Selectt brings the showroom right to your doorstep. Choose contactless online checkout, and we will inspect, detail, and transport the car directly to your home inside 48 hours.",
      details: ["Doorstep delivery in 48 hours", "Fully sanitised handover", "Instant paperless registration transfer", "First tank of fuel on us"],
      icon: <Truck className="size-8 text-[#00e4c0]" />
    }
  ];

  return (
    <div className="relative min-h-screen bg-[#0c1b33] text-[#f9f9f9] overflow-hidden font-sans">


      {/* Grid lines background decoration */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0" />

      {/* Dynamic Hero Section */}
      <section className="relative pt-32 pb-20 px-6 max-w-7xl mx-auto z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 text-left space-y-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-[#00e4c0]/10 border border-[#00e4c0]/30 text-[#00e4c0] px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider"
          >
            <Sparkles className="size-4" />
            <span>Premium Pre-Owned Vehicles</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none"
          >
            Elevate Your <br />
            <span className="text-[#00e4c0] bg-gradient-to-r from-[#00e4c0] to-teal-300 bg-clip-text text-transparent">Driving Experience</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-slate-400 text-lg max-w-xl leading-relaxed"
          >
            Explore Selectt's elite collection of pre-owned luxury, SUV, electric, and performance cars. Certified, detailed, and delivered to your driveway.
          </motion.p>

          {/* Interactive Search Panel */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-[#162947]/95 border border-white/10 p-6 rounded-3xl shadow-xl space-y-4 max-w-2xl relative"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* City Filter */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold uppercase tracking-wider text-[#00e4c0] flex items-center gap-1.5">
                  <MapPin className="size-3.5" /> City
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full bg-[#0c1b33] border border-white/15 rounded-xl px-3 py-2.5 text-sm text-[#f9f9f9] focus:outline-none focus:border-[#00e4c0] cursor-pointer"
                >
                  <option value="Delhi NCR">Delhi NCR</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Bangalore">Bangalore</option>
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="Pune">Pune</option>
                </select>
              </div>

              {/* Brand Filter */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold uppercase tracking-wider text-[#00e4c0]">Brand</label>
                <select
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full bg-[#0c1b33] border border-white/15 rounded-xl px-3 py-2.5 text-sm text-[#f9f9f9] focus:outline-none focus:border-[#00e4c0] cursor-pointer"
                >
                  <option value="All brands">All Brands</option>
                  <option value="Hyundai">Hyundai</option>
                  <option value="Tata">Tata</option>
                  <option value="Honda">Honda</option>
                  <option value="Maruti Suzuki">Maruti Suzuki</option>
                  <option value="BMW">BMW</option>
                  <option value="Mahindra">Mahindra</option>
                </select>
              </div>

              {/* Budget Filter */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold uppercase tracking-wider text-[#00e4c0]">Budget</label>
                <select
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full bg-[#0c1b33] border border-white/15 rounded-xl px-3 py-2.5 text-sm text-[#f9f9f9] focus:outline-none focus:border-[#00e4c0] cursor-pointer"
                >
                  <option value="All budgets">All Budgets</option>
                  <option value="Under 5 Lakh">Under 5 Lakh</option>
                  <option value="5-10 Lakh">5 - 10 Lakh</option>
                  <option value="10-15 Lakh">10 - 15 Lakh</option>
                  <option value="Above 15 Lakh">Above 15 Lakh</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleSearchSubmit}
              className="w-full bg-[#00e4c0] hover:bg-[#00c4a7] text-[#0c1b33] font-bold py-3.5 rounded-xl transition duration-300 flex items-center justify-center gap-2 shadow-lg shadow-[#00e4c0]/20 text-sm cursor-pointer"
            >
              <Search className="size-4" />
              <span>Search Certified Cars</span>
            </button>
          </motion.div>
        </div>

        {/* Right floating 3D luxury car preview block */}
        <div className="lg:col-span-5 relative h-[380px] lg:h-[480px] w-full flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full h-full relative"
          >
            {/* Base glowing visual container */}
            <div className="absolute top-[20%] left-[-10%] w-[120%] h-[60%] bg-[#00e4c0]/5 rounded-full blur-[80px] z-0" />

            <div className="absolute inset-0 flex items-center justify-center">
              <InteractiveTiltCard className="w-[300px] h-[360px] p-4 flex flex-col justify-between shadow-2xl border border-white/10 hover:border-[#00e4c0]/40 transition-all duration-300 relative">
                <div>
                  <div className="h-[170px] w-full bg-[#0c1b33] rounded-xl overflow-hidden relative">
                    <img
                      src="https://images.unsplash.com/photo-1617814076367-b759c7d7e738?q=80&w=600&auto=format&fit=crop"
                      alt="Featured Car Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-[#00e4c0] text-[#0c1b33] text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                      Featured
                    </div>
                  </div>
                  <div className="mt-4 text-left">
                    <span className="text-[10px] text-[#00e4c0] font-bold tracking-widest uppercase">Selectt Assured</span>
                    <h3 className="text-lg font-extrabold text-[#f9f9f9] leading-snug mt-1">Mercedes Benz C-Class</h3>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-4">
                  <span className="text-xl font-black text-white">₹38.50 Lakh</span>
                  <span className="text-xs text-slate-400">2021 · 14,200 km</span>
                </div>
              </InteractiveTiltCard>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Counters Stats Block */}
      <section className="relative z-10 py-12 border-y border-white/5 bg-[#162947]/30">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="space-y-1">
            <h3 className="text-4xl sm:text-5xl font-black text-[#00e4c0]">{listedCount}+</h3>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Certified Cars Listed</p>
          </div>
          <div className="space-y-1">
            <h3 className="text-4xl sm:text-5xl font-black text-[#00e4c0]">{buyerCount.toLocaleString()}+</h3>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Happy Buyers & Sellers</p>
          </div>
          <div className="space-y-1">
            <h3 className="text-4xl sm:text-5xl font-black text-[#00e4c0]">{deliveryCount}h</h3>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Average Home Delivery Time</p>
          </div>
        </div>
      </section>

      {/* Live Car Listings Section */}
      <section className="relative z-10 py-24 px-6 max-w-7xl mx-auto">
        <div className="text-left mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-[#00e4c0] uppercase tracking-widest block mb-2">Live Inventory</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Explore Hand-Picked Cars</h2>
          </div>
          <Link
            to="/buy-cars"
            className="text-sm font-bold text-[#00e4c0] hover:text-white flex items-center gap-1 group transition-colors cursor-pointer"
          >
            <span>View All Listings</span>
            <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {(allCars.length > 0 ? allCars : FALLBACK_CARS).map((car) => (
            <InteractiveTiltCard
              key={car.id}
              onClick={() => navigate(`/car/${car.id}`)}
              className="group flex flex-col justify-between h-[390px] border border-white/5 bg-[#162947]/75 hover:border-[#00e4c0]/30 transition-all duration-300"
            >
              <div>
                {/* Image */}
                <div className="h-[200px] bg-[#0c1b33] overflow-hidden relative">
                  <img
                    src={car.image?.startsWith('/') ? `${API_URL}${car.image}` : car.image}
                    alt={`${car.make} ${car.model}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src = FALLBACK_CARS[0].image;
                    }}
                  />
                  {car.tag && (
                    <div className="absolute top-3 left-3 bg-[#00e4c0] text-[#0c1b33] text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded shadow">
                      {car.tag}
                    </div>
                  )}
                  {car.badgeText && (
                    <div className="absolute top-3 right-3 bg-red-600 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded shadow">
                      {car.badgeText}
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="p-5 text-left">
                  <span className="text-[10px] text-[#00e4c0] font-bold tracking-widest uppercase">
                    {car.make}
                  </span>
                  <h3 className="text-lg font-extrabold text-[#f9f9f9] truncate mt-0.5">
                    {car.make} {car.model}
                  </h3>
                  <div className="flex gap-3 text-xs text-slate-400 mt-2 font-medium">
                    <span>{car.year}</span>
                    <span>•</span>
                    <span>{car.km?.toLocaleString()} km</span>
                    <span>•</span>
                    <span>{car.fuelType}</span>
                  </div>
                </div>
              </div>

              {/* Price & Action footer */}
              <div className="px-5 pb-5 pt-3 border-t border-white/5 flex items-center justify-between">
                <span className="text-xl font-black text-white">
                  ₹{(car.price / 100000).toFixed(2)} Lakh
                </span>
                <span className="text-xs text-[#00e4c0] font-bold group-hover:underline flex items-center gap-1">
                  View <ArrowRight className="size-3" />
                </span>
              </div>
            </InteractiveTiltCard>
          ))}
        </div>
      </section>

      {/* Selectt Promise 3D Interactive Feature Block */}
      <section className="relative z-10 py-24 px-6 max-w-7xl mx-auto border-t border-white/5">
        <div className="text-center mb-16 space-y-3">
          <span className="text-xs font-bold text-[#00e4c0] uppercase tracking-widest block">The Selectt Promise</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Pre-Owned Excellence, Reimagined</h2>
          <p className="text-slate-400 text-base max-w-lg mx-auto">
            We put complete transparency and security back into buying and selling pre-owned cars.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left panel tabs selection */}
          <div className="lg:col-span-5 space-y-4 text-left">
            {promiseTabs.map((tab, idx) => (
              <button
                key={idx}
                onClick={() => setActivePromiseTab(idx)}
                className={`w-full p-6 rounded-2xl border text-left flex gap-5 items-start transition-all duration-300 cursor-pointer ${activePromiseTab === idx
                    ? 'bg-[#162947] border-[#00e4c0] shadow-lg shadow-[#00e4c0]/5'
                    : 'bg-transparent border-white/5 hover:bg-[#162947]/30'
                  }`}
              >
                <div className="shrink-0 mt-0.5">{tab.icon}</div>
                <div>
                  <h4 className="text-base font-extrabold text-[#f9f9f9]">{tab.title}</h4>
                  <p className="text-xs text-slate-400 leading-normal mt-1">{tab.description.slice(0, 75)}...</p>
                </div>
              </button>
            ))}
          </div>

          {/* Right tab visual display wrapper */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              <motion.div
                key={activePromiseTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className="bg-[#162947]/80 border border-white/10 p-8 rounded-3xl text-left shadow-2xl relative"
              >
                <div className="flex gap-4 items-center mb-6">
                  {promiseTabs[activePromiseTab].icon}
                  <h3 className="text-xl font-extrabold text-white">{promiseTabs[activePromiseTab].title}</h3>
                </div>
                <p className="text-slate-300 leading-relaxed text-sm mb-6">
                  {promiseTabs[activePromiseTab].description}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {promiseTabs[activePromiseTab].details.map((detail, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-[#0c1b33] p-3 rounded-xl border border-white/5">
                      <BadgeCheck className="size-4 text-[#00e4c0] shrink-0" />
                      <span className="text-xs font-bold text-slate-200">{detail}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Brand scrolling section */}
      <section className="relative z-10 py-16 px-6 max-w-7xl mx-auto border-t border-white/5">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center mb-8">
          Explore Popular Auto Brands
        </h3>
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
          {(brands.length > 0 ? brands : [
            { name: 'Hyundai' }, { name: 'Tata' }, { name: 'Honda' }, { name: 'BMW' }, { name: 'Mercedes' }, { name: 'Mahindra' }
          ]).map((brandItem, idx) => (
            <button
              key={idx}
              onClick={() => navigate(`/buy-cars?brand=${encodeURIComponent(brandItem.name)}`)}
              className="bg-[#162947]/50 border border-white/5 hover:border-[#00e4c0]/50 hover:bg-[#162947] px-6 py-4 rounded-2xl transition duration-300 text-center flex flex-col items-center min-w-[120px] cursor-pointer group"
            >
              <span className="text-sm font-bold text-[#f9f9f9] group-hover:text-[#00e4c0] transition-colors">
                {brandItem.name}
              </span>
              {brandItem.count && (
                <span className="text-[10px] text-slate-400 font-semibold mt-1">
                  {brandItem.count} Cars
                </span>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Premium Testimonials Section */}
      <section className="relative z-10 py-24 px-6 max-w-7xl mx-auto border-t border-white/5 text-center">
        <span className="text-xs font-bold text-[#00e4c0] uppercase tracking-widest block mb-2">Customer Testimonials</span>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-16">What Drivers Say About Selectt</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              name: "Anand R.",
              quote: "The 3D virtual inspection report gave me the exact paint thickness and suspension values. The delivery took only 24 hours. Phenomenal service!",
              location: "Mumbai",
              car: "Creta SX ✦"
            },
            {
              name: "Priyanka S.",
              quote: "Contactless payment and fully paperwork-less loan setup. Best part is the 5-day return policy which gave me true peace of mind.",
              location: "Delhi NCR",
              car: "Nexon EV Max"
            },
            {
              name: "Kabir M.",
              quote: "I sold my City CVT. Got a free valuation, complete inspection at home, and money was transferred inside 2 hours. Seamless pre-owned market.",
              location: "Bangalore",
              car: "Honda City ZX"
            }
          ].map((item, idx) => (
            <div key={idx} className="bg-[#162947] border border-white/5 rounded-3xl p-6 text-left space-y-4 flex flex-col justify-between hover:border-[#00e4c0]/30 transition duration-300 shadow-xl">
              <p className="text-slate-300 italic text-sm leading-relaxed">
                "{item.quote}"
              </p>
              <div className="border-t border-white/5 pt-4 flex justify-between items-center">
                <div>
                  <h4 className="font-extrabold text-sm text-[#f9f9f9]">{item.name}</h4>
                  <p className="text-[10px] text-slate-500 font-bold uppercase">{item.location}</p>
                </div>
                <span className="bg-[#00e4c0]/15 text-[#00e4c0] border border-[#00e4c0]/20 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                  {item.car}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQs Section */}
      <section className="relative z-10 py-24 px-6 max-w-4xl mx-auto border-t border-white/5 text-center">
        <span className="text-xs font-bold text-[#00e4c0] uppercase tracking-widest block mb-2">Support Center</span>
        <h2 className="text-3xl font-extrabold tracking-tight mb-12">Frequently Asked Questions</h2>
        <div className="bg-[#162947]/40 border border-white/5 p-4 rounded-3xl">
          <FAQ />
        </div>
      </section>
    </div>
  );
}
