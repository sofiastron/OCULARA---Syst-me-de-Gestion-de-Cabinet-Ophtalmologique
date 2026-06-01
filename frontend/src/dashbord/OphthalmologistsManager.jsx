import React, { useEffect, useState } from "react";
import { adminAPI, cabinetsAPI } from "../../api";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";

const EMPTY_FORM = {
  nom: "",
  prenom: "",
  email: "",
  password: "",
  cabinet_id: "",
  role: "ophtalmologue",
};

export default function OphthalmologistsManager() {
  const [ophtalmologues, setOphtalmologues] = useState([]);
  const [cabinets, setCabinets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [users, cabs] = await Promise.all([
        adminAPI.getAll(),
        cabinetsAPI.getAll(),
      ]);
      setOphtalmologues(
        (Array.isArray(users) ? users : []).filter((u) => u.role === "ophtalmologue")
      );
      setCabinets(Array.isArray(cabs) ? cabs : []);
    } catch {
      setError("Erreur lors du chargement des données.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const getCabinetName = (id) => {
    if (!id) return "—";
    const found = cabinets.find((c) => String(c.id) === String(id));
    return found ? found.nom : "—";
  };

  const openAdd = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setShowModal(true);
  };

  const openEdit = (user) => {
    setEditTarget(user);
    setForm({
      nom: user.nom || "",
      prenom: user.prenom || "",
      email: user.email || "",
      password: "", 
      cabinet_id: user.cabinet_id || "",
      role: "ophtalmologue",
    });
    setFormError("");
    setShowModal(true);
  };

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.nom.trim() || !form.prenom.trim() || !form.email.trim()) {
      setFormError("Nom, prénom et email sont requis.");
      return;
    }
    if (!editTarget && !form.password.trim()) {
      setFormError("Le mot de passe est requis à la création.");
      return;
    }
    if (!editTarget && !form.cabinet_id) {
      setFormError("Veuillez sélectionner un cabinet.");
      return;
    }

    setSubmitting(true);
    setFormError("");

    try {
      const payload = {
        nom: form.nom.trim(),
        prenom: form.prenom.trim(),
        email: form.email.trim(),
        role: "ophtalmologue",
      };

      if (form.password.trim()) {
        payload.password = form.password.trim();
      }

      if (form.cabinet_id) {
        payload.cabinet_id = form.cabinet_id;
      }

      let result;
      if (editTarget) {
        result = await adminAPI.update(editTarget.id, payload);
      } else {
        result = await adminAPI.create(payload);
      }

      if (result?.detail) {
        const msg = Array.isArray(result.detail)
          ? result.detail.map((e) => `${e.loc?.slice(-1)[0]}: ${e.msg}`).join(" | ")
          : result.detail;
        setFormError(msg);
        return;
      }

      setShowModal(false);
      fetchData();
    } catch (err) {
      console.error("handleSubmit error:", err);
      setFormError("Erreur lors de l'enregistrement.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await adminAPI.delete(deleteTarget.id);
    } catch {
      setError("Erreur lors de la suppression.");
    } finally {
      setDeleteTarget(null);
      fetchData();
    }
  };
  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#2d2925] tracking-tight">Ophtalmologues</h1>
          <p className="text-sm font-medium text-[#5c728a] mt-1">
            {ophtalmologues.length} ophtalmologue{ophtalmologues.length !== 1 ? "s" : ""}
          </p>
        </div>
        
        {/* NOUVEAU BOUTON ANTHRACITE */}
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#403c37] hover:bg-[#2d2925] text-white text-sm font-medium rounded-xl transition-all duration-300 shadow-[0_8px_15px_-5px_rgba(64,60,55,0.4)] transform hover:-translate-y-0.5"
        >
          <span className="text-lg leading-none font-light">+</span> Ajouter
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-700 text-sm rounded-xl shadow-sm">
          {error}
        </div>
      )}

      {/* TABLEAU ET ETATS */}
      {loading ? (
        <div className="text-center py-20 text-[#5c728a] font-medium animate-pulse">Chargement des données...</div>
      ) : ophtalmologues.length === 0 ? (
        <div className="text-center py-24 bg-white/40 backdrop-blur-sm border border-white/60 rounded-[2rem] shadow-sm">
          <svg className="w-16 h-16 text-[#c1bdaf] mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <p className="text-[#5c728a] font-medium">Aucun ophtalmologue enregistré.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-[1.5rem] bg-white/60 backdrop-blur-md border border-white/60 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)]">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#c1bdaf]/30">
              <thead className="bg-white/40">
                <tr>
                  {["Nom", "Prénom", "Email", "Cabinet", "Actions"].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-4 text-left text-xs font-bold text-[#5c728a] uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c1bdaf]/20">
                {ophtalmologues.map((u) => (
                  <tr key={u.id} className="hover:bg-white/50 transition-colors duration-200">
                    <td className="px-6 py-4 font-semibold text-[#2d2925]">{u.nom}</td>
                    <td className="px-6 py-4 font-semibold text-[#2d2925]">{u.prenom}</td>
                    <td className="px-6 py-4 text-sm text-[#5c728a]">{u.email}</td>
                    <td className="px-6 py-4 text-sm text-[#5c728a]">
                      {getCabinetName(u.cabinet_id)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {/* Bouton Modifier  */}
                        <button
                          onClick={() => openEdit(u)}
                          className="text-xs font-medium px-3 py-1.5 bg-[#fefce8]/60 text-[#854d0e] border border-[#fef08a]/50 rounded-lg hover:bg-[#fef08a]/80 transition-all"
                        >
                          Modifier
                        </button>
                        {/* Bouton Supprimer */}
                        <button
                          onClick={() => setDeleteTarget(u)}
                          className="text-xs font-medium px-3 py-1.5 bg-[#fef2f2]/60 text-[#991b1b] border border-[#fecaca]/50 rounded-lg hover:bg-[#fecaca]/80 transition-all"
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= MODAL AJOUTER / MODIFIER ================= */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editTarget ? "Modifier l'ophtalmologue" : "Ajouter un ophtalmologue"}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {formError && (
            <div className="text-sm text-red-700 bg-red-50/80 border border-red-200 p-3 rounded-xl backdrop-blur-sm">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1 relative group">
              <label className="block text-sm font-semibold text-[#5c728a] pl-1">
                Nom <span className="text-red-500">*</span>
              </label>
              <input
                name="nom"
                value={form.nom}
                onChange={handleChange}
                className="w-full bg-white/50 backdrop-blur-md border border-[#c1bdaf]/60 rounded-xl px-4 py-2.5 text-[#2d2925] focus:outline-none focus:ring-2 focus:ring-[#8a857a] focus:bg-white/80 transition-all duration-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
              />
            </div>
            <div className="space-y-1 relative group">
              <label className="block text-sm font-semibold text-[#5c728a] pl-1">
                Prénom <span className="text-red-500">*</span>
              </label>
              <input
                name="prenom"
                value={form.prenom}
                onChange={handleChange}
                className="w-full bg-white/50 backdrop-blur-md border border-[#c1bdaf]/60 rounded-xl px-4 py-2.5 text-[#2d2925] focus:outline-none focus:ring-2 focus:ring-[#8a857a] focus:bg-white/80 transition-all duration-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
              />
            </div>
          </div>

          <div className="space-y-1 relative group">
            <label className="block text-sm font-semibold text-[#5c728a] pl-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="w-full bg-white/50 backdrop-blur-md border border-[#c1bdaf]/60 rounded-xl px-4 py-2.5 text-[#2d2925] focus:outline-none focus:ring-2 focus:ring-[#8a857a] focus:bg-white/80 transition-all duration-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
            />
          </div>

          <div className="space-y-1 relative group">
            <label className="block text-sm font-semibold text-[#5c728a] pl-1">
              Mot de passe{" "}
              {!editTarget
                ? <span className="text-red-500">*</span>
                : <span className="text-[#a8a59e] font-normal text-xs ml-1">(laisser vide = inchangé)</span>
              }
            </label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              className="w-full bg-white/50 backdrop-blur-md border border-[#c1bdaf]/60 rounded-xl px-4 py-2.5 text-[#2d2925] focus:outline-none focus:ring-2 focus:ring-[#8a857a] focus:bg-white/80 transition-all duration-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
            />
          </div>

          <div className="space-y-1 relative group">
            <label className="block text-sm font-semibold text-[#5c728a] pl-1">
              Cabinet{" "}
              {!editTarget && <span className="text-red-500">*</span>}
            </label>
            <select
              name="cabinet_id"
              value={form.cabinet_id}
              onChange={handleChange}
              className="w-full bg-white/50 backdrop-blur-md border border-[#c1bdaf]/60 rounded-xl px-4 py-2.5 text-[#2d2925] focus:outline-none focus:ring-2 focus:ring-[#8a857a] focus:bg-white/80 transition-all duration-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] appearance-none"
            >
              <option value="" className="text-[#a8a59e]">-- Sélectionner un cabinet --</option>
              {cabinets.map((c) => (
                <option key={c.id} value={c.id} className="text-[#2d2925]">
                  {c.nom}
                </option>
              ))}
            </select>
          </div>

          {/* Boutons d'action Modal */}
          <div className="flex justify-end gap-3 pt-4 border-t border-[#c1bdaf]/30 mt-6">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-5 py-2.5 text-sm font-medium text-[#5c728a] bg-white/50 border border-[#c1bdaf]/60 rounded-xl hover:bg-white/80 hover:text-[#2d2925] transition-all duration-300"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 text-sm font-medium bg-[#403c37] hover:bg-[#2d2925] text-white rounded-xl disabled:opacity-50 transition-all duration-300 shadow-[0_8px_15px_-5px_rgba(64,60,55,0.4)] transform hover:-translate-y-0.5"
            >
              {submitting ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirmation suppression (logique intacte) */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        message={`Supprimer ${deleteTarget?.prenom} ${deleteTarget?.nom} ?`}
      />
    </div>
  );
}