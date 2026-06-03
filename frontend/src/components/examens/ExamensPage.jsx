import React, { useEffect, useState } from "react";
import ExamenForm from "./ExamenForm";
import EditExamenForm from "./EditExamenForm";
import { examensAPI } from "./examenAPI";
import { importExamen, downloadExamensCSV } from "./examenImportAPI";
import { patientsAPI } from "../../../api";

export default function ExamensPage() {
  const [examens, setExamens] = useState([]);
  const [stats, setStats] = useState(null);
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [uploadingFile, setUploadingFile] = useState(false);

  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);

  const [showEdit, setShowEdit] = useState(false);
  const [selectedExamen, setSelectedExamen] = useState(null);

  const cabinet_id =
    JSON.parse(localStorage.getItem("user"))?.cabinet_id;

  // Fonction pour obtenir le nom du patient
  const getPatientName = (patientId) => {
    const patient = patients.find(p => p.id === patientId);
    if (patient) {
      return `${patient.prenom} ${patient.nom}`;
    }
    return "Patient inconnu";
  };

  // Filtrer les examens selon la recherche
  const filteredExamens = examens.filter((ex) => {
    const patientName = getPatientName(ex.patient_id).toLowerCase();
    const search = searchTerm.toLowerCase();
    return (
      patientName.includes(search) ||
      ex.type_examen.toLowerCase().includes(search) ||
      (ex.statut && ex.statut.toLowerCase().includes(search))
    );
  });

  const fetchPatients = async () => {
    try {
      const data = await patientsAPI.getMy();
      console.log("👥 Patients reçus du backend:", data);
      setPatients(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erreur lors du chargement des patients:", err);
      setPatients([]);
    }
  };

  const fetchExamens = async () => {
    setLoading(true);

    try {
      const data = await examensAPI.getAll(cabinet_id);
      console.log("📋 Examens reçus du backend:", data);
      if (data && data.length > 0) {
        console.log("📋 Premier examen (structure):", data[0]);
      }
      setExamens(data || []);

      const statsData =
        await examensAPI.getStats(cabinet_id);

      setStats(statsData);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);

    try {
      // Créer un formulaire pour les données de l'appareil
      const appareilNom = prompt("Nom de l'appareil (ex: Zeiss, Topcon):");
      if (!appareilNom) {
        alert("Import annulé");
        return;
      }

      const appareilSerie = prompt("Numéro de série de l'appareil:");
      const patientId = prompt("ID du patient:");

      if (!patientId) {
        alert("ID patient requis");
        return;
      }

      const typeExamen = prompt("Type d'examen (ex: OCT, Fond d'œil):", "OCT");

      // Lire le contenu du fichier
      const fileContent = await file.text();

      // Appeler l'endpoint d'import
      await importExamen(cabinet_id, {
        patient_id: patientId,
        type_examen: typeExamen,
        appareil_nom: appareilNom,
        appareil_serie: appareilSerie || "",
        resultats: fileContent,
        donnees_brutes: fileContent,
      });

      alert("✅ Examen importé avec succès !");
      await fetchPatients();
      await fetchExamens();
    } catch (err) {
      console.error("Erreur import:", err);
      alert(`❌ Erreur lors de l'import: ${err.message}`);
    } finally {
      setUploadingFile(false);
      e.target.value = "";
    }
  };

  const handleExportCSV = async () => {
    try {
      setUploadingFile(true);
      await downloadExamensCSV(cabinet_id);
      alert("✅ Export terminé !");
    } catch (err) {
      console.error("Erreur export:", err);
      alert(`❌ Erreur lors de l'export: ${err.message}`);
    } finally {
      setUploadingFile(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      // Charger les patients d'abord
      await fetchPatients();
      // Puis charger les examens
      await fetchExamens();
    };
    loadData();
  }, []);

  return (
    <div className="p-6 md:p-10">

      {/* HEADER */}

      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-serif font-bold text-[#2d2925]">
              Examens médicaux
            </h1>

            <p className="text-sm text-[#5c728a]">
              Gestion des examens du cabinet
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={async () => {

                const patient =
                  prompt("ID Patient");

                if (!patient) return;

                await examensAPI.simulate(
                  patient,
                  cabinet_id,
                  "OCT"
                );

                fetchExamens();

              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
            >
              Simuler OCT
            </button>

            <label className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition cursor-pointer">
              Importer
              <input
                type="file"
                accept=".pdf,.json,.csv,.txt"
                onChange={handleFileUpload}
                disabled={uploadingFile}
                className="hidden"
              />
            </label>

            <button
              onClick={handleExportCSV}
              disabled={uploadingFile}
              className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition disabled:opacity-50"
            >
              Exporter CSV
            </button>

            <button
              onClick={() => setShowForm(true)}
              className="px-5 py-2.5 bg-[#403c37] text-white rounded-xl hover:bg-[#2d2925] transition shadow"
            >
              + Nouvel examen
            </button>

          </div>
        </div>

        {/* BARRE DE RECHERCHE */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="🔍 Rechercher par patient, type d'examen ou statut..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white/60 focus:outline-none focus:ring-2 focus:ring-indigo-600"
          />
          {searchTerm && (
            <p className="text-sm text-gray-600 mt-2">
              {filteredExamens.length} résultat{filteredExamens.length !== 1 ? "s" : ""} trouvé{filteredExamens.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>

      {/* STATS */}

      {stats && (

        <div className="grid grid-cols-5 gap-4 mb-8">

          <div className="bg-white/60 backdrop-blur-md rounded-2xl p-4 shadow-sm">
            <p className="text-sm text-gray-500">
              Total
            </p>

            <h2 className="text-2xl font-bold">
              {stats.total}
            </h2>
          </div>

          <div className="bg-white/60 backdrop-blur-md rounded-2xl p-4 shadow-sm">
            <p className="text-sm text-gray-500">
              En attente
            </p>

            <h2 className="text-2xl font-bold">
              {stats.en_attente}
            </h2>
          </div>

          <div className="bg-white/60 backdrop-blur-md rounded-2xl p-4 shadow-sm">
            <p className="text-sm text-gray-500">
              Importés
            </p>

            <h2 className="text-2xl font-bold">
              {stats.importes}
            </h2>
          </div>

          <div className="bg-white/60 backdrop-blur-md rounded-2xl p-4 shadow-sm">
            <p className="text-sm text-gray-500">
              Vérifiés
            </p>

            <h2 className="text-2xl font-bold">
              {stats.verifies}
            </h2>
          </div>

          <div className="bg-white/60 backdrop-blur-md rounded-2xl p-4 shadow-sm">
            <p className="text-sm text-gray-500">
              Associés
            </p>

            <h2 className="text-2xl font-bold">
              {stats.associes}
            </h2>
          </div>

        </div>

      )}

      {/* LISTE */}

      {loading ? (

        <div className="text-center text-[#5c728a] py-20">
          Chargement...
        </div>

      ) : (

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

          {filteredExamens.map((ex) => (

            <div
              key={ex.id}
              className="bg-white/60 backdrop-blur-md border border-white/60 rounded-2xl p-5 shadow-sm"
            >

              <h3 className="font-bold text-[#2d2925]">
                {ex.type_examen}
              </h3>

              <p className="text-sm text-[#5c728a] mt-2">
                Patient :
                {" "}
                {getPatientName(ex.patient_id)}
              </p>

              <p className="text-sm text-[#5c728a]">
                Statut :
                {" "}
                {ex.statut}
              </p>

              <p className="text-xs mt-3 text-[#5c728a]">
                {new Date(
                  ex.date_examen
                ).toLocaleString()}
              </p>

              <div className="flex flex-wrap gap-2 mt-4">

                <button
                  onClick={() => {
                    setSelectedExamen(ex);
                    setShowEdit(true);
                  }}
                  className="px-3 py-1 bg-yellow-500 text-white rounded-lg"
                >
                  Modifier
                </button>

                <button
                  onClick={async () => {

                    if (
                      !window.confirm(
                        "Supprimer cet examen ?"
                      )
                    )
                      return;

                    await examensAPI.delete(
                      ex.id,
                      cabinet_id
                    );

                    fetchExamens();

                  }}
                  className="px-3 py-1 bg-red-600 text-white rounded-lg"
                >
                  Supprimer
                </button>

                {ex.statut === "verifie" && (

                  <button
                    onClick={async () => {

                      await examensAPI.associer(
                        ex.id,
                        cabinet_id
                      );

                      fetchExamens();

                    }}
                    className="px-3 py-1 bg-green-600 text-white rounded-lg"
                  >
                    Associer
                  </button>

                )}

              </div>

            </div>

          ))}

          {filteredExamens.length === 0 && !loading && (
            <div className="col-span-full text-center text-[#5c728a] py-20">
              {searchTerm ? "Aucun examen ne correspond à votre recherche" : "Aucun examen trouvé"}
            </div>
          )}

        </div>

      )}

      {/* MODAL AJOUT */}

      {showForm && (

        <ExamenForm
          cabinet_id={cabinet_id}
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false);
            fetchPatients();
            fetchExamens();
          }}
        />

      )}

      {/* MODAL MODIFICATION */}

      {showEdit && selectedExamen && (

        <EditExamenForm
          examen={selectedExamen}
          cabinet_id={cabinet_id}
          onClose={() => setShowEdit(false)}
          onSuccess={() => {
            setShowEdit(false);
            fetchPatients();
            fetchExamens();
          }}
        />

      )}

    </div>
  );
}