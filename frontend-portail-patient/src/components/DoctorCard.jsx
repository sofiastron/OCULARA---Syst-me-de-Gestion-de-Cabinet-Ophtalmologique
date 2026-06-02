import { Link } from 'react-router-dom';
import { Stethoscope, Calendar, ChevronRight, Eye } from 'lucide-react';

export default function DoctorCard({ doctor, cabinetId }) {
  const initials = `${doctor.prenom?.[0] || ''}${doctor.nom?.[0] || ''}`.toUpperCase();

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
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg, #092C56, #225688)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(34,86,136,0.3)',
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 700, fontSize: '1.125rem', color: '#A9CBE0',
          letterSpacing: '0.05em',
        }}>
          {initials || <Stethoscope size={22} color="#A9CBE0" />}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 700, fontSize: '1rem',
            color: '#092C56', marginBottom: '0.125rem',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            Dr {doctor.prenom} {doctor.nom}
          </h3>
          {doctor.specialite && (
            <span style={{
              fontSize: '0.75rem', fontWeight: 600,
              color: '#225688',
            }}>
              {doctor.specialite}
            </span>
          )}
        </div>
      </div>


      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        padding: '0.625rem 0.875rem',
        background: 'linear-gradient(135deg, rgba(9,44,86,0.04), rgba(34,86,136,0.06))',
        borderRadius: 12,
        border: '1px solid rgba(169,203,224,0.4)',
      }}>
        <div style={{
          width: 8, height: 8, borderRadius: '50%',
          background: '#10b981',
          boxShadow: '0 0 6px rgba(16,185,129,0.5)',
          animation: 'pulse 2s ease infinite',
          flexShrink: 0,
        }} />
        <span style={{ fontSize: '0.75rem', color: '#668CA9', fontWeight: 500 }}>
          Disponible pour consultation
        </span>
      </div>

      
      <Link
        to={`/cabinet/${cabinetId}/doctors/${doctor.id}/agenda`}
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
          marginTop: 'auto',
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
        <Calendar size={15} />
        Voir les disponibilités
        <ChevronRight size={15} />
      </Link>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
    </article>
  );
}