import { useEffect } from 'react';

const SITE_URL = 'https://selectt.in';

/**
 * PageMeta — Sets page title, meta description, OG tags, Twitter card, canonical URL, and JSON-LD schema.
 * Usage: <PageMeta title="..." description="..." canonical="/page-path" image="/img/og.jpg" schema={{...}} />
 */
const PageMeta = ({ title, description, canonical, image, preloadImage, schema }) => {
  useEffect(() => {
    const ogImage = image
      ? (image.startsWith('http') ? image : `${SITE_URL}${image}`)
      : `${SITE_URL}/img/og-image.jpg`;

    const path = canonical 
      ? (canonical.startsWith('/') ? canonical : `/${canonical}`)
      : (typeof window !== 'undefined' ? window.location.pathname : '/');

    const canonicalUrl = `${SITE_URL}${path}`;

    const fullTitle = title || 'Selectt — Buy & Sell Certified Pre-Owned Cars in Mumbai';
    const defaultDesc = 'Selectt is Mumbai\'s premier pre-owned car marketplace. Buy, sell, or finance 200+ certified used cars with 200-point inspection, warranty & doorstep test drives in Mumbai.';
    const finalDesc = description || defaultDesc;

    // ── Title ──────────────────────────────────────────
    document.title = fullTitle;

    // ── Helper: upsert a meta tag ──────────────────────
    const setMeta = (attr, value, content) => {
      let el = document.querySelector(`meta[${attr}="${value}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, value);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    // ── Helper: upsert a link tag ──────────────────────
    const setLink = (rel, href, extraAttrs = {}) => {
      let el = document.querySelector(`link[rel="${rel}"]`);
      if (!el) {
        el = document.createElement('link');
        el.setAttribute('rel', rel);
        document.head.appendChild(el);
      }
      el.setAttribute('href', href);
      Object.keys(extraAttrs).forEach(k => el.setAttribute(k, extraAttrs[k]));
    };

    // Description
    setMeta('name', 'description', finalDesc);

    // Canonical
    setLink('canonical', canonicalUrl);

    // Preload hero image if specified
    if (preloadImage) {
      setLink('preload', preloadImage, { as: 'image', fetchpriority: 'high' });
    }

    // Open Graph
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:url', canonicalUrl);
    setMeta('property', 'og:image', ogImage);
    setMeta('property', 'og:image:secure_url', ogImage);
    setMeta('property', 'og:image:type', 'image/jpeg');
    setMeta('property', 'og:image:width', '1200');
    setMeta('property', 'og:image:height', '630');
    setMeta('property', 'og:image:alt', fullTitle);
    setMeta('property', 'og:site_name', 'Selectt');
    setMeta('property', 'og:locale', 'en_IN');
    setMeta('property', 'og:type', 'website');
    setMeta('property', 'og:description', finalDesc);

    // Twitter Card
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:site', '@selecttcars');
    setMeta('name', 'twitter:title', fullTitle);
    setMeta('name', 'twitter:image', ogImage);
    setMeta('name', 'twitter:description', finalDesc);

    // JSON-LD Schema
    let schemaScript = document.getElementById('jsonld-schema');
    if (schema) {
      if (!schemaScript) {
        schemaScript = document.createElement('script');
        schemaScript.id = 'jsonld-schema';
        schemaScript.type = 'application/ld+json';
        document.head.appendChild(schemaScript);
      }
      schemaScript.innerHTML = JSON.stringify(schema);
    } else if (schemaScript) {
      schemaScript.remove();
    }

    return () => {
      const script = document.getElementById('jsonld-schema');
      if (script) script.remove();
    };
  }, [title, description, canonical, image, schema]);

  return null;
};

export default PageMeta;
