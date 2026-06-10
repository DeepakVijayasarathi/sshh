import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, CartesianGrid,
} from 'recharts';
import {
  Users, Clock, Calendar, Building2, Briefcase,
  GraduationCap, MessageSquare, Heart, TrendingUp,
  ArrowRight, Activity, ChevronRight,
} from 'lucide-react';
import api from '../../services/api';

/* ─── Stat Card ─────────────────────────────────────────── */
const StatCard = ({ icon: Icon, label, value, color, bg, link, trend }) => (
  <Link to={link || '#'} style={{ textDecoration: 'none' }}>
    <div
      className="rounded-xl p-5 flex items-start justify-between transition-all duration-200 group cursor-pointer"
      style={{ background: 'white', border: '1px solid #f1f5f9', boxShadow: '0 1px 3px 0 rgba(0,0,0,0.06)' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px -4px rgba(0,0,0,0.10)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0,0,0,0.06)'; }}
    >
      <div>
        <p style={{ fontSize: '0.75rem', fontWeight: 500, color: '#9ca3af', marginBottom: '0.5rem', letterSpacing: '0.01em' }}>
          {label}
        </p>
        <p style={{ fontSize: '1.75rem', fontWeight: 700, color: color, lineHeight: 1 }}>
          {value ?? '—'}
        </p>
        {trend !== undefined && (
          <p style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '0.375rem', display: 'flex', alignItems: 'center', gap: 3 }}>
            <TrendingUp size={12} /> <span>{trend}</span>
          </p>
        )}
      </div>
      <div
        className="rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ width: 44, height: 44, background: bg }}
      >
        <Icon size={20} style={{ color }} />
      </div>
    </div>
  </Link>
);

/* ─── Activity Item ─────────────────────────────────────── */
const ActivityItem = ({ children, time, badge }) => (
  <div className="flex items-center justify-between py-3" style={{ borderBottom: '1px solid #f9fafb' }}>
    <div style={{ flex: 1, minWidth: 0 }}>
      <p style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {children}
      </p>
      {time && <p style={{ fontSize: '0.6875rem', color: '#9ca3af', marginTop: 2 }}>{time}</p>}
    </div>
    {badge && <span style={{ marginLeft: '0.75rem', flexShrink: 0 }}>{badge}</span>}
  </div>
);

/* ─── Section Card ──────────────────────────────────────── */
const SectionCard = ({ title, link, linkLabel = 'View all', children }) => (
  <div className="rounded-xl overflow-hidden" style={{ background: 'white', border: '1px solid #f1f5f9', boxShadow: '0 1px 3px 0 rgba(0,0,0,0.06)' }}>
    <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111827' }}>{title}</p>
      {link && (
        <Link to={link} style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 3 }}>
          {linkLabel} <ArrowRight size={12} />
        </Link>
      )}
    </div>
    <div style={{ padding: '0 1.25rem' }}>{children}</div>
  </div>
);

/* ─── Chart Tooltip ─────────────────────────────────────── */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 10, padding: '0.625rem 0.875rem', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
      <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: 2 }}>{label}</p>
      <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--primary)' }}>{payload[0].value}</p>
    </div>
  );
};

const CHART_COLORS = ['#8B0000', '#D4AF37', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];

const STATUS_BADGE = {
  Active:    { bg: '#ecfdf5', color: '#059669' },
  Pending:   { bg: '#fffbeb', color: '#d97706' },
  Rejected:  { bg: '#fef2f2', color: '#dc2626' },
  Expired:   { bg: '#f9fafb', color: '#6b7280' },
  Suspended: { bg: '#fef2f2', color: '#dc2626' },
};

