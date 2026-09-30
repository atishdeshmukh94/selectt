import React, { useState, useEffect } from 'react';
import { Search, ChevronRight, Menu, Heart, ChevronDown, Shield, Coins, IndianRupee, ArrowLeftRight, Calculator, Recycle, MapPin, RefreshCw, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

import RecentlyViewed from './RecentlyViewed';
import BrandExplorer from './BrandExplorer';
import BodyTypeFilter from './BodyTypeFilter';
import Stats from './Stats';
import Testimonials from './Testimonials';
import BlogSection from './BlogSection';
import StepsSection from './StepsSection';
import SectionDivider from '../common/SectionDivider';
import Reveal from '../common/Reveal';

import { API_URL } from '../../config/api';
const API = API_URL;

const MobileHomeLayout = () => {
  const words = ["year", "type", "color", "make", "km driven", "fuel type", "transmission"];
  const [wordIndex, setWordIndex] = useState(0);
  const [text, setText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [heroContent, setHeroContent] = useState({
    mobile_hero_video: 'https://mda-dev.spinny.com/sp-file-system/public/2026-02-16/3f7957ad509b4fc888114ae91d3690be/raw/file.mp4',
    mobile_hero_image: '',
    mobile_hero_heading: "Don't just buy.Selectt.",
    mobile_hero_subheading: "India's most-trusted car home*",
    mobile_hero_btn_text: 'Buy Car',
  });

  useEffect(() => {
    fetch(`${API}/api/site-content`)
      .then(r => r.json())
      .then(data => {
        if (data && typeof data === 'object') {
          setHeroContent(prev => ({ ...prev, ...data }));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    let timer;
    const currentWord = words[wordIndex];
    if (isDeleting) {
      if (text === "") { setIsDeleting(false); setWordIndex((prev) => (prev + 1) % words.length); }
      else { timer = setTimeout(() => setText(text.substring(0, text.length - 1)), 50); }
    } else {
      if (text === currentWord) { timer = setTimeout(() => setIsDeleting(true), 2000); }
      else { timer = setTimeout(() => setText(currentWord.substring(0, text.length + 1)), 100); }
    }
    return () => clearTimeout(timer);
  }, [text, isDeleting, wordIndex]);

  const heroImage = heroContent.mobile_hero_image;
  const heroVideo = heroContent.mobile_hero_video;
  const resolveUrl = (url) => url?.startsWith('/') ? `${API}${url}` : url;

  return (
    <div className="w-full bg-slate-50 flex flex-col font-sans mb-16">
      {/* 1. Hero Section */}
      <div className="relative w-full h-[420px] bg-gradient-to-r from-[#180036] via-[#100626] to-[#04061A] overflow-hidden rounded-b-3xl pb-16 pt-2">
         {/* Background: video or image */}
         {heroImage ? (
            <img
              src={resolveUrl(heroImage)}
              alt="Hero"
              className="absolute top-[20%] right-[0%] w-[60%] h-full object-cover object-left opacity-90 z-0"
              style={{ maskImage: 'linear-gradient(to right, transparent, black 40%)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 40%)' }}
            />
         ) : (
            <img
              src={resolveUrl(heroVideo) || 'https://acko-cms.ackoassets.com/large_Dhoni_car_image_74e57c2de2.webp'}
              alt="Dhoni with Car"
              className="absolute top-[20%] right-[0%] w-[60%] h-full object-cover object-left opacity-90 z-0"
              style={{ maskImage: 'linear-gradient(to right, transparent, black 40%)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 40%)' }}
              onError={(e) => {
                // If it's a video URL, show as video instead
                if (heroVideo && (heroVideo.includes('.mp4') || heroVideo.includes('.webm'))) {
                  e.target.style.display = 'none';
                }
              }}
            />
         )}

         {/* If heroVideo is set and heroImage is empty, show video */}
         {!heroImage && heroVideo && (heroVideo.includes('.mp4') || heroVideo.includes('.webm') || heroVideo.includes('.mov')) && (
            <video
              src={resolveUrl(heroVideo)}
              autoPlay loop muted playsInline
              className="absolute inset-0 w-full h-full object-cover z-[-1] opacity-60"
            />
         )}

         {/* Search Input */}
         <div className={`z-[100] px-4 w-full transition-all duration-300 ${isScrolled ? 'fixed top-0 left-0 pt-3 pb-3 bg-[#0a0410] shadow-lg' : 'absolute top-[68px] left-0 bg-transparent'}`}>
            <Reveal direction="down" delay={0.3}>
              <Link to="/buy-cars" className="block w-full rounded-[25px] bg-[#1d1316] flex items-center px-4 py-3 shadow-md border border-white/10 relative cursor-text">
                <Search size={18} className="mr-3 text-white/50 shrink-0" />
                <div className="relative flex-1 flex items-center">
                    <input
                        type="text"
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        className="bg-transparent border-none outline-none text-[15px] font-bold text-white tracking-wide w-full relative z-10"
                    />
                    {!searchValue && (
                        <div className="absolute left-0 pointer-events-none flex items-center text-[15px] tracking-wide">
                          <span className="text-white/60 font-normal mr-1">Search by</span>
                          <span className="text-white font-bold">{text}</span>
                          <span className="w-[1.5px] h-[16px] bg-white ml-[1px] animate-pulse"></span>
                        </div>
                    )}
                </div>
              </Link>
            </Reveal>
         </div>

         {/* Hero Banner Content */}
         <div className="absolute bottom-24 left-6 z-10">
            <Reveal direction="left" delay={0.5}>
              <div className="flex items-baseline -mb-1">
                <span className="text-[#FFB800] font-black text-2xl tracking-tighter mr-1" style={{ letterSpacing: '-0.05em' }}>the</span>
              </div>
              <h1 className="text-[#FFB800] font-black text-[42px] leading-none tracking-tighter mb-1" style={{ letterSpacing: '-0.05em' }}>
                {heroContent.mobile_hero_heading || 'master'}
              </h1>
              <p className="text-[#FFB800] font-bold text-sm tracking-tight mb-6">
                {heroContent.mobile_hero_subheading || "India's most-trusted car home*"}
              </p>
              <Link to="/buy-cars" className="inline-block bg-black text-white px-7 py-2.5 rounded-[20px] font-bold text-[13px] w-max shadow-lg border border-white/20 transition-colors text-center no-underline">
                {heroContent.mobile_hero_btn_text || 'Buy Car'}
              </Link>
            </Reveal>
         </div>
      </div>

      {/* Main Content */}
      <Reveal>
        <div className="relative z-20 bg-slate-50 rounded-t-[32px] -mt-6 pt-2">
          <div className="px-5 pt-6 pb-2 flex gap-4">
              <Link to="/buy-cars" className="flex-1 bg-[#4A1188] rounded-xl p-4 flex flex-col justify-between aspect-[4/3] relative overflow-hidden shadow-sm no-underline active:scale-[0.98] transition-transform">
                <h3 className="text-white text-lg font-bold z-10 text-center">Buy Car</h3>
                <img src="/img/buy-car.webp" alt="Buy Cars" className="absolute bottom-0 w-[90%] top-0 object-contain" />
              </Link>
              <Link to="/sell-car" className="flex-1 bg-[#008A6F] rounded-xl p-4 flex flex-col justify-between aspect-[4/3] relative overflow-hidden shadow-sm no-underline active:scale-[0.98] transition-transform">
                <h3 className="text-white text-lg font-bold z-10 text-left">Sell Car</h3>
                <img src="/img/sell-car.png" alt="Sell Cars" className="absolute bottom-0 left-2 w-[90%] object-contain " />
              </Link>
          </div>
        </div>
      </Reveal>

      {/* Quick Actions Grid */}
      <div className="mx-4 my-6 relative rounded-[32px]">
         <div className="absolute -top-4 -left-4 w-32 h-32 bg-[#00C9AF] rounded-full mix-blend-multiply filter blur-2xl opacity-20"></div>
         <div className="absolute top-8 -right-4 w-32 h-32 bg-[#0c1b33] rounded-full mix-blend-multiply filter blur-2xl opacity-25"></div>
         <div className="absolute -bottom-8 left-16 w-32 h-32 bg-[#00C9AF] rounded-full mix-blend-multiply filter blur-2xl opacity-20"></div>
         <div className="relative bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-[32px] p-6 grid grid-cols-3 gap-y-6 gap-x-4">
            {[
               { label: 'Car Hub', icon: <MapPin className="w-6 h-6 text-[#00C9AF]" />, theme: 'from-[#00C9AF]/15 to-[#00C9AF]/5 border-[#00C9AF]/20 text-[#00C9AF]', to: '/car-hub-locations' },
               { label: 'Used Car Loan', icon: <Coins className="w-6 h-6 text-[#00C9AF]" />, theme: 'from-[#00C9AF]/15 to-[#00C9AF]/5 border-[#00C9AF]/20 text-[#00C9AF]', to: '/used-car-loan' },
               { label: 'Car Valuation', icon: <IndianRupee className="w-6 h-6 text-[#00C9AF]" />, theme: 'from-[#00C9AF]/15 to-[#00C9AF]/5 border-[#00C9AF]/20 text-[#00C9AF]', to: '/sell-car' },
               { label: 'Selectt Buyback', icon: <RefreshCw className="w-6 h-6 text-[#00C9AF]" />, theme: 'from-[#00C9AF]/15 to-[#00C9AF]/5 border-[#00C9AF]/20 text-[#00C9AF]', to: '/selectt-buyback' },
               { label: 'Emi Calculator', icon: <Calculator className="w-6 h-6 text-[#00C9AF]" />, theme: 'from-[#00C9AF]/15 to-[#00C9AF]/5 border-[#00C9AF]/20 text-[#00C9AF]', to: '/pricing' },
               { label: 'Customer Reviews', icon: <Star className="w-6 h-6 text-[#00C9AF]" />, theme: 'from-[#00C9AF]/15 to-[#00C9AF]/5 border-[#00C9AF]/20 text-[#00C9AF]', to: '/customer-reviews' }
            ].map((item, idx) => (
              <Reveal key={idx} delay={0.1 * idx} direction="up">
                <Link to={item.to} className="group flex flex-col items-center justify-start text-center cursor-pointer no-underline">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 shadow-[0_4px_16px_0_rgba(0,201,175,0.08)] bg-gradient-to-br ${item.theme} border backdrop-blur-md transition-all duration-300 group-hover:scale-105 active:scale-95`}>
                      {item.icon}
                    </div>
                    <span className="text-xs font-heading font-bold text-slate-800 leading-tight px-1 group-hover:text-[#00C9AF] transition-colors">{item.label}</span>
                </Link>
              </Reveal>
            ))}
         </div>
      </div>

      {/* Highlight Video */}
      <Reveal>
        <div className="w-full aspect-video bg-black my-2">
          <video
              src={heroVideo && (heroVideo.includes('.mp4') || heroVideo.includes('.webm') || heroVideo.includes('.mov'))
                ? resolveUrl(heroVideo)
                : 'https://mda-dev.spinny.com/sp-file-system/public/2026-02-16/3f7957ad509b4fc888114ae91d3690be/raw/file.mp4#t=0.01'
              }
              autoPlay loop muted playsInline
              className="w-full h-full object-cover"
          />
        </div>
      </Reveal>

      {/* Numbers Don't Lie */}
      <div className="px-4 py-6">
         <Reveal><h2 className="text-xl font-heading font-extrabold text-slate-900 mb-4 px-1">Numbers don't lie</h2></Reveal>
         <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar" style={{ scrollbarWidth: 'none' }}>
            <Reveal direction="left" delay={0.2} className="min-w-[85%] snap-start">
              <div className="bg-gradient-to-br from-[#5D5CFF] to-[#3B3AF0] rounded-2xl p-5 relative overflow-hidden shadow-md h-full">
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.2) 10px, rgba(255,255,255,0.2) 20px)' }}></div>
                <div className="relative z-10 w-2/3">
                    <h3 className="text-3xl font-heading font-black text-white mb-2">4.8/5</h3>
                    <p className="text-white/95 text-xs sm:text-sm leading-snug font-medium">Our average review rating on<br/>Google and on Social platforms</p>
                </div>
                <img src="/img/car-key.png" alt="Car" className="absolute -right-2 h-25 bottom-0 w-40 object-contain" />
              </div>
            </Reveal>
            <Reveal direction="left" delay={0.4} className="min-w-[85%] snap-start">
              <div className="bg-gradient-to-br from-[#E86616] to-[#D5570E] rounded-2xl p-5 relative overflow-hidden shadow-md h-full">
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-radial-gradient(circle at center, transparent 0, transparent 2px, rgba(0,0,0,0.2) 2px, rgba(0,0,0,0.2) 6px)', backgroundSize: '12px 12px' }}></div>
                <div className="relative z-10 w-2/3">
                    <h3 className="text-3xl font-heading font-black text-white mb-2">3.5L+</h3>
                    <p className="text-white/95 text-xs sm:text-sm leading-snug font-medium">The number of happy<br/>customers we've served</p>
                </div>
                <img src="/img/car-illustration.png" alt="Car" className="absolute -right-2 h-25 bottom-0 w-40 object-contain" />
              </div>
            </Reveal>
         </div>
      </div>

      {/* Explore More */}
      <div className="px-4 py-6">
         <Reveal><h2 className="text-xl font-heading font-extrabold text-slate-900 mb-4 px-1">Explore more</h2></Reveal>
         <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar" style={{ scrollbarWidth: 'none' }}>
            <Reveal direction="up" delay={0.2} className="min-w-[70%] snap-start">
              <div className="bg-gradient-to-b from-[#2563EB] to-[#1D4ED8] rounded-2xl p-5 flex flex-col justify-between items-center text-center aspect-[3/4] shadow-md relative overflow-hidden">
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                <div className="z-10 mt-2">
                    <p className="text-blue-100 text-[11px] uppercase tracking-wider font-bold mb-1">Right cover, zero hassle</p>
                    <h3 className="text-white font-heading font-black text-lg tracking-wide">SELECTT INSURANCE</h3>
                </div>
                <div className="relative w-full h-32 flex items-center justify-center z-10">
                    <div className="absolute top-0 right-1/4 w-12 h-12 bg-green-400 rounded-lg rotate-12 flex items-center justify-center shadow-lg"><span className="text-white font-bold text-xl">✓</span></div>
                    <img src="/img/car-insurance.png" alt="Car" className="w-full object-contain drop-shadow-2xl z-20 mt-8" />
                </div>
                <button className="w-full bg-black text-white font-bold py-3 mt-4 rounded-full text-xs sm:text-sm z-10 uppercase tracking-wider">Get quotes</button>
              </div>
            </Reveal>
            <Reveal direction="up" delay={0.4} className="min-w-[70%] snap-start">
              <div className="bg-gradient-to-b from-[#D9381E] to-[#991B1B] rounded-2xl p-5 flex flex-col justify-between items-center text-center aspect-[3/4] shadow-md relative overflow-hidden">
                <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.4) 100%)' }}></div>
                <div className="z-10 mt-2">
                    <p className="text-red-100 text-[11px] uppercase tracking-wider font-bold mb-1">Easy & Fast</p>
                    <h3 className="text-white font-heading font-black text-lg tracking-wide">CAR LOANS</h3>
                </div>
                <div className="relative w-full h-32 flex items-center justify-center z-10">
                    <div className="absolute top-4 left-4 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg transform -rotate-12"><span className="text-amber-700 font-bold text-xs">₹</span></div>
                    <img src="/img/car-loan.png" alt="Car" className="w-full object-contain drop-shadow-2xl z-20 mt-8" />
                </div>
                <Link to="/profile?tab=loan" className="w-full bg-black text-white font-bold py-3 mt-4 rounded-full text-xs sm:text-sm z-10 block text-center uppercase tracking-wider no-underline">Check eligibility</Link>
              </div>
            </Reveal>
         </div>
      </div>

      {/* What Motivates Us */}
      <Reveal className="py-2 pb-10">
         <SectionDivider title="What Motivates Us" align="left" maxWidthClass="max-w-[1400px]" />
         <Testimonials />
      </Reveal>

      <div className="bg-[#F5F5F5]">
         <Reveal><RecentlyViewed /></Reveal>
         <Reveal><SectionDivider title="Explore Popular Brands" /><BrandExplorer /></Reveal>
         <Reveal><SectionDivider title="How Selectt Works" /><StepsSection /></Reveal>
         <Reveal><SectionDivider title="Explore by Body Type" /><BodyTypeFilter /></Reveal>
         <Reveal><SectionDivider title="Latest from Our Blog" align="center" /><BlogSection /></Reveal>
      </div>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default MobileHomeLayout;
