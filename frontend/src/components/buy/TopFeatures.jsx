import React from 'react';
import { Check, Info } from 'lucide-react';

const TopFeatures = ({ features, theme = 'dark' }) => {
  const defaultSections = [
    {
      title: 'COMFORT & CONVENIENCE',
      features: [
        'Adjustable cluster brightness',
        'Adjustable ORVM',
        'Power windows',
        'Power steering'
      ]
    },
    {
      title: 'SAFETY',
      features: [
        'Engine immobilizer',
        'Central locking'
      ]
    },
    {
      title: 'EXTERIOR',
      features: [
        'Rear power window'
      ]
    }
  ];

  let displaySections = defaultSections;

  if (features && typeof features === 'object' && Object.keys(features).length > 0) {
    displaySections = Object.entries(features).map(([title, items]) => ({
      title: title.toUpperCase(),
      features: Array.isArray(items) ? items : []
    })).filter(s => s.features.length > 0);
  }

  // If no features found in the object, use defaults
  if (displaySections.length === 0) displaySections = defaultSections;

  const outerContainerClasses = theme === 'light'
    ? 'bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-slate-200 mb-6 overflow-hidden'
    : 'bg-[#0C1B33] rounded-2xl p-5 md:p-6 shadow-2xl border border-slate-800 mb-6 overflow-hidden';

  const headingClasses = theme === 'light'
    ? 'text-lg md:text-xl font-bold text-[#0C1B33] mb-4 md:mb-5'
    : 'text-lg md:text-xl font-bold text-white mb-4 md:mb-5';

  const innerContainerClasses = theme === 'light'
    ? 'bg-slate-50 rounded-2xl md:rounded-[1.5rem] border border-slate-100/80 p-4 md:p-6 relative overflow-hidden'
    : 'bg-white/5 rounded-2xl md:rounded-[1.5rem] border border-white/5 p-4 md:p-6 relative overflow-hidden';

  const groupTitleClasses = theme === 'light'
    ? 'text-[11px] md:text-[12.5px] font-extrabold text-slate-500 uppercase tracking-[0.18em]'
    : 'text-[11px] md:text-[12.5px] font-extrabold text-slate-400 uppercase tracking-[0.18em]';

  const featureIconClasses = theme === 'light'
    ? 'w-5 h-5 rounded-full bg-white flex items-center justify-center text-[#00C9AF] shadow-xs shrink-0 border border-slate-200/90 group-hover:bg-[#00C9AF] group-hover:text-[#0A1C3A] transition-colors duration-300'
    : 'w-5 h-5 rounded-full bg-[#0C1B33] flex items-center justify-center text-[#00C9AF] shadow-xs shrink-0 border border-slate-800 group-hover:bg-[#00C9AF] group-hover:text-[#0A1C3A] transition-colors duration-300';

  const featureTextClasses = theme === 'light'
    ? 'text-[13px] md:text-[13px] font-semibold text-[#0C1B33] leading-snug'
    : 'text-[13px] md:text-[13px] font-semibold text-slate-100 leading-snug';

  return (
    <div className={outerContainerClasses}>
      <h2 className={headingClasses}>Top Features of This Car</h2>

      <div className={innerContainerClasses}>
        {/* Decorative background */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#00C9AF]/5 rounded-full -mr-16 -mt-16 blur-xl" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-8 relative">
          {displaySections.map((section, idx) => (
            <div key={idx} className="space-y-3 md:space-y-4">
              <h3 className={groupTitleClasses}>
                {section.title}
              </h3>
              <div className="space-y-2.5 md:space-y-3.5">
                {section.features.map((featureName, fIdx) => (
                  <div key={fIdx} className="flex items-center gap-2.5 md:gap-3 group">
                    <div className={featureIconClasses}>
                      <Check size={11} strokeWidth={3} className="md:w-3.5 md:h-3.5" />
                    </div>
                    <span className={featureTextClasses}>
                      {featureName}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="flex justify-start mt-6 md:mt-8 relative">
          <button className="w-full sm:w-auto px-6 py-3 bg-[#00C9AF] text-[#0C1B33] rounded-xl font-black text-xs uppercase tracking-wider cursor-pointer hover:bg-[#00B4A0] transition-all shadow-md shadow-[#00C9AF]/20 focus:ring-2 focus:ring-[#0C1B33]/20 outline-none active:scale-95">
            View all features
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopFeatures;
