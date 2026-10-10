import React, { useState, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { API_URL } from '../../config/api';

const FilterSection = ({ id, activeSection, onToggle, title, children, lightBg = false }) => {
  const isOpen = activeSection === id;
  return (
    <div className={`border-b py-3.5 px-1 ${lightBg ? 'border-slate-200' : 'border-white/10'}`}>
      <button
        onClick={() => onToggle(id)}
        className={`flex items-center justify-between w-full text-[12px] sm:text-[12.5px] font-heading font-extrabold mb-2.5 uppercase tracking-wider cursor-pointer ${
          lightBg ? 'text-slate-900 hover:text-[#00A38D]' : 'text-slate-100 hover:text-[#00C9AF]'
        }`}
      >
        <span>{title}</span>
        <ChevronDown size={16} className={`transition-transform duration-300 ${isOpen ? '' : '-rotate-90'} ${lightBg ? 'text-slate-700' : 'text-slate-300'}`} />
      </button>
      {isOpen && <div className="animate-fadeIn">{children}</div>}
    </div>
  );
};

const SidebarFilters = ({ filters = {}, setFilters, onClose, lightBg = false }) => {
  const [brands, setBrands] = useState([]);
  const [brandSearch, setBrandSearch] = useState('');
  const [maxBudget, setMaxBudget] = useState(filters.budget_max || 35);

  // Single accordion state: opening one tab automatically closes other tabs
  const [activeSection, setActiveSection] = useState(() => {
    if (filters.brands?.length) return 'brand';
    if (filters.body_type?.length) return 'bodyType';
    if (filters.budget || (filters.budget_max && filters.budget_max < 35)) return 'budget';
    if (filters.fuel) return 'fuel';
    if (filters.transmission) return 'transmission';
    if (filters.owners?.length) return 'ownership';
    return 'brand';
  });

  const handleToggleSection = (id) => {
    setActiveSection(prev => (prev === id ? null : id));
  };

  useEffect(() => {
    if (filters.budget_max === 35 || !filters.budget_max) {
      setMaxBudget(35);
    } else {
      setMaxBudget(filters.budget_max);
    }
  }, [filters.budget_max]);

  useEffect(() => {
    fetch(`${API_URL}/api/brands`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setBrands(data);
      })
      .catch(console.error);
  }, []);

  const toggleFilter = (category, value) => {
    if (!setFilters) return;
    setFilters(prev => {
      const current = prev[category] || [];
      const exists = current.some(item => String(item).toLowerCase() === String(value).toLowerCase());
      const updated = exists
        ? current.filter(item => String(item).toLowerCase() !== String(value).toLowerCase())
        : [...current, value];
      return { ...prev, [category]: updated };
    });
  };

  const setSingleFilter = (category, value) => {
    if (!setFilters) return;
    setFilters(prev => ({ ...prev, [category]: value }));
  };

  const handleClear = () => {
    if (setFilters) setFilters({ budget: '', budget_max: 25, certification: 'standard', brands: [], models: [], fuel: '', transmission: '', owners: [], year_min: null, km_max: null, body_type: [] });
  };

  const filteredBrands = brands.filter(b => 
    !brandSearch || (b.name && b.name.toLowerCase().includes(brandSearch.toLowerCase()))
  );

  return (
    <div className={`flex flex-col h-full overflow-hidden rounded-2xl border ${lightBg
      ? 'bg-white border-slate-200 shadow-md'
      : 'bg-[#162947]/30 border-white/[0.08] backdrop-blur-md'
      }`}>
      <div className={`p-4 sm:p-5 border-b flex items-center justify-between bg-transparent ${lightBg ? 'border-slate-200' : 'border-white/10'
        }`}>
        <h2 className={`text-[13.5px] font-heading font-black uppercase tracking-wider ${lightBg ? 'text-[#0C1B33]' : 'text-white'
          }`}>Filters</h2>
        <button onClick={handleClear} className="text-[11.5px] font-heading font-extrabold text-[#00A38D] hover:text-[#00C9AF] hover:underline uppercase tracking-wider cursor-pointer">Clear all</button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 scrollbar-hide pb-8">
        {/* Standard vs Luxury Category Toggle */}
        <div className={`p-1 rounded-xl flex gap-1 mt-4 mb-2 ${lightBg ? 'bg-slate-100' : 'bg-white/5'}`}>
          <button
            onClick={() => setSingleFilter('certification', 'standard')}
            className={`flex-1 py-2 text-[11.5px] font-heading font-bold rounded-lg uppercase tracking-wider transition-all cursor-pointer ${
              filters.certification !== 'luxury'
                ? 'bg-[#00C9AF] text-slate-950 shadow-sm font-black'
                : lightBg
                  ? 'text-slate-600 hover:text-slate-900 font-bold'
                  : 'text-slate-300 hover:text-white font-bold'
            }`}
          >
            Standard
          </button>
          <button
            onClick={() => setSingleFilter('certification', 'luxury')}
            className={`flex-1 py-2 text-[11.5px] font-heading font-bold rounded-lg uppercase tracking-wider transition-all cursor-pointer ${
              filters.certification === 'luxury'
                ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-sm font-black'
                : lightBg
                  ? 'text-slate-600 hover:text-slate-900 font-bold'
                  : 'text-slate-300 hover:text-white font-bold'
            }`}
          >
            Luxury
          </button>
        </div>

        {/* Budget Section */}
        <FilterSection id="budget" activeSection={activeSection} onToggle={handleToggleSection} title="Budget Range" lightBg={lightBg}>
          <div className="flex flex-col gap-3 px-1">
            <div className="flex justify-between text-[14px] sm:text-[15px] font-heading font-black tracking-wide">
              <span className="text-[#00A38D] dark:text-[#00C9AF]">₹0 L</span>
              <span className="text-[#00A38D] dark:text-[#00C9AF]">₹{maxBudget} L{maxBudget >= 35 ? '+' : ''}</span>
            </div>
            <input
              type="range"
              className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-[#00C9AF] ${lightBg ? 'bg-slate-200' : 'bg-white/10'
                }`}
              min="0"
              max="35"
              value={maxBudget}
              onChange={(e) => setMaxBudget(parseInt(e.target.value))}
              onMouseUp={(e) => setSingleFilter('budget_max', parseInt(e.target.value))}
              onTouchEnd={(e) => setSingleFilter('budget_max', parseInt(e.target.value))}
            />
            <div className="grid grid-cols-2 gap-2 mt-1">
              {['Under 10 L', '10 - 20 Lakhs', '20 - 30 Lakhs', '30 Lakhs +'].map((b) => (
                <button
                  key={b}
                  onClick={() => setSingleFilter('budget', filters.budget === b ? '' : b)}
                  className={`text-[12px] py-2.5 px-2 border rounded-xl font-heading font-bold transition-all uppercase tracking-wide text-center cursor-pointer ${filters.budget === b
                    ? 'bg-[#00C9AF] text-slate-950 border-[#00C9AF] font-black shadow-xs'
                    : lightBg
                      ? 'border-slate-300 hover:border-[#00C9AF] hover:text-[#00A38D] bg-slate-50 hover:bg-slate-100 text-slate-800'
                      : 'border-white/15 hover:border-[#00C9AF] hover:text-[#00C9AF] bg-white/5 hover:bg-white/10 text-slate-200'
                    }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>
        </FilterSection>

        {/* Make & Model */}
        <FilterSection id="brand" activeSection={activeSection} onToggle={handleToggleSection} title="Brand & Model" lightBg={lightBg}>
          <div className="relative mb-3">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={brandSearch}
              onChange={(e) => setBrandSearch(e.target.value)}
              placeholder="Search brands..."
              className={`w-full pl-8 pr-3 py-2 border rounded-xl text-[12px] font-heading font-semibold placeholder:font-medium placeholder:text-slate-400 focus:ring-2 focus:ring-[#00C9AF]/20 outline-none tracking-wide ${lightBg
                ? 'bg-slate-100 border-slate-200 text-slate-900 focus:bg-white focus:border-[#00C9AF]'
                : 'bg-white/5 border-white/10 text-white focus:border-[#00C9AF]'
                }`}
            />
          </div>
          <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto scrollbar-thin pr-1">
            {filteredBrands.map(brand => (
              <label key={brand.id || brand.name} className={`flex items-center gap-2.5 cursor-pointer group p-1.5 rounded-lg transition-all ${lightBg ? 'hover:bg-slate-100' : 'hover:bg-white/5'
                }`}>
                <input
                  type="checkbox"
                  checked={filters.brands?.includes(brand.name) || false}
                  onChange={() => toggleFilter('brands', brand.name)}
                  className="w-4 h-4 rounded border-slate-300 text-[#00C9AF] focus:ring-[#00C9AF] accent-[#00C9AF] cursor-pointer"
                />
                <span className={`text-[12.5px] font-heading font-semibold uppercase tracking-wide transition-colors ${lightBg
                  ? 'text-slate-800 group-hover:text-slate-950 font-bold'
                  : 'text-slate-200 group-hover:text-white font-bold'
                  }`}>{brand.name}</span>
              </label>
            ))}
            {filteredBrands.length === 0 && (
              <span className="text-xs text-slate-400 font-medium py-2 text-center block">No brands found</span>
            )}
          </div>
        </FilterSection>

        {/* Body Type */}
        <FilterSection id="bodyType" activeSection={activeSection} onToggle={handleToggleSection} title="Body Type" lightBg={lightBg}>
          <div className="flex flex-wrap gap-2">
            {['Hatchback', 'Sedan', 'SUV', 'Compact SUV', 'MUV', 'EV Car', 'Luxury'].map(bt => {
              const isActive = filters.body_type?.some(x => String(x).toLowerCase() === bt.toLowerCase());
              return (
                <button
                  key={bt}
                  onClick={() => toggleFilter('body_type', bt)}
                  className={`px-3 py-1.5 border rounded-xl text-[11.5px] font-heading font-bold transition-all tracking-wider cursor-pointer ${isActive
                    ? 'bg-[#00C9AF] text-slate-950 border-[#00C9AF] font-black shadow-xs'
                    : lightBg
                      ? 'border-slate-300 text-slate-800 bg-slate-50 hover:bg-slate-100 hover:border-[#00C9AF] hover:text-[#00A38D]'
                      : 'border-white/15 text-slate-200 hover:border-[#00C9AF] hover:text-[#00C9AF] bg-white/5 hover:bg-white/10'
                    }`}
                >
                  {bt}
                </button>
              );
            })}
          </div>
        </FilterSection>

        {/* Fuel Type */}
        <FilterSection id="fuel" activeSection={activeSection} onToggle={handleToggleSection} title="Fuel Type" lightBg={lightBg}>
          <div className="flex flex-wrap gap-2">
            {['PETROL', 'DIESEL', 'CNG', 'PETROL/CNG', 'ELECTRIC', 'HYBRID'].map(fuel => {
              const isActive = filters.fuel?.toLowerCase() === fuel.toLowerCase();
              return (
                <button
                  key={fuel}
                  onClick={() => setSingleFilter('fuel', isActive ? '' : (fuel === 'PETROL/CNG' ? 'Petrol/CNG' : fuel))}
                  className={`px-3.5 py-1.5 border rounded-full text-[11.5px] font-heading font-bold transition-all tracking-wider cursor-pointer ${isActive
                    ? 'bg-[#00C9AF] text-slate-950 border-[#00C9AF] font-black shadow-xs'
                    : lightBg
                      ? 'border-slate-300 text-slate-800 bg-slate-50 hover:bg-slate-100 hover:border-[#00C9AF] hover:text-[#00A38D]'
                      : 'border-white/15 text-slate-200 hover:border-[#00C9AF] hover:text-[#00C9AF] bg-white/5 hover:bg-white/10'
                    }`}
                >
                  {fuel}
                </button>
              );
            })}
          </div>
        </FilterSection>

        {/* Transmission */}
        <FilterSection id="transmission" activeSection={activeSection} onToggle={handleToggleSection} title="Transmission" lightBg={lightBg}>
          <div className="flex gap-2">
            {['MANUAL', 'AUTOMATIC'].map(tr => {
              const isActive = filters.transmission === tr;
              return (
                <button
                  key={tr}
                  onClick={() => setSingleFilter('transmission', isActive ? '' : tr)}
                  className={`flex-1 px-3 py-2 border rounded-xl text-[12px] font-heading font-extrabold transition-all tracking-wider cursor-pointer ${isActive
                    ? 'bg-[#00C9AF] text-slate-950 border-[#00C9AF] font-black shadow-xs'
                    : lightBg
                      ? 'border-slate-300 text-slate-800 bg-slate-50 hover:bg-slate-100 hover:border-[#00C9AF] hover:text-[#00A38D]'
                      : 'border-white/15 text-slate-200 hover:border-[#00C9AF] hover:text-[#00C9AF] bg-white/5 hover:bg-white/10'
                    }`}
                >
                  {tr}
                </button>
              );
            })}
          </div>
        </FilterSection>

        {/* Ownership */}
        <FilterSection id="ownership" activeSection={activeSection} onToggle={handleToggleSection} title="Ownership" lightBg={lightBg}>
          <div className="grid grid-cols-1 gap-1">
            {['1st Owner', '2nd Owner', '3rd Owner'].map(owner => (
              <label key={owner} className={`flex items-center gap-2.5 cursor-pointer p-1.5 rounded-lg transition-all ${lightBg ? 'hover:bg-slate-100' : 'hover:bg-white/5'
                }`}>
                <input
                  type="checkbox"
                  checked={filters.owners?.includes(owner) || false}
                  onChange={() => toggleFilter('owners', owner)}
                  className="w-4 h-4 rounded border-slate-300 text-[#00C9AF] focus:ring-[#00C9AF] accent-[#00C9AF] cursor-pointer"
                />
                <span className={`text-[12.5px] font-heading font-semibold tracking-wide transition-colors ${lightBg
                  ? 'text-slate-800 group-hover:text-slate-950 font-bold'
                  : 'text-slate-200 group-hover:text-white font-bold'
                  }`}>{owner}</span>
              </label>
            ))}
          </div>
        </FilterSection>
      </div>
    </div>
  );
};

export default SidebarFilters;


