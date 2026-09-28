import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_URL, getCarImageUrl, DEFAULT_CAR_FALLBACK_IMAGE } from '../config/api';
import PageMeta from '../components/common/PageMeta';
import {
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Share2,
  Heart,
  Info,
  ShieldCheck,
  Calendar,
  Gauge,
  Fuel,
  Wrench,
  User,
  MapPin,
  CheckCircle2,
  Phone,
  History,
  UserCheck,
  Cpu,
  Key,
  Umbrella,
  FileText,
  X,
  Mail,
  Copy,
  Send,
  MessageCircle,
  ExternalLink,
  CreditCard,
  Percent,
  RotateCcw,
  ArrowRight,
  Navigation,
  ZoomIn,
  Camera,
  Video,
  IndianRupee,
  TrendingDown,
  Sparkles
} from 'lucide-react';
import CarCard from '../components/buy/CarCard';
import TopFeatures from '../components/buy/TopFeatures';
import FAQ from '../components/home/FAQ';
import Testimonials from '../components/home/Testimonials';
import RecentlyViewed from '../components/home/RecentlyViewed';
import TestDriveModal from '../components/buy/TestDriveModal';
import ReasonsToBuy from '../components/car-details/ReasonsToBuy';
import QualityReport from '../components/car-details/QualityReport';
import CarSpecifications from '../components/car-details/CarSpecifications';
import BenefitsAddons from '../components/car-details/BenefitsAddons';
import SectionDivider from '../components/common/SectionDivider';
import EmiCalculator from '../components/shared/EmiCalculator';
import PriceSummaryModal from '../components/car-details/PriceSummaryModal';
import { shortenLocation } from '../utils/formatters';

const hasPriceDrop = (car) => {
  if (!car || !car.price) return false;
  if (car.price_drop !== undefined) return Boolean(car.price_drop);
  if (car.is_price_drop !== undefined) return Boolean(car.is_price_drop);
  if (car.original_price && Number(car.original_price) > Number(car.price)) return true;
  if (car.originalPrice && Number(car.originalPrice) > Number(car.price)) return true;
  if (car.old_price && Number(car.old_price) > Number(car.price)) return true;
  if (car.oldPrice && Number(car.oldPrice) > Number(car.price)) return true;
  if (car.discount && Number(car.discount) > 0) return true;
  if (car.discount_amount && Number(car.discount_amount) > 0) return true;
  const tagStr = (car.tag || car.badgeText || '').toLowerCase();
  if (tagStr.includes('price drop') || tagStr.includes('reduced') || tagStr.includes('discount') || tagStr.includes('offer zone')) return true;
  return false;
};


const getYouTubeId = (url) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url?.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const getMediaType = (url) => {
  if (!url) return 'image';
  if (typeof url !== 'string') return 'image';
  const trimmed = url.trim();
  if (trimmed.includes('iframe.mediadelivery.net') || trimmed.includes('b-cdn.net') || trimmed.includes('bunnycdn.com') || trimmed.includes('video.bunnycdn') || /^[0-9a-fA-F-]{36}$/.test(trimmed)) {
    return 'bunny_stream';
  }
  const cleanUrl = trimmed.split('?')[0]; // Remove query params for checking extension
  if (cleanUrl.endsWith('.mp4') || cleanUrl.endsWith('.mov') || cleanUrl.endsWith('.MP4') || cleanUrl.endsWith('.MOV') || cleanUrl.endsWith('.webm')) {
    return 'video';
  }
  if (trimmed.includes('youtube.com') || trimmed.includes('youtu.be')) {
    return 'youtube';
  }
  return 'image';
};

