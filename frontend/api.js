const BASE_URL = "http://localhost:8000";

const getHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
});

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
    fetch(`${BASE_URL}/users/admin-create`, {
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