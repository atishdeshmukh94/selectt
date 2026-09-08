import React, { useState, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { API_URL } from '../../config/api';

const FilterSection = ({ title, children, defaultOpen = false, lightBg = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className={`border-b py-4 px-1 ${lightBg ? 'border-slate-200' : 'border-white/10'}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full text-[10px] font-bold mb-3 uppercase tracking-wider ${lightBg ? 'text-slate-700' : 'text-slate-250'
          }`}
      >
        <span>{title}</span>
        <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? '' : '-rotate-90'}`} />
      </button>
      {isOpen && <div className="animate-fadeIn">{children}</div>}
    </div>
  );
};

const SidebarFilters = ({ filters = {}, setFilters, onClose, lightBg = false }) => {
  const [brands, setBrands] = useState([]);
  const [maxBudget, setMaxBudget] = useState(25);

  useEffect(() => {
    if (filters.budget_max === 25 || !filters.budget_max) {
      setMaxBudget(25);
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
      const updated = current.includes(value)
        ? current.filter(item => item !== value)
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

  return (
    <div className={`flex flex-col h-full overflow-hidden rounded-2xl border ${lightBg
      ? 'bg-white border-slate-200 shadow-md'
      : 'bg-[#162947]/30 border-white/[0.08] backdrop-blur-md'
      }`}>
      <div className={`p-5 border-b flex items-center justify-between bg-transparent ${lightBg ? 'border-slate-200' : 'border-white/10'
        }`}>
        <h2 className={`text-xs font-bold uppercase tracking-wider ${lightBg ? 'text-[#0C1B33]' : 'text-white'
          }`}>Filters</h2>
        <button onClick={handleClear} className="text-[10px] font-bold text-[#00C9AF] hover:underline uppercase tracking-wider">Clear all</button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 scrollbar-hide pb-8">
        {/* Standard vs Luxury Category Toggle */}
        <div className={`p-1 rounded-xl flex gap-1 mt-4 mb-2 ${lightBg ? 'bg-slate-100' : 'bg-white/5'}`}>
          <button
            onClick={() => setSingleFilter('certification', 'standard')}
            className={`flex-1 py-2 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all cursor-pointer ${
              filters.certification !== 'luxury'
                ? 'bg-[#00C9AF] text-[#0C1B33] shadow-sm font-black'
                : lightBg
                  ? 'text-slate-500 hover:text-slate-800'
                  : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Standard
          </button>
          <button
            onClick={() => setSingleFilter('certification', 'luxury')}
            className={`flex-1 py-2 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all cursor-pointer ${
              filters.certification === 'luxury'
                ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-sm font-black'
                : lightBg
                  ? 'text-slate-500 hover:text-slate-800'
                  : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            👑 Luxury
          </button>
        </div>

        {/* Budget Section */}
        <FilterSection title="Budget Range" defaultOpen={true} lightBg={lightBg}>
          <div className="flex flex-col gap-3 px-1">
            <div className="flex justify-between text-[15px] font-bold uppercase tracking-wider">
              <span className="text-[#00C9AF]">₹0 L</span>
              <span className="text-[#00C9AF]">₹{maxBudget} L{maxBudget == 25 ? '+' : ''}</span>
            </div>
            <input
              type="range"
              className={`w-full h-1 rounded-lg appearance-none cursor-pointer accent-[#00C9AF] ${lightBg ? 'bg-slate-200' : 'bg-white/10'
                }`}
              min="0"
              max="25"
              value={maxBudget}
              onChange={(e) => setMaxBudget(parseInt(e.target.value))}
              onMouseUp={(e) => setSingleFilter('budget_max', parseInt(e.target.value))}
              onTouchEnd={(e) => setSingleFilter('budget_max', parseInt(e.target.value))}
            />
            <div className="grid grid-cols-4 gap-1 sm:gap-1.5 mt-1">
              {['Under 3 L', '3 - 6 L', '6 - 10 L', '10 L +'].map((b) => (
                <button
                  key={b}
                  onClick={() => setSingleFilter('budget', filters.budget === b ? '' : b)}
                  className={`text-[9px] xs:text-[10px] sm:text-[11px] py-2 px-1 border rounded-lg font-bold transition-all uppercase tracking-tight text-center whitespace-nowrap overflow-hidden text-ellipsis ${filters.budget === b
                    ? 'bg-[#00C9AF] text-[#0C1B33] border-[#00C9AF]'
                    : lightBg
                      ? 'border-slate-200 hover:border-[#00C9AF] hover:text-[#00C9AF] bg-slate-50 hover:bg-slate-100 text-slate-700'
                      : 'border-white/10 hover:border-[#00C9AF] hover:text-[#00C9AF] bg-white/5 hover:bg-white/10 text-slate-300'
                    }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>
        </FilterSection>

        {/* Make & Model */}
        <FilterSection title="Brand & Model" defaultOpen={true} lightBg={lightBg}>
          <div className="relative mb-3">
            <Search size={12} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="SEARCH BRANDS..."
              className={`w-full pl-9 pr-4 py-2.5 border-none rounded-xl text-[10px] font-bold focus:ring-2 focus:ring-[#00C9AF]/10 outline-none uppercase tracking-wider ${lightBg
                ? 'bg-slate-100 text-slate-800 focus:bg-slate-50'
                : 'bg-white/5 text-white'
                }`}
            />
          </div>
          <div className="flex flex-col gap-2 max-h-48 overflow-y-auto scrollbar-thin pr-2">
            {brands.map(brand => (
              <label key={brand.id} className={`flex items-center gap-2.5 cursor-pointer group p-1.5 rounded-lg transition-all ${lightBg ? 'hover:bg-slate-100' : 'hover:bg-white/5'
                }`}>
                <input
                  type="checkbox"
                  checked={filters.brands?.includes(brand.name) || false}
                  onChange={() => toggleFilter('brands', brand.name)}
                  className="w-4 h-4 rounded border-white/20 text-[#00C9AF] focus:ring-[#00C9AF] accent-[#00C9AF]"
                />
                <span className={`text-[10px] font-semibold uppercase tracking-wide transition-colors ${lightBg
                  ? 'text-slate-600 group-hover:text-slate-900'
                  : 'text-slate-400 group-hover:text-white'
                  }`}>{brand.name}</span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Fuel Type */}
        <FilterSection title="Fuel Type" defaultOpen={Boolean(filters.fuel)} lightBg={lightBg}>
          <div className="flex flex-wrap gap-2">
            {['PETROL', 'DIESEL', 'CNG', 'ELECTRIC', 'HYBRID'].map(fuel => {
              const isActive = filters.fuel === fuel;
              return (
                <button
                  key={fuel}
                  onClick={() => setSingleFilter('fuel', isActive ? '' : fuel)}
                  className={`px-4 py-2 border rounded-full text-[10px] font-bold transition-all tracking-wider ${isActive
                    ? 'bg-[#00C9AF] text-[#0C1B33] border-[#00C9AF]'
                    : lightBg
                      ? 'border-slate-200 text-slate-600 bg-slate-50 hover:bg-slate-100 hover:border-[#00C9AF] hover:text-[#00C9AF]'
                      : 'border-white/10 text-slate-300 hover:border-[#00C9AF] hover:text-[#00C9AF] bg-white/5 hover:bg-white/10'
                    }`}
                >
                  {fuel}
                </button>
              );
            })}
          </div>
        </FilterSection>

        {/* Transmission */}
        <FilterSection title="Transmission" defaultOpen={Boolean(filters.transmission)} lightBg={lightBg}>
          <div className="flex gap-2">
            {['MANUAL', 'AUTOMATIC'].map(tr => {
              const isActive = filters.transmission === tr;
              return (
                <button
                  key={tr}
                  onClick={() => setSingleFilter('transmission', isActive ? '' : tr)}
                  className={`flex-1 px-2 py-2.5 border rounded-xl text-xs font-black transition-all tracking-wider ${isActive
                    ? 'bg-[#00C9AF] text-[#0C1B33] border-[#00C9AF]'
                    : lightBg
                      ? 'border-slate-200 text-slate-600 bg-slate-50 hover:bg-slate-100 hover:border-[#00C9AF] hover:text-[#00C9AF]'
                      : 'border-white/10 text-slate-300 hover:border-[#00C9AF] hover:text-[#00C9AF] bg-white/5 hover:bg-white/10'
                    }`}
                >
                  {tr}
                </button>
              );
            })}
          </div>
        </FilterSection>

        {/* Ownership */}
        <FilterSection title="Ownership" defaultOpen={Boolean(filters.owners?.length)} lightBg={lightBg}>
          <div className="grid grid-cols-1 gap-1.5">
            {['1st Owner', '2nd Owner', '3rd Owner'].map(owner => (
              <label key={owner} className={`flex items-center gap-2.5 cursor-pointer p-1.5 rounded-lg transition-all ${lightBg ? 'hover:bg-slate-100' : 'hover:bg-white/5'
                }`}>
                <input
                  type="checkbox"
                  checked={filters.owners?.includes(owner) || false}
                  onChange={() => toggleFilter('owners', owner)}
                  className="w-4 h-4 border-white/20 text-[#00C9AF] focus:ring-[#00C9AF] accent-[#00C9AF]"
                />
                <span className={`text-[10px] font-semibold uppercase tracking-wide transition-colors ${lightBg
                  ? 'text-slate-600 group-hover:text-slate-900'
                  : 'text-slate-400 group-hover:text-white'
                  }`}>{owner}</span>
              </label>
            ))}
          </div>
        </FilterSection>
      </div>

      <div className={`p-5 md:hidden border-t ${lightBg ? 'bg-[#f9f9f9] border-slate-200' : 'bg-[#0C1B33] border-white/10'
        }`}>
        <button onClick={onClose} className="w-full bg-[#00C9AF] hover:bg-[#00B4A0] text-[#0C1B33] py-3.5 rounded-xl font-bold shadow-lg uppercase tracking-wider text-xs">View Results</button>
      </div>
    </div>
  );
};

export default SidebarFilters;
