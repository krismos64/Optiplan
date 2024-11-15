import React, { useState } from "react";
import { X, Calendar } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Membre {
  id: string;
  nom: string;
}

interface PlanningDay {
  date: string;
  membres: {
    id: string;
    nom: string;
    creneaux: { debut: string; fin: string }[];
  }[];
}

interface ManualPlanningGeneratorProps {
  membres: Membre[]; // Liste des membres disponibles
  onSave: (planning: {
    id: string;
    nom: string;
    debut: string;
    fin: string;
    membres: Membre[];
    jours: PlanningDay[];
  }) => void; // Fonction pour enregistrer le planning
  onClose: () => void; // Fonction pour fermer le générateur
}

const ManualPlanningGenerator: React.FC<ManualPlanningGeneratorProps> = ({
  membres,
  onSave,
  onClose,
}) => {
  const [planningDays, setPlanningDays] = useState<PlanningDay[]>([]);
  const [planningName, setPlanningName] = useState<string>("");

  const handleAddDay = () => {
    const newDay: PlanningDay = {
      date: format(new Date(), "yyyy-MM-dd", { locale: fr }),
      membres: membres.map((membre) => ({
        id: membre.id,
        nom: membre.nom,
        creneaux: [{ debut: "09:00", fin: "17:00" }],
      })),
    };
    setPlanningDays((prev) => [...prev, newDay]);
  };

  const handleCreneauChange = (
    dayIndex: number,
    membreId: string,
    creneauIndex: number,
    type: "debut" | "fin",
    value: string
  ) => {
    setPlanningDays((prev) => {
      const updatedDays = [...prev];
      const membre = updatedDays[dayIndex].membres.find(
        (m) => m.id === membreId
      );
      if (membre) {
        membre.creneaux[creneauIndex][type] = value;
      }
      return updatedDays;
    });
  };

  const handleSave = () => {
    if (!planningName) {
      alert("Veuillez entrer un nom pour le planning.");
      return;
    }

    const debut = planningDays.length
      ? planningDays[0].date
      : format(new Date(), "yyyy-MM-dd");
    const fin = planningDays.length
      ? planningDays[planningDays.length - 1].date
      : format(new Date(), "yyyy-MM-dd");

    const newPlanning = {
      id: `${Date.now()}`, // Génération d'un ID unique
      nom: planningName,
      debut,
      fin,
      membres,
      jours: planningDays,
    };

    onSave(newPlanning); // Retourne le planning complet à `PlanningList`
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-3xl p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
            <Calendar className="w-6 h-6 text-indigo-600" />
            <h2 className="text-2xl font-bold text-indigo-900">
              Création Manuelle de Planning
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Nom du planning"
            value={planningName}
            onChange={(e) => setPlanningName(e.target.value)}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />

          <button
            onClick={handleAddDay}
            className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            Ajouter une journée
          </button>

          {planningDays.map((day, dayIndex) => (
            <div key={dayIndex} className="border rounded-lg p-4">
              <h3 className="font-semibold text-gray-700 mb-2">
                {format(new Date(day.date), "EEEE d MMMM yyyy", { locale: fr })}
              </h3>
              {day.membres.map((membre) => (
                <div key={membre.id} className="mb-4">
                  <p className="text-sm font-medium text-gray-600">
                    {membre.nom}
                  </p>
                  {membre.creneaux.map((creneau, creneauIndex) => (
                    <div
                      key={creneauIndex}
                      className="flex items-center space-x-2 mt-2"
                    >
                      <label className="text-sm text-gray-500">Début :</label>
                      <input
                        type="time"
                        value={creneau.debut}
                        onChange={(e) =>
                          handleCreneauChange(
                            dayIndex,
                            membre.id,
                            creneauIndex,
                            "debut",
                            e.target.value
                          )
                        }
                        className="p-2 border rounded-lg"
                      />
                      <label className="text-sm text-gray-500">Fin :</label>
                      <input
                        type="time"
                        value={creneau.fin}
                        onChange={(e) =>
                          handleCreneauChange(
                            dayIndex,
                            membre.id,
                            creneauIndex,
                            "fin",
                            e.target.value
                          )
                        }
                        className="p-2 border rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManualPlanningGenerator;
