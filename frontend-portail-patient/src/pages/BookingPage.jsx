import { Link, useLocation, useParams } from 'react-router-dom';
import { CalendarClock, User, Clock, ArrowLeft, FileText } from 'lucide-react';
import BookingForm from '../components/BookingForm';

export default function BookingPage() {
  const { cabinetId, doctorId } = useParams();
  const location = useLocation();
  const { slot, doctor, date } = location.state || {};

  if (!slot || !doctor) {
    return (
      <div style={{
        background: 'white', borderRadius: 20, padding: '3rem',
        textAlign: 'center', maxWidth: 480, margin: '0 auto',
        boxShadow: '0 8px 32px rgba(9,44,86,0.08)',
        border: '1px solid rgba(169,203,224,0.3)',
      }}>
        <div style={{
          width: 60, height: 60, borderRadius: '50%',
          background: '#fef2f2', border: '1.5px solid #fecaca',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1.25rem',
        }}>
          <CalendarClock size={26} color="#dc2626" />
        </div>
        <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, color: '#092C56', marginBottom: '0.5rem' }}>
          Aucun créneau sélectionné
        </h2>
        <p style={{ color: '#668CA9', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
          Veuillez d'abord choisir un créneau disponible dans l'agenda du médecin.
        </p>
        <Link
          to={`/cabinet/${cabinetId}/doctors/${doctorId}/agenda`}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            background: 'linear-gradient(135deg, #092C56, #225688)',
            color: 'white', borderRadius: 14, fontWeight: 600,
            textDecoration: 'none', fontSize: '0.875rem',
          }}
        >
          <ArrowLeft size={16} />
          Retour à l'agenda
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Breadcrumb */}
      <nav style={{
        display: 'flex', alignItems: 'center', gap: '0.375rem',
        fontSize: '0.8125rem', color: '#668CA9', marginBottom: '1.5rem',
        flexWrap: 'wrap',
      }}>
        <Link to="/cabinets" style={{ color: '#225688', textDecoration: 'none', fontWeight: 500, transition: 'color 0.2s' }}
              onMouseEnter={e => e.target.style.color = '#092C56'}
              onMouseLeave={e => e.target.style.color = '#225688'}>Cabinets</Link>
        <span style={{ color: '#A9CBE0' }}>›</span>
        <Link to={`/cabinet/${cabinetId}/doctors`} style={{ color: '#225688', textDecoration: 'none', fontWeight: 500, transition: 'color 0.2s' }}
              onMouseEnter={e => e.target.style.color = '#092C56'}
              onMouseLeave={e => e.target.style.color = '#225688'}>Médecins</Link>
        <span style={{ color: '#A9CBE0' }}>›</span>
        <Link to={`/cabinet/${cabinetId}/doctors/${doctorId}/agenda`} style={{ color: '#225688', textDecoration: 'none', fontWeight: 500, transition: 'color 0.2s' }}
              onMouseEnter={e => e.target.style.color = '#092C56'}
              onMouseLeave={e => e.target.style.color = '#225688'}>Agenda</Link>
        <span style={{ color: '#A9CBE0' }}>›</span>
        <span>Réservation</span>
      </nav>

      {/* Page header */}
      <div style={{
        background: 'linear-gradient(135deg, #092C56 0%, #225688 100%)',
        borderRadius: 24, padding: '2.25rem 2rem', marginBottom: '1.75rem',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Background decoration */}
        <div style={{
          position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none'
        }}>
          <div style={{
            position: 'absolute', top: '-30%', right: '-10%',
            width: 280, height: 280, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(169,203,224,0.15) 0%, transparent 70%)',
          }} />
          <div style={{
            position: 'absolute', bottom: '-50%', left: '-10%',
            width: 180, height: 180, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(169,203,224,0.08) 0%, transparent 70%)',
          }} />
        </div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(169,203,224,0.15)', border: '1px solid rgba(169,203,224,0.3)',
            borderRadius: 100, padding: '0.3rem 0.875rem', marginBottom: '0.875rem',
          }}>
            <FileText size={13} color="#A9CBE0" />
            <span style={{ color: '#A9CBE0', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Étape 3 sur 3
            </span>
          </div>
          <h1 style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: 'clamp(1.35rem, 3.5vw, 1.875rem)',
            fontWeight: 700, color: 'white', letterSpacing: '-0.02em', margin: 0,
          }}>
            Confirmer votre rendez-vous
          </h1>
        </div>
      </div>

      {/* Appointment summary card */}
      <div style={{
        background: 'white', borderRadius: 20, padding: '1.5rem',
        border: '1px solid rgba(169,203,224,0.3)',
        boxShadow: '0 4px 24px rgba(9,44,86,0.06)',
        marginBottom: '1.5rem',
      }}>
        <p style={{
          fontSize: '0.7rem', fontWeight: 600, color: '#668CA9',
          textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem',
        }}>
          Récapitulatif
        </p>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '1rem',
        }}>
          {[
            { icon: User, label: 'Médecin', value: `Dr ${doctor.prenom} ${doctor.nom}` },
            { icon: CalendarClock, label: 'Date', value: date },
            { icon: Clock, label: 'Heure', value: `${slot.heure_debut?.slice?.(0,5)} — ${slot.heure_fin?.slice?.(0,5)}` },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} style={{
              display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
              padding: '0.875rem', background: '#F0F5F4', borderRadius: 14,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: 'linear-gradient(135deg, #092C56, #225688)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={16} color="#A9CBE0" />
              </div>
              <div>
                <p style={{ fontSize: '0.65rem', fontWeight: 600, color: '#668CA9', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.125rem' }}>
                  {label}
                </p>
                <p style={{ fontWeight: 600, color: '#092C56', fontSize: '0.875rem' }}>{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Booking form */}
      <div style={{
        background: 'white', borderRadius: 20, padding: '2rem',
        border: '1px solid rgba(169,203,224,0.3)',
        boxShadow: '0 4px 24px rgba(9,44,86,0.06)',
      }}>
        <p style={{
          fontSize: '0.7rem', fontWeight: 600, color: '#668CA9',
          textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1.5rem',
        }}>
          Vos informations
        </p>
        <BookingForm slot={slot} doctorId={doctorId} doctor={doctor} date={date} />
      </div>
    </>
  );
}