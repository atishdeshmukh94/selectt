import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../config/api';

const staticBrands = [
  { name: 'Maruti Suzuki', logo: '/img/maruti-suzuki.png' },
  { name: 'Hyundai', logo: '/img/hyundai.webp' },
  { name: 'Honda', logo: '/img/honda.webp' },
  { name: 'Tata', logo: '/img/tata.webp' },
  { name: 'Renault', logo: '/img/renault.webp' },
  { name: 'Kia', logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSP_u8Wi6qwILgnAKXw6gW127b4ZKqPzw6rXw&s', isUrl: true },
  { name: 'Ford', logo: '/img/Fored.webp' },
  { name: 'Volkswagen', logo: '/img/Volkswagen_logo.webp' },
  { name: 'Mahindra', logo: '/img/mahindra.webp' },
  { name: 'BMW', logo: '/img/bmw.png' },
  { name: 'Mercedes', logo: '/img/mercedes-benz.webp' },
];

const BrandExplorer = () => {
  const navigate = useNavigate();
  const [brands, setBrands] = useState(staticBrands.map(b => ({ ...b, count: '0 cars' })));
  const scrollRef = useRef(null);
  const animationRef = useRef(null);
  const isPausedRef = useRef(false);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const response = await fetch(`${API_URL}/api/car-counts-by-brand`);
        const data = await response.json();

        const updatedBrands = staticBrands.map(brand => {
          const found = data.find(d => d.name.toLowerCase() === brand.name.toLowerCase());
          return {
            ...brand,
            count: found ? `${found.count} cars` : '0 cars'
          };
        });
        setBrands(updatedBrands);
      } catch (error) {
        console.error('Error fetching brand counts:', error);
      }
    };

    fetchCounts();
  }, []);

  const handleBrandClick = (brandName) => {
    navigate(`/buy-cars?brand=${encodeURIComponent(brandName)}`);
  };

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    let scrollSpeed = 0.8;

    const autoScroll = () => {
      if (!isPausedRef.current && container) {
        container.scrollLeft += scrollSpeed;

        // Reset to start when reaching the duplicated midpoint
        const halfScroll = container.scrollWidth / 2;
        if (container.scrollLeft >= halfScroll) {
          container.scrollLeft = 0;
        }
      }
      animationRef.current = requestAnimationFrame(autoScroll);
    };

    animationRef.current = requestAnimationFrame(autoScroll);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const handleMouseEnter = () => { isPausedRef.current = true; };
  const handleMouseLeave = () => { isPausedRef.current = false; };

  // Duplicate brands for seamless infinite scroll
  const displayBrands = [...brands, ...brands];

  return (
    <section className="py-8 md:py-14 px-0 bg-white dark:bg-slate-900 overflow-hidden">
      {/* Desktop View (Carousel) */}
      <div
        ref={scrollRef}
        className="hidden md:flex gap-5 overflow-x-auto hide-scrollbar px-4"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleMouseEnter}
        onTouchEnd={handleMouseLeave}
      >
        {displayBrands.map((brand, index) => (
          <div
            key={index}
            onClick={() => handleBrandClick(brand.name)}
            className="flex-none w-[140px] md:w-[170px] bg-white dark:bg-card-dark rounded-2xl p-5 md:p-6 border border-slate-100 dark:border-purple-900/50 flex flex-col items-center justify-center hover:shadow-xl hover:border-primary/30 hover:scale-100 transition-all duration-300 cursor-pointer group"
          >
            <img
              alt={brand.name}
              className={`w-auto object-contain transition-all duration-300 mb-3 ${brand.isUrl ? 'h-8' : 'h-12'}`}
              src={brand.logo}
            />
            <p className="text-xs font-bold text-slate-500 group-hover:text-primary transition-colors">{brand.count}</p>
          </div>
        ))}
      </div>

      {/* Mobile View (Grid) */}
      <div className="grid grid-cols-3 gap-3 px-4 md:hidden">
        {brands.slice(0, 9).map((brand, index) => (
          <div
            key={index}
            onClick={() => handleBrandClick(brand.name)}
            className="bg-white rounded-2xl p-3 flex flex-col items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.08)] cursor-pointer active:scale-95 transition-transform h-20"
          >
            <div className="h-10 flex items-center justify-center w-full">
              <img
                alt={brand.name}
                className="max-h-full max-w-full object-contain"
                src={brand.logo}
              />
            </div>
          </div>
        ))}

        {/* Spinny MAX custom banner tile */}
        <div
          onClick={() => navigate('/buy-cars')}
          className="col-span-2 bg-white rounded-2xl p-4 flex items-center justify-between shadow-[0_2px_8px_rgba(0,0,0,0.08)] cursor-pointer active:scale-95 transition-transform"
        >
          <div className="flex flex-col text-[#00C9AF] font-black leading-none">
            <div className="flex items-center gap-1 mb-1">
              <div className="w-3 h-3 bg-[#00C9AF] rounded-full flex items-center justify-center text-[#0A1C3A] text-[8px]">C</div>
              <span className="text-[10px] tracking-tight text-slate-800">Selectt</span>
            </div>
            <span className="text-xl tracking-normal font-light">Superior</span>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-1.5 w-[50%]">
            <img src="/img/bmw.png" alt="BMW" className="w-5 h-5 object-contain" onError={(e) => e.target.style.display = 'none'} />
            <img src="/img/mercedes-benz.webp" alt="Mercedes" className="w-5 h-5 object-contain" onError={(e) => e.target.style.display = 'none'} />
            <div className="text-slate-400 font-bold text-sm">Jeep</div>
          </div>
        </div>

        {/* View all brands tile */}
        <div
          onClick={() => navigate('/buy-cars')}
          className="col-span-1 bg-white rounded-2xl p-3 flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.08)] cursor-pointer active:scale-95 transition-transform"
        >
          <p className="text-[13px] font-bold text-[#6D28D9] text-center leading-tight">
            View all<br />brands <span className="text-[#6D28D9] font-bold ml-0.5">&gt;</span>
          </p>
        </div>
      </div>
    </section>
  );
};

export default BrandExplorer;

