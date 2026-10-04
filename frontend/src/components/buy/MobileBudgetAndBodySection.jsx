import React from 'react';
import { ChevronRight } from 'lucide-react';

const BUDGET_OPTIONS = [
  {
    id: 'under_4l',
    label: 'Under ₹4L',
    badge: '₹',
    min: 0,
    max: 4,
    defaultCount: '250+',
    img: '/img/budget/hatchback.webp',
    filterValue: 'Under ₹4L',
  },
  {
    id: '4l_9l',
    label: '₹4L - ₹9L',
    badge: '₹₹',
    min: 4,
    max: 9,
    defaultCount: '470+',
    img: '/img/budget/sedan.webp',
    filterValue: '₹4L - ₹9L',
  },
  {
    id: '9l_15l',
    label: '₹9L - ₹15L',
    badge: '₹₹₹',
    min: 9,
    max: 15,
    defaultCount: '210+',
    img: '/img/budget/suv.webp',
    filterValue: '₹9L - ₹15L',
  },
  {
    id: '15l_plus',
    label: '₹15 Lakhs +',
    badge: '₹₹₹₹',
    min: 15,
    max: null,
    defaultCount: '40+',
    img: '/img/budget/luxury_left.webp?v=3',
    filterValue: '₹15 Lakhs +',
  },
];

const BODY_TYPES = [
  'All',
  'Hatchback',
  'Sedan',
  'SUV',
  'Compact SUV',
  'MUV',
  'Luxury Sedan',
  'Luxury SUV'
];

