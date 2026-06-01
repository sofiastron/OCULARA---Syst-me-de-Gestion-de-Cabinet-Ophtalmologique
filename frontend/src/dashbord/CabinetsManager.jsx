import React, { useEffect, useState } from "react";
import { cabinetsAPI } from "../../api";
import Modal from "../components/Modal";

const EMPTY_FORM = {
  nom: "",
  adresse: "",
  telephone: "",
};

export default function CabinetsManager() {
  // ==========================================
  // LOGIQUE INTACTE (AUCUNE MODIFICATION)
  // ==========================================
  const [cabinets, setCabinets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchCabinets = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await cabinetsAPI.getAll();
      setCabinets(Array.isArray(data) ? data : []);
    } catch {
      setError("Erreur lors du chargement des cabinets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCabinets(); }, []);

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setFormError("");
    setShowModal(true);
  };

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nom.trim()) {
      setFormError("Le nom du cabinet est requis.");
      return;
    }
    setSubmitting(true);
    setFormError("");
    try {
      const result = await cabinetsAPI.create(form);
      if (result?.detail) {
        setFormError(
          Array.isArray(result.detail)
            ? result.detail.map((e) => `${e.loc?.slice(-1)[0]}: ${e.msg}`).join(" | ")
            : result.detail
        );
        return;
      }
      setShowModal(false);
      fetchCabinets();
    } catch {
      setFormError("Erreur lors de l'ajout du cabinet.");
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================
  // DESIGN PREMIUM : OCULARA THEME
  // ==========================================
  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#2d2925] tracking-tight">Cabinets Médicaux</h1>
          <p className="text-sm font-medium text-[#5c728a] mt-1">
            {cabinets.length} cabinet{cabinets.length !== 1 ? "s" : ""} enregistré{cabinets.length !== 1 ? "s" : ""}
          </p>
        </div>
        
        {/* NOUVEAU BOUTON PREMIUM ANTHRACITE */}
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#403c37] hover:bg-[#2d2925] text-white text-sm font-medium rounded-xl transition-all duration-300 shadow-[0_8px_15px_-5px_rgba(64,60,55,0.4)] transform hover:-translate-y-0.5"
        >
          <span className="text-lg leading-none font-light">+</span> Ajouter un cabinet
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-700 text-sm rounded-xl shadow-sm">
          {error}
        </div>
      )}

      {/* TABLEAU ET ETATS (Chargement / Vide) */}
      {loading ? (
        <div className="text-center py-20 text-[#5c728a] font-medium animate-pulse">Chargement des données...</div>
      ) : cabinets.length === 0 ? (
        <div className="text-center py-24 bg-white/40 backdrop-blur-sm border border-white/60 rounded-[2rem] shadow-sm">
          <svg className="w-16 h-16 text-[#c1bdaf] mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1v1H9V7zm5 0h1v1h-1V7zm-5 4h1v1H9v-1zm5 0h1v1h-1v-1zm-3 4H9v2h1v-2zm5 0h-1v2h1v-2z" />
          </svg>
          <p className="text-[#5c728a] font-medium">Aucun cabinet enregistré.</p>
          <p className="text-[#7a7771] text-sm mt-1">Cliquez sur « Ajouter » pour commencer.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-[1.5rem] bg-white/60 backdrop-blur-md border border-white/60 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)]">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#c1bdaf]/30">
              <thead className="bg-white/40">
                <tr>
                  {["Nom", "Adresse", "Téléphone"].map((h) => (
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
                {cabinets.map((c) => (
                  <tr key={c.id} className="hover:bg-white/50 transition-colors duration-200">
                    <td className="px-6 py-4 font-semibold text-[#2d2925]">{c.nom}</td>
                    <td className="px-6 py-4 text-sm text-[#5c728a]">{c.adresse || "—"}</td>
                    <td className="px-6 py-4 text-sm text-[#5c728a] font-mono">{c.telephone || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= MODAL AJOUTER ================= */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Ajouter un cabinet">
        <form onSubmit={handleSubmit} className="space-y-5">
          {formError && (
            <div className="text-sm text-red-700 bg-red-50/80 border border-red-200 p-3 rounded-xl backdrop-blur-sm">
              {formError}
            </div>
          )}

          <div className="space-y-1 relative group">
            <label className="block text-sm font-semibold text-[#5c728a] pl-1">
              Nom <span className="text-red-500">*</span>
            </label>
            {/* Input Glassmorphism */}
            <input
              name="nom"
              value={form.nom}
              onChange={handleChange}
              placeholder="Ex: Oculara Clinic"
              className="w-full bg-white/50 backdrop-blur-md border border-[#c1bdaf]/60 rounded-xl px-4 py-3 text-[#2d2925] placeholder-[#a8a59e] focus:outline-none focus:ring-2 focus:ring-[#8a857a] focus:bg-white/80 transition-all duration-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
            />
          </div>

          <div className="space-y-1 relative group">
            <label className="block text-sm font-semibold text-[#5c728a] pl-1">Adresse</label>
            <input
              name="adresse"
              value={form.adresse}
              onChange={handleChange}
              placeholder="Ex: 123 Avenue Mohammed V"
              className="w-full bg-white/50 backdrop-blur-md border border-[#c1bdaf]/60 rounded-xl px-4 py-3 text-[#2d2925] placeholder-[#a8a59e] focus:outline-none focus:ring-2 focus:ring-[#8a857a] focus:bg-white/80 transition-all duration-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
            />
          </div>

          <div className="space-y-1 relative group">
            <label className="block text-sm font-semibold text-[#5c728a] pl-1">Téléphone</label>
            <input
              name="telephone"
              value={form.telephone}
              onChange={handleChange}
              placeholder="Ex: 0600000000"
              className="w-full bg-white/50 backdrop-blur-md border border-[#c1bdaf]/60 rounded-xl px-4 py-3 text-[#2d2925] placeholder-[#a8a59e] focus:outline-none focus:ring-2 focus:ring-[#8a857a] focus:bg-white/80 transition-all duration-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
            />
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
    </div>
  );
}