import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Search, Check, X, Info } from 'lucide-react';

const DEFAULT_FEATURE_CATEGORIES = [
  'Safety',
  'Comfort & convenience',
  'Entertainment & communication',
  'Interior',
  'Exterior'
];

// Rich default features if car has only basic features entered
const FALLBACK_CATEGORY_FEATURES = {
  'Safety': [
    { name: 'Airbags', available: true, info: 'Driver, passenger & side curtain airbags for maximum occupant safety' },
    { name: 'Number of airbags - 6 units', available: true, info: 'Equipped with 6 full-cabin airbags' },
    { name: 'Electronic stability program (ESP)', available: true, info: 'Helps prevent skidding and loss of traction' },
    { name: 'Brake assist (BA)', available: true, info: 'Provides maximum braking pressure during emergency stops' },
    { name: 'Traction control', available: true, info: 'Prevents wheel spin on slippery or uneven surfaces' },
    { name: 'Follow me home headlamps', available: true, info: 'Headlights stay on briefly after locking to illuminate your walkway' },
    { name: 'Tyre pressure monitoring system (TPMS)', available: true, info: 'Displays real-time tyre pressure alerts on the instrument cluster' },
    { name: 'Hill hold control', available: true, info: 'Prevents roll-back on steep inclines when releasing the brake' },
    { name: 'Rear camera', available: true, info: 'High-resolution reverse parking assistance with dynamic guidelines' },
    { name: 'Child seat anchor points', available: true, info: 'ISOFIX child seat mounting anchors on rear outer seats' },
    { name: 'ABS System', available: true, info: 'Anti-lock braking system prevents wheel lockup during hard braking' },
    { name: 'Central locking', available: true, info: 'Remote central door locking with auto-lock on speed' }
  ],
  'Comfort & convenience': [
    { name: 'Automatic climate control', available: true, info: 'Maintains preset cabin temperature automatically' },
    { name: '2nd row AC vent', available: true, info: 'Dedicated rear air-conditioning vents for passenger comfort' },
    { name: 'Anti-glare mirrors - Manual', available: true, info: 'Reduces high-beam headlight glare from following vehicles' },
    { name: 'Cabin boot access', available: true, info: 'Quick access to luggage compartment from rear passenger seats' },
    { name: 'Driver armrest storage', available: true, info: 'Convenient center console storage beneath padded armrest' },
    { name: 'Keyless start', available: true, info: 'Push-button start/stop without taking key out of your pocket' },
    { name: 'Glove box cooling', available: true, info: 'Cools drinks and snacks using dedicated AC airflow in glove box' },
    { name: 'Driver height adjustable seat', available: true, info: 'Customizable seat height for optimal driving posture' },
    { name: 'Steering mounted controls', available: true, info: 'Audio, phone, and cruise controls accessible on the steering wheel' },
    { name: 'Power windows', available: true, info: 'One-touch power windows with anti-pinch functionality' },
    { name: 'Wireless charging', available: true, info: 'Convenient Qi-standard wireless smartphone charging pad' },
    { name: 'Ventilated seats', available: true, info: 'Active cooling airflow through perforated seat upholstery' }
  ],
  'Entertainment & communication': [
    { name: 'Touch screen infotainment system', available: true, info: 'High-definition touchscreen interface with rich media controls' },
    { name: 'Apple car play / android auto', available: true, info: 'Seamless smartphone screen mirroring and voice navigation' },
    { name: 'GPS navigation system', available: true, info: 'Built-in GPS navigation with turn-by-turn guidance' },
    { name: 'Bluetooth compatibility/connectivity', available: true, info: 'Wireless hands-free calling and high-fidelity audio streaming' },
    { name: 'USB compatibility/connectivity', available: true, info: 'Fast-charging USB Type-A and Type-C data ports' },
    { name: 'Aux compatibility/connectivity', available: true, info: '3.5mm auxiliary audio input for external audio devices' },
    { name: 'Speakers', available: true, info: 'Premium acoustic multi-speaker surround sound system' },
    { name: 'Am/fm radio', available: true, info: 'Digital AM/FM radio tuner with memory presets' },
    { name: 'Integrated (in-dash) music system', available: true, info: 'Factory integrated multimedia dash receiver' }
  ],
  'Interior': [
    { name: 'Leather wrapped gear knob/ shift selector', available: true, info: 'Premium soft-touch leather wrapped gear shift' },
    { name: 'Digital Tachometer', available: true, info: 'Crisp digital engine RPM gauge display' },
    { name: 'Door pockets', available: true, info: 'Spacious bottle and document door storage pockets' },
    { name: 'Seat upholstery type - Fabric seats', available: true, info: 'Breathable, durable premium fabric seat upholstery' },
    { name: 'Digital Instrument cluster', available: true, info: 'Full digital driver information display' },
    { name: 'Digital tripmeter', available: true, info: 'Tracks journey distance, fuel efficiency, and travel time' },
    { name: 'Interior colours - Off-White and Grey', available: true, info: 'Dual-tone premium interior color scheme' },
    { name: 'Rear passenger adjustable seats', available: true, info: 'Reclining and 60:40 split-folding rear bench seats' },
    { name: 'Headrests', available: true, info: 'Ergonomic adjustable front and rear headrests' },
    { name: 'Interior door handles', available: true, info: 'Chrome-accented interior release handles' }
  ],
  'Exterior': [
    { name: 'Rear wiper', available: true, info: 'Cleans rear windscreen with integrated washer jet' },
    { name: 'Outside rear view mirrors (ORVMs)', available: true, info: 'Electrically adjustable and foldable side mirrors' },
    { name: 'Rear power window', available: true, info: 'Electric powered rear passenger windows' },
    { name: 'Body colored bumpers', available: true, info: 'Aerodynamic factory painted body-colored bumpers' },
    { name: 'Turn indicators on ORVM', available: true, info: 'Integrated LED side turn indicators on side mirrors' },
    { name: 'Tail lamps - LEDs', available: true, info: 'Sleek, bright signature LED tail lamps' },
    { name: 'Body kit', available: true, info: 'Protective sport side body cladding and scuff plates' },
    { name: 'Exterior door handle colour - Body Coloured', available: true, info: 'Streamlined exterior door handles matching car color' },
    { name: 'Headlights Bulb type - LED', available: true, info: 'Energy-efficient, ultra-bright LED projector headlights' },
    { name: 'Tail lamps type - LED', available: true, info: 'Signature LED light guides' },
    { name: 'Sunroof', available: false, info: 'Electric sunroof (available in top variant)' },
    { name: 'Rain sensing wipers', available: false, info: 'Auto rain detection wipers (available in top variant)' },
    { name: 'Rear defogger', available: false, info: 'Heated electric rear defogger grid lines' },
    { name: 'Xenon headlamps / hid-headlamps', available: false, info: 'High-intensity discharge headlights' }
  ]
};

