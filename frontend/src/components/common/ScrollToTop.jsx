import { useEffect, useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Robust ScrollToTop component:
 * Guarantees that every page navigation lands at the very top (0, 0).
 * Handles:
 * 1. Disabling browser history.scrollRestoration ('manual')
 * 2. Overriding CSS scroll-behavior: smooth to 'instant' so animations don't get canceled mid-page
 * 3. Multi-frame scrolling (immediate, rAF, 50ms, 150ms) to ensure lazy-loaded Suspense chunks land at top
 * 4. Respects anchor hashes (e.g., #emi-calculator) if explicitly targeted
 */
const ScrollToTop = () => {
  const { pathname, search, hash } = useLocation();

  // Disable default browser scroll restoration on initial mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  const resetScroll = () => {
    if (typeof window === 'undefined') return;

    // If navigating to a specific hash anchor on the page, let browser target it
    if (hash) {
      try {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
          return;
        }
      } catch (_) {}
    }

    // Force instant scroll to top on window, documentElement and body
    const doc = document.documentElement;
    const body = document.body;

    const prevScrollBehavior = doc.style.scrollBehavior;
    doc.style.scrollBehavior = 'auto';
    if (body) body.style.scrollBehavior = 'auto';

    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (doc) doc.scrollTop = 0;
    if (body) body.scrollTop = 0;

    // Restore original scroll behavior after immediate paint
    requestAnimationFrame(() => {
      doc.style.scrollBehavior = prevScrollBehavior;
      if (body) body.style.scrollBehavior = '';
    });
  };

  useLayoutEffect(() => {
    resetScroll();

    // Multi-phase backup: React Suspense / lazy loading can expand DOM height 50ms-150ms after route change
    const frameId = requestAnimationFrame(resetScroll);
    const timer1 = setTimeout(resetScroll, 50);
    const timer2 = setTimeout(resetScroll, 150);

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [pathname, search, hash]);

  return null;
};

export default ScrollToTop;
