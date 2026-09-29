import React from 'react';

const SectionDivider = ({ 
  title, 
  align = 'center', 
  bgClass = 'bg-white dark:bg-slate-900',
  textClass = 'text-[#0C1B33] dark:text-white',
  pyClass
}) => {
  const padding = pyClass !== undefined ? pyClass : "pt-6 pb-2 md:pt-8 md:pb-2";
  return (
    <div className={`px-4 ${padding} ${bgClass}`}>
      <div className="flex items-center gap-4 md:gap-6 max-w-7xl mx-auto">
        {align === 'center' && (
          <div className="flex-1 h-px bg-slate-200/50 dark:bg-slate-700/40"></div>
        )}
        <h2 className={`text-[19px] md:text-2xl font-bold whitespace-nowrap ${textClass}`}>
          {title}
        </h2>
        <div className="flex-1 h-px bg-slate-200/50 dark:bg-slate-700/40"></div>
      </div>
    </div>
  );
};

export default SectionDivider;
