import React from 'react';
import './Skeleton.css';

export const Skeleton = ({ width = '100%', height = 16, borderRadius = 4, className = '' }) => (
  <div
    className={`skeleton ${className}`}
    style={{ width, height, borderRadius }}
  />
);

export const SkeletonCard = () => (
  <div className="skeleton-card">
    <Skeleton height={180} borderRadius={0} />
    <div style={{ padding: '1rem' }}>
      <Skeleton height={14} width="60%" className="mb-2" />
      <Skeleton height={20} className="mb-2" />
      <Skeleton height={14} width="80%" />
    </div>
  </div>
);

export const SkeletonRow = () => (
  <tr>
    {[...Array(5)].map((_, i) => (
      <td key={i} style={{ padding: '0.875rem 1rem' }}>
        <Skeleton height={14} width={i === 0 ? '70%' : '90%'} />
      </td>
    ))}
  </tr>
);

export const SkeletonStatCard = () => (
  <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: '1.25rem', boxShadow: 'var(--shadow)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
    <Skeleton width={52} height={52} borderRadius={8} />
    <div style={{ flex: 1 }}>
      <Skeleton height={12} width="50%" className="mb-2" />
      <Skeleton height={28} width="40%" />
    </div>
  </div>
);

export default Skeleton;
