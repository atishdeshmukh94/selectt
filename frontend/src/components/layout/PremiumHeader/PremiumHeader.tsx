import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  IconMapPin,
  IconChevronDown,
  IconSearch,
  IconHeart,
  IconUser,
  IconPhone,
  IconMenu,
  IconX,
  IconChevronRight,
  IconCar,
  IconCurrencyDollar,
  IconRefresh,
  IconDownload,
  IconFileText,
  IconKey,
  IconCurrencyRupee,
  IconSettings,
  IconPercentage,
  IconCrown,
  IconBolt,
  IconTrophy,
  IconStar,
  IconCheck,
  IconCoin,
  IconHome
} from '@tabler/icons-react';
import styles from './PremiumHeader.module.css';

import { useAuth } from '../../../context/AuthContext';
import { API_URL, getCarImageUrl, DEFAULT_CAR_FALLBACK_IMAGE } from '../../../config/api';
import { getCarDetailsUrl } from '../../../utils/formatters';

interface FilterOption {
  label: string;
  query: Record<string, any>;
}

export const PremiumHeader: React.FC = () => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const lastScrollYRef = React.useRef(0);
  const [city, setCity] = useState('Mumbai');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [brandsData, setBrandsData] = useState<any[]>([]);
  const [expandedBrands, setExpandedBrands] = useState<{ [brandKey: string]: boolean }>({});
  const [makeModelMenuOpen, setMakeModelMenuOpen] = useState(false);

  const toggleBrandExpand = (e: React.MouseEvent, key: string) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedBrands(prev => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    fetch(`${API_URL}/api/brands`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setBrandsData(data);
        }
      })
      .catch(err => console.error('Failed to fetch brands in header:', err));
  }, []);

  const searchContainerRef = React.useRef<HTMLDivElement>(null);
  const mobileSearchContainerRef = React.useRef<HTMLDivElement>(null);
  const mobileDrawerRef = React.useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const isCheckoutPage = location.pathname.startsWith('/checkout');

  // Close mobile drawer on outside click/tap
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (mobileDrawerRef.current && !mobileDrawerRef.current.contains(e.target as Node)) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick, { passive: true });
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [mobileMenuOpen]);

  // Typing placeholder animation state
  const searchWords = ["brands", "models", "budget", "fuel type", "transmission", "year", "km driven"];
  const [searchWordIndex, setSearchWordIndex] = useState(0);
  const [typingSearchText, setTypingSearchText] = useState("");
  const [isDeletingSearch, setIsDeletingSearch] = useState(false);

  useEffect(() => {
    let timer: any;
    const currentWord = searchWords[searchWordIndex];
    if (isDeletingSearch) {
      if (typingSearchText === "") {
        setIsDeletingSearch(false);
        setSearchWordIndex((prev) => (prev + 1) % searchWords.length);
      } else {
        timer = setTimeout(() => {
          setTypingSearchText(typingSearchText.substring(0, typingSearchText.length - 1));
        }, 50);
      }
    } else {
      if (typingSearchText === currentWord) {
        timer = setTimeout(() => {
          setIsDeletingSearch(true);
        }, 2000);
      } else {
        timer = setTimeout(() => {
          setTypingSearchText(currentWord.substring(0, typingSearchText.length + 1));
        }, 100);
      }
    }
    return () => clearTimeout(timer);
  }, [typingSearchText, isDeletingSearch, searchWordIndex]);

  // Try to use auth if available
  let authData: any = {};
  try {
    authData = useAuth();
  } catch (e) {
    // Auth context not loaded yet
  }
  const { user, openLoginModal, logout } = authData;

  // Debounced AJAX search effect
  useEffect(() => {
    const trimmed = searchText.trim();
    if (trimmed.length < 2) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);
    const delayDebounceFn = setTimeout(async () => {
      try {
        const response = await fetch(`${API_URL}/api/cars?search=${encodeURIComponent(trimmed)}`);
        const data = await response.json();
        setSearchResults(data);
      } catch (error) {
        console.error('Error fetching live search results:', error);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchText]);

  // Click outside to close search dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) &&
        (mobileSearchContainerRef.current && !mobileSearchContainerRef.current.contains(event.target as Node))
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputFocus = () => {
    if (searchText.trim().length >= 2) {
      setShowDropdown(true);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 20);

      // At top of page: always visible
      if (currentScrollY <= 80) {
        setIsHeaderVisible(true);
      } else {
        // Scrolling down: hide header
        if (currentScrollY > lastScrollYRef.current + 8 && currentScrollY > 120) {
          setIsHeaderVisible(false);
          setActiveDropdown(null);
          setShowDropdown(false);
        } 
        // Scrolling up: show sticky header
        else if (currentScrollY < lastScrollYRef.current - 6) {
          setIsHeaderVisible(true);
        }
      }

      lastScrollYRef.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const response = await fetch(`${API_URL}/api/settings/public`);
        const data = await response.json();
        if (data.frontend_header_logo) {
          setLogoUrl(`${API_URL}${data.frontend_header_logo}`);
        }
      } catch (err) {
        console.error("Error fetching header logo:", err);
      }
    };
    fetchLogo();
  }, []);

  // Retrieve user city from localStorage if exists
  useEffect(() => {
    const storedCity = localStorage.getItem('user_city');
    if (storedCity) {
      setCity(storedCity);
    }

    const handleLocationChange = () => {
      const updatedCity = localStorage.getItem('user_city') || 'Mumbai';
      setCity(updatedCity);
    };
    window.addEventListener('location-changed', handleLocationChange);
    return () => window.removeEventListener('location-changed', handleLocationChange);
  }, []);

  const openLocationPicker = () => {
    window.dispatchEvent(new Event('open-location-selector'));
  };

  const handleNavFilter = (query: Record<string, any>) => {
    const baseFilters = {
      budget: '',
      budget_min: null,
      budget_max: 25,
      certification: '',
      brands: [],
      models: [],
      fuel: '',
      transmission: '',
      owners: [],
      year_min: null,
      km_max: null,
      body_type: [],
      searchQuery: '',
      tag: ''
    };
    const filters = { ...baseFilters, ...query };
    const params = new URLSearchParams();

    if (filters.brands && filters.brands.length > 0) params.set('brand', filters.brands.join(','));
    if (filters.models && filters.models.length > 0) params.set('model', filters.models.join(','));
    if (filters.body_type && filters.body_type.length > 0) params.set('bodyType', filters.body_type.join(','));
    if (filters.fuel) params.set('fuel', filters.fuel);
    if (filters.transmission) params.set('transmission', filters.transmission);
    if (filters.owners && filters.owners.length > 0) params.set('owners', filters.owners.join(','));
    if (filters.year_min) params.set('year_min', String(filters.year_min));
    if (filters.km_max) params.set('km_max', String(filters.km_max));
    if (filters.tag) params.set('tag', filters.tag);
    if (filters.certification) params.set('certification', filters.certification);
    if (filters.budget) params.set('budget', filters.budget);
    if (filters.budget_min) params.set('budget_min', String(filters.budget_min));
    if (filters.budget_max && filters.budget_max < 25) params.set('budget_max', String(filters.budget_max));
    if (filters.searchQuery) params.set('search', filters.searchQuery);

    const queryString = params.toString();
    const targetUrl = queryString ? `/buy-cars?${queryString}` : '/buy-cars';

    setMakeModelMenuOpen(false);
    setActiveDropdown(null);
    setMobileMenuOpen(false);

    if (typeof document !== 'undefined' && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    window.location.href = targetUrl;
  };

  const handleTextSearch = () => {
    if (searchText.trim()) {
      handleNavFilter({ searchQuery: searchText.trim() });
    }
  };

  const handleKeyDownSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setShowDropdown(false);
    } else if (e.key === 'Enter') {
      handleTextSearch();
      setShowDropdown(false);
    }
  };

  return (
    <header 
      className={`${styles.headerContainer} ${!isHeaderVisible ? styles.headerHidden : ''} ${isCheckoutPage ? '!hidden md:!block' : ''}`} 
      style={{
        background: scrolled ? 'rgba(12, 27, 51, 0.96)' : '#0c1b33',
        transform: isHeaderVisible ? 'translateY(0)' : 'translateY(-100%)',
        transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.3s ease'
      }}
    >
      {/* Top Bar (64px) */}
      <div className={styles.topBar}>
        {/* Left: Logo & Location */}
        <div className={styles.leftSection}>
          <Link to="/" className={styles.logoLink} aria-label="Selectt Cars Home">
            <img
              src={logoUrl || "/img/light-logo.svg"}
              alt="Selectt Cars"
              className={styles.logoImage}
            />
          </Link>

          <button
            onClick={openLocationPicker}
            className={styles.locationSelector}
            aria-label={`Select Location, current city is ${city}`}
          >
            <IconMapPin size={16} />
            <span>{city}</span>
            <IconChevronDown size={14} />
          </button>
        </div>

        {/* Mobile Location Selector pill */}
        <button
          onClick={openLocationPicker}
          className={styles.mobileLocationSelector}
          aria-label={`Select Location, current city is ${city}`}
        >
          <IconMapPin size={13} className={styles.mobileLocationIcon} />
          <span>{city}</span>
          <IconChevronDown size={11} />
        </button>

        <div className={styles.searchBox} ref={searchContainerRef}>
          <input
            className={styles.searchInput}
            type="text"
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={handleInputFocus}
            onKeyDown={handleKeyDownSearch}
            aria-label="Search cars"
          />
          <IconSearch size={16} className={styles.searchIcon} />

          {!searchText && (
            <div className={styles.animatedPlaceholder}>
              <span className={styles.placeholderPrefix}>Search by</span>
              <span className={styles.placeholderTyped}>{typingSearchText}</span>
              <span className={styles.placeholderCursor} />
            </div>
          )}

          {/* Autocomplete Dropdown */}
          {showDropdown && (searchText.trim().length >= 2) && (
            <div className={styles.searchResultsDropdown}>
              {searchLoading ? (
                <div className={styles.searchStatus}>Loading related cars...</div>
              ) : searchResults.length > 0 ? (
                <>
                  <div className={styles.searchResultsList}>
                    {searchResults.slice(0, 5).map((car) => {
                      const carImg = getCarImageUrl(car.image);
                      return (
                        <Link
                          key={car.id}
                          to={getCarDetailsUrl(car)}
                          className={styles.searchResultItem}
                          onClick={() => setShowDropdown(false)}
                        >
                          <img
                            src={carImg}
                            alt={`${car.make} ${car.model}`}
                            className={styles.searchResultImg}
                            onError={(e: any) => {
                              e.target.src = DEFAULT_CAR_FALLBACK_IMAGE;
                            }}
                          />
                          <div className={styles.searchResultInfo}>
                            <div className={styles.searchResultTitle}>
                              {car.year} {car.make} {car.model}
                            </div>
                            <div className={styles.searchResultMeta}>
                              {(car.km || 0).toLocaleString()} km • {car.fuelType} • {car.transmission}
                            </div>
                          </div>
                          <div className={styles.searchResultPrice}>
                            ₹{(car.price / 100000).toFixed(2)} Lakh
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => {
                      handleTextSearch();
                      setShowDropdown(false);
                    }}
                    className={styles.viewAllResultsBtn}
                  >
                    View all results ({searchResults.length})
                  </button>
                </>
              ) : (
                <div className={styles.searchStatus}>No cars found matching "{searchText}"</div>
              )}
            </div>
          )}
        </div>

        {/* Right Section: Desktop Actions */}
        <div className={styles.rightSection}>
          <Link to="/buy-cars" className={styles.navLink}>Buy Car</Link>
          <Link to="/sell-car" className={styles.navLink}>Sell Car</Link>

          {/* More Dropdown */}
          <div className={styles.moreWrapper}>
            <button className={styles.navLinkButton}>
              <span>More</span>
              <IconChevronDown size={14} className={styles.moreChevron} />
            </button>

            <div className={styles.moreDropdown}>
              {/* Top Section */}
              <div className={styles.moreSection}>
                <Link to="/about-us" className={styles.moreLinkItem}>
                  <div className={styles.moreItemLeft}>
                    <IconFileText size={18} />
                    <span>About Us</span>
                  </div>
                </Link>
                <Link to="/contact-us" className={styles.moreLinkItem}>
                  <div className={styles.moreItemLeft}>
                    <IconPhone size={18} />
                    <span>Contact Us</span>
                  </div>
                </Link>
                <Link to="/used-car-loan" className={styles.moreLinkItem}>
                  <div className={styles.moreItemLeft}>
                    <svg width="18" height="18" viewBox="40 -1 170 250" fill="currentColor" className="text-[#13EDE5] shrink-0">
                      <path d="M153 23h41l15-23H55L40 23h26c27 0 52 2 62 25H55L40 71h91v1c0 17-14 43-60 43H48v22l90 113h41L85 133c39-2 75-24 80-62h44l15-23h-58c-2-8-6-16-13-25z" />
                    </svg>
                    <div>
                      <span className={styles.moreItemTitle}>Finance Your Car</span>
                      <span className={styles.moreItemSub}>Instant car loan with 0 downpayment</span>
                    </div>
                  </div>
                </Link>
                <div
                  className={styles.moreLinkNestedWrapper}
                  onMouseEnter={() => setHowItWorksOpen(true)}
                  onMouseLeave={() => setHowItWorksOpen(false)}
                >
                  <Link
                    to="/how-it-works/buying"
                    className={styles.moreLinkItem}
                    onClick={() => setHowItWorksOpen(!howItWorksOpen)}
                  >
                    <div className={styles.moreItemLeft}>
                      <IconRefresh size={18} />
                      <span>How It Works</span>
                    </div>
                    <IconChevronRight size={16} className={`${styles.moreNestedChevron} ${howItWorksOpen ? styles.chevronActive : ''}`} />
                  </Link>

                  {/* Side Flyout Submenu */}
                  <div className={`${styles.moreSideFlyout} ${howItWorksOpen ? styles.expanded : ''}`}>
                    <div className={styles.flyoutHeader}>Process & Pricing</div>
                    <Link to="/how-it-works/buying" className={styles.moreNestedLink} onClick={() => setHowItWorksOpen(false)}>
                      <IconCar size={16} />
                      <span>Car Buying Process</span>
                    </Link>
                    <Link to="/how-it-works/selling" className={styles.moreNestedLink} onClick={() => setHowItWorksOpen(false)}>
                      <IconKey size={16} />
                      <span>Car Selling Process</span>
                    </Link>
                    <Link to="/pricing" className={styles.moreNestedLink} onClick={() => setHowItWorksOpen(false)}>
                      <IconCurrencyRupee size={16} />
                      <span>Pricing</span>
                    </Link>
                  </div>
                </div>
                <Link to="/car-hub-locations" className={styles.moreLinkItem}>
                  <div className={styles.moreItemLeft}>
                    <IconMapPin size={18} />
                    <span>Car Hub Locations</span>
                  </div>
                </Link>
              </div>

              {/* Middle Section */}
              <div className={styles.moreSection}>
                <Link to="/blog" className={styles.moreLinkItemPlain}>
                  <IconFileText size={16} />
                  <span>Blog</span>
                </Link>
                <Link to="/customer-reviews" className={styles.moreLinkItemPlain}>
                  <IconCar size={16} />
                  <span>Customer Reviews</span>
                </Link>
                <Link to="/e-challan" className={styles.moreLinkItemPlain}>
                  <IconFileText size={16} />
                  <span>E-Challan</span>
                </Link>
              </div>

              {/* Bottom Section */}
              <div className={styles.moreSectionLast}>
                <Link to="/selectt-assured" className={styles.moreColItem}>
                  <span className={styles.moreColTitle}>Selectt Assured®</span>
                  <span className={styles.moreColSub}>The sure road to Car Joy</span>
                </Link>
                <Link to="/selectt-buyback" className={styles.moreColItem}>
                  <span className={styles.moreColTitle}>Selectt BuyBack</span>
                  <span className={styles.moreColSub}>Commit less, Drive more</span>
                </Link>
                <Link to="/selectt-partners" className={styles.moreColItem}>
                  <span className={styles.moreColTitle}>Selectt Partners</span>
                  <span className={styles.moreColSub}>Drive your business ahead</span>
                </Link>
                <Link to="/car-insurance" className={styles.moreColItem}>
                  <span className={styles.moreColTitle}>Selectt Insurance</span>
                  <span className={styles.moreColSub}>Hassle free car insurance</span>
                </Link>
              </div>
            </div>
          </div>

          <Link to="/profile?tab=wishlisted" className={styles.wishlistButton} aria-label="View Wishlist">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
              <img src="/icons/heart.svg" alt="Wishlist" style={{ width: '30px', height: '30px', objectFit: 'contain' }} />
              <span style={{ fontSize: '10px', fontWeight: '600', color: 'white', letterSpacing: '0.03em', lineHeight: '1' }}>Shortlist</span>
            </div>
          </Link>

          {user ? (
            <div className={styles.accountWrapper}>
              <button className={styles.accountButton} aria-label="View Account Profile">
                <IconUser size={18} />
                <span>Account</span>
                <IconChevronDown size={14} className={styles.accountChevron} />
              </button>

              <div className={styles.accountDropdown}>
                <div className={styles.accountDropdownHeader}>
                  <span className={styles.accountDropdownHeaderLabel}>Logged in as</span>
                  {user.first_name ? (
                    <>
                      <span className={styles.accountDropdownHeaderValue} style={{ color: '#00C9AF', display: 'block', marginBottom: '2px' }}>
                        {user.first_name} {user.last_name}
                      </span>
                      <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>
                        +91 {user.phone}
                      </span>
                    </>
                  ) : (
                    <span className={styles.accountDropdownHeaderValue}>+91 {user.phone}</span>
                  )}
                </div>
                <Link to="/profile?tab=profile" className={styles.accountDropdownLink}>
                  My Profile
                </Link>
                <Link to="/profile?tab=wishlisted" className={styles.accountDropdownLink}>
                  Wishlisted Cars
                </Link>
                <Link to="/profile?tab=bookings" className={styles.accountDropdownLink}>
                  Bookings
                </Link>
                <Link to="/profile?tab=testdrives" className={styles.accountDropdownLink}>
                  Test Drives
                </Link>
                <Link to="/profile?tab=sell" className={styles.accountDropdownLink}>
                  Sell Car
                </Link>
                <Link to="/profile?tab=buy" className={styles.accountDropdownLink}>
                  Buy Cars
                </Link>
                <Link to="/profile?tab=loan" className={styles.accountDropdownLink}>
                  Car Loan
                </Link>
                <div className={styles.accountDropdownDivider} />
                <button
                  onClick={() => { logout && logout(); navigate('/'); }}
                  className={styles.logoutButton}
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => openLoginModal && openLoginModal()}
              className={styles.accountButton}
              aria-label="Login or Signup"
            >
              <IconUser size={18} />
              <span>Account</span>
            </button>
          )}

          <a href="tel:+918591969394" className={styles.phoneLink} aria-label="Call Support at +91 85919 69394">
            <IconPhone size={18} />
            <span>+91 85919 69394</span>
          </a>
        </div>

        {/* Hamburger Toggle (≤980px) */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className={`${styles.iconButton} ${styles.mobileMenuToggle}`}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <IconX size={24} /> : <IconMenu size={24} />}
        </button>
      </div>

      {/* Sub Bar (48px) - Scrolls horizontally with hidden scrollbar */}
      <div className={styles.subBarContainer}>
        <div className={styles.subBar}>
          {/* Explore By Dropdown */}
          <div className={styles.dropdownWrapper}>
            <button className={styles.filterButton}>
              <span>Explore By</span>
              <IconChevronDown size={13} className={styles.chevronIcon} />
            </button>
            <div className={styles.dropdownMenu}>
              {[
                { label: 'Selectt Assured', query: { certification: 'Assured' } },
                { label: 'Selectt Assured+', query: { certification: 'Assured+' } },
                { label: 'Luxury Cars', query: { budget: '10 L +' } },
                { label: 'Value Picks', query: { budget: 'Under 3 L' } }
              ].map((opt, i) => (
                <button key={i} onClick={() => handleNavFilter(opt.query)}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Dropdown */}
          <div className={styles.dropdownWrapper}>
            <button className={styles.filterButton}>
              <span>Price Range</span>
              <IconChevronDown size={13} className={styles.chevronIcon} />
            </button>
            <div className={styles.dropdownMenu}>
              {[
                { label: 'Under 3 Lakh', query: { budget: 'Under 3 L', budget_max: 3 } },
                { label: '3 - 4 Lakh', query: { budget_min: 3, budget_max: 4 } },
                { label: '4 - 5 Lakh', query: { budget_min: 4, budget_max: 5 } },
                { label: '5 - 6 Lakh', query: { budget_min: 5, budget_max: 6 } },
                { label: '6 - 8 Lakh', query: { budget_min: 6, budget_max: 8 } },
                { label: '8 - 10 Lakh', query: { budget_min: 8, budget_max: 10 } },
                { label: 'Above 10 Lakh', query: { budget: '10 L +', budget_min: 10 } }
              ].map((opt, i) => (
                <button key={i} onClick={() => handleNavFilter(opt.query)}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Make and Model Dropdown Wrapper */}
          <div 
            className={styles.dropdownWrapper}
            onMouseEnter={() => setMakeModelMenuOpen(true)}
            onMouseLeave={() => setMakeModelMenuOpen(false)}
          >
            <button 
              className={styles.filterButton}
              onClick={() => setMakeModelMenuOpen(prev => !prev)}
            >
              <span>Make and Model</span>
              <IconChevronDown size={13} className={styles.chevronIcon} />
            </button>
            <div className={`${styles.makeModelDropdown} ${!makeModelMenuOpen ? styles.dropdownForceClosed : ''}`}>
              {(() => {
                const DEFAULT_MAKE_MODELS = [
                  {
                    name: 'Maruti Suzuki',
                    models: [{ name: 'Baleno' }, { name: 'Swift' }, { name: 'Alto 800' }, { name: 'Wagon R' }, { name: 'Ciaz' }]
                  },
                  {
                    name: 'Honda',
                    models: [{ name: 'City' }, { name: 'Amaze' }, { name: 'Jazz' }, { name: 'Brio' }, { name: 'Elevate' }]
                  },
                  {
                    name: 'Kia',
                    models: [{ name: 'Seltos' }, { name: 'Sonet' }, { name: 'Carens' }, { name: 'Syros' }, { name: 'Carens Clavis' }]
                  },
                  {
                    name: 'Hyundai',
                    models: [{ name: 'Grand i10' }, { name: 'i20' }, { name: 'Creta' }, { name: 'Elite i20' }, { name: 'Venue' }]
                  },
                  {
                    name: 'Tata',
                    models: [{ name: 'Nexon' }, { name: 'Tiago' }, { name: 'Altroz' }, { name: 'Punch' }, { name: 'Harrier' }]
                  },
                  {
                    name: 'Renault',
                    models: [{ name: 'Kwid' }, { name: 'Kiger' }, { name: 'Triber' }, { name: 'Duster' }, { name: 'Captur' }]
                  }
                ];

                const activeBrands = brandsData.length > 0 ? brandsData : DEFAULT_MAKE_MODELS;
                const MODEL_LIMIT = 7; // Show 6 to 8 models by default

                return (
                  <div className={styles.makeModelGrid}>
                    {activeBrands.map((brand: any) => {
                      const brandKey = brand.id ? String(brand.id) : brand.name;
                      const brandModels = brand.models || [];
                      const isExpanded = !!expandedBrands[brandKey];
                      const visibleModels = isExpanded ? brandModels : brandModels.slice(0, MODEL_LIMIT);
                      const hasMore = brandModels.length > MODEL_LIMIT;

                      return (
                        <div key={brandKey} className={styles.makeModelCard}>
                          <button
                            onClick={() => {
                              setMakeModelMenuOpen(false);
                              handleNavFilter({ brands: [brand.name] });
                            }}
                            className={styles.makeModelBrandBtn}
                            title={`Filter cars by ${brand.name}`}
                          >
                            <span className={styles.brandTitleText}>{brand.name}</span>
                            <IconChevronRight size={12} className={styles.brandArrowIcon} />
                          </button>

                          {brandModels.length > 0 ? (
                            <ul className={styles.makeModelList}>
                              {visibleModels.map((m: any) => {
                                const modelName = typeof m === 'string' ? m : m.name;
                                return (
                                  <li key={modelName}>
                                    <button
                                      onClick={() => {
                                        setMakeModelMenuOpen(false);
                                        handleNavFilter({ brands: [brand.name], models: [modelName] });
                                      }}
                                      title={modelName}
                                    >
                                      {modelName}
                                    </button>
                                  </li>
                                );
                              })}
                            </ul>
                          ) : (
                            <div className={styles.emptyModelsBox}>
                              <button
                                onClick={() => {
                                  setMakeModelMenuOpen(false);
                                  handleNavFilter({ brands: [brand.name] });
                                }}
                                className={styles.emptyModelsBtn}
                              >
                                View all {brand.name}
                              </button>
                            </div>
                          )}

                          {hasMore && (
                            <button
                              onClick={(e) => toggleBrandExpand(e, brandKey)}
                              className={styles.makeModelToggleBtn}
                            >
                              {isExpanded ? (
                                <>Show less</>
                              ) : (
                                <>See more (+{brandModels.length - MODEL_LIMIT})</>
                              )}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Year Dropdown */}
          <div className={styles.dropdownWrapper}>
            <button className={styles.filterButton}>
              <span>Year</span>
              <IconChevronDown size={13} className={styles.chevronIcon} />
            </button>
            <div className={styles.dropdownMenu}>
              {[
                { label: '2024 & above', query: { year_min: 2024 } },
                { label: '2022 & above', query: { year_min: 2022 } },
                { label: '2020 & above', query: { year_min: 2020 } },
                { label: '2018 & above', query: { year_min: 2018 } },
                { label: '2016 & above', query: { year_min: 2016 } },
                { label: '2014 & above', query: { year_min: 2014 } },
                { label: '2012 & above', query: { year_min: 2012 } },
                { label: '2010 & above', query: { year_min: 2010 } }
              ].map((opt, i) => (
                <button key={i} onClick={() => handleNavFilter(opt.query)}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Fuel Dropdown */}
          <div className={styles.dropdownWrapper}>
            <button className={styles.filterButton}>
              <span>Fuel</span>
              <IconChevronDown size={13} className={styles.chevronIcon} />
            </button>
            <div className={styles.dropdownMenu}>
              {[
                { label: 'Petrol', query: { fuel: 'Petrol' } },
                { label: 'Diesel', query: { fuel: 'Diesel' } },
                { label: 'CNG', query: { fuel: 'CNG' } },
                { label: 'Petrol/CNG', query: { fuel: 'Petrol/CNG' } },
                { label: 'Electric', query: { fuel: 'Electric' } },
                { label: 'Hybrid', query: { fuel: 'Hybrid' } }
              ].map((opt, i) => (
                <button key={i} onClick={() => handleNavFilter(opt.query)}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* KM Driven Dropdown */}
          <div className={styles.dropdownWrapper}>
            <button className={styles.filterButton}>
              <span>KM Driven</span>
              <IconChevronDown size={13} className={styles.chevronIcon} />
            </button>
            <div className={styles.dropdownMenu}>
              {[
                { label: '10,000 kms or less', query: { km_max: 10000 } },
                { label: '30,000 kms or less', query: { km_max: 30000 } },
                { label: '50,000 kms or less', query: { km_max: 50000 } },
                { label: '75,000 kms or less', query: { km_max: 75000 } },
                { label: '1,00,000 kms or less', query: { km_max: 100000 } },
                { label: '1,25,000 kms or less', query: { km_max: 125000 } },
                { label: '1,50,000 kms or less', query: { km_max: 150000 } }
              ].map((opt, i) => (
                <button key={i} onClick={() => handleNavFilter(opt.query)}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Body Type Dropdown */}
          <div className={styles.dropdownWrapper}>
            <button className={styles.filterButton}>
              <span>Body Type</span>
              <IconChevronDown size={13} className={styles.chevronIcon} />
            </button>
            <div className={styles.dropdownMenu}>
              {[
                { label: 'Hatchback', query: { body_type: ['Hatchback'] } },
                { label: 'Sedan', query: { body_type: ['Sedan'] } },
                { label: 'SUV', query: { body_type: ['SUV'] } },
                { label: 'Compact SUV', query: { body_type: ['Compact SUV'] } },
                { label: 'MUV', query: { body_type: ['MUV'] } },
                { label: 'Luxury Sedan', query: { body_type: ['Luxury Sedan'] } },
                { label: 'Luxury SUV', query: { body_type: ['Luxury SUV'] } }
              ].map((opt, i) => (
                <button key={i} onClick={() => handleNavFilter(opt.query)}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Transmission Dropdown */}
          <div className={styles.dropdownWrapper}>
            <button className={styles.filterButton}>
              <span>Transmission</span>
              <IconChevronDown size={13} className={styles.chevronIcon} />
            </button>
            <div className={styles.dropdownMenu}>
              {[
                { label: 'Automatic', query: { transmission: 'Automatic' } },
                { label: 'Manual', query: { transmission: 'Manual' } }
              ].map((opt, i) => (
                <button key={i} onClick={() => handleNavFilter(opt.query)}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Owner Dropdown */}
          <div className={styles.dropdownWrapper}>
            <button className={styles.filterButton}>
              <span>Owner</span>
              <IconChevronDown size={13} className={styles.chevronIcon} />
            </button>
            <div className={styles.dropdownMenu}>
              {[
                { label: '1st Owner', query: { owners: ['1st Owner'] } },
                { label: '2nd Owner', query: { owners: ['2nd Owner'] } },
                { label: '3rd Owner', query: { owners: ['3rd Owner'] } }
              ].map((opt, i) => (
                <button key={i} onClick={() => handleNavFilter(opt.query)}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Highlighted Buttons */}
          <button
            onClick={() => handleNavFilter({ tag: 'Offer Zone', certification: '' })}
            className={`${styles.highlightedFilterBtn} ${styles.btnOfferZone}`}
          >
            <IconPercentage size={14} />
            <span>Offer Zone</span>
          </button>

          <button
            onClick={() => handleNavFilter({ tag: 'Selectt Luxury', certification: 'luxury' })}
            className={`${styles.highlightedFilterBtn} ${styles.btnPremiumCars}`}
          >
            <IconCrown size={14} />
            <span>Selectt Luxury</span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu (≤980px) Portal */}
      {mobileMenuOpen && typeof document !== 'undefined' && createPortal(
        <div className="md:hidden">
          {/* Backdrop Overlay */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[99999] transition-opacity duration-300" 
            onClick={() => setMobileMenuOpen(false)}
            onTouchStart={() => setMobileMenuOpen(false)} 
          />

          {/* Slide-In White Drawer Canvas (Left Side) */}
          <div 
            ref={mobileDrawerRef}
            className="fixed inset-y-0 left-0 z-[100000] w-[86%] max-w-[340px] h-full bg-white shadow-2xl flex flex-col overflow-hidden font-['Plus_Jakarta_Sans',sans-serif] transition-transform duration-300 ease-out" 
            style={{ animation: 'slideFromLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
            aria-label="Mobile Navigation Menu"
          >
            
            {/* Top User Profile Header (Dark Navy Theme - Sticky) */}
            <div className="sticky top-0 z-30 shrink-0 bg-gradient-to-r from-[#0C1B33] via-[#102340] to-[#0A1628] text-white px-4 py-3.5 flex items-center justify-between border-b border-white/10 shadow-sm">
              <Link
                to={user ? "/profile" : "#"}
                onClick={(e) => {
                  if (!user) {
                    e.preventDefault();
                    openLoginModal && openLoginModal();
                  }
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 text-white no-underline flex-1 min-w-0 group"
              >
                <div className="relative shrink-0">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-md shadow-[#13EDE5]/20 overflow-hidden p-1.5 border border-white/40 group-hover:scale-105 transition-transform">
                    <img
                      src="/img/favicon.png"
                      alt="Selectt"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = logoUrl || "/img/light-logo.svg";
                      }}
                    />
                  </div>
                  {user && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-[#0C1B33] rounded-full shadow-xs" />
                  )}
                </div>

                <div className="text-left flex-1 min-w-0 pr-1">
                  {user ? (
                    <>
                      <div className="text-sm font-bold text-white leading-snug flex items-center gap-1.5 truncate group-hover:text-[#13EDE5] transition-colors">
                        <span className="truncate">{user.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : `User`}</span>
                        <IconChevronRight size={14} className="text-[#13EDE5] shrink-0" />
                      </div>
                      <div className="text-[11.5px] text-slate-300 font-medium tracking-wide mt-0.5 truncate">
                        +91 {user.phone}
                      </div>
                    </>
                  ) : (
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-1.5 group-hover:text-[#13EDE5] transition-colors">
                        <span>Sign In / Register</span>
                        <IconChevronRight size={14} className="text-[#13EDE5] shrink-0" />
                      </div>
                      <div className="text-[11px] text-slate-300 font-normal mt-0.5">
                        Manage bookings & shortlist
                      </div>
                    </div>
                  )}
                </div>
              </Link>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:scale-90 border border-white/15 flex items-center justify-center text-slate-200 hover:text-white transition-all cursor-pointer shrink-0 ml-2"
                aria-label="Close mobile menu"
              >
                <IconX size={18} />
              </button>
            </div>

            {/* Scrollable Drawer Body (Unified Crisp Light/White Theme) */}
            <div className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-6 bg-white text-[#0C1B33]">

              {/* Mobile Search Input */}
              <div className="relative mb-1" ref={mobileSearchContainerRef}>
                <input
                  className="w-full pl-10 pr-4 py-2.5 text-xs font-normal bg-slate-50 border border-slate-200 rounded-full text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#13EDE5] focus:ring-2 focus:ring-[#13EDE5]/20 transition-all"
                  type="text"
                  value={searchText}
                  onChange={(e) => {
                    setSearchText(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={handleInputFocus}
                  onKeyDown={handleKeyDownSearch}
                  placeholder="Search by make, model, budget..."
                  aria-label="Search cars mobile"
                />
                <IconSearch size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />

                {/* Mobile Autocomplete Dropdown */}
                {showDropdown && (searchText.trim().length >= 2) && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden">
                    {searchLoading ? (
                      <div className="p-3 text-xs text-slate-500 font-normal text-center">Loading related cars...</div>
                    ) : searchResults.length > 0 ? (
                      <>
                        <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                          {searchResults.slice(0, 5).map((car) => {
                            const carImg = getCarImageUrl(car.image);
                            return (
                              <Link
                                key={car.id}
                                to={getCarDetailsUrl(car)}
                                className="flex items-center gap-3 p-2.5 hover:bg-slate-50 transition-colors text-left no-underline"
                                onClick={() => {
                                  setShowDropdown(false);
                                  setMobileMenuOpen(false);
                                }}
                              >
                                <img
                                  src={carImg}
                                  alt={`${car.make} ${car.model}`}
                                  className="w-12 h-10 object-cover rounded-lg shrink-0 bg-slate-100"
                                  onError={(e: any) => {
                                    e.target.src = DEFAULT_CAR_FALLBACK_IMAGE;
                                  }}
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs font-bold text-slate-900 truncate">
                                    {car.year} {car.make} {car.model}
                                  </div>
                                  <div className="text-[10px] text-slate-500 font-normal truncate">
                                    {(car.km || 0).toLocaleString()} km • {car.fuelType}
                                  </div>
                                </div>
                                <div className="text-xs font-bold text-[#00A884]">
                                  ₹{(car.price / 100000).toFixed(2)} L
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                        <button
                          onClick={() => {
                            handleTextSearch();
                            setShowDropdown(false);
                            setMobileMenuOpen(false);
                          }}
                          className="w-full py-2 bg-slate-100 text-[#00C9AF] font-bold text-xs hover:bg-slate-200 text-center"
                        >
                          View all results ({searchResults.length})
                        </button>
                      </>
                    ) : (
                      <div className="p-3 text-xs text-slate-500 font-normal text-center">No cars found matching "{searchText}"</div>
                    )}
                  </div>
                )}
              </div>

              {/* Home Button right after search bar */}
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all duration-200 no-underline mb-4 ${
                  location.pathname === '/'
                    ? 'bg-gradient-to-r from-[#0C1B33] via-[#102340] to-[#162A47] text-white border-[#13EDE5]/35 shadow-xs'
                    : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 shadow-2xs'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    location.pathname === '/' ? 'bg-[#13EDE5] text-[#0C1B33]' : 'bg-slate-100 text-[#0C1B33]'
                  }`}>
                    <IconHome size={18} strokeWidth={2.4} />
                  </div>
                  <div className="text-left">
                    <span className="text-xs font-black tracking-tight block leading-tight">Home</span>
                    <span className={`text-[10px] block leading-none font-medium mt-0.5 ${
                      location.pathname === '/' ? 'text-[#13EDE5]' : 'text-slate-400'
                    }`}>Return to main page</span>
                  </div>
                </div>
                <IconChevronRight size={15} className={location.pathname === '/' ? 'text-[#13EDE5]' : 'text-slate-400'} />
              </Link>

              {/* 1. BUY Section */}
              <div className="text-left">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[11px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-[#13EDE5]/15 text-[#0C1B33] border border-[#13EDE5]/30">
                    BUY
                  </span>
                  <div className="flex-1 h-px bg-slate-100" />
                </div>

                {/* By category */}
                <div className="mb-4">
                  <h4 className="text-xs font-bold text-[#0C1B33] mb-2.5 text-left">By category</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      {
                        name: 'MAX',
                        subtitle: 'Luxury cars',
                        icon: '🏆',
                        query: { budget: '10 L +' }
                      },
                      {
                        name: 'Assured+',
                        subtitle: 'Premium benefits',
                        icon: '⭐',
                        query: { certification: 'Assured+' }
                      },
                      {
                        name: 'Assured',
                        subtitle: 'Quality cars',
                        icon: '✅',
                        query: { certification: 'Assured' }
                      },
                      {
                        name: 'budget',
                        subtitle: 'Value picks',
                        icon: '💸',
                        query: { budget: 'Under 3 L' }
                      }
                    ].map((cat, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          handleNavFilter(cat.query);
                          setMobileMenuOpen(false);
                        }}
                        className="flex flex-col items-center cursor-pointer group text-center"
                      >
                        {/* Clean Brand Styling Box */}
                        <div className="w-full h-15 bg-slate-50 hover:bg-[#13EDE5]/10 border border-slate-200 hover:border-[#13EDE5] text-[#0C1B33] rounded-2xl flex flex-col items-center justify-center p-1 transition-all duration-200">
                          <span className="text-lg leading-none mb-0.5 group-hover:scale-110 transition-transform">{cat.icon}</span>
                          <span className="text-[11px] font-bold text-[#0C1B33] leading-tight tracking-tight">{cat.name}</span>
                        </div>
                        {/* Subtitle written BELOW the box */}
                        <span className="text-[9px] text-slate-500 font-normal leading-tight mt-1.5 w-full truncate">{cat.subtitle}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* By body type */}
                <div className="mb-4">
                  <h4 className="text-xs font-bold text-[#0C1B33] mb-2 text-left">By body type</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { name: 'Hatchback', icon: '🚗', query: { body_type: ['Hatchback'] } },
                      { name: 'Sedan', icon: '🏎️', query: { body_type: ['Sedan'] } },
                      { name: 'SUV', icon: '🚘', query: { body_type: ['SUV'] } },
                      { name: 'Compact SUV', icon: '🚙', query: { body_type: ['Compact SUV'] } },
                      { name: 'MUV', icon: '🚐', query: { body_type: ['MUV'] } },
                      { name: 'Luxury Sedan', icon: '✨', query: { body_type: ['Luxury Sedan'] } },
                      { name: 'Luxury SUV', icon: '👑', query: { body_type: ['Luxury SUV'] } },
                      { name: 'EV Cars', icon: '⚡', query: { fuel: 'EV' } }
                    ].map((type, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          handleNavFilter(type.query);
                          setMobileMenuOpen(false);
                        }}
                        className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-slate-50 active:scale-95 transition-all cursor-pointer group text-center"
                      >
                        <span className="text-2.5xl mb-1 group-hover:scale-115 transition-transform duration-200 filter drop-shadow-xs">
                          {type.icon}
                        </span>
                        <span className="text-[11px] font-bold text-slate-800 leading-tight">{type.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Full-width View All Cars Pill Button */}
                <Link
                  to="/buy-cars"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 bg-slate-50 hover:bg-[#13EDE5]/15 border border-slate-200 hover:border-[#13EDE5]/40 text-[#0C1B33] font-bold text-xs rounded-full flex items-center justify-center gap-1.5 transition-colors no-underline shadow-2xs"
                >
                  <span>View all cars</span>
                  <IconChevronRight size={16} className="text-[#0C1B33]" />
                </Link>
              </div>

              {/* 2. SELL Section (Highlighted Ultra-Premium Card) */}
              <div className="relative overflow-hidden rounded-2xl border border-cyan-200/80 bg-gradient-to-br from-cyan-50/70 via-white to-sky-50/60 p-3.5 shadow-sm shadow-cyan-500/10 text-left">
                {/* Subtle ambient cyan glow in corner */}
                <div className="absolute -right-8 -top-8 w-24 h-24 bg-[#13EDE5]/20 rounded-full blur-2xl pointer-events-none" />

                {/* Header with Badges */}
                <div className="flex items-center justify-between mb-3 relative z-10">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-[#13EDE5] text-[#0C1B33] shadow-xs">
                      SELL
                    </span>
                    <span className="text-xs font-bold text-[#0C1B33]">Sell In 24 Hours</span>
                  </div>
                  <span className="text-[9px] font-bold text-[#00A884] bg-emerald-100/90 px-2 py-0.5 rounded-full border border-emerald-200 uppercase tracking-wide">
                    BEST PRICE
                  </span>
                </div>

                {/* Primary Hero CTA Card */}
                <Link
                  to="/sell-car"
                  onClick={() => setMobileMenuOpen(false)}
                  className="relative flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-[#0C1B33] via-[#112344] to-[#0C1B33] text-white shadow-md shadow-[#0C1B33]/15 mb-2.5 no-underline group hover:shadow-lg transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#13EDE5]/20 border border-[#13EDE5]/40 flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition-transform">
                      🚘
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white whitespace-nowrap">
                          Sell Your Car
                        </span>
                        <span className="text-[9px] font-bold bg-[#13EDE5] text-[#0C1B33] px-1.5 py-0.5 rounded leading-none">
                          INSTANT
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-300 font-normal truncate mt-0.5">
                        Instant payment • Free doorstep pickup
                      </div>
                    </div>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-[#13EDE5] group-hover:bg-[#13EDE5] group-hover:text-[#0C1B33] group-hover:translate-x-0.5 transition-all shrink-0 ml-2">
                    <IconChevronRight size={15} />
                  </div>
                </Link>

                {/* 2 Quick-Action Highlighted Cards (Bold & Prominent) */}
                <div className="grid grid-cols-2 gap-2.5">
                  <Link
                    to="/sell-car"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex flex-col items-center justify-center p-3 rounded-2xl bg-gradient-to-b from-white to-[#F0FAF8] border-1.5 border-[#00C9AF]/45 hover:border-[#00C9AF] active:scale-95 transition-all no-underline group text-center shadow-[0_4px_14px_rgba(0,201,175,0.14)] hover:shadow-[0_6px_20px_rgba(0,201,175,0.22)]"
                  >
                    <div className="w-9 h-9 rounded-xl bg-[#E6FAF7] border border-[#00C9AF]/30 flex items-center justify-center text-lg mb-1 group-hover:scale-110 transition-transform shadow-xs">
                      🏷️
                    </div>
                    <span className="text-[13px] font-black text-[#0C1B33] leading-tight font-heading">Valuation</span>
                    <span className="text-[10.5px] text-[#008A77] font-bold leading-tight mt-0.5">Free instant quote</span>
                  </Link>

                  <Link
                    to="/used-car-loan"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex flex-col items-center justify-center p-3 rounded-2xl bg-gradient-to-b from-white to-[#F0FAF8] border-1.5 border-[#00C9AF]/45 hover:border-[#00C9AF] active:scale-95 transition-all no-underline group text-center shadow-[0_4px_14px_rgba(0,201,175,0.14)] hover:shadow-[0_6px_20px_rgba(0,201,175,0.22)]"
                  >
                    <div className="w-9 h-9 rounded-xl bg-[#E6FAF7] border border-[#00C9AF]/30 flex items-center justify-center text-lg mb-1 group-hover:scale-110 transition-transform shadow-xs">
                      🏦
                    </div>
                    <span className="text-[13px] font-black text-[#0C1B33] leading-tight font-heading">Car Loan</span>
                    <span className="text-[10.5px] text-[#008A77] font-bold leading-tight mt-0.5">Lowest EMI rates</span>
                  </Link>
                </div>
              </div>

              {/* 3. SERVICES & MORE Section (Clean Highlighted Box Cards) */}
              <div className="text-left">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10.5px] font-extrabold tracking-wider uppercase px-2.5 py-0.5 rounded-lg bg-[#13EDE5]/15 text-[#0C1B33] border border-[#13EDE5]/35">
                      SERVICES & MORE
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Explore</span>
                </div>

                <div className="space-y-1.5">
                  <Link
                    to="/selectt-buyback"
                    className="flex items-center justify-between p-2 sm:p-2.5 rounded-xl bg-white border border-slate-100 hover:border-[#00C9AF]/40 hover:bg-gradient-to-r hover:from-[#F0FAF8] hover:to-white shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-[0_3px_10px_rgba(0,201,175,0.1)] transition-all no-underline group"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-sm group-hover:bg-[#E6FAF7] group-hover:border-[#00C9AF]/30 group-hover:scale-110 transition-transform">
                        🔄
                      </div>
                      <span className="text-[12.5px] font-extrabold text-[#0C1B33] group-hover:text-[#008A77] tracking-tight transition-colors">Exchange & Buyback</span>
                    </div>
                    <span className="px-2 py-0.5 text-[8.5px] font-black uppercase rounded-full bg-[#13EDE5] text-[#0C1B33] tracking-wider shadow-2xs">
                      NEW
                    </span>
                  </Link>

                  <Link
                    to="/selectt-assured"
                    className="flex items-center justify-between p-2 sm:p-2.5 rounded-xl bg-white border border-slate-100 hover:border-[#00C9AF]/40 hover:bg-gradient-to-r hover:from-[#F0FAF8] hover:to-white shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-[0_3px_10px_rgba(0,201,175,0.1)] transition-all no-underline group"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-sm group-hover:bg-[#E6FAF7] group-hover:border-[#00C9AF]/30 group-hover:scale-110 transition-transform">
                        🛠️
                      </div>
                      <span className="text-[12.5px] font-extrabold text-[#0C1B33] group-hover:text-[#008A77] tracking-tight transition-colors">Pro Service & Warranty</span>
                    </div>
                    <span className="px-2 py-0.5 text-[8.5px] font-black uppercase rounded-full bg-[#13EDE5] text-[#0C1B33] tracking-wider shadow-2xs">
                      NEW
                    </span>
                  </Link>

                  <Link
                    to="/car-insurance"
                    className="flex items-center justify-between p-2 sm:p-2.5 rounded-xl bg-white border border-slate-100 hover:border-[#00C9AF]/40 hover:bg-gradient-to-r hover:from-[#F0FAF8] hover:to-white shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-[0_3px_10px_rgba(0,201,175,0.1)] transition-all no-underline group"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-sm group-hover:bg-[#E6FAF7] group-hover:border-[#00C9AF]/30 group-hover:scale-110 transition-transform">
                        🛡️
                      </div>
                      <span className="text-[12.5px] font-extrabold text-[#0C1B33] group-hover:text-[#008A77] tracking-tight transition-colors">Car Insurance</span>
                    </div>
                    <div className="w-5 h-5 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-[#008A77] group-hover:bg-[#E6FAF7] group-hover:translate-x-0.5 transition-all">
                      <IconChevronRight size={13} />
                    </div>
                  </Link>

                  <Link
                    to="/e-challan"
                    className="flex items-center justify-between p-2 sm:p-2.5 rounded-xl bg-white border border-slate-100 hover:border-[#00C9AF]/40 hover:bg-gradient-to-r hover:from-[#F0FAF8] hover:to-white shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-[0_3px_10px_rgba(0,201,175,0.1)] transition-all no-underline group"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-sm group-hover:bg-[#E6FAF7] group-hover:border-[#00C9AF]/30 group-hover:scale-110 transition-transform">
                        📄
                      </div>
                      <span className="text-[12.5px] font-extrabold text-[#0C1B33] group-hover:text-[#008A77] tracking-tight transition-colors">Check Challan</span>
                    </div>
                    <span className="px-2 py-0.5 text-[8.5px] font-black uppercase rounded-full bg-[#13EDE5] text-[#0C1B33] tracking-wider shadow-2xs">
                      NEW
                    </span>
                  </Link>

                  <Link
                    to="/pricing"
                    className="flex items-center justify-between p-2 sm:p-2.5 rounded-xl bg-white border border-slate-100 hover:border-[#00C9AF]/40 hover:bg-gradient-to-r hover:from-[#F0FAF8] hover:to-white shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-[0_3px_10px_rgba(0,201,175,0.1)] transition-all no-underline group"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-sm group-hover:bg-[#E6FAF7] group-hover:border-[#00C9AF]/30 group-hover:scale-110 transition-transform">
                        ⛽
                      </div>
                      <span className="text-[12.5px] font-extrabold text-[#0C1B33] group-hover:text-[#008A77] tracking-tight transition-colors">Recharge FASTag & EMI</span>
                    </div>
                    <div className="w-5 h-5 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-[#008A77] group-hover:bg-[#E6FAF7] group-hover:translate-x-0.5 transition-all">
                      <IconChevronRight size={13} />
                    </div>
                  </Link>

                  <Link
                    to="/profile?tab=wishlisted"
                    className="flex items-center justify-between p-2 sm:p-2.5 rounded-xl bg-white border border-slate-100 hover:border-[#00C9AF]/40 hover:bg-gradient-to-r hover:from-[#F0FAF8] hover:to-white shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-[0_3px_10px_rgba(0,201,175,0.1)] transition-all no-underline group"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-sm group-hover:bg-[#E6FAF7] group-hover:border-[#00C9AF]/30 group-hover:scale-110 transition-transform">
                        💖
                      </div>
                      <span className="text-[12.5px] font-extrabold text-[#0C1B33] group-hover:text-[#008A77] tracking-tight transition-colors">Wishlist & Shortlist</span>
                    </div>
                    <div className="w-5 h-5 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-[#008A77] group-hover:bg-[#E6FAF7] group-hover:translate-x-0.5 transition-all">
                      <IconChevronRight size={13} />
                    </div>
                  </Link>

                  <Link
                    to="/car-hub-locations"
                    className="flex items-center justify-between p-2 sm:p-2.5 rounded-xl bg-white border border-slate-100 hover:border-[#00C9AF]/40 hover:bg-gradient-to-r hover:from-[#F0FAF8] hover:to-white shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-[0_3px_10px_rgba(0,201,175,0.1)] transition-all no-underline group"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-sm group-hover:bg-[#E6FAF7] group-hover:border-[#00C9AF]/30 group-hover:scale-110 transition-transform">
                        📍
                      </div>
                      <span className="text-[12.5px] font-extrabold text-[#0C1B33] group-hover:text-[#008A77] tracking-tight transition-colors">Car Hub Locations</span>
                    </div>
                    <div className="w-5 h-5 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-[#008A77] group-hover:bg-[#E6FAF7] group-hover:translate-x-0.5 transition-all">
                      <IconChevronRight size={13} />
                    </div>
                  </Link>

                  <Link
                    to="/customer-reviews"
                    className="flex items-center justify-between p-2 sm:p-2.5 rounded-xl bg-white border border-slate-100 hover:border-[#00C9AF]/40 hover:bg-gradient-to-r hover:from-[#F0FAF8] hover:to-white shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-[0_3px_10px_rgba(0,201,175,0.1)] transition-all no-underline group"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-sm group-hover:bg-[#E6FAF7] group-hover:border-[#00C9AF]/30 group-hover:scale-110 transition-transform">
                        🌟
                      </div>
                      <span className="text-[12.5px] font-extrabold text-[#0C1B33] group-hover:text-[#008A77] tracking-tight transition-colors">Customer Reviews</span>
                    </div>
                    <div className="w-5 h-5 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-[#008A77] group-hover:bg-[#E6FAF7] group-hover:translate-x-0.5 transition-all">
                      <IconChevronRight size={13} />
                    </div>
                  </Link>

                  <Link
                    to="/about-us"
                    className="flex items-center justify-between p-2 sm:p-2.5 rounded-xl bg-white border border-slate-100 hover:border-[#00C9AF]/40 hover:bg-gradient-to-r hover:from-[#F0FAF8] hover:to-white shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-[0_3px_10px_rgba(0,201,175,0.1)] transition-all no-underline group"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-sm group-hover:bg-[#E6FAF7] group-hover:border-[#00C9AF]/30 group-hover:scale-110 transition-transform">
                        ℹ️
                      </div>
                      <span className="text-[12.5px] font-extrabold text-[#0C1B33] group-hover:text-[#008A77] tracking-tight transition-colors">About Us & FAQ</span>
                    </div>
                    <div className="w-5 h-5 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-[#008A77] group-hover:bg-[#E6FAF7] group-hover:translate-x-0.5 transition-all">
                      <IconChevronRight size={13} />
                    </div>
                  </Link>
                </div>
              </div>

              <div className="h-px bg-slate-100" />

              {/* Brand Color #13EDE5 Help Banner at Bottom */}
              <div className="pb-2">
                <a
                  href="tel:+918591969394"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3.5 p-3.5 bg-[#13EDE5]/20 border border-[#13EDE5]/50 rounded-2xl shadow-xs text-left no-underline group hover:bg-[#13EDE5]/30 transition-colors"
                >
                  <div className="w-11 h-11 rounded-full bg-[#13EDE5] text-[#0C1B33] flex items-center justify-center shadow-md shadow-[#13EDE5]/40 shrink-0 group-hover:scale-105 transition-transform">
                    <IconPhone size={20} stroke={2.5} />
                  </div>
                  <div>
                    <div className="text-[11px] font-black text-[#0C1B33] uppercase tracking-wider">NEED HELP?</div>
                    <div className="text-[15px] sm:text-base font-extrabold text-[#0C1B33] tracking-tight">Call us at +91 85919 69394</div>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
};

export default PremiumHeader;
