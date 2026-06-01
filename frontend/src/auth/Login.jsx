import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usersAPI } from "../../api";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await usersAPI.login(form.email, form.password);

      if (data.detail || !data.access_token) {
        setError(data.detail || "Identifiants incorrects");
        return;
      }

      // Persister le token et les infos utilisateur
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Redirection selon le rôle
      if (data.role === "admin") {
        navigate("/admin");
      } else if (data.role === "ophtalmologue") {
        navigate("/ophtalmo");
      } else if (data.role === "secretaire") {
        navigate("/secretaire");
      } else if (data.role === "orthoptiste") {
        navigate("/orthoptiste");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError("Erreur de connexion. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };
  // 2. DESIGN PREMIUM : EFFET VERRE + DISPERSION MAXIMALE

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-[#7fa2c4] via-[#c4d3df] to-[#eedecb] relative overflow-hidden">
      
      {/* ================= LETTRES FLOTTANTES ================= */}
      {/* Container avec overflow-hidden pour que les lettres immenses ne créent pas de scroll */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0 font-serif font-bold text-[#445b73]">
        
        {/* --- TAILLES TITANESQUES --- */}
        <span className="absolute top-[-10%] left-[-15%] text-[45rem] opacity-5 blur-[80px] transform -rotate-12">E</span>
        <span className="absolute bottom-[-30%] right-[-10%] text-[40rem] opacity-[0.07] blur-[60px] transform rotate-12">F</span>
        <span className="absolute top-[20%] right-[30%] text-[35rem] opacity-10 blur-[50px] transform rotate-45">O</span>
        <span className="absolute top-[30%] left-[-25%] text-[50rem] opacity-[0.04] blur-[90px] transform rotate-[25deg]">C</span>
        <span className="absolute top-[-25%] right-[15%] text-[42rem] opacity-[0.06] blur-[70px] transform -rotate-[15deg]">N</span>
        
        {/* --- TRÈS GRANDES (Flou prononcé) --- */}
        <span className="absolute top-[5%] left-[5%] text-[18rem] opacity-15 blur-2xl transform rotate-6">P</span>
        <span className="absolute bottom-[5%] left-[2%] text-[16rem] opacity-20 blur-xl transform -rotate-[15deg]">T</span>
        <span className="absolute top-[40%] left-[8%] text-[14rem] opacity-25 blur-xl transform rotate-[25deg]">D</span>
        <span className="absolute top-[65%] left-[-5%] text-[20rem] opacity-15 blur-2xl transform -rotate-6">L</span>
        <span className="absolute top-[-5%] right-[15%] text-[22rem] opacity-15 blur-[30px] transform -rotate-[20deg]">Z</span>
        <span className="absolute bottom-[20%] right-[2%] text-[18rem] opacity-20 blur-2xl transform rotate-[10deg]">E</span>
        <span className="absolute top-[10%] left-[40%] text-[19rem] opacity-10 blur-[25px] transform rotate-12">R</span>
        <span className="absolute bottom-[40%] right-[-5%] text-[24rem] opacity-[0.12] blur-[35px] transform -rotate-[30deg]">H</span>
        <span className="absolute top-[50%] right-[40%] text-[17rem] opacity-15 blur-2xl transform rotate-[5deg]">U</span>

        {/* --- GRANDES & MOYENNES (Profondeur intermédiaire) --- */}
        <span className="absolute top-[25%] left-[18%] text-[8rem] opacity-35 blur-md transform -rotate-6">Z</span>
        <span className="absolute bottom-[30%] left-[25%] text-[7rem] opacity-40 blur-md transform rotate-12">L</span>
        <span className="absolute top-[50%] left-[20%] text-[9rem] opacity-30 blur-lg transform -rotate-12">F</span>
        <span className="absolute top-[15%] right-[25%] text-[10rem] opacity-35 blur-lg transform rotate-12">O</span>
        <span className="absolute bottom-[10%] right-[35%] text-[8rem] opacity-30 blur-md transform -rotate-[15deg]">T</span>
        <span className="absolute top-[45%] right-[12%] text-[7rem] opacity-40 blur-md transform rotate-45">D</span>
        <span className="absolute top-[75%] right-[20%] text-[6rem] opacity-45 blur-sm transform -rotate-6">P</span>
        <span className="absolute top-[5%] left-[60%] text-[9rem] opacity-25 blur-lg transform rotate-[20deg]">N</span>
        <span className="absolute bottom-[50%] left-[10%] text-[7.5rem] opacity-35 blur-md transform -rotate-[10deg]">C</span>
        <span className="absolute top-[80%] left-[30%] text-[8.5rem] opacity-30 blur-lg transform rotate-12">E</span>
        <span className="absolute top-[30%] right-[5%] text-[6.5rem] opacity-40 blur-md transform -rotate-[25deg]">V</span>
        
        {/* --- PETITES  --- */}
        <span className="absolute top-[12%] left-[28%] text-[4rem] opacity-55 blur-sm transform rotate-45">E</span>
        <span className="absolute bottom-[15%] left-[30%] text-[3rem] opacity-60 blur-[2px] transform -rotate-[20deg]">P</span>
        <span className="absolute top-[55%] left-[28%] text-[5rem] opacity-50 blur-sm transform rotate-[10deg]">F</span>
        <span className="absolute top-[5%] left-[15%] text-[2.5rem] opacity-65 blur-[1px]">Z</span>
        <span className="absolute bottom-[40%] left-[5%] text-[3rem] opacity-60 blur-[2px] transform rotate-[15deg]">T</span>
        <span className="absolute top-[10%] right-[45%] text-[3.5rem] opacity-60 blur-[2px] transform -rotate-[10deg]">F</span>
        <span className="absolute bottom-[35%] right-[8%] text-[4.5rem] opacity-55 blur-sm transform rotate-[25deg]">L</span>
        <span className="absolute top-[20%] left-[50%] text-[3rem] opacity-65 blur-[2px] transform -rotate-[15deg]">O</span>
        <span className="absolute bottom-[25%] left-[45%] text-[4rem] opacity-50 blur-sm transform rotate-[5deg]">D</span>
        <span className="absolute top-[45%] left-[45%] text-[2.8rem] opacity-60 blur-[1px] transform rotate-[35deg]">N</span>
        <span className="absolute bottom-[60%] right-[25%] text-[3.2rem] opacity-55 blur-sm transform -rotate-[8deg]">H</span>
        <span className="absolute top-[85%] right-[40%] text-[4rem] opacity-50 blur-sm transform rotate-[18deg]">C</span>
        <span className="absolute top-[15%] right-[15%] text-[2.5rem] opacity-70 blur-[1px] transform -rotate-[22deg]">T</span>

        {/* --- MICRO-DÉTAILS  --- */}
        <span className="absolute top-[35%] left-[15%] text-xl opacity-85 blur-none transform -rotate-12">T</span>
        <span className="absolute bottom-[45%] left-[15%] text-2xl opacity-80 blur-none transform rotate-6">O</span>
        <span className="absolute bottom-[8%] left-[18%] text-lg opacity-80 blur-none">D</span>
        <span className="absolute top-[20%] left-[10%] text-2xl opacity-75 blur-none transform rotate-45">E</span>
        <span className="absolute top-[25%] right-[20%] text-xl opacity-85 blur-none transform rotate-[15deg]">Z</span>
        <span className="absolute bottom-[20%] right-[15%] text-lg opacity-80 blur-none transform -rotate-6">E</span>
        <span className="absolute top-[40%] right-[5%] text-2xl opacity-75 blur-none">P</span>
        <span className="absolute top-[5%] right-[30%] text-sm opacity-90 blur-none transform -rotate-45">D</span>
        <span className="absolute top-[50%] left-[5%] text-base opacity-85 blur-none transform rotate-[10deg]">L</span>
        <span className="absolute bottom-[10%] right-[50%] text-xl opacity-80 blur-none transform -rotate-[15deg]">F</span>
        <span className="absolute top-[75%] left-[15%] text-2xl opacity-70 blur-none transform rotate-[25deg]">N</span>
        <span className="absolute top-[12%] left-[70%] text-lg opacity-85 blur-none transform -rotate-[5deg]">C</span>
        <span className="absolute bottom-[55%] left-[35%] text-sm opacity-90 blur-none transform rotate-[30deg]">O</span>
        <span className="absolute top-[60%] right-[35%] text-xl opacity-80 blur-none transform -rotate-[20deg]">H</span>
        <span className="absolute bottom-[5%] right-[25%] text-base opacity-85 blur-none transform rotate-[12deg]">V</span>
        <span className="absolute top-[30%] left-[35%] text-xs opacity-95 blur-none transform rotate-[8deg]">Z</span>
      </div>

      {/* ================= EFFETS DE LUMIÈRE ================= */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-300 rounded-full mix-blend-multiply filter blur-[120px] opacity-50"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#f4e4d4] rounded-full mix-blend-multiply filter blur-[120px] opacity-70"></div>
      </div>

      {/* ================= MAIN GLASS PANEL  ================= */}
      <div className="flex flex-col md:flex-row w-full max-w-5xl rounded-3xl relative z-10 overflow-hidden
                      bg-white/10 backdrop-blur-[40px] border border-white/60 
                      shadow-[0_24px_60px_-15px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.8)]">
        
        {/* Reflet lumineux sur le haut du verre */}
        <div className="absolute top-0 left-0 w-full h-[25%] bg-gradient-to-b from-white/30 to-transparent pointer-events-none z-0"></div>

        {/* ================= GAUCHE : L'Iris et le Logo ================= */}
        <div className="w-full md:w-[55%] p-10 flex flex-col justify-between relative min-h-[400px] z-10">
          
          {/* Logo Oculara avec icône SVG pur et couleur marron sombre */}
          <div className="flex items-center gap-3 z-10">
            <svg className="w-8 h-8 text-[#403c37] drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span className="text-2xl font-bold tracking-wide text-[#403c37] drop-shadow-md">
              Oculara
            </span>
          </div>

          <div className="absolute inset-0 flex items-center justify-center p-12 pointer-events-none z-0">
            <img 
              src="/iris2.png" 
              alt="Iris 3D Abstrait" 
              className="w-full h-full object-contain filter drop-shadow-[0_0_30px_rgba(59,130,246,0.5)]"
            />
          </div>
        </div>

        {/* ================= DROITE : Le Formulaire ================= */}
        <div className="w-full md:w-[45%] p-10 md:p-14 flex flex-col justify-center relative z-10
                        bg-white/30 backdrop-blur-3xl border-l border-white/50 
                        shadow-[-20px_0_40px_-10px_rgba(0,0,0,0.05)]">
          
          <h2 className="text-3xl md:text-4xl font-serif text-gray-800 mb-8 leading-tight">
            Connectez-vous <br /> à votre espace
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {error && (
              <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            <div className="space-y-1 relative group">
              <label className="block text-sm font-medium text-gray-700 pl-1 mb-1">
                Adresse e-mail
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="vous@exemple.com"
                className="w-full bg-white/20 backdrop-blur-md border border-white/50 rounded-xl px-4 py-3.5 text-gray-800 placeholder-gray-500
                           focus:outline-none focus:ring-2 focus:ring-gray-600 focus:bg-white/40 transition-all duration-300
                           shadow-[inset_0_2px_4px_rgba(0,0,0,0.05),0_1px_0_rgba(255,255,255,0.8)]"
              />
            </div>

            <div className="space-y-1 relative group">
              <label className="block text-sm font-medium text-gray-700 pl-1 mb-1">
                Mot de passe
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className="w-full bg-white/20 backdrop-blur-md border border-white/50 rounded-xl px-4 py-3.5 text-gray-800 placeholder-gray-500
                           focus:outline-none focus:ring-2 focus:ring-gray-600 focus:bg-white/40 transition-all duration-300
                           shadow-[inset_0_2px_4px_rgba(0,0,0,0.05),0_1px_0_rgba(255,255,255,0.8)]"
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#403c37] hover:bg-[#2d2925] disabled:opacity-60
                           text-white font-medium tracking-wide rounded-full py-4 text-base transition-all duration-300 
                           shadow-[0_10px_20px_-5px_rgba(64,60,55,0.5)] transform hover:-translate-y-0.5"
              >
                {loading ? "Connexion…" : "Se connecter"}
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
}