import React, { useState, useEffect } from "react";
import { X, Save, User } from "lucide-react";

const EMPTY = {
  nom: "",
  prenom: "",
  telephone: "",
  adresse: "",
  sexe: "",
  date_naissance: "",
  email: "",
  mutuelle: "",
  antecedents: "",
};

export default function PatientForm({ patient = null, onSave, onClose }) {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const isEdit = Boolean(patient);

  useEffect(() => {
    if (patient) {
      setForm({
        nom: patient.nom || "",
        prenom: patient.prenom || "",
        telephone: patient.telephone || "",
        adresse: patient.adresse || "",
        sexe: patient.sexe || "",
        date_naissance: patient.date_naissance || "",
        email: patient.email || "",
        mutuelle: patient.mutuelle || "",
        antecedents: patient.antecedents || "",
      });
    }
  }, [patient]);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nom.trim() || !form.prenom.trim()) {
      setError("Le nom et le prénom sont obligatoires.");
      return;
    }

    if (form.date_naissance) {
      const selectedDate = new Date(form.date_naissance);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate > today) {
        setError("La date de naissance ne peut pas être dans le futur.");
        return;
      }
    }

    setSaving(true);
    setError("");
    try {
      await onSave(form);
    } catch (err) {
      setError(err.message || "Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white";
  const labelCls = "block text-xs font-medium text-gray-600 mb-1";

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
        <div className="p-2 bg-blue-50 rounded-lg">
          <User size={18} className="text-blue-600" />
        </div>
        <h2 className="text-base font-semibold text-gray-800">
          {isEdit ? "Modifier le patient" : "Nouveau patient"}
        </h2>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Nom *</label>
            <input
              name="nom"
              value={form.nom}
              onChange={handleChange}
              className={inputCls}
              placeholder="Nom"
              required
            />
          </div>
          <div>
            <label className={labelCls}>Prénom *</label>
            <input
              name="prenom"
              value={form.prenom}
              onChange={handleChange}
              className={inputCls}
              placeholder="Prénom"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Date de naissance</label>
            <input
              type="date"
              name="date_naissance"
              value={form.date_naissance}
              onChange={handleChange}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Sexe</label>
            <select
              name="sexe"
              value={form.sexe}
              onChange={handleChange}
              className={inputCls}
            >
              <option value="">—</option>
              <option value="M">Masculin</option>
              <option value="F">Féminin</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Téléphone</label>
            <input
              name="telephone"
              value={form.telephone}
              onChange={handleChange}
              className={inputCls}
              placeholder="06 00 00 00 00"
            />
          </div>
          <div>
            <label className={labelCls}>Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className={inputCls}
              placeholder="patient@mail.com"
            />
          </div>
        </div>

        <div>
          <label className={labelCls}>Adresse</label>
          <input
            name="adresse"
            value={form.adresse}
            onChange={handleChange}
            className={inputCls}
            placeholder="Adresse complète"
          />
        </div>

        <div>
          <label className={labelCls}>Mutuelle</label>
          <input
            name="mutuelle"
            value={form.mutuelle}
            onChange={handleChange}
            className={inputCls}
            placeholder="Nom de la mutuelle"
          />
        </div>

        <div>
          <label className={labelCls}>Antécédents médicaux</label>
          <textarea
            name="antecedents"
            value={form.antecedents}
            onChange={handleChange}
            className={`${inputCls} resize-none`}
            rows={3}
            placeholder="Antécédents, allergies, traitements en cours..."
          />
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
          >
            <Save size={15} />
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 border border-gray-200 text-gray-600 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm transition"
          >
            <X size={15} />
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}
