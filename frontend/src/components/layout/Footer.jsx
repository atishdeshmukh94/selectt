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

              {/* Social Icon Buttons */}
              <div className="flex gap-3 pt-1">
                <a
                  href="https://www.facebook.com/selectt.cars"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 border border-white/20 bg-white/10 hover:bg-[#00C9AF] hover:border-[#00C9AF] text-white hover:text-[#0C1B33] rounded-xl flex items-center justify-center transition-all duration-300 shadow-sm"
                  title="Facebook"
                  aria-label="Facebook"
                >
                  <Facebook size={18} className="stroke-[2.2]" />
                </a>
                <a
                  href="https://www.instagram.com/selectt.cars/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 border border-white/20 bg-white/10 hover:bg-[#00C9AF] hover:border-[#00C9AF] text-white hover:text-[#0C1B33] rounded-xl flex items-center justify-center transition-all duration-300 shadow-sm"
                  title="Instagram"
                  aria-label="Instagram"
                >
                  <Instagram size={18} className="stroke-[2.2]" />
                </a>
                <a
                  href="https://www.youtube.com/@selecttcars"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 border border-white/20 bg-white/10 hover:bg-[#00C9AF] hover:border-[#00C9AF] text-white hover:text-[#0C1B33] rounded-xl flex items-center justify-center transition-all duration-300 shadow-sm"
                  title="YouTube"
                  aria-label="YouTube"
                >
                  <Youtube size={18} className="stroke-[2.2]" />
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
