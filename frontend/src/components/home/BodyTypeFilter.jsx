import React, { useState, useEffect } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CarCard from '../buy/CarCard';
import { API_URL } from '../../config/api';

const bodyTypes = [
    { name: 'Hatchback', icon: '/img/hatchback.svg' },
    { name: 'Sedan', icon: '/img/sedan.svg' },
    { name: 'SUV', icon: '/img/suv.svg' },
    { name: 'MUV', icon: '/img/MUV.svg' },
    { name: 'Luxury Sedan', icon: '/img/luxury sedan.svg' },
    { name: 'Luxury SUV', icon: '/img/luxury suv.svg' },
];

const checkLocationMatch = (carLocation, userCity) => {
    if (!carLocation || !userCity) return true;
    const cLoc = carLocation.toLowerCase().trim();
    const uCity = userCity.toLowerCase().trim();

    if (cLoc === uCity) return true;

    if (uCity === 'delhi ncr') {
        return cLoc === 'delhi' || cLoc === 'new delhi' || cLoc === 'delhi ncr' || cLoc === 'noida' || cLoc === 'gurugram' || cLoc === 'gurgaon' || cLoc === 'ghaziabad' || cLoc === 'faridabad';
    }

    return cLoc.includes(uCity) || uCity.includes(cLoc);
};

