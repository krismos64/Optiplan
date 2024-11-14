import React, { useState, useEffect } from 'react';
import { format, eachDayOfInterval, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Clock, Users, AlertCircle } from 'lucide-react';
import CreneauHoraire from '../../components/planning/CreneauHoraire';
import { HoraireCreneau, TeamMember } from '../../types/planning';

interface ManualPlanningListProps {
  debut: string;
  fin: string;
  membres: TeamMember[];
  horairesDefaut: {
    [jour: string]: {
      debut: string;
      fin: string;
      ferme: boolean;
    };
  };
  onSave: (jours: any[]) => void;
}

interface JourPlanning {
  date: string;
  jourSemaine: string;
  horaires: {
    creneaux: HoraireCreneau[];
    ferme: boolean;
  };
  equipe: {
    membreId: string;
    creneaux: HoraireCreneau[];
  }[];
  tauxPresence: number;
}

const ManualPlanningList: React.FC<ManualPlanningListProps> = ({
  debut,
  fin,
  membres,
  horairesDefaut,
  onSave
}) => {
  const [jours, setJours] = useState<JourPlanning[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const dateRange = eachDayOfInterval({
        start: parseISO(debut),
        end: parseISO(fin)
      });

      const joursInitiaux = dateRange.map(date => {
        const jourSemaine = format(date, 'EEEE', { locale: fr }).toLowerCase();
        const horaireDefaut = horairesDefaut[jourSemaine];

        return {
          date: format(date, 'yyyy-MM-dd'),
          jourSemaine,
          horaires: {
            creneaux: horaireDefaut.ferme ? [] : [{
              debut: horaireDefaut.debut,
              fin: horaireDefaut.fin
            }],
            ferme: horaireDefaut.ferme
          },
          equipe: [],
          tauxPresence: 0
        };
      });

      setJours(joursInitiaux);
      onSave(joursInitiaux);
    } catch (err) {
      setError("Erreur lors de l'initialisation du planning");
      console.error(err);
    }
  }, [debut, fin, horairesDefaut]);

  const handleJourUpdate = (index: number, updates: Partial<JourPlanning>) => {
    const nouveauxJours = [...jours];
    nouveauxJours[index] = {
      ...nouveauxJours[index],
      ...updates,
      tauxPresence: updates.equipe 
        ? updates.equipe.length / membres.length 
        : nouveauxJours[index].tauxPresence
    };
    setJours(nouveauxJours);
    onSave(nouveauxJours);
  };

  const handleCreneauxChange = (index: number, creneaux: HoraireCreneau[]) => {
    handleJourUpdate(index, {
      horaires: {
        ...jours[index].horaires,
        creneaux
      }
    });
  };

  const handleFermetureToggle = (index: number) => {
    const jour = jours[index];
    handleJourUpdate(index, {
      horaires: {
        creneaux: [],
        ferme: !jour.horaires.ferme
      },
      equipe: []
    });
  };

  const handleMembreToggle = (jourIndex: number, membre: TeamMember, creneaux: HoraireCreneau[]) => {
    const jour = jours[jourIndex];
    const equipeExistante = [...jour.equipe];
    const membreIndex = equipeExistante.findIndex(e => e.membreId === membre.id);

    if (membreIndex >= 0) {
      equipeExistante.splice(membreIndex, 1);
    } else {
      equipeExistante.push({
        membreId: membre.id,
        creneaux
      });
    }

    handleJourUpdate(jourIndex, { equipe: equipeExistante });
  };

  if (error) {
    return (
      <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-h-[calc(100vh-300px)] overflow-y-auto">
      {jours.map((jour, index) => (
        <div key={jour.date} className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {format(parseISO(jour.date), 'EEEE d MMMM yyyy', { locale: fr })}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => handleFermetureToggle(index)}
              className={`px-3 py-1 rounded-lg text-sm font-medium ${
                jour.horaires.ferme
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {jour.horaires.ferme ? 'Rouvrir' : 'Fermer'}
            </button>
          </div>

          {!jour.horaires.ferme && (
            <>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Horaires d'ouverture
                </label>
                <CreneauHoraire
                  creneaux={jour.horaires.creneaux}
                  onChange={(creneaux) => handleCreneauxChange(index, creneaux)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Équipe du jour
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {membres.map((membre) => {
                    const estPresent = jour.equipe.some(e => e.membreId === membre.id);
                    return (
                      <div
                        key={membre.id}
                        className={`p-4 rounded-lg border ${
                          estPresent 
                            ? 'border-indigo-500 bg-indigo-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">{membre.nom}</h4>
                            <p className="text-sm text-gray-500">{membre.role}</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={estPresent}
                            onChange={() => handleMembreToggle(index, membre, jour.horaires.creneaux)}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                        </div>
                        {estPresent && (
                          <div className="mt-2">
                            <CreneauHoraire
                              creneaux={jour.equipe.find(e => e.membreId === membre.id)?.creneaux || []}
                              onChange={(creneaux) => handleMembreToggle(index, membre, creneaux)}
                              minCreneaux={1}
                              maxCreneaux={2}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                <span>
                  Taux de présence: {Math.round(jour.tauxPresence * 100)}%
                </span>
                <span>
                  {jour.equipe.length} membre{jour.equipe.length > 1 ? 's' : ''} présent{jour.equipe.length > 1 ? 's' : ''}
                </span>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default ManualPlanningList;