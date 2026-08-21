
import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import CarCard from '../buy/CarCard';

const RecentlyViewed = ({ title = 'Recently viewed cars' , align = 'center', lightBg = false }) => {
    const [recentlyViewed, setRecentlyViewed] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [itemsPerView, setItemsPerView] = useState(4); // Default to desktop

    useEffect(() => {
        try {
            const viewed = JSON.parse(localStorage.getItem('recently_viewed_cars')) || [];
            if (viewed && viewed.length > 0) {
               setRecentlyViewed(viewed);
            }
        } catch (e) {
            console.error("Failed to load viewed cars", e);
        }
    }, []);

    // Update items per view based on screen size
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setItemsPerView(1); // Mobile: 1 card
            } else {
                setItemsPerView(4); // Desktop: 4 cards
            }
        };

        // Initial call
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const maxIndex = Math.max(0, recentlyViewed.length - itemsPerView);

    const nextSlide = () => {
        if (currentIndex < maxIndex) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const prevSlide = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    if (recentlyViewed.length === 0) return null;

  return (
    <section className="py-8 md:py-12 px-4 bg-background-light dark:bg-background-dark overflow-hidden group/section">
      <div className="max-w-7xl mx-auto relative">

        <h2 className="text-2xl font-bold text-[#0C1B33] dark:text-white mb-8 flex items-center justify-center gap-5 w-full">
          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700 max-w-[100px] md:max-w-none" />
          <span className="shrink-0 text-center">{title}</span>
          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700 max-w-[100px] md:max-w-none" />
        </h2>

        {/* Navigation Arrows (Desktop) */}
        {currentIndex > 0 && (
             <button 
                onClick={prevSlide}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow-md border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-purple-600 hover:scale-110 transition-all duration-300 cursor-pointer hidden lg:flex opacity-0 group-hover/section:opacity-100"
            >
                <ChevronLeft size={24} />
             </button>
        )}
        
        {currentIndex < maxIndex && (
             <button 
                onClick={nextSlide}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow-md border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-purple-600 hover:scale-110 transition-all duration-300 cursor-pointer hidden lg:flex opacity-0 group-hover/section:opacity-100"
            >
                <ChevronRight size={24} />
             </button>
        )}

        {/* Mobile Navigation Arrows (Visible only on mobile) */}
         <div className="flex lg:hidden justify-between absolute top-1/2 left-0 w-full px-2 pointer-events-none z-10">
            <button 
                onClick={prevSlide}
                className={`w-8 h-8 rounded-full bg-white/80 dark:bg-slate-800/80 shadow-md flex items-center justify-center pointer-events-auto ${currentIndex === 0 ? 'opacity-0' : 'opacity-100'}`}
                disabled={currentIndex === 0}
            >
                <ChevronLeft size={20} className="text-slate-700 dark:text-white" />
            </button>
            <button 
                onClick={nextSlide}
                className={`w-8 h-8 rounded-full bg-white/80 dark:bg-slate-800/80 shadow-md flex items-center justify-center pointer-events-auto ${currentIndex >= maxIndex ? 'opacity-0' : 'opacity-100'}`}
                disabled={currentIndex >= maxIndex}
            >
                <ChevronRight size={20} className="text-slate-700 dark:text-white" />
            </button>
         </div>


        <div className="overflow-hidden -mx-4 px-4 lg:mx-0 lg:px-0">
             <div 
                className="flex gap-4 transition-transform duration-500 ease-out"
                style={{ transform: `translateX(calc(-${currentIndex * 100}% / ${itemsPerView}))` }}
             >
                {recentlyViewed.map((car) => (
                    <div 
                        key={car.id} 
                        className="flex-none w-full lg:w-[calc(25%-12px)]"
                    >
                        <CarCard car={car} lightBg={lightBg} />
                    </div>
                ))}
            </div>
        </div>
        
      </div>
    </section>
  );
};

export default RecentlyViewed;
