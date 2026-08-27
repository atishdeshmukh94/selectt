import { useEffect } from 'react';

const SITE_URL = 'https://selectt.in';

/**
 * PageMeta — Sets page title, meta description, OG tags, Twitter card, canonical URL, and JSON-LD schema.
 * Usage: <PageMeta title="..." description="..." canonical="/page-path" image="/img/og.jpg" schema={{...}} />
 */
const PageMeta = ({ title, description, canonical, image, schema }) => {
  useEffect(() => {
    const ogImage = image
      ? (image.startsWith('http') ? image : `${SITE_URL}${image}`)
      : `${SITE_URL}/img/og-image.jpg`;

    const canonicalUrl = canonical
      ? `${SITE_URL}${canonical}`
      : SITE_URL;

    const fullTitle = title || 'Selectt — Buy & Sell Certified Pre-Owned Cars in Raipur';

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
    const setLink = (rel, href) => {
      let el = document.querySelector(`link[rel="${rel}"]`);
      if (!el) {
        el = document.createElement('link');
        el.setAttribute('rel', rel);
        document.head.appendChild(el);
      }
      el.setAttribute('href', href);
    };

    // Description
    if (description) {
      setMeta('name', 'description', description);
    }

    // Canonical
    setLink('canonical', canonicalUrl);

    // Open Graph
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:url', canonicalUrl);
    setMeta('property', 'og:image', ogImage);
    setMeta('property', 'og:type', 'website');
    if (description) {
      setMeta('property', 'og:description', description);
    }

    // Twitter Card
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', fullTitle);
    setMeta('name', 'twitter:image', ogImage);
    if (description) {
      setMeta('name', 'twitter:description', description);
    }

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
