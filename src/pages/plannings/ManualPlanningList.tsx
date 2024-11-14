import React, { useState, useEffect } from 'react';
import { format, eachDayOfInterval, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Clock } from 'lucide-react';

interface ManualPlanningListProps {
  debut: string;
  fin: string;
  membres: any[];
  onSave: (jours: any[]) => void;
  initialJours?: any[];
}

interface JourPlanning {
  date: string;
  jourSemaine: string;
  equipe: {
    membreId: string;
    creneaux: { debut: string; fin: string; }[];
    type?: 'travail' | 'repos' | 'conges' | 'absence';
  }[];
}

const ManualPlanningList: React.FC<ManualPlanningListProps> = ({
  debut,
  fin,
  membres,
  onSave,
  initialJours = []
}) => {
  const [jours, setJours] = useState<JourPlanning[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      if (initialJours.length > 0) {
        setJours(initialJours);
        return;
      }

      const dateRange = eachDayOfInterval({
        start: parseISO(debut),
        end: parseISO(fin)
      });

      const joursInitiaux = dateRange.map(date => ({
        date: format(date, 'yyyy-MM-dd'),
        jourSemaine: format(date, 'EEEE', { locale: fr }).toLowerCase(),
        equipe: membres.map(membre => ({
          membreId: membre.id,
          type: 'travail',
          creneaux: [{ debut: '09:00', fin: '17:00' }]
        }))
      }));

      setJours(joursInitiaux);
      onSave(joursInitiaux);
    } catch (err) {
      setError("Erreur lors de l'initialisation du planning");
      console.error(err);
    }
  }, [debut, fin, membres]);

  const handleMembreJourUpdate = (jourIndex: number, membreId: string, updates: any) => {
    const nouveauxJours = [...jours];
    const jour = nouveauxJours[jourIndex];
    const membreIndex = jour.equipe.findIndex(e => e.membreId === membreId);

    if (membreIndex >= 0) {
      jour.equipe[membreIndex] = {
        ...jour.equipe[membreIndex],
        ...updates
      };
    } else {
      jour.equipe.push({
        membreId,
        ...updates
      });
    }

    setJours(nouveauxJours);
    onSave(nouveauxJours);
  };

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  return (
    <div className="space-y-6 max-h-[calc(100vh-300px)] overflow-y-auto">
      {membres.map(membre => (
        <div key={membre.id} className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {membre.nom}
          </h3>

          <div className="space-y-4">
            {jours.map((jour, jourIndex) => (
              <div key={jour.date} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium text-gray-900">
                    {format(parseISO(jour.date), 'EEEE d MMMM', { locale: fr })}
                  </h4>
                  <select
                    value={jour.equipe.find(e => e.membreId === membre.id)?.type || 'travail'}
                    onChange={(e) => handleMembreJourUpdate(jourIndex, membre.id, {
                      type: e.target.value,
                      creneaux: e.target.value === 'travail' ? [{ debut: '09:00', fin: '17:00' }] : []
                    })}
                    className="p-2 border rounded-lg"
                  >
                    <option value="travail">Travail</option>
                    <option value="repos">Repos</option>
                    <option value="conges">Congés</option>
                    <option value="absence">Absence</option>
                  </select>
                </div>

                {jour.equipe.find(e => e.membreId === membre.id)?.type === 'travail' && (
                  <div className="space-y-2">
                    {jour.equipe
                      .find(e => e.membreId === membre.id)
                      ?.creneaux.map((creneau, creneauIndex) => (
                        <div key={creneauIndex} className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <input
                            type="time"
                            value={creneau.debut}
                            onChange={(e) => {
                              const nouveauxCreneaux = [...(jour.equipe.find(e => e.membreId === membre.id)?.creneaux || [])];
                              nouveauxCreneaux[creneauIndex] = {
                                ...nouveauxCreneaux[creneauIndex],
                                debut: e.target.value
                              };
                              handleMembreJourUpdate(jourIndex, membre.id, {
                                type: 'travail',
                                creneaux: nouveauxCreneaux
                              });
                            }}
                            className="p-2 border rounded-lg"
                          />
                          <span>-</span>
                          <input
                            type="time"
                            value={creneau.fin}
                            onChange={(e) => {
                              const nouveauxCreneaux = [...(jour.equipe.find(e => e.membreId === membre.id)?.creneaux || [])];
                              nouveauxCreneaux[creneauIndex] = {
                                ...nouveauxCreneaux[creneauIndex],
                                fin: e.target.value
                              };
                              handleMembreJourUpdate(jourIndex, membre.id, {
                                type: 'travail',
                                creneaux: nouveauxCreneaux
                              });
                            }}
                            className="p-2 border rounded-lg"
                          />
                          <button
                            onClick={() => {
                              const nouveauxCreneaux = [...(jour.equipe.find(e => e.membreId === membre.id)?.creneaux || [])];
                              nouveauxCreneaux.splice(creneauIndex, 1);
                              handleMembreJourUpdate(jourIndex, membre.id, {
                                type: 'travail',
                                creneaux: nouveauxCreneaux
                              });
                            }}
                            className="text-red-600 hover:text-red-800"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    <button
                      onClick={() => {
                        const nouveauxCreneaux = [...(jour.equipe.find(e => e.membreId === membre.id)?.creneaux || [])];
                        nouveauxCreneaux.push({ debut: '09:00', fin: '17:00' });
                        handleMembreJourUpdate(jourIndex, membre.id, {
                          type: 'travail',
                          creneaux: nouveauxCreneaux
                        });
                      }}
                      className="text-indigo-600 hover:text-indigo-800 text-sm"
                    >
                      + Ajouter un créneau
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ManualPlanningList;