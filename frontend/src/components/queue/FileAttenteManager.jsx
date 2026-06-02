import React, { useEffect, useState, useCallback } from "react";
import {
  Users,
  Plus,
  RefreshCw,
  ArrowRight,
  CheckCircle,
  Clock,
  Stethoscope,
  Eye,
  X,
} from "lucide-react";
import { queueAPI, patientsAPI } from "../../../api";

const STATUTS = ["EN_ATTENTE", "AVEC_ORTHOPTISTE", "AVEC_OPHTALMOLOGUE", "TERMINE"];

const STATUT_CONFIG = {
  EN_ATTENTE: {
    label: "En attente",
    cls: "bg-yellow-50 text-yellow-700 border border-yellow-200",
    icon: Clock,
  },
  AVEC_ORTHOPTISTE: {
    label: "Avec orthoptiste",
    cls: "bg-blue-50 text-blue-700 border border-blue-200",
    icon: Eye,
  },
  AVEC_OPHTALMOLOGUE: {
    label: "Avec ophtalmologue",
    cls: "bg-purple-50 text-purple-700 border border-purple-200",
    icon: Stethoscope,
  },
  TERMINE: {
    label: "Terminé",
    cls: "bg-green-50 text-green-700 border border-green-200",
    icon: CheckCircle,
  },
};

const NEXT_STATUT = {
  EN_ATTENTE: "AVEC_ORTHOPTISTE",
  AVEC_ORTHOPTISTE: "AVEC_OPHTALMOLOGUE",
  AVEC_OPHTALMOLOGUE: "TERMINE",
};