const MobileBudgetAndBodySection = ({ filters = {}, setFilters, allCars = [] }) => {
  // Real dynamic count calculations with fallback to default UI numbers
  const getCarCount = (opt) => {
    if (!Array.isArray(allCars) || allCars.length === 0) return `${opt.defaultCount} Cars`;
    const count = allCars.filter((car) => {
      const p = (parseInt(car.price, 10) || 0) / 100000;
      if (opt.max === null) return p >= opt.min;
      return p >= opt.min && p <= opt.max;
    }).length;
    return count > 0 ? `${count} Cars` : `${opt.defaultCount} Cars`;
  };

  const isBudgetActive = (opt) => {
    return filters.budget === opt.filterValue;
  };

  const scrollToCars = () => {
    setTimeout(() => {
      const resultsEl = document.getElementById('cars-results-list');
      if (resultsEl) {
        const yOffset = -65;
        const y = resultsEl.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
      }
    }, 60);
  };

  const handleBudgetClick = (opt) => {
    if (isBudgetActive(opt)) {
      // Toggle off
      setFilters((prev) => ({
        ...prev,
        budget: '',
        budget_min: null,
        budget_max: 25,
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        budget: opt.filterValue,
        budget_min: opt.min,
        budget_max: opt.max || null,
      }));
    }
    scrollToCars();
  };

  const handleExploreAll = () => {
    setFilters((prev) => ({
      ...prev,
      budget: '',
      budget_min: null,
      budget_max: 25,
      body_type: [],
    }));
    scrollToCars();
  };

  const isBodyTypeActive = (type) => {
    if (type === 'All') {
      return !filters.body_type || filters.body_type.length === 0;
    }
    return filters.body_type?.some(
      (b) => b.toLowerCase().trim() === type.toLowerCase().trim()
    );
  };

  const handleBodyTypeClick = (type) => {
    if (type === 'All') {
      setFilters((prev) => ({ ...prev, body_type: [] }));
    } else {
      setFilters((prev) => {
        const current = prev.body_type || [];
        const isAlreadySelected = current.some(
          (b) => b.toLowerCase().trim() === type.toLowerCase().trim()
        );

        if (isAlreadySelected) {
          const updated = current.filter(
            (b) => b.toLowerCase().trim() !== type.toLowerCase().trim()
          );
          return { ...prev, body_type: updated };
        } else {
          return { ...prev, body_type: [type] };
        }
      });
    }
    scrollToCars();
  };

  return (
    <div className="block md:hidden mb-5 text-left w-full max-w-full">
      {/* ── Budget Section Heading ── */}
      <h2 className="text-[17px] font-extrabold text-[#0C1B33] tracking-tight mb-3">
        What&apos;s your budget?
      </h2>

      {/* 2x2 Grid with responsive min-w-0 and breathing padding to prevent border cropping */}
      <div className="grid grid-cols-2 gap-2.5 mb-3.5 w-full min-w-0 max-w-full p-0.5">
        {BUDGET_OPTIONS.map((opt) => {
          const active = isBudgetActive(opt);
          return (
            <button
              key={opt.id}
              onClick={() => handleBudgetClick(opt)}
              type="button"
              className={`p-2.5 pt-2.5 pb-0.5 flex flex-col justify-between h-[116px] sm:h-[122px] rounded-2xl relative overflow-hidden text-left transition-all cursor-pointer w-full min-w-0 ${
                active
                  ? 'bg-gradient-to-b from-[#d9fffe] to-[#cbfcf7] ring-2 ring-inset ring-[#00C9AF] border border-[#00C9AF] shadow-md'
                  : 'bg-gradient-to-b from-[#d9fffea8] to-[#edfbf9] border border-slate-200/80 hover:border-[#00C9AF]/40 hover:shadow-xs active:scale-[0.98]'
              }`}
            >
              {/* Header info */}
              <div className="flex items-start justify-between w-full min-w-0 z-10 relative">
                <div className="min-w-0 pr-1">
                  <div
                    style={{ fontWeight: 500, fontFamily: 'Inter, sans-serif' }}
                    className="font-['Inter',sans-serif] text-[15px] sm:text-[15.5px] text-[#0C1B33] leading-tight tracking-normal truncate"
                  >
                    {opt.label}
                  </div>
                  <div
                    style={{ fontWeight: 500, fontFamily: 'Inter, sans-serif' }}
                    className="font-['Inter',sans-serif] text-[11.5px] text-slate-500 mt-0.5 tracking-normal"
                  >
                    {getCarCount(opt)}
                  </div>
                </div>

                {/* Badge: Selectt Teal Brand Color */}
                <div
                  style={{ fontWeight: 600 }}
                  className="shrink-0 bg-[#00C9AF] text-[#0C1B33] rounded-full flex items-center justify-center font-semibold px-1.5 py-0.5 min-w-[22px] h-[22px] text-[11.5px] leading-none shadow-xs"
                >
                  {opt.badge}
                </div>
              </div>

              {/* Large Car 3D Graphic */}
              <div className="w-full flex justify-end items-end relative -mb-0.5 -mr-1 h-[68px] sm:h-[72px]">
                <img
                  src={opt.img}
                  alt={opt.label}
                  className="h-full w-auto max-w-[96%] object-contain filter drop-shadow-[0_6px_12px_rgba(12,27,51,0.14)] pointer-events-none"
                  loading="lazy"
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Explore All Cars Button (Selectt Navy + Teal Brand Combo) ── */}
      <button
        onClick={handleExploreAll}
        type="button"
        className="w-full py-2.5 px-4 rounded-xl border-2 border-[#0C1B33] text-[#0C1B33] bg-white hover:bg-[#0C1B33] hover:text-white active:scale-[0.99] font-extrabold text-[13.5px] flex items-center justify-center gap-1.5 transition-all mb-5 cursor-pointer shadow-xs group"
      >
        <span>Explore All Cars</span>
        <ChevronRight size={16} strokeWidth={2.5} className="text-[#00C9AF] group-hover:translate-x-0.5 transition-transform" />
      </button>

      {/* ── Explore Models via Body Type ── */}
      <div className="mb-2 w-full max-w-full overflow-hidden">
        <h3 className="text-[14.5px] font-extrabold text-[#0C1B33] mb-2.5">
          Explore models via body type
        </h3>

        {/* Horizontal scroll without breaking viewport width */}
        <div className="w-full max-w-full overflow-x-auto pb-1.5 scrollbar-none overscroll-x-contain -mx-1 px-1">
          <div className="flex items-center gap-2 w-max pr-3">
            {BODY_TYPES.map((bt) => {
              const active = isBodyTypeActive(bt);
              return (
                <button
                  key={bt}
                  onClick={() => handleBodyTypeClick(bt)}
                  type="button"
                  className={`rounded-full text-[13px] px-4 py-1.5 whitespace-nowrap transition-all cursor-pointer ${
                    active
                      ? 'bg-[#0C1B33] text-[#00C9AF] border border-[#0C1B33] font-black shadow-xs ring-1 ring-[#00C9AF]/30'
                      : 'bg-white text-slate-700 border border-slate-200 hover:border-[#00C9AF] font-bold hover:text-[#0C1B33]'
                  }`}
                >
                  {bt}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileBudgetAndBodySection;
