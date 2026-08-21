import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../config/api';
import {
  MapPin,
  ChevronDown,
  Search,
  Heart,
  User,
  Menu,
  Phone,
  X,
  ChevronRight,
  Car,
  Wrench,
  DollarSign,
  RefreshCw,
  Settings,
  Download,
  FileText,
  IndianRupee,
  Key
} from 'lucide-react';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, openLoginModal, logout } = useAuth();
  const isHomePage = location.pathname === '/';
  const [city, setCity] = useState(localStorage.getItem('user_city') || 'Delhi NCR');
  const [searchText, setSearchText] = useState('');
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [frontendHeaderLogo, setFrontendHeaderLogo] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch(`${API_URL}/api/settings/public`);
        const data = await response.json();
        if (data.frontend_header_logo) {
          setFrontendHeaderLogo(`${API_URL}${data.frontend_header_logo}`);
        }
      } catch (err) {
        console.error("Error fetching settings:", err);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleLocationChange = () => {
      setCity(localStorage.getItem('user_city') || 'Delhi NCR');
    };
    window.addEventListener('location-changed', handleLocationChange);
    return () => window.removeEventListener('location-changed', handleLocationChange);
  }, []);

  const openLocationPicker = () => {
    window.dispatchEvent(new Event('open-location-selector'));
  };

  const handleNavFilter = (query) => {
    const baseFilters = { budget: '', budget_min: null, budget_max: 25, certification: '', brands: [], models: [], fuel: '', transmission: '', owners: [], year_min: null, km_max: null, body_type: [], searchQuery: '' };
    const filters = { ...baseFilters, ...query };
    const params = new URLSearchParams();

    if (filters.brands && filters.brands.length > 0) params.set('brand', filters.brands.join(','));
    if (filters.models && filters.models.length > 0) params.set('model', filters.models.join(','));
    if (filters.body_type && filters.body_type.length > 0) params.set('bodyType', filters.body_type.join(','));
    if (filters.fuel) params.set('fuel', filters.fuel);
    if (filters.transmission) params.set('transmission', filters.transmission);
    if (filters.owners && filters.owners.length > 0) params.set('owners', filters.owners.join(','));
    if (filters.year_min) params.set('year_min', String(filters.year_min));
    if (filters.km_max) params.set('km_max', String(filters.km_max));
    if (filters.tag) params.set('tag', filters.tag);
    if (filters.certification) params.set('certification', filters.certification);
    if (filters.budget) params.set('budget', filters.budget);
    if (filters.budget_min) params.set('budget_min', String(filters.budget_min));
    if (filters.budget_max && filters.budget_max < 25) params.set('budget_max', String(filters.budget_max));
    if (filters.searchQuery) params.set('search', filters.searchQuery);

    const queryString = params.toString();
    const targetUrl = queryString ? `/buy-cars?${queryString}` : '/buy-cars';

    navigate(targetUrl, { state: { filters } });
  };

  const handleTextSearch = () => {
    if (searchText.trim()) {
      handleNavFilter({ searchQuery: searchText.trim() });
      setShowMobileSearch(false);
    }
  };

  const PurpDropdown = ({ title, options }) => (
    <div className="relative group/nav z-[60] h-full flex items-center">
      <button className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-semibold text-slate-700 hover:text-slate-950 whitespace-nowrap rounded transition-colors peer cursor-pointer h-8 group-hover/nav:text-[#00B4A0]">
        {title} <ChevronDown size={13} className="opacity-70 group-hover/nav:opacity-100 group-hover/nav:rotate-180 transition-all duration-200" />
      </button>
      <div className="absolute top-[100%] left-0 w-52 bg-[#051124] shadow-2xl opacity-0 invisible group-hover/nav:opacity-100 group-hover/nav:visible transition-all duration-200 py-2.5 rounded-b-lg border border-white/5 border-t-2 border-t-[#00C9AF]">
        {options.map((opt, i) => (
          <button
            key={i}
            onClick={() => handleNavFilter(opt.query)}
            className="w-full text-left px-5 py-2 text-[13px] font-medium text-slate-200 hover:text-[#00C9AF] hover:bg-white/5 transition-colors cursor-pointer"
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );

  const MegaDropdown = () => (
    <div className="relative group/mega z-[60] h-full flex items-center">
      <button className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-semibold text-slate-700 hover:text-slate-950 whitespace-nowrap rounded transition-colors peer cursor-pointer h-8 group-hover/mega:text-[#00B4A0]">
        Make and Model <ChevronDown size={13} className="opacity-70 group-hover/mega:opacity-100 group-hover/mega:rotate-180 transition-all duration-200" />
      </button>
      <div className="absolute top-[100%] left-0 w-[600px] bg-[#051124] shadow-2xl opacity-0 invisible group-hover/mega:opacity-100 group-hover/mega:visible transition-all duration-200 p-6 rounded-b-lg border border-white/5 border-t-2 border-t-[#00C9AF] flex gap-8">

        {/* Column 1 */}
        <div className="flex-1 flex flex-col gap-6">
          <div>
            <button onClick={() => handleNavFilter({ brands: ['Maruti Suzuki'] })} className="text-[14px] font-bold text-white mb-2 flex items-center hover:text-[#00C9AF] transition-colors">Maruti Suzuki <ChevronRight size={14} className="ml-1" /></button>
            <div className="flex flex-col space-y-2">
              {['Baleno', 'Swift', 'Alto 800', 'Wagon R', 'Ciaz'].map(m => (
                <button key={m} onClick={() => handleNavFilter({ models: [m] })} className="text-[13px] text-slate-300 hover:text-[#00C9AF] text-left transition-colors cursor-pointer">{m}</button>
              ))}
            </div>
          </div>
          <div>
            <button onClick={() => handleNavFilter({ brands: ['Hyundai'] })} className="text-[14px] font-bold text-white mb-2 flex items-center hover:text-[#00C9AF] transition-colors">Hyundai <ChevronRight size={14} className="ml-1" /></button>
            <div className="flex flex-col space-y-2">
              {['Grand i10', 'i20', 'Creta', 'Elite i20', 'Venue'].map(m => (
                <button key={m} onClick={() => handleNavFilter({ models: [m] })} className="text-[13px] text-slate-300 hover:text-[#00C9AF] text-left transition-colors cursor-pointer">{m}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Column 2 */}
        <div className="flex-1 flex flex-col gap-6">
          <div>
            <button onClick={() => handleNavFilter({ brands: ['Honda'] })} className="text-[14px] font-bold text-white mb-2 flex items-center hover:text-[#00C9AF] transition-colors">Honda <ChevronRight size={14} className="ml-1" /></button>
            <div className="flex flex-col space-y-2">
              {['City', 'Amaze', 'Jazz', 'Brio', 'Elevate'].map(m => (
                <button key={m} onClick={() => handleNavFilter({ models: [m] })} className="text-[13px] text-slate-300 hover:text-[#00C9AF] text-left transition-colors cursor-pointer">{m}</button>
              ))}
            </div>
          </div>
          <div>
            <button onClick={() => handleNavFilter({ brands: ['Tata'] })} className="text-[14px] font-bold text-white mb-2 flex items-center hover:text-[#00C9AF] transition-colors">Tata <ChevronRight size={14} className="ml-1" /></button>
            <div className="flex flex-col space-y-2">
              {['Nexon', 'Tiago', 'Altroz', 'Punch', 'Harrier'].map(m => (
                <button key={m} onClick={() => handleNavFilter({ models: [m] })} className="text-[13px] text-slate-300 hover:text-[#00C9AF] text-left transition-colors cursor-pointer">{m}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Column 3 */}
        <div className="flex-1 flex flex-col gap-6">
          <div>
            <button onClick={() => handleNavFilter({ brands: ['Kia'] })} className="text-[14px] font-bold text-white mb-2 flex items-center hover:text-[#00C9AF] transition-colors">Kia <ChevronRight size={14} className="ml-1" /></button>
            <div className="flex flex-col space-y-2">
              {['Seltos', 'Sonet', 'Carens', 'Syros', 'Carens Clavis'].map(m => (
                <button key={m} onClick={() => handleNavFilter({ models: [m] })} className="text-[13px] text-slate-300 hover:text-[#00C9AF] text-left transition-colors cursor-pointer">{m}</button>
              ))}
            </div>
          </div>
          <div>
            <button onClick={() => handleNavFilter({ brands: ['Renault'] })} className="text-[14px] font-bold text-white mb-2 flex items-center hover:text-[#00C9AF] transition-colors">Renault <ChevronRight size={14} className="ml-1" /></button>
            <div className="flex flex-col space-y-2">
              {['Kwid', 'Kiger', 'Triber', 'Duster', 'Captur'].map(m => (
                <button key={m} onClick={() => handleNavFilter({ models: [m] })} className="text-[13px] text-slate-300 hover:text-[#00C9AF] text-left transition-colors cursor-pointer">{m}</button>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );

  const categories = [
    { name: 'MAX', subtitle: 'Luxury cars', color: 'bg-red-50', icon: '🏆' },
    { name: 'Assured+', subtitle: 'Premium benefits', color: 'bg-purple-50', icon: '⭐' },
    { name: 'Assured', subtitle: 'Quality cars', color: 'bg-purple-50', icon: '✓' },
    { name: 'budget', subtitle: 'Value picks', color: 'bg-blue-50', icon: '💰' }
  ];

  const bodyTypes = [
    { name: 'SUV', icon: '🚙' },
    { name: 'MUV', icon: '🚐' },
    { name: 'Hatchback', icon: '🚗' },
    { name: 'Sedan', icon: '🚘' }
  ];

  const menuItems = [
    { name: 'Sell car', icon: Car },
    { name: 'Scrap car', icon: Wrench },
    { name: 'Car valuation', icon: DollarSign },
    { name: 'Finance', icon: DollarSign },
    { name: 'Exchange', icon: RefreshCw, badge: 'NEW' },

  ];

  return (
    <>
      {/* Desktop & Tablet Header */}
      <header
        className="sticky top-0 z-50 text-white"
        style={{
          background: scrolled
            ? 'rgba(5, 17, 36, 0.85)'
            : '#051124',
          backdropFilter: scrolled ? 'blur(24px) saturate(2)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(24px) saturate(2)' : 'none',
          borderBottom: scrolled
            ? '1px solid rgba(0, 196, 175, 0.15)'
            : '1px solid rgba(255, 255, 255, 0.05)',
          boxShadow: scrolled
            ? '0 2px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.07)'
            : 'none',
          transition: 'background 0.35s ease, backdrop-filter 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease',
        }}
      >
        {/* Main Navigation Row */}
        <div className="hidden md:block">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-6">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0 group">
              {frontendHeaderLogo ? (
                <img src={frontendHeaderLogo} alt="Logo" className="h-10 md:h-12 w-auto object-contain transition-transform group-hover:scale-105 duration-200" />
              ) : (
                <>
                  <div className="bg-[#00C9AF] w-8 h-8 rounded-lg flex items-center justify-center font-extrabold text-[#0A1C3A] text-[19px] tracking-tight transition-transform group-hover:scale-105 duration-200">
                    S
                  </div>
                  <span className="text-xl font-bold tracking-tight text-white font-sans flex items-baseline select-none">
                    Selectt<span className="text-[#00C9AF] ml-0.5 font-extrabold">.</span>
                  </span>
                </>
              )}
            </Link>

            {/* Location Dropdown */}
            <div className="hidden lg:block">
              <button
                onClick={openLocationPicker}
                className="bg-[#0c1e35] hover:bg-[#122844] border border-[#1e324c]/85 text-white flex items-center gap-1.5 px-4 py-1.5 rounded-full transition-all duration-200 cursor-pointer shadow-inner"
              >
                <MapPin size={16} className="text-[#00C9AF]" />
                <span className="text-[13px] font-semibold tracking-wide text-white">{city}</span>
                <ChevronDown size={14} className="text-white/60 group-hover:text-white" />
              </button>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 cursor-pointer hover:text-white transition-colors" size={16} onClick={handleTextSearch} />
                <input
                  className="w-full pl-10 pr-4 py-1.5 bg-[#0b1b30] border border-[#1d304a] focus:border-[#00C9AF] focus:bg-[#0f243f] rounded-full focus:ring-2 focus:ring-[#00C9AF]/10 text-[13px] text-white placeholder:text-white/40 transition-all font-medium outline-none"
                  placeholder="Search by brands, models, etc."
                  type="text"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleTextSearch();
                  }}
                />
              </div>
            </div>

            {/* Right Actions & Nav */}
            <div className="flex items-center gap-6 shrink-0">
              <Link className="text-[13px] font-bold text-white hover:text-[#00C9AF] transition-colors" to="/buy-cars">Buy Car</Link>
              <Link className="text-[13px] font-bold text-white hover:text-[#00C9AF] transition-colors" to="/sell-car">Sell Car</Link>

              <Link to="/profile?tab=wishlisted" className="flex items-center hover:opacity-75 transition-opacity">
                <img src="/icons/heart.svg" alt="Wishlist" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
              </Link>

              {user ? (
                <div className="relative group/account flex items-center h-16">
                  <button className="flex items-center gap-1.5 text-[13px] font-bold text-white hover:text-[#00C9AF] transition-colors cursor-pointer">
                    <User size={18} />
                    <span>Account</span>
                  </button>

                  {/* Account Dropdown */}
                  <div className="absolute top-16 right-0 w-60 bg-[#162947] rounded-b-xl shadow-2xl opacity-0 invisible group-hover/account:opacity-100 group-hover/account:visible transition-all duration-300 transform origin-top border border-[#1a3052] border-t-0 py-2 z-[100]">
                    <div className="px-5 py-3 border-b border-white-700/50 mb-2">
                      <span className="text-xs text-slate-400 block mb-1">Logged in as</span>
                      {user.first_name ? (
                        <>
                          <span className="text-sm font-black text-[#00C9AF] block mb-0.5">{user.first_name} {user.last_name}</span>
                          <span className="text-[11px] font-semibold text-slate-400 block">+91 {user.phone}</span>
                        </>
                      ) : (
                        <span className="text-sm font-bold text-white">+91 {user.phone}</span>
                      )}
                    </div>
                    <Link to="/profile?tab=profile" className="block px-5 py-2.5 text-sm font-bold text-white hover:bg-white/10 transition-colors">
                      My Profile
                    </Link>
                    <Link to="/profile?tab=wishlisted" className="block px-5 py-2.5 text-sm font-bold text-white hover:bg-white/10 transition-colors">
                      Wishlisted Cars
                    </Link>
                    <Link to="/profile?tab=bookings" className="block px-5 py-2.5 text-sm font-bold text-white hover:bg-white/10 transition-colors">
                      Bookings
                    </Link>
                    <Link to="/profile?tab=testdrives" className="block px-5 py-2.5 text-sm font-bold text-white hover:bg-white/10 transition-colors">
                      Test Drives
                    </Link>
                    <Link to="/profile?tab=sell" className="block px-5 py-2.5 text-sm font-bold text-white hover:bg-white/10 transition-colors">
                      Sell Car
                    </Link>
                    <Link to="/profile?tab=buy" className="block px-5 py-2.5 text-sm font-bold text-white hover:bg-white/10 transition-colors">
                      Buy Cars
                    </Link>
                    <Link to="/profile?tab=loan" className="block px-5 py-2.5 text-sm font-bold text-white hover:bg-white/10 transition-colors">
                      Car Loan
                    </Link>
                    <div className="border-t border-white-700/50 mt-2 pt-2">
                      <button
                        onClick={() => { logout(); navigate('/'); }}
                        className="w-full text-left px-5 py-2.5 text-sm font-bold text-red-400 hover:bg-white/10 transition-colors"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => openLoginModal()}
                  className="flex items-center gap-1.5 text-[13px] font-bold text-white hover:text-[#00C9AF] transition-colors cursor-pointer"
                >
                  <User size={18} />
                  <span>Account</span>
                </button>
              )}

              <a href="tel:+91-857466-7466" className="flex items-center gap-1.5 text-[13px] font-bold text-[#00C9AF] hover:text-[#00C9AF]/80 transition-colors">
                <Phone size={16} />
                <span>+91-857466-7466</span>
              </a>
            </div>
          </div>
        </div>

        {/* Filters Row (Desktop Only) */}
        <div
          className="hidden md:block border-t border-b relative z-40"
          style={{
            background: '#f9f9f9 ',
            borderTop: '1px solid rgba(0, 0, 0, 0.08)',
            borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
          }}
        >
          <div className="max-w-7xl mx-auto px-4 h-11 flex items-center gap-1.5 text-slate-700">
            <PurpDropdown
              title="Explore By"
              options={[
                { label: 'Selectt Assured', query: { certification: 'Assured' } },
                { label: 'Selectt Assured+', query: { certification: 'Assured+' } },
                { label: 'Luxury Cars', query: { budget: '10 L +' } },
                { label: 'Value Picks', query: { budget: 'Under 3 L' } }
              ]}
            />

            <PurpDropdown
              title="Price Range"
              options={[
                { label: 'Under 3 Lakh', query: { budget: 'Under 3 L' } },
                { label: '3 - 4 Lakh', query: { budget_max: 4 } },
                { label: '4 - 5 Lakh', query: { budget_max: 5 } },
                { label: '5 - 6 Lakh', query: { budget_max: 6 } },
                { label: '6 - 8 Lakh', query: { budget_max: 8 } },
                { label: '8 - 10 Lakh', query: { budget_max: 10 } },
                { label: 'Above 10 Lakh', query: { budget: '10 L +' } }
              ]}
            />

            <MegaDropdown />

            <PurpDropdown
              title="Year"
              options={[
                { label: '2024 & above', query: { year_min: 2024 } },
                { label: '2022 & above', query: { year_min: 2022 } },
                { label: '2020 & above', query: { year_min: 2020 } },
                { label: '2018 & above', query: { year_min: 2018 } },
                { label: '2016 & above', query: { year_min: 2016 } },
                { label: '2014 & above', query: { year_min: 2014 } },
                { label: '2012 & above', query: { year_min: 2012 } },
                { label: '2010 & above', query: { year_min: 2010 } }
              ]}
            />

            <PurpDropdown
              title="Fuel"
              options={[
                { label: 'Petrol', query: { fuel: 'Petrol' } },
                { label: 'Diesel', query: { fuel: 'Diesel' } },
                { label: 'CNG', query: { fuel: 'CNG' } },
                { label: 'Electric', query: { fuel: 'Electric' } },
                { label: 'Hybrid', query: { fuel: 'Hybrid' } }
              ]}
            />

            <PurpDropdown
              title="KM Driven"
              options={[
                { label: '10,000 kms or less', query: { km_max: 10000 } },
                { label: '30,000 kms or less', query: { km_max: 30000 } },
                { label: '50,000 kms or less', query: { km_max: 50000 } },
                { label: '75,000 kms or less', query: { km_max: 75000 } },
                { label: '1,00,000 kms or less', query: { km_max: 100000 } },
                { label: '1,25,000 kms or less', query: { km_max: 125000 } },
                { label: '1,50,000 kms or less', query: { km_max: 150000 } }
              ]}
            />

            <PurpDropdown
              title="Body Type"
              options={[
                { label: 'Hatchback', query: { body_type: ['Hatchback'] } },
                { label: 'Sedan', query: { body_type: ['Sedan'] } },
                { label: 'SUV', query: { body_type: ['SUV'] } },
                { label: 'MUV', query: { body_type: ['MUV'] } }
              ]}
            />

            <PurpDropdown
              title="Transmission"
              options={[
                { label: 'Automatic', query: { transmission: 'Automatic' } },
                { label: 'Manual', query: { transmission: 'Manual' } }
              ]}
            />

            <PurpDropdown
              title="Owner"
              options={[
                { label: '1st Owner', query: { owners: ['1st Owner'] } },
                { label: '2nd Owner', query: { owners: ['2nd Owner'] } },
                { label: '3rd Owner', query: { owners: ['3rd Owner'] } }
              ]}
            />
          </div>
        </div>
      </header>

      {/* Mobile Header */}
      {!isHomePage ? (
        <header className="md:hidden sticky top-0 z-50 bg-[#051124] text-white shadow-md border-b border-white/5">
          <div className="px-4 h-14 flex items-center justify-between gap-3">
            {/* Hamburger Menu */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
            >
              <Menu size={24} className="text-white" />
            </button>

            {/* Logo */}
            <Link to="/" className="flex-1 flex justify-center hover:opacity-80 transition-opacity">
              {frontendHeaderLogo ? (
                <img src={frontendHeaderLogo} alt="Logo" className="h-8 md:h-9 w-auto object-contain" />
              ) : (
                <div className="flex items-center gap-1.5">
                  <div className="bg-[#00C9AF] w-6 h-6 rounded-md flex items-center justify-center font-extrabold text-[#0A1C3A] text-[14px]">
                    S
                  </div>
                  <span className="text-md font-bold tracking-tight text-white select-none">
                    Selectt<span className="text-[#00C9AF] ml-0.5 font-extrabold">.</span>
                  </span>
                </div>
              )}
            </Link>

            {/* Location & Search */}
            <div className="flex items-center gap-1">
              {showMobileSearch ? (
                <div className="flex items-center bg-[#0b1b30] border border-[#1d304a] rounded-lg px-2 w-[180px] sm:w-[220px]">
                  <Search size={16} className="text-white/50 mr-1" />
                  <input
                    autoFocus
                    type="text"
                    placeholder="Search cars..."
                    className="w-full bg-transparent text-[11px] font-medium py-2 outline-none text-white placeholder:text-white/40"
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleTextSearch();
                    }}
                    onBlur={() => setTimeout(() => setShowMobileSearch(false), 200)}
                  />
                </div>
              ) : (
                <>
                  <button
                    onClick={openLocationPicker}
                    className="flex items-center gap-1 px-1.5 py-1 text-[10px] font-bold hover:bg-white/5 rounded transition-colors text-white"
                  >
                    <MapPin size={12} className="text-[#00C9AF]" />
                    {city}
                  </button>
                  <button onClick={() => setShowMobileSearch(true)} className="p-2 hover:bg-white/5 rounded-lg transition-colors text-white">
                    <Search size={20} className="text-white" />
                  </button>
                </>
              )}
              <Link to="/profile?tab=wishlisted" className="p-2 hover:bg-white/5 rounded-lg flex items-center transition-opacity hover:opacity-75">
                <img src="/icons/heart.svg" alt="Wishlist" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
              </Link>
            </div>
          </div>
        </header>
      ) : (
        <header className="md:hidden absolute top-0 left-0 right-0 z-[60] pt-5 pb-3 pointer-events-none">
          <div className="px-4 flex items-center justify-between text-white drop-shadow-md pointer-events-auto">
            <div className="flex items-center gap-5">
              {/* Custom Hamburger */}
              <div
                className="flex flex-col gap-[3px] w-8 h-8 justify-center cursor-pointer opacity-90 pb-1"
                onClick={() => setMobileMenuOpen(true)}
              >
                <div className="h-[2px] w-5 bg-white rounded-full"></div>
                <div className="h-[2px] w-5 bg-white rounded-full"></div>
                <div className="h-[2px] w-5 bg-white rounded-full"></div>
              </div>
              {/* Location */}
              <div
                onClick={openLocationPicker}
                className="flex items-center font-bold text-[17px] tracking-tight cursor-pointer"
              >
                {city} <ChevronDown size={16} className="ml-1.5 opacity-80" strokeWidth={2.5} />
              </div>
            </div>
            <Link to="/profile?tab=wishlisted" className="opacity-90 hover:opacity-70 transition-opacity">
              <img src="/icons/heart.svg" alt="Wishlist" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
            </Link>
          </div>
        </header>
      )}

      {/* Mobile Sidebar Menu */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-[150] md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Sidebar */}
          <div className="fixed top-0 left-0 bottom-0 w-[85%] max-w-sm bg-white z-[160] overflow-y-auto md:hidden">
            {/* Header (Navy Blue & White Theme) */}
            <div className="bg-gradient-to-r from-[#0C1B33] via-[#162947] to-[#0A162A] text-white p-4 sm:p-5 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center shadow-md shadow-[#13EDE5]/30 shrink-0 overflow-hidden p-2 border border-white/30">
                  <img
                    src="/img/favicon.png"
                    alt="Selectt Favicon"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.src = frontendHeaderLogo || "/img/light-logo.svg";
                    }}
                  />
                </div>
                <div className="text-left">
                  {user?.first_name ? (
                    <>
                      <div className="text-sm font-extrabold text-white leading-snug flex items-center gap-1.5">
                        <span>{user.first_name} {user.last_name || ''}</span>
                        <ChevronRight size={15} className="text-[#00FFDC]" />
                      </div>
                      <div className="text-xs text-slate-300 font-medium">+91 {user.phone}</div>
                    </>
                  ) : (
                    <div className="text-sm font-black text-white flex items-center gap-1.5">
                      <span>Login / Signup</span>
                      <ChevronRight size={16} className="text-[#00FFDC]" />
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-slate-200 hover:text-white transition-colors cursor-pointer shrink-0 ml-2"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content (Crisp Light Canvas) */}
            <div className="p-4 space-y-5 bg-white text-[#0C1B33]">
              {/* BUY Section */}
              <div>
                <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 text-left">BUY</h3>

                {/* By category */}
                <div className="mb-4">
                  <h4 className="text-xs font-semibold text-[#0C1B33] mb-2.5 text-left">By category</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      {
                        name: 'MAX',
                        subtitle: 'Luxury cars',
                        icon: '🏆',
                        query: { budget: '10 L +' }
                      },
                      {
                        name: 'Assured+',
                        subtitle: 'Premium benefits',
                        icon: '⭐',
                        query: { certification: 'Assured+' }
                      },
                      {
                        name: 'Assured',
                        subtitle: 'Quality cars',
                        icon: '✅',
                        query: { certification: 'Assured' }
                      },
                      {
                        name: 'budget',
                        subtitle: 'Value picks',
                        icon: '💸',
                        query: { budget: 'Under 3 L' }
                      }
                    ].map((cat, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          handleNavFilter(cat.query);
                          setMobileMenuOpen(false);
                        }}
                        className="flex flex-col items-center cursor-pointer group text-center"
                      >
                        {/* Clean Brand Styling Box */}
                        <div className="w-full h-15 bg-slate-50 hover:bg-[#13EDE5]/10 border border-slate-200 hover:border-[#13EDE5] text-[#0C1B33] rounded-2xl flex flex-col items-center justify-center p-1 transition-all duration-200">
                          <span className="text-lg leading-none mb-0.5 group-hover:scale-110 transition-transform">{cat.icon}</span>
                          <span className="text-[11px] font-semibold text-[#0C1B33] leading-tight tracking-tight">{cat.name}</span>
                        </div>
                        {/* Subtitle written BELOW the box */}
                        <span className="text-[9px] text-slate-500 font-medium leading-tight mt-1.5 w-full truncate">{cat.subtitle}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* By body type */}
                <div className="mb-4">
                  <h4 className="text-xs font-semibold text-[#0C1B33] mb-2 text-left">By body type</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { name: 'SUV', icon: '🚘', query: { body_type: ['SUV'] } },
                      { name: 'MUV', icon: '🚐', query: { body_type: ['MUV'] } },
                      { name: 'Hatchback', icon: '🚗', query: { body_type: ['Hatchback'] } },
                      { name: 'Sedan', icon: '🏎️', query: { body_type: ['Sedan'] } }
                    ].map((type, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          handleNavFilter(type.query);
                          setMobileMenuOpen(false);
                        }}
                        className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-slate-50 active:scale-95 transition-all cursor-pointer group text-center"
                      >
                        <span className="text-2.5xl mb-1 group-hover:scale-115 transition-transform duration-200 filter drop-shadow-xs">
                          {type.icon}
                        </span>
                        <span className="text-xs font-semibold text-slate-800">{type.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Full-width View All Cars Pill Button */}
                <Link
                  to="/buy-cars"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-[#0C1B33] font-semibold text-xs rounded-full flex items-center justify-center gap-1.5 transition-colors no-underline"
                >
                  <span>View all cars</span>
                  <ChevronRight size={16} className="text-[#0C1B33]" />
                </Link>
              </div>

              <div className="h-px bg-slate-100 my-4" />

              {/* SELL Section */}
              <div className="text-left font-sans">
                <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">SELL</h3>
                <div className="space-y-0.5">
                  <Link
                    to="/sell-car"
                    className="flex items-center gap-3 p-2.5 rounded-xl text-slate-800 font-semibold text-sm hover:bg-slate-50 hover:text-[#0C1B33] transition-colors no-underline group"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="text-base group-hover:scale-110 transition-transform">🚘</span>
                    <span>Sell car</span>
                  </Link>

                  <Link
                    to="/sell-car"
                    className="flex items-center gap-3 p-2.5 rounded-xl text-slate-800 font-semibold text-sm hover:bg-slate-50 hover:text-[#0C1B33] transition-colors no-underline group"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="text-base group-hover:scale-110 transition-transform">🛠️</span>
                    <span>Scrap car</span>
                  </Link>

                  <Link
                    to="/sell-car"
                    className="flex items-center gap-3 p-2.5 rounded-xl text-slate-800 font-semibold text-sm hover:bg-slate-50 hover:text-[#0C1B33] transition-colors no-underline group"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="text-base group-hover:scale-110 transition-transform">🏷️</span>
                    <span>Car valuation</span>
                  </Link>

                  <Link
                    to="/used-car-loan"
                    className="flex items-center gap-3 p-2.5 rounded-xl text-slate-800 font-semibold text-sm hover:bg-slate-50 hover:text-[#0C1B33] transition-colors no-underline group"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="text-base group-hover:scale-110 transition-transform">🏦</span>
                    <span>Finance & Car Loan</span>
                  </Link>
                </div>
              </div>

              <div className="h-px bg-slate-100 my-4" />

              {/* SERVICES & MORE Section */}
              <div className="text-left font-sans">
                <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">SERVICES & MORE</h3>
                <div className="space-y-0.5">

                  <Link
                    to="/selectt-buyback"
                    className="flex items-center justify-between p-2.5 rounded-xl text-slate-800 font-semibold text-sm hover:bg-slate-50 transition-colors no-underline group"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-base group-hover:scale-110 transition-transform">🔄</span>
                      <span>Exchange & Buyback</span>
                    </div>
                    <span className="px-2 py-0.5 text-[9px] font-semibold uppercase rounded-full bg-[#13EDE5] text-[#0C1B33] tracking-wider">
                      NEW
                    </span>
                  </Link>

                  <Link
                    to="/selectt-assured"
                    className="flex items-center justify-between p-2.5 rounded-xl text-slate-800 font-semibold text-sm hover:bg-slate-50 transition-colors no-underline group"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-base group-hover:scale-110 transition-transform">🛠️</span>
                      <span>Pro Service & Warranty</span>
                    </div>
                    <span className="px-2 py-0.5 text-[9px] font-semibold uppercase rounded-full bg-[#13EDE5] text-[#0C1B33] tracking-wider">
                      NEW
                    </span>
                  </Link>

                  <Link
                    to="/car-insurance"
                    className="flex items-center justify-between p-2.5 rounded-xl text-slate-800 font-semibold text-sm hover:bg-slate-50 transition-colors no-underline group"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-base group-hover:scale-110 transition-transform">🛡️</span>
                      <span>Car Insurance</span>
                    </div>
                    <ChevronRight size={16} className="text-slate-400 group-hover:text-[#0C1B33] group-hover:translate-x-0.5 transition-all" />
                  </Link>

                  <Link
                    to="/e-challan"
                    className="flex items-center justify-between p-2.5 rounded-xl text-slate-800 font-semibold text-sm hover:bg-slate-50 transition-colors no-underline group"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-base group-hover:scale-110 transition-transform">📄</span>
                      <span>Check Challan</span>
                    </div>
                    <span className="px-2 py-0.5 text-[9px] font-semibold uppercase rounded-full bg-[#13EDE5] text-[#0C1B33] tracking-wider">
                      NEW
                    </span>
                  </Link>

                  <Link
                    to="/pricing"
                    className="flex items-center justify-between p-2.5 rounded-xl text-slate-800 font-semibold text-sm hover:bg-slate-50 transition-colors no-underline group"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-base group-hover:scale-110 transition-transform">⛽</span>
                      <span>Recharge FASTag & EMI</span>
                    </div>
                    <ChevronRight size={16} className="text-slate-400 group-hover:text-[#0C1B33] group-hover:translate-x-0.5 transition-all" />
                  </Link>

                  <Link
                    to="/profile?tab=wishlisted"
                    className="flex items-center justify-between p-2.5 rounded-xl text-slate-800 font-semibold text-sm hover:bg-slate-50 transition-colors no-underline group"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-base group-hover:scale-110 transition-transform">💖</span>
                      <span>Wishlist & Shortlist</span>
                    </div>
                    <ChevronRight size={16} className="text-slate-400 group-hover:text-[#0C1B33] group-hover:translate-x-0.5 transition-all" />
                  </Link>

                  <Link
                    to="/car-hub-locations"
                    className="flex items-center justify-between p-2.5 rounded-xl text-slate-800 font-semibold text-sm hover:bg-slate-50 transition-colors no-underline group"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-base group-hover:scale-110 transition-transform">📍</span>
                      <span>Car Hub Locations</span>
                    </div>
                    <ChevronRight size={16} className="text-slate-400 group-hover:text-[#0C1B33] group-hover:translate-x-0.5 transition-all" />
                  </Link>

                  <Link
                    to="/customer-reviews"
                    className="flex items-center justify-between p-2.5 rounded-xl text-slate-800 font-semibold text-sm hover:bg-slate-50 transition-colors no-underline group"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-base group-hover:scale-110 transition-transform">🌟</span>
                      <span>Customer Reviews</span>
                    </div>
                    <ChevronRight size={16} className="text-slate-400 group-hover:text-[#0C1B33] group-hover:translate-x-0.5 transition-all" />
                  </Link>

                  <Link
                    to="/about-us"
                    className="flex items-center justify-between p-2.5 rounded-xl text-slate-800 font-semibold text-sm hover:bg-slate-50 transition-colors no-underline group"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-base group-hover:scale-110 transition-transform">ℹ️</span>
                      <span>About Us & FAQ</span>
                    </div>
                    <ChevronRight size={16} className="text-slate-400 group-hover:text-[#0C1B33] group-hover:translate-x-0.5 transition-all" />
                  </Link>

                </div>
              </div>

              <div className="h-px bg-slate-100 my-3" />

              {/* Brand Color #13EDE5 Help Banner at Bottom */}
              <div className="pt-1 pb-4">
                <a
                  href="tel:+91-857466-7466"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3.5 p-3.5 bg-[#13EDE5]/15 border border-[#13EDE5]/40 rounded-2xl shadow-xs text-left no-underline group hover:bg-[#13EDE5]/25 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-[#13EDE5] text-[#0C1B33] flex items-center justify-center shadow-md shadow-[#13EDE5]/30 shrink-0 group-hover:scale-105 transition-transform">
                    <Phone size={18} />
                  </div>
                  <div>
                    <div className="text-[10px] font-extrabold text-[#0C1B33] uppercase tracking-wider">NEED HELP?</div>
                    <div className="text-xs font-black text-[#0C1B33]">Call us at 8574667466</div>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Header;


