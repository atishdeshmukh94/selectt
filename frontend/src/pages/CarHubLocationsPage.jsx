import React, { useState, useEffect } from 'react';
import { MapPin, Clock, Car, ChevronRight, Search, Phone } from 'lucide-react';
import { API_URL } from '../config/api';

const DEFAULT_HUBS = [
  {
    id: 'h1',
    name: 'Pune-Viman Nagar Hub',
    city: 'Pune',
    address: 'Phoenix Marketcity Mall Road, Viman Nagar, Pune, Maharashtra 411014',
    open_hours: '09:30 AM - 08:00 PM (Mon-Sun)',
    phone: '+91-857466-7466',
    image_path: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&auto=format&fit=crop&q=60',
    car_count: 60
  },
  {
    id: 'h2',
    name: 'Pune-Koregaon Park Hub',
    city: 'Pune',
    address: 'Kalyani Nagar Road, near KP Mall, Pune, Maharashtra 411001',
    open_hours: '10:00 AM - 08:00 PM (Mon-Sun)',
    phone: '+91-857466-7466',
    image_path: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&auto=format&fit=crop&q=60',
    car_count: 78
  },
  {
    id: 'h3',
    name: 'Pune-Baner Hub',
    city: 'Pune',
    address: 'Baner Road, Near Balewadi High Street, Baner, Pune, Maharashtra 411045',
    open_hours: '10:00 AM - 08:00 PM (Mon-Sun)',
    phone: '+91-857466-7466',
    image_path: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&auto=format&fit=crop&q=60',
    car_count: 45
  },
  {
    id: 'h4',
    name: 'Raipur-Magneto Mall Hub',
    city: 'Raipur',
    address: 'Magneto Offizo, GE Road, Labhandi, Raipur, Chhattisgarh 492001',
    open_hours: '10:00 AM - 08:00 PM (Mon-Sun)',
    phone: '+91-857466-7466',
    image_path: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=600&auto=format&fit=crop&q=60',
    car_count: 40
  },
  {
    id: 'h5',
    name: 'Raipur-VIP Road Hub',
    city: 'Raipur',
    address: 'VIP Road, Near Airport Circle, Raipur, Chhattisgarh 492015',
    open_hours: '10:00 AM - 08:00 PM (Mon-Sun)',
    phone: '+91-857466-7466',
    image_path: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=600&auto=format&fit=crop&q=60',
    car_count: 35
  },
  {
    id: 'h6',
    name: 'Raipur-Pandri Hub',
    city: 'Raipur',
    address: 'City Center Mall Road, Pandri, Raipur, Chhattisgarh 492004',
    open_hours: '10:00 AM - 08:00 PM (Mon-Sun)',
    phone: '+91-857466-7466',
    image_path: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=60',
    car_count: 28
  },
  {
    id: 'h7',
    name: 'Bangalore-Bellandur Hub',
    city: 'Bangalore',
    address: 'Mantri Commercio Parking, Tower-A, Outer Ring Rd, Bellandur, Bangalore, Karnataka 560103',
    open_hours: '10:00 AM - 08:00 PM (Mon-Sun)',
    phone: '+91-857466-7466',
    image_path: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=600&auto=format&fit=crop&q=60',
    car_count: 67
  },
  {
    id: 'h8',
    name: 'Bangalore-VR Mall Hub',
    city: 'Bangalore',
    address: 'VR Bengaluru, Floor L2, Whitefield Main Road, Mahadevapura, Bangalore, Karnataka 560048',
    open_hours: '10:00 AM - 08:00 PM (Mon-Sun)',
    phone: '+91-857466-7466',
    image_path: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&auto=format&fit=crop&q=60',
    car_count: 56
  },
  {
    id: 'h9',
    name: 'Bangalore-Electronic City Hub',
    city: 'Bangalore',
    address: 'Phase 1, Hosur Main Road, Near Infosys Gate 1, Electronic City, Bangalore, Karnataka 560100',
    open_hours: '10:00 AM - 08:00 PM (Mon-Sun)',
    phone: '+91-857466-7466',
    image_path: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&auto=format&fit=crop&q=60',
    car_count: 48
  }
];

