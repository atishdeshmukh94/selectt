import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import SidebarFilters from '../components/buy/SidebarFilters';
import CarCard from '../components/buy/CarCard';
import {
  ChevronRight, SlidersHorizontal, ChevronDown,
  X, Sparkles, ArrowUpDown, Car, MapPin
} from 'lucide-react';
import SelecttBenefitsGrid from '../components/buy/sections/SelecttBenefitsGrid';
import { PromoBanner, ExtraPromoCard } from '../components/buy/sections/InListingBanners';
import TopSearchAndBanners from '../components/buy/sections/TopSearchAndBanners';
import PageMeta from '../components/common/PageMeta';
import { API_URL } from '../config/api';

const API = API_URL;

const parseQueryParams = (search, locationState) => {
  const params = new URLSearchParams(search);

  const base = {
    budget: '', budget_min: null, budget_max: 25, certification: '',
    brands: [], models: [], fuel: '', transmission: '', owners: [],
    year_min: null, km_max: null, body_type: [], searchQuery: '',
    tag: '', hub: '', city: ''
  };

  if (locationState?.filters) {
    Object.assign(base, locationState.filters);
  }

  const brand = params.get('brand') || params.get('brands');
  const model = params.get('model') || params.get('models');
  const bodyType = params.get('bodyType') || params.get('body_type');
  const fuel = params.get('fuel');
  const transmission = params.get('transmission');
  const owners = params.get('owners') || params.get('owner');
  const yearMin = params.get('year_min') || params.get('yearMin') || params.get('year');
  const kmMax = params.get('km_max') || params.get('kmMax') || params.get('km');
  const tag = params.get('tag');
  const certification = params.get('certification');
  const budget = params.get('budget');
  const budgetMin = params.get('budget_min');
  const budgetMax = params.get('budget_max');
  const searchQ = params.get('search') || params.get('searchQuery');
  const cityParam = params.get('city');
  const hubParam = params.get('hub') || params.get('location');
  const sort = params.get('sort');

  if (brand) base.brands = brand.split(',').map(s => s.trim()).filter(Boolean);
  if (model) base.models = model.split(',').map(s => s.trim()).filter(Boolean);
  if (bodyType) base.body_type = bodyType.split(',').map(s => s.trim()).filter(Boolean);
  if (fuel) base.fuel = fuel;
  if (transmission) base.transmission = transmission;
  if (owners) base.owners = owners.split(',').map(s => s.trim()).filter(Boolean);
  if (yearMin) base.year_min = parseInt(yearMin, 10);
  if (kmMax) base.km_max = parseInt(kmMax, 10);
  if (tag) base.tag = tag;
  if (certification) base.certification = certification;
  if (budget) base.budget = budget;
  if (budgetMin) base.budget_min = parseFloat(budgetMin);
  if (budgetMax) base.budget_max = parseFloat(budgetMax);
  if (searchQ) base.searchQuery = searchQ;
  if (cityParam) base.city = cityParam;
  if (hubParam) base.hub = hubParam;

  return { initialFilters: base, initialSort: sort || 'relevance' };
};

