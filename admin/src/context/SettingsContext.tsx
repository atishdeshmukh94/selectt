import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { API_URL } from "../config/api";

interface SettingsContextType {
  settings: Record<string, string>;
  loading: boolean;
  refreshSettings: () => Promise<void>;
  getSetting: (key: string, defaultValue?: string) => string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const refreshSettings = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/settings/public`);
      if (response.ok) {
        const data = await response.json();
        setSettings(data || {});
      }
      
      // Also try to fetch private settings if logged in
      const token = localStorage.getItem("adminToken");
      if (token) {
        const privateResponse = await fetch(`${API_URL}/api/settings`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (privateResponse.ok) {
          const privateData = await privateResponse.json();
          const privateSettingsMap = privateData.reduce((acc: any, curr: any) => {
            acc[curr.setting_key] = curr.setting_value;
            return acc;
          }, {});
          setSettings(prev => ({ ...prev, ...privateSettingsMap }));
        }
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSettings();
  }, [refreshSettings]);

  const getSetting = (key: string, defaultValue: string = "") => {
    return settings[key] || defaultValue;
  };

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings, getSetting }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
