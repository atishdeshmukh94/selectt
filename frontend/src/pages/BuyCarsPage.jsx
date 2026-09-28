import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import SidebarFilters from '../components/buy/SidebarFilters';
import CarCard from '../components/buy/CarCard';
import {
  ChevronRight, SlidersHorizontal, ChevronDown,
  X, Sparkles, ArrowUpDown, Car, MapPin,
  ShieldCheck, Award, RefreshCw, BadgePercent, CheckCircle2,
  HelpCircle, ArrowRight, FileCheck2, Zap, PhoneCall
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
  if (tag) {
    base.tag = tag;
    if (tag.toLowerCase().includes('luxury')) {
      base.certification = 'luxury';
    } else if (tag.toLowerCase().includes('offer')) {
      base.certification = '';
    }
  }
  if (certification) {
    base.certification = certification;
  } else if (!tag || !tag.toLowerCase().includes('offer')) {
    base.certification = 'standard';
  }
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
  const { citySlug } = useParams();
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [marqueeText, setMarqueeText] = useState("");
  const [displayLimit, setDisplayLimit] = useState(12);
  const [extraCardData, setExtraCardData] = useState(null);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const { initialFilters, initialSort } = parseQueryParams(location.search, location.state);

  const formatCityFromSlug = (slug) => {
    if (!slug) return '';
    const clean = slug.toLowerCase().replace(/^used-cars-in-/, '').replace(/^cars-in-/, '');
    const map = {
      'mumbai': 'Mumbai',
      'delhi': 'Delhi NCR',
      'delhi-ncr': 'Delhi NCR',
      'bangalore': 'Bangalore',
      'bengaluru': 'Bangalore',
      'hyderabad': 'Hyderabad',
      'pune': 'Pune',
      'ahmedabad': 'Ahmedabad',
      'chennai': 'Chennai',
      'kolkata': 'Kolkata',
      'gurugram': 'Delhi NCR',
      'noida': 'Delhi NCR'
    };
    if (map[clean]) return map[clean];
    return clean.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const urlCity = formatCityFromSlug(citySlug);
  const [filters, setFilters] = useState({
    ...initialFilters,
    city: urlCity || initialFilters.city || ''
  });
  const [sortOrder, setSortOrder] = useState(initialSort);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [city, setCity] = useState(urlCity || initialFilters.city || localStorage.getItem('user_city') || 'Mumbai');

  useEffect(() => {
    const parsed = parseQueryParams(location.search, location.state);
    const resolvedUrlCity = formatCityFromSlug(citySlug);
    setFilters({
      ...parsed.initialFilters,
      city: resolvedUrlCity || parsed.initialFilters.city || ''
    });
    if (resolvedUrlCity) {
      setCity(resolvedUrlCity);
      localStorage.setItem('user_city', resolvedUrlCity);
    } else if (parsed.initialFilters.city) {
      setCity(parsed.initialFilters.city);
      localStorage.setItem('user_city', parsed.initialFilters.city);
    }
  }, [location.search, location.state, citySlug]);

  const displayCity = city || urlCity || 'Mumbai';

  const buyerFaqs = [
    {
      q: "What makes a car 'Selectt Certified'?",
      a: "Every Selectt Certified car must pass our rigorous 200-point inspection covering engine compression, transmission, suspension, brakes, electricals, and structural integrity. Vehicles with severe accidental damage or flood damage are 100% rejected. Certified cars also include a 1-year comprehensive warranty and a 5-day money-back guarantee."
    },
    {
      q: "Can I take a test drive before buying?",
      a: `Yes, absolutely! You can schedule a free test drive of any certified vehicle at our nearest Selectt Hub in ${displayCity} or request a convenient doorstep test drive at your home or office.`
    },
    {
      q: "How does the 5-day money-back guarantee work?",
      a: "Drive the car in your everyday routine. If for any reason you are not completely satisfied within 5 days of delivery (or up to 250 km driven), return it to us for a 100% full refund with zero cancellation charges."
    },
    {
      q: "Do you offer financing and car loan assistance?",
      a: "Yes. Selectt has partnered with leading nationalized and private banks (including HDFC, ICICI, SBI, and Axis Bank) to provide instant on-road loan approvals with low interest rates and flexible tenures up to 7 years."
    }
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": buyerFaqs.map(faq => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a
      }
    }))
  };

  const autoDealerSchema = {
    "@context": "https://schema.org",
    "@type": "AutoDealer",
    "name": `Selectt Certified Used Cars ${displayCity}`,
    "url": `https://selectt.in${citySlug ? `/used-cars-in-${citySlug}` : '/buy-cars'}`,
    "description": `Buy 100% certified used cars in ${displayCity} with 200-point inspection, 1-year warranty, and 5-day money-back guarantee.`,
    "areaServed": displayCity,
    "priceRange": "₹₹₹"
  };

  useEffect(() => {
    const fetchCars = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/cars`);
        const data = await response.json();
        const available = data.filter(car => car.status !== 'sold_out');
        const userCity = displayCity;
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
    if (filters.certification && filters.certification !== 'all') {
      const certLower = filters.certification.toLowerCase();
      const isLuxury = (
        car.listing_type === 'luxury' || 
        car.listingType === 'luxury' || 
        (car.tag && car.tag.toLowerCase().includes('luxury')) ||
        ['bmw', 'mercedes-benz', 'mercedes', 'audi', 'jaguar', 'land rover', 'porsche', 'volvo', 'lexus'].includes((car.make || '').toLowerCase())
      );
      if (certLower === 'luxury' && !isLuxury) return false;
      if (certLower === 'standard' && isLuxury) return false;
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
      const carTag = (car.tag || car.badgeText || car.badge_text || '').toLowerCase();
      const filterTag = filters.tag.toLowerCase();
      if (filterTag === 'offer zone' || filterTag === 'offer' || filterTag === 'discount') {
        const hasDiscount = (
          (car.discountType && car.discountType !== 'none' && Number(car.discountValue) > 0) ||
          (car.discount_type && car.discount_type !== 'none' && Number(car.discount_value) > 0) ||
          (car.badgeText && car.badgeText.trim() !== '') ||
          (car.badge_text && car.badge_text.trim() !== '') ||
          (car.originalPrice && Number(car.originalPrice) > Number(car.price)) ||
          (car.original_price && Number(car.original_price) > Number(car.price)) ||
          (car.offerPrice && Number(car.offerPrice) > 0) ||
          (car.offer_price && Number(car.offer_price) > 0) ||
          carTag.includes('offer') ||
          carTag.includes('discount') ||
          carTag.includes('price drop') ||
          carTag.includes('deal') ||
          carTag.includes('drop') ||
          carTag.includes('↓')
        );
        if (!hasDiscount) return false;
      } else if (filterTag === 'selectt luxury' || filterTag === 'luxury') {
        const isLuxury = (
          car.listing_type === 'luxury' || 
          car.listingType === 'luxury' || 
          carTag.includes('luxury') || 
          carTag.includes('premium') ||
          ['bmw', 'mercedes-benz', 'mercedes', 'audi', 'jaguar', 'land rover', 'porsche', 'volvo', 'lexus'].includes((car.make || '').toLowerCase())
        );
        if (!isLuxury) return false;
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

    // 3 In-Grid Banners configured in Admin
    const banner1 = {
      logoUrl: extraCardData?.extra_card_logo_url,
      btnLink: extraCardData?.extra_card_btn_link || "/used-car-loan",
      isActive: extraCardData?.extra_card_is_active !== false && extraCardData?.extra_card_is_active !== "false" && extraCardData?.extra_card_is_active !== "0",
      title: "Loan & Finance Banner",
    };

    const banner2 = {
      logoUrl: extraCardData?.buy_grid_banner_2_img,
      btnLink: extraCardData?.buy_grid_banner_2_link || "/car-insurance",
      isActive: extraCardData?.buy_grid_banner_2_active !== "false" && extraCardData?.buy_grid_banner_2_active !== "0",
      title: "Insurance & Warranty Banner",
    };

    const banner3 = {
      logoUrl: extraCardData?.buy_grid_banner_3_img,
      btnLink: extraCardData?.buy_grid_banner_3_link || "/sell-car",
      isActive: extraCardData?.buy_grid_banner_3_active !== "false" && extraCardData?.buy_grid_banner_3_active !== "0",
      title: "Instant Valuation & Buyback Banner",
    };

    // Filter active banners (that have an image or active status)
    const activeInGridBanners = [
      banner1.isActive && (banner1.logoUrl || banner1.isActive) ? banner1 : null,
      banner2.isActive && banner2.logoUrl ? banner2 : null,
      banner3.isActive && banner3.logoUrl ? banner3 : null,
    ].filter(Boolean);

    let bannerIndex = 0;

    visibleCars.forEach((car) => {
      elements.push(<CarCard key={`car-${car.id}`} car={car} lightBg={true} />);
      carCount++;

      // Insert In-Grid Banner with 3 lines (9 cars) gap:
      // Position 1: carCount === 2 (Slot 3 of Row 1)
      // Position 2: carCount === 11 (+9 cars / 3 lines gap)
      // Position 3: carCount === 20 (+9 cars / 3 lines gap)
      // Position 4+: repeats every 9 cars
      const shouldInsertBanner = (carCount === 2) || (carCount > 2 && (carCount - 2) % 9 === 0);

      if (shouldInsertBanner && activeInGridBanners.length > 0) {
        const curBanner = activeInGridBanners[bannerIndex % activeInGridBanners.length];
        elements.push(
          <ExtraPromoCard
            key={`extra-promo-${carCount}-${bannerIndex}`}
            logoUrl={curBanner.logoUrl}
            btnLink={curBanner.btnLink}
            isActive={curBanner.isActive}
            title={curBanner.title}
          />
        );
        bannerIndex++;
      }

      // Benefits strip
      if (carCount === 6) {
        elements.push(<SelecttBenefitsGrid key="benefits-grid" />);
      }

      // Promo Sunday Sale
      if (carCount === 15) {
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
      if (carCount === 24) {
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
        title={`Buy Used Cars in ${displayCity} | 500+ Certified Second Hand Cars | Selectt`}
        description={`Explore a wide range of certified used cars for sale in ${displayCity}. Every Selectt car comes with a 200-point inspection report, 1-year warranty, and a 5-day money-back guarantee. Book a free test drive today!`}
        canonical={citySlug ? `https://selectt.in/used-cars-in-${citySlug}` : 'https://selectt.in/buy-cars'}
        schema={[faqSchema, autoDealerSchema]}
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

                {/* Page label & SEO H1 Heading */}
                <div className="flex flex-col gap-1.5 mb-4 text-left">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <Sparkles size={13} className="text-[#00C9AF]" />
                    <span className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">Selectt Certified Pre-Owned</span>
                    <span className="text-slate-300">|</span>
                    <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                      {filteredCars.length} Cars Available
                    </span>
                  </div>
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                    Find Certified Used Cars in {displayCity}
                  </h1>
                </div>

                {/* Active Hub Filter Banner */}
                {filters.hub && (
                  <div className="flex items-center justify-between gap-3 bg-[#E6FAF7] border border-[#00C9AF]/40 rounded-2xl p-3.5 mb-4 text-[#0C1B33] shadow-sm">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#00C9AF] text-[#0C1B33] flex items-center justify-center shrink-0">
                        <MapPin size={16} />
                      </div>
                      <div className="text-left">
                        <span className="block text-xs font-bold text-[#00A38D] uppercase tracking-wider">Filtered by Car Hub</span>
                        <h3 className="text-sm font-black text-[#0C1B33]">{filters.hub} ({filters.city || city})</h3>
                      </div>
                    </div>
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, hub: '' }))}
                      className="flex items-center gap-1 bg-white hover:bg-slate-100 border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 uppercase tracking-wider transition-all shadow-xs shrink-0 cursor-pointer"
                    >
                      <X size={14} /> Clear Hub Filter
                    </button>
                  </div>
                )}

                {/* Promo Banners */}
                <TopSearchAndBanners />

                {/* Results bar */}
                <div className="flex items-center justify-between gap-1.5 sm:gap-2 mb-6 mt-2 w-full min-w-0 max-w-full">
                  <div className="flex items-center gap-1.5 sm:gap-3 min-w-0 shrink">
                    {/* Mobile filter btn */}
                    <button
                      onClick={() => setShowMobileFilters(true)}
                      className="md:hidden flex items-center gap-1 bg-white border border-slate-200 hover:border-[#00C9AF] px-2.5 sm:px-3.5 py-2 rounded-xl text-[11px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider transition-all shadow-sm shrink-0"
                    >
                      <SlidersHorizontal size={13} className="text-slate-600" /> Filters
                    </button>
                    <div className="flex items-center gap-1 text-[11px] sm:text-xs text-slate-700 font-bold uppercase tracking-wider whitespace-nowrap shrink">
                      <Car size={14} className="text-[#0C1B33] hidden sm:inline" />
                      <span>{filteredCars.length} <span className="hidden sm:inline">results</span><span className="sm:hidden">cars</span></span>
                    </div>
                  </div>

                  {/* Custom Sort Dropdown */}
                  <div className="relative shrink-0">
                    {/* Invisible click-away overlay when open */}
                    {isSortOpen && (
                      <div 
                        className="fixed inset-0 z-40 cursor-default" 
                        onClick={() => setIsSortOpen(false)} 
                      />
                    )}
                    
                    <button
                      onClick={() => setIsSortOpen(!isSortOpen)}
                      className={`relative flex items-center gap-1 bg-white border ${isSortOpen ? 'border-[#00C9AF] ring-2 ring-[#00C9AF]/10' : 'border-slate-200 hover:border-[#00C9AF]'} text-slate-800 pl-6 pr-6 sm:pl-8 sm:pr-7 py-2 rounded-xl text-[11px] sm:text-xs font-bold uppercase tracking-wider outline-none cursor-pointer transition-all shadow-sm z-50 whitespace-nowrap`}
                    >
                      <ArrowUpDown size={12} className="absolute left-2 sm:left-2.5 text-slate-500" />
                      <span className="hidden sm:inline">
                        Sort: {sortOrder === 'relevance' ? 'Relevance' : sortOrder === 'price_asc' ? 'Price: Low → High' : 'Price: High → Low'}
                      </span>
                      <span className="sm:hidden">
                        Sort: {sortOrder === 'relevance' ? 'Relevance' : sortOrder === 'price_asc' ? 'Price: Low' : 'Price: High'}
                      </span>
                      <ChevronDown size={12} className={`absolute right-1.5 sm:right-2 text-slate-500 transition-transform duration-200 ${isSortOpen ? 'rotate-180' : ''}`} />
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
                              className={`w-full text-left px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
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
                      className="group inline-flex items-center gap-2 bg-white border-2 border-[#00C9AF] text-[#00C9AF] hover:bg-[#00C9AF] hover:text-[#0C1B33] px-10 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer"
                    >
                      <Sparkles size={14} className="group-hover:rotate-12 transition-transform" />
                      Explore More Cars
                      <ChevronRight size={14} />
                    </button>
                  </div>
                )}

                {/* ── The Selectt Advantage for Buyers (SEO Module) ── */}
                <section className="mt-16 pt-12 border-t border-slate-200">
                  <div className="text-center max-w-2xl mx-auto mb-10">
                    <div className="inline-flex items-center gap-2 bg-[#00C9AF]/10 border border-[#00C9AF]/30 text-[#008f7d] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
                      <ShieldCheck size={14} /> Buyer Guarantee
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                      The Selectt Advantage for Buyers
                    </h2>
                    <p className="text-slate-600 text-sm mt-2">
                      Every car at Selectt is certified to deliver true peace of mind, transparent pricing, and unmatched post-purchase security in {displayCity}.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-[#00C9AF] transition-all">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                        <FileCheck2 size={20} />
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm mb-1">200-Point Inspected Cars</h3>
                      <p className="text-slate-500 text-xs leading-relaxed">
                        Every vehicle undergoes a rigorous mechanical, electrical, and structural evaluation. Zero accident or flood-damaged cars.
                      </p>
                      <Link to="/selectt-inspection-process" className="inline-flex items-center gap-1 text-[11px] font-bold text-[#00a892] mt-3 hover:underline">
                        View Inspection Details <ChevronRight size={12} />
                      </Link>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-[#00C9AF] transition-all">
                      <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-3">
                        <ShieldCheck size={20} />
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm mb-1">1-Year Warranty</h3>
                      <p className="text-slate-500 text-xs leading-relaxed">
                        Drive with total confidence with comprehensive and powertrain coverage covering engine and transmission.
                      </p>
                      <Link to="/selectt-inspection-process" className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-600 mt-3 hover:underline">
                        Warranty Terms <ChevronRight size={12} />
                      </Link>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-[#00C9AF] transition-all">
                      <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
                        <RefreshCw size={20} />
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm mb-1">5-Day Money-Back Guarantee</h3>
                      <p className="text-slate-500 text-xs leading-relaxed">
                        Not completely satisfied? Return the car within 5 days (up to 250 km) for a 100% no-questions-asked refund.
                      </p>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-600 mt-3">
                        100% Refundable
                      </span>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-[#00C9AF] transition-all">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
                        <BadgePercent size={20} />
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm mb-1">Fixed Price Assurance</h3>
                      <p className="text-slate-500 text-xs leading-relaxed">
                        No awkward negotiations or hidden dealer fees. You receive data-backed fair market pricing upfront.
                      </p>
                      <Link to="/used-car-loan" className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 mt-3 hover:underline">
                        Calculate Low EMIs <ChevronRight size={12} />
                      </Link>
                    </div>
                  </div>
                </section>

                {/* ── How Buying a Car Works (4 Steps) ── */}
                <section className="mt-16 pt-12 border-t border-slate-200">
                  <div className="text-center max-w-2xl mx-auto mb-10">
                    <span className="text-[11px] font-bold text-[#00a892] uppercase tracking-wider">Simple 4-Step Journey</span>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                      How Buying a Car Works with Selectt
                    </h2>
                    <p className="text-slate-600 text-sm mt-2">
                      Experience seamless car ownership with transparent online bookings, test drives, and doorstep delivery.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[
                      {
                        num: "01",
                        title: "Choose Your Car Online",
                        desc: `Browse 500+ certified cars with high-definition photos, 360° views, and digital inspection reports in ${displayCity}.`
                      },
                      {
                        num: "02",
                        title: "Book a Free Test Drive",
                        desc: "Test drive at your nearest Selectt Hub or schedule a convenient doorstep test drive at your home."
                      },
                      {
                        num: "03",
                        title: "Secure Online Payment",
                        desc: "Choose flexible car loan finance options with low EMI or complete full payment via secure digital methods."
                      },
                      {
                        num: "04",
                        title: "Doorstep Delivery",
                        desc: "Get your car delivered straight to your home along with complete paperwork, warranty kit, and RC transfer support."
                      }
                    ].map((step, idx) => (
                      <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
                        <div className="text-3xl font-black text-slate-200 mb-2">{step.num}</div>
                        <h3 className="font-bold text-slate-900 text-sm mb-1.5">{step.title}</h3>
                        <p className="text-slate-500 text-xs leading-relaxed">{step.desc}</p>
                      </div>
                    ))}
                  </div>
                </section>

                {/* ── Buyer Frequently Asked Questions ── */}
                <section className="mt-16 pt-12 border-t border-slate-200">
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                    <div>
                      <div className="inline-flex items-center gap-2 bg-[#00C9AF]/10 text-[#008f7d] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
                        <HelpCircle size={14} /> Clear Answers
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                        Frequently Asked Questions (Buyer FAQs)
                      </h2>
                      <p className="text-slate-600 text-xs sm:text-sm mt-1">
                        Everything you need to know about buying a certified pre-owned car in {displayCity}.
                      </p>
                    </div>
                    <Link
                      to="/faq"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00C9AF] hover:text-[#009b86] shrink-0"
                    >
                      Visit Full FAQ Hub <ArrowRight size={14} />
                    </Link>
                  </div>

                  <div className="space-y-3">
                    {buyerFaqs.map((faq, idx) => {
                      const isOpen = openFaqIndex === idx;
                      return (
                        <div
                          key={idx}
                          className="bg-white border border-slate-200 rounded-2xl overflow-hidden transition-all shadow-xs"
                        >
                          <button
                            onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                            className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 font-bold text-slate-900 text-sm hover:text-[#00C9AF] transition-colors cursor-pointer"
                          >
                            <span>{faq.q}</span>
                            <ChevronDown
                              size={18}
                              className={`text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#00C9AF]' : ''}`}
                            />
                          </button>
                          {isOpen && (
                            <div className="px-4 sm:px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3 bg-slate-50/50">
                              {faq.a}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Internal Link CTA Strip */}
                  <div className="mt-8 bg-gradient-to-r from-[#0C1B33] to-[#122647] rounded-2xl p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <h3 className="text-base font-black">Looking for Car Financing or Inspection Details?</h3>
                      <p className="text-xs text-slate-300 mt-1">
                        Explore our 200-point inspection protocol or check pre-approved loan options with low EMI.
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                      <Link
                        to="/selectt-inspection-process"
                        className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2.5 rounded-xl border border-white/20 transition-all"
                      >
                        Inspection Process
                      </Link>
                      <Link
                        to="/used-car-loan"
                        className="bg-[#00C9AF] hover:bg-[#00b29c] text-[#0C1B33] text-xs font-black px-4 py-2.5 rounded-xl transition-all"
                      >
                        Car Loan EMI
                      </Link>
                    </div>
                  </div>
                </section>
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
            <div className="p-4 border-t border-slate-200 bg-white">
              <button
                onClick={() => setShowMobileFilters(false)}
                className="w-full bg-[#00C9AF] hover:bg-[#00B4A0] text-slate-950 font-heading font-black text-[13px] uppercase tracking-wider py-3.5 rounded-xl transition-all shadow-md cursor-pointer"
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
