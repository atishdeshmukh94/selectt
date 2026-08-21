import React, { createContext, useContext, useState, useEffect } from "react";
import { API_URL } from "../config/api";

const SiteSettingsContext = createContext();

export const SiteSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchPublicSettings = async () => {
    try {
      const res = await fetch(`${API_URL}/api/settings/public`);
      if (res.ok) {
        const data = await res.json();
        setSettings(data || {});
      }
    } catch (err) {
      console.error("Failed to fetch public site settings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicSettings();
  }, []);

  /**
   * Helper function to retrieve a dynamic site image URL.
   * @param {string} key - Database setting key (e.g. 'frontend_header_logo', 'home_hero_banner')
   * @param {string} fallbackUrl - Default local asset path if custom image is not set
   * @returns {string} Fully resolved image URL
   */
  const getSiteImage = (key, fallbackUrl = "") => {
    const val = settings[key];
    if (!val) return fallbackUrl;
    if (val.startsWith("http://") || val.startsWith("https://")) {
      return val;
    }
    return `${API_URL}${val}`;
  };

  return (
    <SiteSettingsContext.Provider value={{ settings, loading, getSiteImage, fetchPublicSettings }}>
      {children}
    </SiteSettingsContext.Provider>
  );
};

export const useSiteSettings = () => {
  const context = useContext(SiteSettingsContext);
  if (!context) {
    throw new Error("useSiteSettings must be used within a SiteSettingsProvider");
  }
  return context;
};
