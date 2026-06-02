import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import {
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

export default function AgendaPage() {
  const { cabinetId, doctorId } = useParams();
  const navigate = useNavigate();

  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState(todayISO());

  const [doctor, setDoctor] = useState(null);
  const [cabinet, setCabinet] = useState(null);
  const [plages, setPlages] = useState([]);
  const [calendarStatus, setCalendarStatus] = useState({});
  const [availableSlots, setAvailableSlots] = useState([]);
  const [displaySlots, setDisplaySlots] = useState([]);

  const [loadingInit, setLoadingInit] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoadingInit(true);
    Promise.all([
      doctorsAPI.getById(doctorId),
      cabinetsAPI.getById(cabinetId),
      slotsAPI.getPlages(doctorId),
    ])
      .then(([doc, cab, plagesData]) => {
        setDoctor(doc);
        setCabinet(cab);
        setPlages(plagesData);
      })
      .catch((err) => setError(getApiError(err)))
      .finally(() => setLoadingInit(false));
  }, [doctorId, cabinetId]);

  useEffect(() => {
    if (!doctorId) return;
    slotsAPI
      .getCalendarStatus(doctorId, viewYear, viewMonth)
      .then(setCalendarStatus)
      .catch((err) => setError(getApiError(err)));
  }, [doctorId, viewYear, viewMonth]);

  useEffect(() => {
    if (!doctorId || !selectedDate) return;
    setLoadingSlots(true);
    slotsAPI
      .getAvailable(doctorId, selectedDate)
      .then(setAvailableSlots)
      .catch((err) => setError(getApiError(err)))
      .finally(() => setLoadingSlots(false));
  }, [doctorId, selectedDate]);

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

  const handleSlotClick = (slot) => {
    if (!slot.available || !slot.creneau_id) return;
    navigate(`/cabinet/${cabinetId}/doctors/${doctorId}/reservation`, {
      state: {
        doctor,
        cabinet,
        date: selectedDate,
        slot: {
          creneau_id: slot.creneau_id,
          heure_debut: slot.heure_debut,
          heure_fin: slot.heure_fin,
          date: selectedDate,
          ophtalmologue_id: doctorId,
        },
      },
    });
  };

  const formattedSelectedDate = new Date(`${selectedDate}T12:00:00`).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  if (loadingInit) {
    return (
      <div className="flex justify-center py-24">
        <div className="w-10 h-10 border-2 border-glacier border-t-lapis rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
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
        <span style={{ color: '#668CA9' }}>Agenda</span>
      </nav>

      <div className="glass-card overflow-hidden shadow-card">
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
              Prise de rendez-vous — Étape 2 sur 3
            </p>
            <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '1.5rem', fontWeight: 700, margin: 0, color: 'white' }}>
              Dr {doctor?.prenom} {doctor?.nom}
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

        <div className="p-6">
          {error && <div className="alert-error mb-6">{error}</div>}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            <div>
              <div className="flex items-center justify-between mb-4">
                <button
                  type="button"
                  onClick={() => {
                    if (viewMonth === 1) { setViewMonth(12); setViewYear((y) => y - 1); }
                    else setViewMonth((m) => m - 1);
                  }}
                  className="w-9 h-9 rounded-lg border border-glacier flex items-center justify-center hover:bg-quartz text-brand-slate"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h3 className="font-display font-bold text-abyss">
                  {MOIS_LABEL[viewMonth - 1]} {viewYear}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    if (viewMonth === 12) { setViewMonth(1); setViewYear((y) => y + 1); }
                    else setViewMonth((m) => m + 1);
                  }}
                  className="w-9 h-9 rounded-lg border border-glacier flex items-center justify-center hover:bg-quartz text-brand-slate"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-1">
                {JOURS_LABEL.map((j) => (
                  <div key={j} className="text-center text-xs font-semibold text-brand-slate py-1">
                    {j}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((item, index) => {
                  if (!item) return <div key={`e-${index}`} />;
                  const isSelected = item.dateStr === selectedDate;
                  const isPast = item.status === 'passe';
                  const isAvailable = item.status === 'disponible';

                  let btnClass = 'w-full aspect-square rounded-xl text-sm font-medium transition-all ';
                  if (isPast) btnClass += 'text-brand-slate/40 cursor-not-allowed';
                  else if (isSelected) btnClass += 'bg-lapis text-white shadow-md';
                  else if (isAvailable) btnClass += 'text-abyss hover:bg-quartz border border-transparent hover:border-glacier';
                  else btnClass += 'text-brand-slate/40 cursor-not-allowed';

                  return (
                    <button
                      key={item.dateStr}
                      type="button"
                      disabled={isPast || !isAvailable}
                      className={btnClass}
                      onClick={() => isAvailable && setSelectedDate(item.dateStr)}
                    >
                      {item.day}
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-4 mt-4 text-xs text-brand-slate">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-lapis" /> Disponible
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-quartz border border-glacier" /> Complet
                </span>
              </div>
            </div>

           
            <div>
              <h3 className="font-display font-bold text-abyss mb-4 capitalize">
                {formattedSelectedDate}
              </h3>

              {loadingSlots && (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-2 border-glacier border-t-lapis rounded-full animate-spin" />
                </div>
              )}

              {!loadingSlots && displaySlots.length === 0 && (
                <p className="text-center text-brand-slate py-12 text-sm">
                  Aucun créneau disponible pour cette date.
                </p>
              )}

              {!loadingSlots && displaySlots.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {displaySlots.map((slot) => (
                    <button
                      key={`${slot.heure_debut}-${slot.creneau_id || 'x'}`}
                      type="button"
                      disabled={!slot.available}
                      onClick={() => handleSlotClick(slot)}
                      className={slot.available ? 'slot-available' : 'slot-taken'}
                    >
                      {slot.heure_debut}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100">
            <Link to={`/cabinet/${cabinetId}/doctors`} className="btn-secondary">
              <ArrowLeft className="w-4 h-4" />
              Retour aux médecins
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
