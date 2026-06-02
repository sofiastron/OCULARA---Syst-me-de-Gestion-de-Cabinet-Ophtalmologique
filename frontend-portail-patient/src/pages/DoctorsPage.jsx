import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Users, MapPin, Building2 } from 'lucide-react';
import { cabinetsAPI, doctorsAPI, getApiError } from '../services/api';
import DoctorCard from '../components/DoctorCard';

export default function DoctorsPage() {
  const { cabinetId } = useParams();
  const [cabinet, setCabinet] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      cabinetsAPI.getById(cabinetId),
      doctorsAPI.getByCabinet(cabinetId),
    ])
      .then(([cab, docs]) => {
        setCabinet(cab);
        setDoctors(docs);
      })
      .catch((err) => setError(getApiError(err)))
      .finally(() => setLoading(false));
  }, [cabinetId]);

  return (
    <>
      {/* Breadcrumb */}
      <nav style={{
        display: 'flex', alignItems: 'center', gap: '0.375rem',
        fontSize: '0.8125rem', color: '#668CA9', marginBottom: '1.5rem',
      }}>
        <Link to="/cabinets" style={{ color: '#225688', textDecoration: 'none', fontWeight: 500, transition: 'color 0.2s' }}
              onMouseEnter={e => e.target.style.color = '#092C56'}
              onMouseLeave={e => e.target.style.color = '#225688'}>Cabinets</Link>
        <span style={{ color: '#A9CBE0' }}>›</span>
        <span style={{ color: '#668CA9' }}>{cabinet?.nom || '...'}</span>
      </nav>

      {/* Page hero header */}
      <div style={{
        background: 'linear-gradient(135deg, #092C56 0%, #225688 100%)',
        borderRadius: 24,
        padding: '2.5rem 2rem',
        marginBottom: '2rem',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Background decoration */}
        <div style={{
          position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none'
        }}>
          <div style={{
            position: 'absolute', top: '-20%', right: '-10%',
            width: 300, height: 300, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(169,203,224,0.15) 0%, transparent 70%)',
          }} />
          <div style={{
            position: 'absolute', bottom: '-40%', left: '-10%',
            width: 200, height: 200, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(169,203,224,0.08) 0%, transparent 70%)',
          }} />
        </div>

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          background: 'rgba(169,203,224,0.15)',
          border: '1px solid rgba(169,203,224,0.3)',
          borderRadius: 100, padding: '0.3rem 0.875rem',
          marginBottom: '1rem',
        }}>
          <Users size={13} color="#A9CBE0" />
          <span style={{ color: '#A9CBE0', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Étape 2 sur 3
          </span>
        </div>

        <h1 style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 'clamp(1.5rem, 3vw, 2rem)',
          fontWeight: 700, color: 'white',
          marginBottom: '0.5rem', letterSpacing: '-0.02em',
        }}>
          Choisissez votre médecin
        </h1>

        {cabinet && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(169,203,224,0.8)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
            <MapPin size={14} color="#A9CBE0" />
            {cabinet.nom} — {cabinet.adresse}
          </div>
        )}
      </div>

      {error && <div className="alert-error" style={{ marginBottom: '1.5rem' }}>{error}</div>}

      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            border: '2.5px solid #A9CBE0', borderTopColor: '#225688',
            animation: 'spin 0.8s linear infinite',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {!loading && !error && doctors.length === 0 && (
        <div style={{
          background: 'white', borderRadius: 20, padding: '3rem',
          textAlign: 'center', color: '#668CA9',
          border: '1px dashed rgba(169,203,224,0.5)',
        }}>
          <Users size={40} color="#A9CBE0" style={{ margin: '0 auto 1rem' }} />
          <p style={{ fontWeight: 500 }}>Aucun médecin disponible dans ce cabinet.</p>
        </div>
      )}

      {!loading && doctors.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}>
          {doctors.map((doctor, i) => (
            <div key={doctor.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 0.08}s` }}>
              <DoctorCard doctor={doctor} cabinetId={cabinetId} />
            </div>
          ))}
        </div>
      )}

      <Link
        to="/cabinets"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.625rem 1.25rem',
          background: 'white', color: '#225688',
          borderRadius: 12, fontWeight: 500, fontSize: '0.875rem',
          border: '1.5px solid #A9CBE0', textDecoration: 'none',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = '#F0F5F4'; e.currentTarget.style.borderColor = '#225688'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = '#A9CBE0'; }}
      >
        <ArrowLeft size={16} />
        Retour aux cabinets
      </Link>
    </>
  );
}