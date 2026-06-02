import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, CheckCircle, User, Mail, ShieldAlert, ArrowLeft } from 'lucide-react';
import { appointmentsAPI, getApiError } from '../services/api';

export default function CancelAppointmentPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [cancelled, setCancelled] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Lien d'annulation invalide.");
      setLoading(false);
      return;
    }

    appointmentsAPI
      .getByToken(token)
      .then(setAppointment)
      .catch((err) => setError(getApiError(err)))
      .finally(() => setLoading(false));
  }, [token]);

  const handleCancel = async () => {
    setSubmitting(true);
    setError(null);

    try {
      await appointmentsAPI.cancel(token);
      sessionStorage.removeItem('lastAppointment');
      setCancelled(true);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div style={{
        background: 'white', borderRadius: 20, padding: '3rem',
        textAlign: 'center', maxWidth: 500, margin: '3rem auto',
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
          Annuler le rendez-vous
        </h2>
        <div className="alert-error" style={{ marginBottom: '1.5rem', justifyContent: 'center' }}>
          Lien invalide ou expiré.
        </div>
        <Link to="/cabinets" className="btn-primary">Retour à l'accueil</Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 560, margin: '2rem auto', padding: '0 1rem' }}>
      
      <div className="glass-card overflow-hidden shadow-card" style={{ background: 'white', borderRadius: 24 }}>
        
        {/* Header decoration */}
        <div style={{
          background: cancelled 
            ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
            : 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
          padding: '2rem 1.75rem',
          position: 'relative',
          overflow: 'hidden',
          color: 'white',
          textAlign: 'center',
        }}>
          <div style={{
            position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none'
          }}>
            <div style={{
              position: 'absolute', top: '-50%', right: '-10%',
              width: 200, height: 200, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)',
            }} />
          </div>

          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{
              width: 52, height: 52, borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '1rem',
              border: '1px solid rgba(255,255,255,0.3)',
            }}>
              {cancelled ? <CheckCircle size={26} color="white" /> : <ShieldAlert size={26} color="white" />}
            </div>
            <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '1.35rem', fontWeight: 700, margin: 0, color: 'white' }}>
              {cancelled ? 'Rendez-vous annulé' : 'Annulation de rendez-vous'}
            </h2>
          </div>
        </div>

        {/* Card Content */}
        <div style={{ padding: '2rem' }}>
          
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem 0' }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                border: '2px solid #A9CBE0', borderTopColor: '#225688',
                animation: 'spin 0.8s linear infinite',
              }} />
            </div>
          )}
          
          {error && !cancelled && (
            <div className="alert-error" style={{ marginBottom: '1.5rem' }}>{error}</div>
          )}

          {cancelled && (
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: '#668CA9', fontSize: '0.95rem', marginBottom: '2rem', lineHeight: 1.6 }}>
                Votre rendez-vous a été annulé avec succès. Un e-mail de confirmation d'annulation vous a été envoyé.
              </p>
              <Link to="/cabinets" className="btn-primary" style={{ padding: '0.85rem 2rem' }}>
                Retour à l'accueil
              </Link>
            </div>
          )}

          {!loading && appointment && !cancelled && (
            <>
              <div className="alert-info" style={{ marginBottom: '1.5rem', background: '#fffbeb', borderColor: '#fef3c7', color: '#b45309' }}>
                <AlertTriangle size={18} style={{ flexShrink: 0, color: '#d97706' }} />
                Êtes-vous sûr de vouloir annuler ce rendez-vous ? Cette action est irréversible.
              </div>

              {/* Appointment summary box */}
              <div style={{
                background: '#F0F5F4', border: '1.5px solid rgba(169,203,224,0.2)',
                borderRadius: 16, padding: '1.25rem', marginBottom: '2rem',
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'start', gap: '0.625rem' }}>
                    <User size={15} color="#225688" style={{ marginTop: 2, flexShrink: 0 }} />
                    <div>
                      <span style={{ display: 'block', fontSize: '0.65rem', color: '#668CA9', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Patient</span>
                      <span style={{ color: '#092C56', fontWeight: 700, fontSize: '0.875rem' }}>
                        {appointment.prenom_patient} {appointment.nom_patient}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'start', gap: '0.625rem' }}>
                    <Mail size={15} color="#225688" style={{ marginTop: 2, flexShrink: 0 }} />
                    <div>
                      <span style={{ display: 'block', fontSize: '0.65rem', color: '#668CA9', textTransform: 'uppercase', letterSpacing: '0.05em' }}>E-mail</span>
                      <span style={{ color: '#092C56', fontWeight: 600, fontSize: '0.875rem' }}>
                        {appointment.email_contact}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'start', gap: '0.625rem' }}>
                    <ShieldAlert size={15} color="#225688" style={{ marginTop: 2, flexShrink: 0 }} />
                    <div>
                      <span style={{ display: 'block', fontSize: '0.65rem', color: '#668CA9', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Statut</span>
                      <span style={{ color: '#092C56', fontWeight: 600, fontSize: '0.875rem' }}>
                        {appointment.statut}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div style={{
                display: 'flex', flexWrap: 'wrap', gap: '1rem',
                paddingTop: '1.5rem', borderTop: '1px solid #F0F5F4',
                alignItems: 'center',
              }}>
                <button
                  type="button"
                  className="btn-danger"
                  onClick={handleCancel}
                  disabled={submitting}
                  style={{ padding: '0.85rem 1.75rem' }}
                >
                  {submitting ? 'Annulation...' : "Confirmer l'annulation"}
                </button>
                <Link to={`/rendez-vous/${token}`} className="btn-secondary" style={{ padding: '0.85rem 1.75rem', marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <ArrowLeft size={15} />
                  Retour
                </Link>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
