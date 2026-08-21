import React, { useState, useEffect } from 'react';
import { Play, ChevronRight, X, Zap, Car, Banknote } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import { API_URL } from '../../config/api';
const API = API_URL;

const BuySellSection = () => {
  const [activeTab, setActiveTab] = useState('buy');
  const [showVideoLightbox, setShowVideoLightbox] = useState(false);
  const [sellContent, setSellContent] = useState({
    sell_section_image: 'https://acko-cms.ackoassets.com/large_Dhoni_car_image_74e57c2de2.webp',
    sell_section_cover_video: '',
    sell_section_video: 'https://spn-sta.spinny.com/spinny-web/static-images/web-asset/videos/spinny_sellright.mp4',
    sell_section_heading: 'Select your car brand and model to get started',
  });

  const [brands, setBrands] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API}/api/site-content`)
      .then(r => r.json())
      .then(data => {
        if (data && typeof data === 'object') {
          setSellContent(prev => ({ ...prev, ...data }));
        }
      })
      .catch(() => { });

    fetch(`${API}/api/brands`)
      .then(r => r.json())
      .then(data => setBrands(data))
      .catch(() => { });
  }, []);

  const resolveUrl = (url) => url?.startsWith('/') ? `${API}${url}` : url;

  const benefits = [
    { image: '/img/selectt-benefits-1.jpg', icon: '/img/200-points-inspection.svg', title: '200-Points Inspection', description: 'Every car is carefully handpicked after a thorough quality inspection.' },
    { image: '/img/selectt-benefits-2.jpg', icon: '/img/warranty-included.svg', title: 'Warranty included', description: 'Our way of being there for you through your car ownership journey.' },
    { image: '/img/selectt-benefits-3.jpg', icon: '/img/5-day-money-back.svg', title: '7-Day Money Back', description: 'All our cars come with a no-questions-asked 5-day money back guarantee.' },
    { image: '/img/selectt-benefits-4.jpg', icon: '/img/fixed-price-assurance.svg', title: 'Fixed Price Assurance', description: 'No more endless negotiations or haggling. With Selectt, you get the best deal upfront and right away.' }
  ];



  const sellFeatures = [
    { icon: <Zap size={14} />, text: 'Instant online quote' },
    { icon: <Car size={14} />, text: 'Free car evaluation' },
    { icon: <Banknote size={14} />, text: 'Same day payment' }
  ];

  const sellImage = resolveUrl(sellContent.sell_section_image);
  const sellCoverVideo = resolveUrl(sellContent.sell_section_cover_video);
  const sellVideo = resolveUrl(sellContent.sell_section_video);
  const sellHeading = sellContent.sell_section_heading;

  return (
    <section className="py-16 md:py-24 px-4 bg-[#00C9AF]/10">
      <div className="max-w-7xl mx-auto relative border border-slate-100 dark:border-slate-900/50 rounded-3xl bg-gradient-to-b from-slate-50/60 via-white to-white dark:from-slate-950/20 dark:via-background-dark dark:to-background-dark shadow-sm px-4 py-6 md:px-8 md:py-10">
        {/* Tab Buttons */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-full flex justify-center">
          <div className="inline-flex bg-white rounded-2xl md:rounded-full p-2 shadow-xl border border-slate-200">
            <button onClick={() => setActiveTab('buy')} className={`px-10 md:px-16 py-3.5 md:py-4 rounded-xl md:rounded-full font-bold md:text-lg transition-all ${activeTab === 'buy' ? 'bg-[#00C9AF] !text-[#0A1C3A] shadow-md' : 'text-[#0C1B33] hover:bg-slate-50'}`}>Buy car</button>
            <button onClick={() => setActiveTab('sell')} className={`px-10 md:px-16 py-3.5 md:py-4 rounded-xl md:rounded-full font-bold md:text-lg transition-all ${activeTab === 'sell' ? 'bg-[#00C9AF] !text-[#0A1C3A] shadow-md' : 'text-[#0C1B33] hover:bg-slate-50'}`}>Sell car</button>
          </div>
        </div>

        {/* Buy Car Content */}
        {activeTab === 'buy' && (
          <div className="animate-fadeIn pt-10 md:pt-8 max-w-5xl mx-auto">
            <div className="px-4 py-4 md:px-8 md:py-5">
              <h3 className="text-2xl md:text-2xl font-black text-center text-[#0C1B33] dark:text-white mb-6 md:mb-5">Selectt Benefits</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
                {benefits.map((benefit, idx) => (
                  <div key={idx} className="bg-white-100 dark:bg-card-dark rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 group">
                    <div className="relative h-24 md:h-32 overflow-hidden rounded-xl m-1.5 md:m-2">
                      <img src={benefit.image} alt={benefit.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 rounded-xl" />
                      <div className="absolute bottom-1.5 left-1.5 w-8 h-8 md:w-9 md:h-9 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-md border border-white/50">
                        <img src={benefit.icon} alt={benefit.title} className="w-5 h-5 object-contain" style={{ filter: 'grayscale(1) brightness(0.3)' }} />
                      </div>
                    </div>
                    <div className="px-2.5 py-2 md:px-3 md:py-2.5 text-center">
                      <h4 className="text-[11px] md:text-sm font-bold text-[#0C1B33] dark:text-white mb-0.5 leading-tight">{benefit.title}</h4>
                      <p className="text-[9px] md:text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4">
                <button className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[#0C1B33] dark:text-white px-5 py-2.5 rounded-full font-semibold text-sm hover:shadow-md transition-all cursor-pointer">
                  <Play size={16} /> Watch the film
                </button>
                <Link to="/buy-cars" className="flex items-center gap-2 bg-[#00C9AF] text-[#0A1C3A] px-7 py-2.5 rounded-full font-semibold text-sm hover:bg-[#0C1B33] transition-all shadow-md">Browse cars</Link>
                <button className="flex items-center gap-1 text-[#0C1B33] dark:text-white font-semibold text-sm hover:text-[#00C9AF] transition-all cursor-pointer">Learn more <ChevronRight size={16} /></button>
              </div>
            </div>
          </div>
        )}

        {/* Sell Car Content */}
        {activeTab === 'sell' && (
          <div className="animate-fadeIn pt-10 md:pt-8 max-w-5xl mx-auto">
            <div className="grid md:grid-cols-12 gap-8 items-center">
              {/* Left: Video OR Image panel – controlled from admin */}
              <div className="md:col-span-12 lg:col-span-5 relative rounded-3xl overflow-hidden shadow-xl aspect-square md:aspect-square w-[100%] md:w-[90%] mx-auto transform md:hover:scale-[1.02] transition-all group">
                {sellCoverVideo ? (
                  <video src={sellCoverVideo} poster={sellImage} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                ) : (
                  <img src={sellImage} alt="Sell your car" className="w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white p-6 text-center">
                  <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg mb-4 cursor-pointer" onClick={() => setShowVideoLightbox(true)}>
                    <Play size={24} className="text-[#5B1C8D] ml-1" fill="currentColor" />
                  </div>
                  <h2 className="text-white font-extrabold text-2xl md:text-3xl tracking-tight leading-tight mt-2 drop-shadow-lg">Sell your car for the <br /> best price</h2>
                </div>
              </div>

              {/* Right: Brand Selection / Sell Flow */}
              <div className="md:col-span-12 lg:col-span-7 pl-0 lg:pl-6">
                <div className="flex flex-col gap-1 mb-4 px-4 md:px-0">
                  <h2 className="text-xl md:text-2xl font-black text-[#301052] text-center md:text-left">{sellHeading}</h2>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-2">
                    {sellFeatures.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs md:text-sm text-[#462d66]">
                        <span className="text-[#5B1C8D]">{feature.icon}</span>
                        <span className="font-medium">{feature.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 md:grid-cols-4 gap-2 md:gap-3 px-2 md:px-0">
                  {brands.slice(0, 11).map(b => (
                    <button
                      key={b.id}
                      onClick={() => navigate('/sell-car', { state: { brand: b.id } })}
                      className="bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_20px_rgba(91,28,141,0.1)] border border-slate-50 hover:border-[#5B1C8D]/20 transition-all flex flex-col items-center justify-center p-2 h-[76px] sm:h-[84px] group"
                    >
                      <img src={b.logo_url?.startsWith('http') ? b.logo_url : `${API}${b.logo_url}`} alt={b.name} className="h-8 md:h-10 w-auto object-contain mb-1 group-hover:scale-105 transition-transform" />
                      <span className="text-[9px] md:text-[10px] text-slate-500 font-medium text-center leading-tight truncate w-full">{b.name}</span>
                    </button>
                  ))}
                  <button
                    onClick={() => navigate('/sell-car')}
                    className="bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_20px_rgba(91,28,141,0.1)] border border-slate-50 hover:border-[#5B1C8D]/20 transition-all flex flex-col items-center justify-center p-2 h-[76px] sm:h-[84px]"
                  >
                    <span className="text-[10px] md:text-xs font-black text-[#5B1C8D] uppercase tracking-wider">MORE</span>
                  </button>
                </div>

                <div className="mt-5 px-2 md:px-0 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <button onClick={() => navigate('/sell-car')} className="w-full sm:w-auto bg-[#00C9AF] hover:bg-[#0C1B33] text-[#0A1C3A] px-10 py-3 rounded-xl font-bold text-base shadow-lg shadow-[#00C9AF]/20 transition-all">
                    Get price
                  </button>
                  <div className="flex items-center gap-1.5 text-teal-500 px-4 hidden sm:flex">
                    <span className="font-bold text-sm tracking-tight pt-0.5">Safe, Secure, Hassle-free</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Video Lightbox */}
      {showVideoLightbox && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setShowVideoLightbox(false)}>
          <button onClick={() => setShowVideoLightbox(false)} className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all z-10">
            <X size={24} />
          </button>
          <div className="relative w-full max-w-4xl aspect-video" onClick={(e) => e.stopPropagation()}>
            <video className="w-full h-full rounded-lg" controls autoPlay src={sellVideo}>
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      )}
    </section>
  );
};

export default BuySellSection;


