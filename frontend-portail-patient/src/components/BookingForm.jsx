import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Phone, Mail, ArrowRight, Loader } from 'lucide-react';
import { appointmentsAPI, getApiError } from '../services/api';

export default function BookingForm({ slot, doctorId, doctor, date }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ nom: '', telephone: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!slot || !doctorId) {
      setError('Aucun créneau sélectionné.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const appointment = await appointmentsAPI.create({
        creneau_id: slot.creneau_id,
        ophtalmologue_id: doctorId,
        nom_patient: form.nom,
        prenom_patient: form.nom.split(' ')[0] || form.nom,
        telephone: form.telephone,
        email_contact: form.email,
        source: 'web',
      });
      const token = appointment.token_modification || appointment.cancel_token;
      sessionStorage.setItem('lastAppointment', JSON.stringify({ appointment, doctor, slot, date, token }));
      navigate('/confirmation', { state: { appointment, doctor, slot, date, token } });
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { id: 'nom', label: 'Nom complet', type: 'text', placeholder: 'Jean Dupont', icon: User },
    { id: 'telephone', label: 'Téléphone', type: 'tel', placeholder: '06 00 00 00 00', icon: Phone },
    { id: 'email', label: 'Email', type: 'email', placeholder: 'vous@email.com', icon: Mail },
  ];

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="alert-error" style={{ marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
        {fields.map(({ id, label, type, placeholder, icon: Icon }) => (
          <div key={id}>
            <label htmlFor={id} style={{
              display: 'block', fontSize: '0.7rem', fontWeight: 600,
              color: '#668CA9', textTransform: 'uppercase', letterSpacing: '0.08em',
              marginBottom: '0.5rem',
            }}>
              {label} <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)',
                pointerEvents: 'none',
              }}>
                <Icon size={16} color="#A9CBE0" />
              </div>
              <input
                id={id}
                name={id}
                type={type}
                value={form[id]}
                onChange={handleChange}
                placeholder={placeholder}
                required
                style={{
                  width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem',
                  borderRadius: 14,
                  border: '1.5px solid #A9CBE0',
                  background: 'white', fontSize: '0.9rem',
                  color: '#092C56', outline: 'none',
                  transition: 'all 0.2s ease',
                  fontFamily: "'Inter', sans-serif",
                }}
                onFocus={e => {
                  e.target.style.borderColor = '#225688';
                  e.target.style.boxShadow = '0 0 0 3px rgba(34,86,136,0.12)';
                }}
                onBlur={e => {
                  e.target.style.borderColor = '#A9CBE0';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={loading}
        style={{
          width: '100%', display: 'flex', alignItems: 'center',
          justifyContent: 'center', gap: '0.625rem',
          padding: '0.9rem 1.5rem',
          background: loading ? '#668CA9' : 'linear-gradient(135deg, #092C56, #225688)',
          color: 'white', borderRadius: 14,
          fontWeight: 600, fontSize: '0.9375rem',
          border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: loading ? 'none' : '0 4px 16px rgba(34,86,136,0.3)',
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {loading ? (
          <>
            <div style={{
              width: 18, height: 18, borderRadius: '50%',
              border: '2px solid rgba(255,255,255,0.4)',
              borderTopColor: 'white',
              animation: 'spin 0.8s linear infinite',
            }} />
            Réservation en cours...
          </>
        ) : (
          <>
            Confirmer la réservation
            <ArrowRight size={18} />
          </>
        )}
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </button>

      <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.75rem', color: '#668CA9' }}>
        🔒 Vos données sont protégées et confidentielles
      </p>
    </form>
  );
}