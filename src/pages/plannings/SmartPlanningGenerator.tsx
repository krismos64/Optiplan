import React, { useState, useEffect } from "react";
import { X, Calendar } from "lucide-react";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "../../config/firebase";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Membre {
  id: string;
  nom: string;
}

interface PlanningDay {
  date: string;
  membres: { id: string; creneaux: { debut: string; fin: string }[] }[];
}

interface ManualPlanningGeneratorProps {
  onClose: () => void;
}

const ManualPlanningGenerator: React.FC<ManualPlanningGeneratorProps> = ({
  onClose,
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [planningDays, setPlanningDays] = useState<PlanningDay[]>([]);
  const [membres, setMembres] = useState<Membre[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Chargement des membres de l'équipe depuis Firebase
  useEffect(() => {
    const loadMembres = async () => {
      try {
        const membresRef = collection(db, "team");
        const membresSnapshot = await getDocs(membresRef);
        const membresData = membresSnapshot.docs.map((doc) => ({
          id: doc.id,
          nom: doc.data().nom || "Nom inconnu", // Assurez-vous que 'nom' existe dans Firestore
        })) as Membre[]; // Utilisation du type Membre ici
        setMembres(membresData);
      } catch (error) {
        console.error("Erreur lors du chargement des membres:", error);
        setError("Erreur lors du chargement des membres");
      }
    };

    loadMembres();
  }, []);

  const handleAddDay = () => {
    const newDay: PlanningDay = {
      date: format(new Date(), "yyyy-MM-dd", { locale: fr }),
      membres: membres.map((membre) => ({
        id: membre.id,
        creneaux: [{ debut: "09:00", fin: "17:00" }],
      })),
    };
    setPlanningDays((prevDays) => [...prevDays, newDay]);
  };

  const handleCreneauChange = (
    dayIndex: number,
    membreId: string,
    creneauIndex: number,
    timeType: "debut" | "fin",
    value: string
  ) => {
    setPlanningDays((prevDays) => {
      const updatedDays = [...prevDays];
      const day = updatedDays[dayIndex];
      const membre = day.membres.find((m) => m.id === membreId);
      if (membre) {
        membre.creneaux[creneauIndex][timeType] = value;
      }
      return updatedDays;
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      const planningData = {
        nom: `Planning du ${format(new Date(), "dd/MM/yyyy", { locale: fr })}`,
        jours: planningDays,
        dateCreation: new Date().toISOString(),
      };

      await addDoc(collection(db, "plannings"), planningData);
      onClose();
    } catch (error: any) {
      console.error("Erreur lors de la sauvegarde du planning:", error);
      setError(
        error?.message || "Une erreur est survenue lors de la sauvegarde"
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl p-6">
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

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <button
            onClick={handleAddDay}
            className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            Ajouter une journée
          </button>

          {planningDays.map((day, dayIndex) => (
            <div key={dayIndex} className="border rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-gray-700 mb-2">
                {format(new Date(day.date), "EEEE d MMMM yyyy", { locale: fr })}
              </h3>
              {day.membres.map((membre) => (
                <div key={membre.id} className="mb-2">
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
              disabled={isSaving}
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center ${
                isSaving ? "opacity-75 cursor-not-allowed" : ""
              }`}
            >
              {isSaving ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Sauvegarde en cours...
                </>
              ) : (
                "Enregistrer le planning"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManualPlanningGenerator;
