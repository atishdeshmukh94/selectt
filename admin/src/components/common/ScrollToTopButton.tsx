import React, { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";

export function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;

      if (scrollY > 280) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }

      if (totalHeight > 0) {
        const progress = Math.min(Math.max(scrollY / totalHeight, 0), 1);
        setScrollProgress(progress);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const circumference = 125.66;
  const strokeDashoffset = circumference - scrollProgress * circumference;

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ease-out select-none ${
        isVisible
          ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
          : "opacity-0 translate-y-6 scale-90 pointer-events-none"
      }`}
    >
      <button
        type="button"
        onClick={scrollToTop}
        aria-label="Scroll to top"
        title="Scroll to top"
        className="relative group w-11 h-11 rounded-full bg-slate-900/90 dark:bg-brand-600 hover:bg-slate-900 dark:hover:bg-brand-700 text-white backdrop-blur-md shadow-xl hover:shadow-2xl border border-white/20 dark:border-white/10 flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 active:scale-95"
      >
        <svg
          className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none p-0.5"
          viewBox="0 0 48 48"
        >
          <circle
            cx="24"
            cy="24"
            r="20"
            className="stroke-white/15"
            strokeWidth="2.5"
            fill="transparent"
          />
          <circle
            cx="24"
            cy="24"
            r="20"
            className="stroke-brand-400 dark:stroke-white transition-[stroke-dashoffset] duration-150 ease-out"
            strokeWidth="2.5"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>

        <ChevronUp
          className="relative z-10 w-5 h-5 text-white transition-transform duration-300 group-hover:-translate-y-0.5"
          strokeWidth={2.6}
        />
      </button>
    </div>
  );
}
