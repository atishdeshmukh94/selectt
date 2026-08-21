const statsData = [
  {
    icon: '/img/Iinsights-1.png',
    value: '35%',
    label: 'The number of Selectt customers that are satisfied with their referrals',
    bgColor: 'bg-[#B0B0FF]',
    textColor: 'text-[#0C1B33]'
  },
  {
    icon: '/img/Iinsights-2.png',
    value: '2.0 Lakh',
    label: 'The number of happy Selectt customers and counting',
    bgColor: 'bg-[#FFD180]',
    textColor: 'text-[#0C1B33]'
  },
  {
    icon: '/img/Iinsights-3.png',
    value: '5,000+',
    label: 'Highest quality cars available at any given time',
    bgColor: 'bg-[#B2DFDB]',
    textColor: 'text-[#0C1B33]'
  },
  {
    icon: '/img/Iinsights-4.png',
    value: '4.8/5',
    label: 'Average customer rating on Google reviews',
    bgColor: 'bg-[#F8BBD0]',
    textColor: 'text-[#0C1B33]'
  }
];

const Stats = () => {
  return (
    <section className="py-8 md:py-16 px-4 bg-white dark:bg-background-dark">


      <div className="max-w-7xl mx-auto">
        {/* Horizontal Carousel for Mobile, Grid for Desktop */}
         <div className="flex md:grid md:grid-cols-4 gap-4 overflow-x-auto md:overflow-visible hide-scrollbar snap-x snap-mandatory px-0 md:px-0">
          {statsData.map((stat, idx) => (
            <div 
              key={idx}
              className={`${stat.bgColor} ${stat.textColor} min-w-[300px] md:min-w-0 rounded-2xl p-8 flex items-center gap-6 snap-center shadow-sm hover:shadow-md transition-shadow cursor-pointer`}
            >
              {/* Icon Container */}
              <div className="text-5xl flex-shrink-0 grayscale-0 transition-transform duration-300 hover:scale-125 hover:rotate-12">
                {(typeof stat.icon === 'string' && (stat.icon.startsWith('http') || stat.icon.startsWith('/img/'))) ? (
                  <img src={stat.icon} alt="icon" className="w-20 h-20 object-contain" />
                ) : (
                  stat.icon
                )}
              </div>
              
              {/* Content */}
              <div>
                <p className="text-3xl font-extrabold mb-1">{stat.value}</p>
                <p className="text-[10px] md:text-xs font-bold leading-tight opacity-80 uppercase tracking-wide">
                  {stat.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
