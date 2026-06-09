import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import api from '../../services/api';

const StatCard = ({ icon, label, value, color, link }) => (
  <Link to={link || '#'} style={{ textDecoration: 'none' }}>
    <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: 'var(--shadow)', transition: 'transform 0.2s' }}
      onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
      onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
      <div style={{ width: 52, height: 52, borderRadius: 'var(--radius)', background: color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
        {icon}
      </div>
      <div>
        <p style={{ color: 'var(--text-light)', fontSize: '0.8125rem', marginBottom: '0.125rem' }}>{label}</p>
        <p style={{ fontSize: '1.5rem', fontWeight: 700, color: color }}>{value}</p>
      </div>
    </div>
  </Link>
);

const COLORS = ['#8B0000', '#D4AF37', '#2563eb', '#16a34a', '#dc2626', '#7c3aed'];

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState(null);
  const [districtData, setDistrictData] = useState([]);
  const [typeData, setTypeData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/dashboard/stats'),
      api.get('/dashboard/activity'),
      api.get('/dashboard/members-by-district'),
      api.get('/dashboard/members-by-type'),
    ]).then(([s, a, d, t]) => {
      setStats(s.data);
      setActivity(a.data);
      setDistrictData(d.data.slice(0, 8));
      setTypeData(t.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  const statCards = stats ? [
    { icon: '👥', label: 'Active Members', value: stats.totalMembers?.toLocaleString(), color: '#8B0000', link: '/admin/members' },
    { icon: '⏳', label: 'Pending Approvals', value: stats.pendingApprovals, color: '#d97706', link: '/admin/members' },
    { icon: '📅', label: 'Total Events', value: stats.totalEvents, color: '#2563eb', link: '/admin/events' },
    { icon: '🏢', label: 'Active Businesses', value: stats.activeBusinesses, color: '#16a34a', link: '/admin/businesses' },
    { icon: '💼', label: 'Active Jobs', value: stats.activeJobs, color: '#7c3aed', link: '/admin/jobs' },
    { icon: '🎓', label: 'Pending Scholarships', value: stats.pendingScholarships, color: '#0891b2', link: '/admin/scholarships' },
    { icon: '💬', label: 'Open Issues', value: stats.openIssues, color: '#dc2626', link: '/admin/forum' },
    { icon: '💰', label: 'Total Donations', value: `₹${(stats.totalDonations || 0).toLocaleString()}`, color: '#059669', link: '/admin/donations' },
  ] : [];

  return (
    <div>
      <h1 className="page-title">Dashboard</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px,1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {statCards.map(c => <StatCard key={c.label} {...c} />)}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {districtData.length > 0 && (
          <div className="admin-card">
            <div className="admin-card-title">Members by District</div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={districtData}>
                <XAxis dataKey="district" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#8B0000" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        {typeData.length > 0 && (
          <div className="admin-card">
            <div className="admin-card-title">Members by Type</div>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={typeData} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {typeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {activity && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1.5rem' }}>
          <div className="admin-card">
            <div className="admin-card-title">Recent Members <Link to="/admin/members" style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>View all</Link></div>
            {activity.recentMembers?.map(m => (
              <div key={m.id} style={{ padding: '0.625rem 0', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{m.full_name}</span>
                <span className={`badge ${m.status === 'Active' ? 'badge-success' : m.status === 'Pending' ? 'badge-warning' : 'badge-danger'}`}>{m.status}</span>
              </div>
            ))}
          </div>
          <div className="admin-card">
            <div className="admin-card-title">Recent Events <Link to="/admin/events" style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>View all</Link></div>
            {activity.recentEvents?.map(e => (
              <div key={e.id} style={{ padding: '0.625rem 0', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{e.title}</span>
                <span className="text-muted" style={{ fontSize: '0.75rem' }}>{new Date(e.event_date).toLocaleDateString('en-IN')}</span>
              </div>
            ))}
          </div>
          <div className="admin-card">
            <div className="admin-card-title">Recent News <Link to="/admin/news" style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>View all</Link></div>
            {activity.recentNews?.map(n => (
              <div key={n.id} style={{ padding: '0.625rem 0', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{n.title.substring(0, 30)}{n.title.length > 30 ? '...' : ''}</span>
                <span className="badge badge-info">{n.category}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