const formatTime = (dt) => {
  if (!dt) return "—";
  return new Date(dt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
};

const getCurrentCabinetId = () => {
  try {
    const stored = localStorage.getItem("user");
    const user = stored ? JSON.parse(stored) : null;
    console.log("FileAttenteManager current user:", user);
    if (!user) return undefined;

    return (
      user.cabinet_id ||
      user.cabinet?.id ||
      user.cabinet?.cabinet_id ||
      user.auth?.cabinet_id ||
      user.auth?.user?.cabinet_id ||
      user.auth?.user?.cabinet?.id ||
      undefined
    );
  } catch (err) {
    console.error("Erreur getCurrentCabinetId:", err);
    return undefined;
  }
};

export default function FileAttenteManager() {
  const [queue, setQueue] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [showTermine, setShowTermine] = useState(false);
  const [error, setError] = useState("");

  const fetchQueue = useCallback(async () => {
    try {
      const data = await queueAPI.get(showTermine);
      setQueue(Array.isArray(data) ? data : []);
    } catch {
      setError("Impossible de charger la file d'attente");
    }
  }, [showTermine]);

  const fetchPatients = async () => {
    try {
      const data = await patientsAPI.getMy();
      setPatients(Array.isArray(data) ? data : []);
    } catch {}
  };

  useEffect(() => {
    fetchQueue();
    fetchPatients();
    const interval = setInterval(fetchQueue, 30000);
    return () => clearInterval(interval);
  }, [fetchQueue]);

  const handleAdd = async () => {
    if (!selectedPatientId) return;
    const cabinet_id = getCurrentCabinetId();
    if (!cabinet_id) {
      setError("Impossible de déterminer le cabinet actif. Vérifiez les données de l'utilisateur connecté.");
      return;
    }

    const payload = { patient_id: selectedPatientId, cabinet_id };
    console.log("FileAttenteManager queue add payload:", payload);

    setError("");
    try {
      await queueAPI.add(payload);
      setSelectedPatientId("");
      fetchQueue();
    } catch (err) {
      setError(err.message || "Erreur lors de l'ajout");
    }
  };

  const handleNext = async (entry) => {
    const next = NEXT_STATUT[entry.statut];
    if (!next) return;
    try {
      await queueAPI.update(entry.id, { statut: next });
      fetchQueue();
    } catch {}
  };

  const handleRemove = async (entry) => {
    if (!window.confirm("Retirer ce patient de la file ?")) return;
    try {
      await queueAPI.remove(entry.id);
      fetchQueue();
    } catch {}
  };

  const active = queue.filter((e) => e.statut !== "TERMINE");
  const termine = queue.filter((e) => e.statut === "TERMINE");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users size={20} className="text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-800">File d'attente</h2>
          <span className="ml-2 bg-blue-50 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full">
            {active.length} actif{active.length > 1 ? "s" : ""}
          </span>
        </div>
        <button
          onClick={fetchQueue}
          className="p-2 border border-gray-200 text-gray-500 hover:bg-gray-50 rounded-lg transition"
          title="Rafraîchir"
        >
          <RefreshCw size={15} />
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <p className="text-xs font-medium text-gray-500 mb-2">Enregistrer l'arrivée d'un patient</p>
        <div className="flex gap-2">
          <select
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">— Sélectionner un patient —</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.prenom} {p.nom}
                {p.telephone ? ` — ${p.telephone}` : ""}
              </option>
            ))}
          </select>
          <button
            onClick={handleAdd}
            disabled={!selectedPatientId}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-40"
          >
            <Plus size={15} />
            Ajouter
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {["EN_ATTENTE", "AVEC_ORTHOPTISTE", "AVEC_OPHTALMOLOGUE"].map((s) => {
          const cfg = STATUT_CONFIG[s];
          const Icon = cfg.icon;
          const count = queue.filter((e) => e.statut === s).length;
          return (
            <div key={s} className={`rounded-lg p-3 ${cfg.cls} flex items-center gap-2`}>
              <Icon size={16} />
              <div>
                <p className="text-xs font-medium">{cfg.label}</p>
                <p className="text-lg font-bold">{count}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="space-y-2">
        {active.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-sm bg-white rounded-xl border border-gray-100">
            File d'attente vide
          </div>
        ) : (
          active.map((entry) => {
            const cfg = STATUT_CONFIG[entry.statut] || STATUT_CONFIG.EN_ATTENTE;
            const Icon = cfg.icon;
            const nextStatut = NEXT_STATUT[entry.statut];
            const nextCfg = nextStatut ? STATUT_CONFIG[nextStatut] : null;

            return (
              <div
                key={entry.id}
                className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-sm shrink-0">
                    {entry.ordre || "—"}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">
                      {entry.patient_prenom} {entry.patient_nom}
                    </p>
                    <p className="text-xs text-gray-400">
                      Arrivée : {formatTime(entry.heure_arrivee)}
                      {entry.heure_appel && ` · Appelé : ${formatTime(entry.heure_appel)}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.cls}`}>
                    <Icon size={11} />
                    {cfg.label}
                  </span>

                  {nextCfg && (
                    <button
                      onClick={() => handleNext(entry)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition border ${nextCfg.cls} hover:opacity-80`}
                      title={`Passer à : ${nextCfg.label}`}
                    >
                      <ArrowRight size={12} />
                      {nextCfg.label}
                    </button>
                  )}

                  <button
                    onClick={() => handleRemove(entry)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition"
                    title="Retirer de la file"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <button
        onClick={() => setShowTermine(!showTermine)}
        className="text-sm text-gray-400 hover:text-gray-600 underline"
      >
        {showTermine
          ? `Masquer les patients terminés (${termine.length})`
          : `Voir les patients terminés (${termine.length})`}
      </button>

      {showTermine && termine.length > 0 && (
        <div className="space-y-2 opacity-60">
          {termine.map((entry) => (
            <div
              key={entry.id}
              className="bg-gray-50 rounded-xl border border-gray-100 px-4 py-3 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <CheckCircle size={16} className="text-green-500 shrink-0" />
                <div>
                  <p className="font-medium text-gray-600 text-sm">
                    {entry.patient_prenom} {entry.patient_nom}
                  </p>
                  <p className="text-xs text-gray-400">Arrivée : {formatTime(entry.heure_arrivee)}</p>
                </div>
              </div>
              <span className="text-xs text-green-600 font-medium">Terminé</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
