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
    img: '/img/budget/luxury.webp',
    filterValue: '₹15 Lakhs +',
  },
];

const BODY_TYPES = ['All', 'Hatchback', 'Sedan', 'SUV', 'MUV'];

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
  };

  const handleExploreAll = () => {
    setFilters((prev) => ({
      ...prev,
      budget: '',
      budget_min: null,
      budget_max: 25,
      body_type: [],
    }));

    // Smooth scroll down slightly to results if needed
    const resultsEl = document.getElementById('cars-results-list');
    if (resultsEl) {
      resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const isBodyTypeActive = (type) => {
    if (type === 'All') {
      return !filters.body_type || filters.body_type.length === 0;
    }
    return filters.body_type?.some(
      (b) => b.toLowerCase() === type.toLowerCase() || (type === 'SUV' && b.toLowerCase().includes('suv'))
    );
  };

  const handleBodyTypeClick = (type) => {
    if (type === 'All') {
      setFilters((prev) => ({ ...prev, body_type: [] }));
      return;
    }

    setFilters((prev) => {
      const current = prev.body_type || [];
      const isAlreadySelected = current.some(
        (b) => b.toLowerCase() === type.toLowerCase() || (type === 'SUV' && b.toLowerCase().includes('suv'))
      );

      if (isAlreadySelected) {
        // Remove
        const updated = current.filter(
          (b) => b.toLowerCase() !== type.toLowerCase() && !(type === 'SUV' && b.toLowerCase().includes('suv'))
        );
        return { ...prev, body_type: updated };
      } else {
        // Exclusively select this body type for quick mobile browsing
        return { ...prev, body_type: [type] };
      }
    });
  };

  return (
    <div className="block md:hidden mb-4 text-left">
      {/* ── Budget Section ── */}
      <h2 className="text-[17px] font-bold text-slate-800 tracking-tight mb-3">
        What&apos;s your budget?
      </h2>

      {/* 2x2 Grid */}
      <div className="grid grid-cols-2 gap-2.5 mb-3.5">
        {BUDGET_OPTIONS.map((opt) => {
          const active = isBudgetActive(opt);
          return (
            <button
              key={opt.id}
              onClick={() => handleBudgetClick(opt)}
              type="button"
              className={`p-3 pt-3 pb-1 flex flex-col justify-between h-[122px] rounded-2xl relative overflow-hidden text-left transition-all cursor-pointer ${
                active
                  ? 'bg-gradient-to-b from-[#E7DCFD] to-[#D8C7FB] ring-2 ring-[#6B21A8] shadow-md'
                  : 'bg-gradient-to-b from-[#F2EDFE] to-[#E9E1FC] hover:shadow-xs active:scale-[0.98]'
              }`}
            >
              {/* Header info */}
              <div className="flex items-start justify-between w-full">
                <div>
                  <div className="text-[14px] font-extrabold text-[#111827] leading-tight">
                    {opt.label}
                  </div>
                  <div className="text-[11px] font-medium text-slate-500 mt-0.5">
                    {getCarCount(opt)}
                  </div>
                </div>

                {/* Badge */}
                <div className="shrink-0 bg-[#00D09C] text-white rounded-full flex items-center justify-center font-bold px-1.5 py-0.5 min-w-[22px] h-[22px] text-[11px] leading-none shadow-xs">
                  {opt.badge}
                </div>
              </div>

              {/* Car 3D Graphic */}
              <div className="w-full flex justify-end items-end -mb-0.5">
                <img
                  src={opt.img}
                  alt={opt.label}
                  className="h-[62px] w-auto max-w-[85%] object-contain filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.08)] pointer-events-none"
                  loading="lazy"
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Explore All Cars Button ── */}
      <button
        onClick={handleExploreAll}
        type="button"
        className="w-full py-2.5 px-4 rounded-xl border border-[#6B21A8] text-[#6B21A8] hover:bg-[#6B21A8]/5 active:bg-[#6B21A8]/10 font-bold text-[13.5px] flex items-center justify-center gap-1 transition-all mb-5 cursor-pointer shadow-2xs"
      >
        <span>Explore All Cars</span>
        <ChevronRight size={16} strokeWidth={2.5} />
      </button>

      {/* ── Explore Models via Body Type ── */}
      <div className="mb-2">
        <h3 className="text-[14.5px] font-bold text-[#334155] mb-2.5">
          Explore models via body type
        </h3>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
          {BODY_TYPES.map((bt) => {
            const active = isBodyTypeActive(bt);
            return (
              <button
                key={bt}
                onClick={() => handleBodyTypeClick(bt)}
                type="button"
                className={`rounded-full text-[13px] font-medium px-4 py-1.5 whitespace-nowrap transition-all cursor-pointer ${
                  active
                    ? 'bg-[#5B108C] text-white font-bold shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
                }`}
              >
                {bt}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MobileBudgetAndBodySection;
