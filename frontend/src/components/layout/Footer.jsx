import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../config/api';
import { Facebook, Twitter, Instagram, Youtube, Phone, BarChart2, FileText, Mail, Linkedin, X, Home, ShoppingCart, Heart, TrendingUp, User, MapPin, MessageCircle, MessageSquare, ArrowUp, HelpCircle } from 'lucide-react';

const Footer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, openLoginModal } = useAuth();
  const isCarDetailsPage = location.pathname.startsWith('/car/');
  const [frontendFooterLogo, setFrontendFooterLogo] = useState(null);

  const [activeSection, setActiveSection] = useState(null);
  const toggleSection = (sec) => {
    setActiveSection(prev => prev === sec ? null : sec);
  };

  const buyUsedCarCities = [
    "Delhi NCR", "Bangalore", "Hyderabad", "Mumbai", "Pune", "Delhi", "Gurgaon", "Noida",
    "Ahmedabad", "Chennai", "Kolkata", "Lucknow", "Jaipur", "Agra", "Ambala", "Chandigarh",
    "Coimbatore", "Faridabad", "Ghaziabad", "Jodhpur", "Kanpur", "Karnal", "Kochi",
    "Ludhiana", "Mangaluru", "Mohali", "Mysuru", "Prayagraj", "Ranchi", "Sonipat",
    "Vadodara", "Visakhapatnam"
  ];
  const [helpOpen, setHelpOpen] = useState(false);
  const [helpView, setHelpView] = useState('menu'); // 'menu' | 'callback'
  const [callbackPhone, setCallbackPhone] = useState('');
  const [callbackLang, setCallbackLang] = useState('Hindi');
  const [callbackMsg, setCallbackMsg] = useState('');

  const [taglineText, setTaglineText] = useState("");

  useEffect(() => {
    const fullText = "Don't Just Buy. Selectt.";
    let index = 0;
    let isDeleting = false;
    let timer;

    const tick = () => {
      if (isDeleting) {
        index--;
      } else {
        index++;
      }

      setTaglineText(fullText.substring(0, index));

      let speed = isDeleting ? 30 : 80;

      if (!isDeleting && index === fullText.length) {
        speed = 2500; // Pause at the end
        isDeleting = true;
      } else if (isDeleting && index === 0) {
        isDeleting = false;
        speed = 400; // Pause before restarting
      }

      timer = setTimeout(tick, speed);
    };

    timer = setTimeout(tick, 500);
    return () => clearTimeout(timer);
  }, []);

  const firstPart = taglineText.substring(0, 22);
  const secondPart = taglineText.substring(22);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch(`${API_URL}/api/settings/public`);
        const data = await response.json();
        if (data.frontend_footer_logo) {
          setFrontendFooterLogo(`${API_URL}${data.frontend_footer_logo}`);
        }
      } catch (err) {
        console.error("Error fetching settings:", err);
      }
    };
    fetchSettings();
  }, []); return (
    <>
      <footer className="bg-gradient-to-b from-[#0B1528] via-[#050B16] to-[#02050B] text-slate-400 pt-16 pb-24 md:pb-8 font-sans relative overflow-hidden border-t border-white/5">
        {/* Glow meshes, Orbs, and Columns grid style lines matching Hero but darker */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_80%_68%_at_50%_50%,rgba(0,242,200,0.06)_0%,transparent_58%),radial-gradient(ellipse_50%_50%_at_14%_80%,rgba(0,90,255,0.04)_0%,transparent_60%)]"></div>
          <div className="absolute w-[350px] h-[350px] top-[-50px] right-[-100px] bg-[radial-gradient(circle,rgba(0,242,200,0.04)_0%,transparent_70%)] animate-float-orb"></div>
          <div className="absolute w-[300px] h-[300px] bottom-[-50px] left-[5%] bg-[radial-gradient(circle,rgba(0,90,255,0.03)_0%,transparent_70%)] animate-float-orb-delayed"></div>
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:60px_60px]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-y-6 md:gap-y-10 gap-x-6 md:gap-12 mb-6 md:mb-16">
            {/* Brand Section */}
            <div className="col-span-3 md:col-span-1 lg:col-span-5 space-y-6">
              <Link to="/" className="block">
                <img
                  src={frontendFooterLogo || "/img/light-logo.svg"}
                  alt="Selectt Cars"
                  className="h-14 w-auto object-contain"
                />
              </Link>
              <p className="text-slate-300 text-sm md:text-base leading-relaxed max-w-sm font-medium">
                India's most trusted online marketplace for buying and selling pre-owned cars. Fair prices. Zero drama. Powered by technology.
              </p>

              {/* Square social icon buttons with #00DCBB color */}
              <div className="flex gap-3 pt-1">
                <a href="https://www.facebook.com/selectt.cars" target="_blank" rel="noopener noreferrer" className="w-10 h-10 border border-[#00DCBB]/40 bg-[#00DCBB]/10 hover:border-[#00DCBB] rounded-xl flex items-center justify-center text-[#00DCBB] hover:bg-[#00DCBB] hover:text-[#0C1B33] transition-all duration-300 shadow-sm" title="Facebook">
                  <Facebook size={18} />
                </a>
                <a href="https://www.instagram.com/selectt.cars/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 border border-[#00DCBB]/40 bg-[#00DCBB]/10 hover:border-[#00DCBB] rounded-xl flex items-center justify-center text-[#00DCBB] hover:bg-[#00DCBB] hover:text-[#0C1B33] transition-all duration-300 shadow-sm" title="Instagram">
                  <Instagram size={18} />
                </a>
                <a href="https://www.youtube.com/@selecttcars" target="_blank" rel="noopener noreferrer" className="w-10 h-10 border border-[#00DCBB]/40 bg-[#00DCBB]/10 hover:border-[#00DCBB] rounded-xl flex items-center justify-center text-[#00DCBB] hover:bg-[#00DCBB] hover:text-[#0C1B33] transition-all duration-300 shadow-sm" title="YouTube">
                  <Youtube size={18} />
                </a>
              </div>
            </div>

            {/* Links Column 1: BUY */}
            <div className="col-span-3 md:col-span-1 lg:col-span-2 border-b border-white/5 md:border-none pb-4 md:pb-0">
              <button
                onClick={() => toggleSection('buy')}
                className="w-full md:pointer-events-none flex justify-between items-center text-left focus:outline-none"
              >
                <h4 className="font-extrabold text-sm uppercase tracking-widest text-white">
                  Buy
                </h4>
                <span className="md:hidden text-slate-400 text-lg font-bold">
                  {activeSection === 'buy' ? '−' : '+'}
                </span>
              </button>
              <ul className={`space-y-2.5 text-sm font-medium mt-3 md:mt-4 transition-all duration-300 md:block ${activeSection === 'buy' ? 'block' : 'hidden'}`}>
                <li><Link to="/buy-cars" className="hover:text-[#00DCBB] transition-colors">Browse all cars</Link></li>
                <li><Link to="/buy-cars?bodyType=SUV" className="hover:text-[#00DCBB] transition-colors">SUVs</Link></li>
                <li><Link to="/buy-cars?bodyType=Sedan" className="hover:text-[#00DCBB] transition-colors">Sedans</Link></li>
                <li><Link to="/buy-cars?fuelType=EV" className="hover:text-[#00DCBB] transition-colors">Electric cars</Link></li>
                <li><Link to="/used-car-loan" className="hover:text-[#00DCBB] transition-colors">Car finance</Link></li>
                <li><Link to="/pricing" className="hover:text-[#00DCBB] transition-colors">EMI calculator</Link></li>
              </ul>
            </div>

            {/* Links Column 2: SELL */}
            <div className="col-span-3 md:col-span-1 lg:col-span-2 border-b border-white/5 md:border-none pb-4 md:pb-0">
              <button
                onClick={() => toggleSection('sell')}
                className="w-full md:pointer-events-none flex justify-between items-center text-left focus:outline-none"
              >
                <h4 className="font-extrabold text-sm uppercase tracking-widest text-white">
                  Sell
                </h4>
                <span className="md:hidden text-slate-400 text-lg font-bold">
                  {activeSection === 'sell' ? '−' : '+'}
                </span>
              </button>
              <ul className={`space-y-2.5 text-sm font-medium mt-3 md:mt-4 transition-all duration-300 md:block ${activeSection === 'sell' ? 'block' : 'hidden'}`}>
                <li><Link to="/sell-car" className="hover:text-[#00DCBB] transition-colors">List your car</Link></li>
                <li><Link to="/sell-car" className="hover:text-[#00DCBB] transition-colors">Car valuation</Link></li>
                <li><Link to="/sell-car" className="hover:text-[#00DCBB] transition-colors">Sell in 24 hours</Link></li>
                <li><Link to="/about-us" className="hover:text-[#00DCBB] transition-colors">Seller stories</Link></li>
              </ul>
            </div>

            {/* Links Column 3: COMPANY */}
            <div className="col-span-3 md:col-span-1 lg:col-span-3 pb-4 md:pb-0">
              <button
                onClick={() => toggleSection('company')}
                className="w-full md:pointer-events-none flex justify-between items-center text-left focus:outline-none"
              >
                <h4 className="font-extrabold text-sm uppercase tracking-widest text-white">
                  Company
                </h4>
                <span className="md:hidden text-slate-400 text-lg font-bold">
                  {activeSection === 'company' ? '−' : '+'}
                </span>
              </button>
              <ul className={`space-y-2.5 text-sm font-medium mt-3 md:mt-4 transition-all duration-300 md:block ${activeSection === 'company' ? 'block' : 'hidden'}`}>
                <li><Link to="/about-us" className="hover:text-[#00DCBB] transition-colors">About Selectt</Link></li>
                <li><Link to="/contact-us" className="hover:text-[#00DCBB] transition-colors">Contact</Link></li>
                <li><Link to="/careers" className="hover:text-[#00DCBB] transition-colors">Careers</Link></li>
                <li><Link to="/blog" className="hover:text-[#00DCBB] transition-colors">Blog</Link></li>
                <li><Link to="/customer-reviews" className="hover:text-[#00DCBB] transition-colors">Customer Reviews</Link></li>
                <li><Link to="/car-hub-locations" className="hover:text-[#00DCBB] transition-colors">Car Hub Locations</Link></li>
              </ul>
            </div>
          </div>

          {/* Big Tagline */}
          <div className="py-6 md:py-12 border-t border-white/5 flex justify-center items-center">
            <style>{`
              @keyframes cursorBlink {
                50% { opacity: 0; }
              }
            `}</style>
            <h2 className="text-[26px] xs:text-4xl sm:text-5xl md:text-6xl lg:text-[5.5rem] font-black text-white tracking-tight flex items-center min-h-[1.2em] whitespace-nowrap">
              <span>{firstPart}</span>
              <span className="text-[#0CFFEC]">{secondPart}</span>
              <span
                className="w-[3px] md:w-[8px] h-[0.9em] bg-[#0CFFEC] ml-1.5 md:ml-2 inline-block shrink-0"
                style={{
                  animation: 'cursorBlink 0.8s step-end infinite'
                }}
              />
            </h2>
          </div>

          {/* SEO Location Links */}
          <div className="py-10 border-t border-white/5 text-xs text-slate-500 relative z-10">
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Buy Used car in</h3>
              <div className="flex flex-wrap gap-x-2 gap-y-2 leading-relaxed">
                {buyUsedCarCities.map((cityName, idx) => (
                  <React.Fragment key={cityName}>
                    {idx > 0 && <span className="text-slate-700">|</span>}
                    <Link
                      to={`/buy-cars?city=${encodeURIComponent(cityName)}`}
                      onClick={() => localStorage.setItem('user_city', cityName)}
                      className="hover:text-white transition-colors"
                    >
                      {cityName}
                    </Link>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
            <div className="text-xs text-slate-500 flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
              <span>© 2026 Selectt Mobility | All rights reserved.</span>
              <span className="hidden sm:inline text-slate-700">|</span>
              <span>Developed by <a href="https://wepnex.com" target="_blank" rel="noopener noreferrer" className="text-[#00C9AF] hover:underline font-semibold">wepnex.com</a></span>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-end gap-x-6 gap-y-3 text-xs text-slate-500">
              <Link className="hover:text-white transition-colors" to="/privacy-policy">Privacy policy</Link>
              <Link className="hover:text-white transition-colors" to="/terms-conditions">Terms of use</Link>
              <Link className="hover:text-white transition-colors" to="/faq">FAQs</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation */}
      {!isCarDetailsPage && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-lg">
          <div className="flex items-center justify-around h-16 px-2">
            <Link to="/" className={`flex flex-col items-center justify-center gap-1 flex-1 ${location.pathname === '/' ? 'text-[#00C9AF]' : 'text-slate-500'} hover:text-[#00C9AF] transition-colors`}>
              <Home size={22} strokeWidth={2} />
              <span className="text-[10px] font-bold">Home</span>
            </Link>
            <Link to="/buy-cars" className={`flex flex-col items-center justify-center gap-1 flex-1 ${location.pathname === '/buy-cars' ? 'text-[#00C9AF]' : 'text-slate-500'} hover:text-[#00C9AF] transition-colors`}>
              <ShoppingCart size={22} strokeWidth={2} />
              <span className="text-[10px] font-bold">Buy Car</span>
            </Link>
            <Link to="/profile?tab=wishlisted" className={`flex flex-col items-center justify-center gap-1 flex-1 ${location.pathname === '/profile' && location.search.includes('tab=wishlisted') ? 'text-[#00C9AF]' : 'text-slate-500'} hover:text-[#00C9AF] transition-colors`}>
              <Heart size={22} strokeWidth={2} />
              <span className="text-[10px] font-bold">Shortlist</span>
            </Link>
            <Link to="/sell-car" className={`flex flex-col items-center justify-center gap-1 flex-1 ${location.pathname === '/sell-car' ? 'text-[#00C9AF]' : 'text-slate-500'} hover:text-[#00C9AF] transition-colors`}>
              <TrendingUp size={22} strokeWidth={2} />
              <span className="text-[10px] font-bold">Sell</span>
            </Link>
            <button
              onClick={() => user ? navigate('/profile') : openLoginModal()}
              className={`flex flex-col items-center justify-center gap-1 flex-1 ${location.pathname === '/profile' && !location.search.includes('tab=wishlisted') ? 'text-[#00C9AF]' : 'text-slate-500'} hover:text-[#00C9AF] transition-colors`}
            >
              <User size={22} strokeWidth={2} />
              <span className="text-[10px] font-bold">{user ? "Profile" : "Account"}</span>
            </button>
          </div>
        </nav>
      )}

      {/* Help & Support Floating Widget */}
      <div className="fixed bottom-[155px] md:bottom-8 right-0 z-[9999] flex flex-col items-end gap-3">

        {/* Panel */}
        {helpOpen && (
          <div className="bg-white rounded-2xl shadow-2xl w-[300px] border border-slate-100 overflow-hidden">

            {helpView === 'menu' && (
              <>
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                  <span className="text-[15px] font-bold text-[#0A1C3A]">Help &amp; Support</span>
                  <button onClick={() => setHelpOpen(false)} className="text-slate-400 hover:text-slate-700 transition-colors">
                    <X size={18} />
                  </button>
                </div>

                {/* Menu Items */}
                <div className="divide-y divide-slate-100">
                  {/* WhatsApp */}
                  <a
                    href="https://wa.me/918574667466"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50/50 transition-all duration-300 group"
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 group-hover:bg-[#00C9AF]/10 transition-all duration-300">
                      <svg className="w-5 h-5 text-[#0A1C3A] group-hover:text-[#00C9AF] transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="text-[13px] font-bold text-[#0A1C3A] group-hover:text-[#00C9AF] transition-colors duration-300">Ask us on WhatsApp!</div>
                      <div className="text-[11px] text-slate-500">Get instant support via experts</div>
                    </div>
                    <svg className="w-4 h-4 text-slate-400 group-hover:text-[#00C9AF] transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </a>

                  {/* Call Back */}
                  <button
                    onClick={() => setHelpView('callback')}
                    className="w-full flex items-center gap-4 px-5 py-4 hover:bg-slate-50/50 transition-all duration-300 group text-left cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 group-hover:bg-[#00C9AF]/10 transition-all duration-300">
                      <svg className="w-5 h-5 text-[#0A1C3A] group-hover:text-[#00C9AF] transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                    </div>
                    <div className="flex-1">
                      <div className="text-[13px] font-bold text-[#0A1C3A] group-hover:text-[#00C9AF] transition-colors duration-300">Request a call back</div>
                      <div className="text-[11px] text-slate-500">Our team will contact you shortly!</div>
                    </div>
                    <svg className="w-4 h-4 text-slate-400 group-hover:text-[#00C9AF] transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </button>

                  {/* FAQ */}
                  <Link
                    to="/faq"
                    onClick={() => setHelpOpen(false)}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50/50 transition-all duration-300 group"
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 group-hover:bg-[#00C9AF]/10 transition-all duration-300">
                      <MessageCircle size={20} className="text-[#0A1C3A] group-hover:text-[#00C9AF] transition-colors duration-300" />
                    </div>
                    <div className="flex-1">
                      <div className="text-[13px] font-bold text-[#0A1C3A] group-hover:text-[#00C9AF] transition-colors duration-300">View FAQ's</div>
                      <div className="text-[11px] text-slate-500">Find answers to FAQ's</div>
                    </div>
                    <svg className="w-4 h-4 text-slate-400 group-hover:text-[#00C9AF] transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </Link>
                </div>
              </>
            )}

            {helpView === 'callback' && (
              <>
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setHelpView('menu')} className="text-slate-400 hover:text-slate-700 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <span className="text-[15px] font-bold text-[#0A1C3A]">Request call back</span>
                  </div>
                  <button onClick={() => setHelpOpen(false)} className="text-slate-400 hover:text-slate-700 transition-colors">
                    <X size={18} />
                  </button>
                </div>

                {/* Form */}
                <div className="px-5 py-4 flex flex-col gap-3">
                  <div>
                    <label className="text-[12px] font-bold text-[#0A1C3A] mb-1 block">Phone Number</label>
                    <input
                      type="tel"
                      value={callbackPhone}
                      onChange={e => setCallbackPhone(e.target.value)}
                      placeholder="+91 XXXXXXXXXX"
                      className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-[13px] text-slate-800 outline-none focus:border-[#00C9AF] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-[12px] font-bold text-[#0A1C3A] mb-1 block">Language</label>
                    <div className="relative">
                      <select
                        value={callbackLang}
                        onChange={e => setCallbackLang(e.target.value)}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-[13px] text-slate-800 outline-none focus:border-[#00C9AF] transition-colors appearance-none bg-white"
                      >
                        {['Hindi', 'English', 'Marathi'].map(l => (
                          <option key={l}>{l}</option>
                        ))}
                      </select>
                      <svg className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>
                  <textarea
                    value={callbackMsg}
                    onChange={e => setCallbackMsg(e.target.value)}
                    placeholder="Tell us what you need help with"
                    rows={3}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-[13px] text-slate-800 outline-none focus:border-[#00C9AF] transition-colors resize-none"
                  />
                  <p className="text-[11px] text-slate-500 text-center">To have a Selectt representative call you, please click below</p>
                  <a
                    href={`https://wa.me/918574667466?text=${encodeURIComponent(`Hi, I'd like a call back. Phone: ${callbackPhone}. Language: ${callbackLang}. ${callbackMsg}`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-3 bg-slate-200 hover:bg-[#00C9AF] hover:text-white text-slate-500 font-bold text-[11px] uppercase tracking-widest rounded-xl text-center transition-all"
                  >
                    CALL ME
                  </a>
                </div>
              </>
            )}
          </div>
        )}

        {/* Floating trigger button */}
        <button
          onClick={() => { setHelpOpen(o => !o); setHelpView('menu'); }}
          className="pl-4 pr-3 h-11 bg-slate-900 hover:bg-black rounded-l-full border-l border-y border-white/10 shadow-lg flex items-center justify-center transition-all hover:pl-5"
          aria-label="Help & Support"
        >
          <HelpCircle size={22} className="text-white" />
        </button>
      </div>

      <style>{`
        @keyframes whatsapp-glow {
          0%, 100% {
            box-shadow: 0 0 0 0px rgba(37, 211, 102, 0.6), 0 4px 12px rgba(37, 211, 102, 0.3);
          }
          50% {
            box-shadow: 0 0 0 14px rgba(37, 211, 102, 0), 0 4px 20px rgba(37, 211, 102, 0.5);
          }
        }
        .animate-whatsapp-glow {
          animation: whatsapp-glow 2s infinite ease-in-out;
        }

        /* Float Orb keyframes for Footer background */
        @keyframes float-orb {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }
        @keyframes float-orb-delayed {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(20px) scale(1.03); }
        }
        .animate-float-orb {
          animation: float-orb 12s ease-in-out infinite;
        }
        .animate-float-orb-delayed {
          animation: float-orb-delayed 15s ease-in-out infinite 3s;
        }
      `}</style>
    </>
  );
};

export default Footer;
