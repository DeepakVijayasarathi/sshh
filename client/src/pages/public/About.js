import React, { useState, useEffect } from 'react';
import { Info as InfoIcon } from 'lucide-react';
import * as Icons from 'lucide-react';
import PublicLayout from '../../components/common/PublicLayout';
import api from '../../services/api';

const SectionIcon = ({ name, size = 22, color }) => {
  const Cmp = Icons[name] || InfoIcon;
  return <Cmp size={size} color={color} strokeWidth={1.75} />;
};

const About = () => {
  const [sections, setSections] = useState([]);

  useEffect(() => {
    api.get('/about', { params: { active: true } })
      .then(r => setSections(r.data || []))
      .catch(() => setSections([]));
  }, []);

  const intro = sections.filter(s => s.type === 'intro');
  const cards = sections.filter(s => s.type !== 'intro');

  return (
    <PublicLayout>
      <div className="page-header">
        <div className="container">
          <h1>About Us</h1>
          <p>Learn about the Sourashtra community and our mission</p>
        </div>
      </div>
      <section className="section">
        <div className="container" style={{ maxWidth: 860 }}>
          {intro.map(s => (
            <div key={s.id} className="card mb-4">
              <div className="card-body">
                <h2 className="section-title" style={{ marginBottom: '1rem' }}>{s.title}</h2>
                {(s.content || '').split('\n\n').map((para, i) => (
                  <p key={i} style={{ lineHeight: 1.8, color: 'var(--text-medium)', marginBottom: '1rem' }}>{para}</p>
                ))}
              </div>
            </div>
          ))}
          <div className="grid grid-2">
            {cards.map(s => (
              <div key={s.id} className="card">
                <div className="card-body">
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: `${s.color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                    <SectionIcon name={s.icon} color={s.color} />
                  </div>
                  <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, marginBottom: '0.5rem' }}>{s.title}</h3>
                  <p style={{ color: 'var(--text-light)', lineHeight: 1.6, fontSize: '0.875rem' }}>{s.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default About;