/* ─── Dashboard ─────────────────────────────────────────── */
const Dashboard = () => {
  const [stats, setStats]           = useState(null);
  const [activity, setActivity]     = useState(null);
  const [districtData, setDistrict] = useState([]);
  const [typeData, setTypeData]     = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/dashboard/stats'),
      api.get('/dashboard/activity'),
      api.get('/dashboard/members-by-district'),
      api.get('/dashboard/members-by-type'),
    ]).then(([s, a, d, t]) => {
      setStats(s.data);
      setActivity(a.data);
      setDistrict(d.data.slice(0, 8));
      setTypeData(t.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 1rem' }} />
          <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Loading dashboard…</p>
        </div>
      </div>
    );
  }

  const statCards = stats ? [
    { icon: Users,         label: 'Active Members',       value: stats.totalMembers?.toLocaleString(), color: '#8B0000', bg: 'rgba(139,0,0,0.08)',    link: '/admin/members' },
    { icon: Clock,         label: 'Pending Approvals',    value: stats.pendingApprovals,               color: '#d97706', bg: 'rgba(217,119,6,0.08)',   link: '/admin/members' },
    { icon: Calendar,      label: 'Total Events',         value: stats.totalEvents,                    color: '#2563eb', bg: 'rgba(37,99,235,0.08)',    link: '/admin/events' },
    { icon: Building2,     label: 'Active Businesses',    value: stats.activeBusinesses,               color: '#059669', bg: 'rgba(5,150,105,0.08)',    link: '/admin/businesses' },
    { icon: Briefcase,     label: 'Active Jobs',          value: stats.activeJobs,                     color: '#7c3aed', bg: 'rgba(124,58,237,0.08)',   link: '/admin/jobs' },
    { icon: GraduationCap, label: 'Pending Scholarships', value: stats.pendingScholarships,            color: '#0891b2', bg: 'rgba(8,145,178,0.08)',    link: '/admin/scholarships' },
    { icon: MessageSquare, label: 'Open Issues',          value: stats.openIssues,                     color: '#dc2626', bg: 'rgba(220,38,38,0.08)',    link: '/admin/forum' },
    { icon: Heart,         label: 'Total Donations',      value: `₹${(stats.totalDonations || 0).toLocaleString()}`, color: '#059669', bg: 'rgba(5,150,105,0.08)', link: '/admin/donations' },
  ] : [];

  return (
    <div style={{ maxWidth: 1400 }}>
      {/* Page header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: '#111827', margin: 0 }}>Dashboard</h1>
        <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginTop: 4 }}>
          Welcome back — here's what's happening in your community.
        </p>
      </div>

      {/* KPI grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        {statCards.map(c => <StatCard key={c.label} {...c} />)}
      </div>

      {/* Charts row */}
      {(districtData.length > 0 || typeData.length > 0) && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.6fr) minmax(0, 1fr)',
            gap: '1rem',
            marginBottom: '1rem',
          }}
          className="flex-col-mobile"
        >
          {districtData.length > 0 && (
            <div className="rounded-xl" style={{ background: 'white', border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Activity size={16} style={{ color: 'var(--primary)' }} />
                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111827' }}>Members by District</p>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={districtData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                  <XAxis dataKey="district" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(139,0,0,0.04)' }} />
                  <Bar dataKey="count" fill="var(--primary)" radius={[5, 5, 0, 0]} maxBarSize={36} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {typeData.length > 0 && (
            <div className="rounded-xl" style={{ background: 'white', border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Users size={16} style={{ color: 'var(--primary)' }} />
                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111827' }}>Members by Type</p>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={typeData}
                    dataKey="count"
                    nameKey="name"
                    cx="50%" cy="45%"
                    outerRadius={90}
                    innerRadius={45}
                    paddingAngle={3}
                  >
                    {typeData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={v => <span style={{ fontSize: '0.75rem', color: '#4b5563' }}>{v}</span>}
                  />
                  <Tooltip
                    formatter={(v, n) => [v, n]}
                    contentStyle={{ borderRadius: 10, border: '1px solid #e5e7eb', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '0.8125rem' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* Activity row */}
      {activity && (
        <div
          className="activity-grid-3"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: '1rem',
          }}
        >
          {/* Recent Members */}
          <SectionCard title="Recent Members" link="/admin/members">
            {activity.recentMembers?.length === 0 && (
              <p style={{ padding: '1rem 0', color: '#9ca3af', fontSize: '0.8125rem', textAlign: 'center' }}>No recent members</p>
            )}
            {activity.recentMembers?.map(m => {
              const bs = STATUS_BADGE[m.status] || { bg: '#f3f4f6', color: '#6b7280' };
              return (
                <ActivityItem
                  key={m.id}
                  badge={
                    <span style={{ padding: '0.2rem 0.5rem', borderRadius: 999, fontSize: '0.6875rem', fontWeight: 600, background: bs.bg, color: bs.color }}>
                      {m.status}
                    </span>
                  }
                >
                  {m.full_name}
                </ActivityItem>
              );
            })}
          </SectionCard>

          {/* Recent Events */}
          <SectionCard title="Recent Events" link="/admin/events">
            {activity.recentEvents?.length === 0 && (
              <p style={{ padding: '1rem 0', color: '#9ca3af', fontSize: '0.8125rem', textAlign: 'center' }}>No events</p>
            )}
            {activity.recentEvents?.map(e => (
              <ActivityItem
                key={e.id}
                time={new Date(e.event_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              >
                {e.title}
              </ActivityItem>
            ))}
          </SectionCard>

          {/* Recent News */}
          <SectionCard title="Recent News" link="/admin/news">
            {activity.recentNews?.length === 0 && (
              <p style={{ padding: '1rem 0', color: '#9ca3af', fontSize: '0.8125rem', textAlign: 'center' }}>No news</p>
            )}
            {activity.recentNews?.map(n => (
              <ActivityItem
                key={n.id}
                badge={
                  <span style={{ padding: '0.2rem 0.5rem', borderRadius: 999, fontSize: '0.6875rem', fontWeight: 600, background: '#eff6ff', color: '#3b82f6' }}>
                    {n.category}
                  </span>
                }
              >
                {n.title.length > 32 ? n.title.substring(0, 32) + '…' : n.title}
              </ActivityItem>
            ))}
          </SectionCard>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
