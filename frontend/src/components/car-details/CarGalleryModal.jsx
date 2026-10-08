import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  ArrowLeft, 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { API_URL } from '../../config/api';

const DEFAULT_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=1200';

const getCarImageUrl = (img) => {
  if (!img) return DEFAULT_FALLBACK_IMAGE;
  if (img.startsWith('http://') || img.startsWith('https://')) return img;
  if (img.startsWith('/uploads/')) return `${API_URL}${img}`;
  if (img.startsWith('/')) return `${API_URL}${img}`;
  return `${API_URL}/uploads/${img}`;
};

// Intelligently categorize images and assign view angle titles
const categorizeCarImages = (images) => {
  if (!images || images.length === 0) return [];

  const categories = [
    { id: 'overview', name: 'Overview', defaultLabels: ['Left Front Corner View', 'Back View', 'Front View'] },
    { id: 'exterior', name: 'Exterior', defaultLabels: ['Left Profile View', 'Right Profile View', 'Front Grille & Headlamp', 'Tail Light & Boot', 'Sunroof & Roof Profile'] },
    { id: 'interior', name: 'Interior', defaultLabels: ['Cockpit & Dashboard', 'Steering Wheel & Controls', 'Infotainment System', 'Front Cabin Seats', 'Rear Passenger Seats'] },
    { id: 'engine', name: 'Engine', defaultLabels: ['Engine Bay (Clean Inspection)', 'Under-the-Hood Details', 'Battery & Fluid Reservoirs'] },
    { id: 'tyres', name: 'Tyres', defaultLabels: ['Front Right Alloy & Tyre', 'Rear Right Alloy & Tyre', 'Front Left Alloy & Tyre', 'Rear Left Alloy & Tyre', 'Tyre Tread Depth'] },
    { id: 'features', name: 'Top Features', defaultLabels: ['Keyless Push Start / Stop', 'Instrument Cluster & Odometer', 'Climate Control AC', 'Center Console & Gearbox', 'Rear Parking Camera / Sensors'] },
  ];

  const total = images.length;
  const categorized = [];

  // Categorize based on keywords in URL/filename or index distribution
  images.forEach((img, idx) => {
    const urlLower = String(img).toLowerCase();
    let catId = 'overview';
    let label = `View ${idx + 1}`;

    if (urlLower.includes('engine') || urlLower.includes('motor') || urlLower.includes('bonnet') || urlLower.includes('hood')) {
      catId = 'engine';
      label = 'Engine Bay View';
    } else if (urlLower.includes('tyre') || urlLower.includes('tire') || urlLower.includes('wheel') || urlLower.includes('alloy') || urlLower.includes('rim')) {
      catId = 'tyres';
      label = 'Alloy Wheel & Tyre';
    } else if (urlLower.includes('interior') || urlLower.includes('dash') || urlLower.includes('steer') || urlLower.includes('seat') || urlLower.includes('cabin') || urlLower.includes('speedo') || urlLower.includes('odo')) {
      catId = 'interior';
      label = 'Interior & Dashboard';
    } else if (urlLower.includes('sunroof') || urlLower.includes('feature') || urlLower.includes('screen') || urlLower.includes('gear') || urlLower.includes('camera') || urlLower.includes('sensor')) {
      catId = 'features';
      label = 'Top Features & Tech';
    } else if (urlLower.includes('front') || urlLower.includes('rear') || urlLower.includes('back') || urlLower.includes('side') || urlLower.includes('exterior') || urlLower.includes('boot') || urlLower.includes('trunk')) {
      catId = 'exterior';
      label = urlLower.includes('back') || urlLower.includes('rear') ? 'Back View' : 'Front Exterior View';
    } else {
      // Index-based proportional fallback
      if (idx === 0) {
        catId = 'overview';
        label = 'Left Front Corner View';
      } else if (idx === 1) {
        catId = 'overview';
        label = 'Back View';
      } else if (idx < Math.ceil(total * 0.45)) {
        catId = 'exterior';
        const extIdx = idx - 2;
        label = categories[1].defaultLabels[extIdx % categories[1].defaultLabels.length];
      } else if (idx < Math.ceil(total * 0.70)) {
        catId = 'interior';
        const intIdx = idx - Math.ceil(total * 0.45);
        label = categories[2].defaultLabels[intIdx % categories[2].defaultLabels.length];
      } else if (idx < Math.ceil(total * 0.82)) {
        catId = 'engine';
        label = 'Engine Bay Inspection';
      } else if (idx < Math.ceil(total * 0.92)) {
        catId = 'tyres';
        label = 'Alloy Wheel & Tyre Inspection';
      } else {
        catId = 'features';
        label = 'Premium Features & Details';
      }
    }

    categorized.push({
      img,
      globalIndex: idx + 1,
      totalCount: total,
      categoryId: catId,
      label
    });
  });

  // Group by category while preserving category order
  const groups = [];
  categories.forEach(cat => {
    const items = categorized.filter(c => c.categoryId === cat.id);
    if (items.length > 0) {
      groups.push({
        id: cat.id,
        name: cat.name,
        thumbnail: items[0].img,
        count: items.length,
        items
      });
    }
  });

  // Fallback: if everything fell into one or none, ensure at least Overview group
  if (groups.length === 0) {
    groups.push({
      id: 'overview',
      name: 'Overview',
      thumbnail: images[0],
      count: images.length,
      items: images.map((img, idx) => ({
        img,
        globalIndex: idx + 1,
        totalCount: images.length,
        categoryId: 'overview',
        label: idx === 0 ? 'Left Front Corner View' : idx === 1 ? 'Back View' : `Angle View ${idx + 1}`
      }))
    });
  }

  return groups;
};

