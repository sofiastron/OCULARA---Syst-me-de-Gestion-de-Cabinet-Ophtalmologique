import React, { useState } from "react";
import { examensAPI } from "./examenAPI";

export default function EditExamenForm({
  examen,
  cabinet_id,
  onClose,
  onSuccess,
}) {
  const [form, setForm] = useState({
    description: examen.description || "",
    resultats: examen.resultats || "",
    statut: examen.statut || "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      await examensAPI.update(
        examen.id,
        cabinet_id,
        form
      );

      onSuccess();

    } catch (err) {
      console.error(err);
      setError("Erreur lors de la modification");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-2xl w-[550px] p-6 shadow-xl">

        <h2 className="text-xl font-bold text-[#2d2925] mb-5">
          Modifier l'examen
        </h2>

        {error && (
          <div className="mb-4 text-red-600 text-sm">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 rounded-xl border bg-white/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Résultats
            </label>

            <textarea
              name="resultats"
              value={form.resultats}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 rounded-xl border bg-white/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Statut
            </label>

            <select
              name="statut"
              value={form.statut}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-xl border bg-white/50"
            >
              <option value="en_attente">
                En attente
              </option>

              <option value="importe">
                Importé
              </option>

              <option value="verifie">
                Vérifié
              </option>

              <option value="associe">
                Associé
              </option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-3">

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[#5c728a]"
            >
              Annuler
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-[#403c37] text-white rounded-xl"
            >
              {loading
                ? "Sauvegarde..."
                : "Sauvegarder"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}