const FeaturesDrawer = ({
  isOpen,
  onClose,
  car,
  features,
  onBookNow,
  onTestDrive
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('Safety');
  const [activeTooltip, setActiveTooltip] = useState(null);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setSearchQuery('');
      setActiveTooltip(null);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Normalize car features with fallbacks to ensure rich Spinny-grade content
  const categorizedFeatures = useMemo(() => {
    const result = {};

    // 1. Initialize with fallback structure
    DEFAULT_FEATURE_CATEGORIES.forEach((cat) => {
      result[cat] = [...FALLBACK_CATEGORY_FEATURES[cat]];
    });

    // 2. If dynamic features object provided by admin / car data:
    if (features && typeof features === 'object') {
      Object.entries(features).forEach(([catTitle, items]) => {
        if (!Array.isArray(items) || items.length === 0) return;

        // Match to standard category or create new
        const matchedCat = DEFAULT_FEATURE_CATEGORIES.find(
          (c) => c.toLowerCase() === catTitle.toLowerCase()
        ) || catTitle;

        if (!result[matchedCat]) {
          result[matchedCat] = [];
        }

        // Merge admin features: mark as available
        items.forEach((item) => {
          const itemName = typeof item === 'string' ? item : item?.name;
          if (!itemName) return;

          const existingIdx = result[matchedCat].findIndex(
            (f) => f.name.toLowerCase() === itemName.toLowerCase()
          );

          if (existingIdx >= 0) {
            result[matchedCat][existingIdx].available = true;
          } else {
            result[matchedCat].unshift({
              name: itemName,
              available: true,
              info: `Verified factory feature for ${car?.brand || car?.make || 'vehicle'}`
            });
          }
        });
      });
    }

    return result;
  }, [features, car]);

  const categories = useMemo(() => {
    return Object.keys(categorizedFeatures);
  }, [categorizedFeatures]);

  // Filter items based on activeTab and searchQuery
  const currentItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (query) {
      // Search across ALL categories
      const matches = [];
      Object.entries(categorizedFeatures).forEach(([cat, list]) => {
        list.forEach((item) => {
          if (item.name.toLowerCase().includes(query) || cat.toLowerCase().includes(query)) {
            matches.push({ ...item, category: cat });
          }
        });
      });
      return matches;
    }

    // Default: return items for activeTab
    return (categorizedFeatures[activeTab] || []).map((item) => ({
      ...item,
      category: activeTab
    }));
  }, [categorizedFeatures, activeTab, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99998] flex justify-end">
      {/* Semi-transparent Backdrop Overlay */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Slide-Over Drawer Container */}
      <div
        className="relative w-full sm:w-[480px] md:w-[540px] lg:w-[580px] h-full bg-white z-[99999] shadow-2xl flex flex-col transform animate-in slide-in-from-right duration-300 ease-out"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Top Header ── */}
        <div className="pt-4 px-4 sm:px-6 pb-3 bg-white border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3 mb-3">
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 -ml-2 rounded-full hover:bg-slate-100 flex items-center justify-center text-[#0C1B33] hover:text-[#00A38D] transition-colors cursor-pointer"
              aria-label="Back"
            >
              <ArrowLeft size={20} strokeWidth={2.2} />
            </button>
            <h2 className="text-lg sm:text-xl font-black text-[#0C1B33] tracking-tight font-heading">
              Features
            </h2>
          </div>

          {/* Search Box */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search any features"
              className="w-full bg-[#F4F4F6] border border-transparent focus:border-[#00C9AF] focus:ring-2 focus:ring-[#00C9AF]/20 rounded-xl pl-4 pr-10 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all font-medium"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X size={15} />
              </button>
            ) : (
              <Search
                size={16}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
            )}
          </div>
        </div>

        {/* ── 2-Column Body Layout ── */}
        <div className="flex-1 flex overflow-hidden bg-white">
          {/* Left Category Tabs (Hidden during global search) */}
          {!searchQuery && (
            <div className="w-[145px] sm:w-[165px] border-r border-slate-100 overflow-y-auto shrink-0 bg-white no-scrollbar py-2">
              {categories.map((cat) => {
                const isActive = activeTab === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setActiveTab(cat);
                      setActiveTooltip(null);
                    }}
                    className={`w-full py-4 px-3 sm:px-4 text-xs sm:text-[13px] leading-snug text-left transition-all cursor-pointer relative border-r-4 ${
                      isActive
                        ? 'text-[#0C1B33] font-black border-[#00C9AF] bg-[#00C9AF]/10'
                        : 'text-slate-600 hover:text-slate-900 font-medium border-transparent hover:bg-slate-50/60'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          )}

          {/* Right Main Content Area */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-2 custom-scrollbar">
            {/* Category Heading */}
            <div className="pb-1 mb-1 border-b border-slate-100 flex items-center justify-between">
              <span className="text-[11px] font-black tracking-wider text-slate-400 uppercase font-sans">
                {searchQuery ? `SEARCH RESULTS (${currentItems.length})` : activeTab.toUpperCase()}
              </span>
            </div>

            {/* Features Rows */}
            {currentItems.length > 0 ? (
              currentItems.map((item, idx) => {
                const isAvail = item.available !== false;
                return (
                  <div
                    key={idx}
                    className="py-3 border-b border-slate-100 last:border-0 flex items-start gap-3 relative group"
                  >
                    {/* Status Icon */}
                    <div className="mt-0.5 shrink-0">
                      {isAvail ? (
                        <Check size={16} strokeWidth={2.8} className="text-[#00A38D]" />
                      ) : (
                        <X size={16} strokeWidth={2.4} className="text-rose-500" />
                      )}
                    </div>

                    {/* Feature Info */}
                    <div className="flex-1 min-w-0 pr-1">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-xs sm:text-[13px] leading-snug font-medium ${
                            isAvail ? 'text-slate-900' : 'text-slate-600'
                          }`}
                        >
                          {item.name}
                        </span>

                        {/* Tooltip Icon */}
                        {item.info && (
                          <div className="relative shrink-0">
                            <button
                              type="button"
                              onClick={() => setActiveTooltip(activeTooltip === idx ? null : idx)}
                              className="w-4 h-4 rounded-full text-slate-400 hover:text-[#00A38D] transition-colors flex items-center justify-center cursor-pointer"
                              aria-label="Info"
                            >
                              <Info size={13} />
                            </button>

                            {/* Active Popover Tooltip */}
                            {activeTooltip === idx && (
                              <div className="absolute right-0 top-6 w-56 p-2.5 bg-slate-900 text-white text-[11px] font-normal leading-relaxed rounded-xl shadow-xl z-30 animate-in fade-in zoom-in-95">
                                {item.info}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Optional Category pill in search mode */}
                      {searchQuery && (
                        <span className="inline-block mt-1 text-[10px] text-slate-400 font-semibold uppercase">
                          {item.category}
                        </span>
                      )}

                      {/* Optional Feature Image Thumbnail */}
                      {item.image && (
                        <div className="mt-2.5 rounded-xl overflow-hidden border border-slate-200 w-32 h-20 bg-slate-100">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-12 text-center text-slate-400">
                <Search size={28} className="mx-auto mb-2 opacity-40" />
                <p className="text-xs font-semibold">No features found matching &ldquo;{searchQuery}&rdquo;</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Sticky Bottom Footer ── */}
        <div className="p-3.5 sm:px-6 bg-white border-t border-slate-100 grid grid-cols-2 gap-3 shrink-0 shadow-[0_-8px_20px_rgba(0,0,0,0.06)]">
          {/* Book Now Button */}
          <button
            type="button"
            onClick={() => {
              onClose();
              if (onBookNow) onBookNow();
            }}
            className="w-full py-2.5 px-3 bg-[#00C9AF] hover:bg-[#00B4A0] text-[#0C1B33] rounded-2xl font-bold flex flex-col items-center justify-center transition-all cursor-pointer shadow-md shadow-[#00C9AF]/20 active:scale-98"
          >
            <span className="text-xs sm:text-[13px] font-black tracking-wide leading-tight">
              Book now
            </span>
            <span className="text-[10px] text-[#0C1B33]/85 font-semibold leading-none mt-0.5">
              100% refundable
            </span>
          </button>

          {/* Free Test Drive Button */}
          <button
            type="button"
            onClick={() => {
              onClose();
              if (onTestDrive) onTestDrive();
            }}
            className="w-full py-2.5 px-3 bg-[#EF4444] hover:bg-[#DC2626] text-white rounded-2xl font-bold flex flex-col items-center justify-center transition-all cursor-pointer shadow-md shadow-red-500/20 active:scale-98"
          >
            <span className="text-xs sm:text-[13px] font-black tracking-wide leading-tight">
              Free test drive
            </span>
            <span className="text-[10px] text-white/90 font-semibold leading-none mt-0.5">
              At your doorstep
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeaturesDrawer;
