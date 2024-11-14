import React from 'react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Clock, Users } from 'lucide-react';
import { Planning, TeamMember, HoraireCreneau } from '../../types/planning';

interface PlanningPreviewProps {
  planning: Planning;
  membres: TeamMember[];
  membreId?: string;
}

const PlanningPreview: React.FC<PlanningPreviewProps> = ({ planning, membres, membreId }) => {
  const formatCreneaux = (creneaux: HoraireCreneau[] = []): string => {
    if (!creneaux || creneaux.length === 0) return '-';
    return creneaux.map(c => `${c.debut} - ${c.fin}`).join(', ');
  };

  const calculerHeuresCreneau = (creneau: HoraireCreneau): number => {
    if (!creneau) return 0;
    const [debutH, debutM] = creneau.debut.split(':').map(Number);
    const [finH, finM] = creneau.fin.split(':').map(Number);
    return (finH + finM/60) - (debutH + debutM/60);
  };

  const calculerHeuresJour = (creneaux: HoraireCreneau[] = []): number => {
    if (!creneaux || creneaux.length === 0) return 0;
    return creneaux.reduce((acc, creneau) => acc + calculerHeuresCreneau(creneau), 0);
  };

  const calculerHeuresSemaine = (membreId: string): number => {
    if (!planning.jours) return 0;
    return planning.jours.reduce((acc, jour) => {
      const membreJour = jour.equipe.find(e => e.membreId === membreId);
      if (membreJour && membreJour.creneaux) {
        return acc + calculerHeuresJour(membreJour.creneaux);
      }
      return acc;
    }, 0);
  };

  const membre = membreId ? membres.find(m => m.id === membreId) : null;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {membre && (
        <div className="p-4 bg-indigo-50 border-b border-indigo-100">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-indigo-900">{membre.nom}</h3>
              <p className="text-sm text-indigo-600">{membre.role}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Heures hebdomadaires</p>
              <p className="text-lg font-semibold text-indigo-600">
                {calculerHeuresSemaine(membre.id).toFixed(1)}h
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Horaires
              </th>
              {!membreId && (
                <>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Équipe
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Taux présence
                  </th>
                </>
              )}
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Heures
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {planning.jours?.map((jour) => {
              const membreJour = membreId ? jour.equipe.find(e => e.membreId === membreId) : null;
              const estPresent = membreId ? !!membreJour : true;
              const heuresJour = membreJour 
                ? calculerHeuresJour(membreJour.creneaux)
                : 0;

              return (
                <tr 
                  key={jour.date}
                  className={`${
                    !estPresent ? 'bg-gray-50 text-gray-400' : 'hover:bg-gray-50'
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">
                        {format(parseISO(jour.date), 'EEEE', { locale: fr })}
                      </div>
                      <div className="text-gray-500">
                        {format(parseISO(jour.date), 'd MMMM yyyy', { locale: fr })}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {jour.horaires.ferme ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Fermé
                      </span>
                    ) : membreId ? (
                      membreJour ? (
                        <div className="text-sm text-gray-900">
                          {formatCreneaux(membreJour.creneaux)}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">Absent</span>
                      )
                    ) : (
                      <div className="text-sm text-gray-900">
                        {formatCreneaux(jour.horaires.creneaux)}
                      </div>
                    )}
                  </td>
                  {!membreId && (
                    <>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {jour.equipe.map(({ membreId }) => {
                            const membre = membres.find(m => m.id === membreId);
                            return membre ? (
                              <span
                                key={membre.id}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                              >
                                {membre.nom}
                              </span>
                            ) : null;
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-indigo-600 rounded-full h-2"
                              style={{ width: `${Math.round(jour.tauxPresence * 100)}%` }}
                            />
                          </div>
                          <span className="ml-2 text-sm text-gray-600">
                            {Math.round(jour.tauxPresence * 100)}%
                          </span>
                        </div>
                      </td>
                    </>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {estPresent && !jour.horaires.ferme ? (
                      <span className="font-medium text-indigo-600">
                        {heuresJour.toFixed(1)}h
                      </span>
                    ) : (
                      '-'
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
          {membreId && (
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan={2} className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Total des heures
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                  {calculerHeuresSemaine(membreId).toFixed(1)}h
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};

export default PlanningPreview;