const BodyTypeFilter = () => {
    const navigate = useNavigate();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [itemsPerView, setItemsPerView] = useState(4);
    const [allCars, setAllCars] = useState([]);
    const [activeType, setActiveType] = useState('Hatchback');
    const [loading, setLoading] = useState(true);
    const [selectedCity, setSelectedCity] = useState(localStorage.getItem('user_city') || 'Delhi NCR');

    useEffect(() => {
        const fetchCars = async () => {
            try {
                const res = await fetch(`${API_URL}/api/cars`);
                const data = await res.json();
                setAllCars(data.filter(car => car.status !== 'sold_out'));
            } catch (err) {
                console.error('Failed to fetch cars:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchCars();
    }, []);

    useEffect(() => {
        const handleLocationChange = () => {
            setSelectedCity(localStorage.getItem('user_city') || 'Delhi NCR');
            setCurrentIndex(0);
        };
        window.addEventListener('location-changed', handleLocationChange);
        return () => window.removeEventListener('location-changed', handleLocationChange);
    }, []);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setItemsPerView(1);
            } else {
                setItemsPerView(4);
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const filteredCars = allCars.filter(car => {
        // Filter by location
        if (!checkLocationMatch(car.location, selectedCity)) return false;

        // Filter by body type
        if (activeType === 'Hatchback') return car.bodyType === 'Hatchback';
        if (activeType === 'Sedan') return car.bodyType === 'Sedan' && car.price < 2000000;
        if (activeType === 'SUV') return car.bodyType === 'SUV' && car.price < 2000000;
        if (activeType === 'MUV') return car.bodyType === 'MUV';
        if (activeType === 'Luxury Sedan') return car.bodyType === 'Sedan' && car.price >= 2000000;
        if (activeType === 'Luxury SUV') return car.bodyType === 'SUV' && car.price >= 2000000;
        return false;
    });

    const maxIndex = Math.max(0, filteredCars.length - itemsPerView);

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

    const handleViewAll = () => {
        const baseFilters = { budget: '', budget_max: 25, certification: '', brands: [], models: [], fuel: '', transmission: '', owners: [], year_min: null, km_max: null, body_type: [] };
        let query = { ...baseFilters };

        if (activeType === 'Luxury Sedan') {
            query.body_type = ['Sedan'];
            query.budget = '10 L +';
        } else if (activeType === 'Luxury SUV') {
            query.body_type = ['SUV'];
            query.budget = '10 L +';
        } else {
            query.body_type = [activeType];
        }

        navigate('/buy-cars', { state: { filters: query } });
    };

    const getCountForType = (typeName) => {
        const cityCars = allCars.filter(car => checkLocationMatch(car.location, selectedCity));
        if (typeName === 'Luxury Sedan') return cityCars.filter(car => car.bodyType === 'Sedan' && car.price >= 2000000).length;
        if (typeName === 'Luxury SUV') return cityCars.filter(car => car.bodyType === 'SUV' && car.price >= 2000000).length;
        if (typeName === 'Hatchback') return cityCars.filter(car => car.bodyType === 'Hatchback').length;
        if (typeName === 'Sedan') return cityCars.filter(car => car.bodyType === 'Sedan' && car.price < 2000000).length;
        if (typeName === 'SUV') return cityCars.filter(car => car.bodyType === 'SUV' && car.price < 2000000).length;
        if (typeName === 'MUV') return cityCars.filter(car => car.bodyType === 'MUV').length;
        return 0;
    };

    return (
        <section className="py-10 md:py-20 px-4 bg-background-light dark:bg-background-dark relative group/section">

            {/* Body Type Selection Tabs */}
            <div className="mb-16 border border-purple-100 dark:border-purple-800 rounded-2xl max-w-fit mx-auto bg-white/50 dark:bg-purple-900/20 backdrop-blur-sm p-3 flex flex-wrap md:flex-nowrap items-center justify-center gap-2 md:gap-4 overflow-x-auto hide-scrollbar">
                {bodyTypes.map((type, index) => {
                    const count = getCountForType(type.name);
                    return (
                        <button
                            key={index}
                            onClick={() => { setActiveType(type.name); setCurrentIndex(0); }}
                            className={`flex flex-col items-center justify-center gap-1 min-w-[110px] p-4 rounded-xl transition-all shrink-0 group ${activeType === type.name
                                ? 'bg-[#00C9AF] text-[#0A1C3A] shadow-lg shadow-rose-900/20 scale-105'
                                : 'hover:bg-white dark:hover:bg-purple-900/50 hover:shadow-md'
                                }`}
                        >
                            <img
                                src={type.icon}
                                alt={type.name}
                                className={`w-12 h-6 object-contain ${activeType === type.name ? 'brightness-0 invert' : 'grayscale group-hover:grayscale-0 transition-all opacity-70 group-hover:opacity-100'
                                    }`}
                            />
                            <span className={`text-[11px] font-bold tracking-tight ${activeType === type.name ? '' : 'text-slate-500 group-hover:text-[#00C9AF]'}`}>
                                {type.name}
                            </span>
                            <span className={`text-[9px] font-medium opacity-80 ${activeType === type.name ? 'text-white/90' : 'text-slate-400'}`}>
                                {loading ? '...' : `${count} cars`}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Featured cars Carousel */}
            <div className="max-w-7xl mx-auto relative px-0 lg:px-4">

                {/* Desktop Navigation Arrows */}
                {currentIndex > 0 && (
                    <button
                        onClick={prevSlide}
                        className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white dark:bg-slate-800 shadow-lg border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-purple-600 hover:scale-110 transition-all duration-300 cursor-pointer hidden lg:flex opacity-0 group-hover/section:opacity-100"
                    >
                        <ChevronLeft size={28} />
                    </button>
                )}

                {currentIndex < maxIndex && (
                    <button
                        onClick={nextSlide}
                        className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white dark:bg-slate-800 shadow-lg border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-purple-600 hover:scale-110 transition-all duration-300 cursor-pointer hidden lg:flex opacity-0 group-hover/section:opacity-100"
                    >
                        <ChevronRight size={28} />
                    </button>
                )}

                {/* Mobile Navigation Arrows */}
                <div className="flex lg:hidden justify-between absolute top-1/2 left-0 w-full px-2 pointer-events-none z-10 -mt-8">
                    <button
                        onClick={prevSlide}
                        className={`w-10 h-10 rounded-full bg-white/90 dark:bg-slate-800/90 shadow-md flex items-center justify-center pointer-events-auto ${currentIndex === 0 ? 'opacity-0' : 'opacity-100'}`}
                        disabled={currentIndex === 0}
                    >
                        <ChevronLeft size={24} className="text-slate-700 dark:text-white" />
                    </button>
                    <button
                        onClick={nextSlide}
                        className={`w-10 h-10 rounded-full bg-white/90 dark:bg-slate-800/90 shadow-md flex items-center justify-center pointer-events-auto ${currentIndex >= maxIndex ? 'opacity-0' : 'opacity-100'}`}
                        disabled={currentIndex >= maxIndex}
                    >
                        <ChevronRight size={24} className="text-slate-700 dark:text-white" />
                    </button>
                </div>

                <div className="overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 size={40} className="animate-spin text-rose-500" />
                        </div>
                    ) : filteredCars.length > 0 ? (
                        <div
                            className="flex gap-4 transition-transform duration-500 ease-out"
                            style={{ transform: `translateX(calc(-${currentIndex * 100}% / ${itemsPerView}))` }}
                        >
                            {filteredCars.map((car) => (
                                <div key={car.id} className="flex-none w-full lg:w-[calc(25%-12px)]">
                                    <CarCard car={car} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-500 font-bold bg-white/50 dark:bg-slate-800/50 rounded-3xl backdrop-blur-sm border border-slate-100 dark:border-slate-700">
                            <p className="text-sm">No results found for {activeType}</p>
                            <p className="text-xs opacity-60 font-medium">Try selecting another body type</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-8 md:mt-12 text-center">
                <button
                    onClick={handleViewAll}
                    className="bg-transparent border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 px-8 py-3 rounded-xl font-bold hover:bg-white dark:hover:bg-slate-800 hover:shadow-lg transition-all flex items-center gap-2 mx-auto cursor-pointer"
                >
                    View all cars <ArrowRight size={18} />
                </button>
            </div>

        </section>
    );
};

export default BodyTypeFilter;

