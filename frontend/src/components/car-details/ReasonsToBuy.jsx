import { Diamond, Shield, Battery, History } from 'lucide-react';

const ReasonsToBuy = ({ reasons, theme = 'dark' }) => {
  const iconMap = {
    Diamond: <Diamond size={24} strokeWidth={1.5} />,
    Shield: <Shield size={24} strokeWidth={1.5} />,
    Battery: <Battery size={24} strokeWidth={1.5} />,
    History: <History size={24} strokeWidth={1.5} />
  };

  const displayReasons = (reasons && reasons.length > 0) ? reasons : [
    {
      icon: 'Diamond',
      title: 'Rare price for a well maintained car',
      description: "Priced ~₹5.5 lakhs lower compared to it's original new car on-road price"
    },
    {
      icon: 'Shield',
      title: "Autocar's Sedan of the Year",
      description: "Beating all cars in the segment to win in 2021"
    },
    {
      icon: 'Battery',
      title: 'New battery',
      description: 'New battery for a reduced ownership cost'
    }
  ];

  const containerClasses = theme === 'light'
    ? 'mb-6 border border-slate-200 rounded-[24px] p-5 lg:p-6 bg-white text-[#0C1B33] shadow-sm'
    : 'mb-6 border border-slate-800 rounded-[24px] p-5 lg:p-6 bg-[#0C1B33] text-white shadow-lg';

  const headingClasses = theme === 'light'
    ? 'text-lg md:text-xl font-bold text-[#0C1B33] mb-4'
    : 'text-lg md:text-xl font-bold text-white mb-4';

  const borderClasses = theme === 'light' ? 'border-b border-slate-100 last:border-0' : 'border-b border-white/5 last:border-0';
  const titleClasses = theme === 'light' ? 'text-sm md:text-base font-semibold text-[#0C1B33] mb-0.5' : 'text-sm md:text-base font-semibold text-white mb-0.5';
  const descClasses = theme === 'light' ? 'text-xs text-slate-500' : 'text-xs text-slate-400';

  return (
    <div className={containerClasses}>
      <h2 className={headingClasses}>Reasons To Buy</h2>

      <div className="flex flex-col">
        {displayReasons.map((reason, idx) => {
          const isObj = typeof reason === 'object' && reason !== null;
          const icon = isObj ? reason.icon : 'Diamond';
          const title = isObj ? (reason.title || '') : String(reason);
          const desc = isObj ? reason.description : '';
          return (
            <div key={idx} className={`flex items-start gap-3.5 py-3.5 ${borderClasses}`}>
              <div className="mt-1 text-[#00C9AF] shrink-0">
                {iconMap[icon] || <Diamond size={24} strokeWidth={1.5} />}
              </div>
              <div>
                <h3 className={titleClasses}>{title}</h3>
                {desc && <p className={descClasses}>{desc}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReasonsToBuy;
