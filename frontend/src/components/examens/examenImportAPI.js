const API_BASE = "http://localhost:8000";

const getHeaders = () => ({
  "Content-Type": "application/json",
  "Authorization": `Bearer ${localStorage.getItem("token") || ""}`,
});

const getAuthHeader = () => ({
  "Authorization": `Bearer ${localStorage.getItem("token") || ""}`,
});

/**
 * Import un examen depuis un appareil
 * @param {string} cabinetId - ID du cabinet
 * @param {object} data - Données de l'examen
 */
export const importExamen = async (cabinetId, data) => {
  const response = await fetch(
    `${API_BASE}/examens/import?cabinet_id=${cabinetId}`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Erreur lors de l'import");
  }

  return response.json();
};

/**
 * Simule un examen (pour tests)
 * @param {string} patientId - ID du patient
 * @param {string} cabinetId - ID du cabinet
 * @param {string} typeExamen - Type d'examen (OCT, Fond d'œil, etc.)
 */
export const simulateExamen = async (patientId, cabinetId, typeExamen) => {
  const response = await fetch(
    `${API_BASE}/examens/simulate?patient_id=${patientId}&cabinet_id=${cabinetId}&type_examen=${typeExamen}`,
    {
      method: "POST",
      headers: getAuthHeader(),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Erreur lors de la simulation");
  }

  return response.json();
};

/**
 * Exporte les examens en CSV
 * @param {string} cabinetId - ID du cabinet
 * @returns {Blob} Fichier CSV
 */
export const exportExamensCSV = async (cabinetId) => {
  const response = await fetch(
    `${API_BASE}/examens/export/csv?cabinet_id=${cabinetId}`,
    {
      headers: getAuthHeader(),
    }
  );

  if (!response.ok) {
    throw new Error("Erreur lors de l'export");
  }

  return response.blob();
};

/**
 * Télécharge les examens exportés en CSV
 * @param {string} cabinetId - ID du cabinet
 */
export const downloadExamensCSV = async (cabinetId) => {
  try {
    const blob = await exportExamensCSV(cabinetId);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `examens_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (err) {
    console.error("Erreur lors du téléchargement:", err);
    throw err;
  }
};
