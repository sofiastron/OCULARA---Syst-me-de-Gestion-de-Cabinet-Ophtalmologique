import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

export function getApiError(error) {
  const detail = error.response?.data?.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    return detail.map((item) => item.msg || item.message || String(item)).join(', ');
  }
  return error.message || 'Une erreur est survenue';
}

export const cabinetsAPI = {
  getAll: async () => {
    const { data } = await api.get('/cabinets/');
    return data;
  },

  getById: async (id) => {
    const { data } = await api.get(`/cabinets/${id}`);
    return data;
  },
};

export const doctorsAPI = {
  getByCabinet: async (cabinetId) => {
    const { data } = await api.get('/doctors', {
      params: { cabinet_id: cabinetId },
    });
    return data;
  },

  getById: async (id) => {
    const { data } = await api.get(`/doctors/${id}`);
    return data;
  },
};

export const slotsAPI = {
  getAvailable: async (doctorId, date) => {
    const { data } = await api.get('/agenda/available-slots', {
      params: { doctor_id: doctorId, date },
    });
    return data;
  },

  getCalendarStatus: async (doctorId, year, month) => {
    const { data } = await api.get('/agenda/calendar-status', {
      params: { doctor_id: doctorId, year, month },
    });
    return data;
  },

  getPlages: async (doctorId) => {
    const { data } = await api.get('/agenda/plages-horaires', {
      params: { doctor_id: doctorId },
    });
    return data;
  },
};

export const appointmentsAPI = {
  create: async (payload) => {
    const { data } = await api.post('/agenda/appointments', payload);
    return data;
  },

  getByToken: async (token) => {
    const { data } = await api.get(`/agenda/appointments/${token}`);
    return data;
  },

  modify: async (token, payload) => {
    const { data } = await api.put(`/agenda/appointments/${token}/modifier`, payload);
    return data;
  },

  cancel: async (token) => {
    const { data } = await api.delete(`/agenda/appointments/${token}/annuler`);
    return data;
  },
};

export default api;