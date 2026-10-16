import React, { useState } from 'react';
import { Gauge, ArrowUpDown, Briefcase, Cpu, ShieldCheck } from 'lucide-react';
import SpecificationsDrawer from './SpecificationsDrawer';

const CarSpecifications = ({ specifications, car = {}, theme = 'dark', onBookNow, onTestDrive }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const getIcon = (label = '', iconName = '') => {
    const text = `${label} ${iconName}`.toLowerCase();
    const className = `${theme === 'light' ? 'text-[#0C1B33]' : 'text-white'} shrink-0`;

    if (text.includes('mileage') || text.includes('gauge') || text.includes('fuel') || text.includes('kmpl')) {
      return <Gauge className={className} size={18} strokeWidth={1.6} />;
    }
    if (text.includes('ground') || text.includes('clearance') || text.includes('arrow')) {
      return <ArrowUpDown className={className} size={18} strokeWidth={1.6} />;
    }
    if (text.includes('boot') || text.includes('space') || text.includes('briefcase')) {
      return <Briefcase className={className} size={18} strokeWidth={1.6} />;
    }
    if (text.includes('engine') || text.includes('capacity') || text.includes('displacement') || text.includes('cpu') || text.includes('cc')) {
      return <Cpu className={className} size={18} strokeWidth={1.6} />;
    }
    if (text.includes('warranty') || text.includes('shield')) {
      return <ShieldCheck className={className} size={18} strokeWidth={1.6} />;
    }
    return <Gauge className={className} size={18} strokeWidth={1.6} />;
  };

  // Build specifications list:
  // 1. If admin added custom specifications in car.specifications (or specifications prop), use them
  // 2. Otherwise derive 4 key specs from car object, and show 'N/A' if not entered by admin
  const getDisplaySpecs = () => {
    if (Array.isArray(specifications) && specifications.length > 0) {
      return specifications.map(s => ({
        label: s.label || s.name || '',
        value: (s.value && String(s.value).trim()) ? s.value : 'N/A',
        icon: s.icon || 'Gauge'
      }));
    }

    // Helper to find in car.specifications if passed inside car object
    const findInCarSpecs = (term) => {
      if (Array.isArray(car?.specifications)) {
        const found = car.specifications.find(s => (s.label || '').toLowerCase().includes(term));
        if (found && found.value && String(found.value).trim()) return found.value;
      }
      return null;
    };

    const mileageVal = findInCarSpecs('mileage') || car?.mileage || car?.fuel_economy || 'N/A';

    let engineVal = findInCarSpecs('engine') || car?.engineCapacity || car?.engine_capacity;
    if (engineVal && String(engineVal).trim()) {
      engineVal = String(engineVal).toLowerCase().includes('cc') ? String(engineVal) : `${engineVal} cc`;
    } else {
      engineVal = 'N/A';
    }

    const groundClearanceVal = findInCarSpecs('ground') || car?.groundClearance || car?.ground_clearance || 'N/A';
    const bootSpaceVal = findInCarSpecs('boot') || car?.bootSpace || car?.boot_space || 'N/A';

    return [
      { label: 'Mileage (ARAI)', value: mileageVal, icon: 'Gauge' },
      { label: 'Engine Capacity', value: engineVal, icon: 'Cpu' },
      { label: 'Ground clearance', value: groundClearanceVal, icon: 'ArrowUpDown' },
      { label: 'Boot space', value: bootSpaceVal, icon: 'Briefcase' }
    ];
  };

  const displaySpecs = getDisplaySpecs();

  const containerClasses = theme === 'light'
    ? 'border border-slate-200/90 rounded-2xl p-4 sm:p-5 md:p-6 relative overflow-hidden bg-white shadow-xs'
    : 'border border-slate-800 rounded-2xl p-4 sm:p-5 md:p-6 relative overflow-hidden bg-[#0C1B33]';

  const labelClasses = theme === 'light'
    ? 'text-[11px] sm:text-xs font-sans font-medium text-slate-500 mb-0.5'
    : 'text-[11px] sm:text-xs font-sans font-medium text-slate-400 mb-0.5';

  const valueClasses = theme === 'light'
    ? 'text-xs sm:text-sm font-sans font-bold text-slate-900 leading-snug break-words'
    : 'text-xs sm:text-sm font-sans font-bold text-white leading-snug break-words';

  return (
    <div className="mb-6">
      <h2 className="text-lg md:text-xl font-sans font-bold text-[#0C1B33] mb-3">Specifications</h2>

      <div className={containerClasses}>
        {/* Subtle background glow - only on dark theme */}
        {theme === 'dark' && (
          <div className="bg-[#000] rounded-full blur-3xl pointer-events-none absolute -left-20 -top-20 w-40 h-40 opacity-20" />
        )}

        {/* 2 values in 1 row on mobile (grid-cols-2) and 2 to 4 on larger screens */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-4 sm:gap-y-5 relative z-10">
          {displaySpecs.map((spec, idx) => (
            <div key={idx} className="flex items-start gap-2.5 sm:gap-3">
              <div className="shrink-0 mt-0.5">
                {getIcon(spec.label, spec.icon)}
              </div>
              <div className="min-w-0 flex-1">
                <div className={labelClasses}>{spec.label}</div>
                <div className={valueClasses}>{spec.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* View all Specifications Button */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex justify-start">
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="w-full sm:w-auto px-5 py-2.5 bg-white border border-[#00C9AF] text-[#007A68] hover:bg-[#00C9AF] hover:text-[#0C1B33] rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-xs active:scale-95 flex items-center justify-center gap-2"
          >
            <span>View all Specifications</span>
          </button>
        </div>
      </div>

      {/* Specifications Slide-over Drawer */}
      <SpecificationsDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        car={car}
        specifications={displaySpecs}
        onBookNow={onBookNow}
        onTestDrive={onTestDrive}
      />
    </div>
  );
};

export default CarSpecifications;
