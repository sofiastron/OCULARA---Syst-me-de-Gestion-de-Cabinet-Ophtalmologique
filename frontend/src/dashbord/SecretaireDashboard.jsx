import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Ban,
  CalendarClock,
  CheckCircle2,
  Globe2,
  LogOut,
  Pencil,
  Plus,
  PhoneCall,
  RefreshCw,
  Search,
} from "lucide-react";
import { agendaAPI, doctorsAPI, secretaryAppointmentsAPI, usersAPI } from "../../api";
import Modal from "../components/Modal";

const EMPTY_EDIT = {
  statut: "",
  motif: "",
  notes_secretaire: "",
  nom_patient: "",
  prenom_patient: "",
  telephone: "",
  email_contact: "",
};

const EMPTY_BOOKING = {
  ophtalmologue_id: "",
  date: "",
  creneau_id: "",
  nom_patient: "",
  prenom_patient: "",
  telephone: "",
  email_contact: "",
  motif: "",
  source: "cabinet",
};

const formatDate = (value) =>
  new Intl.DateTimeFormat("fr-FR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));

const formatTime = (value) => (value ? value.slice(0, 5) : "--:--");

const sourceConfig = {
  web: {
    label: "web",
    icon: Globe2,
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  cabinet: {
    label: "cabinet",
    icon: PhoneCall,
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  telephone: {
    label: "telephone",
    icon: PhoneCall,
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
};

const statusClass = {
  EN_ATTENTE: "bg-slate-100 text-slate-700 border-slate-200",
  ACTIF: "bg-emerald-50 text-emerald-700 border-emerald-200",
  ATTEINT: "bg-teal-50 text-teal-700 border-teal-200",
  ANNULE: "bg-red-50 text-red-700 border-red-200",
};

const statusLabel = {
  EN_ATTENTE: "EN ATTENTE",
  ACTIF: "ACTIF",
  ATTEINT: "ATTEINT",
  ANNULE: "ANNULE",
};

export default function SecretaireDashboard() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [editTarget, setEditTarget] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [editForm, setEditForm] = useState(EMPTY_EDIT);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingForm, setBookingForm] = useState(EMPTY_BOOKING);
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [cancelNote, setCancelNote] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchDoctors = async () => {
    try {
      const me = await usersAPI.getMe();
      if (!me?.cabinet_id) return;
      const data = await doctorsAPI.getByCabinet(me.cabinet_id);
      setDoctors(Array.isArray(data) ? data : []);
    } catch (err) {
      setBookingError(err.message || "Impossible de charger les médecins.");
    }
  };

  const fetchAppointments = async ({ silent = false } = {}) => {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError("");

    try {
      const data = await secretaryAppointmentsAPI.getAll({
        statut: statusFilter,
        source: sourceFilter,
      });
      setAppointments(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Erreur lors du chargement des rendez-vous.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
    fetchDoctors();
  }, [sourceFilter, statusFilter]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      fetchAppointments({ silent: true });
    }, 4000);

    return () => window.clearInterval(interval);
  }, [sourceFilter, statusFilter]);

  const filteredAppointments = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return appointments;

    return appointments.filter((rdv) => {
      const haystack = [
        rdv.nom_patient,
        rdv.prenom_patient,
        rdv.telephone,
        rdv.email_contact,
        rdv.medecin_nom,
        rdv.motif,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [appointments, search]);

  const stats = useMemo(
    () => ({
      total: appointments.length,
      waiting: appointments.filter((rdv) => rdv.statut === "EN_ATTENTE").length,
      active: appointments.filter((rdv) => rdv.statut === "ACTIF").length,
      reached: appointments.filter((rdv) => rdv.statut === "ATTEINT").length,
      canceled: appointments.filter((rdv) => rdv.statut === "ANNULE").length,
      web: appointments.filter((rdv) => rdv.source === "web").length,
      cabinet: appointments.filter((rdv) => rdv.source !== "web").length,
    }),
    [appointments],
  );

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const openEdit = (rdv) => {
    setEditTarget(rdv);
    setFormError("");
    setEditForm({
      statut: rdv.statut || "",
      motif: rdv.motif || "",
      notes_secretaire: rdv.notes_secretaire || "",
      nom_patient: rdv.nom_patient || "",
      prenom_patient: rdv.prenom_patient || "",
      telephone: rdv.telephone || "",
      email_contact: rdv.email_contact || "",
    });
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const openBooking = () => {
    setBookingForm(EMPTY_BOOKING);
    setSlots([]);
    setBookingError("");
    setBookingSuccess("");
    setBookingOpen(true);
    if (doctors.length === 0) fetchDoctors();
  };

  const handleBookingChange = (event) => {
    const { name, value } = event.target;
    setBookingForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "ophtalmologue_id" || name === "date" ? { creneau_id: "" } : {}),
    }));
  };

  useEffect(() => {
    const loadSlots = async () => {
      if (!bookingOpen || !bookingForm.ophtalmologue_id || !bookingForm.date) {
        setSlots([]);
        return;
      }

      setSlotsLoading(true);
      setBookingError("");
      try {
        const data = await agendaAPI.getAvailableSlots(bookingForm.ophtalmologue_id, bookingForm.date);
        setSlots(Array.isArray(data) ? data : []);
      } catch (err) {
        setSlots([]);
        setBookingError(err.message || "Impossible de charger les créneaux.");
      } finally {
        setSlotsLoading(false);
      }
    };

    loadSlots();
  }, [bookingOpen, bookingForm.ophtalmologue_id, bookingForm.date]);

  const handleCreateBooking = async (event) => {
    event.preventDefault();
    setBookingError("");
    setBookingSuccess("");

    if (!bookingForm.creneau_id) {
      setBookingError("Sélectionnez un créneau disponible.");
      return;
    }

    setSubmitting(true);
    try {
      await agendaAPI.createAppointment({
        creneau_id: bookingForm.creneau_id,
        ophtalmologue_id: bookingForm.ophtalmologue_id,
        nom_patient: bookingForm.nom_patient.trim(),
        prenom_patient: bookingForm.prenom_patient.trim(),
        telephone: bookingForm.telephone.trim(),
        email_contact: bookingForm.email_contact.trim(),
        motif: bookingForm.motif.trim() || null,
        source: bookingForm.source,
      });

      setBookingSuccess("Rendez-vous créé avec succès.");
      setBookingForm(EMPTY_BOOKING);
      setSlots([]);
      await fetchAppointments({ silent: true });
    } catch (err) {
      setBookingError(err.message || "Création du rendez-vous impossible.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (event) => {
    event.preventDefault();
    setFormError("");
    setSubmitting(true);

    const payload = {
      statut: editForm.statut || null,
      motif: editForm.motif || null,
      notes_secretaire: editForm.notes_secretaire || null,
      nom_patient: editForm.nom_patient.trim() || null,
      prenom_patient: editForm.prenom_patient.trim() || null,
      telephone: editForm.telephone.trim() || null,
      email_contact: editForm.email_contact.trim() || null,
    };

    try {
      await secretaryAppointmentsAPI.update(editTarget.id, payload);
      setEditTarget(null);
      await fetchAppointments({ silent: true });
    } catch (err) {
      setFormError(err.message || "Modification impossible.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async () => {
    setFormError("");
    setSubmitting(true);

    try {
      await secretaryAppointmentsAPI.cancel(cancelTarget.id, cancelNote);
      setCancelTarget(null);
      setCancelNote("");
      await fetchAppointments({ silent: true });
    } catch (err) {
      setFormError(err.message || "Annulation impossible.");
    } finally {
      setSubmitting(false);
    }
  };

  const SourceBadge = ({ source }) => {
    const config = sourceConfig[source] || sourceConfig.cabinet;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold ${config.className}`}>
        <Icon className="h-3.5 w-3.5" />
        {config.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#f6f7f5] text-[#25211d]">
      <header className="border-b border-[#dde3df] bg-white">
        <div className="flex flex-col gap-4 px-5 py-5 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#2f4f4f] text-white">
              <CalendarClock className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Rendez-vous du cabinet</h1>
              <p className="text-sm text-[#66736e]">Espace secrétaire</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={openBooking}
              className="inline-flex items-center gap-2 rounded-lg bg-[#2f4f4f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#243f3f]"
            >
              <Plus className="h-4 w-4" />
              Nouveau RDV
            </button>
            <button
              onClick={() => fetchAppointments({ silent: true })}
              className="inline-flex items-center gap-2 rounded-lg border border-[#cfd8d3] bg-white px-4 py-2 text-sm font-semibold text-[#2f4f4f] hover:bg-[#eef3f0]"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              Actualiser
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-lg bg-[#8f2d2d] px-4 py-2 text-sm font-semibold text-white hover:bg-[#742424]"
            >
              <LogOut className="h-4 w-4" />
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="px-5 py-6 lg:px-8">
        <section className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
          {[
            ["Total", stats.total],
            ["En attente", stats.waiting],
            ["Actifs", stats.active],
            ["Atteints", stats.reached],
            ["Annulés", stats.canceled],
            ["Web", stats.web],
            ["Cabinet", stats.cabinet],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border border-[#dde3df] bg-white p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-[#66736e]">{label}</p>
              <p className="mt-2 text-3xl font-bold">{value}</p>
            </div>
          ))}
        </section>

        <section className="mb-5 flex flex-col gap-3 rounded-lg border border-[#dde3df] bg-white p-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7b8781]" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Rechercher patient, téléphone, email, médecin..."
              className="w-full rounded-lg border border-[#cfd8d3] bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-[#2f4f4f] focus:ring-2 focus:ring-[#dbe7e2]"
            />
          </div>

          <select
            value={sourceFilter}
            onChange={(event) => setSourceFilter(event.target.value)}
            className="rounded-lg border border-[#cfd8d3] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#2f4f4f]"
          >
            <option value="">Toutes les sources</option>
            <option value="web">Web</option>
            <option value="cabinet">Cabinet</option>
            <option value="telephone">Téléphone</option>
          </select>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-lg border border-[#cfd8d3] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#2f4f4f]"
          >
            <option value="">Tous les statuts</option>
            <option value="EN_ATTENTE">En attente</option>
            <option value="ACTIF">Actif</option>
            <option value="ATTEINT">Atteint</option>
            <option value="ANNULE">Annulé</option>
          </select>
        </section>

        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <section className="overflow-hidden rounded-lg border border-[#dde3df] bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#e3e8e5]">
              <thead className="bg-[#f1f5f3]">
                <tr>
                  {["Patient", "Médecin", "Date", "Source", "Statut", "Actions"].map((header) => (
                    <th key={header} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-[#66736e]">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#edf1ef]">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-sm font-medium text-[#66736e]">
                      Chargement des rendez-vous...
                    </td>
                  </tr>
                ) : filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-sm font-medium text-[#66736e]">
                      Aucun rendez-vous trouvé.
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.map((rdv) => (
                    <tr key={rdv.id} className="hover:bg-[#f8faf9]">
                      <td className="px-4 py-4">
                        <p className="font-semibold">
                          {rdv.prenom_patient || ""} {rdv.nom_patient || "Patient"}
                        </p>
                        <p className="text-sm text-[#66736e]">{rdv.telephone || rdv.email_contact || "Contact non renseigné"}</p>
                      </td>
                      <td className="px-4 py-4 text-sm font-medium">{rdv.medecin_nom}</td>
                      <td className="px-4 py-4">
                        <p className="text-sm font-semibold">{formatDate(rdv.date)}</p>
                        <p className="text-sm text-[#66736e]">
                          {formatTime(rdv.heure_debut)} - {formatTime(rdv.heure_fin)}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <SourceBadge source={rdv.source} />
                      </td>
                      <td className="px-4 py-4">
                        <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${statusClass[rdv.statut] || statusClass.EN_ATTENTE}`}>
                          {statusLabel[rdv.statut] || rdv.statut}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => openEdit(rdv)}
                            disabled={rdv.statut === "ANNULE"}
                            className="inline-flex items-center gap-1.5 rounded-md border border-[#cfd8d3] px-3 py-1.5 text-xs font-semibold text-[#2f4f4f] hover:bg-[#eef3f0] disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Modifier
                          </button>
                          <button
                            onClick={() => {
                              setCancelTarget(rdv);
                              setCancelNote("");
                              setFormError("");
                            }}
                            disabled={rdv.statut === "ANNULE"}
                            className="inline-flex items-center gap-1.5 rounded-md border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Ban className="h-3.5 w-3.5" />
                            Annuler
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* ── Modal Modifier ── */}
      <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} title="Modifier le rendez-vous">
        <form onSubmit={handleUpdate} className="space-y-4">
          {formError && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{formError}</div>}

          {/* Informations patient */}
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[#66736e]">Informations patient</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-semibold text-[#4f5d57]">Nom</label>
                <input
                  name="nom_patient"
                  value={editForm.nom_patient}
                  onChange={handleEditChange}
                  className="w-full rounded-lg border border-[#cfd8d3] px-3 py-2 text-sm outline-none focus:border-[#2f4f4f]"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-[#4f5d57]">Prénom</label>
                <input
                  name="prenom_patient"
                  value={editForm.prenom_patient}
                  onChange={handleEditChange}
                  className="w-full rounded-lg border border-[#cfd8d3] px-3 py-2 text-sm outline-none focus:border-[#2f4f4f]"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-[#4f5d57]">Téléphone</label>
                <input
                  name="telephone"
                  value={editForm.telephone}
                  onChange={handleEditChange}
                  className="w-full rounded-lg border border-[#cfd8d3] px-3 py-2 text-sm outline-none focus:border-[#2f4f4f]"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-[#4f5d57]">Email</label>
                <input
                  type="email"
                  name="email_contact"
                  value={editForm.email_contact}
                  onChange={handleEditChange}
                  className="w-full rounded-lg border border-[#cfd8d3] px-3 py-2 text-sm outline-none focus:border-[#2f4f4f]"
                />
              </div>
            </div>
          </div>

          {/* Informations RDV */}
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[#66736e]">Informations RDV</p>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-semibold text-[#4f5d57]">Statut</label>
                <select
                  name="statut"
                  value={editForm.statut}
                  onChange={handleEditChange}
                  className="w-full rounded-lg border border-[#cfd8d3] px-3 py-2 text-sm outline-none focus:border-[#2f4f4f]"
                >
                  <option value="EN_ATTENTE">En attente</option>
                  <option value="ACTIF">Actif</option>
                  <option value="ATTEINT">Atteint</option>
                  <option value="ANNULE">Annulé</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-[#4f5d57]">Motif</label>
                <input
                  name="motif"
                  value={editForm.motif}
                  onChange={handleEditChange}
                  className="w-full rounded-lg border border-[#cfd8d3] px-3 py-2 text-sm outline-none focus:border-[#2f4f4f]"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-[#4f5d57]">Note secrétaire</label>
                <textarea
                  name="notes_secretaire"
                  value={editForm.notes_secretaire}
                  onChange={handleEditChange}
                  rows={3}
                  className="w-full rounded-lg border border-[#cfd8d3] px-3 py-2 text-sm outline-none focus:border-[#2f4f4f]"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button type="button" onClick={() => setEditTarget(null)} className="rounded-lg border border-[#cfd8d3] px-4 py-2 text-sm font-semibold">
              Fermer
            </button>
            <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 rounded-lg bg-[#2f4f4f] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
              <CheckCircle2 className="h-4 w-4" />
              {submitting ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Modal Nouveau RDV ── */}
      <Modal isOpen={bookingOpen} onClose={() => setBookingOpen(false)} title="Nouveau rendez-vous">
        <form onSubmit={handleCreateBooking} className="space-y-4">
          {bookingError && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{bookingError}</div>}
          {bookingSuccess && <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{bookingSuccess}</div>}

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold text-[#4f5d57]">Source</label>
              <select
                name="source"
                value={bookingForm.source}
                onChange={handleBookingChange}
                className="w-full rounded-lg border border-[#cfd8d3] px-3 py-2 text-sm outline-none focus:border-[#2f4f4f]"
              >
                <option value="cabinet">Cabinet</option>
                <option value="telephone">Téléphone</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-[#4f5d57]">Médecin</label>
              <select
                name="ophtalmologue_id"
                value={bookingForm.ophtalmologue_id}
                onChange={handleBookingChange}
                required
                className="w-full rounded-lg border border-[#cfd8d3] px-3 py-2 text-sm outline-none focus:border-[#2f4f4f]"
              >
                <option value="">Choisir un médecin</option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    Dr {doctor.prenom} {doctor.nom}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-[#4f5d57]">Date</label>
            <input
              type="date"
              name="date"
              value={bookingForm.date}
              onChange={handleBookingChange}
              required
              min={new Date().toISOString().slice(0, 10)}
              className="w-full rounded-lg border border-[#cfd8d3] px-3 py-2 text-sm outline-none focus:border-[#2f4f4f]"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-[#4f5d57]">Créneau</label>
            <select
              name="creneau_id"
              value={bookingForm.creneau_id}
              onChange={handleBookingChange}
              required
              disabled={!bookingForm.ophtalmologue_id || !bookingForm.date || slotsLoading}
              className="w-full rounded-lg border border-[#cfd8d3] px-3 py-2 text-sm outline-none focus:border-[#2f4f4f] disabled:bg-slate-100"
            >
              <option value="">
                {slotsLoading ? "Chargement..." : slots.length ? "Choisir un créneau" : "Aucun créneau disponible"}
              </option>
              {slots.map((slot) => (
                <option key={slot.creneau_id} value={slot.creneau_id}>
                  {formatTime(slot.heure_debut)} - {formatTime(slot.heure_fin)}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold text-[#4f5d57]">Nom</label>
              <input
                name="nom_patient"
                value={bookingForm.nom_patient}
                onChange={handleBookingChange}
                required
                className="w-full rounded-lg border border-[#cfd8d3] px-3 py-2 text-sm outline-none focus:border-[#2f4f4f]"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-[#4f5d57]">Prénom</label>
              <input
                name="prenom_patient"
                value={bookingForm.prenom_patient}
                onChange={handleBookingChange}
                required
                className="w-full rounded-lg border border-[#cfd8d3] px-3 py-2 text-sm outline-none focus:border-[#2f4f4f]"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold text-[#4f5d57]">Téléphone</label>
              <input
                name="telephone"
                value={bookingForm.telephone}
                onChange={handleBookingChange}
                required
                className="w-full rounded-lg border border-[#cfd8d3] px-3 py-2 text-sm outline-none focus:border-[#2f4f4f]"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-[#4f5d57]">Email</label>
              <input
                type="email"
                name="email_contact"
                value={bookingForm.email_contact}
                onChange={handleBookingChange}
                required
                className="w-full rounded-lg border border-[#cfd8d3] px-3 py-2 text-sm outline-none focus:border-[#2f4f4f]"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-[#4f5d57]">Motif</label>
            <input
              name="motif"
              value={bookingForm.motif}
              onChange={handleBookingChange}
              className="w-full rounded-lg border border-[#cfd8d3] px-3 py-2 text-sm outline-none focus:border-[#2f4f4f]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button type="button" onClick={() => setBookingOpen(false)} className="rounded-lg border border-[#cfd8d3] px-4 py-2 text-sm font-semibold">
              Fermer
            </button>
            <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 rounded-lg bg-[#2f4f4f] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
              <CheckCircle2 className="h-4 w-4" />
              {submitting ? "Création..." : "Créer le RDV"}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Modal Annuler ── */}
      <Modal isOpen={!!cancelTarget} onClose={() => setCancelTarget(null)} title="Annuler le rendez-vous">
        <div className="space-y-4">
          {formError && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{formError}</div>}
          <p className="text-sm text-[#4f5d57]">
            Confirmer l'annulation du rendez-vous de{" "}
            <span className="font-semibold text-[#25211d]">
              {cancelTarget?.prenom_patient} {cancelTarget?.nom_patient}
            </span>
            .
          </p>
          <textarea
            value={cancelNote}
            onChange={(event) => setCancelNote(event.target.value)}
            rows={3}
            placeholder="Note interne optionnelle"
            className="w-full rounded-lg border border-[#cfd8d3] px-3 py-2 text-sm outline-none focus:border-[#2f4f4f]"
          />
          <div className="flex justify-end gap-2 pt-3">
            <button type="button" onClick={() => setCancelTarget(null)} className="rounded-lg border border-[#cfd8d3] px-4 py-2 text-sm font-semibold">
              Garder
            </button>
            <button onClick={handleCancel} disabled={submitting} className="rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
              {submitting ? "Annulation..." : "Annuler le RDV"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}