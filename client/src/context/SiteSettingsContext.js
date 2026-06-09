import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const SiteSettingsContext = createContext({});

export const SiteSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({});

  const load = () => {
    api.get('/settings').then(r => setSettings(r.data)).catch(() => {});
  };

  useEffect(() => {
    load();
    window.addEventListener('site-settings-updated', load);
    return () => window.removeEventListener('site-settings-updated', load);
  }, []);

  return (
    <SiteSettingsContext.Provider value={settings}>
      {children}
    </SiteSettingsContext.Provider>
  );
};

export const useSiteSettings = () => useContext(SiteSettingsContext);
