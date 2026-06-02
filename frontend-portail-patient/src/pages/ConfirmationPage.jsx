import { Link, useLocation } from 'react-router-dom';
import { CheckCircle, Calendar, User, Mail, Phone, Clock, FileText, ArrowRight } from 'lucide-react';

export default function ConfirmationPage() {
  const location = useLocation();
  const stored = sessionStorage.getItem('lastAppointment');
  const data = location.state || (stored ? JSON.parse(stored) : null);

  if (!data) {
    return (
      <div style={{
        background: 'white', borderRadius: 20, padding: '3rem',
        textAlign: 'center', maxWidth: 500, margin: '2rem auto',
        boxShadow: '0 8px 32px rgba(9,44,86,0.08)',
        border: '1px solid rgba(169,203,224,0.3)',
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: '#F0F5F4', border: '1.5px solid #A9CBE0',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1.5rem',
        }}>
          <FileText size={28} color="#225688" />
        </div>
        <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, color: '#092C56', marginBottom: '0.75rem', fontSize: '1.5rem' }}>
          Confirmation
        </h2>
        <p style={{ color: '#668CA9', fontSize: '0.9rem', marginBottom: '2rem', lineHeight: 1.6 }}>
          Aucune réservation récente trouvée.
        </p>
        <Link to="/cabinets" className="btn-primary">
          Prendre un rendez-vous
        </Link>
      </div>
    );
  }

  const { appointment, doctor, slot, date, token } = data;
  const rdv = appointment || data;
  const accessToken = token || rdv.token_modification || rdv.cancel_token;

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '1rem 0' }}>
      
      {/* Visual confirmation badge */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, rgba(16,185,129,0.05) 100%)',
          border: '2px solid #10b981',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1.5rem',
          boxShadow: '0 8px 24px rgba(16,185,129,0.15)',
        }}>
          <CheckCircle size={40} color="#10b981" strokeWidth={2.5} />
        </div>
        <h1 style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 'clamp(1.75rem, 4vw, 2.25rem)',
          fontWeight: 700, color: '#092C56',
          letterSpacing: '-0.02em', marginBottom: '0.75rem',
        }}>
          Réservation confirmée !
        </h1>
        <p style={{ color: '#668CA9', fontSize: '1rem', maxWidth: 480, margin: '0 auto', lineHeight: 1.6 }}>
          Votre rendez-vous a bien été enregistré. Un e-mail de confirmation a été envoyé à <strong style={{ color: '#092C56' }}>{rdv.email_contact}</strong>.
        </p>
      </div>

      {/* Details Card */}
      <div style={{
        background: 'white',
        borderRadius: 24,
        padding: '2rem',
        border: '1px solid rgba(169,203,224,0.3)',
        boxShadow: '0 8px 32px rgba(9,44,86,0.06)',
        marginBottom: '2rem',
      }}>
        <h3 style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '0.8rem', fontWeight: 700, color: '#668CA9',
          textTransform: 'uppercase', letterSpacing: '0.1em',
          borderBottom: '1px solid #F0F5F4', paddingBottom: '1rem',
          marginBottom: '1.5rem',
        }}>
          Récapitulatif de votre rendez-vous
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem 2rem' }} className="confirmation-grid">
          <div>
            <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#668CA9', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
              Patient
            </span>
            <span style={{ color: '#092C56', fontWeight: 600, fontSize: '0.9375rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={15} color="#225688" />
              {rdv.prenom_patient} {rdv.nom_patient}
            </span>
          </div>

          <div>
            <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#668CA9', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
              Médecin
            </span>
            <span style={{ color: '#092C56', fontWeight: 600, fontSize: '0.9375rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={15} color="#225688" />
              {doctor ? `Dr ${doctor.prenom} ${doctor.nom}` : 'Ophtalmologue'}
            </span>
          </div>

          <div>
            <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#668CA9', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
              Date
            </span>
            <span style={{ color: '#092C56', fontWeight: 600, fontSize: '0.9375rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={15} color="#225688" />
              {date || slot?.date}
            </span>
          </div>

          <div>
            <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#668CA9', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
              Heure
            </span>
            <span style={{ color: '#092C56', fontWeight: 600, fontSize: '0.9375rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={15} color="#225688" />
              {slot?.heure_debut?.slice?.(0, 5) || slot?.heure_debut} — {slot?.heure_fin?.slice?.(0, 5) || slot?.heure_fin}
            </span>
          </div>

          <div>
            <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#668CA9', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
              Téléphone
            </span>
            <span style={{ color: '#092C56', fontWeight: 600, fontSize: '0.9375rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Phone size={15} color="#225688" />
              {rdv.telephone}
            </span>
          </div>

          <div>
            <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#668CA9', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
              Statut
            </span>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
              padding: '0.25rem 0.75rem', background: '#F0F5F4', borderRadius: 100,
              fontSize: '0.75rem', fontWeight: 700, color: '#225688',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
              {rdv.statut || 'EN_ATTENTE'}
            </span>
          </div>
        </div>
      </div>

      {/* Form actions */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: '1rem',
        justifyContent: 'center', alignItems: 'center',
      }}>
        {accessToken && (
          <Link to={`/rendez-vous/${accessToken}`} className="btn-primary" style={{ padding: '0.85rem 1.75rem' }}>
            Voir les détails du RDV
            <ArrowRight size={16} />
          </Link>
        )}
        <Link to="/cabinets" className="btn-secondary" style={{ padding: '0.85rem 1.75rem' }}>
          Nouveau rendez-vous
        </Link>
      </div>

      <style>{`
        @media (max-width: 480px) {
          .confirmation-grid { grid-template-columns: 1fr !important; gap: 1.25rem !important; }
        }
      `}</style>
    </div>
  );
}
