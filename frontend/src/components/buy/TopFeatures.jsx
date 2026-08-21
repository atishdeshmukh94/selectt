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
    ? 'text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]'
    : 'text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]';

  const featureIconClasses = theme === 'light'
    ? 'w-[18px] h-[18px] rounded-full bg-white flex items-center justify-center text-[#00C9AF] shadow-sm shrink-0 border border-slate-200 group-hover:bg-[#00C9AF] group-hover:text-[#0A1C3A] transition-colors duration-300'
    : 'w-[18px] h-[18px] rounded-full bg-[#0C1B33] flex items-center justify-center text-[#00C9AF] shadow-sm shrink-0 border border-slate-800 group-hover:bg-[#00C9AF] group-hover:text-[#0A1C3A] transition-colors duration-300';

  const featureTextClasses = theme === 'light'
    ? 'text-xs md:text-sm font-book text-[#0C1B33]'
    : 'text-xs md:text-sm font-book text-slate-200';

  return (
    <div className={outerContainerClasses}>
      <h2 className={headingClasses}>Top Features of This Car</h2>

      <div className={innerContainerClasses}>
        {/* Decorative background */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#00C9AF]/5 rounded-full -mr-16 -mt-16 blur-xl" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 relative">
          {displaySections.map((section, idx) => (
            <div key={idx} className="space-y-3 md:space-y-4">
              <h3 className={groupTitleClasses}>
                {section.title}
              </h3>
              <div className="space-y-2 md:space-y-3">
                {section.features.map((featureName, fIdx) => (
                  <div key={fIdx} className="flex items-center gap-2.5 group">
                    <div className={featureIconClasses}>
                      <Check size={10} strokeWidth={3.5} />
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
          <button className="w-full sm:w-auto px-6 py-2.5 bg-[#00C9AF] text-black rounded-2xl font-bold text-[10px] md:text-[11px] uppercase tracking-widest cursor-pointer hover:text-white hover:bg-black  transition-all shadow-sm focus:ring-2 focus:ring-[#0C1B33]/20 outline-none">
            View all features
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopFeatures;
