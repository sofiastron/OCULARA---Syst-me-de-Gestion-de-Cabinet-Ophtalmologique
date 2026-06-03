const BASE_URL = "http://localhost:8000";

const getHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export const examensAPI = {

  // ================= LISTE =================
  getAll: async (cabinet_id) => {
    const res = await fetch(
      `${BASE_URL}/examens/?cabinet_id=${cabinet_id}`,
      {
        headers: getHeaders(),
      }
    );

    if (!res.ok) {
      throw new Error("Erreur récupération examens");
    }

    return res.json();
  },

  // ================= UN EXAMEN =================
  getOne: async (id) => {
    const res = await fetch(
      `${BASE_URL}/examens/${id}`,
      {
        headers: getHeaders(),
      }
    );

    if (!res.ok) {
      throw new Error("Erreur récupération examen");
    }

    return res.json();
  },

  // ================= CREATION =================
  create: async (data) => {
    const { cabinet_id, ...payload } = data;

    const res = await fetch(
      `${BASE_URL}/examens/?cabinet_id=${cabinet_id}`,
      {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      throw new Error("Erreur création examen");
    }

    return res.json();
  },

  // ================= MODIFICATION =================
  update: async (id, cabinet_id, data) => {
    const res = await fetch(
      `${BASE_URL}/examens/${id}?cabinet_id=${cabinet_id}`,
      {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(data),
      }
    );

    if (!res.ok) {
      throw new Error("Erreur modification examen");
    }

    return res.json();
  },

  // ================= SUPPRESSION =================
  delete: async (id, cabinet_id) => {
    const res = await fetch(
      `${BASE_URL}/examens/${id}?cabinet_id=${cabinet_id}`,
      {
        method: "DELETE",
        headers: getHeaders(),
      }
    );

    if (!res.ok) {
      throw new Error("Erreur suppression examen");
    }

    return res.json();
  },

  // ================= ASSOCIER =================
  associer: async (id, cabinet_id) => {
    const res = await fetch(
      `${BASE_URL}/examens/${id}/associer?cabinet_id=${cabinet_id}`,
      {
        method: "POST",
        headers: getHeaders(),
      }
    );

    if (!res.ok) {
      throw new Error("Erreur association examen");
    }

    return res.json();
  },

  // ================= IMPORT APPAREIL =================
  importer: async (cabinet_id, data) => {
    const res = await fetch(
      `${BASE_URL}/examens/import?cabinet_id=${cabinet_id}`,
      {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(data),
      }
    );

    if (!res.ok) {
      throw new Error("Erreur import examen");
    }

    return res.json();
  },

  // ================= SIMULATION APPAREIL =================
  simulate: async (
    patient_id,
    cabinet_id,
    type_examen
  ) => {
    const res = await fetch(
      `${BASE_URL}/examens/simulate?patient_id=${patient_id}&cabinet_id=${cabinet_id}&type_examen=${type_examen}`,
      {
        method: "POST",
        headers: getHeaders(),
      }
    );

    if (!res.ok) {
      throw new Error("Erreur simulation appareil");
    }

    return res.json();
  },

  // ================= STATISTIQUES =================
  getStats: async (cabinet_id) => {
    const res = await fetch(
      `${BASE_URL}/examens/stats/overview?cabinet_id=${cabinet_id}`,
      {
        headers: getHeaders(),
      }
    );

    if (!res.ok) {
      throw new Error("Erreur récupération statistiques");
    }

    return res.json();
  },

};