import React from 'react';
import { ShieldCheck, Award } from 'lucide-react';
import PropTypes from 'prop-types';

const CarCard = ({ image, title, spec, tags, emi, price, isCertified, isLuxury, isPremium }) => {
  const [imageLoaded, setImageLoaded] = React.useState(false);

  return (
    <div className="bg-white dark:bg-card-dark rounded-2xl overflow-hidden border border-purple-100 dark:border-purple-900/50 shadow-sm hover:shadow-xl transition-all group">
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-50">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-slate-100 animate-pulse flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
          </div>
        )}
        <img
          alt={title}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          src={image}
        />
        {isCertified && (
          <div className="absolute top-3 left-3 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1 shadow-lg">
            <ShieldCheck size={12} />
            CERTIFIED
          </div>
        )}
        {(isLuxury || isPremium) && (
          <div className="absolute top-3 left-3 bg-purple-600 text-white text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1 shadow-lg">
            <Award size={12} />
            {isLuxury ? 'LUXURY' : 'PREMIUM'}
          </div>
        )}

        {/* Like Button Placeholder - Spinny has this */}
        <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white transition-colors cursor-pointer group-hover:opacity-100 opacity-0">
          <div className="w-4 h-4 rounded-full border border-white group-hover:border-rose-500"></div>
        </button>
      </div>
      <div className="p-5">
        <div className="mb-4">
          <h3 className="font-bold text-base text-navy dark:text-white group-hover:text-primary transition-colors">{title}</h3>
          <p className="text-[11px] text-slate-500 dark:text-purple-200 mt-1">{spec}</p>
          <div className="flex gap-2 mt-3">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="text-xs font-bold text-slate-700 dark:text-purple-100 bg-slate-100 dark:bg-purple-900/40 px-2 py-1 rounded uppercase tracking-wide"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between mb-4 border-t border-dashed border-slate-200 dark:border-purple-800 pt-4">
          <div className="flex flex-col">
            <p className="text-xs text-slate-500 font-extrabold uppercase tracking-wider">EMI starts at</p>
            <p className="font-bold text-sm text-slate-700 dark:text-slate-200">{emi}</p>
          </div>
          <div className="text-right">
            <span className="text-[#00C9AF] !font-black text-xl block leading-none">{price}</span>
          </div>
        </div>
        <button className="w-full bg-purple-50 dark:bg-purple-900/30 text-primary dark:text-purple-200 py-2.5 rounded-lg text-sm font-bold hover:bg-primary hover:text-white transition-all uppercase cursor-pointer border border-purple-100 dark:border-purple-800">
          View Details
        </button>
      </div>
    </div>
  );
};

CarCard.propTypes = {
  image: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  spec: PropTypes.string.isRequired,
  tags: PropTypes.arrayOf(PropTypes.string).isRequired,
  emi: PropTypes.string.isRequired,
  price: PropTypes.string.isRequired,
  isCertified: PropTypes.bool,
  isLuxury: PropTypes.bool,
  isPremium: PropTypes.bool
};

export default CarCard;
