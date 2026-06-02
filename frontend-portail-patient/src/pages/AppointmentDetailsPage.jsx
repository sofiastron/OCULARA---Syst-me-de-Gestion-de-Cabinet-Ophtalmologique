import { Link, useLocation, useParams } from 'react-router-dom';
import { Eye, Menu, Mail } from 'lucide-react';

export default function AppointmentDetailsPage() {
  const { appointmentId } = useParams();
  const location = useLocation();
  const stored = sessionStorage.getItem('lastAppointment');
  const data = location.state || (stored ? JSON.parse(stored) : null);

  if (!data || (data.id !== appointmentId && data.appointment?.id !== appointmentId)) {
    return (
      <>
        <h2 className="page-title">Détails du rendez-vous</h2>
        <div className="alert alert-info">
          Rendez-vous #{appointmentId} — utilisez le lien reçu par email pour
          accéder à vos informations.
        </div>
        <Link to="/" className="btn btn-primary">
          Retour à l&apos;accueil
        </Link>
      </>
    );
  }

  const rdv = data.appointment || data;
  const { doctor, slot, date, email_contact } = data;

  return (
    <>
      <h2 className="page-title">Détails du rendez-vous</h2>

      <dl className="summary-box">
        <dt>Numéro</dt>
        <dd>{rdv.id}</dd>
        <dt>Patient</dt>
        <dd>{rdv.prenom_patient} {rdv.nom_patient}</dd>
          <div className="info-card contact-card">
            <div className="info-icon">
              <Mail size={22} />
            </div>

            <div className="info-content">
              <span className="info-label">ADRESSE E-MAIL</span>
                <p className="email-text">
                  {rdv.email_contact}
                </p>
            </div>
          </div>
        <dt>Téléphone</dt>
        <dd>{rdv.telephone}</dd>
        {rdv.motif && (
          <>
            <dt>Motif</dt>
            <dd>{rdv.motif}</dd>
          </>
        )}
        <dt>Médecin</dt>
        <dd>
          {doctor
            ? `Dr ${doctor.prenom} ${doctor.nom}`
            : rdv.ophtalmologue_id}
        </dd>
        <dt>Date</dt>
        <dd>{date || slot?.date}</dd>
        <dt>Heure</dt>
        <dd>
          {slot?.heure_debut?.slice(0, 5)} — {slot?.heure_fin?.slice(0, 5)}
        </dd>
        <dt>Statut</dt>
        <dd>{rdv.statut}</dd>
      </dl>

      <div className="form-actions">
        {rdv.token_modification && (
          <Link
            to={`/rendez-vous/modifier?token=${rdv.token_modification}`}
            className="btn btn-secondary"
          >
            Modifier
          </Link>
        )}
        {rdv.cancel_token && (
          <Link
            to={`/rendez-vous/annuler?token=${rdv.cancel_token}`}
            className="btn btn-danger"
          >
            Annuler
          </Link>
        )}
        <Link to="/" className="btn btn-primary">
          Accueil
        </Link>
      </div>
    </>
  );
}
