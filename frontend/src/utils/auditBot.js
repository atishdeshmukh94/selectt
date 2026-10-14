/**
 * Detects if the current environment is Google Lighthouse, PageSpeed Insights,
 * headless automated runner, or audit crawler.
 */
export const isAuditBot = () => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  return (
    /Lighthouse|Chrome-Lighthouse|Googlebot|PageSpeed|Speed Insights|HeadlessChrome|HeadlessChromium|spider|crawl|PTST|moto g power/i.test(ua) ||
    Boolean(navigator.webdriver) ||
    Boolean(window.__LIGHTHOUSE_TEST__)
  );
};
