import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import CabinetsManager from "./CabinetsManager";
import OphthalmologistsManager from "./OphthalmologistsManager";

// Les clés restent intactes pour la logique, les icônes sont gérées plus bas avec des SVGs premium
const NAV_ITEMS = [
  { key: "cabinets", label: "Cabinets Médicaux" },
  { key: "ophtalmologues", label: "Ophtalmologues" },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("cabinets");
  const navigate = useNavigate();

  // ==========================================
  // LOGIQUE INTACTE
  // ==========================================
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Fonction pour associer une belle icône SVG à chaque onglet
  const getIcon = (key, isActive) => {
    const strokeColor = isActive ? "text-[#2d2925]" : "text-[#5c728a]";
    if (key === "cabinets") {
      return (
        <svg className={`w-5 h-5 ${strokeColor} transition-colors`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1v1H9V7zm5 0h1v1h-1V7zm-5 4h1v1H9v-1zm5 0h1v1h-1v-1zm-3 4H9v2h1v-2zm5 0h-1v2h1v-2z" />
        </svg>
      );
    }
    return (
      <svg className={`w-5 h-5 ${strokeColor} transition-colors`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    );
  };

  // ==========================================
  // DESIGN PREMIUM "OCULARA GLASSMORPHISM"
  // ==========================================
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[#7fa2c4] via-[#c4d3df] to-[#eedecb] relative overflow-hidden font-sans">
      
      {/* === ARRIÈRE-PLAN : Effets de lumière === */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-300 rounded-full mix-blend-multiply filter blur-[120px] opacity-50"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#f4e4d4] rounded-full mix-blend-multiply filter blur-[120px] opacity-70"></div>
      </div>

      {/* === ARRIÈRE-PLAN : Lettres flottantes très subtiles (Opacité réduite pour l'admin) === */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0 font-serif font-bold text-[#445b73]">
        <span className="absolute top-[10%] left-[20%] text-[15rem] opacity-5 blur-xl transform -rotate-12">E</span>
        <span className="absolute bottom-[5%] right-[10%] text-[20rem] opacity-[0.03] blur-2xl transform rotate-12">O</span>
        <span className="absolute top-[40%] right-[5%] text-[10rem] opacity-5 blur-lg transform rotate-45">P</span>
        <span className="absolute bottom-[20%] left-[5%] text-[8rem] opacity-5 blur-md transform -rotate-6">F</span>
      </div>

      {/* === SIDEBAR (Panneau de verre gauche) === */}
      <aside className="w-72 bg-white/20 backdrop-blur-[40px] border-r border-white/40 shadow-[10px_0_30px_-10px_rgba(0,0,0,0.1)] flex flex-col z-10 relative">
        
        {/* En-tête Sidebar / Logo */}
        <div className="px-8 py-8 border-b border-white/30">
          <div className="flex items-center gap-3">
            <svg className="w-8 h-8 text-[#2c2925] drop-shadow-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span className="text-2xl font-bold tracking-wide text-[#2c2925] uppercase">
              Oculara
            </span>
          </div>
          <p className="text-xs font-medium text-[#5c728a] mt-2 tracking-widest uppercase">Espace Administration</p>
        </div>

        {/* Navigation Sidebar */}
        <nav className="flex-1 py-8 px-4 space-y-2">
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-300 ${
                  isActive
                    ? "bg-white/40 text-[#2d2925] shadow-[inset_0_2px_4px_rgba(255,255,255,0.6),0_4px_12px_rgba(0,0,0,0.05)] border border-white/60"
                    : "text-[#5c728a] hover:bg-white/20 hover:text-[#2d2925] border border-transparent"
                }`}
              >
                {getIcon(item.key, isActive)}
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Footer Sidebar / Logout */}
        <div className="px-6 py-6 border-t border-white/30 bg-white/10">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#7fa2c4] to-[#eedecb] flex items-center justify-center border border-white/50 shadow-sm">
              <span className="text-white text-xs font-bold">AD</span>
            </div>
            <div>
              <p className="text-sm font-bold text-[#2d2925]">Administrateur</p>
              <p className="text-[10px] uppercase tracking-wider text-[#5c728a]">Session active</p>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-red-700 bg-red-50/50 hover:bg-red-100/80 border border-red-100/50 rounded-xl transition-all duration-300 shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
            </svg>
            Se déconnecter
          </button>
        </div>
      </aside>

      {/* === MAIN CONTENT (La zone d'affichage des composants) === */}
      {/* On enveloppe le contenu dans une zone qui laisse respirer le design */}
      <main className="flex-1 h-screen overflow-auto relative z-10 p-6 md:p-10 flex flex-col">
        {/* On crée un conteneur en verre dépoli très léger pour que tes tableaux/composants s'affichent proprement par-dessus */}
        <div className="flex-1 bg-white/50 backdrop-blur-3xl border border-white/60 rounded-[2rem] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto">
            {/* Rendu conditionnel intact */}
            {activeTab === "cabinets" && <CabinetsManager />}
            {activeTab === "ophtalmologues" && <OphthalmologistsManager />}
          </div>
        </div>
      </main>
      
    </div>
  );
}