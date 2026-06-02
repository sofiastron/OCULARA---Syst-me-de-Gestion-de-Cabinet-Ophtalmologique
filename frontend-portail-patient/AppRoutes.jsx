
import { BrowserRouter, Routes, Route } from "react-router-dom";

import CabinetsPage from "./pages/CabinetsPage";
import DoctorsPage from "./pages/DoctorsPage";

import AgendaPage from "./pages/AgendaPage";
import BookingForm from "./pages/BookingForm";
import ConfirmationPage from "./pages/ConfirmationPage";
import AppointmentDetailsPage from "./pages/AppointmentDetailsPage";
import ModifyAppointmentPage from "./pages/ModifyAppointmentPage";
import CancelAppointmentPage from "./pages/CancelAppointmentPage";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
       
        <Route path="/" element={<CabinetsPage />} />
        <Route path="/cabinet/:cabinetId/doctors" element={<DoctorsPage />} />

  
        <Route path="/doctors/:doctorId/agenda" element={<AgendaPage />} />
        <Route path="/booking" element={<BookingForm />} />
        <Route path="/confirmation" element={<ConfirmationPage />} />
        <Route path="/appointment/:id" element={<AppointmentDetailsPage />} />
        <Route path="/appointment/:id/modify" element={<ModifyAppointmentPage />} />
        <Route path="/appointment/:id/cancel" element={<CancelAppointmentPage />} />
      </Routes>
    </BrowserRouter>
  );
}
