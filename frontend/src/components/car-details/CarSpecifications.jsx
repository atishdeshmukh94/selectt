import React from 'react';
import { Gauge, ArrowUpDown, Briefcase, Cpu } from 'lucide-react';

const CarSpecifications = ({ specifications, theme = 'dark' }) => {
  const getIcon = (iconName) => {
    const className = `${theme === 'light' ? 'text-[#0C1B33]' : 'text-[#fff]'} mt-1`;
    switch (iconName) {
      case 'Mileage':
      case 'Gauge':
        return <Gauge className={className} size={20} strokeWidth={1.5} />;
      case 'Ground clearance':
      case 'ArrowUpDown':
        return <ArrowUpDown className={className} size={20} strokeWidth={1.5} />;
      case 'Boot space':
      case 'Briefcase':
        return <Briefcase className={className} size={20} strokeWidth={1.5} />;
      case 'Displacement':
      case 'Cpu':
        return <Cpu className={className} size={20} strokeWidth={1.5} />;
      default:
        return <Gauge className={className} size={20} strokeWidth={1.5} />;
    }
  };

  const defaultSpecs = [
    { label: 'Mileage (ARAI)', value: '18.4 kmpl', icon: 'Gauge' },
    { label: 'Ground clearance', value: '165 mm', icon: 'ArrowUpDown' },
    { label: 'Boot space', value: '506 litres', icon: 'Briefcase' },
    { label: 'Displacement', value: '1498 cc', icon: 'Cpu' }
  ];

  const displaySpecs = (specifications && specifications.length > 0) ? specifications : defaultSpecs;

  // Split specs into groups for the UI layout
  const topSpecs = displaySpecs.slice(0, 3);
  const bottomSpec = displaySpecs[3];

  const containerClasses = theme === 'light'
    ? 'border border-slate-200 rounded-2xl p-5 md:p-6 relative overflow-hidden bg-white shadow-sm'
    : 'border border-slate-800 rounded-2xl p-5 md:p-6 relative overflow-hidden bg-[#0C1B33]';

  const dividerClasses = theme === 'light'
    ? 'grid grid-cols-1 md:grid-cols-3 gap-y-5 gap-x-5 pb-5 border-b border-slate-100 relative z-10'
    : 'grid grid-cols-1 md:grid-cols-3 gap-y-5 gap-x-5 pb-5 border-b border-slate-700 relative z-10';

  const labelClasses = theme === 'light' ? 'text-xs font-sans font-medium text-slate-500 mb-0.5' : 'text-xs font-sans font-medium text-slate-400 mb-0.5';
  const valueClasses = theme === 'light' ? 'text-sm font-sans font-bold text-slate-900' : 'text-sm font-sans font-bold text-white';

  return (
    <div className="mb-6">
      <h2 className="text-lg md:text-xl font-sans font-bold text-[#0C1B33] mb-3">Specifications</h2>

      <div className={containerClasses}>
        {/* Subtle background glow left - only on dark theme for aesthetic */}
        {theme === 'dark' && (
          <div className="bg-[#000] rounded-full blur-3xl pointer-events-none absolute -left-20 -top-20 w-40 h-40 opacity-20" />
        )}

        <div className={dividerClasses}>
          {topSpecs.map((spec, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <div className="shrink-0">
                {getIcon(spec.label) || getIcon(spec.icon)}
              </div>
              <div>
                <div className={labelClasses}>{spec.label}</div>
                <div className={valueClasses}>{spec.value}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between pt-5 relative z-10 gap-4">
          {bottomSpec && (
            <div className="flex items-start gap-3">
              <div className="shrink-0">
                {getIcon(bottomSpec.label) || getIcon(bottomSpec.icon)}
              </div>
              <div>
                <div className={labelClasses}>{bottomSpec.label}</div>
                <div className={valueClasses}>{bottomSpec.value}</div>
              </div>
            </div>
          )}

          <button className="w-full md:w-auto px-5 py-2.5 bg-[#00C9AF] text-[#0A1C3A] hover:bg-[#00B49F] rounded-xl font-sans font-bold text-[11px] uppercase tracking-wider cursor-pointer transition-all shadow-xs focus:ring-2 focus:ring-[#00C9AF]/30 outline-none">
            VIEW ALL SPECIFICATIONS
          </button>
        </div>

      </div>
    </div>
  );
};
export default CarSpecifications;
