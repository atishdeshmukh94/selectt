import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Clock,
  Car,
  ChevronRight,
  Search,
  Phone,
  Navigation,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Building2,
  ExternalLink
} from 'lucide-react';
import { API_URL } from '../config/api';
import PageMeta from '../components/common/PageMeta';

const DEFAULT_HUBS = [
  {
    id: 'h1',
    name: 'Pune - Viman Nagar Hub',
    city: 'Pune',
    address: 'Phoenix Marketcity Mall Road, Viman Nagar, Pune, Maharashtra 411014',
    open_hours: '09:30 AM - 08:00 PM (All 7 Days)',
    phone: '+91-857466-7466',
    image_path: null,
    car_count: 60,
    maps_query: 'Phoenix Marketcity Mall Viman Nagar Pune'
  },
  {
    id: 'h2',
    name: 'Pune - Koregaon Park Hub',
    city: 'Pune',
    address: 'Kalyani Nagar Road, near KP Mall, Pune, Maharashtra 411001',
    open_hours: '10:00 AM - 08:00 PM (All 7 Days)',
    phone: '+91-857466-7466',
    image_path: null,
    car_count: 78,
    maps_query: 'Koregaon Park Kalyani Nagar Pune'
  },
  {
    id: 'h3',
    name: 'Pune - Baner Hub',
    city: 'Pune',
    address: 'Baner Road, Near Balewadi High Street, Baner, Pune, Maharashtra 411045',
    open_hours: '10:00 AM - 08:00 PM (All 7 Days)',
    phone: '+91-857466-7466',
    image_path: null,
    car_count: 45,
    maps_query: 'Balewadi High Street Baner Pune'
  },
  {
    id: 'h4',
    name: 'Mumbai - Andheri West Hub',
    city: 'Mumbai',
    address: 'Infinity Mall Link Road, Next to Oshiwara Metro, Andheri West, Mumbai, Maharashtra 400053',
    open_hours: '10:00 AM - 08:30 PM (All 7 Days)',
    phone: '+91-857466-7466',
    image_path: null,
    car_count: 85,
    maps_query: 'Infinity Mall Link Road Oshiwara Andheri West Mumbai'
  },
  {
    id: 'h5',
    name: 'Mumbai - Bandra Kurla Complex (BKC) Hub',
    city: 'Mumbai',
    address: 'G Block, Bandra Kurla Complex, Bandra East, Mumbai, Maharashtra 400051',
    open_hours: '10:00 AM - 08:30 PM (All 7 Days)',
    phone: '+91-857466-7466',
    image_path: null,
    car_count: 92,
    maps_query: 'Bandra Kurla Complex BKC Bandra East Mumbai'
  },
  {
    id: 'h6',
    name: 'Mumbai - Vashi Navi Mumbai Hub',
    city: 'Mumbai',
    address: 'Near Inorbit Mall, Sector 30A, Vashi, Navi Mumbai, Maharashtra 400703',
    open_hours: '10:00 AM - 08:30 PM (All 7 Days)',
    phone: '+91-857466-7466',
    image_path: null,
    car_count: 65,
    maps_query: 'Inorbit Mall Sector 30A Vashi Navi Mumbai'
  },
  {
    id: 'h6_1',
    name: 'Mumbai - Thane Majiwada Hub',
    city: 'Mumbai',
    address: 'Eastern Express Highway, Near Viviana Mall, Majiwada, Thane West, Maharashtra 400601',
    open_hours: '10:00 AM - 08:30 PM (All 7 Days)',
    phone: '+91-857466-7466',
    image_path: null,
    car_count: 58,
    maps_query: 'Viviana Mall Eastern Express Highway Thane West'
  },
  {
    id: 'h7',
    name: 'Bengaluru - Bellandur Hub',
    city: 'Bengaluru',
    address: 'Mantri Commercio Parking, Tower-A, Outer Ring Rd, Bellandur, Bengaluru, Karnataka 560103',
    open_hours: '10:00 AM - 08:00 PM (All 7 Days)',
    phone: '+91-857466-7466',
    image_path: null,
    car_count: 67,
    maps_query: 'Mantri Commercio Outer Ring Road Bellandur Bangalore'
  },
  {
    id: 'h8',
    name: 'Bengaluru - VR Mall Hub',
    city: 'Bengaluru',
    address: 'VR Bengaluru, Floor L2, Whitefield Main Road, Mahadevapura, Bengaluru, Karnataka 560048',
    open_hours: '10:00 AM - 08:00 PM (All 7 Days)',
    phone: '+91-857466-7466',
    image_path: null,
    car_count: 56,
    maps_query: 'VR Bengaluru Whitefield Main Road Mahadevapura Bangalore'
  },
  {
    id: 'h9',
    name: 'Bengaluru - Electronic City Hub',
    city: 'Bengaluru',
    address: 'Phase 1, Hosur Main Road, Near Infosys Gate 1, Electronic City, Bengaluru, Karnataka 560100',
    open_hours: '10:00 AM - 08:00 PM (All 7 Days)',
    phone: '+91-857466-7466',
    image_path: null,
    car_count: 48,
    maps_query: 'Infosys Gate 1 Electronic City Bangalore'
  }
];

