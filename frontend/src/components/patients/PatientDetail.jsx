import React from "react";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  ShieldCheck,
  ClipboardList,
  X,
} from "lucide-react";

const Row = ({ icon: Icon, label, value }) =>
  value ? (
    <div className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
      <Icon size={15} className="text-blue-400 mt-0.5 shrink-0" />
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-medium text-gray-800">{value}</p>
      </div>
    </div>
  ) : null;

const formatDate = (d) => {
  if (!d) return null;
  return new Intl.DateTimeFormat("fr-FR").format(new Date(d + "T00:00:00"));
};

export default function PatientDetail({ patient, onClose, onEdit }) {
  if (!patient) return null;

  const fullName = `${patient.prenom} ${patient.nom}`;
  const initials = `${(patient.prenom || "?")[0]}${(patient.nom || "?")[0]}`.toUpperCase();

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between pb-3 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
            {initials}
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-800">{fullName}</h2>
            {patient.numero_dossier && (
              <p className="text-xs text-gray-400">N° {patient.numero_dossier}</p>
            )}
          </div>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X size={18} />
        </button>
      </div>

      <div className="bg-gray-50 rounded-lg p-3 space-y-0">
        <Row icon={Calendar} label="Date de naissance" value={formatDate(patient.date_naissance)} />
        <Row
          icon={User}
          label="Sexe"
          value={patient.sexe === "M" ? "Masculin" : patient.sexe === "F" ? "Féminin" : patient.sexe}
        />
        <Row icon={Phone} label="Téléphone" value={patient.telephone} />
        <Row icon={Mail} label="Email" value={patient.email} />
        <Row icon={MapPin} label="Adresse" value={patient.adresse} />
        <Row icon={ShieldCheck} label="Mutuelle" value={patient.mutuelle} />
      </div>

      {patient.antecedents && (
        <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <ClipboardList size={14} className="text-amber-600" />
            <p className="text-xs font-semibold text-amber-700">Antécédents médicaux</p>
          </div>
          <p className="text-sm text-amber-900 whitespace-pre-wrap">{patient.antecedents}</p>
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <button
          onClick={onEdit}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition"
        >
          Modifier
        </button>
        <button
          onClick={onClose}
          className="flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50 py-2 rounded-lg text-sm transition"
        >
          Fermer
        </button>
      </div>
    </div>
  );
}
