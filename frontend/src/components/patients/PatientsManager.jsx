import React, { useEffect, useState, useCallback } from "react";
import { Search, Plus, UserCheck, Pencil, Trash2, Eye, RefreshCw } from "lucide-react";
import { patientsAPI } from "../../../api";
import Modal from "../Modal";
import PatientForm from "./PatientForm";
import PatientDetail from "./PatientDetail";

const sexeLabel = { M: "M", F: "F" };

const getCurrentCabinetId = () => {
  try {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored)?.cabinet_id : undefined;
  } catch {
    return undefined;
  }
};

export default function PatientsManager() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editPatient, setEditPatient] = useState(null);
  const [viewPatient, setViewPatient] = useState(null);

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await patientsAPI.getMy(search);
      setPatients(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Impossible de charger les patients");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(fetchPatients, 300);
    return () => clearTimeout(timer);
  }, [fetchPatients]);

  const handleCreate = async (form) => {
    const cabinet_id = getCurrentCabinetId();
    const payload = {
      ...form,
      cabinet_id,
    };
    await patientsAPI.create(payload);
    setShowForm(false);
    fetchPatients();
  };

  const handleUpdate = async (form) => {
    await patientsAPI.update(editPatient.id, form);
    setEditPatient(null);
    setViewPatient(null);
    fetchPatients();
  };

  const handleDelete = async (patient) => {
    if (!window.confirm(`Supprimer le patient ${patient.prenom} ${patient.nom} ?`)) return;
    try {
      await patientsAPI.delete(patient.id);
      fetchPatients();
    } catch (err) {
      alert("Impossible de supprimer ce patient");
    }
  };

  const openView = async (patient) => {
    try {
      const detail = await patientsAPI.getById(patient.id);
      setViewPatient(detail);
    } catch {
      setViewPatient(patient);
    }
  };

  const openEdit = async (patient) => {
    try {
      const detail = await patientsAPI.getById(patient.id);
      setEditPatient(detail);
    } catch {
      setEditPatient(patient);
    }
    setViewPatient(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UserCheck size={20} className="text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-800">Dossiers patients</h2>
          <span className="ml-2 bg-blue-50 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full">
            {patients.length}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchPatients}
            className="p-2 border border-gray-200 text-gray-500 hover:bg-gray-50 rounded-lg transition"
            title="Rafraîchir"
          >
            <RefreshCw size={15} />
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition"
          >
            <Plus size={15} />
            Nouveau patient
          </button>
        </div>
      </div>

      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher par nom, prénom, téléphone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-10 text-gray-400 text-sm">Chargement...</div>
      ) : patients.length === 0 ? (
        <div className="text-center py-10 text-gray-400 text-sm">
          {search ? "Aucun patient trouvé pour cette recherche" : "Aucun patient enregistré"}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 font-medium text-gray-600 text-xs">Patient</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 text-xs">Téléphone</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 text-xs">Sexe</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 text-xs">Enregistré le</th>
                <th className="px-4 py-3 text-gray-600 text-xs text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p) => (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-blue-50/30 transition">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-xs shrink-0">
                        {(p.prenom?.[0] || "?").toUpperCase()}
                        {(p.nom?.[0] || "?").toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{p.prenom} {p.nom}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{p.telephone || "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{sexeLabel[p.sexe] || "—"}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {p.created_at
                      ? new Intl.DateTimeFormat("fr-FR").format(new Date(p.created_at))
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openView(p)}
                        className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-md transition"
                        title="Voir"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => openEdit(p)}
                        className="p-1.5 text-emerald-500 hover:bg-emerald-50 rounded-md transition"
                        title="Modifier"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(p)}
                        className="p-1.5 text-red-400 hover:bg-red-50 rounded-md transition"
                        title="Supprimer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)}>
        <PatientForm onSave={handleCreate} onClose={() => setShowForm(false)} />
      </Modal>

      <Modal isOpen={!!editPatient} onClose={() => setEditPatient(null)}>
        <PatientForm
          patient={editPatient}
          onSave={handleUpdate}
          onClose={() => setEditPatient(null)}
        />
      </Modal>

      <Modal isOpen={!!viewPatient} onClose={() => setViewPatient(null)}>
        <PatientDetail
          patient={viewPatient}
          onClose={() => setViewPatient(null)}
          onEdit={() => openEdit(viewPatient)}
        />
      </Modal>
    </div>
  );
}