export default function CarHubLocationsPage() {
  const [hubs, setHubs] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const pickDefaultCity = (availableCities) => {
    const stored = localStorage.getItem('user_city') || localStorage.getItem('selectedCity') || localStorage.getItem('selected_location') || '';
    if (stored) {
      const match = availableCities.find(c => c.toLowerCase() === stored.toLowerCase() || stored.toLowerCase().includes(c.toLowerCase()) || c.toLowerCase().includes(stored.toLowerCase()));
      if (match) return match;
    }
    return availableCities.length > 0 ? availableCities[0] : '';
  };

  useEffect(() => {
    setLoading(true);
    fetch(`${API_URL}/api/car-hub-locations`)
      .then((res) => res.json())
      .then((data) => {
        const loadedHubs = Array.isArray(data) && data.length > 0
          ? (data.length < 3 ? [...data, ...DEFAULT_HUBS.filter(dh => !data.some(d => d.name === dh.name))] : data)
          : DEFAULT_HUBS;
        setHubs(loadedHubs);

        const uniqueCities = [...new Set(loadedHubs.map((h) => h.city))].sort();
        setCities(uniqueCities);
        setSelectedCity(pickDefaultCity(uniqueCities));
      })
      .catch((err) => {
        console.error('Error fetching car hubs:', err);
        setHubs(DEFAULT_HUBS);
        const uniqueCities = [...new Set(DEFAULT_HUBS.map((h) => h.city))].sort();
        setCities(uniqueCities);
        setSelectedCity(pickDefaultCity(uniqueCities));
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handleLocationChange = () => {
      const stored = localStorage.getItem('user_city') || localStorage.getItem('selectedCity') || localStorage.getItem('selected_location') || '';
      if (stored && cities.length > 0) {
        const match = cities.find(c => c.toLowerCase() === stored.toLowerCase() || stored.toLowerCase().includes(c.toLowerCase()) || c.toLowerCase().includes(stored.toLowerCase()));
        if (match) setSelectedCity(match);
      }
    };
    window.addEventListener('location-changed', handleLocationChange);
    window.addEventListener('storage', handleLocationChange);
    return () => {
      window.removeEventListener('location-changed', handleLocationChange);
      window.removeEventListener('storage', handleLocationChange);
    };
  }, [cities]);

  const getCityHubCount = (cityName) => {
    return hubs.filter((h) => h.city === cityName).length;
  };

  const getCityTotalCars = (cityName) => {
    return hubs
      .filter((h) => h.city === cityName)
      .reduce((sum, h) => sum + (h.car_count || 0), 0);
  };

  const filteredHubs = hubs.filter((h) => {
    const matchesCity = h.city === selectedCity;
    const matchesSearch =
      !search ||
      h.name.toLowerCase().includes(search.toLowerCase()) ||
      h.address.toLowerCase().includes(search.toLowerCase());
    return matchesCity && matchesSearch;
  });

  return (
    <>
      <PageMeta
        title="Selectt Car Hub Locations - Test Drive & Physical Inspection | Selectt"
        description="Visit our state-of-the-art Selectt Car Hubs across Mumbai, Pune, and Bengaluru. Experience contactless test drives, instant evaluations, and spot deliveries."
      />

      <div className="min-h-screen bg-[#F8FAFC] pb-20 text-slate-800 antialiased selection:bg-[#00C9AF]/20 selection:text-[#0C1B33]">
        
        {/* ───────────── Premium Hero Header ───────────── */}
        <div className="relative pt-20 pb-20 bg-[#0C1B33] border-b border-slate-800 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0c1b33] via-[#0a162a] to-[#060d19] z-0"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#00C9AF] rounded-full mix-blend-screen filter blur-[140px] opacity-25 animate-pulse z-0"></div>
          <div className="absolute bottom-0 left-10 w-80 h-80 bg-purple-600 rounded-full mix-blend-screen filter blur-[120px] opacity-20 z-0"></div>

          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center sm:text-left">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#00C9AF]/15 text-[#00C9AF] border border-[#00C9AF]/20 w-fit mb-3.5">
              <Building2 size={13} /> Selectt Experience Centers
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight mb-3.5">
              Selectt Car Hub Locations
            </h1>
            <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed max-w-2xl">
              Visit our premium offline hubs to take test drives, explore 200-point inspection bays, and complete seamless spot car deliveries.
            </p>
          </div>
        </div>

        {/* ───────────── Main Content Container ───────────── */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
          {loading ? (
            <div className="py-32 text-center">
              <div className="w-10 h-10 border-3 border-[#00C9AF] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-slate-500 font-medium text-sm">Loading car hub locations...</p>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row gap-8 items-start">

              {/* Mobile City Selector (Horizontal Pill List) */}
              <div className="block md:hidden w-full bg-white border border-slate-200/80 rounded-2xl shadow-xs p-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2 px-1 text-left">
                  Select City
                </span>
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar scrollbar-none">
                  {cities.map((city) => {
                    const hubCount = getCityHubCount(city);
                    const isSelected = selectedCity === city;
                    return (
                      <button
                        key={city}
                        onClick={() => {
                          setSelectedCity(city);
                          setSearch('');
                        }}
                        className={`px-4 py-2 rounded-xl text-center transition-all cursor-pointer whitespace-nowrap shrink-0 border text-xs font-bold ${
                          isSelected
                            ? 'bg-[#0C1B33] border-[#0C1B33] text-white shadow-xs'
                            : 'bg-slate-50 border-slate-200/80 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {city} ({hubCount})
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Desktop Left Sidebar: City Selector */}
              <div className="hidden md:block w-full md:w-1/4 bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden sticky top-24 shrink-0 text-left">
                <div className="p-4 border-b border-slate-100 bg-slate-50/70">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                    Available Cities
                  </span>
                </div>
                <div className="divide-y divide-slate-100">
                  {cities.map((city) => {
                    const hubCount = getCityHubCount(city);
                    const totalCars = getCityTotalCars(city);
                    const isSelected = selectedCity === city;
                    return (
                      <button
                        key={city}
                        onClick={() => {
                          setSelectedCity(city);
                          setSearch('');
                        }}
                        className={`w-full flex items-center justify-between px-4 py-4 text-left transition-all cursor-pointer border-l-3 ${
                          isSelected
                            ? 'bg-[#00C9AF]/10 text-slate-900 border-[#00C9AF] font-bold'
                            : 'text-slate-600 hover:bg-slate-50 border-transparent font-medium'
                        }`}
                      >
                        <div>
                          <span className="block text-xs uppercase tracking-wider font-bold">{city}</span>
                          <span className="text-[10px] text-slate-400 font-medium mt-0.5 block">
                            {hubCount} {hubCount === 1 ? 'Hub' : 'Hubs'} • {totalCars} Cars
                          </span>
                        </div>
                        <ChevronRight size={14} className={isSelected ? 'text-[#00C9AF]' : 'text-slate-300'} />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Main Content */}
              <div className="w-full md:w-3/4 space-y-5">
                
                {/* City Status & Search Bar */}
                <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <h2 className="text-lg font-bold text-slate-900">
                        {filteredHubs.length} Experience Hub{filteredHubs.length > 1 ? 's' : ''} in {selectedCity}
                      </h2>
                    </div>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">
                      {getCityTotalCars(selectedCity)} quality-certified cars available on display for immediate test drives
                    </p>
                  </div>

                  <a
                    href={`/buy-cars?city=${selectedCity}`}
                    className="px-4 py-2.5 bg-[#00C9AF] hover:bg-[#00b29c] text-[#0C1B33] font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs transition-all w-fit text-center cursor-pointer"
                  >
                    Browse All {getCityTotalCars(selectedCity)} Cars
                  </a>
                </div>

                {/* Hub Cards Grid */}
                {filteredHubs.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-200/80 p-14 text-center text-slate-400 shadow-xs flex flex-col items-center justify-center gap-3">
                    <MapPin size={36} className="text-slate-300" />
                    <div>
                      <h3 className="text-slate-800 font-bold text-base">No hubs found</h3>
                      <p className="text-slate-400 text-xs font-normal mt-1">There are no hubs matching your search query in {selectedCity}.</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredHubs.map((hub) => (
                      <div
                        key={hub.id}
                        className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden hover:border-slate-300 transition-all flex flex-col justify-between group text-left"
                      >
                        {/* Hub Photo */}
                        <div className="h-44 overflow-hidden bg-slate-100 dark:bg-slate-800 relative flex items-center justify-center">
                          {hub.image_path ? (
                            <img
                              src={hub.image_path}
                              alt={hub.name}
                              className="w-full h-full object-cover group-hover:scale-103 transition-all duration-500"
                              onError={(e) => {
                                (e.target).style.display = 'none';
                                const parent = (e.target).parentElement;
                                if (parent && !parent.querySelector('.hub-fallback-placeholder')) {
                                  const placeholder = document.createElement('div');
                                  placeholder.className = 'hub-fallback-placeholder w-full h-full flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-300 gap-1.5';
                                  placeholder.innerHTML = '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="text-slate-400"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg><span class="text-[11px] font-semibold text-slate-400 tracking-wide">Selectt Hub</span>';
                                  parent.appendChild(placeholder);
                                }
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-300 gap-1.5">
                              <MapPin size={32} className="text-slate-400" />
                              <span className="text-[11px] font-semibold text-slate-400 tracking-wide">Selectt Hub</span>
                            </div>
                          )}
                          <span className="absolute bottom-3 right-3 bg-[#0C1B33]/90 backdrop-blur-md text-[#00C9AF] text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg shadow-sm border border-white/10">
                            {hub.car_count} Cars on Display
                          </span>
                        </div>

                        {/* Hub Details */}
                        <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                          <div className="space-y-2">
                            <h3 className="font-bold text-slate-900 text-base leading-snug">
                              {hub.name}
                            </h3>
                            <div className="flex items-start gap-1.5 text-xs text-slate-500 font-normal leading-relaxed">
                              <MapPin size={14} className="text-slate-400 shrink-0 mt-0.5" />
                              <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                {hub.address}
                              </span>
                            </div>
                          </div>

                          <div className="space-y-3 pt-3 border-t border-slate-100">
                            <div className="space-y-1.5 text-xs text-slate-500 font-medium">
                              <div className="flex items-center gap-1.5">
                                <Clock size={13} className="text-slate-400 shrink-0" />
                                <span>{hub.open_hours}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-slate-700">
                                <Phone size={13} className="text-[#00a892] shrink-0" />
                                <a href={`tel:${hub.phone || '+918574667466'}`} className="hover:text-[#00a892] transition-colors font-bold">
                                  {hub.phone || '+91-857466-7466'}
                                </a>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 pt-1">
                              <a
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hub.maps_query || hub.address)}`}
                                target="_blank"
                                rel="noreferrer"
                                className="py-2.5 px-3 border border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl font-bold text-[11px] transition-all flex items-center justify-center gap-1.5"
                              >
                                <Navigation size={12} className="text-sky-600" />
                                <span>Directions</span>
                              </a>

                              <a
                                href={`/buy-cars?city=${hub.city}&hub=${encodeURIComponent(hub.name)}`}
                                className="py-2.5 px-3 bg-[#0C1B33] hover:bg-[#162a4d] text-white rounded-xl font-bold text-[11px] transition-all flex items-center justify-center gap-1"
                              >
                                <span>View Cars</span>
                                <ChevronRight size={12} />
                              </a>
                            </div>
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}
        </div>

      </div>
    </>
  );
}

