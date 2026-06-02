
import axios from "axios";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({ baseURL: BASE });

export const getCabinets = () => api.get("/cabinets/");
export const getCabinet = (id) => api.get(`/cabinets/${id}`);

export const getDoctorsByCabinet = (cabinetId) =>
  api.get("/doctors", { params: { cabinet_id: cabinetId } });

export const getDoctor = (doctorId) => api.get(`/doctors/${doctorId}`);


export const getCalendarStatus = (doctorId, year, month) =>
  api.get("/agenda/calendar-status", {
    params: { doctor_id: doctorId, year, month },
  });


export const getAvailableSlots = (doctorId, date) =>
  api.get("/agenda/available-slots", {
    params: { doctor_id: doctorId, date },
  });

export const createAppointment = (payload) =>
  api.post("/agenda/appointments", payload);

export default api;
