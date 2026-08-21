import React, { useState, useEffect } from 'react';
import { Search, Navigation, X, MapPinOff } from 'lucide-react';
import { API_URL } from '../../config/api';

const LocationPopup = () => {
  const [cities, setCities] = useState([]);
  const [loadingCities, setLoadingCities] = useState(true);
  const [isVisible, setIsVisible] = useState(() => {
    if (typeof window !== 'undefined') {
      return !localStorage.getItem('user_city');
    }
    return false;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState('selection'); // 'selection' or 'coming-soon'
  const [outsideStateMsg, setOutsideStateMsg] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/api/locations`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCities(data.map(c => ({
            name: c.name,
            img: c.image || 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=200&q=80'
          })));
        }
        setLoadingCities(false);
      })
      .catch(err => {
        console.error('Error fetching cities:', err);
        setLoadingCities(false);
      });
  }, []);

  useEffect(() => {
    const handleOpen = () => {
      setView('selection');
      setIsVisible(true);
    };
    window.addEventListener('open-location-selector', handleOpen);
    return () => window.removeEventListener('open-location-selector', handleOpen);
  }, []);

  const handleCitySelect = (cityName) => {
    localStorage.setItem('user_city', cityName);
    setIsVisible(false);
    window.dispatchEvent(new Event('location-changed'));
  };

  const handleAutoLocate = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`)
            .then(res => res.json())
            .then(data => {
              const addr = data.address || {};
              const stateName = addr.state || '';
              const detectedCity = addr.city || addr.town || addr.village || addr.state_district || addr.county || '';

              // Validate Maharashtra state check
              if (stateName && stateName.toLowerCase().trim() !== 'maharashtra') {
                setOutsideStateMsg(detectedCity || 'your city');
                setView('coming-soon');
              } else {
                if (detectedCity) {
                  const match = cities.find(c => c.name.toLowerCase() === detectedCity.toLowerCase());
                  if (match) {
                    handleCitySelect(match.name);
                  } else {
                    handleCitySelect(detectedCity);
                  }
                } else {
                  handleCitySelect('Mumbai'); // Capital of Maharashtra fallback
                }
              }
            })
            .catch(err => {
              console.error('Nominatim error:', err);
              handleCitySelect('Delhi NCR'); // fallback
            });
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Failed to detect location. Please select manually.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  if (!isVisible) return null;

  // Filter cities based on search
  const filteredCities = cities.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center px-4 backdrop-blur-md bg-black/40 animate-in fade-in duration-300">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 flex flex-col max-h-[85vh]">

        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-[#0C1B33]">Select Your City</h2>
            <p className="text-[11px] text-slate-400">
              {view === 'coming-soon' ? 'Operation Area Warning' : 'Choose location to see local car listings'}
            </p>
          </div>
          {/* Close button - only show if there's already a city selected so they can dismiss it */}
          {localStorage.getItem('user_city') && (
            <button
              onClick={() => setIsVisible(false)}
              className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Coming Soon state screen */}
        {view === 'coming-soon' ? (
          <div className="p-8 text-center animate-in zoom-in-95 duration-300 flex flex-col items-center">
            {/* Animated Pin Off Icon with Glow */}
            <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center mb-6 text-rose-500 shadow-md animate-bounce relative">
              <MapPinOff size={28} />
              <span className="absolute inset-0 rounded-full bg-rose-400/20 animate-ping"></span>
            </div>

            <h3 className="text-lg font-black text-slate-950 mb-2">We aren't here yet!</h3>
            <p className="text-slate-500 text-xs leading-relaxed mb-6 max-w-xs">
              Sorry, we are currently only operating in **Maharashtra** (Mumbai, Pune, etc.). We hope to arrive in **{outsideStateMsg}** soon!
            </p>

            <div className="w-full border-t border-slate-100 my-2 mb-6"></div>

            {/* Go back to browse Maharashtra list */}
            <button
              onClick={() => setView('selection')}
              className="w-full bg-[#00C9AF] hover:bg-[#00B4A0] text-[#0C1B33] font-black py-3.5 rounded-xl shadow-lg shadow-[#00C9AF]/25 transition-all active:scale-95 text-xs sm:text-sm uppercase tracking-wider cursor-pointer"
            >
              Browse Maharashtra Cities
            </button>
          </div>
        ) : (
          /* Selection Body */
          <div className="p-5 overflow-y-auto custom-scrollbar flex-1">
            {/* Auto Locate Button */}
            <button
              onClick={handleAutoLocate}
              className="w-full mb-4 py-2.5 px-4 bg-slate-50 hover:bg-[#00C9AF]/10 text-[#00C9AF] rounded-xl text-xs font-bold transition-all border border-[#00C9AF]/20 flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <Navigation size={12} className="rotate-45 fill-current" />
              USE CURRENT LOCATION
            </button>

            {/* Search Input */}
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="text"
                placeholder="Search for your city..."
                className="w-full bg-slate-50 border border-slate-100 focus:border-[#00C9AF]/30 focus:bg-white pl-10 pr-4 py-2 rounded-xl outline-none transition-all text-xs font-medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Cities Section */}
            <div>
              <h3 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">Popular Cities</h3>

              {loadingCities ? (
                <div className="py-6 text-center text-xs font-bold text-[#00C9AF] animate-pulse">Loading cities...</div>
              ) : filteredCities.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">No cities found matching "{searchQuery}"</div>
              ) : (
                <div className="grid grid-cols-3 gap-2.5 max-h-[30vh] overflow-y-auto pr-1 custom-scrollbar">
                  {filteredCities.map((city, idx) => (
                    <div
                      key={idx}
                      className="group cursor-pointer flex flex-col items-center p-1.5 rounded-xl hover:bg-slate-50 transition-colors"
                      onClick={() => handleCitySelect(city.name)}
                    >
                      <div className="w-11 h-11 rounded-full overflow-hidden mb-1 ring-2 ring-slate-100 group-hover:ring-[#00C9AF] transition-all">
                        <img
                          src={city.img}
                          alt={city.name}
                          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <span className="text-[9px] font-bold text-slate-600 group-hover:text-[#00C9AF] text-center line-clamp-1 transition-colors">
                        {city.name}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <style>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #f1f1f1;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #ccc;
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #999;
          }
        `}</style>
      </div>
    </div>
  );
};

export default LocationPopup;

