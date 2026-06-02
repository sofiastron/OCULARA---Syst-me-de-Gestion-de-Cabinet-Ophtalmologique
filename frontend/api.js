const BASE_URL = "http://localhost:8000";

const getHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
});

const formatApiError = (data) => {
  if (!data) return "Erreur API";

  if (typeof data.detail === "string") {
    return data.detail.replace(/^Value error,\s*/i, "");
  }

  if (Array.isArray(data.detail) && data.detail.length > 0) {
    const first = data.detail[0];
    if (typeof first === "string") {
      return first.replace(/^Value error,\s*/i, "");
    }
    if (first && typeof first === "object" && first.msg) {
      return String(first.msg).replace(/^Value error,\s*/i, "");
    }
    return data.detail.map((item) => {
      if (typeof item === "string") return item;
      if (item && typeof item === "object" && item.msg) return String(item.msg);
      return JSON.stringify(item);
    }).join("; ");
  }

  if (typeof data === "string") return data;
  if (data.detail) return JSON.stringify(data.detail);

  return "Erreur API";
};

const requestJson = async (url, options = {}) => {
  const response = await fetch(url, options);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(formatApiError(data));
  }

  return data;
};

// ─── Cabinets ──────────────────────────────────────────────────
export const cabinetsAPI = {
  getAll: () =>
    fetch(`${BASE_URL}/cabinets/`, { headers: getHeaders() }).then((r) => r.json()),

  getById: (id) =>
    fetch(`${BASE_URL}/cabinets/${id}`, { headers: getHeaders() }).then((r) => r.json()),

  create: (data) =>
    fetch(`${BASE_URL}/cabinets/add`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  update: (id, data) =>
    fetch(`${BASE_URL}/cabinets/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  delete: (id) =>
    fetch(`${BASE_URL}/cabinets/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    }).then((r) => r.json()),
};

// ─── Users ─────────────────────────────────────────────────────
export const usersAPI = {
  getAll: () =>
    fetch(`${BASE_URL}/users/`, { headers: getHeaders() }).then((r) => r.json()),

  getMyStaff: () =>
    fetch(`${BASE_URL}/users/my-staff`, { headers: getHeaders() }).then((r) => r.json()),

  getMe: () =>
    fetch(`${BASE_URL}/users/me`, { headers: getHeaders() }).then((r) => r.json()),

  getById: (id) =>
    fetch(`${BASE_URL}/users/${id}`, { headers: getHeaders() }).then((r) => r.json()),

  // Création par un ophtalmologue connecté (secrétaire / orthoptiste)
  create: (data) =>
    fetch(`${BASE_URL}/users/register`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  // Mise à jour via PUT /users/{id}
  update: (id, data) =>
    fetch(`${BASE_URL}/users/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  delete: (id) =>
    fetch(`${BASE_URL}/users/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    }).then((r) => r.json()),

  login: (email, password) =>
    fetch(`${BASE_URL}/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    }).then((r) => r.json()),
};

// ─── Admin API ─────────────────────────────────────────────────
export const adminAPI = {
  getAll: () =>
    fetch(`${BASE_URL}/users/admin-list`, { headers: getHeaders() }).then((r) => r.json()),

  // Création d'un ophtalmologue par l'admin
  create: (data) =>
    fetch(`${BASE_URL}/users/create-admin`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  // Mise à jour via PUT /users/{id}
  update: (id, data) =>
    fetch(`${BASE_URL}/users/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  delete: (id) =>
    fetch(`${BASE_URL}/users/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    }).then((r) => r.json()),
};

// ─── Agenda / médecins ────────────────────────────────────────
export const doctorsAPI = {
  getByCabinet: (cabinetId) =>
    requestJson(`${BASE_URL}/doctors?cabinet_id=${encodeURIComponent(cabinetId)}`, {
      headers: getHeaders(),
    }),
};

export const agendaAPI = {
  getAvailableSlots: (doctorId, date) =>
    requestJson(
      `${BASE_URL}/agenda/available-slots?doctor_id=${encodeURIComponent(doctorId)}&date=${encodeURIComponent(date)}`,
      { headers: getHeaders() },
    ),

  createAppointment: (data) =>
    requestJson(`${BASE_URL}/agenda/appointments`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }),
};

// ─── Vue secrétaire / RDV ─────────────────────────────────────
export const secretaryAppointmentsAPI = {
  getAll: ({ statut = "", source = "" } = {}) => {
    const params = new URLSearchParams();
    if (statut) params.set("statut", statut);
    if (source) params.set("source", source);
    const query = params.toString() ? `?${params.toString()}` : "";

    return requestJson(`${BASE_URL}/agenda/secretary/appointments${query}`, {
      headers: getHeaders(),
    });
  },

  update: (id, data) =>
    requestJson(`${BASE_URL}/agenda/secretary/appointments/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }),

  cancel: (id, notes_secretaire = "") =>
    requestJson(`${BASE_URL}/agenda/secretary/appointments/${id}/annuler`, {
      method: "DELETE",
      headers: getHeaders(),
      body: JSON.stringify({ notes_secretaire }),
    }),
};

// ─── Plages horaires (ophtalmologue) ──────────────────────────
export const plagesAPI = {
  getMyPlages: () =>
    fetch(`${BASE_URL}/agenda/my-plages`, { headers: getHeaders() }).then((r) => r.json()),

  create: (data) =>
    fetch(`${BASE_URL}/agenda/my-plages`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  update: (id, data) =>
    fetch(`${BASE_URL}/agenda/my-plages/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  delete: (id) =>
    fetch(`${BASE_URL}/agenda/my-plages/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    }).then((r) => r.json()),
};

// ─── Patients (Sprint 3) ──────────────────────────────────────
export const patientsAPI = {
  getMy: (search = "") => {
    const url = search
      ? `${BASE_URL}/patients/my-patients?search=${encodeURIComponent(search)}`
      : `${BASE_URL}/patients/my-patients`;
    return requestJson(url, { headers: getHeaders() });
  },

  getByCabinet: (cabinetId, search = "") => {
    const url = search
      ? `${BASE_URL}/patients/cabinet/${cabinetId}?search=${encodeURIComponent(search)}`
      : `${BASE_URL}/patients/cabinet/${cabinetId}`;
    return requestJson(url, { headers: getHeaders() });
  },

  getById: (id) =>
    requestJson(`${BASE_URL}/patients/${id}`, { headers: getHeaders() }),

  create: (data) =>
    requestJson(`${BASE_URL}/patients/add`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }),

  update: (id, data) =>
    requestJson(`${BASE_URL}/patients/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }),

  delete: (id) =>
    requestJson(`${BASE_URL}/patients/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    }),
};

// ─── File d'attente (Sprint 3) ────────────────────────────────
export const queueAPI = {
  get: (includeTermine = false) =>
    requestJson(
      `${BASE_URL}/queue/?include_termine=${includeTermine}`,
      { headers: getHeaders() }
    ),

  add: (data) =>
    requestJson(`${BASE_URL}/queue/`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }),

  update: (id, data) =>
    requestJson(`${BASE_URL}/queue/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }),

  remove: (id) =>
    requestJson(`${BASE_URL}/queue/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    }),
};
