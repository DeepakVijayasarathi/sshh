import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';

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

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    site_name: '', site_tagline: '', logo_url: '',
    contact_email: '', contact_phone: '', contact_address: '',
    facebook_url: '', instagram_url: '', twitter_url: '', youtube_url: '',
    footer_text: '', primary_color: '#8B0000', secondary_color: '#D4AF37',
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleColorChange = (color) => {
    setSettings(s => ({ ...s, primary_color: color }));
    applyColor(color);
  };

  const handleSecondaryColorChange = (color) => {
    setSettings(s => ({ ...s, secondary_color: color }));
    applySecondaryColor(color);
  };

  useEffect(() => {
    api.get('/settings').then(r => {
      setSettings(s => ({ ...s, ...r.data }));
      if (r.data.logo_url) setLogoPreview(r.data.logo_url);
      if (r.data.primary_color) applyColor(r.data.primary_color);
      if (r.data.secondary_color) applySecondaryColor(r.data.secondary_color);
    }).catch(() => toast.error('Failed to load settings'));
  }, []);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const uploadLogo = async () => {
    if (!logoFile) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('logo', logoFile);
      const r = await api.post('/settings/logo', fd);
      setSettings(s => ({ ...s, logo_url: r.data.logo_url }));
      setLogoFile(null);
      toast.success('Logo uploaded');
      window.dispatchEvent(new Event('site-settings-updated'));
    } catch {
      toast.error('Logo upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { logo_url, ...rest } = settings;
      await api.put('/settings', rest);
      toast.success('Settings saved');
      window.dispatchEvent(new Event('site-settings-updated'));
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const colorField = (key, label, defaultVal, onChange) => (
    <div className="form-group" key={key}>
      <label className="form-label">{label}</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <input
          type="color"
          className="form-control"
          style={{ width: 56, height: 40, padding: '2px 4px', cursor: 'pointer' }}
          value={settings[key] || defaultVal}
          onChange={e => onChange(e.target.value)}
        />
        <input
          type="text"
          className="form-control"
          style={{ flex: 1, fontFamily: 'monospace' }}
          value={settings[key] || defaultVal}
          maxLength={7}
          onChange={e => onChange(e.target.value)}
          placeholder={defaultVal}
        />
        <div style={{
          width: 40, height: 40, borderRadius: 6, flexShrink: 0,
          background: settings[key] || defaultVal,
          border: '1px solid #ddd',
        }} />
      </div>
      <span style={{ fontSize: '0.72rem', color: '#888' }}>Changes preview instantly site-wide</span>
    </div>
  );

  const field = (key, label, type = 'text', placeholder = '') => (
    <div className="form-group" key={key}>
      <label className="form-label">{label}</label>
      <input
        type={type}
        className="form-control"
        value={settings[key] || ''}
        onChange={e => setSettings(s => ({ ...s, [key]: e.target.value }))}
        placeholder={placeholder}
      />
    </div>
  );

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>Site Settings</h1>

      {/* Logo Upload */}
      <div className="admin-card" style={{ marginBottom: '1.5rem' }}>
        <div className="admin-card-title">Site Logo</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{
            width: 120, height: 120, border: '2px dashed #ddd', borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#f9f9f9', overflow: 'hidden',
          }}>
            {logoPreview
              ? <img src={logoPreview} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
              : <span style={{ color: '#aaa', fontSize: '0.8rem', textAlign: 'center' }}>No logo</span>
            }
          </div>
          <div>
            <input type="file" accept="image/*" id="logo-upload" style={{ display: 'none' }} onChange={handleLogoChange} />
            <label htmlFor="logo-upload" className="btn btn-secondary" style={{ cursor: 'pointer', marginBottom: '0.5rem', display: 'block' }}>
              Choose Logo
            </label>
            {logoFile && (
              <button className="btn btn-primary" onClick={uploadLogo} disabled={uploading}>
                {uploading ? 'Uploading…' : 'Upload Logo'}
              </button>
            )}
            <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.5rem' }}>
              PNG, JPG or SVG. Recommended: 200×60px.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave}>
        {/* General */}
        <div className="admin-card" style={{ marginBottom: '1.5rem' }}>
          <div className="admin-card-title">General</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {field('site_name', 'Site Name', 'text', 'Sourashtra Community Portal')}
            {field('site_tagline', 'Tagline', 'text', 'Connecting our community')}
            {colorField('primary_color', 'Primary Color', '#8B0000', handleColorChange)}
            {colorField('secondary_color', 'Secondary Color', '#D4AF37', handleSecondaryColorChange)}
            {field('footer_text', 'Footer Text', 'text')}
          </div>
        </div>

        {/* Contact */}
        <div className="admin-card" style={{ marginBottom: '1.5rem' }}>
          <div className="admin-card-title">Contact Info</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {field('contact_email', 'Email', 'email')}
            {field('contact_phone', 'Phone')}
          </div>
          {field('contact_address', 'Address')}
        </div>

        {/* Social */}
        <div className="admin-card" style={{ marginBottom: '1.5rem' }}>
          <div className="admin-card-title">Social Media</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {field('facebook_url', 'Facebook URL', 'url')}
            {field('instagram_url', 'Instagram URL', 'url')}
            {field('twitter_url', 'Twitter/X URL', 'url')}
            {field('youtube_url', 'YouTube URL', 'url')}
          </div>
        </div>

        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving…' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}
