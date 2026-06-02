import { Link } from 'react-router-dom';
import { MapPin, Phone, ChevronRight, Building2 } from 'lucide-react';

export default function CabinetCard({ cabinet }) {
  return (
    <article
      style={{
        background: 'white',
        borderRadius: 20,
        padding: '1.75rem',
        border: '1px solid rgba(169,203,224,0.3)',
        boxShadow: '0 4px 24px rgba(9,44,86,0.06)',
        transition: 'all 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        cursor: 'default',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 16px 40px rgba(9,44,86,0.12)';
        e.currentTarget.style.borderColor = 'rgba(34,86,136,0.25)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = '0 4px 24px rgba(9,44,86,0.06)';
        e.currentTarget.style.borderColor = 'rgba(169,203,224,0.3)';
      }}
    >
      {/* Icon header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
        <div style={{
          width: 48, height: 48, borderRadius: 14, flexShrink: 0,
          background: 'linear-gradient(135deg, #092C56, #225688)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(34,86,136,0.25)',
        }}>
          <Building2 size={22} color="#A9CBE0" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 700, fontSize: '1.0625rem',
            color: '#092C56', marginBottom: '0.125rem',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {cabinet.nom}
          </h3>
          <span style={{
            fontSize: '0.7rem', fontWeight: 600, color: '#668CA9',
            textTransform: 'uppercase', letterSpacing: '0.08em',
          }}>
            Cabinet ophtalmologique
          </span>
        </div>
      </div>

      {/* Infos */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', flex: 1 }}>
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: '0.625rem',
          padding: '0.625rem 0.875rem',
          background: '#F0F5F4', borderRadius: 12,
        }}>
          <MapPin size={15} color="#225688" style={{ marginTop: 2, flexShrink: 0 }} />
          <span style={{ fontSize: '0.8125rem', color: '#668CA9', lineHeight: 1.5 }}>
            {cabinet.adresse}
          </span>
        </div>
        {cabinet.telephone && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.625rem',
            padding: '0.625rem 0.875rem',
            background: '#F0F5F4', borderRadius: 12,
          }}>
            <Phone size={15} color="#225688" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '0.8125rem', color: '#668CA9' }}>
              {cabinet.telephone}
            </span>
          </div>
        )}
      </div>

      <Link
        to={`/cabinet/${cabinet.id}/doctors`}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '0.5rem',
          padding: '0.75rem 1.25rem',
          background: 'linear-gradient(135deg, #092C56, #225688)',
          color: 'white',
          borderRadius: 14,
          fontWeight: 600, fontSize: '0.875rem',
          textDecoration: 'none',
          transition: 'all 0.2s ease',
          boxShadow: '0 4px 12px rgba(34,86,136,0.25)',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = '0 8px 20px rgba(9,44,86,0.3)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'none';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(34,86,136,0.25)';
        }}
      >
        Choisir ce cabinet
        <ChevronRight size={16} />
      </Link>
    </article>
  );
}