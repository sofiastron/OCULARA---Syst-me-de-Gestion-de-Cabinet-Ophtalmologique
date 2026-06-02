import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Eye, Menu } from 'lucide-react';
import { useState } from 'react';
import HomePage from './pages/HomePage';
import CabinetsPage from './pages/CabinetsPage';
import DoctorsPage from './pages/DoctorsPage';
import AgendaPage from './pages/AgendaPage';
import BookingPage from './pages/BookingPage';
import ConfirmationPage from './pages/ConfirmationPage';
import AppointmentPage from './pages/AppointmentPage';
import ModifyAppointmentPage from './pages/ModifyAppointmentPage';
import CancelAppointmentPage from './pages/CancelAppointmentPage';

function Navbar() {
  const location = useLocation();
  const isHome = location.pathname === '/';
  if (isHome) return null;
  const [open, setOpen] = useState(false);

  return (
    <header style={{
      background: '#092C56',
      position: 'sticky',
      top: 0, left: 0, right: 0,
      zIndex: 50,
      borderBottom: '1px solid rgba(169,203,224,0.1)',
      backdropFilter: 'none',
      boxShadow: '0 4px 20px rgba(9,44,86,0.15)',
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 2rem', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: isHome ? 'rgba(169,203,224,0.15)' : 'rgba(169,203,224,0.1)',
            border: '1px solid rgba(169,203,224,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Eye size={20} color="#A9CBE0" />
          </div>
          <div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, color: 'white', fontSize: '1rem', lineHeight: 1.2 }}>
              Portail Patient
            </div>
            <div style={{ fontSize: '0.65rem', color: 'rgba(169,203,224,0.7)', fontWeight: 500 }}>
              Ophtalmologie
            </div>
          </div>
        </Link>


      </div>
    </header>
  );
}

export default function App() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div style={{ minHeight: '100vh', background: '#F0F5F4' }}>
      <Navbar />
      <main style={isHome ? {} : { maxWidth: 1300, margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/cabinets" element={<CabinetsPage />} />
          <Route path="/cabinet/:cabinetId/doctors" element={<DoctorsPage />} />
          <Route path="/cabinet/:cabinetId/doctors/:doctorId/agenda" element={<AgendaPage />} />
          <Route path="/cabinet/:cabinetId/doctors/:doctorId/reservation" element={<BookingPage />} />
          <Route path="/confirmation" element={<ConfirmationPage />} />
          <Route path="/rendez-vous/:token" element={<AppointmentPage />} />
          <Route path="/rendez-vous/:token/modifier" element={<ModifyAppointmentPage />} />
          <Route path="/rendez-vous/:token/annuler" element={<CancelAppointmentPage />} />
        </Routes>
      </main>
    </div>
  );
}