const serializeFiltersToQuery = (filters, sortOrder) => {
  const params = new URLSearchParams();

  if (filters.brands && filters.brands.length > 0) {
    params.set('brand', filters.brands.join(','));
  }
  if (filters.models && filters.models.length > 0) {
    params.set('model', filters.models.join(','));
  }
  if (filters.body_type && filters.body_type.length > 0) {
    params.set('bodyType', filters.body_type.join(','));
  }
  if (filters.fuel) {
    params.set('fuel', filters.fuel);
  }
  if (filters.transmission) {
    params.set('transmission', filters.transmission);
  }
  if (filters.owners && filters.owners.length > 0) {
    params.set('owners', filters.owners.join(','));
  }
  if (filters.year_min) {
    params.set('year_min', String(filters.year_min));
  }
  if (filters.km_max) {
    params.set('km_max', String(filters.km_max));
  }
  if (filters.tag) {
    params.set('tag', filters.tag);
  }
  if (filters.certification) {
    params.set('certification', filters.certification);
  }
  if (filters.budget) {
    params.set('budget', filters.budget);
  }
  if (filters.budget_min) {
    params.set('budget_min', String(filters.budget_min));
  }
  if (filters.budget_max && filters.budget_max < 25) {
    params.set('budget_max', String(filters.budget_max));
  }
  if (filters.searchQuery) {
    params.set('search', filters.searchQuery);
  }
  if (filters.city) {
    params.set('city', filters.city);
  }
  if (filters.hub) {
    params.set('hub', filters.hub);
  }
  if (sortOrder && sortOrder !== 'relevance') {
    params.set('sort', sortOrder);
  }

  return params.toString();
};

const checkLocationMatch = (carLocation, userCity) => {
  if (!carLocation || !userCity) return true;
  const cLoc = carLocation.toLowerCase().trim();
  const uCity = userCity.toLowerCase().trim();
  if (cLoc === uCity) return true;
  if (uCity === 'delhi ncr') {
    return ['delhi', 'new delhi', 'delhi ncr', 'noida', 'gurugram', 'gurgaon', 'ghaziabad', 'faridabad'].includes(cLoc);
  }
  return cLoc.includes(uCity) || uCity.includes(cLoc);
};

