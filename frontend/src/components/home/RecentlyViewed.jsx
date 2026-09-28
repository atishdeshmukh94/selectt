
import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import CarCard from '../buy/CarCard';
import { API_URL } from '../../config/api';
import { getSimilarCarsForCarDetails, getPersonalizedRecommendations, getRecentlyViewedCars } from '../../utils/userPreferences';

const RecentlyViewed = ({ 
  title = "Still Can’t Decide?", 
  align = 'center', 
  lightBg = false,
  currentCar = null,
  allCars = null
}) => {
  const [carsList, setCarsList] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(4);

  useEffect(() => {
    const computeList = (availableCars) => {
      if (currentCar) {
        // Car details page mode: get smart similar & deciding cars
        const smartCars = getSimilarCarsForCarDetails(currentCar, availableCars, 8);
        setCarsList(smartCars.length > 0 ? smartCars : availableCars.slice(0, 8));
      } else {
        // General / Home mode: get personalized recommendations or new visitor defaults
        const userCity = localStorage.getItem('user_city') || 'Mumbai';
        const personalized = getPersonalizedRecommendations(availableCars, { limit: 8, city: userCity });
        setCarsList(personalized.length > 0 ? personalized : availableCars.slice(0, 8));
      }
    };

    if (Array.isArray(allCars) && allCars.length > 0) {
      computeList(allCars);
    } else {
      fetch(`${API_URL}/api/cars`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            const available = data.filter(c => c.status !== 'sold_out');
            computeList(available);
          }
        })
        .catch(err => {
          console.error("Failed to load cars for RecentlyViewed", err);
          // Fallback to local storage recently viewed
          const viewed = getRecentlyViewedCars();
          if (viewed.length > 0) setCarsList(viewed);
        });
    }
  }, [currentCar, allCars]);

  // Responsive items per view
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setItemsPerView(1); // Mobile: 1 card
      } else if (window.innerWidth < 1024) {
        setItemsPerView(2); // Tablet: 2 cards
      } else {
        setItemsPerView(4); // Desktop: 4 cards
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (carsList.length === 0) return null;

  const maxIndex = Math.max(0, carsList.length - itemsPerView);

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

  return (
    <section className="py-8 md:py-12 px-4 bg-transparent overflow-hidden group/section">
      <div className="max-w-7xl mx-auto relative">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0C1B33] dark:text-white mb-8 flex items-center justify-center gap-5 w-full">
          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700 max-w-[80px] md:max-w-none" />
          <span className="shrink-0 text-center font-heading tracking-tight">{title}</span>
          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700 max-w-[80px] md:max-w-none" />
        </h2>

        {/* Navigation Arrows (Desktop) */}
        {currentIndex > 0 && (
          <button 
            onClick={prevSlide}
            aria-label="Previous cars"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:text-[#00C9AF] hover:scale-110 transition-all duration-300 cursor-pointer hidden lg:flex opacity-90 group-hover/section:opacity-100"
          >
            <ChevronLeft size={22} />
          </button>
        )}
        
        {currentIndex < maxIndex && (
          <button 
            onClick={nextSlide}
            aria-label="Next cars"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:text-[#00C9AF] hover:scale-110 transition-all duration-300 cursor-pointer hidden lg:flex opacity-90 group-hover/section:opacity-100"
          >
            <ChevronRight size={22} />
          </button>
        )}

        {/* Mobile Navigation Arrows */}
        <div className="flex lg:hidden justify-between absolute top-1/2 left-0 w-full px-2 pointer-events-none z-20">
          <button 
            onClick={prevSlide}
            aria-label="Previous"
            className={`w-9 h-9 rounded-full bg-white/95 dark:bg-slate-800/95 shadow-md flex items-center justify-center pointer-events-auto transition-opacity ${currentIndex === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
            disabled={currentIndex === 0}
          >
            <ChevronLeft size={20} className="text-slate-800 dark:text-white" />
          </button>
          <button 
            onClick={nextSlide}
            aria-label="Next"
            className={`w-9 h-9 rounded-full bg-white/95 dark:bg-slate-800/95 shadow-md flex items-center justify-center pointer-events-auto transition-opacity ${currentIndex >= maxIndex ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
            disabled={currentIndex >= maxIndex}
          >
            <ChevronRight size={20} className="text-slate-800 dark:text-white" />
          </button>
        </div>

        <div className="overflow-hidden -mx-4 px-4 lg:mx-0 lg:px-0">
          <div 
            className="flex gap-4 transition-transform duration-500 ease-out"
            style={{ transform: `translateX(calc(-${currentIndex * 100}% / ${itemsPerView}))` }}
          >
            {carsList.map((car) => (
              <div 
                key={`decide-${car.id}`} 
                className="flex-none w-full sm:w-[calc(50%-8px)] lg:w-[calc(25%-12px)]"
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

