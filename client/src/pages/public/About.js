import React from 'react';
import { Target, Eye, Gem, Users } from 'lucide-react';
import PublicLayout from '../../components/common/PublicLayout';

const About = () => (
  <PublicLayout>
    <div className="page-header">
      <div className="container">
        <h1>About Us</h1>
        <p>Learn about the Sourashtra community and our mission</p>
      </div>
    </div>
    <section className="section">
      <div className="container" style={{ maxWidth: 860 }}>
        <div className="card mb-4">
          <div className="card-body">
            <h2 className="section-title" style={{ marginBottom: '1rem' }}>Who We Are</h2>
            <p style={{ lineHeight: 1.8, color: 'var(--text-medium)', marginBottom: '1rem' }}>
              The Sourashtra community is a vibrant group of people with roots in Gujarat who have settled predominantly in Tamil Nadu over centuries. Known for their skills in silk weaving, the Sourashtra people have made significant contributions to the textile industry of Tamil Nadu.
            </p>
            <p style={{ lineHeight: 1.8, color: 'var(--text-medium)' }}>
              The Sourashtra Community Portal is a digital platform designed to connect community members, preserve cultural heritage, and facilitate community welfare activities across Tamil Nadu and beyond.
            </p>
          </div>
        </div>
        <div className="grid grid-2">
          {[
            { Icon: Target, color: '#8B0000', bg: 'rgba(139,0,0,0.08)',   title: 'Our Mission',    desc: 'To foster unity, preserve culture and promote the welfare of the Sourashtra community through digital innovation and community engagement.' },
            { Icon: Eye,    color: '#2563eb', bg: 'rgba(37,99,235,0.08)', title: 'Our Vision',     desc: 'A connected, prosperous and culturally vibrant Sourashtra community that thrives while preserving its rich heritage and traditions.' },
            { Icon: Gem,    color: '#7c3aed', bg: 'rgba(124,58,237,0.08)',title: 'Our Values',     desc: 'Community first, cultural preservation, education, mutual support, transparency and inclusive growth for all members.' },
            { Icon: Users,  color: '#059669', bg: 'rgba(5,150,105,0.08)', title: 'Our Commitment', desc: 'We are committed to providing quality services, supporting education, enabling business networking and organizing cultural events.' },
          ].map(item => (
            <div key={item.title} className="card">
              <div className="card-body">
                <div style={{ width: 44, height: 44, borderRadius: 10, background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                  <item.Icon size={22} color={item.color} strokeWidth={1.75} />
                </div>
                <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, marginBottom: '0.5rem' }}>{item.title}</h3>
                <p style={{ color: 'var(--text-light)', lineHeight: 1.6, fontSize: '0.875rem' }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  </PublicLayout>
);

export default About;
