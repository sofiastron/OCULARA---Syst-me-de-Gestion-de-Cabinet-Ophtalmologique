// =====================================================
// App.jsx
// =====================================================

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import ProtectedRoute from "./auth/ProtectedRoute";
import Login from "./auth/Login";
import AdminDashboard from "./dashbord/AdminDashboard";
import OphthalmologistDashboard from "./dashbord/OphthalmologistDashboard";
import SecretaireDashboard from "./dashbord/SecretaireDashboard";
// import OrthoptisteDashboard from "./dashbord/OrthoptisteDashboard";

export default function App() {
  return (
    <Router>
      <Routes>

        {/* Redirection racine → login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Page de connexion (publique) */}
        <Route path="/login" element={<Login />} />

        {/* ── Admin ─────────────────────────────────── */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* ── Ophtalmologue ─────────────────────────── */}
        <Route
          path="/ophtalmo"
          element={
            <ProtectedRoute requiredRole="ophtalmologue">
              <OphthalmologistDashboard />
            </ProtectedRoute>
          }
        />

        {/* ── Secrétaire ────────────────────────────── */}
        <Route
          path="/secretaire"
          element={
            <ProtectedRoute requiredRole="secretaire">
              <SecretaireDashboard />
            </ProtectedRoute>
          }
        />

        {/* ── Orthoptiste ───────────────────────────── */}
        {/* <Route
          path="/orthoptiste"
          element={
            <ProtectedRoute requiredRole="orthoptiste">
              <OrthoptisteDashboard />
            </ProtectedRoute>
          }
        /> */}

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </Router>
  );
}
