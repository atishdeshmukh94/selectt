import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  ArrowLeft, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  X,
  Maximize2
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
const categorizeCarImages = (images, mediaAlt = {}) => {
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

  // Categorize based on keywords in URL/filename or custom alt text
  images.forEach((img, idx) => {
    const customAlt = mediaAlt?.[img] || '';
    const textToCheck = `${customAlt} ${img}`.toLowerCase();
    let catId = 'overview';
    let label = customAlt || `View ${idx + 1}`;

    if (textToCheck.includes('engine') || textToCheck.includes('motor') || textToCheck.includes('bonnet') || textToCheck.includes('hood')) {
      catId = 'engine';
      if (!customAlt) label = 'Engine Bay View';
    } else if (textToCheck.includes('tyre') || textToCheck.includes('tire') || textToCheck.includes('wheel') || textToCheck.includes('alloy') || textToCheck.includes('rim')) {
      catId = 'tyres';
      if (!customAlt) label = 'Alloy Wheel & Tyre';
    } else if (textToCheck.includes('interior') || textToCheck.includes('dash') || textToCheck.includes('steer') || textToCheck.includes('seat') || textToCheck.includes('cabin') || textToCheck.includes('speedo') || textToCheck.includes('odo')) {
      catId = 'interior';
      if (!customAlt) label = 'Interior & Dashboard';
    } else if (textToCheck.includes('sunroof') || textToCheck.includes('feature') || textToCheck.includes('screen') || textToCheck.includes('gear') || textToCheck.includes('camera') || textToCheck.includes('sensor')) {
      catId = 'features';
      if (!customAlt) label = 'Top Features & Tech';
    } else if (textToCheck.includes('front') || textToCheck.includes('rear') || textToCheck.includes('back') || textToCheck.includes('side') || textToCheck.includes('exterior') || textToCheck.includes('boot') || textToCheck.includes('trunk')) {
      catId = 'exterior';
      if (!customAlt) label = textToCheck.includes('back') || textToCheck.includes('rear') ? 'Back View' : 'Front Exterior View';
    } else if (!customAlt) {
      // Index-based proportional fallback if no custom alt text
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
        label: mediaAlt?.[img] || (idx === 0 ? 'Left Front Corner View' : idx === 1 ? 'Back View' : `Angle View ${idx + 1}`)
      }))
    });
  }

  return groups;
};

