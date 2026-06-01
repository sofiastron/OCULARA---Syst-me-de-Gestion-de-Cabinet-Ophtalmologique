// =====================================================
// auth/ProtectedRoute.jsx
// =====================================================

import React from "react";
import { Navigate } from "react-router-dom";

/**
 * Protège une route.
 * - Redirige vers /login si aucun token n'est présent.
 * - Redirige vers /login si le rôle ne correspond pas (optionnel).
 *
 * Usage :
 *   <ProtectedRoute requiredRole="ophtalmologue">
 *     <OphthalmologistDashboard />
 *   </ProtectedRoute>
 */
export default function ProtectedRoute({ children, requiredRole }) {
  const token = localStorage.getItem("token");
  const role  = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && role !== requiredRole) {
    // Renvoie l'utilisateur vers son propre dashboard
    const redirects = {
      admin:         "/admin",
      ophtalmologue: "/ophtalmo",
      secretaire:    "/secretaire",
      orthoptiste:   "/orthoptiste",
    };
    return <Navigate to={redirects[role] || "/login"} replace />;
  }

  return children;
}