import React from 'react';

/* ── Pulse animation ────────────────────────────────────── */
const pulseStyle = {
  background: 'linear-gradient(90deg, #f3f4f6 25%, #e9ecef 50%, #f3f4f6 75%)',
  backgroundSize: '200% 100%',
  animation: 'skeleton-pulse 1.6s ease-in-out infinite',
  borderRadius: 6,
};

const inject = () => {
  if (typeof document === 'undefined') return;
  const id = 'skeleton-pulse-style';
  if (document.getElementById(id)) return;
  const style = document.createElement('style');
  style.id = id;
  style.textContent = `
    @keyframes skeleton-pulse {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `;
  document.head.appendChild(style);
};
inject();

/* ── Primitive ──────────────────────────────────────────── */
const Bone = ({ width = '100%', height = 16, radius = 6, style }) => (
  <div style={{ ...pulseStyle, width, height, borderRadius: radius, flexShrink: 0, ...style }} />
);

/* ── Stat Card Skeleton ──────────────────────────────────── */
const StatCard = () => (
  <div style={{ background: 'white', borderRadius: 12, padding: '1.25rem', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '1rem' }}>
    <Bone width={44} height={44} radius={10} />
    <div style={{ flex: 1 }}>
      <Bone width="60%" height={12} style={{ marginBottom: 8 }} />
      <Bone width="40%" height={22} />
    </div>
  </div>
);

/* ── Table Row Skeleton ──────────────────────────────────── */
const TableRow = ({ cols = 5 }) => (
  <tr>
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} style={{ padding: '0.875rem 1rem' }}>
        <Bone width={i === 0 ? '80%' : i === cols - 1 ? 60 : '70%'} height={14} />
      </td>
    ))}
  </tr>
);

/* ── Card Skeleton ───────────────────────────────────────── */
const Card = () => (
  <div style={{ background: 'white', borderRadius: 12, border: '1px solid #f1f5f9', overflow: 'hidden' }}>
    <Bone width="100%" height={160} radius={0} />
    <div style={{ padding: '1rem' }}>
      <Bone width="40%" height={12} style={{ marginBottom: 10 }} />
      <Bone width="90%" height={16} style={{ marginBottom: 6 }} />
      <Bone width="60%" height={14} />
    </div>
  </div>
);

/* ── Text Lines Skeleton ─────────────────────────────────── */
const TextLines = ({ lines = 3 }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
    {Array.from({ length: lines }).map((_, i) => (
      <Bone key={i} width={i === lines - 1 ? '70%' : '100%'} height={14} />
    ))}
  </div>
);

/* ── Form Skeleton ───────────────────────────────────────── */
const Form = ({ fields = 4 }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
    {Array.from({ length: fields }).map((_, i) => (
      <div key={i}>
        <Bone width="30%" height={12} style={{ marginBottom: 8 }} />
        <Bone width="100%" height={40} radius={8} />
      </div>
    ))}
  </div>
);

/* ── Page Header Skeleton ────────────────────────────────── */
const PageHeaderSkeleton = () => (
  <div style={{ marginBottom: '1.5rem' }}>
    <Bone width={240} height={26} style={{ marginBottom: 8 }} />
    <Bone width={160} height={14} />
  </div>
);

const Skeleton = {
  Bone,
  StatCard,
  TableRow,
  Card,
  TextLines,
  Form,
  PageHeader: PageHeaderSkeleton,
};

export default Skeleton;