export default function CarHubLocationsPage() {
  const [hubs, setHubs] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    fetch(`${API_URL}/api/car-hub-locations`)
      .then((res) => res.json())
      .then((data) => {
        const loadedHubs = Array.isArray(data) && data.length > 0
          ? (data.length < 3 ? [...data, ...DEFAULT_HUBS.filter(dh => !data.some(d => d.name === dh.name))] : data)
          : DEFAULT_HUBS;
        setHubs(loadedHubs);

        // Derive unique cities
        const uniqueCities = [...new Set(loadedHubs.map((h) => h.city))].sort();
        setCities(uniqueCities);
        if (uniqueCities.length > 0) {
          setSelectedCity(uniqueCities[0]);
        }
      })
      .catch((err) => {
        console.error('Error fetching car hubs:', err);
        setHubs(DEFAULT_HUBS);
        const uniqueCities = [...new Set(DEFAULT_HUBS.map((h) => h.city))].sort();
        setCities(uniqueCities);
        if (uniqueCities.length > 0) {
          setSelectedCity(uniqueCities[0]);
        }
      })
      .finally(() => setLoading(false));
  }, []);

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
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Premium Hero Header */}
      <div className="relative pt-24 pb-20 border-b border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0c1b33] via-[#0a162a] to-[#060d19] z-0"></div>
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] z-0"></div>

        {/* Decorative blur orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#00C9AF] rounded-full mix-blend-screen filter blur-[120px] opacity-35 animate-pulse z-0"></div>
        <div className="absolute bottom-0 left-10 w-72 h-72 bg-purple-600 rounded-full mix-blend-screen filter blur-[100px] opacity-20 z-0"></div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center sm:text-left">
          <h1 className="text-3xl font-black tracking-tight text-white leading-tight">
            Selectt Car Hub Locations
          </h1>
          <p className="text-sm text-white font-semibold leading-relaxed mt-2.5">
            Visit our premium offline hubs to take test drives, complete paperwork, and experience hands-on car inspections.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        {loading ? (
          <div className="py-32 text-center">
            <div className="w-10 h-10 border-4 border-[#00C9AF] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-500 font-bold">Loading hub locations...</p>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-8 items-start">

            {/* Mobile Slidable City Tabs (Horizontal Scroll) */}
            <div className="block md:hidden w-full bg-white border border-slate-200 rounded-2xl shadow-sm p-3.5 mb-2">
              <h3 className="font-extrabold text-slate-800 text-[10px] uppercase tracking-wider mb-2.5 px-1 text-left">Available Cities</h3>
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
                      className={`flex flex-col items-center justify-center px-4 py-2 rounded-xl text-center transition-all cursor-pointer whitespace-nowrap shrink-0 border ${isSelected
                        ? 'bg-[#E6FAF7] border-[#00C9AF] text-[#0C1B33] shadow-sm'
                        : 'bg-slate-50 border-slate-200/80 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span className="text-xs font-black uppercase tracking-wider">{city}</span>
                      <span className={`text-[8.5px] font-bold uppercase mt-0.5 ${isSelected ? 'text-[#00A38D]' : 'text-slate-400'}`}>
                        {hubCount} {hubCount === 1 ? 'Hub' : 'Hubs'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Left Sidebar - City Selector (Desktop Only) */}
            <div className="hidden md:block w-full md:w-1/4 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden sticky top-24 shrink-0">
              <div className="p-3.5 border-b border-slate-100 bg-slate-50/50">
                <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">Available Cities</h3>
              </div>
              <div className="max-h-[400px] overflow-y-auto divide-y divide-slate-100">
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
                      className={`w-full flex items-center justify-between px-4 py-3.5 text-left transition-all cursor-pointer border-l-4 ${isSelected
                          ? 'bg-[#00C9AF]/5 text-[#0C1B33] border-[#00C9AF]'
                          : 'text-slate-600 hover:bg-slate-50 border-transparent'
                        }`}
                    >
                      <div>
                        <span className="block text-xs font-black uppercase tracking-wider">{city}</span>
                        <span className="text-[9px] text-slate-400 font-bold uppercase mt-0.5 block">
                          {hubCount} {hubCount === 1 ? 'Car Hub' : 'Car Hubs'}
                        </span>
                      </div>
                      <ChevronRight size={13} className={isSelected ? 'text-[#00C9AF]' : 'text-slate-300'} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Main Panel - Hubs Display */}
            <div className="w-full md:w-3/4 space-y-4">
              {/* Header Info Card */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-black text-slate-800 leading-tight">
                    {filteredHubs.length} {filteredHubs.length === 1 ? 'Car Hub' : 'Car Hubs'} in {selectedCity}
                  </h2>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                    Over {getCityTotalCars(selectedCity)} quality-certified cars available for instant test drives
                  </p>
                </div>
                <a
                  href={`/buy-cars?city=${selectedCity}`}
                  className="px-4 py-2 bg-[#00C9AF] text-[#0C1B33] font-black uppercase tracking-widest text-[9px] rounded-xl shadow-sm hover:shadow transition-all w-fit text-center"
                >
                  View all {getCityTotalCars(selectedCity)} cars
                </a>
              </div>

              {/* Hub Cards Grid */}
              {filteredHubs.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center text-slate-400 shadow-sm flex flex-col items-center justify-center gap-4">
                  <MapPin size={44} className="opacity-25 text-slate-500" />
                  <div>
                    <h3 className="text-slate-700 font-black text-lg">No hubs found</h3>
                    <p className="text-slate-400 text-xs font-medium mt-1">There are no hubs matching your current filter in this city.</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredHubs.map((hub) => (
                    <div
                      key={hub.id}
                      className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-all flex flex-col group text-left"
                    >
                      {/* Image container */}
                      <div className="h-40 overflow-hidden bg-slate-100 relative">
                        {hub.image_path ? (
                          <img
                            src={hub.image_path}
                            alt={hub.name}
                            className="w-full h-full object-cover group-hover:scale-102 transition-all duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <MapPin size={36} />
                          </div>
                        )}
                        <span className="absolute bottom-3 right-3 bg-[#0C1B33] text-[#00C9AF] text-[9px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-lg shadow-md border border-[#00C9AF]/20">
                          {hub.car_count} Cars
                        </span>
                      </div>

                      {/* Details */}
                      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                        <div className="space-y-1.5">
                          <h3 className="font-extrabold text-slate-800 text-sm leading-tight">
                            {hub.name}
                          </h3>
                          <div className="flex items-start gap-1.5 text-[11px] text-slate-500 font-semibold leading-relaxed">
                            <MapPin size={14} className="text-slate-400 shrink-0 mt-0.5" />
                            <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{hub.address}</span>
                          </div>
                        </div>

                        <div className="space-y-2 pt-2">
                          <div className="flex flex-col gap-1.5 border-t border-slate-100 pt-2.5 text-[11px] text-slate-500 font-semibold">
                            <div className="flex items-center gap-1.5">
                              <Clock size={13} className="text-slate-400 shrink-0" />
                              <span>{hub.open_hours}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-700 font-bold">
                              <Phone size={13} className="text-[#00C9AF] shrink-0 fill-[#00C9AF]" />
                              <a href={`tel:${hub.phone || '+918574667466'}`} className="hover:text-[#00C9AF] transition-colors">
                                {hub.phone || '+91-857466-7466'}
                              </a>
                            </div>
                          </div>

                          <a
                            href={`/buy-cars?city=${hub.city}&hub=${encodeURIComponent(hub.name)}`}
                            className="w-full py-2.5 border border-slate-200 hover:border-slate-300 text-slate-700 bg-slate-50/50 hover:bg-slate-50 font-black uppercase tracking-wider text-[10px] rounded-xl transition-all block text-center"
                          >
                            View {hub.car_count} cars at hub
                          </a>
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
  );
}
