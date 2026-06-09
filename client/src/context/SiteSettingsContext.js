import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const SiteSettingsContext = createContext({});

const hexToRgb = (hex) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
};

const darken = (hex, amount = 30) => {
  const { r, g, b } = hexToRgb(hex);
  const d = (c) => Math.max(0, c - amount).toString(16).padStart(2, '0');
  return `#${d(r)}${d(g)}${d(b)}`;
};

const lighten = (hex, amount = 40) => {
  const { r, g, b } = hexToRgb(hex);
  const l = (c) => Math.min(255, c + amount).toString(16).padStart(2, '0');
  return `#${l(r)}${l(g)}${l(b)}`;
};

const applyColor = (color) => {
  if (!color || !/^#[0-9A-Fa-f]{6}$/.test(color)) return;
  const root = document.documentElement;
  root.style.setProperty('--primary', color);
  root.style.setProperty('--primary-dark', darken(color, 32));
  root.style.setProperty('--primary-light', lighten(color, 40));
};

const applySecondaryColor = (color) => {
  if (!color || !/^#[0-9A-Fa-f]{6}$/.test(color)) return;
  const root = document.documentElement;
  root.style.setProperty('--secondary', color);
  root.style.setProperty('--secondary-dark', darken(color, 20));
};

export const SiteSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({});

  const load = () => {
    api.get('/settings').then(r => {
      setSettings(r.data);
      if (r.data.primary_color) applyColor(r.data.primary_color);
      if (r.data.secondary_color) applySecondaryColor(r.data.secondary_color);
    }).catch(() => {});
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
