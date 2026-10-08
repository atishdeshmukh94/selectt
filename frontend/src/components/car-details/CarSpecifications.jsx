import React from 'react';
import { Gauge, ArrowUpDown, Briefcase, Cpu, ShieldCheck } from 'lucide-react';

const CarSpecifications = ({ specifications, theme = 'dark' }) => {
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

  const defaultSpecs = [
    { label: 'Mileage (ARAI)', value: '18.4 kmpl', icon: 'Gauge' },
    { label: 'Engine Capacity', value: '1498 cc', icon: 'Cpu' },
    { label: 'Ground clearance', value: '165 mm', icon: 'ArrowUpDown' },
    { label: 'Boot space', value: '506 litres', icon: 'Briefcase' }
  ];

  const displaySpecs = (specifications && specifications.length > 0) ? specifications : defaultSpecs;

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
      </div>
    </div>
  );
};

export default CarSpecifications;
