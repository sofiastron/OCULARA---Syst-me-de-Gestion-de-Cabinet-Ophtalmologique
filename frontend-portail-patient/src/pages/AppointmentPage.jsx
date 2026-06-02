import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { CalendarClock, Mail, Phone, User, ArrowLeft, CheckCircle, AlertTriangle } from 'lucide-react';
import { appointmentsAPI, doctorsAPI, getApiError } from '../services/api';

function formatTime(value) {
  if (!value) return '—';
  return String(value).slice(0, 5);
}

function formatDateFr(dateStr) {
  if (!dateStr) return '—';
  return new Date(`${dateStr}T12:00:00`).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function AppointmentPage() {
  const { token } = useParams();
  const location = useLocation();
  const modified = location.state?.modified;

  const [appointment, setAppointment] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) {
      setError('Lien de rendez-vous invalide.');
      setLoading(false);
      return;
    }

    appointmentsAPI
      .getByToken(token)
      .then(async (data) => {
        setAppointment(data);
        try {
          const doc = await doctorsAPI.getById(data.ophtalmologue_id);
          setDoctor(doc);
        } catch {
          
        }
      })
      .catch((err) => setError(getApiError(err)))
      .finally(() => setLoading(false));
  }, [token]);

  if (!token) {
    return (
      <div style={{
        background: 'white', borderRadius: 20, padding: '3rem',
        textAlign: 'center', maxWidth: 500, margin: '2rem auto',
        boxShadow: '0 8px 32px rgba(9,44,86,0.08)',
        border: '1px solid rgba(169,203,224,0.3)',
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: '#fef2f2', border: '1.5px solid #fecaca',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1.5rem',
        }}>
          <AlertTriangle size={28} color="#dc2626" />
        </div>
        <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, color: '#092C56', marginBottom: '0.75rem', fontSize: '1.5rem' }}>
          Rendez-vous
        </h2>
        <div className="alert-error" style={{ marginBottom: '1.5rem', justifyContent: 'center' }}>
          Lien invalide ou expiré.
        </div>
        <Link to="/cabinets" className="btn-primary">Retour à l'accueil</Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '6rem 0' }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          border: '2.5px solid #A9CBE0', borderTopColor: '#225688',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      
      {/* Breadcrumb */}
      <nav style={{
        display: 'flex', alignItems: 'center', gap: '0.375rem',
        fontSize: '0.8125rem', color: '#668CA9', marginBottom: '1.5rem',
      }}>
        <Link to="/cabinets" style={{ color: '#225688', textDecoration: 'none', fontWeight: 500, transition: 'color 0.2s' }}
              onMouseEnter={e => e.target.style.color = '#092C56'}
              onMouseLeave={e => e.target.style.color = '#225688'}>Accueil</Link>
        <span style={{ color: '#A9CBE0' }}>›</span>
        <span style={{ color: '#668CA9' }}>Mon rendez-vous</span>
      </nav>

      {/* Appointment Card */}
      <div className="glass-card overflow-hidden shadow-card">
        
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #092C56 0%, #225688 100%)',
          padding: '2rem 1.75rem',
          position: 'relative',
          overflow: 'hidden',
          color: 'white',
        }}>
          
          <div style={{
            position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none'
          }}>
            <div style={{
              position: 'absolute', top: '-40%', right: '-10%',
              width: 250, height: 250, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(169,203,224,0.15) 0%, transparent 70%)',
            }} />
            <div style={{
              position: 'absolute', bottom: '-60%', left: '-10%',
              width: 180, height: 180, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(169,203,224,0.08) 0%, transparent 70%)',
            }} />
          </div>
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            <p style={{ color: '#A9CBE0', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Détails du rendez-vous
            </p>
            <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '1.5rem', fontWeight: 700, margin: 0, color: 'white' }}>
              {doctor ? `Dr ${doctor.prenom} ${doctor.nom}` : 'Votre rendez-vous'}
            </h2>
            {doctor?.specialite && (
              <p style={{ color: 'rgba(169,203,224,0.85)', fontSize: '0.875rem', marginTop: '0.25rem' }}>{doctor.specialite}</p>
            )}
          </div>
        </div>

       
        <div style={{ padding: '2rem' }}>
          {modified && (
            <div className="alert-success" style={{ marginBottom: '1.5rem', alignItems: 'center' }}>
              <CheckCircle size={18} style={{ flexShrink: 0 }} />
              Votre rendez-vous a été modifié avec succès.
            </div>
          )}

          {error && <div className="alert-error" style={{ marginBottom: '1.5rem' }}>{error}</div>}

          {appointment && (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
                
               
                <div style={{
                  display: 'flex', alignItems: 'start', gap: '1rem',
                  padding: '1.25rem', background: '#F0F5F4', borderRadius: 16,
                  border: '1.5px solid rgba(169,203,224,0.2)',
                }}>
                  <User className="w-5 h-5 text-lapis mt-0.5 shrink-0" style={{ color: '#225688' }} />
                  <div>
                    <p style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#668CA9', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.125rem' }}>
                      Patient
                    </p>
                    <p style={{ margin: 0, fontWeight: 700, color: '#092C56', fontSize: '1rem' }}>
                      {appointment.prenom_patient} {appointment.nom_patient}
                    </p>
                  </div>
                </div>

                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
                  <div style={{
                    display: 'flex', alignItems: 'start', gap: '1rem',
                    padding: '1.25rem', background: '#F0F5F4', borderRadius: 16,
                    border: '1.5px solid rgba(169,203,224,0.2)',
                  }}>
                    <Mail className="w-5 h-5 text-lapis mt-0.5 shrink-0" style={{ color: '#225688' }} />
                    <div>
                      <p style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#668CA9', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.125rem' }}>
                        Adresse e-mail
                      </p>
                      <p style={{ margin: 0, fontWeight: 600, color: '#092C56', fontSize: '0.9rem' }}>
                        {appointment.email_contact}
                      </p>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex', alignItems: 'start', gap: '1rem',
                    padding: '1.25rem', background: '#F0F5F4', borderRadius: 16,
                    border: '1.5px solid rgba(169,203,224,0.2)',
                  }}>
                    <Phone className="w-5 h-5 text-lapis mt-0.5 shrink-0" style={{ color: '#225688' }} />
                    <div>
                      <p style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#668CA9', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.125rem' }}>
                        Téléphone
                      </p>
                      <p style={{ margin: 0, fontWeight: 600, color: '#092C56', fontSize: '0.9rem' }}>
                        {appointment.telephone}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Date & Hour Block */}
                <div style={{
                  display: 'flex', alignItems: 'start', gap: '1rem',
                  padding: '1.25rem', background: 'linear-gradient(135deg, rgba(9,44,86,0.03), rgba(34,86,136,0.06))',
                  borderRadius: 16, border: '1.5px solid rgba(169,203,224,0.4)',
                }}>
                  <CalendarClock className="w-5 h-5 text-lapis mt-0.5 shrink-0" style={{ color: '#225688' }} />
                  <div>
                    <p style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#668CA9', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.125rem' }}>
                      Date et heure
                    </p>
                    <p style={{ margin: 0, fontWeight: 700, color: '#092C56', fontSize: '1rem', textTransform: 'capitalize' }}>
                      {formatDateFr(appointment.date)}
                    </p>
                    <p style={{ margin: '0.25rem 0 0', fontWeight: 600, color: '#225688', fontSize: '0.9rem' }}>
                      {formatTime(appointment.heure_debut)} — {formatTime(appointment.heure_fin)}
                    </p>
                  </div>
                </div>

                {/* Motif Block */}
                {appointment.motif && (
                  <div style={{
                    padding: '1.25rem', background: '#F0F5F4', borderRadius: 16,
                    border: '1.5px solid rgba(169,203,224,0.2)',
                  }}>
                    <p style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#668CA9', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                      Motif de consultation
                    </p>
                    <p style={{ margin: 0, fontWeight: 500, color: '#092C56', fontSize: '0.9rem', lineHeight: 1.5 }}>
                      {appointment.motif}
                    </p>
                  </div>
                )}

                {/* Status indicator */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#668CA9' }}>Statut :</span>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                    padding: '0.25rem 0.75rem', borderRadius: 100,
                    fontSize: '0.75rem', fontWeight: 700,
                    background: appointment.statut === 'ANNULE' ? '#fee2e2' : '#f0fdf4',
                    color: appointment.statut === 'ANNULE' ? '#dc2626' : '#15803d',
                  }}>
                    <span style={{
                      width: 6, height: 6, borderRadius: '50%',
                      background: appointment.statut === 'ANNULE' ? '#dc2626' : '#10b981'
                    }} />
                    {appointment.statut}
                  </span>
                </div>
              </div>

              {/* Actions Footer */}
              {appointment.statut !== 'ANNULE' && (
                <div style={{
                  display: 'flex', flexWrap: 'wrap', gap: '1rem',
                  paddingTop: '1.5rem', borderTop: '1px solid #F0F5F4',
                }}>
                  <Link
                    to={`/rendez-vous/${token}/modifier`}
                    className="btn-primary"
                    style={{ padding: '0.85rem 1.75rem' }}
                  >
                    Modifier le RDV
                  </Link>
                  <Link
                    to={`/rendez-vous/${token}/annuler`}
                    className="btn-danger"
                    style={{ padding: '0.85rem 1.75rem' }}
                  >
                    Annuler le RDV
                  </Link>
                  <Link to="/cabinets" className="btn-secondary" style={{ padding: '0.85rem 1.75rem', marginLeft: 'auto' }}>
                    Accueil
                  </Link>
                </div>
              )}

              {appointment.statut === 'ANNULE' && (
                <div style={{
                  display: 'flex', flexWrap: 'wrap', gap: '1rem',
                  paddingTop: '1.5rem', borderTop: '1px solid #F0F5F4',
                  justifyContent: 'center',
                }}>
                  <Link to="/cabinets" className="btn-primary" style={{ padding: '0.85rem 2rem' }}>
                    Prendre un nouveau rendez-vous
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
