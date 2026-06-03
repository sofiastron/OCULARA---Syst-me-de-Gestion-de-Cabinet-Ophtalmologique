import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PatientsManager from "../components/patients/PatientsManager";
import ExamensPage from "../components/examens/ExamensPage";
import FileAttenteManager from "../components/queue/FileAttenteManager";

export default function OrthoptistDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [activeSection, setActiveSection] = useState("accueil");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-indigo-600">OCULARA</h1>
            <p className="text-gray-600">Dashboard Orthoptiste</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-gray-700 font-semibold">{user.first_name} {user.last_name}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-200"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Navigation Tabs */}
        <div className="mb-8 flex gap-4 flex-wrap items-center">
          {activeSection !== "accueil" && (
            <button
              onClick={() => setActiveSection("accueil")}
              className="px-6 py-3 rounded-lg font-semibold transition bg-gray-600 hover:bg-gray-700 text-white"
            >
              ← Retour
            </button>
          )}
          <button
            onClick={() => setActiveSection("accueil")}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              activeSection === "accueil"
                ? "bg-indigo-600 text-white"
                : "bg-white text-indigo-600 border-2 border-indigo-600 hover:bg-indigo-50"
            }`}
          >
            Accueil
          </button>
          <button
            onClick={() => setActiveSection("examens")}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              activeSection === "examens"
                ? "bg-indigo-600 text-white"
                : "bg-white text-indigo-600 border-2 border-indigo-600 hover:bg-indigo-50"
            }`}
          >
            Examens
          </button>
          <button
            onClick={() => setActiveSection("patients")}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              activeSection === "patients"
                ? "bg-indigo-600 text-white"
                : "bg-white text-indigo-600 border-2 border-indigo-600 hover:bg-indigo-50"
            }`}
          >
            Patients
          </button>
          <button
            onClick={() => setActiveSection("file")}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              activeSection === "file"
                ? "bg-indigo-600 text-white"
                : "bg-white text-indigo-600 border-2 border-indigo-600 hover:bg-indigo-50"
            }`}
          >
             File d'Attente
          </button>
        </div>

        {/* Sections */}
        {activeSection === "accueil" && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Examen Card */}
              <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Examens</h3>
                    <p className="text-gray-600">Gérer les examens des patients</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveSection("examens")}
                  className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded transition"
                >
                  Accéder
                </button>
              </div>

              {/* Patients Card */}
              <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Patients</h3>
                    <p className="text-gray-600">Consulter les patients</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveSection("patients")}
                  className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded transition"
                >
                  Accéder
                </button>
              </div>

              {/* File d'Attente Card */}
              <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">File d'Attente</h3>
                    <p className="text-gray-600">Voir la file d'attente</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveSection("file")}
                  className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded transition"
                >
                  Accéder
                </button>
              </div>
            </div>

            {/* Welcome Message */}
            <div className="mt-12 bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Bienvenue, {user.first_name}! 
              </h2>
              <p className="text-gray-600 text-lg">
                En tant qu'orthoptiste, vous pouvez accéder aux examens et à la gestion des patients.
              </p>
            </div>
          </div>
        )}

        {activeSection === "examens" && <ExamensPage />}
        {activeSection === "patients" && <PatientsManager />}
        {activeSection === "file" && <FileAttenteManager />}
      </main>
    </div>
  );
}