const BuyCarsSkeleton = () => {
  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-8 pt-4 pb-8 animate-pulse">
      {/* Label and Title Skeleton */}
      <div className="flex items-center gap-2 mb-6">
        <div className="w-4 h-4 bg-slate-200 rounded-full" />
        <div className="w-32 h-4 bg-slate-200 rounded-lg" />
        <div className="w-2 h-4 bg-slate-200 rounded-lg" />
        <div className="w-48 h-4 bg-slate-200 rounded-lg" />
      </div>

      <div className="flex flex-col md:flex-row gap-6 lg:gap-8">
        {/* Sidebar Skeleton */}
        <aside className="hidden md:flex flex-col md:w-[26%] lg:w-[24%] shrink-0 gap-6">
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 space-y-6 h-[600px]">
            {/* Sidebar Title */}
            <div className="w-24 h-5 bg-slate-200 rounded-lg mb-4" />

            {/* Filter Section 1 */}
            <div className="space-y-3">
              <div className="w-32 h-4 bg-slate-200 rounded-lg" />
              <div className="grid grid-cols-2 gap-2">
                <div className="h-10 bg-slate-100 rounded-xl" />
                <div className="h-10 bg-slate-100 rounded-xl" />
                <div className="h-10 bg-slate-100 rounded-xl" />
                <div className="h-10 bg-slate-100 rounded-xl" />
              </div>
            </div>

            {/* Filter Section 2 */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <div className="w-20 h-4 bg-slate-200 rounded-lg" />
              <div className="h-8 bg-slate-100 rounded-lg w-full" />
              <div className="h-4 bg-slate-100 rounded-lg w-3/4" />
            </div>

            {/* Filter Section 3 */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <div className="w-28 h-4 bg-slate-200 rounded-lg" />
              <div className="flex gap-2">
                <div className="w-12 h-6 bg-slate-100 rounded-full" />
                <div className="w-16 h-6 bg-slate-100 rounded-full" />
                <div className="w-12 h-6 bg-slate-100 rounded-full" />
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area Skeleton */}
        <main className="flex-1 min-w-0 space-y-6">
          {/* Top Banner Skeleton */}
          <div className="w-full h-[180px] bg-slate-200 rounded-3xl" />

          {/* Results Bar Skeleton */}
          <div className="flex justify-between items-center py-2">
            <div className="w-28 h-5 bg-slate-200 rounded-lg" />
            <div className="w-36 h-9 bg-slate-200 rounded-xl" />
          </div>

          {/* Car Grid Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-[20px] border border-slate-200/80 p-3 h-[380px] flex flex-col justify-between">
                {/* Image Placeholder */}
                <div className="h-[160px] bg-slate-100 rounded-[14px] flex items-center justify-center relative overflow-hidden">
                  <svg className="w-16 h-16 text-slate-200" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1s.67-1 1.5-1 1.5.67 1.5 1-.67 1-1.5 1zm11 0c-.83 0-1.5-.67-1.5-1s.67-1 1.5-1 1.5.67 1.5 1-.67 1-1.5 1zM5 11l1.5-4.5h11L19 11H5z" />
                  </svg>
                </div>

                {/* Content details placeholder */}
                <div className="space-y-3 flex-1 mt-4 px-2">
                  <div className="w-3/4 h-4 bg-slate-200 rounded-lg" />
                  <div className="w-1/2 h-3 bg-slate-200 rounded-lg" />
                  <div className="w-1/3 h-5 bg-slate-200 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

const BuyCarsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [marqueeText, setMarqueeText] = useState("");
  const [displayLimit, setDisplayLimit] = useState(12);
  const [extraCardData, setExtraCardData] = useState(null);
  const { initialFilters, initialSort } = parseQueryParams(location.search, location.state);

  const [filters, setFilters] = useState(initialFilters);
  const [sortOrder, setSortOrder] = useState(initialSort);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [city, setCity] = useState(initialFilters.city || localStorage.getItem('user_city') || 'Delhi NCR');

  useEffect(() => {
    const parsed = parseQueryParams(location.search, location.state);
    setFilters(parsed.initialFilters);
    if (parsed.initialFilters.city) {
      setCity(parsed.initialFilters.city);
      localStorage.setItem('user_city', parsed.initialFilters.city);
    }
  }, [location.search, location.state]);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/cars`);
        const data = await response.json();
        const available = data.filter(car => car.status !== 'sold_out');
        const userCity = localStorage.getItem('user_city') || 'Delhi NCR';
        const sorted = available.sort((a, b) => {
          if (a.location === userCity && b.location !== userCity) return -1;
          if (a.location !== userCity && b.location === userCity) return 1;
          return 0;
        });
        setCars(sorted);
      } catch (error) {
        console.error('Error fetching cars:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchSettings = async () => {
      try {
        const response = await fetch(`${API_URL}/api/settings/public`);
        const data = await response.json();
        if (data.buy_cars_marquee_text) {
          setMarqueeText(data.buy_cars_marquee_text);
        }
        setExtraCardData(data);
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };

    fetchSettings();
    fetchCars();
    const handleLocationChange = () => {
      setCity(localStorage.getItem('user_city') || 'Delhi NCR');
      fetchCars();
    };
    window.addEventListener('location-changed', handleLocationChange);
    return () => window.removeEventListener('location-changed', handleLocationChange);
  }, []);

  const filteredCars = cars.filter(car => {
    const activeCity = filters.city || city;
    if (!checkLocationMatch(car.location, activeCity)) return false;

    if (filters.hub) {
      const hFilter = filters.hub.toLowerCase();
      const carHub = (car.hub || car.hub_location || car.location || car.address || '').toLowerCase();
      if (car.hub) {
        if (!carHub.includes(hFilter) && !hFilter.includes(carHub)) return false;
      }
    }
    const price = parseInt(car.price || 0, 10);
    const priceLakhs = price / 100000;
    if (filters.budget_min) {
      if (priceLakhs < filters.budget_min) return false;
    }
    if (filters.budget_max && filters.budget_max < 25) {
      if (priceLakhs > filters.budget_max) return false;
    }
    if (filters.budget) {
      if (filters.budget === 'Under 3 L' && price >= 300000) return false;
      if (filters.budget === '3 - 6 L' && (price < 300000 || price > 600000)) return false;
      if (filters.budget === '6 - 10 L' && (price < 600000 || price > 1000000)) return false;
      if (filters.budget === '10 L +' && price <= 1000000) return false;
    }
    if (filters.certification) {
      const isCert = car.is_certified === true || car.is_certified === 1 || Boolean(car.quality_report);
      const certLower = filters.certification.toLowerCase();
      if (['certified', 'assured', 'assured+'].includes(certLower) && !isCert) return false;
      if (certLower === 'standard' && isCert) return false;
    }
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      const match = (
        (car.make || '').toLowerCase().includes(q) ||
        (car.model || '').toLowerCase().includes(q) ||
        (car.variant || '').toLowerCase().includes(q) ||
        (car.bodyType || car.body_type || '').toLowerCase().includes(q) ||
        (car.fuelType || car.fuel_type || '').toLowerCase().includes(q) ||
        (car.transmission || '').toLowerCase().includes(q)
      );
      if (!match) return false;
    }
    if (filters.brands?.length > 0 && !filters.brands.some(b => b.toLowerCase() === (car.make || '').toLowerCase())) return false;
    if (filters.models?.length > 0 && !filters.models.some(m => m.toLowerCase() === (car.model || '').toLowerCase())) return false;
    if (filters.body_type?.length > 0 && !filters.body_type.some(bt => bt.toLowerCase() === (car.bodyType || car.body_type || '').toLowerCase())) return false;
    if (filters.fuel && (car.fuelType || car.fuel_type || '').toLowerCase() !== filters.fuel.toLowerCase()) return false;
    if (filters.transmission && (car.transmission || '').toLowerCase() !== filters.transmission.toLowerCase()) return false;
    if (filters.owners?.length > 0 && !filters.owners.some(o => (car.owner_type || car.ownership || '').toLowerCase().includes(o.split(' ')[0].toLowerCase()))) return false;
    if (filters.year_min && parseInt(car.year) < filters.year_min) return false;
    if (filters.km_max) {
      const kmStr = String(car.km || '0').replace(/[^0-9]/g, '');
      if (parseInt(kmStr) > filters.km_max) return false;
    }
    if (filters.tag) {
      const carTag = (car.tag || car.badgeText || '').toLowerCase();
      const filterTag = filters.tag.toLowerCase();
      if (filterTag === 'offer zone') {
        if (!carTag.includes('offer') && !carTag.includes('discount')) return false;
      } else if (filterTag === 'selectt luxury') {
        if (!carTag.includes('luxury') && !carTag.includes('premium')) return false;
      } else {
        if (!carTag.includes(filterTag)) return false;
      }
    }
    return true;
  });

  const sortedCars = [...filteredCars].sort((a, b) => {
    if (sortOrder === 'price_asc') return parseInt(a.price) - parseInt(b.price);
    if (sortOrder === 'price_desc') return parseInt(b.price) - parseInt(a.price);
    return 0;
  });

  const getGridElements = () => {
    const elements = [];
    let carCount = 0;

    const visibleCars = sortedCars.slice(0, displayLimit);

    visibleCars.forEach((car) => {
      elements.push(<CarCard key={`car-${car.id}`} car={car} lightBg={true} />);
      carCount++;

      // Insert extra promotional card (Position 3, then repeats every 15 cars)
      const extraActive = extraCardData?.extra_card_is_active;
      if (extraActive && (carCount === 2 || (carCount > 2 && (carCount - 2) % 15 === 0))) {
        elements.push(<ExtraPromoCard key={`extra-promo-${carCount}`} data={extraCardData} />);
      }

      // Benefits strip
      if (carCount === 6) {
        elements.push(<SelecttBenefitsGrid key="benefits-grid" />);
      }

      // Promo Sunday Sale
      if (carCount === 9) {
        elements.push(
          <PromoBanner
            key="promo-hotwheels"
            type="hotwheels"
            title="Super Saturday Sale"
            subtitle="Exclusive discounts on sedans & SUVs"
            cta="View All Offers"
          />
        );
      }

      // Buyback banner
      if (carCount === 12) {
        elements.push(
          <PromoBanner
            key="promo-buyback"
            type="buyback"
            title="Guaranteed Buyback"
            subtitle="Sell it back to us at a fixed price"
            cta="How it works"
          />
        );
      }
    });

    return elements;
  };

  return (
    <>
      <PageMeta
        title="Certified Used Cars for Sale - Buy Pre-Owned Cars | Selectt"
        description="Browse high-quality, certified used cars for sale. Rigorous 200-point inspection and warranty included."
      />

      {/* ── Page Shell ── */}
      <div className="min-h-screen bg-[#f9f9f9] text-[#0C1B33] font-sans">

        {/* ── Marquee Section ── */}
        {marqueeText && (
          <section className="relative overflow-hidden bg-[#0C1B33] py-2.5 shadow-md z-10 border-b border-white/5">
            <div className="overflow-hidden flex w-full">
              <div className="flex whitespace-nowrap gap-8 items-center animate-marquee-left">
                {/* Copy 1 */}
                <div className="flex gap-8 items-center">
                  <span className="text-xs md:text-sm font-black uppercase tracking-wider text-white">{marqueeText}</span>
                </div>
                {/* Copy 2 (Duplicated for seamless looping) */}
                <div className="flex gap-8 items-center">
                  <span className="text-xs md:text-sm font-black uppercase tracking-wider text-white">{marqueeText}</span>
                </div>
                {/* Copy 3 */}
                <div className="flex gap-8 items-center">
                  <span className="text-xs md:text-sm font-black uppercase tracking-wider text-white">{marqueeText}</span>
                </div>
                {/* Copy 4 */}
                <div className="flex gap-8 items-center">
                  <span className="text-xs md:text-sm font-black uppercase tracking-wider text-white">{marqueeText}</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── Body: Sidebar + Main ── */}
        {loading ? (
          <BuyCarsSkeleton />
        ) : (
          <div className="max-w-[1440px] mx-auto px-4 md:px-8 pt-4 pb-8">
            <div className="flex flex-col md:flex-row gap-6 lg:gap-8">

              {/* ── LEFT SIDEBAR ── */}
              <aside className="hidden md:flex flex-col md:w-[26%] lg:w-[24%] shrink-0">
                <div className="sticky top-24 h-[calc(100vh-120px)] overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                  <SidebarFilters filters={filters} setFilters={setFilters} lightBg={true} />
                </div>
              </aside>

              {/* ── MAIN CONTENT ── */}
              <main className="flex-1 min-w-0">

                {/* Page label above banners */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-4">
                  <Sparkles size={12} className="text-black" />
                  <span className="text-[10px] font-bold text-black uppercase tracking-[0.2em]">Live Inventory</span>
                  <span className="text-slate-300">|</span>
                  <h1 className="text-sm font-black text-black">
                    <span className="text-black">{filteredCars.length}</span> Certified Used Cars
                    <span className="text-slate-600 font-semibold ml-1">in {city}</span>
                  </h1>
                </div>

                {/* Active Hub Filter Banner */}
                {filters.hub && (
                  <div className="flex items-center justify-between gap-3 bg-[#E6FAF7] border border-[#00C9AF]/40 rounded-2xl p-3.5 mb-4 text-[#0C1B33] shadow-sm">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#00C9AF] text-[#0C1B33] flex items-center justify-center shrink-0">
                        <MapPin size={16} />
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold text-[#00A38D] uppercase tracking-wider">Filtered by Car Hub</span>
                        <h3 className="text-xs sm:text-sm font-black text-[#0C1B33]">{filters.hub} ({filters.city || city})</h3>
                      </div>
                    </div>
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, hub: '' }))}
                      className="flex items-center gap-1 bg-white hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl text-[10px] font-bold text-slate-700 uppercase tracking-wider transition-all shadow-xs shrink-0 cursor-pointer"
                    >
                      <X size={13} /> Clear Hub Filter
                    </button>
                  </div>
                )}

                {/* Promo Banners */}
                <TopSearchAndBanners />

                {/* Results bar */}
                <div className="flex items-center justify-between gap-2 mb-6 mt-2 w-full">
                  <div className="flex items-center gap-2 sm:gap-3">
                    {/* Mobile filter btn */}
                    <button
                      onClick={() => setShowMobileFilters(true)}
                      className="md:hidden flex items-center gap-1.5 bg-white border border-slate-200 hover:border-[#00C9AF] px-3 py-2.5 rounded-xl text-[10px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider transition-all shadow-sm"
                    >
                      <SlidersHorizontal size={12} /> Filters
                    </button>
                    <div className="flex items-center gap-1.5 text-[10px] sm:text-xs md:text-sm text-slate-700 font-bold uppercase tracking-wider whitespace-nowrap">
                      <Car size={16} className="text-[#000]" />
                      <span>{filteredCars.length} results</span>
                    </div>
                  </div>

                  {/* Custom Sort Dropdown */}
                  <div className="relative">
                    {/* Invisible click-away overlay when open */}
                    {isSortOpen && (
                      <div 
                        className="fixed inset-0 z-40 cursor-default" 
                        onClick={() => setIsSortOpen(false)} 
                      />
                    )}
                    
                    <button
                      onClick={() => setIsSortOpen(!isSortOpen)}
                      className={`relative flex items-center gap-1.5 bg-white border ${isSortOpen ? 'border-[#00C9AF] ring-2 ring-[#00C9AF]/10' : 'border-slate-200 hover:border-[#00C9AF]'} text-slate-800 pl-8 pr-7 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider outline-none cursor-pointer transition-all shadow-sm z-50 whitespace-nowrap`}
                    >
                      <ArrowUpDown size={14} className="absolute left-2.5 text-slate-500" />
                      <span>
                        Sort: {sortOrder === 'relevance' ? 'Relevance' : sortOrder === 'price_asc' ? 'Price: Low → High' : 'Price: High → Low'}
                      </span>
                      <ChevronDown size={13} className={`absolute right-2 text-slate-500 transition-transform duration-200 ${isSortOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isSortOpen && (
                      <div className="absolute right-0 mt-1.5 w-52 bg-white border border-slate-105 rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.1)] p-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                        {[
                          { value: 'relevance', label: 'Relevance' },
                          { value: 'price_asc', label: 'Price: Low → High' },
                          { value: 'price_desc', label: 'Price: High → Low' }
                        ].map((option) => {
                          const isSelected = sortOrder === option.value;
                          return (
                            <button
                              key={option.value}
                              onClick={() => {
                                setSortOrder(option.value);
                                setIsSortOpen(false);
                              }}
                              className={`w-full text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all ${
                                isSelected 
                                  ? 'bg-[#00C9AF]/10 text-[#00C9AF]' 
                                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                              }`}
                            >
                              {option.label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Active filter chips */}
                {(filters.brands?.length > 0 || filters.body_type?.length > 0 || filters.fuel || filters.transmission || filters.searchQuery) && (
                  <div className="flex flex-wrap gap-2 mb-5">
                    {filters.searchQuery && (
                      <span className="flex items-center gap-1.5 bg-[#00C9AF]/10 border border-[#00C9AF]/40 text-[#00C9AF] text-[10px] font-bold px-3 py-1.5 rounded-full">
                        "{filters.searchQuery}"
                        <button onClick={() => setFilters(p => ({ ...p, searchQuery: '' }))}><X size={10} /></button>
                      </span>
                    )}
                    {filters.brands?.map(b => (
                      <span key={b} className="flex items-center gap-1.5 bg-slate-200 border border-slate-300/80 text-slate-700 text-[10px] font-bold px-3 py-1.5 rounded-full">
                        {b} <button onClick={() => setFilters(p => ({ ...p, brands: p.brands.filter(x => x !== b) }))}><X size={10} /></button>
                      </span>
                    ))}
                    {filters.body_type?.map(t => (
                      <span key={t} className="flex items-center gap-1.5 bg-slate-200 border border-slate-300/80 text-slate-700 text-[10px] font-bold px-3 py-1.5 rounded-full">
                        {t} <button onClick={() => setFilters(p => ({ ...p, body_type: p.body_type.filter(x => x !== t) }))}><X size={10} /></button>
                      </span>
                    ))}
                    {filters.fuel && (
                      <span className="flex items-center gap-1.5 bg-slate-200 border border-slate-300/80 text-slate-700 text-[10px] font-bold px-3 py-1.5 rounded-full">
                        {filters.fuel} <button onClick={() => setFilters(p => ({ ...p, fuel: '' }))}><X size={10} /></button>
                      </span>
                    )}
                  </div>
                )}

                {/* ── Car Grid with interstitials ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5">

                  {/* Empty state */}
                  {filteredCars.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center py-24 gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-white border border-slate-250 shadow-sm flex items-center justify-center">
                        <Car size={28} className="text-slate-500" />
                      </div>
                      <p className="text-[#0C1B33] font-bold text-base">No cars match your filters</p>
                      <p className="text-slate-650 text-sm">Try adjusting or clearing your filters</p>
                      <button
                        onClick={() => setFilters({
                          budget: '', budget_max: 25, certification: '',
                          brands: [], models: [], fuel: '', transmission: '', owners: [],
                          year_min: null, km_max: null, body_type: [], searchQuery: '',
                          tag: ''
                        })}
                        className="mt-2 border border-[#00C9AF] text-[#00C9AF] hover:bg-[#00C9AF] hover:text-[#0C1B33] px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all cursor-pointer"
                      >
                        Clear all filters
                      </button>
                    </div>
                  )}

                  {getGridElements()}
                </div>

                {/* Load more */}
                {sortedCars.length > displayLimit && (
                  <div className="mt-12 text-center">
                    <button
                      onClick={() => setDisplayLimit(prev => prev + 12)}
                      className="group inline-flex items-center gap-2 bg-white border-2 border-[#00C9AF] text-[#00C9AF] hover:bg-[#00C9AF] hover:text-[#0C1B33] px-10 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                      <Sparkles size={14} className="group-hover:rotate-12 transition-transform" />
                      Explore More Cars
                      <ChevronRight size={14} />
                    </button>
                  </div>
                )}
              </main>
            </div>
          </div>
        )}
      </div>

      {/* ── Mobile Filters Drawer ── */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-[100] md:hidden flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setShowMobileFilters(false)}
          />
          {/* Drawer panel (Opens from Left) */}
          <div className="relative mr-auto w-[85%] max-w-[340px] h-full bg-[#f9f9f9] border-r border-slate-200 flex flex-col shadow-2xl animate-[slideInLeft_0.3s_ease]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={14} className="text-[#00C9AF]" />
                <span className="text-xs font-black uppercase tracking-widest text-[#0C1B33]">Filters</span>
              </div>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-all"
              >
                <X size={16} className="text-slate-650" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4" style={{ scrollbarWidth: 'none' }}>
              <SidebarFilters filters={filters} setFilters={setFilters} onClose={() => setShowMobileFilters(false)} lightBg={true} />
            </div>
            <div className="p-4 border-t border-slate-200">
              <button
                onClick={() => setShowMobileFilters(false)}
                className="w-full bg-[#00C9AF] hover:bg-[#00B4A0] text-[#0C1B33] font-black text-xs uppercase tracking-widest py-3 rounded-xl transition-all"
              >
                Show {filteredCars.length} Results
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideInLeft {
          from { transform: translateX(-100%); }
          to   { transform: translateX(0); }
        }
      `}</style>
    </>
  );
};

export default BuyCarsPage;
