import React, { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

/**
 * ScrollToTopButton:
 * Floating bottom-right circular button with dynamic scroll-progress ring
 * Smoothly scrolls to top of page when clicked.
 */
const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;

      // Show after scrolling down 280px
      if (scrollY > 280) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }

      // Calculate 0 to 1 progress
      if (totalHeight > 0) {
        const progress = Math.min(Math.max(scrollY / totalHeight, 0), 1);
        setScrollProgress(progress);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Initial check
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // Circumference for r=20 circle (2 * PI * 20 ≈ 125.66)
  const circumference = 125.66;
  const strokeDashoffset = circumference - scrollProgress * circumference;

  return (
    <div
      className={`fixed bottom-20 right-4 sm:bottom-24 sm:right-6 lg:bottom-8 lg:right-8 z-40 transition-all duration-300 ease-out select-none ${
        isVisible
          ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
          : 'opacity-0 translate-y-6 scale-90 pointer-events-none'
      }`}
    >
      <button
        type="button"
        onClick={scrollToTop}
        aria-label="Scroll to top"
        title="Scroll to top"
        className="relative group w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#0C1B33]/92 hover:bg-[#0C1B33] backdrop-blur-md shadow-[0_8px_24px_rgba(0,0,0,0.30)] hover:shadow-[0_12px_28px_rgba(0,201,175,0.40)] border border-white/20 hover:border-[#00C9AF]/60 flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 active:scale-95"
      >
        {/* SVG Circular Progress Ring */}
        <svg
          className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none p-0.5"
          viewBox="0 0 48 48"
        >
          {/* Background track */}
          <circle
            cx="24"
            cy="24"
            r="20"
            className="stroke-white/15"
            strokeWidth="2.5"
            fill="transparent"
          />
          {/* Progress fill track */}
          <circle
            cx="24"
            cy="24"
            r="20"
            className="stroke-[#00C9AF] transition-[stroke-dashoffset] duration-150 ease-out"
            strokeWidth="2.5"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>

        {/* Upward Chevron Icon */}
        <ChevronUp
          className="relative z-10 w-5 h-5 text-white group-hover:text-[#00C9AF] transition-transform duration-300 group-hover:-translate-y-0.5"
          strokeWidth={2.6}
        />

        {/* Tooltip on hover (desktop only) */}
        <span className="hidden lg:block absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md bg-slate-900/90 text-white text-[10px] font-bold tracking-wider uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap border border-white/10 shadow-md">
          Back to Top
        </span>
      </button>
    </div>
  );
};

export default ScrollToTopButton;