// Isolated Pinch-to-Zoom Car Image Card (Zooms ONLY the car image, NOT the webpage)
const PinchZoomImageCard = ({ item, carTitle }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPinching, setIsPinching] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const containerRef = useRef(null);
  const touchStartRef = useRef({ dist: 0, scale: 1, x: 0, y: 0, posX: 0, posY: 0 });
  const lastTapRef = useRef(0);

  const getDistance = (t1, t2) => {
    return Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
  };

  const handleTouchStart = (e) => {
    // 2-Finger Pinch Start
    if (e.touches.length === 2) {
      const dist = getDistance(e.touches[0], e.touches[1]);
      touchStartRef.current = {
        dist,
        scale,
        posX: position.x,
        posY: position.y
      };
      setIsPinching(true);
    } 
    // 1-Finger Touch / Double-Tap
    else if (e.touches.length === 1) {
      const now = Date.now();
      const DOUBLE_TAP_DELAY = 300;
      if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
        // Toggle Zoom (1x <-> 2.2x)
        if (scale > 1.05) {
          setScale(1);
          setPosition({ x: 0, y: 0 });
        } else {
          setScale(2.2);
          setPosition({ x: 0, y: 0 });
        }
        lastTapRef.current = 0;
      } else {
        lastTapRef.current = now;
        touchStartRef.current.x = e.touches[0].clientX;
        touchStartRef.current.y = e.touches[0].clientY;
        touchStartRef.current.posX = position.x;
        touchStartRef.current.posY = position.y;
      }
    }
  };

  const handleTouchMove = (e) => {
    // When pinching with 2 fingers, ALWAYS prevent browser viewport zoom
    if (e.touches.length === 2) {
      if (e.cancelable) e.preventDefault();
      const dist = getDistance(e.touches[0], e.touches[1]);
      const factor = dist / (touchStartRef.current.dist || dist);
      const newScale = Math.min(Math.max(1, touchStartRef.current.scale * factor), 3.5);
      setScale(newScale);
    } 
    // If zoomed in (> 1x) and dragging with 1 finger, pan the image inside its container
    else if (e.touches.length === 1 && scale > 1.05) {
      if (e.cancelable) e.preventDefault();
      const dx = e.touches[0].clientX - touchStartRef.current.x;
      const dy = e.touches[0].clientY - touchStartRef.current.y;
      const maxPanX = (scale - 1) * 160;
      const maxPanY = (scale - 1) * 120;
      setPosition({
        x: Math.min(Math.max(-maxPanX, touchStartRef.current.posX + dx), maxPanX),
        y: Math.min(Math.max(-maxPanY, touchStartRef.current.posY + dy), maxPanY)
      });
    }
  };

  const handleTouchEnd = () => {
    setIsPinching(false);
    // Snap back if scale is near 1x
    if (scale < 1.05) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.6, 3.5));
  };

  const handleZoomOut = () => {
    setScale(prev => {
      const next = prev - 0.6;
      if (next <= 1.05) {
        setPosition({ x: 0, y: 0 });
        return 1;
      }
      return next;
    });
  };

  const handleResetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden mb-6 transition-all duration-200">
      {/* Image Container with Isolated Touch Handling */}
      <div 
        ref={containerRef}
        className="relative w-full aspect-[4/3] sm:aspect-[16/10] bg-slate-100 overflow-hidden select-none cursor-zoom-in"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        style={{
          // touch-action: pan-y allows vertical page scrolling when not pinching
          touchAction: scale > 1.05 ? 'none' : 'pan-y'
        }}
      >
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
            <div className="w-8 h-8 border-2 border-[#00C9AF] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        <img
          src={getCarImageUrl(item.img)}
          alt={`${carTitle} - ${item.label}`}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          onError={(e) => {
            e.target.src = DEFAULT_FALLBACK_IMAGE;
            setIsLoaded(true);
          }}
          className={`w-full h-full object-cover transition-transform ${isPinching ? 'duration-0' : 'duration-200 ease-out'}`}
          style={{
            transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
            transformOrigin: 'center center',
            pointerEvents: scale > 1 ? 'auto' : 'none'
          }}
          draggable={false}
        />

        {/* Zoom Hint / Floating Controls */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
          {scale > 1.05 ? (
            <>
              <button
                type="button"
                onClick={handleZoomOut}
                className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/80 active:scale-90 transition-all shadow-md cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut size={15} />
              </button>
              <button
                type="button"
                onClick={handleResetZoom}
                className="px-2.5 h-8 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-bold flex items-center justify-center hover:bg-black/80 active:scale-90 transition-all shadow-md cursor-pointer gap-1"
                title="Reset Zoom"
              >
                <RotateCcw size={12} />
                <span>Reset</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleZoomIn}
              className="px-2.5 h-8 rounded-full bg-black/45 hover:bg-black/70 backdrop-blur-md text-white text-[11px] font-bold flex items-center justify-center active:scale-90 transition-all shadow-md cursor-pointer gap-1 border border-white/10"
              title="Pinch or Click to Zoom"
            >
              <ZoomIn size={14} />
              <span className="hidden sm:inline">Pinch / Zoom</span>
            </button>
          )}
        </div>

        {/* Double-tap hint badge for mobile */}
        {scale === 1 && (
          <div className="absolute bottom-3 right-3 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-[10px] bg-black/50 text-white px-2 py-1 rounded-md backdrop-blur-xs font-semibold">
              Double-tap to zoom
            </span>
          </div>
        )}
      </div>

      {/* Caption & Counter Footer (matches reference image) */}
      <div className="px-4 py-3 sm:px-5 sm:py-3.5 flex items-center justify-between text-slate-700 bg-white border-t border-slate-100">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-xs sm:text-sm text-slate-800 tracking-tight">
            {item.label}
          </span>
        </div>
        <span className="font-bold text-xs sm:text-sm text-slate-400 font-mono tracking-wider">
          {item.globalIndex}/{item.totalCount}
        </span>
      </div>
    </div>
  );
};

