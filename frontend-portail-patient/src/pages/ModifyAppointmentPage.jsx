import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  MapPin,
  User,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import {
  appointmentsAPI,
  cabinetsAPI,
  doctorsAPI,
  getApiError,
  slotsAPI,
} from '../services/api';

const JOURS_FR = ['DIMANCHE', 'LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI'];
const JOURS_LABEL = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MOIS_LABEL = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatTime(value) {
  if (!value) return '';
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

function toMinutes(timeStr) {
  const [h, m] = String(timeStr).slice(0, 5).split(':').map(Number);
  return h * 60 + m;
}

function minutesToTime(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function getDayNameFr(dateStr) {
  return JOURS_FR[new Date(`${dateStr}T12:00:00`).getDay()];
}

function buildSlotsFromPlage(plage) {
  if (!plage) return [];
  const duree = plage.duree_creneau_min || 30;
  let current = toMinutes(plage.heure_debut);
  const end = toMinutes(plage.heure_fin);
  const slots = [];
  while (current + duree <= end) {
    slots.push({
      heure_debut: minutesToTime(current),
      heure_fin: minutesToTime(current + duree),
      creneau_id: null,
      available: false,
    });
    current += duree;
  }
  return slots;
}

function mergeSlots(plageSlots, availableSlots) {
  const availableMap = new Map(
    availableSlots.map((s) => [formatTime(s.heure_debut), s])
  );
  return plageSlots.map((slot) => {
    const match = availableMap.get(slot.heure_debut);
    if (match) {
      return {
        ...slot,
        creneau_id: match.creneau_id,
        heure_fin: formatTime(match.heure_fin) || slot.heure_fin,
        available: true,
      };
    }
    return { ...slot, available: false };
  });
}

function isTokenExpired(tokenExpiresAt) {
  if (!tokenExpiresAt) return false;
  return new Date(tokenExpiresAt) < new Date();
}

export default function ModifyAppointmentPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState(todayISO());

  const [appointment, setAppointment] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const [cabinet, setCabinet] = useState(null);
  const [plages, setPlages] = useState([]);
  const [calendarStatus, setCalendarStatus] = useState({});
  const [availableSlots, setAvailableSlots] = useState([]);
  const [displaySlots, setDisplaySlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const [loadingInit, setLoadingInit] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const doctorId = appointment?.ophtalmologue_id;
  const canModify = appointment
    && appointment.statut !== 'ANNULE'
    && !isTokenExpired(appointment.token_expires_at);

  useEffect(() => {
    if (!token) {
      setError('Lien de modification invalide.');
      setLoadingInit(false);
      return;
    }

    appointmentsAPI
      .getByToken(token)
      .then(async (data) => {
        setAppointment(data);
        const initialDate = data.date || todayISO();
        setSelectedDate(initialDate);
        const d = new Date(`${initialDate}T12:00:00`);
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth() + 1);

        const [doc, plagesData] = await Promise.all([
          doctorsAPI.getById(data.ophtalmologue_id),
          slotsAPI.getPlages(data.ophtalmologue_id),
        ]);
        setDoctor(doc);
        setPlages(plagesData);

        if (doc?.cabinet_id) {
          try {
            const cab = await cabinetsAPI.getById(doc.cabinet_id);
            setCabinet(cab);
          } catch {
            
          }
        }
      })
      .catch((err) => setError(getApiError(err)))
      .finally(() => setLoadingInit(false));
  }, [token]);

  useEffect(() => {
    if (!doctorId) return;
    slotsAPI
      .getCalendarStatus(doctorId, viewYear, viewMonth)
      .then(setCalendarStatus)
      .catch((err) => setError(getApiError(err)));
  }, [doctorId, viewYear, viewMonth]);

  useEffect(() => {
    if (!doctorId || !selectedDate || !canModify) return;

    setLoadingSlots(true);
    setSelectedSlot(null);
    slotsAPI
      .getAvailable(doctorId, selectedDate)
      .then(setAvailableSlots)
      .catch((err) => setError(getApiError(err)))
      .finally(() => setLoadingSlots(false));
  }, [doctorId, selectedDate, canModify]);

  useEffect(() => {
    const jour = getDayNameFr(selectedDate);
    const plage = plages.find((p) => p.jour_semaine === jour);
    if (!plage) {
      setDisplaySlots(
        availableSlots.map((s) => ({
          creneau_id: s.creneau_id,
          heure_debut: formatTime(s.heure_debut),
          heure_fin: formatTime(s.heure_fin),
          available: true,
        }))
      );
      return;
    }
    setDisplaySlots(mergeSlots(buildSlotsFromPlage(plage), availableSlots));
  }, [plages, availableSlots, selectedDate]);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth - 1, 1);
    const daysInMonth = new Date(viewYear, viewMonth, 0).getDate();
    const startOffset = (firstDay.getDay() + 6) % 7;
    const days = [];
    for (let i = 0; i < startOffset; i += 1) days.push(null);
    for (let d = 1; d <= daysInMonth; d += 1) {
      const dateStr = `${viewYear}-${String(viewMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        day: d,
        dateStr,
        status: calendarStatus[dateStr] || (dateStr < todayISO() ? 'passe' : 'indisponible'),
      });
    }
    return days;
  }, [viewYear, viewMonth, calendarStatus]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSlot) {
      setError('Veuillez sélectionner un nouveau créneau.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await appointmentsAPI.modify(token, {
        nouveau_creneau_id: selectedSlot.creneau_id,
      });
      setSuccess(true);
      setTimeout(() => {
        navigate(`/rendez-vous/${token}`, {
          state: {
            modified: true,
            date: selectedDate,
            slot: selectedSlot,
          },
        });
      }, 1800);
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
          Modifier le rendez-vous
        </h2>
        <div className="alert-error" style={{ marginBottom: '1.5rem', justifyContent: 'center' }}>
          Lien invalide ou expiré.
        </div>
        <Link to="/cabinets" className="btn-primary">Retour à l'accueil</Link>
      </div>
    );
  }

  if (loadingInit) {
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

  if (error && !appointment) {
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
          Modifier le rendez-vous
        </h2>
        <div className="alert-error" style={{ marginBottom: '1.5rem', justifyContent: 'center' }}>
          {error}
        </div>
        <Link to="/cabinets" className="btn-primary">Retour à l'accueil</Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      
      
      <nav style={{
        display: 'flex', alignItems: 'center', gap: '0.375rem',
        fontSize: '0.8125rem', color: '#668CA9', marginBottom: '1.5rem',
        flexWrap: 'wrap',
      }}>
        <Link to="/cabinets" style={{ color: '#225688', textDecoration: 'none', fontWeight: 500, transition: 'color 0.2s' }}
              onMouseEnter={e => e.target.style.color = '#092C56'}
              onMouseLeave={e => e.target.style.color = '#225688'}>Accueil</Link>
        <span style={{ color: '#A9CBE0' }}>›</span>
        <Link to={`/rendez-vous/${token}`} style={{ color: '#225688', textDecoration: 'none', fontWeight: 500, transition: 'color 0.2s' }}
              onMouseEnter={e => e.target.style.color = '#092C56'}
              onMouseLeave={e => e.target.style.color = '#225688'}>Mon rendez-vous</Link>
        <span style={{ color: '#A9CBE0' }}>›</span>
        <span style={{ color: '#668CA9' }}>Modifier</span>
      </nav>

      {/* Main Glass Card */}
      <div className="glass-card overflow-hidden shadow-card">
        
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #092C56 0%, #225688 100%)',
          padding: '2rem 1.75rem',
          position: 'relative',
          overflow: 'hidden',
          color: 'white',
        }}>
          {/* Background decoration */}
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
              Modification de rendez-vous
            </p>
            <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '1.5rem', fontWeight: 700, margin: 0, color: 'white' }}>
              {doctor ? `Dr ${doctor.prenom} ${doctor.nom}` : 'Choisir un nouveau créneau'}
            </h2>
            {doctor?.specialite && (
              <p style={{ color: 'rgba(169,203,224,0.85)', fontSize: '0.875rem', marginTop: '0.25rem' }}>{doctor.specialite}</p>
            )}
            {cabinet && (
              <p style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'rgba(169,203,224,0.75)', fontSize: '0.8125rem', marginTop: '0.75rem' }}>
                <MapPin size={14} color="#A9CBE0" />
                {cabinet.nom} — {cabinet.adresse}
              </p>
            )}
          </div>
        </div>

        {/* Card Body */}
        <div style={{ padding: '2rem' }}>
          
          {success && (
            <div className="alert-success" style={{ marginBottom: '1.5rem', alignItems: 'center' }}>
              <CheckCircle size={18} style={{ flexShrink: 0 }} />
              Rendez-vous modifié avec succès. Redirection vers vos détails…
            </div>
          )}

          {error && !success && <div className="alert-error" style={{ marginBottom: '1.5rem' }}>{error}</div>}

          {appointment && !canModify && (
            <div className="alert-error" style={{ marginBottom: '1.5rem' }}>
              {appointment.statut === 'ANNULE'
                ? "Ce rendez-vous a été annulé. La modification n'est plus possible."
                : "Ce lien a expiré. Les modifications ne sont plus possibles moins de 24 h avant le rendez-vous."}
            </div>
          )}

          {/* Current appointment info summary */}
          {appointment && (
            <div style={{
              background: '#F0F5F4', border: '1.5px solid rgba(169,203,224,0.2)',
              borderRadius: 16, padding: '1.25rem', marginBottom: '2rem',
            }}>
              <p style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#668CA9', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                Rendez-vous actuel
              </p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'start', gap: '0.5rem' }}>
                  <User size={15} color="#225688" style={{ marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <span style={{ display: 'block', fontSize: '0.65rem', color: '#668CA9' }}>Patient</span>
                    <span style={{ color: '#092C56', fontWeight: 700, fontSize: '0.875rem' }}>
                      {appointment.prenom_patient} {appointment.nom_patient}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'start', gap: '0.5rem' }}>
                  <CalendarClock size={15} color="#225688" style={{ marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <span style={{ display: 'block', fontSize: '0.65rem', color: '#668CA9' }}>Date</span>
                    <span style={{ color: '#092C56', fontWeight: 700, fontSize: '0.875rem', textTransform: 'capitalize' }}>
                      {formatDateFr(appointment.date)}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'start', gap: '0.5rem' }}>
                  <CalendarClock size={15} color="#225688" style={{ marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <span style={{ display: 'block', fontSize: '0.65rem', color: '#668CA9' }}>Heure</span>
                    <span style={{ color: '#092C56', fontWeight: 700, fontSize: '0.875rem' }}>
                      {formatTime(appointment.heure_debut)} — {formatTime(appointment.heure_fin)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

        
          {canModify && !success && (
            <form onSubmit={handleSubmit}>
              <p style={{ color: '#668CA9', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                Sélectionnez une nouvelle date et un créneau disponible ci-dessous.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }} className="picker-grid">
                
                {/* Calendar Panel */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                  
                  {/* Calendar Month Header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <button
                      type="button"
                      onClick={() => {
                        if (viewMonth === 1) { setViewMonth(12); setViewYear((y) => y - 1); }
                        else setViewMonth((m) => m - 1);
                      }}
                      className="w-9 h-9 rounded-lg border border-glacier flex items-center justify-center hover:bg-quartz text-brand-slate"
                      style={{ background: 'white', border: '1.5px solid #A9CBE0', cursor: 'pointer', transition: 'all 0.2s', width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = '#225688'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = '#A9CBE0'}
                    >
                      <ChevronLeft className="w-5 h-5" color="#225688" />
                    </button>
                    <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, color: '#092C56', margin: 0, fontSize: '1rem' }}>
                      {MOIS_LABEL[viewMonth - 1]} {viewYear}
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        if (viewMonth === 12) { setViewMonth(1); setViewYear((y) => y + 1); }
                        else setViewMonth((m) => m + 1);
                      }}
                      className="w-9 h-9 rounded-lg border border-glacier flex items-center justify-center hover:bg-quartz text-brand-slate"
                      style={{ background: 'white', border: '1.5px solid #A9CBE0', cursor: 'pointer', transition: 'all 0.2s', width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = '#225688'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = '#A9CBE0'}
                    >
                      <ChevronRight className="w-5 h-5" color="#225688" />
                    </button>
                  </div>

                  {/* Day Names */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, textAlign: 'center' }}>
                    {JOURS_LABEL.map((j) => (
                      <div key={j} style={{ fontSize: '0.75rem', fontWeight: 600, color: '#668CA9', padding: '4px 0' }}>
                        {j}
                      </div>
                    ))}
                  </div>

                 
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
                    {calendarDays.map((item, index) => {
                      if (!item) return <div key={`empty-${index}`} />;
                      const isSelected = item.dateStr === selectedDate;
                      const isPast = item.status === 'passe';
                      const isAvailable = item.status === 'disponible';

                      let btnStyle = {
                        width: '100%',
                        aspectRatio: '1',
                        borderRadius: 12,
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        border: 'none',
                        outline: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      };

                      if (isPast) {
                        btnStyle.color = 'rgba(102,140,169,0.3)';
                        btnStyle.background = 'transparent';
                        btnStyle.cursor = 'not-allowed';
                      } else if (isSelected) {
                        btnStyle.background = '#225688';
                        btnStyle.color = 'white';
                        btnStyle.boxShadow = '0 4px 12px rgba(34,86,136,0.3)';
                      } else if (isAvailable) {
                        btnStyle.background = 'white';
                        btnStyle.color = '#092C56';
                        btnStyle.border = '1px solid rgba(169,203,224,0.3)';
                      } else {
                        btnStyle.color = 'rgba(102,140,169,0.3)';
                        btnStyle.background = 'transparent';
                        btnStyle.cursor = 'not-allowed';
                      }

                      return (
                        <button
                          key={item.dateStr}
                          type="button"
                          disabled={isPast || !isAvailable}
                          style={btnStyle}
                          onClick={() => isAvailable && setSelectedDate(item.dateStr)}
                          onMouseEnter={e => {
                            if (isAvailable && !isSelected) {
                              e.currentTarget.style.background = '#F0F5F4';
                              e.currentTarget.style.borderColor = '#225688';
                            }
                          }}
                          onMouseLeave={e => {
                            if (isAvailable && !isSelected) {
                              e.currentTarget.style.background = 'white';
                              e.currentTarget.style.borderColor = 'rgba(169,203,224,0.3)';
                            }
                          }}
                        >
                          {item.day}
                        </button>
                      );
                    })}
                  </div>

                  {/* Calendar Legend */}
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.75rem' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#668CA9' }}>
                      <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#225688' }} /> Disponible
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#668CA9' }}>
                      <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'transparent', border: '1px solid rgba(169,203,224,0.5)' }} /> Complet
                    </span>
                  </div>
                </div>

                {/* Slots Panel */}
                <div style={{ borderTop: '1px solid #F0F5F4', paddingTop: '1.5rem' }}>
                  <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, color: '#092C56', fontSize: '1rem', marginBottom: '1.25rem', textTransform: 'capitalize' }}>
                    {formatDateFr(selectedDate)}
                  </h3>

                  {loadingSlots && (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem 0' }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        border: '2px solid #A9CBE0', borderTopColor: '#225688',
                        animation: 'spin 0.8s linear infinite',
                      }} />
                    </div>
                  )}

                  {!loadingSlots && displaySlots.length === 0 && (
                    <p style={{ textAlign: 'center', color: '#668CA9', padding: '2rem 0', fontSize: '0.9rem' }}>
                      Aucun créneau disponible pour cette date.
                    </p>
                  )}

                  {!loadingSlots && displaySlots.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '0.5rem' }}>
                      {displaySlots.map((slot) => {
                        const isSelected = selectedSlot?.creneau_id === slot.creneau_id;
                        let btnClass = 'slot-taken';
                        if (slot.available) {
                          btnClass = isSelected ? 'slot-selected' : 'slot-available';
                        }

                        return (
                          <button
                            key={`${slot.heure_debut}-${slot.creneau_id || 'x'}`}
                            type="button"
                            disabled={!slot.available}
                            onClick={() => slot.available && setSelectedSlot(slot)}
                            className={btnClass}
                            style={{ padding: '0.625rem 0.5rem', textAlign: 'center', minWidth: 80 }}
                          >
                            {slot.heure_debut}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>

              {/* Form Buttons */}
              <div style={{
                marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid #F0F5F4',
                display: 'flex', flexWrap: 'wrap', gap: '1rem',
              }}>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={submitting || !selectedSlot}
                  style={{ padding: '0.85rem 1.75rem' }}
                >
                  {submitting ? 'Modification en cours…' : 'Confirmer le nouveau créneau'}
                </button>
                <Link to={`/rendez-vous/${token}`} className="btn-secondary" style={{ padding: '0.85rem 1.75rem' }}>
                  <ArrowLeft size={16} />
                  Retour aux détails
                </Link>
              </div>
            </form>
          )}

          {!canModify && (
            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #F0F5F4' }}>
              <Link to={`/rendez-vous/${token}`} className="btn-secondary" style={{ padding: '0.85rem 1.75rem' }}>
                <ArrowLeft size={16} />
                Retour aux détails
              </Link>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .picker-grid { grid-template-columns: 1.2fr 1fr !important; gap: 3rem !important; }
          .picker-grid > div:last-child { border-top: none !important; padding-top: 0 !important; border-left: 1px solid #F0F5F4; padding-left: 2rem; }
        }
      `}</style>
    </div>
  );
}
