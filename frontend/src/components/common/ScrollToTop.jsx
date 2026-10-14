import { useEffect, useLayoutEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Robust ScrollToTop component:
 * Guarantees that page transitions land at the very top (0, 0).
 * Handles:
 * 1. Disabling browser history.scrollRestoration ('manual')
 * 2. Overriding CSS scroll-behavior: smooth to 'instant' so animations don't get canceled mid-page
 * 3. Never forces scroll to top if user is already actively scrolling on page reload
 * 4. Respects anchor hashes (e.g., #emi-calculator) if explicitly targeted
 */
const ScrollToTop = () => {
  const { pathname, search, hash } = useLocation();
  const prevPathnameRef = useRef(pathname);
  const isInitialMount = useRef(true);

  // Disable default browser scroll restoration on initial mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  const resetScroll = (force = false) => {
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

    // If user has already started scrolling down, NEVER snap back to top
    if (!force && window.scrollY > 0) {
      return;
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
    // On initial mount / page reload: if the user already started scrolling, DO NOT fight them!
    if (isInitialMount.current) {
      isInitialMount.current = false;
      if (window.scrollY > 0) {
        return;
      }
      resetScroll(false);
      return;
    }

    // On actual route navigation (page A -> page B), scroll to top
    if (prevPathnameRef.current !== pathname) {
      prevPathnameRef.current = pathname;
      resetScroll(true);
    }
  }, [pathname, hash]);

  return null;
};

export default ScrollToTop;
