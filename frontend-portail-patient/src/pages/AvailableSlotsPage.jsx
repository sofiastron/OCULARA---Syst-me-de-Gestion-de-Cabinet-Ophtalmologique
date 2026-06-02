import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { doctorsAPI, getApiError, slotsAPI } from '../services/api';
import SlotButton from '../components/SlotButton';
import BookingForm from '../components/BookingForm';

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function AvailableSlotsPage() {
  const { cabinetId, doctorId } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [date, setDate] = useState(todayISO());
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loadingDoctor, setLoadingDoctor] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoadingDoctor(true);
    doctorsAPI
      .getById(doctorId)
      .then(setDoctor)
      .catch((err) => setError(getApiError(err)))
      .finally(() => setLoadingDoctor(false));
  }, [doctorId]);

  useEffect(() => {
    setLoadingSlots(true);
    setSelectedSlot(null);
    setError(null);
    slotsAPI
      .getAvailable(doctorId, date)
      .then(setSlots)
      .catch((err) => setError(getApiError(err)))
      .finally(() => setLoadingSlots(false));
  }, [doctorId, date]);

  const loading = loadingDoctor || loadingSlots;

  return (
    <>
      <nav className="breadcrumb">
        <Link to="/">Cabinets</Link> /{' '}
        <Link to={`/cabinet/${cabinetId}/doctors`}>Médecins</Link> /{' '}
        <span>Créneaux</span>
      </nav>

      <h2 className="page-title">Créneaux disponibles</h2>
      <p className="page-subtitle">
        {doctor
          ? `Dr ${doctor.prenom} ${doctor.nom}${doctor.specialite ? ` — ${doctor.specialite}` : ''}`
          : 'Chargement...'}
      </p>

      <div className="date-picker-row">
        <label htmlFor="date">Date :</label>
        <input
          id="date"
          type="date"
          value={date}
          min={todayISO()}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {loading && <p className="loading">Chargement des créneaux...</p>}

      {!loading && slots.length === 0 && (
        <p className="empty-state">Aucun créneau disponible pour cette date.</p>
      )}

      {!loading && slots.length > 0 && (
        <div className="slots-grid">
          {slots.map((slot) => (
            <SlotButton
              key={slot.creneau_id}
              slot={slot}
              selected={selectedSlot?.creneau_id === slot.creneau_id}
              onSelect={setSelectedSlot}
            />
          ))}
        </div>
      )}

      {selectedSlot && (
        <>
          <h3 style={{ marginTop: '2rem' }}>Formulaire de réservation</h3>
          <dl className="summary-box">
            <dt>Date</dt>
            <dd>{date}</dd>
            <dt>Heure</dt>
            <dd>
              {selectedSlot.heure_debut?.slice?.(0, 5) || selectedSlot.heure_debut}
              {' — '}
              {selectedSlot.heure_fin?.slice?.(0, 5) || selectedSlot.heure_fin}
            </dd>
          </dl>
          <BookingForm
            slot={selectedSlot}
            doctorId={doctorId}
            doctor={doctor}
            date={date}
          />
        </>
      )}

      <div className="form-actions" style={{ marginTop: '1.5rem' }}>
        <Link to={`/cabinet/${cabinetId}/doctors`} className="btn btn-secondary">
          Retour
        </Link>
      </div>
    </>
  );
}
