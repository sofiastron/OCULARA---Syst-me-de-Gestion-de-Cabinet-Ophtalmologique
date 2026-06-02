import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Building2, ArrowLeft, MapPin, ChevronRight } from 'lucide-react';
import { cabinetsAPI, getApiError } from '../services/api';
import CabinetCard from '../components/CabinetCard';

export default function CabinetsPage() {
  const [cabinets, setCabinets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cabinetsAPI
      .getAll()
      .then(setCabinets)
      .catch((err) => setError(getApiError(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      {/* Page hero header */}
      <div style={{
        background: 'linear-gradient(135deg, #092C56 0%, #225688 100%)',
        borderRadius: 24,
        padding: '2.5rem 2rem',
        marginBottom: '2rem',
        position: 'relative',
        overflow: 'hidden',
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
          <Building2 size={13} color="#A9CBE0" />
          <span style={{
            color: '#A9CBE0', fontSize: '0.7rem',
            fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
          }}>
            Étape 1 sur 3
          </span>
        </div>

        <h1 style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 'clamp(1.5rem, 3vw, 2rem)',
          fontWeight: 700, color: 'white',
          marginBottom: '0.5rem', letterSpacing: '-0.02em',
        }}>
          Choisissez votre cabinet
        </h1>
        <p style={{ color: 'rgba(169,203,224,0.8)', fontSize: '0.9375rem', maxWidth: 480 }}>
          Sélectionnez un cabinet ophtalmologique proche de chez vous pour consulter les médecins disponibles.
        </p>
      </div>

      {error && (
        <div className="alert-error" style={{ marginBottom: '1.5rem' }}>{error}</div>
      )}

      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            border: '2.5px solid #A9CBE0',
            borderTopColor: '#225688',
            animation: 'spin 0.8s linear infinite',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {!loading && !error && cabinets.length === 0 && (
        <div style={{
          background: 'white', borderRadius: 20, padding: '3rem',
          textAlign: 'center', color: '#668CA9',
          border: '1px dashed rgba(169,203,224,0.5)',
        }}>
          <Building2 size={40} color="#A9CBE0" style={{ margin: '0 auto 1rem' }} />
          <p style={{ fontWeight: 500 }}>Aucun cabinet disponible pour le moment.</p>
        </div>
      )}

      {!loading && cabinets.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.25rem',
        }}>
          {cabinets.map((cabinet, i) => (
            <div
              key={cabinet.id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <CabinetCard cabinet={cabinet} />
            </div>
          ))}
        </div>
      )}
    </>
  );
}