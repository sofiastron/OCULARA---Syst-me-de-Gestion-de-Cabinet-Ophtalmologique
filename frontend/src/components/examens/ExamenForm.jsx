import React, { useState, useEffect } from "react";
import { examensAPI } from "./examenAPI";
import { patientsAPI } from "../../../api";

export default function ExamenForm({
  cabinet_id,
  onClose,
  onSuccess,
}) {
  const [form, setForm] = useState({
    patient_id: "",
    type_examen: "Fond d'œil",
    description: "",
    resultats: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [patients, setPatients] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(true);

  // Charger les patients au montage
  useEffect(() => {
    const loadPatients = async () => {
      try {
        const data = await patientsAPI.getMy();
        setPatients(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Erreur lors du chargement des patients:", err);
        setPatients([]);
      } finally {
        setLoadingPatients(false);
      }
    };

    loadPatients();
  }, []);

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
      await examensAPI.create({
        ...form,
        cabinet_id,
      });

      onSuccess();

    } catch (err) {
      console.error(err);
      setError("Erreur lors de la création");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-2xl w-[550px] p-6 shadow-xl">

        <h2 className="text-xl font-bold text-[#2d2925] mb-5">
          Nouvel examen médical
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
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Patient *
            </label>
            <select
              required
              name="patient_id"
              value={form.patient_id}
              onChange={handleChange}
              disabled={loadingPatients}
              className="w-full px-4 py-2 rounded-xl border bg-white/50 disabled:opacity-50"
            >
              <option value="">
                {loadingPatients ? "Chargement des patients..." : "-- Sélectionner un patient --"}
              </option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.first_name} {patient.last_name} ({patient.email})
                </option>
              ))}
            </select>
          </div>

          <select
            name="type_examen"
            value={form.type_examen}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-xl border bg-white/50"
          >
            <option value="Fond d'œil">
              Fond d'œil
            </option>

            <option value="OCT">
              OCT
            </option>

            <option value="Tonométrie">
              Tonométrie
            </option>

            <option value="Champ visuel">
              Champ visuel
            </option>

            <option value="Topographie cornéenne">
              Topographie cornéenne
            </option>

            <option value="Réfraction">
              Réfraction
            </option>
          </select>

          <textarea
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-2 rounded-xl border bg-white/50"
          />

          <textarea
            name="resultats"
            placeholder="Résultats (optionnel)"
            value={form.resultats}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-2 rounded-xl border bg-white/50"
          />

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
                ? "Création..."
                : "Créer"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}