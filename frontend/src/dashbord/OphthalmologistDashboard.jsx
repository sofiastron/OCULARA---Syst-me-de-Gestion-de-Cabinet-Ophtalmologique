import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usersAPI } from "../../api";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/Confirmdialog";

const BASE_URL = "http://localhost:8000";
const getHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
});

const EMPTY_FORM = {
  nom: "",
  prenom: "",
  email: "",
  password: "",
  role: "secretaire",
};

// Le backend stocke les jours en string "LUNDI", "MARDI"...
const JOURS = ["LUNDI", "MARDI", "MERCREDI", "JEUDI", "VENDREDI", "SAMEDI", "DIMANCHE"];
const JOURS_LABELS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

const EMPTY_PLAGE = {
  jour_semaine: "LUNDI",
  heure_debut: "08:00",
  heure_fin: "17:00",
  duree_creneau_min: 20,
};

export default function OphthalmologistDashboard() {
  const [activeSection, setActiveSection] = useState("equipe");
  const [secretaires, setSecretaires] = useState([]);
  const [orthoptistes, setOrthoptistes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Plages state
  const [plages, setPlages] = useState([]);
  const [plagesLoading, setPlagesLoading] = useState(false);
  const [plagesError, setPlagesError] = useState("");
  const [showPlageModal, setShowPlageModal] = useState(false);
  const [plageForm, setPlageForm] = useState(EMPTY_PLAGE);
  const [plageFormError, setPlageFormError] = useState("");
  const [plageSubmitting, setPlageSubmitting] = useState(false);

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const fetchStaff = async () => {
    setLoading(true);
    setError("");
    try {
      const me = await usersAPI.getMe();
      setCurrentUser(me);
      if (!me?.cabinet_id) {
        setError("Votre compte n'est pas associé à un cabinet. Contactez l'administrateur.");
        setLoading(false);
        return;
      }
      const staff = await usersAPI.getMyStaff();
      const list = Array.isArray(staff) ? staff : [];
      setSecretaires(list.filter((u) => u.role === "secretaire"));
      setOrthoptistes(list.filter((u) => u.role === "orthoptiste"));
    } catch (err) {
      setError("Erreur lors du chargement des données.");
    } finally {
      setLoading(false);
    }
  };

  // Utilise GET /agenda/plages-horaires?doctor_id=...
  const fetchPlages = async () => {
    if (!currentUser?.id) return;
    setPlagesLoading(true);
    setPlagesError("");
    try {
      const res = await fetch(
        `${BASE_URL}/agenda/plages-horaires?doctor_id=${currentUser.id}`,
        { headers: getHeaders() }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Erreur");
      setPlages(Array.isArray(data) ? data : []);
    } catch (err) {
      setPlagesError("Erreur lors du chargement des plages horaires.");
    } finally {
      setPlagesLoading(false);
    }
  };

  useEffect(() => { fetchStaff(); }, []);

  useEffect(() => {
    if (activeSection === "plages" && currentUser?.id) fetchPlages();
  }, [activeSection, currentUser]);

  // Staff handlers
  const openAdd = (role) => {
    setEditTarget(null);
    setFormError("");
    setForm({ ...EMPTY_FORM, role });
    setShowModal(true);
  };

  const openEdit = (user) => {
    setEditTarget(user);
    setFormError("");
    setForm({ nom: user.nom || "", prenom: user.prenom || "", email: user.email || "", password: "", role: user.role });
    setShowModal(true);
  };

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!form.nom.trim() || !form.prenom.trim() || !form.email.trim()) {
      setFormError("Nom, prénom et email sont requis.");
      return;
    }
    if (!editTarget && !form.password.trim()) {
      setFormError("Le mot de passe est requis à la création.");
      return;
    }
    setSubmitting(true);
    try {
      const payload = { nom: form.nom.trim(), prenom: form.prenom.trim(), email: form.email.trim(), role: form.role, cabinet_id: currentUser.cabinet_id };
      if (form.password.trim()) payload.password = form.password.trim();
      const result = editTarget ? await usersAPI.update(editTarget.id, payload) : await usersAPI.create(payload);
      if (result?.detail) {
        const msg = Array.isArray(result.detail) ? result.detail.map((e) => `${e.loc?.slice(-1)[0]}: ${e.msg}`).join(" | ") : result.detail;
        setFormError(msg);
        return;
      }
      setShowModal(false);
      fetchStaff();
    } catch (err) {
      setFormError("Une erreur est survenue.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try { await usersAPI.delete(deleteTarget.id); }
    catch (err) { setError("Erreur lors de la suppression."); }
    finally { setDeleteTarget(null); fetchStaff(); }
  };

  // Plage handlers — utilise POST /agenda/plages-horaires?doctor_id=...
  const openAddPlage = () => {
    setPlageFormError("");
    setPlageForm(EMPTY_PLAGE);
    setShowPlageModal(true);
  };

  const handlePlageChange = (e) => {
    const { name, value } = e.target;
    setPlageForm((prev) => ({
      ...prev,
      [name]: name === "duree_creneau_min" ? Number(value) : value,
    }));
  };

  const handlePlageSubmit = async (e) => {
    e.preventDefault();
    setPlageFormError("");
    if (plageForm.heure_debut >= plageForm.heure_fin) {
      setPlageFormError("L'heure de fin doit être après l'heure de début.");
      return;
    }
    if (plageForm.duree_creneau_min < 5 || plageForm.duree_creneau_min > 120) {
      setPlageFormError("La durée doit être entre 5 et 120 minutes.");
      return;
    }
    setPlageSubmitting(true);
    try {
      const res = await fetch(
        `${BASE_URL}/agenda/plages-horaires?doctor_id=${currentUser.id}`,
        {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify(plageForm),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        const msg = Array.isArray(data.detail)
          ? data.detail.map((e) => `${e.loc?.slice(-1)[0]}: ${e.msg}`).join(" | ")
          : data.detail || "Erreur";
        setPlageFormError(msg);
        return;
      }
      setShowPlageModal(false);
      fetchPlages();
    } catch (err) {
      setPlageFormError("Une erreur est survenue.");
    } finally {
      setPlageSubmitting(false);
    }
  };

  // Pas de DELETE dans le backend — on informe l'utilisateur
  const StaffTable = ({ rows }) => (
    <div className="overflow-hidden rounded-[1.5rem] bg-white/60 backdrop-blur-md border border-white/60 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] mb-8">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[#c1bdaf]/30">
          <thead className="bg-white/40">
            <tr>
              {["Nom", "Prénom", "Email", "Actions"].map((h) => (
                <th key={h} className="px-6 py-4 text-left text-xs font-bold text-[#5c728a] uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#c1bdaf]/20">
            {rows.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-10 text-center text-[#5c728a] font-medium italic">Aucun membre enregistré dans cette catégorie.</td></tr>
            ) : rows.map((u) => (
              <tr key={u.id} className="hover:bg-white/50 transition-colors duration-200">
                <td className="px-6 py-4 font-semibold text-[#2d2925]">{u.nom}</td>
                <td className="px-6 py-4 font-semibold text-[#2d2925]">{u.prenom}</td>
                <td className="px-6 py-4 text-sm text-[#5c728a]">{u.email}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(u)} className="text-xs font-medium px-3 py-1.5 bg-[#fefce8]/60 text-[#854d0e] border border-[#fef08a]/50 rounded-lg hover:bg-[#fef08a]/80 transition-all">Modifier</button>
                    <button onClick={() => setDeleteTarget(u)} className="text-xs font-medium px-3 py-1.5 bg-[#fef2f2]/60 text-[#991b1b] border border-[#fecaca]/50 rounded-lg hover:bg-[#fecaca]/80 transition-all">Supprimer</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const userInitials = currentUser
    ? `${currentUser.prenom?.charAt(0) || ""}${currentUser.nom?.charAt(0) || ""}`.toUpperCase()
    : "OP";

  // Grouper les plages par jour
  const plagesParJour = JOURS.map((jour, idx) => ({
    jour,
    label: JOURS_LABELS[idx],
    plages: plages.filter((p) => p.jour_semaine === jour),
  }));

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[#7fa2c4] via-[#c4d3df] to-[#eedecb] relative overflow-hidden font-sans">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-300 rounded-full mix-blend-multiply filter blur-[120px] opacity-50"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#f4e4d4] rounded-full mix-blend-multiply filter blur-[120px] opacity-70"></div>
      </div>
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0 font-serif font-bold text-[#445b73]">
        <span className="absolute top-[10%] left-[20%] text-[15rem] opacity-5 blur-xl transform -rotate-12">E</span>
        <span className="absolute bottom-[5%] right-[10%] text-[20rem] opacity-[0.03] blur-2xl transform rotate-12">O</span>
      </div>

      {/* SIDEBAR */}
      <aside className="w-72 bg-white/20 backdrop-blur-[40px] border-r border-white/40 shadow-[10px_0_30px_-10px_rgba(0,0,0,0.1)] flex flex-col z-10 relative">
        <div className="px-8 py-8 border-b border-white/30">
          <div className="flex items-center gap-3">
            <svg className="w-8 h-8 text-[#2c2925]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span className="text-2xl font-bold tracking-wide text-[#2c2925] uppercase">Oculara</span>
          </div>
          <p className="text-xs font-medium text-[#5c728a] mt-2 tracking-widest uppercase">Espace Ophtalmologue</p>
        </div>

        <nav className="flex-1 py-8 px-4 flex flex-col gap-2">
          <button onClick={() => setActiveSection("equipe")}
            className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-200 ${activeSection === "equipe" ? "bg-white/40 text-[#2d2925] shadow-[inset_0_2px_4px_rgba(255,255,255,0.6),0_4px_12px_rgba(0,0,0,0.05)] border border-white/60" : "text-[#5c728a] hover:bg-white/20 hover:text-[#2d2925]"}`}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Mon équipe
          </button>

          <button onClick={() => setActiveSection("plages")}
            className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-200 ${activeSection === "plages" ? "bg-white/40 text-[#2d2925] shadow-[inset_0_2px_4px_rgba(255,255,255,0.6),0_4px_12px_rgba(0,0,0,0.05)] border border-white/60" : "text-[#5c728a] hover:bg-white/20 hover:text-[#2d2925]"}`}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Plages horaires
          </button>
        </nav>

        <div className="px-6 py-6 border-t border-white/30 bg-white/10">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#7fa2c4] to-[#eedecb] flex items-center justify-center border border-white/50 shadow-sm">
              <span className="text-white text-xs font-bold">{userInitials}</span>
            </div>
            <div>
              <p className="text-sm font-bold text-[#2d2925]">{currentUser ? `${currentUser.prenom} ${currentUser.nom}` : "Chargement..."}</p>
              <p className="text-[10px] uppercase tracking-wider text-[#5c728a]">Ophtalmologue</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-[#9b2c2c] bg-[#fff5f5]/50 hover:bg-[#ffe3e3]/70 border border-[#feb2b2]/50 rounded-xl transition-all duration-300 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
            </svg>
            Se déconnecter
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 h-screen overflow-auto relative z-10 p-6 md:p-10 flex flex-col">
        <div className="flex-1 bg-white/50 backdrop-blur-3xl border border-white/60 rounded-[2rem] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-6 md:p-8">

            {/* ── MON ÉQUIPE ── */}
            {activeSection === "equipe" && (
              <>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                  <div>
                    <h1 className="text-3xl font-serif font-bold text-[#2d2925] tracking-tight">Mon équipe</h1>
                    <p className="text-sm font-medium text-[#5c728a] mt-1">Gestion du personnel du cabinet</p>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => openAdd("secretaire")} className="flex items-center gap-2 px-5 py-2.5 bg-[#403c37] hover:bg-[#2d2925] text-white text-sm font-medium rounded-xl transition-all shadow-[0_8px_15px_-5px_rgba(64,60,55,0.4)] transform hover:-translate-y-0.5">
                      <span className="text-lg leading-none font-light">+</span> Secrétaire
                    </button>
                    <button onClick={() => openAdd("orthoptiste")} className="flex items-center gap-2 px-5 py-2.5 bg-[#403c37] hover:bg-[#2d2925] text-white text-sm font-medium rounded-xl transition-all shadow-[0_8px_15px_-5px_rgba(64,60,55,0.4)] transform hover:-translate-y-0.5">
                      <span className="text-lg leading-none font-light">+</span> Orthoptiste
                    </button>
                  </div>
                </div>
                {error && <div className="mb-6 p-4 bg-red-50/80 border border-red-200 text-red-700 text-sm rounded-xl">{error}</div>}
                {loading ? (
                  <div className="text-center py-20 text-[#5c728a] font-medium animate-pulse">Chargement de votre équipe...</div>
                ) : !error && (
                  <>
                    <div className="mb-10">
                      <div className="flex items-center gap-3 mb-4">
                        <h2 className="text-xl font-bold text-[#2d2925]">Secrétaires</h2>
                        <span className="px-2.5 py-0.5 rounded-full bg-white/60 border border-white/80 text-[#5c728a] text-sm font-bold shadow-sm">{secretaires.length}</span>
                      </div>
                      <StaffTable rows={secretaires} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <h2 className="text-xl font-bold text-[#2d2925]">Orthoptistes</h2>
                        <span className="px-2.5 py-0.5 rounded-full bg-white/60 border border-white/80 text-[#5c728a] text-sm font-bold shadow-sm">{orthoptistes.length}</span>
                      </div>
                      <StaffTable rows={orthoptistes} />
                    </div>
                  </>
                )}
              </>
            )}

            {/* ── PLAGES HORAIRES ── */}
            {activeSection === "plages" && (
              <>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                  <div>
                    <h1 className="text-3xl font-serif font-bold text-[#2d2925] tracking-tight">Plages horaires</h1>
                    <p className="text-sm font-medium text-[#5c728a] mt-1">Définissez vos disponibilités hebdomadaires</p>
                  </div>
                  <button onClick={openAddPlage}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#403c37] hover:bg-[#2d2925] text-white text-sm font-medium rounded-xl transition-all shadow-[0_8px_15px_-5px_rgba(64,60,55,0.4)] transform hover:-translate-y-0.5">
                    <span className="text-lg leading-none font-light">+</span> Nouvelle plage
                  </button>
                </div>

                {plagesError && <div className="mb-6 p-4 bg-red-50/80 border border-red-200 text-red-700 text-sm rounded-xl">{plagesError}</div>}

                {plagesLoading ? (
                  <div className="text-center py-20 text-[#5c728a] font-medium animate-pulse">Chargement des plages...</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {plagesParJour.map(({ jour, label, plages: joursPlages }) => (
                      <div key={jour} className="bg-white/60 backdrop-blur-md border border-white/60 rounded-[1.5rem] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] overflow-hidden">
                        <div className="px-5 py-4 border-b border-[#c1bdaf]/30 flex items-center justify-between bg-white/30">
                          <h3 className="font-bold text-[#2d2925] text-base">{label}</h3>
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${joursPlages.length > 0 ? "bg-emerald-100/80 text-emerald-700 border border-emerald-200" : "bg-gray-100/80 text-gray-500 border border-gray-200"}`}>
                            {joursPlages.length} plage{joursPlages.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                        <div className="p-4 flex flex-col gap-3">
                          {joursPlages.length === 0 ? (
                            <p className="text-center text-[#a8a59e] text-sm italic py-4">Aucune plage définie</p>
                          ) : joursPlages.map((plage) => (
                            <div key={plage.id} className="rounded-xl border px-4 py-3 bg-[#eef4fb]/60 border-[#b8d0e8]/50">
                              <div className="flex items-center gap-2">
                                <svg className="w-3.5 h-3.5 text-[#5c728a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-sm font-bold text-[#2d2925]">
                                  {String(plage.heure_debut).slice(0, 5)} – {String(plage.heure_fin).slice(0, 5)}
                                </span>
                              </div>
                              <p className="text-xs text-[#5c728a] mt-1">
                                Créneau : <strong>{plage.duree_creneau_min} min</strong>
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* MODAL STAFF */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editTarget ? "Modifier le membre" : "Ajouter un membre"}>
        <form onSubmit={handleSubmit} className="space-y-5">
          {formError && <div className="text-sm text-red-700 bg-red-50/80 border border-red-200 p-3 rounded-xl">{formError}</div>}
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-[#5c728a] pl-1">Rôle</label>
            <select name="role" value={form.role} onChange={handleChange} disabled={!!editTarget}
              className="w-full bg-white/50 border border-[#c1bdaf]/60 rounded-xl px-4 py-2.5 text-[#2d2925] focus:outline-none focus:ring-2 focus:ring-[#8a857a] transition-all disabled:opacity-60">
              <option value="secretaire">Secrétaire</option>
              <option value="orthoptiste">Orthoptiste</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-[#5c728a] pl-1">Nom <span className="text-red-500">*</span></label>
              <input name="nom" value={form.nom} onChange={handleChange} className="w-full bg-white/50 border border-[#c1bdaf]/60 rounded-xl px-4 py-2.5 text-[#2d2925] focus:outline-none focus:ring-2 focus:ring-[#8a857a] transition-all" />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-[#5c728a] pl-1">Prénom <span className="text-red-500">*</span></label>
              <input name="prenom" value={form.prenom} onChange={handleChange} className="w-full bg-white/50 border border-[#c1bdaf]/60 rounded-xl px-4 py-2.5 text-[#2d2925] focus:outline-none focus:ring-2 focus:ring-[#8a857a] transition-all" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-[#5c728a] pl-1">Email <span className="text-red-500">*</span></label>
            <input name="email" type="email" value={form.email} onChange={handleChange} className="w-full bg-white/50 border border-[#c1bdaf]/60 rounded-xl px-4 py-2.5 text-[#2d2925] focus:outline-none focus:ring-2 focus:ring-[#8a857a] transition-all" />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-[#5c728a] pl-1">
              Mot de passe {!editTarget ? <span className="text-red-500">*</span> : <span className="text-[#a8a59e] font-normal text-xs ml-1">(laisser vide = inchangé)</span>}
            </label>
            <input name="password" type="password" value={form.password} onChange={handleChange} className="w-full bg-white/50 border border-[#c1bdaf]/60 rounded-xl px-4 py-2.5 text-[#2d2925] focus:outline-none focus:ring-2 focus:ring-[#8a857a] transition-all" />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-[#c1bdaf]/30">
            <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-sm font-medium text-[#5c728a] bg-white/50 border border-[#c1bdaf]/60 rounded-xl hover:bg-white/80 transition-all">Annuler</button>
            <button type="submit" disabled={submitting} className="px-6 py-2.5 text-sm font-medium bg-[#403c37] hover:bg-[#2d2925] text-white rounded-xl disabled:opacity-50 transition-all shadow-[0_8px_15px_-5px_rgba(64,60,55,0.4)]">
              {submitting ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL PLAGE */}
      <Modal isOpen={showPlageModal} onClose={() => setShowPlageModal(false)} title="Nouvelle plage horaire">
        <form onSubmit={handlePlageSubmit} className="space-y-5">
          {plageFormError && <div className="text-sm text-red-700 bg-red-50/80 border border-red-200 p-3 rounded-xl">{plageFormError}</div>}

          <div className="space-y-1">
            <label className="block text-sm font-semibold text-[#5c728a] pl-1">Jour de la semaine</label>
            <select name="jour_semaine" value={plageForm.jour_semaine} onChange={handlePlageChange}
              className="w-full bg-white/50 border border-[#c1bdaf]/60 rounded-xl px-4 py-2.5 text-[#2d2925] focus:outline-none focus:ring-2 focus:ring-[#8a857a] transition-all">
              {JOURS.map((j, i) => (
                <option key={j} value={j}>{JOURS_LABELS[i]}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-[#5c728a] pl-1">Heure de début <span className="text-red-500">*</span></label>
              <input name="heure_debut" type="time" value={plageForm.heure_debut} onChange={handlePlageChange}
                className="w-full bg-white/50 border border-[#c1bdaf]/60 rounded-xl px-4 py-2.5 text-[#2d2925] focus:outline-none focus:ring-2 focus:ring-[#8a857a] transition-all" />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-[#5c728a] pl-1">Heure de fin <span className="text-red-500">*</span></label>
              <input name="heure_fin" type="time" value={plageForm.heure_fin} onChange={handlePlageChange}
                className="w-full bg-white/50 border border-[#c1bdaf]/60 rounded-xl px-4 py-2.5 text-[#2d2925] focus:outline-none focus:ring-2 focus:ring-[#8a857a] transition-all" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-semibold text-[#5c728a] pl-1">Durée d'un créneau (minutes) <span className="text-red-500">*</span></label>
            <input name="duree_creneau_min" type="number" min="5" max="120" step="5" value={plageForm.duree_creneau_min} onChange={handlePlageChange}
              className="w-full bg-white/50 border border-[#c1bdaf]/60 rounded-xl px-4 py-2.5 text-[#2d2925] focus:outline-none focus:ring-2 focus:ring-[#8a857a] transition-all" />
            <p className="text-xs text-[#a8a59e] pl-1">Entre 5 et 120 minutes</p>
          </div>

          {/* Estimation créneaux */}
          {plageForm.heure_debut && plageForm.heure_fin && plageForm.heure_debut < plageForm.heure_fin && (
            <div className="bg-[#eef4fb]/60 border border-[#b8d0e8]/50 rounded-xl px-4 py-3">
              <p className="text-xs text-[#5c728a] font-medium">
                ⏱ Estimation :{" "}
                <strong className="text-[#2d2925]">
                  {Math.floor(
                    (new Date(`2000-01-01T${plageForm.heure_fin}`) - new Date(`2000-01-01T${plageForm.heure_debut}`)) /
                    (1000 * 60 * plageForm.duree_creneau_min)
                  )} créneaux de {plageForm.duree_creneau_min} min
                </strong>
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-[#c1bdaf]/30">
            <button type="button" onClick={() => setShowPlageModal(false)} className="px-5 py-2.5 text-sm font-medium text-[#5c728a] bg-white/50 border border-[#c1bdaf]/60 rounded-xl hover:bg-white/80 transition-all">Annuler</button>
            <button type="submit" disabled={plageSubmitting} className="px-6 py-2.5 text-sm font-medium bg-[#403c37] hover:bg-[#2d2925] text-white rounded-xl disabled:opacity-50 transition-all shadow-[0_8px_15px_-5px_rgba(64,60,55,0.4)]">
              {plageSubmitting ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        message={`Supprimer ${deleteTarget?.prenom} ${deleteTarget?.nom} ?`} />
    </div>
  );
}