const CarGalleryModal = ({
  isOpen,
  onClose,
  car,
  images = [],
  onBookNow,
  onTestDrive,
  onOpen360
}) => {
  const [activeCategory, setActiveCategory] = useState('overview');
  const scrollContainerRef = useRef(null);
  const categoryTabsRef = useRef(null);

  const carTitle = `${car?.year || ''} ${car?.make || ''} ${car?.model || ''} ${car?.variant || ''}`.trim() || 'Pre-Owned Car';

  const groups = useMemo(() => {
    return categorizeCarImages(images);
  }, [images]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    const originalTouchAction = document.body.style.touchAction;
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.touchAction = originalTouchAction;
    };
  }, [isOpen]);

  // Scroll to category section
  const handleCategoryClick = (catId) => {
    setActiveCategory(catId);
    const elem = document.getElementById(`cat-section-${catId}`);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Scroll Spy to track active category tab while scrolling
  useEffect(() => {
    if (!isOpen) return;
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollPos = container.scrollTop + 140;
      for (let i = groups.length - 1; i >= 0; i--) {
        const cat = groups[i];
        const elem = document.getElementById(`cat-section-${cat.id}`);
        if (elem && elem.offsetTop <= scrollPos) {
          setActiveCategory(cat.id);
          // Auto-scroll tab button into view in the top tab strip
          const tabBtn = document.getElementById(`tab-btn-${cat.id}`);
          if (tabBtn && categoryTabsRef.current) {
            tabBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
          }
          break;
        }
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [isOpen, groups]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999999] bg-[#f8f9fa] flex flex-col animate-in fade-in duration-200 select-none">
      
      {/* 1. TOP STICKY HEADER */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
        <div className="max-w-4xl mx-auto px-4 py-3 sm:py-3.5 flex items-center justify-between gap-3">
          {/* Back button & Car Title */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 hover:text-slate-900 flex items-center justify-center transition-all cursor-pointer border border-slate-200/80 shrink-0"
              aria-label="Back to Car Details"
            >
              <ArrowLeft size={19} className="stroke-[2.5]" />
            </button>
            <h1 className="font-heading font-extrabold text-[#0C1B33] text-sm sm:text-base md:text-lg truncate tracking-tight">
              {carTitle}
            </h1>
          </div>

          {/* View in 360° Button (Right Corner) */}
          <button
            type="button"
            onClick={() => {
              if (onOpen360) {
                onOpen360();
              } else {
                onClose();
                // smooth scroll to 360 viewer on car details page
                const elem360 = document.getElementById('view-360-container') || document.querySelector('[data-view360]');
                if (elem360) elem360.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-purple-300 hover:border-purple-500 bg-purple-50/80 hover:bg-purple-100/80 text-purple-700 active:scale-95 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shrink-0 cursor-pointer shadow-2xs"
          >
            <span>View in</span>
            <RotateCw size={13} className="text-purple-600 animate-spin-slow" />
            <span className="font-extrabold">360°</span>
          </button>
        </div>

        {/* 2. HORIZONTAL CATEGORY TABS WITH PREVIEWS (Spinny Style) */}
        <div 
          ref={categoryTabsRef}
          className="border-t border-slate-100 bg-white px-3 sm:px-4 py-2.5 overflow-x-auto no-scrollbar flex items-center gap-3 sm:gap-4 max-w-4xl mx-auto"
        >
          {groups.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                id={`tab-btn-${cat.id}`}
                type="button"
                onClick={() => handleCategoryClick(cat.id)}
                className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group focus:outline-none transition-transform active:scale-95"
              >
                {/* Thumbnail Box */}
                <div 
                  className={`w-14 h-10 sm:w-16 sm:h-11 rounded-lg overflow-hidden border-2 transition-all shadow-2xs ${
                    isActive 
                      ? 'border-[#6B21A8] ring-2 ring-purple-300/60 scale-105' 
                      : 'border-slate-200 opacity-60 group-hover:opacity-100 group-hover:border-slate-400'
                  }`}
                >
                  <img
                    src={getCarImageUrl(cat.thumbnail)}
                    alt={cat.name}
                    className="w-full h-full object-cover"
                    loading="eager"
                  />
                </div>
                {/* Label */}
                <span 
                  className={`text-[11px] sm:text-xs font-extrabold tracking-tight transition-colors whitespace-nowrap ${
                    isActive ? 'text-[#6B21A8]' : 'text-slate-500 group-hover:text-slate-800'
                  }`}
                >
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>
      </header>

      {/* 3. MAIN VERTICAL IMAGE FEED */}
      <main 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 sm:py-6 pb-28 max-w-2xl mx-auto w-full"
        style={{
          // allows natural vertical scroll on the list, isolated pinch on images
          touchAction: 'pan-y'
        }}
      >
        {groups.map((group) => (
          <section key={group.id} id={`cat-section-${group.id}`} className="mb-6 pt-2">
            {/* Section Heading */}
            <div className="flex items-center justify-between mb-3 px-1">
              <h2 className="font-heading font-black text-slate-900 text-lg sm:text-xl tracking-tight">
                {group.name}
              </h2>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {group.items.length} Photos
              </span>
            </div>

            {/* List of Photos in this Category */}
            <div className="space-y-4">
              {group.items.map((item) => (
                <PinchZoomImageCard
                  key={`${item.categoryId}-${item.globalIndex}`}
                  item={item}
                  carTitle={carTitle}
                />
              ))}
            </div>
          </section>
        ))}
      </main>

      {/* 4. BOTTOM STICKY ACTION BAR */}
      <footer className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200/90 py-3 px-4 z-40 shadow-2xl">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          {/* BOOK NOW Button */}
          <button
            type="button"
            onClick={() => {
              onClose();
              if (onBookNow) {
                onBookNow();
              } else if (car?.id) {
                window.location.href = `/checkout/${car.id}`;
              }
            }}
            className="flex-1 py-3.5 px-4 bg-[#6B21A8] hover:bg-[#581c87] active:scale-98 text-white font-black text-xs sm:text-sm uppercase tracking-wider rounded-2xl shadow-lg shadow-purple-900/20 flex flex-col items-center justify-center transition-all cursor-pointer"
          >
            <span className="leading-tight">BOOK NOW</span>
            <span className="text-[10px] text-purple-200 font-bold font-sans lowercase tracking-normal">
              100% refundable
            </span>
          </button>

          {/* FREE TEST DRIVE Button */}
          <button
            type="button"
            onClick={() => {
              onClose();
              if (onTestDrive) {
                onTestDrive();
              } else {
                const tdBtn = document.querySelector('[data-test-drive-btn]');
                if (tdBtn) tdBtn.click();
              }
            }}
            className="flex-1 py-3.5 px-4 bg-[#EF4444] hover:bg-[#dc2626] active:scale-98 text-white font-black text-xs sm:text-sm uppercase tracking-wider rounded-2xl shadow-lg shadow-red-500/20 flex flex-col items-center justify-center transition-all cursor-pointer"
          >
            <span className="leading-tight">FREE TEST DRIVE</span>
            <span className="text-[10px] text-red-100 font-bold font-sans lowercase tracking-normal">
              schedule at doorstep
            </span>
          </button>
        </div>
      </footer>

    </div>
  );
};

export default CarGalleryModal;