// Isolated Pinch-to-Zoom Car Image Card (Zooms ONLY the car image, NOT the webpage)
const PinchZoomImageCard = ({ item, carTitle, onOpenLightbox }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPinching, setIsPinching] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const containerRef = useRef(null);
  const touchStartRef = useRef({ dist: 0, scale: 1, x: 0, y: 0, posX: 0, posY: 0, startTime: 0 });
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
        posY: position.y,
        startTime: Date.now()
      };
      setIsPinching(true);
    } 
    // 1-Finger Touch / Tap
    else if (e.touches.length === 1) {
      const now = Date.now();
      const DOUBLE_TAP_DELAY = 280;
      touchStartRef.current.x = e.touches[0].clientX;
      touchStartRef.current.y = e.touches[0].clientY;
      touchStartRef.current.posX = position.x;
      touchStartRef.current.posY = position.y;
      touchStartRef.current.startTime = now;

      if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
        // Double-Tap to Zoom In / Out
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

  const handleTouchEnd = (e) => {
    setIsPinching(false);
    // Snap back if scale is near 1x
    if (scale < 1.05) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }

    // Check if it was a quick single tap without dragging -> open Lightbox!
    if (e.changedTouches && e.changedTouches.length === 1 && scale <= 1.05) {
      const elapsed = Date.now() - touchStartRef.current.startTime;
      const dx = Math.abs(e.changedTouches[0].clientX - touchStartRef.current.x);
      const dy = Math.abs(e.changedTouches[0].clientY - touchStartRef.current.y);
      if (elapsed < 300 && dx < 10 && dy < 10) {
        onOpenLightbox?.();
      }
    }
  };

  const handleZoomIn = (e) => {
    e.stopPropagation();
    setScale(prev => Math.min(prev + 0.6, 3.5));
  };

  const handleZoomOut = (e) => {
    e.stopPropagation();
    setScale(prev => {
      const next = prev - 0.6;
      if (next <= 1.05) {
        setPosition({ x: 0, y: 0 });
        return 1;
      }
      return next;
    });
  };

  const handleResetZoom = (e) => {
    e.stopPropagation();
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden mb-6 transition-all duration-200">
      {/* Image Container with Isolated Touch Handling */}
      <div 
        ref={containerRef}
        onClick={() => {
          if (scale <= 1.05) onOpenLightbox?.();
        }}
        className="relative w-full aspect-[4/3] sm:aspect-[16/10] bg-slate-100 overflow-hidden select-none cursor-pointer group"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        style={{
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

        {/* Floating Controls: Zoom & Fullscreen Lightbox trigger */}
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
            <>
              <button
                type="button"
                onClick={handleZoomIn}
                className="px-2.5 h-8 rounded-full bg-black/45 hover:bg-black/70 backdrop-blur-md text-white text-[11px] font-bold flex items-center justify-center active:scale-90 transition-all shadow-md cursor-pointer gap-1 border border-white/10"
                title="Pinch or Click to Zoom"
              >
                <ZoomIn size={14} />
                <span className="hidden sm:inline">Pinch / Zoom</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenLightbox?.();
                }}
                className="w-8 h-8 rounded-full bg-black/45 hover:bg-black/70 backdrop-blur-md text-white flex items-center justify-center active:scale-90 transition-all shadow-md cursor-pointer border border-white/10"
                title="Open Fullscreen Lightbox"
              >
                <Maximize2 size={13} />
              </button>
            </>
          )}
        </div>

        {/* Tap to expand hint badge */}
        {scale === 1 && (
          <div className="absolute bottom-3 right-3 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-[10px] bg-black/60 text-white px-2.5 py-1 rounded-full backdrop-blur-xs font-semibold flex items-center gap-1 shadow-sm">
              <Maximize2 size={10} /> Tap to expand
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

// Fullscreen Lightbox Overlay Component
const FullscreenLightbox = ({ images, activeIndex, onClose, onChangeIndex, carTitle }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  const scaleRef = useRef(1);
  const positionRef = useRef({ x: 0, y: 0 });
  const touchStartRef = useRef({ x: 0, y: 0, dist: 0, scale: 1, posX: 0, posY: 0, time: 0 });
  const lastTapRef = useRef(0);
  
  const viewerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, posX: 0, posY: 0 });

  const mobileThumbRefs = useRef([]);
  const desktopThumbRefs = useRef([]);

  const total = images.length;
  const currentImg = images[activeIndex];

  const updateScale = (s) => {
    scaleRef.current = s;
    setScale(s);
  };

  const updatePosition = (pos) => {
    positionRef.current = pos;
    setPosition(pos);
  };

  // Auto-scroll active thumbnail into center view
  useEffect(() => {
    if (mobileThumbRefs.current[activeIndex]) {
      mobileThumbRefs.current[activeIndex].scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest'
      });
    }
    if (desktopThumbRefs.current[activeIndex]) {
      desktopThumbRefs.current[activeIndex].scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest'
      });
    }
  }, [activeIndex]);

  // Keyboard navigation (Arrow keys + Escape)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (scaleRef.current <= 1.05) {
        if (e.key === 'ArrowRight') onChangeIndex((activeIndex + 1) % total);
        if (e.key === 'ArrowLeft') onChangeIndex((activeIndex - 1 + total) % total);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, total, onClose, onChangeIndex]);

  // Reset zoom on slide change
  useEffect(() => {
    updateScale(1);
    updatePosition({ x: 0, y: 0 });
  }, [activeIndex]);

  // Desktop Double-Click to Zoom In / Reset
  const handleDoubleClick = (e) => {
    e.preventDefault();
    if (scaleRef.current > 1.05) {
      updateScale(1);
      updatePosition({ x: 0, y: 0 });
    } else {
      updateScale(2.5);
      const rect = viewerRef.current?.getBoundingClientRect();
      if (rect) {
        const clickX = e.clientX - (rect.left + rect.width / 2);
        const clickY = e.clientY - (rect.top + rect.height / 2);
        updatePosition({
          x: Math.round(-clickX * 1.2),
          y: Math.round(-clickY * 1.2)
        });
      } else {
        updatePosition({ x: 0, y: 0 });
      }
    }
  };

  // Desktop Mouse Drag (Pan) Handlers with Window Listeners
  const handleMouseDown = (e) => {
    if (e.button !== 0) return; // Only left-click
    if (scaleRef.current <= 1.05) return;
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      posX: positionRef.current.x,
      posY: positionRef.current.y
    };
  };

  useEffect(() => {
    const handleWindowMouseMove = (e) => {
      if (!isDragging || scaleRef.current <= 1.05) return;
      e.preventDefault();
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      const maxPanX = Math.max(300, window.innerWidth * (scaleRef.current - 1));
      const maxPanY = Math.max(250, window.innerHeight * (scaleRef.current - 1));
      updatePosition({
        x: Math.min(Math.max(-maxPanX, dragStartRef.current.posX + dx), maxPanX),
        y: Math.min(Math.max(-maxPanY, dragStartRef.current.posY + dy), maxPanY)
      });
    };

    const handleWindowMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleWindowMouseMove);
      window.addEventListener('mouseup', handleWindowMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, [isDragging]);

  // Non-passive Touch and Wheel Event Handling (Crucial for mobile zoom & pan)
  useEffect(() => {
    const el = viewerRef.current;
    if (!el) return;

    const handleTouchStart = (e) => {
      // 2-Finger Pinch Zoom Start
      if (e.touches.length === 2) {
        if (e.cancelable) e.preventDefault();
        const dist = Math.hypot(
          e.touches[1].clientX - e.touches[0].clientX,
          e.touches[1].clientY - e.touches[0].clientY
        );
        touchStartRef.current = {
          dist,
          scale: scaleRef.current,
          posX: positionRef.current.x,
          posY: positionRef.current.y,
          time: Date.now()
        };
      } 
      // 1-Finger Touch
      else if (e.touches.length === 1) {
        const now = Date.now();
        const DOUBLE_TAP_DELAY = 280;
        touchStartRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
          posX: positionRef.current.x,
          posY: positionRef.current.y,
          time: now
        };

        // Mobile Double-Tap to Zoom In (2.5x) or Reset (1x)
        if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
          if (scaleRef.current > 1.05) {
            updateScale(1);
            updatePosition({ x: 0, y: 0 });
          } else {
            updateScale(2.5);
            const rect = el.getBoundingClientRect();
            if (rect) {
              const clickX = e.touches[0].clientX - (rect.left + rect.width / 2);
              const clickY = e.touches[0].clientY - (rect.top + rect.height / 2);
              updatePosition({
                x: Math.round(-clickX * 1.2),
                y: Math.round(-clickY * 1.2)
              });
            } else {
              updatePosition({ x: 0, y: 0 });
            }
          }
          lastTapRef.current = 0;
        } else {
          lastTapRef.current = now;
        }
      }
    };

    const handleTouchMove = (e) => {
      // 2-Finger Pinch Zoom
      if (e.touches.length === 2) {
        if (e.cancelable) e.preventDefault();
        const dist = Math.hypot(
          e.touches[1].clientX - e.touches[0].clientX,
          e.touches[1].clientY - e.touches[0].clientY
        );
        const factor = dist / (touchStartRef.current.dist || dist);
        const nextScale = Math.min(Math.max(1, touchStartRef.current.scale * factor), 4);
        updateScale(nextScale);
        if (nextScale <= 1.05) {
          updatePosition({ x: 0, y: 0 });
        }
      } 
      // 1-Finger Free Slide Pan when Zoomed In: Smooth 4-way panning (left, right, top, bottom)
      else if (e.touches.length === 1 && scaleRef.current > 1.05) {
        if (e.cancelable) e.preventDefault();
        const dx = e.touches[0].clientX - touchStartRef.current.x;
        const dy = e.touches[0].clientY - touchStartRef.current.y;
        const maxPanX = Math.max(300, window.innerWidth * (scaleRef.current - 1));
        const maxPanY = Math.max(250, window.innerHeight * (scaleRef.current - 1));
        updatePosition({
          x: Math.min(Math.max(-maxPanX, touchStartRef.current.posX + dx), maxPanX),
          y: Math.min(Math.max(-maxPanY, touchStartRef.current.posY + dy), maxPanY)
        });
      }
    };

    const handleTouchEnd = (e) => {
      // Snap back if zoom scale dropped below 1.05x
      if (scaleRef.current < 1.05) {
        updateScale(1);
        updatePosition({ x: 0, y: 0 });
      } else {
        // Save updated position for next drag stroke
        touchStartRef.current.posX = positionRef.current.x;
        touchStartRef.current.posY = positionRef.current.y;
      }

      // CRITICAL: When zoomed in (scale > 1.05), NEVER swipe or change slide!
      if (scaleRef.current > 1.05) {
        return;
      }

      // Horizontal swipe gesture for next/previous: ONLY when at 1x (NOT zoomed in)!
      if (scaleRef.current <= 1.05 && e.changedTouches && e.changedTouches.length === 1) {
        const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
        const dy = Math.abs(e.changedTouches[0].clientY - touchStartRef.current.y);
        // Only trigger if horizontal movement is clearly dominant
        if (Math.abs(dx) > 50 && dy < 60) {
          if (dx < 0) {
            onChangeIndex((activeIndex + 1) % total);
          } else {
            onChangeIndex((activeIndex - 1 + total) % total);
          }
        }
      }
    };

    const handleWheel = (e) => {
      if (e.cancelable) e.preventDefault();
      const zoomDelta = e.deltaY < 0 ? 0.35 : -0.35;
      const nextScale = Math.min(Math.max(1, scaleRef.current + zoomDelta), 4);
      updateScale(nextScale);
      if (nextScale <= 1.05) {
        updatePosition({ x: 0, y: 0 });
      }
    };

    // Attach non-passive listeners directly to DOM element
    el.addEventListener('touchstart', handleTouchStart, { passive: false });
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    el.addEventListener('touchend', handleTouchEnd, { passive: false });
    el.addEventListener('touchcancel', handleTouchEnd, { passive: false });
    el.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
      el.removeEventListener('touchcancel', handleTouchEnd);
      el.removeEventListener('wheel', handleWheel);
    };
  }, [activeIndex, total, onChangeIndex]);

  return (
    <div 
      className="fixed inset-0 z-[1000000] bg-black/95 backdrop-blur-md flex flex-col justify-between select-none animate-in fade-in duration-200"
      style={{ touchAction: 'none' }}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-3 sm:px-5 sm:py-4 text-white bg-gradient-to-b from-black/80 to-transparent z-20 shrink-0">
        <div className="min-w-0 pr-3">
          <h3 className="font-heading font-extrabold text-sm sm:text-base truncate tracking-tight text-white">
            {carTitle}
          </h3>
          <span className="text-xs text-[#00C9AF] font-bold tracking-wider font-mono">
            {activeIndex + 1} of {total}
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 text-white flex items-center justify-center transition-all cursor-pointer shrink-0"
          aria-label="Close Lightbox"
        >
          <X size={22} className="stroke-[2.5]" />
        </button>
      </div>

      {/* MOBILE ONLY: Top Thumbnail Carousel (Directly under header on mobile) */}
      <div className="sm:hidden px-3 py-2 bg-black/70 backdrop-blur-md border-b border-white/10 z-20 shrink-0">
        <div className="flex gap-2 max-w-full overflow-x-auto no-scrollbar py-1 scroll-smooth">
          {images.map((img, idx) => {
            const isSelected = activeIndex === idx;
            return (
              <button
                key={idx}
                ref={el => (mobileThumbRefs.current[idx] = el)}
                type="button"
                onClick={() => {
                  updateScale(1);
                  updatePosition({ x: 0, y: 0 });
                  onChangeIndex(idx);
                }}
                className={`relative w-14 h-10 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                  isSelected 
                    ? 'border-[#00C9AF] scale-105 opacity-100 shadow-md ring-2 ring-[#00C9AF]/60' 
                    : 'border-transparent opacity-45 hover:opacity-80'
                }`}
              >
                <img
                  src={getCarImageUrl(img)}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = DEFAULT_FALLBACK_IMAGE;
                  }}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Large Image Viewer */}
      <div 
        ref={viewerRef}
        onDoubleClick={handleDoubleClick}
        onMouseDown={handleMouseDown}
        className="flex-1 relative flex items-center justify-center overflow-hidden px-2 sm:px-4 select-none"
        style={{
          touchAction: 'none',
          cursor: scale > 1.05 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in'
        }}
      >
        {/* Left Arrow Button (Only visible when scale is 1x) */}
        {scale <= 1.05 && (
          <button
            type="button"
            onClick={() => onChangeIndex((activeIndex - 1 + total) % total)}
            className="absolute left-2 sm:left-4 z-20 w-11 h-11 rounded-full bg-black/50 hover:bg-black/75 text-white flex items-center justify-center transition-all active:scale-90 border border-white/10 shadow-lg cursor-pointer"
            aria-label="Previous image"
          >
            <ChevronLeft size={26} />
          </button>
        )}

        {/* Centered Image with 1:1 screen-pixel translation */}
        <img
          src={getCarImageUrl(currentImg)}
          alt={`${carTitle} - Photo ${activeIndex + 1}`}
          className="max-w-full max-h-[70vh] sm:max-h-[75vh] object-contain rounded-lg shadow-2xl pointer-events-none select-none"
          style={{
            transform: `translate3d(${position.x}px, ${position.y}px, 0px) scale(${scale})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.18s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
          draggable={false}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = DEFAULT_FALLBACK_IMAGE;
          }}
        />

        {/* Right Arrow Button (Only visible when scale is 1x) */}
        {scale <= 1.05 && (
          <button
            type="button"
            onClick={() => onChangeIndex((activeIndex + 1) % total)}
            className="absolute right-2 sm:right-4 z-20 w-11 h-11 rounded-full bg-black/50 hover:bg-black/75 text-white flex items-center justify-center transition-all active:scale-90 border border-white/10 shadow-lg cursor-pointer"
            aria-label="Next image"
          >
            <ChevronRight size={26} />
          </button>
        )}

        {/* Floating Zoom Controls Bar */}
        <div 
          onClick={(e) => e.stopPropagation()}
          className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 shadow-2xl text-white"
        >
          <button
            type="button"
            onClick={() => {
              const next = Math.min(scaleRef.current + 0.6, 4);
              updateScale(next);
            }}
            className="w-7 h-7 rounded-full hover:bg-white/20 active:scale-90 flex items-center justify-center transition-all cursor-pointer text-white"
            title="Zoom In"
          >
            <ZoomIn size={15} />
          </button>

          <span className="text-[11px] font-mono font-bold px-1 select-none text-white/90 min-w-[38px] text-center">
            {Math.round(scale * 100)}%
          </span>

          <button
            type="button"
            onClick={() => {
              const next = scaleRef.current - 0.6;
              if (next <= 1.05) {
                updateScale(1);
                updatePosition({ x: 0, y: 0 });
              } else {
                updateScale(next);
              }
            }}
            className="w-7 h-7 rounded-full hover:bg-white/20 active:scale-90 flex items-center justify-center transition-all cursor-pointer text-white"
            title="Zoom Out"
          >
            <ZoomOut size={15} />
          </button>

          {scale > 1.05 && (
            <button
              type="button"
              onClick={() => {
                updateScale(1);
                updatePosition({ x: 0, y: 0 });
              }}
              className="ml-1 px-2.5 h-7 rounded-full bg-white/20 hover:bg-white/30 active:scale-90 text-[11px] font-bold flex items-center justify-center transition-all cursor-pointer gap-1 text-[#00C9AF]"
              title="Reset Zoom"
            >
              <RotateCcw size={12} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* DESKTOP ONLY: Bottom Thumbnail Strip */}
      <div className="hidden sm:flex p-3 sm:p-4 bg-gradient-to-t from-black/80 to-transparent z-20 flex-col items-center shrink-0">
        <div className="flex gap-2 max-w-full overflow-x-auto no-scrollbar py-1 scroll-smooth">
          {images.map((img, idx) => {
            const isSelected = activeIndex === idx;
            return (
              <button
                key={idx}
                ref={el => (desktopThumbRefs.current[idx] = el)}
                type="button"
                onClick={() => {
                  updateScale(1);
                  updatePosition({ x: 0, y: 0 });
                  onChangeIndex(idx);
                }}
                className={`relative w-16 h-11 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                  isSelected ? 'border-[#00C9AF] scale-105 opacity-100 shadow-md ring-2 ring-[#00C9AF]/60' : 'border-transparent opacity-40 hover:opacity-80'
                }`}
              >
                <img
                  src={getCarImageUrl(img)}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = DEFAULT_FALLBACK_IMAGE;
                  }}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile Safe Bottom Spacer */}
      <div className="sm:hidden h-2 pb-[env(safe-area-inset-bottom)] shrink-0" />
    </div>
  );
};

const CarGalleryModal = ({
  isOpen,
  onClose,
  car,
  images = [],
  initialIndex = 0,
  onBookNow,
  onTestDrive
}) => {
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return false;
  });

  const [activeCategory, setActiveCategory] = useState('overview');
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const scrollContainerRef = useRef(null);
  const categoryTabsRef = useRef(null);

  const carTitle = `${car?.year || ''} ${car?.make || ''} ${car?.model || ''} ${car?.variant || ''}`.trim() || 'Pre-Owned Car';

  const groups = useMemo(() => {
    return categorizeCarImages(images, car?.mediaAlt);
  }, [images, car?.mediaAlt]);

  // Track responsive breakpoint
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // When opening: if desktop, directly open lightbox at initialIndex!
  useEffect(() => {
    if (isOpen) {
      if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
        setLightboxIndex(initialIndex >= 0 ? initialIndex : 0);
      } else {
        setLightboxIndex(null);
      }
    } else {
      setLightboxIndex(null);
    }
  }, [isOpen, initialIndex]);

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
    if (!isOpen || isDesktop) return;
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollPos = container.scrollTop + 140;
      for (let i = groups.length - 1; i >= 0; i--) {
        const cat = groups[i];
        const elem = document.getElementById(`cat-section-${cat.id}`);
        if (elem && elem.offsetTop <= scrollPos) {
          setActiveCategory(cat.id);
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
  }, [isOpen, isDesktop, groups]);

  if (!isOpen) return null;

  // ON DESKTOP (>= 1024px): Directly open fullscreen image Lightbox mode
  if (isDesktop) {
    const activeIdx = lightboxIndex !== null ? lightboxIndex : (initialIndex >= 0 ? initialIndex : 0);
    return (
      <FullscreenLightbox
        images={images}
        activeIndex={activeIdx}
        onClose={onClose}
        onChangeIndex={(newIdx) => setLightboxIndex(newIdx)}
        carTitle={carTitle}
      />
    );
  }

  // ON MOBILE (< 1024px): Current mobile flow with category tabs, vertical feed & sticky action bar
  return (
    <>
      <div className="fixed inset-0 z-[999999] bg-[#f8f9fa] flex flex-col animate-in fade-in duration-200 select-none">
        
        {/* 1. TOP STICKY HEADER (360 button removed as requested) */}
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
          <div className="max-w-4xl mx-auto px-4 py-3 sm:py-3.5 flex items-center gap-3">
            {/* Back button */}
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 hover:text-slate-900 flex items-center justify-center transition-all cursor-pointer border border-slate-200/80 shrink-0 shadow-2xs"
              aria-label="Back to Car Details"
            >
              <ArrowLeft size={19} className="stroke-[2.5]" />
            </button>
            {/* Car Title */}
            <h1 className="font-heading font-black text-[#0C1B33] text-sm sm:text-base md:text-lg truncate tracking-tight">
              {carTitle}
            </h1>
          </div>

          {/* 2. HORIZONTAL CATEGORY TABS WITH PREVIEWS (Selectt Brand Color Themed) */}
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
                        ? 'border-[#00C9AF] ring-2 ring-[#00C9AF]/40 scale-105' 
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
                    className={`text-[11px] sm:text-xs font-black tracking-tight transition-colors whitespace-nowrap ${
                      isActive ? 'text-[#0C1B33]' : 'text-slate-500 group-hover:text-slate-800'
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
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
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
                    onOpenLightbox={() => setLightboxIndex(item.globalIndex - 1)}
                  />
                ))}
              </div>
            </section>
          ))}
        </main>

        {/* 4. BOTTOM STICKY ACTION BAR (Selectt Brand Color Combination) */}
        <footer className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200/90 py-3 px-4 z-40 shadow-2xl">
          <div className="max-w-2xl mx-auto flex items-center gap-3">
            {/* BOOK NOW Button - Selectt Emerald / Teal Brand Gradient */}
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
              className="flex-1 py-3 px-4 bg-gradient-to-r from-[#00E5C9] to-[#00C9AF] hover:from-[#00d6bc] hover:to-[#00b9a1] active:scale-98 text-[#0A1C3A] font-black text-xs sm:text-sm uppercase tracking-wider rounded-2xl shadow-[0_4px_16px_rgba(0,201,175,0.35)] flex flex-col items-center justify-center transition-all cursor-pointer"
            >
              <span className="font-black leading-tight tracking-wider">BOOK NOW</span>
              <span className="text-[9px] sm:text-[10px] text-[#0A1C3A]/85 font-extrabold lowercase tracking-normal">
                100% refundable
              </span>
            </button>

            {/* FREE TEST DRIVE Button - Selectt Vibrant Coral / Red Brand Gradient */}
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
              className="flex-1 py-3 px-4 bg-gradient-to-r from-[#FF5252] to-[#FF2A55] hover:from-[#f04545] hover:to-[#e81f49] active:scale-98 text-white font-black text-xs sm:text-sm uppercase tracking-wider rounded-2xl shadow-[0_4px_16px_rgba(255,42,85,0.35)] flex flex-col items-center justify-center transition-all cursor-pointer"
            >
              <span className="font-black leading-tight tracking-wider">FREE TEST DRIVE</span>
              <span className="text-[9px] sm:text-[10px] text-white/90 font-extrabold lowercase tracking-normal">
                schedule at doorstep
              </span>
            </button>
          </div>
        </footer>

      </div>

      {/* 5. LIGHTBOX OVERLAY WHEN CLICKING ANY IMAGE */}
      {lightboxIndex !== null && (
        <FullscreenLightbox
          images={images}
          activeIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onChangeIndex={(newIdx) => setLightboxIndex(newIdx)}
          carTitle={carTitle}
        />
      )}
    </>
  );
};

export default CarGalleryModal;
