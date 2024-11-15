import React, { useState, useEffect } from "react";
import { format, eachDayOfInterval, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { Clock, Plus, Trash } from "lucide-react";
import type {
  TeamMember,
  PlanningJour,
  HoraireCreneau,
} from "../../types/planning";

interface ManualPlanningListProps {
  debut: string;
  fin: string;
  membres: TeamMember[];
  onSave: (jours: PlanningJour[]) => void;
  initialJours?: PlanningJour[];
}

const ManualPlanningList: React.FC<ManualPlanningListProps> = ({
  debut,
  fin,
  membres,
  onSave,
  initialJours = [],
}) => {
  const [jours, setJours] = useState<PlanningJour[]>([]);

  useEffect(() => {
    if (initialJours.length > 0) {
      setJours(initialJours);
      return;
    }

    const dateRange = eachDayOfInterval({
      start: parseISO(debut),
      end: parseISO(fin),
    });

    const joursInitiaux: PlanningJour[] = dateRange.map((date) => ({
      date: format(date, "yyyy-MM-dd"),
      jourSemaine: format(date, "EEEE", { locale: fr }).toLowerCase(),
      horaires: {
        creneaux: [{ debut: "09:00", fin: "17:00" }],
        ferme: false,
      },
      equipe: membres.map((membre) => ({
        membreId: membre.id,
        creneaux: [{ debut: "09:00", fin: "17:00" }],
      })),
    }));

    setJours(joursInitiaux);
    onSave(joursInitiaux);
  }, [debut, fin, membres, initialJours, onSave]);

  const handleCreneauxChange = (
    jourIndex: number,
    membreId: string,
    nouveauxCreneaux: HoraireCreneau[]
  ) => {
    setJours((prevJours) => {
      const nouveauxJours = [...prevJours];
      const jour = nouveauxJours[jourIndex];
      const membreIndex = jour.equipe.findIndex((e) => e.membreId === membreId);

      if (membreIndex >= 0) {
        jour.equipe[membreIndex].creneaux = nouveauxCreneaux;
      } else {
        jour.equipe.push({
          membreId,
          creneaux: nouveauxCreneaux,
        });
      }

      onSave(nouveauxJours);
      return nouveauxJours;
    });
  };

  const handleSupprimerCreneau = (
    jourIndex: number,
    membreId: string,
    creneauIndex: number
  ) => {
    setJours((prevJours) => {
      const nouveauxJours = [...prevJours];
      const jour = nouveauxJours[jourIndex];
      const membreJour = jour.equipe.find((e) => e.membreId === membreId);

      if (membreJour && membreJour.creneaux.length > 1) {
        membreJour.creneaux = membreJour.creneaux.filter(
          (_, index) => index !== creneauIndex
        );
        onSave(nouveauxJours);
      }

      return nouveauxJours;
    });
  };

  const handleAjouterCreneau = (jourIndex: number, membreId: string) => {
    setJours((prevJours) => {
      const nouveauxJours = [...prevJours];
      const jour = nouveauxJours[jourIndex];
      const membreJour = jour.equipe.find((e) => e.membreId === membreId);

      if (membreJour) {
        membreJour.creneaux.push({ debut: "09:00", fin: "17:00" });
        onSave(nouveauxJours);
      }

      return nouveauxJours;
    });
  };

  return (
    <div className="space-y-6 max-h-[calc(100vh-300px)] overflow-y-auto">
      {membres.map((membre) => (
        <div key={membre.id} className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {membre.nom}
          </h3>

          <div className="space-y-4">
            {jours.map((jour, jourIndex) => {
              const membreJour = jour.equipe.find(
                (e) => e.membreId === membre.id
              );
              return (
                <div key={jour.date} className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-4">
                    {format(parseISO(jour.date), "EEEE d MMMM", { locale: fr })}
                  </h4>
                  <div className="space-y-2">
                    {(
                      membreJour?.creneaux || [{ debut: "09:00", fin: "17:00" }]
                    ).map((creneau, creneauIndex) => (
                      <div
                        key={creneauIndex}
                        className="flex items-center space-x-2"
                      >
                        <Clock className="w-4 h-4 text-gray-400" />
                        <input
                          type="time"
                          value={creneau.debut}
                          onChange={(e) => {
                            const nouveauxCreneaux = [
                              ...(membreJour?.creneaux || []),
                            ];
                            nouveauxCreneaux[creneauIndex] = {
                              ...nouveauxCreneaux[creneauIndex],
                              debut: e.target.value,
                            };
                            handleCreneauxChange(
                              jourIndex,
                              membre.id,
                              nouveauxCreneaux
                            );
                          }}
                          className="p-2 border rounded-lg"
                        />
                        <span>-</span>
                        <input
                          type="time"
                          value={creneau.fin}
                          onChange={(e) => {
                            const nouveauxCreneaux = [
                              ...(membreJour?.creneaux || []),
                            ];
                            nouveauxCreneaux[creneauIndex] = {
                              ...nouveauxCreneaux[creneauIndex],
                              fin: e.target.value,
                            };
                            handleCreneauxChange(
                              jourIndex,
                              membre.id,
                              nouveauxCreneaux
                            );
                          }}
                          className="p-2 border rounded-lg"
                        />
                        {membreJour &&
                          membreJour.creneaux &&
                          membreJour.creneaux.length > 1 && (
                            <button
                              type="button"
                              onClick={() =>
                                handleSupprimerCreneau(
                                  jourIndex,
                                  membre.id,
                                  creneauIndex
                                )
                              }
                              className="p-1 text-red-600 hover:text-red-800 rounded-full hover:bg-red-50"
                            >
                              <Trash className="w-4 h-4" />
                            </button>
                          )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => handleAjouterCreneau(jourIndex, membre.id)}
                      className="flex items-center space-x-1 text-sm text-indigo-600 hover:text-indigo-800"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Ajouter un créneau</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ManualPlanningList;
