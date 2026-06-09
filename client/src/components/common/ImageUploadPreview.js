import React, { useState } from 'react';

const ImageUploadPreview = ({ label = 'Upload Image', name = 'image', onChange, currentUrl = null, accept = 'image/*', className = '' }) => {
  const [preview, setPreview] = useState(null);

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
    if (onChange) onChange(file);
  };

  const displaySrc = preview || currentUrl;

  return (
    <div className={`img-upload-wrap ${className}`}>
      <label className="form-label">{label}</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {displaySrc && (
          <img
            src={displaySrc}
            alt="Preview"
            style={{ width: 72, height: 72, borderRadius: 'var(--radius)', objectFit: 'cover', border: '2px solid var(--border)', flexShrink: 0 }}
          />
        )}
        <div style={{ flex: 1 }}>
          <input
            type="file"
            name={name}
            accept={accept}
            onChange={handleChange}
            className="form-control"
            style={{ fontSize: '0.8125rem' }}
          />
          {displaySrc && (
            <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.25rem' }}>
              {preview ? 'New image selected' : 'Current image'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageUploadPreview;