const CarDetailsPage = () => {
  const params = useParams();
  const id = params.id || params['*']?.split('/').filter(Boolean).pop() || window.location.pathname.split('/').filter(Boolean).pop();
  const navigate = useNavigate();
  const { user, token, openLoginModal } = useAuth();
  const [car, setCar] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [similarCars, setSimilarCars] = useState([]);
  const [activeImage, setActiveImage] = useState(0);
  const [thumbStartIndex, setThumbStartIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(5);
  const [mainImageLoaded, setMainImageLoaded] = useState(false);
  const [isHoveringMain, setIsHoveringMain] = useState(false);
  const [isZoomEnabled, setIsZoomEnabled] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [zoomStyle, setZoomStyle] = useState({ display: 'none' });
  const [isOverviewOpen, setIsOverviewOpen] = useState(true);
  const [activeInfoModal, setActiveInfoModal] = useState(null); // 'returns' | 'warranty'
  const [isTestDriveOpen, setIsTestDriveOpen] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isWishlisting, setIsWishlisting] = useState(false);
  const [wishlistToast, setWishlistToast] = useState(null); // 'added' | 'removed'
  const [isPriceSummaryOpen, setIsPriceSummaryOpen] = useState(false);
  const [isComingSoonModalOpen, setIsComingSoonModalOpen] = useState(false);
  const [sidebarBanner, setSidebarBanner] = useState(null);
  const emiRef = useRef(null);

  useEffect(() => {
    fetch(`${API_URL}/api/banners?page=car-detail&type=sidebar`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setSidebarBanner(data[0]);
      })
      .catch(() => {});
  }, []);

  const handleBookNow = () => {
    if (car?.status === 'coming_soon') {
      setIsComingSoonModalOpen(true);
      return;
    }
    const checkoutUrl = `/checkout/${car.id}`;
    if (user) {
      navigate(checkoutUrl);
    } else {
      openLoginModal(checkoutUrl);
    }
  };

  const handleTestDriveClick = () => {
    if (car?.status === 'coming_soon') {
      setIsComingSoonModalOpen(true);
      return;
    }
    setIsTestDriveOpen(true);
  };

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`${API_URL}/api/cars/${id}`)
      .then(res => {
        if (!res.ok) {
          throw new Error('Car not found');
        }
        return res.json();
      })
      .then(data => {
        setCar(data);

        // Track Meta Pixel ViewContent for Catalog
        try {
          if (window.fbq && data && data.id) {
            window.fbq('track', 'ViewContent', {
              content_name: `${data.make || ''} ${data.model || ''} ${data.variant || ''}`.trim(),
              content_category: 'Vehicles & Parts > Vehicles > Motor Vehicles > Cars',
              content_ids: [String(data.id)],
              content_type: 'product',
              value: Number(data.price) || 0,
              currency: 'INR'
            });
          }
        } catch (e) {
          console.error("Error firing Meta ViewContent pixel event", e);
        }

        // Track recently viewed cars
        try {
          if (data && data.id) {
            let viewed = JSON.parse(localStorage.getItem('recently_viewed_cars')) || [];
            // Remove existing entry to move to front
            viewed = viewed.filter(c => c.id !== data.id);
            // Add to beginning
            viewed.unshift(data);
            // Keep maximum 10 cars
            if (viewed.length > 10) viewed = viewed.slice(0, 10);
            localStorage.setItem('recently_viewed_cars', JSON.stringify(viewed));
          }
        } catch (e) {
          console.error("Error saving recently viewed cars", e);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching car details:', err);
        setError(err.message || 'Car not found');
        setLoading(false);
      });

    fetch(`${API_URL}/api/cars`)
      .then(res => res.json())
      .then(data => {
        const filtered = data.filter(c => c.id.toString() !== id.toString() && c.status !== 'sold_out');
        setSimilarCars(filtered.slice(0, 4));
      })
      .catch(err => console.error('Error fetching similar cars', err));

    window.scrollTo(0, 0);
  }, [id]);

  const scrollToEMI = () => {
    emiRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const images = car ? [
    car.image,
    car.videoUrl,
    ...(car.moreImages || [])
  ].filter(Boolean) : [];

  if (images.length === 0) {
    images.push("https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&auto=format&fit=crop");
  }

  useEffect(() => {
    if (images.length === 0 || isHoveringMain) return;

    // Do not auto-scroll if the active slide is a video or YouTube embed
    if (getMediaType(images[activeImage]) !== 'image') return;

    const timer = setInterval(() => {
      setActiveImage((prev) => (prev >= images.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [images.length, activeImage, isHoveringMain]);

  const updateThumbStartIndex = (index) => {
    const maxStart = Math.max(0, images.length - visibleCount);
    setThumbStartIndex(Math.max(0, Math.min(maxStart, index)));
  };

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width >= 1536) {
        setVisibleCount(8);
      } else if (width >= 1280) {
        setVisibleCount(6);
      } else {
        setVisibleCount(5);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (activeImage < thumbStartIndex) {
      updateThumbStartIndex(activeImage);
    } else if (activeImage >= thumbStartIndex + visibleCount) {
      updateThumbStartIndex(activeImage - (visibleCount - 1));
    }
  }, [activeImage, images.length, thumbStartIndex, visibleCount]);

  useEffect(() => {
    setMainImageLoaded(false);
    setZoomStyle({ display: 'none', opacity: 0 });
    setIsZoomEnabled(false);
  }, [activeImage]);

  const handleMouseMove = (e) => {
    if (!isZoomEnabled || getMediaType(images[activeImage]) !== 'image') return;
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;

    const imgUrl = images[activeImage]?.startsWith('/') ? `${API_URL}${images[activeImage]}` : images[activeImage];

    setZoomStyle({
      display: 'block',
      backgroundImage: `url(${imgUrl})`,
      backgroundPosition: `${x}% ${y}%`,
      backgroundSize: '250%',
      opacity: 1
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ display: 'none', opacity: 0 });
  };

  const openLightbox = () => {
    setLightboxIndex(activeImage);
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight' && isLightboxOpen) {
        setLightboxIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
      }
      if (e.key === 'ArrowLeft' && isLightboxOpen) {
        setLightboxIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, images.length]);

  useEffect(() => {
    if (!user || !car || !token) return;
    fetch(`${API_URL}/api/wishlist/check/${car.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setIsWishlisted(data.isWishlisted))
      .catch(console.error);
  }, [user, car, token]);

  const handleWishlistToggle = async () => {
    if (!user) {
      openLoginModal(window.location.pathname);
      return;
    }
    setIsWishlisting(true);
    try {
      const res = await fetch(`${API_URL}/api/wishlist/${car.id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setIsWishlisted(data.isWishlisted);
        setWishlistToast(data.isWishlisted ? 'added' : 'removed');
        setTimeout(() => setWishlistToast(null), 2500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsWishlisting(false);
    }
  };

  const getDynamicShortlists = (id) => {
    if (!id) return 14;
    const str = String(id);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash % 34) + 12;
  };

  if (loading) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center gap-4 bg-[#f9f9f9]">
        <div className="w-12 h-12 border-3 border-[#00C9AF] border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs font-bold text-slate-500 tracking-widest uppercase">Loading Vehicle Details...</span>
      </div>
    );
  }

  if (error || !car) {
    return (
      <>
        <PageMeta title="Car Not Found | Selectt" description="The requested car could not be found." />
        <div className="pt-40 pb-32 text-center min-h-[60vh] flex flex-col items-center justify-center bg-[#f9f9f9] px-4">
          <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 shadow-2xl">
            <div className="w-16 h-16 bg-[#ff4a4a]/10 border border-[#ff4a4a]/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-[#ff4a4a]">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-[#0C1B33] mb-2">Car Not Found</h2>
            <p className="text-slate-650 mb-8 text-sm leading-relaxed">
              The car you are looking for is no longer available, might have been sold, or has been temporarily deactivated.
            </p>
            <button
              onClick={() => navigate('/buy-cars')}
              className="w-full py-4 bg-[#00C9AF] hover:bg-[#00b09e] text-[#0A1C3A] font-semibold rounded-2xl transition-all duration-300 shadow-lg shadow-[#00C9AF]/20"
            >
              Go to Buy Cars
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Wishlist Toast Notification */}
      {wishlistToast && (
        <div className={`fixed top-20 right-4 z-[9999] flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border transition-all duration-300 ${wishlistToast === 'added'
          ? 'bg-[#e6faf7] border-[#00C9AF]/30 text-[#00C9AF]'
          : 'bg-slate-50 border-slate-200 text-slate-500'
          }`}>
          <Heart size={18} fill={wishlistToast === 'added' ? 'currentColor' : 'none'} />
          <span className="text-sm font-bold">
            {wishlistToast === 'added' ? 'Added to wishlist!' : 'Removed from wishlist'}
          </span>
        </div>
      )}
      <PageMeta
        title={`${car.year} ${car.make} ${car.model} ${car.variant || ''} | Selectt`}
        description={`Buy certified pre-owned ${car.year} ${car.make} ${car.model} at Selectt. 200-point inspected, warranty included.`}
        schema={{
          "@context": "https://schema.org",
          "@type": "Product",
          "name": `${car.year} ${car.make} ${car.model} ${car.variant || ''}`,
          "image": car.image,
          "description": `Buy certified pre-owned ${car.year} ${car.make} ${car.model} at Selectt.`,
          "offers": {
            "@type": "Offer",
            "price": car.price,
            "priceCurrency": "INR",
            "itemCondition": "https://schema.org/UsedCondition",
            "availability": "https://schema.org/InStock"
          }
        }}
      />
      <div className="bg-[#f9f9f9] text-[#0C1B33] min-h-screen pt-0 lg:pt-4 pb-12">
        <div className="max-w-7xl mx-auto px-4">
          {/* Breadcrumbs */}
          <nav className="hidden lg:flex items-center gap-2 text-xs text-slate-400 mb-6 uppercase tracking-widest">
            <Link to="/" className="hover:text-[#00C9AF] transition-colors">Home</Link>
            <ChevronRight size={14} />
            <Link to="/buy-cars" className="hover:text-[#00C9AF] transition-colors">Used Cars</Link>
            <ChevronRight size={14} />
            <span className="text-slate-800 font-bold">{car.make} {car.model}</span>
          </nav>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content Area */}
            <div className="flex-1 order-1 lg:order-1">
              {/* Gallery Section */}
              <div className="bg-transparent border-none rounded-none -mx-4 lg:mx-0 lg:bg-white lg:border lg:border-slate-200 lg:rounded-2xl overflow-hidden lg:shadow-md mb-3 lg:mb-6">
                <div className="relative w-full aspect-video bg-[#050B16] lg:max-h-[380px] xl:max-h-[410px] overflow-hidden">
                  {getMediaType(images[activeImage]) === 'bunny_stream' ? (
                    <iframe
                      src={images[activeImage]?.includes('?') ? images[activeImage] : `${images[activeImage]}?autoplay=true&loop=false&muted=false&preload=true&responsive=true`}
                      loading="lazy"
                      className="w-full h-full border-0"
                      allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;"
                      allowFullScreen
                    />
                  ) : getMediaType(images[activeImage]) === 'video' ? (
                    <video
                      src={images[activeImage]?.startsWith('/') ? `${API_URL}${images[activeImage]}` : images[activeImage]}
                      className="w-full h-full object-cover"
                      controls
                      autoPlay
                      muted
                      playsInline
                    />
                  ) : getMediaType(images[activeImage]) === 'youtube' ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${getYouTubeId(images[activeImage])}`}
                      className="w-full h-full"
                      allowFullScreen
                      frameBorder="0"
                    />
                  ) : (
                    <div
                      className="relative w-full h-full bg-[#050B16] cursor-zoom-in overflow-hidden group/zoom"
                      onMouseEnter={() => setIsHoveringMain(true)}
                      onMouseMove={handleMouseMove}
                      onMouseLeave={() => {
                        setIsHoveringMain(false);
                        handleMouseLeave();
                      }}
                      onClick={openLightbox}
                    >
                      {/* Coming Soon Badge Tag on Main Image */}
                      {car.status === 'coming_soon' && (
                        <div className="absolute top-4 left-4 z-20 pointer-events-none">
                          <div className="bg-white text-[#0C1B33] px-3.5 py-1.5 rounded-full text-[11px] font-sans font-bold flex items-center shadow-lg border border-slate-200/90 tracking-wide uppercase">
                            <span>COMING SOON</span>
                          </div>
                        </div>
                      )}

                      <img
                        key={activeImage}
                        src={getCarImageUrl(images[activeImage])}
                        alt={`${car.year || ''} ${car.make || ''} ${car.model || ''} ${car.variant || ''} - Photo ${activeImage + 1} | Selectt Pre-Owned`}
                        loading="eager"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = DEFAULT_CAR_FALLBACK_IMAGE;
                        }}
                      />
                      <div
                        className="absolute inset-0 pointer-events-none transition-opacity duration-150 border border-white/10 shadow-inner"
                        style={{
                          ...zoomStyle,
                          backgroundRepeat: 'no-repeat',
                        }}
                      />
                      {getMediaType(images[activeImage]) === 'image' && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openLightbox();
                          }}
                          className="absolute bottom-4 right-4 z-20 p-2 py-1 sm:p-2.5 sm:py-1.5 rounded-full backdrop-blur-md transition-all shadow-lg flex items-center justify-center gap-1 sm:gap-1.5 border font-extrabold text-[9px] sm:text-xs uppercase tracking-wider bg-white/10 hover:bg-white/20 text-white border-white/10 hover:scale-105"
                          title="Open Lightbox Image Zoom"
                        >
                          <ZoomIn size={14} className="sm:w-4 sm:h-4" />
                          <span className="pr-1">Zoom</span>
                        </button>
                      )}
                    </div>
                  )}
                  <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-between px-4">
                    <button
                      onClick={() => setActiveImage(prev => (prev === 0 ? images.length - 1 : prev - 1))}
                      className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg hover:bg-white/25 text-white transition-all"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button
                      onClick={() => setActiveImage(prev => (prev === images.length - 1 ? 0 : prev + 1))}
                      className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg hover:bg-white/25 text-white transition-all"
                    >
                      <ChevronRight size={24} />
                    </button>
                  </div>

                  </div>

                  {/* 3-Button Media Selector Bar - Mobile Only (Tight Spacing & High Contrast Active Highlight) */}
                  <div className="flex lg:hidden items-center justify-between gap-2 pt-2 pb-0.5 px-3 bg-transparent relative z-20">
                    {/* 1st: 360° View Button */}
                    <button
                      type="button"
                      onClick={() => {
                        const index360 = images.findIndex(img => img?.includes('360') || img?.includes('spin'));
                        if (index360 !== -1) {
                          setActiveImage(index360);
                        } else {
                          openLightbox();
                        }
                      }}
                      className={`flex-1 py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider transition-all duration-200 active:scale-95 ${
                        (images[activeImage]?.includes('360') || images[activeImage]?.includes('spin'))
                          ? 'bg-[#0C1B33] text-[#00C9AF] border border-[#00C9AF]/50 shadow-sm'
                          : 'bg-white text-slate-700 border border-slate-200/80 hover:bg-slate-50'
                      }`}
                    >
                      <RotateCcw size={14} className="shrink-0" />
                      <span>360° View</span>
                    </button>

                    {/* 2nd: Images Button */}
                    <button
                      type="button"
                      onClick={() => {
                        const photoIdx = images.findIndex(img => getMediaType(img) === 'image' && !(img?.includes('360') || img?.includes('spin')));
                        setActiveImage(photoIdx !== -1 ? photoIdx : 0);
                      }}
                      className={`flex-1 py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider transition-all duration-200 active:scale-95 ${
                        getMediaType(images[activeImage]) === 'image' && !(images[activeImage]?.includes('360') || images[activeImage]?.includes('spin'))
                          ? 'bg-[#0C1B33] text-[#00C9AF] border border-[#00C9AF]/50 shadow-sm'
                          : 'bg-white text-slate-700 border border-slate-200/80 hover:bg-slate-50'
                      }`}
                    >
                      <Camera size={14} className="shrink-0" />
                      <span>Images</span>
                    </button>

                    {/* 3rd: Video Button */}
                    <button
                      type="button"
                      onClick={() => {
                        const videoIdx = images.findIndex(img => ['bunny_stream', 'video', 'youtube'].includes(getMediaType(img)));
                        if (videoIdx !== -1) {
                          setActiveImage(videoIdx);
                        } else {
                          setActiveImage(images.length > 1 ? images.length - 1 : 0);
                        }
                      }}
                      className={`flex-1 py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider transition-all duration-200 active:scale-95 ${
                        ['bunny_stream', 'video', 'youtube'].includes(getMediaType(images[activeImage]))
                          ? 'bg-[#0C1B33] text-[#00C9AF] border border-[#00C9AF]/50 shadow-sm'
                          : 'bg-white text-slate-700 border border-slate-200/80 hover:bg-slate-50'
                      }`}
                    >
                      <Video size={14} className="shrink-0" />
                      <span>Video</span>
                    </button>
                  </div>
                {/* Hidden preload images for next/prev slides (eliminates spinner on slide change) */}
                <div className="hidden" aria-hidden="true">
                  {images.map((img, idx) => {
                    if (getMediaType(img) !== 'image') return null;
                    const src = img?.startsWith('/') ? `${API_URL}${img}` : img;
                    return <img key={idx} src={src} alt="" loading={Math.abs(idx - activeImage) <= 2 ? 'eager' : 'lazy'} />;
                  })}
                </div>
                {images.length > 0 && (
                  <div className="hidden lg:flex items-center justify-center gap-2 p-4 border-t border-white/5">
                    {/* Left navigation arrow */}
                    <button
                      onClick={() => updateThumbStartIndex(thumbStartIndex - 1)}
                      disabled={thumbStartIndex === 0}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all bg-white/5 border border-white/10 hover:bg-white/10 ${thumbStartIndex === 0 ? 'opacity-30 cursor-not-allowed' : 'text-white hover:shadow-sm'
                        }`}
                    >
                      <ChevronLeft size={16} />
                    </button>

                    {/* Thumbnail viewport */}
                    <div className="overflow-hidden py-1" style={{ width: `${visibleCount * 96 + (visibleCount - 1) * 12}px` }}>
                      <div
                        className="flex gap-3 transition-transform duration-300 ease-in-out"
                        style={{ transform: `translateX(-${thumbStartIndex * (96 + 12)}px)` }}
                      >
                        {images.map((img, idx) => {
                          const mediaType = getMediaType(img);
                          const ytId = mediaType === 'youtube' ? getYouTubeId(img) : null;
                          const ytThumb = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null;

                          return (
                            <button
                              key={idx}
                              onClick={() => setActiveImage(idx)}
                              className={`relative w-24 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${activeImage === idx
                                ? 'border-[#00C9AF] shadow-md scale-105'
                                : 'border-transparent opacity-60 hover:opacity-100'
                                }`}
                            >
                              {mediaType === 'bunny_stream' ? (
                                <div className="relative w-full h-full bg-[#0C1B33] flex items-center justify-center">
                                  <div className="w-6 h-6 rounded-full bg-[#00C9AF] text-[#0A1C3A] flex items-center justify-center shadow text-[10px] pl-0.5 animate-pulse">▶</div>
                                  <span className="absolute bottom-1 text-[8px] font-bold text-white uppercase tracking-wider bg-black/70 px-1 rounded">Video</span>
                                </div>
                              ) : mediaType === 'video' ? (
                                <div className="relative w-full h-full bg-slate-950">
                                  <video
                                    src={img?.startsWith('/') ? `${API_URL}${img}` : img}
                                    className="w-full h-full object-cover opacity-60 pointer-events-none"
                                    preload="metadata"
                                    muted
                                  />
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-6 h-6 rounded-full bg-[#00C9AF] text-[#0A1C3A] flex items-center justify-center shadow text-[10px] pl-0.5 animate-pulse">▶</div>
                                  </div>
                                </div>
                              ) : mediaType === 'youtube' ? (
                                <div className="relative w-full h-full bg-slate-950">
                                  {ytThumb ? (
                                    <img
                                      src={ytThumb}
                                      className="w-full h-full object-cover opacity-60 pointer-events-none"
                                      alt="YouTube thumbnail"
                                      loading="lazy"
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-red-600" />
                                  )}
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center shadow text-[10px] pl-0.5 animate-pulse">▶</div>
                                  </div>
                                </div>
                              ) : (
                                <img
                                  src={getCarImageUrl(img)}
                                  className="w-full h-full object-cover"
                                  alt={`${car.year || ''} ${car.make || ''} ${car.model || ''} - Thumbnail ${idx + 1}`}
                                  loading="lazy"
                                  onError={(e) => {
                                    e.target.src = DEFAULT_CAR_FALLBACK_IMAGE;
                                  }}
                                />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Right navigation arrow */}
                    <button
                      onClick={() => updateThumbStartIndex(thumbStartIndex + 1)}
                      disabled={thumbStartIndex >= images.length - visibleCount}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all bg-white/5 border border-white/10 hover:bg-white/10 ${thumbStartIndex >= images.length - visibleCount ? 'opacity-30 cursor-not-allowed' : 'text-white hover:shadow-sm'
                        }`}
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile Title & Price Card - High Fidelity View (Below Gallery) */}
              <div className="lg:hidden bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 mb-4 shadow-md text-left">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h1 className="text-lg sm:text-xl font-heading font-extrabold text-[#0C1B33] leading-snug mb-1">
                      {car.title || `${car.year} ${car.make} ${car.model}`}
                    </h1>
                    <div className="text-xs sm:text-sm font-medium text-slate-600 flex items-center gap-2">
                      <span>{car.km.toLocaleString()} km</span>
                      <span className="w-1 h-1 bg-slate-300 rounded-full" />
                      <span>{car.fuelType}</span>
                      <span className="w-1 h-1 bg-slate-300 rounded-full" />
                      <span>{car.transmission}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-center">
                    <button
                      onClick={handleWishlistToggle}
                      disabled={isWishlisting}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isWishlisted ? 'text-red-500 bg-red-50' : 'bg-slate-100 text-slate-500 hover:text-red-500 hover:bg-red-50'}`}>
                      <Heart size={20} fill={isWishlisted ? 'currentColor' : 'none'} />
                    </button>
                    <span className="text-[10px] text-slate-500 font-medium text-center mt-1 leading-tight">
                      {car.shortlistedCount || getDynamicShortlists(car?.id)} people<br />shortlisted
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700 font-semibold min-w-0 pr-2">
                    <Navigation size={15} className="text-[#00C9AF] shrink-0" />
                    <span className="truncate max-w-[200px] xl:max-w-[240px]" title={car.location || car.hubLocation || ''}>
                      {shortenLocation(car.location || car.hubLocation || 'Spinny Mini Car Hub, Rohini')}
                    </span>
                  </div>
                  <a href="tel:+919876543210" className="flex items-center gap-2 cursor-pointer group hover:-translate-y-1 transition-all duration-300">
                    <div className="w-10 h-10 bg-[#e6faf7] border border-[#00C9AF]/60 rounded-full flex items-center justify-center text-[#00C9AF] shadow-[0_0_18px_rgba(0,196,175,0.4)] animate-pulse group-hover:bg-[#00C9AF] group-hover:text-[#0A1C3A] transition-colors">
                      <Phone size={18} className="animate-phone-ring" />
                    </div>
                    <span className="text-xs font-bold text-[#00C9AF] uppercase tracking-wider group-hover:text-[#00B4A0] transition-colors">Call us</span>
                  </a>
                </div>

                <div className="flex items-center gap-2.5 mb-3">
                  <div className="bg-[#00C9AF] text-[#0A1C3A] px-3 py-1 rounded-full text-xs font-heading font-bold flex items-center gap-1.5 shadow-xs shrink-0">
                    <div className="w-[16px] h-[16px] bg-white text-[#0A1C3A] rounded-full flex items-center justify-center shrink-0">
                      <IndianRupee size={10} className="stroke-[3]" />
                    </div>
                    Budget
                  </div>
                  <span className="text-xs sm:text-sm font-sans font-medium text-slate-600 flex items-center gap-1">
                    Highly affordable & reliable
                    <Info size={14} className="text-slate-400" />
                  </span>
                </div>

                <div
                  className="pt-3 border-t border-dashed border-slate-200/80 mb-3 cursor-pointer group"
                  onClick={() => setIsPriceSummaryOpen(true)}
                >
                  <div className="text-xs font-sans font-bold text-slate-500 uppercase tracking-wider mb-1 group-hover:text-[#00C9AF] transition-colors">Fixed on road price</div>
                  <div className="flex flex-row items-baseline justify-between w-full flex-wrap gap-1">
                    {/* Only show strikethrough if real original price exists */}
                    {(car.original_price || car.originalPrice || car.old_price || car.oldPrice) && (
                      <span className="text-sm font-sans font-medium text-slate-400 line-through leading-none mt-1">
                        ₹{(((car.original_price || car.originalPrice || car.old_price || car.oldPrice)) / 100000).toFixed(2)} Lakh
                      </span>
                    )}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-2xl sm:text-3xl font-heading font-black text-slate-900 leading-none group-hover:text-[#00C9AF] transition-colors">₹{(car.price / 100000).toFixed(2)} Lakh</span>
                      <Info size={16} className="text-slate-400 group-hover:text-[#00C9AF] transition-colors" />
                      {hasPriceDrop(car) && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-sans font-bold bg-[#FFF0F3] text-[#E11D48] border border-[#FFE0E6] shadow-xs tracking-tight shrink-0">
                          <TrendingDown size={12} strokeWidth={2.5} className="shrink-0 text-[#E11D48]" />
                          <span>Price Drop</span>
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm font-sans font-medium text-slate-500 mt-1.5">Excludes RC transfer, insurance & more</p>
                </div>

                <div className="bg-slate-50 rounded-2xl p-3 sm:p-4 mb-3 border border-slate-100/50">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-base font-extrabold text-teal-650 whitespace-nowrap">₹{(car.emiStart || car.emi || 8184).toLocaleString()}/m</span>
                      </div>
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate">Special starting EMI</div>
                    </div>
                    <button onClick={scrollToEMI} className="bg-[#00C9AF] text-[#0A1C3A] px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-indigo-100 transition-all active:scale-95 whitespace-nowrap shrink-0">
                      Calculate your EMI
                    </button>
                  </div>

                  <div className="bg-[#00C9AF]/8 rounded-xl p-2.5 flex items-center gap-2 border border-[#0C1B33]/10">
                    <div className="w-4 h-4 bg-[#0C1B33] rounded-full flex items-center justify-center text-[10px] text-white shrink-0">✓</div>
                    <span className="text-xs sm:text-sm text-slate-700 font-semibold leading-tight">
                      Save ₹{(car.savingsAmount || 4248).toLocaleString()} in interest. Special rate starts at 11.99%
                    </span>
                  </div>
                </div>
              </div>

              {/* Car Overview */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm mb-6 overflow-hidden text-[#0C1B33] text-left">
                <div className="p-5 md:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <h2 className="text-lg md:text-xl font-sans font-bold text-[#0C1B33]">Car Overview</h2>
                    <div className="flex gap-1.5 shrink-0">
                      <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-sans font-bold uppercase tracking-wider">CERTIFIED</span>
                      <span className="px-2.5 py-1 bg-[#00C9AF]/15 text-teal-800 rounded-lg text-xs font-sans font-bold uppercase tracking-wider">SINGLE OWNER</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 sm:gap-x-8 gap-y-6">
                    {[
                      { icon: <Calendar size={18} />, label: 'Reg. year', value: car.regYear || car.year },
                      { icon: <Fuel size={18} />, label: 'Fuel', value: car.fuelType },
                      { icon: <Gauge size={18} />, label: 'KM driven', value: `${(car.km || 0).toLocaleString()} km` },
                      { icon: <History size={18} />, label: 'Transmission', value: car.transmission },
                      { icon: <Cpu size={18} />, label: 'Engine', value: car.engineCapacity || '-' },
                      { icon: <UserCheck size={18} />, label: 'Ownership', value: car.ownership || '1st Owner' },
                      { icon: <ShieldCheck size={18} />, label: 'Insurance', value: car.insuranceStatus || 'Active' },
                      { icon: <Key size={18} />, label: 'Spare key', value: car.spareKey || 'Yes' },
                      { icon: <MapPin size={18} />, label: 'Reg State', value: car.regState || 'Delhi' },
                    ].map((item, idx) => (
                      <div key={idx} className="flex gap-3 group">
                        <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200/50 flex items-center justify-center shrink-0 text-[#00C9AF] group-hover:bg-[#00C9AF] group-hover:text-[#0C1B33] transition-colors duration-300">
                          {item.icon}
                        </div>
                        <div className="flex flex-col justify-center">
                          <span className="text-[11px] text-slate-400 font-sans font-semibold uppercase tracking-wider mb-0.5">{item.label}</span>
                          <span className="text-sm font-sans font-bold text-slate-900 leading-tight">{item.value}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Custom Description & Highlights */}
                  {car.description && (
                    <div className="mt-6 pt-5 border-t border-slate-100">
                      <div className="flex items-center gap-2 mb-2.5">
                        <div className="w-1 h-4 bg-[#00C9AF] rounded-full" />
                        <h3 className="text-xs font-sans font-bold text-[#0C1B33] uppercase tracking-wider">
                          Vehicle Highlights & Overview
                        </h3>
                      </div>
                      <div className="bg-slate-50/90 rounded-xl p-4 border border-slate-100/80 text-sm font-sans text-slate-700 leading-relaxed whitespace-pre-line">
                        {car.description}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <CarSpecifications specifications={car.specifications} theme="light" />
              <QualityReport report={car.qualityReport} theme="light" />

              {/* Top Features */}
              <TopFeatures features={car.features} theme="light" />

              <BenefitsAddons />

              <ReasonsToBuy reasons={car.reasonsToBuy} theme="light" />

              {/* Inline EMI Calculator Section */}
              <div ref={emiRef} className="scroll-mt-24 mb-8">
                {(() => {
                  const rawPrice = Number(car?.price || 500000);
                  // Max loan limit is exactly Car Price + ₹1,00,000 (1 Lakh extra buffer over car price)
                  const maxLoan = rawPrice + 100000;
                  return (
                    <EmiCalculator 
                      price={rawPrice} 
                      minAmount={100000} 
                      maxAmount={maxLoan} 
                      defaultLoanAmount={rawPrice}
                      theme="white" 
                    />
                  );
                })()}
              </div>

              {/* Why Choose Selectt Section */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm mb-6 relative overflow-hidden text-[#0C1B33]">

                <h2 className="text-lg font-bold text-[#0C1B33] mb-4 relative">Why Choose Selectt?</h2>

                <div className="grid grid-cols-1 gap-3 relative">
                  {/* Item 1: Returns */}
                  <div
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/85 hover:bg-slate-100 hover:shadow-md transition-all duration-300 cursor-pointer group/item"
                    onClick={() => setActiveInfoModal('returns')}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white shrink-0">
                        <RotateCcw size={18} strokeWidth={2.5} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-0.5">
                          <h3 className="text-sm font-bold text-[#0C1B33]">30-Day returns</h3>
                          <ArrowRight size={14} className="text-indigo-600 group-hover/item:translate-x-1 transition-transform" />
                        </div>
                        <p className="text-[11px] text-slate-500 leading-normal">Not the right fit? Exchange it or get a full refund within 30 days — no questions asked.</p>
                      </div>
                    </div>
                  </div>

                  {/* Item 2: Warranty */}
                  <div
                    className="p-3.5 rounded-2xl bg-[#00C9AF]/5 border border-[#00C9AF]/20 hover:bg-[#00C9AF]/10 hover:shadow-md transition-all duration-300 cursor-pointer group/item"
                    onClick={() => setActiveInfoModal('warranty')}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-[#00C9AF] rounded-xl flex items-center justify-center text-[#0A1C3A] shrink-0">
                        <ShieldCheck size={18} strokeWidth={2.5} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-0.5">
                          <h3 className="text-sm font-bold text-[#0C1B33]">Lifetime coverage</h3>
                          <ArrowRight size={14} className="text-[#00C9AF] group-hover/item:translate-x-1 transition-transform" />
                        </div>
                        <p className="text-[11px] text-slate-500 leading-normal">Drive with total peace of mind. Every Selectt car comes with an upgradeable lifetime warranty.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sticky Sidebar Info - Hidden on Mobile */}
            <aside className="hidden lg:block lg:w-[360px] xl:w-[380px] lg:order-2">
              <div className="lg:sticky lg:top-[128px] space-y-3">

                {/* Promotional Banner - Dynamic from admin */}
                {sidebarBanner && sidebarBanner.image_url && (
                  <div className="rounded-2xl overflow-hidden shadow-lg">
                    <img
                      src={sidebarBanner.image_url.startsWith('/') ? `${API_URL}${sidebarBanner.image_url}` : sidebarBanner.image_url}
                      alt={sidebarBanner.title || 'Promotional Banner'}
                      className="w-full h-auto object-cover"
                    />
                  </div>
                )}

                <div className="bg-white border border-slate-200 rounded-2xl p-4 xl:p-5 shadow-lg shadow-slate-100/50 text-left">
                  <div className="flex justify-between items-start mb-1.5">
                    <div>
                      <h1 className="text-base xl:text-lg font-bold text-[#0C1B33] leading-snug mb-0.5">
                        {car.title || `${car.year} ${car.make} ${car.model}`}
                      </h1>
                      <div className="text-xs xl:text-sm text-slate-500 font-sans font-medium flex items-center gap-1.5">
                        <span>{(car.km || 0).toLocaleString()} km</span>
                        <span>•</span>
                        <span>{car.fuelType}</span>
                        <span>•</span>
                        <span>{car.transmission}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-center shrink-0">
                      <button
                        onClick={handleWishlistToggle}
                        disabled={isWishlisting}
                        className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors border shadow-sm ${isWishlisted ? 'text-red-500 bg-red-50 border-red-200/50' : 'bg-slate-50 text-slate-500 hover:text-red-500 hover:bg-slate-100 border-slate-200/50'}`}>
                        <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
                      </button>
                      <span className="text-[9px] text-slate-400 font-sans font-medium mt-0.5 text-center leading-tight">
                        {car.shortlistedCount || getDynamicShortlists(car?.id)} people<br />shortlisted
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 text-xs xl:text-sm text-slate-700 font-medium min-w-0 pr-2">
                      <Navigation size={16} className="text-[#00C9AF] shrink-0" />
                      <span
                        className="cursor-pointer hover:text-[#00c9af] transition-colors text-slate-650 truncate max-w-[200px] xl:max-w-[240px]"
                        title={car.location || car.hubLocation || ''}
                      >
                        {shortenLocation(car.location || car.hubLocation || 'Metro Walk, Rohini, Navi Mumbai')}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 cursor-pointer group hover:-translate-y-0.5 transition-all duration-300 shrink-0">
                      <div className="w-8 h-8 bg-[#e6faf7] rounded-full flex items-center justify-center text-[#00C9AF] group-hover:bg-[#00C9AF] group-hover:text-[#0c1b33] transition-colors border border-[#00C9AF]/50 shadow-[0_0_10px_rgba(0,196,175,0.2)]">
                        <Phone size={14} className="animate-pulse" />
                      </div>
                      <span className="text-xs font-bold text-[#00C9AF]">Call us</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="flex items-center gap-1 px-3 py-1 bg-[#00c9af] text-[#0c1b33] rounded-full text-xs font-sans font-bold shrink-0 shadow-xs">
                      <div className="w-[16px] h-[16px] bg-white text-[#0c1b33] rounded-full flex items-center justify-center shrink-0">
                        <IndianRupee size={10} className="stroke-[3]" />
                      </div>
                      Budget
                    </div>
                    <div className="text-xs font-sans font-medium text-slate-600 flex items-center gap-1">
                      Highly affordable & reliable
                      <Info size={13} className="text-slate-400" />
                    </div>
                  </div>

                  <div
                    className="border-t border-dashed border-slate-200/80 pt-3 mb-3 cursor-pointer group"
                    onClick={() => setIsPriceSummaryOpen(true)}
                  >
                    <div className="text-[11px] font-sans font-bold text-slate-400 uppercase tracking-wider mb-1 group-hover:text-[#00C9AF] transition-colors">Fixed on road price</div>
                    <div className="flex flex-col items-start gap-1">
                      {/* Only show strikethrough if real original price exists */}
                      {(car.original_price || car.originalPrice || car.old_price || car.oldPrice) && (
                        <span className="text-sm font-sans font-medium text-slate-400 line-through leading-none">
                          ₹{(((car.original_price || car.originalPrice || car.old_price || car.oldPrice)) / 100000).toFixed(2)} Lakh
                        </span>
                      )}
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span className="text-2xl xl:text-3xl font-sans font-bold text-slate-900 leading-none group-hover:text-[#00C9AF] transition-colors">₹{(car.price / 100000).toFixed(2)} Lakh</span>
                        <Info size={15} className="text-slate-400 group-hover:text-[#00C9AF] transition-colors" />
                        {hasPriceDrop(car) && (() => {
                          const orig = Number(car.original_price || car.originalPrice || car.old_price || car.oldPrice || 0);
                          const current = Number(car.price || 0);
                          let dropBadgeText = "Price Drop";
                          if (orig > current && orig > 0) {
                            const diff = orig - current;
                            const pct = Math.round((diff / orig) * 100);
                            if (pct > 0) {
                              dropBadgeText = `Price Drop (${pct}% OFF)`;
                            }
                          }
                          return (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-sans font-bold bg-[#FFF0F3] text-[#E11D48] border border-[#FFE0E6] shadow-xs tracking-tight shrink-0">
                              <TrendingDown size={11} strokeWidth={2.5} className="shrink-0 text-[#E11D48]" />
                              <span>{dropBadgeText}</span>
                            </span>
                          );
                        })()}
                      </div>
                    </div>
                    <p className="text-xs font-sans font-medium text-slate-500 mt-1.5">Excludes RC transfer, insurance & more</p>
                  </div>

                  <div className="border-t border-dashed border-slate-200/80 pt-3 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-lg font-sans font-bold text-teal-650">₹{(car.emiStart || car.emi || 8184).toLocaleString()}/m</span>
                        </div>
                        <div className="text-[11px] font-sans font-bold text-slate-400 uppercase tracking-wider">Special starting EMI</div>
                      </div>
                      <button
                        onClick={scrollToEMI}
                        className="bg-[#00C9AF] text-[#0C1B33] px-3.5 py-2 rounded-xl font-sans font-bold text-[11px] shadow-xs hover:bg-[#00B49F] transition-all uppercase tracking-wider cursor-pointer"
                      >
                        Calculate your EMI
                      </button>
                    </div>
                    <div className="mt-3 bg-[#00C9AF]/8 rounded-xl p-2.5 flex items-center gap-2 border border-[#00C9AF]/20">
                      <div className="w-4 h-4 bg-[#0C1B33] rounded-full flex items-center justify-center text-[10px] text-white font-bold shrink-0">✓</div>
                      <span className="text-xs font-sans font-medium text-slate-700 leading-tight">
                        Save ₹{(car.savingsAmount || 4248).toLocaleString()} in interest. Special rate starts at 11.99%
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={handleBookNow}
                      className="relative overflow-hidden bg-[#00C9AF] text-[#0C1B33] py-3 rounded-xl font-sans font-bold text-xs shadow-xl shadow-[#00C9AF]/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex flex-col items-center justify-center uppercase tracking-wider group cursor-pointer"
                    >
                      {/* Shimmer/glare animation */}
                      <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
                      <span>BOOK NOW</span>
                      <span className="text-[8.5px] font-sans font-bold opacity-75">100% refundable</span>
                    </button>
                    <button
                      onClick={handleTestDriveClick}
                      className="bg-[#EF4444] text-white hover:bg-[#DC2626] border border-transparent shadow-lg shadow-[#EF4444]/25 py-3 rounded-xl font-sans font-bold text-xs hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center uppercase tracking-wider cursor-pointer"
                    >
                      FREE TEST DRIVE
                    </button>
                  </div>

                  {/* Share with a friend */}
                  <div className="pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-bold text-slate-400 whitespace-nowrap">Share with a friend :</span>
                      <div className="flex items-center gap-2">
                        {/* WhatsApp */}
                        <a
                          href={`https://wa.me/?text=${encodeURIComponent(`Check out this ${car.year} ${car.make} ${car.model} on Selectt: ${window.location.href}`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 rounded-full bg-[#25D366]/10 hover:bg-[#25D366] border border-[#25D366]/30 flex items-center justify-center text-[#25D366] hover:text-white transition-all duration-200 hover:scale-110 group"
                          title="Share on WhatsApp"
                        >
                          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                          </svg>
                        </a>
                        {/* Facebook */}
                        <a
                          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 rounded-full bg-[#1877F2]/10 hover:bg-[#1877F2] border border-[#1877F2]/30 flex items-center justify-center text-[#1877F2] hover:text-white transition-all duration-200 hover:scale-110"
                          title="Share on Facebook"
                        >
                          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                          </svg>
                        </a>
                        {/* X / Twitter */}
                        <a
                          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out this ${car.year} ${car.make} ${car.model} on Selectt!`)}&url=${encodeURIComponent(window.location.href)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-900 border border-slate-200 flex items-center justify-center text-slate-700 hover:text-white transition-all duration-200 hover:scale-110"
                          title="Share on X"
                        >
                          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                          </svg>
                        </a>
                        {/* Email */}
                        <a
                          href={`mailto:?subject=${encodeURIComponent(`Check out this ${car.year} ${car.make} ${car.model}`)}&body=${encodeURIComponent(`I found this car on Selectt and thought you'd like it!\n\n${car.year} ${car.make} ${car.model}\nPrice: ₹${(car.price / 100000).toFixed(2)} Lakh\n\n${window.location.href}`)}`}
                          className="w-8 h-8 rounded-full bg-violet-50 hover:bg-violet-600 border border-violet-200 flex items-center justify-center text-violet-500 hover:text-white transition-all duration-200 hover:scale-110"
                          title="Share via Email"
                        >
                          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                          </svg>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </aside>
          </div>
        </div>

        {/* Similar Cars Section - full width */}
        <div className="mt-10 w-full">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-[#0C1B33] mb-8 flex items-center justify-center gap-5 w-full">
              <div className="h-px flex-1 bg-slate-300 max-w-[100px] md:max-w-none" />
              <span className="shrink-0 text-center">{`People Also Viewed These`}</span>
              <div className="h-px flex-1 bg-slate-300 max-w-[100px] md:max-w-none" />
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {similarCars.map(c => (
                <CarCard key={c.id} car={c} lightBg={true} />
              ))}
            </div>
          </div>
        </div>

        {/* Full Width Bottom Sections */}
        <div className="mt-20">
          <RecentlyViewed title="Still Can’t Decide?" lightBg={true} />
        </div>

        <SectionDivider title="What Motivates Us" align="left" bgClass="bg-[#f9f9f9]" textClass="text-[#0C1B33]" pyClass="pt-6 pb-0 md:pt-8 md:pb-0" />
        <Testimonials
          bgClass="bg-transparent md:bg-transparent"
          textClass="text-slate-650"
          btnActive="bg-white border border-slate-300 text-slate-700 hover:bg-[#00C9AF] hover:border-[#00C9AF] hover:text-[#0C1B33] hover:shadow-md"
          btnDisabled="bg-slate-200/50 border border-slate-300/80 text-slate-400 cursor-not-allowed"
        />
        <div className="">
          <FAQ dark={false} />
        </div>

        {/* Info Modals */}
        {activeInfoModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
              onClick={() => setActiveInfoModal(null)}
            />

            {/* Modal Card */}
            <div className="bg-white rounded-[32px] w-full max-w-2xl relative z-10 shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
              {/* Header */}
              <div className="p-8 pb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-[#0C1B33]">
                    {activeInfoModal === 'returns' ? '30-day return policy' : 'Lifetime Warranty Upgrade'}
                  </h2>
                  <div className="w-6 h-6 bg-[#00C9AF] rounded-full flex items-center justify-center text-[#0A1C3A]">
                    <CheckCircle2 size={16} strokeWidth={3} />
                  </div>
                </div>
                <button
                  onClick={() => setActiveInfoModal(null)}
                  className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Content */}
              <div className="p-8 pt-0">
                {activeInfoModal === 'returns' ? (
                  <div className="space-y-8">
                    <p className="text-slate-500 font-medium leading-relaxed">
                      Our 30-day return policy makes sure that the car meets your expectations. If you're not satisfied, write to us at <a href="mailto:hello@selectt.in" className="text-[#0C1B33] font-bold hover:text-[#00C9AF] transition-colors">hello@selectt.in</a> within 30 days of car delivery. We'll inspect the car and issue a refund within 2 working days.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 mt-10">
                      <div className="space-y-1">
                        <h4 className="font-bold text-[#0C1B33] text-sm">Driven less than 999 km:</h4>
                        <p className="text-xs text-slate-400 font-medium leading-relaxed">Make sure the car is not driven more than 999 km to be eligible for return.</p>
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-[#0C1B33] text-sm">No modifications or alterations:</h4>
                        <p className="text-xs text-slate-400 font-medium leading-relaxed">The car should be in the original handover condition with no modifications.</p>
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-[#0C1B33] text-sm">Return within 30 days:</h4>
                        <p className="text-xs text-slate-400 font-medium leading-relaxed">Your request for return should be raised within 30 days of delivery.</p>
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-[#0C1B33] text-sm">No damages or accidents:</h4>
                        <p className="text-xs text-slate-400 font-medium leading-relaxed">The car should not have met with an accident or have any new damages.</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <p className="text-slate-500 font-medium leading-relaxed">
                      All Selectt Certified cars come with a comprehensive <span className="font-bold text-[#0C1B33]">13-month/20,000 km warranty</span>. Choose our Lifetime Upgrade for permanent peace of mind.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
                      <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="w-10 h-10 bg-indigo-100 text-[#0C1B33] rounded-xl flex items-center justify-center mb-4">
                          <ShieldCheck size={20} />
                        </div>
                        <h4 className="font-bold text-[#0C1B33] text-sm mb-2">Engine & Gearbox</h4>
                        <p className="text-[11px] text-slate-400 font-medium leading-relaxed">Complete coverage for major internal components and mechanical failure.</p>
                      </div>
                      <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="w-10 h-10 bg-indigo-100 text-[#0C1B33] rounded-xl flex items-center justify-center mb-4">
                          <Wrench size={20} />
                        </div>
                        <h4 className="font-bold text-[#0C1B33] text-sm mb-2">RC Transfer Included</h4>
                        <p className="text-[11px] text-slate-400 font-medium leading-relaxed">Free ownership transfer and paperwork assistance for warranty claims.</p>
                      </div>
                      <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="w-10 h-10 bg-indigo-100 text-[#0C1B33] rounded-xl flex items-center justify-center mb-4">
                          <Calendar size={20} />
                        </div>
                        <h4 className="font-bold text-[#0C1B33] text-sm mb-2">Validity Extension</h4>
                        <p className="text-[11px] text-slate-400 font-medium leading-relaxed">Option to extend the coverage annually after the initial 13 months.</p>
                      </div>
                      <div className="p-5 bg-[#00C9AF] text-[#0A1C3A] rounded-2xl shadow-lg shadow-indigo-100">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                          <Heart size={20} />
                        </div>
                        <h4 className="font-bold text-sm mb-2">Lifetime Coverage</h4>
                        <p className="text-[11px] font-medium leading-relaxed opacity-80">One-time upgrade fee for unlimited years and kilometers for primary owners.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Mobile Sticky Footer (Slim & Premium) */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0A162A]/90 backdrop-blur-2xl border-t border-white/10 px-4 py-2.5 shadow-[0_-8px_25px_rgba(0,0,0,0.5)] text-white">
          <div className="grid grid-cols-2 gap-2.5 max-w-7xl mx-auto">
            <button
              onClick={handleBookNow}
              className="bg-gradient-to-r from-[#00E5C9] to-[#00C9AF] text-[#0A1C3A] py-2.5 px-3 rounded-2xl font-sans font-bold text-xs shadow-[0_4px_16px_rgba(0,201,175,0.4)] transition-all flex flex-col items-center justify-center uppercase tracking-wider active:scale-[0.97] cursor-pointer"
            >
              <span className="font-sans font-bold leading-tight">BOOK NOW</span>
              <span className="text-[8.5px] font-sans font-bold opacity-80 tracking-tight leading-none mt-0.5">100% refundable</span>
            </button>
            <button
              onClick={handleTestDriveClick}
              className="bg-gradient-to-r from-[#FF5252] to-[#FF2A55] text-white py-2.5 px-3 rounded-2xl font-sans font-bold text-xs shadow-[0_4px_16px_rgba(255,42,85,0.4)] transition-all flex flex-col items-center justify-center uppercase tracking-wider active:scale-[0.97] cursor-pointer"
            >
              <span className="font-sans font-bold leading-tight">FREE TEST DRIVE</span>
              <span className="text-[8.5px] font-sans font-bold opacity-90 tracking-tight leading-none mt-0.5">Schedule from home</span>
            </button>
          </div>
        </div>

        {/* Test Drive Modal */}
        <TestDriveModal
          car={car}
          isOpen={isTestDriveOpen}
          onClose={() => setIsTestDriveOpen(false)}
        />

        {/* Lightbox Modal */}
        {isLightboxOpen && (
          <div className="fixed inset-0 z-[9999] flex flex-col justify-between bg-black/95 backdrop-blur-md select-none animate-in fade-in duration-200">
            {/* Top Bar */}
            <div className="flex items-center justify-between p-6 text-white bg-gradient-to-b from-black/50 to-transparent">
              <div className="flex flex-col">
                <span className="text-lg font-black tracking-wide">{car.year} {car.make} {car.model}</span>
                <span className="text-xs font-bold text-slate-400 mt-0.5 uppercase tracking-widest">
                  Media {lightboxIndex + 1} of {images.length}
                </span>
              </div>
              <button
                onClick={closeLightbox}
                className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all hover:scale-105 active:scale-95 shadow"
              >
                <X size={24} />
              </button>
            </div>

            {/* Main Media Slider */}
            <div className="flex-1 flex items-center justify-between px-4 relative max-h-[70vh]">
              {/* Left Button */}
              <button
                onClick={() => setLightboxIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                className="w-12 h-12 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-all hover:scale-105"
              >
                <ChevronLeft size={28} />
              </button>

              {/* Media Box */}
              <div className="flex-1 flex items-center justify-center max-w-[85vw] max-h-full h-full relative">
                {getMediaType(images[lightboxIndex]) === 'video' ? (
                  <video
                    src={images[lightboxIndex]?.startsWith('/') ? `${API_URL}${images[lightboxIndex]}` : images[lightboxIndex]}
                    className="max-w-full max-h-full rounded-2xl shadow-2xl object-contain border border-white/5"
                    controls
                    autoPlay
                    muted
                  />
                ) : getMediaType(images[lightboxIndex]) === 'youtube' ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${getYouTubeId(images[lightboxIndex])}`}
                    className="w-full aspect-video max-w-5xl max-h-full rounded-2xl shadow-2xl"
                    allowFullScreen
                    frameBorder="0"
                  />
                ) : (
                  <img
                    src={images[lightboxIndex]?.startsWith('/') ? `${API_URL}${images[lightboxIndex]}` : images[lightboxIndex]}
                    alt="Lightbox view"
                    className="max-w-full max-h-full rounded-2xl shadow-2xl object-contain border border-white/5 animate-in zoom-in-95 duration-200"
                  />
                )}
              </div>

              {/* Right Button */}
              <button
                onClick={() => setLightboxIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                className="w-12 h-12 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-all hover:scale-105"
              >
                <ChevronRight size={28} />
              </button>
            </div>

            {/* Bottom Thumbnail Selector */}
            <div className="p-8 bg-gradient-to-t from-black/50 to-transparent flex flex-col items-center gap-4">
              <div className="flex gap-2 max-w-full overflow-x-auto py-2 no-scrollbar">
                {images.map((img, idx) => {
                  const type = getMediaType(img);
                  const isSelected = lightboxIndex === idx;
                  const ytId = type === 'youtube' ? getYouTubeId(img) : null;
                  const ytThumb = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null;

                  return (
                    <button
                      key={idx}
                      onClick={() => setLightboxIndex(idx)}
                      className={`relative w-20 h-12 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${isSelected ? 'border-[#00C9AF] scale-105 opacity-100 shadow' : 'border-transparent opacity-40 hover:opacity-80'
                        }`}
                    >
                      {type === 'video' ? (
                        <div className="w-full h-full bg-slate-900 flex items-center justify-center text-white text-[8px] font-bold">
                          <span>▶ Video</span>
                        </div>
                      ) : type === 'youtube' ? (
                        <img src={ytThumb || ""} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <img src={img?.startsWith('/') ? `${API_URL}${img}` : img} className="w-full h-full object-cover" alt="" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
      <PriceSummaryModal
        isOpen={isPriceSummaryOpen}
        onClose={() => setIsPriceSummaryOpen(false)}
        carPrice={car?.price}
      />

      {/* Coming Soon Simple Popup Modal */}
      {isComingSoonModalOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center relative border border-slate-100 text-[#0C1B33]">
            <button
              onClick={() => setIsComingSoonModalOpen(false)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
            <div className="w-14 h-14 bg-[#00C9AF]/15 text-[#00C9AF] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-[#00C9AF]/30">
              <Sparkles size={28} />
            </div>
            <h3 className="text-xl font-extrabold text-[#0C1B33] mb-2">Vehicle Arriving Soon</h3>
            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed mb-6">
              This <span className="font-extrabold text-[#0C1B33]">{car?.year} {car?.make} {car?.model}</span> is coming soon to our hub! Pre-booking and test drives will be available as soon as the vehicle arrives.
            </p>
            <button
              onClick={() => setIsComingSoonModalOpen(false)}
              className="w-full py-3.5 bg-[#00C9AF] text-[#0A1C3A] rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-[#00C9AF]/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default CarDetailsPage;



