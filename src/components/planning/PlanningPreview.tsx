import React from "react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

// Interface pour un membre de l'équipe
interface TeamMember {
  id: string;
  nom: string;
}

// Interface pour un créneau horaire
interface Creneau {
  debut: string;
  fin: string;
}

// Interface pour un jour de planning
interface PlanningJour {
  date: string;
  jourSemaine: string;
  horaires: {
    debut: string;
    fin: string;
    ferme: boolean;
  };
  equipe: {
    membreId: string;
    creneaux: Creneau[];
  }[];
}

// Props du composant PlanningPreview
interface PlanningPreviewProps {
  jours: PlanningJour[];
  membres: TeamMember[];
  membreId?: string;
}

const PlanningPreview: React.FC<PlanningPreviewProps> = ({
  jours,
  membres,
  membreId,
}) => {
  // Recherche du membre si membreId est fourni
  const membre = membreId ? membres.find((m) => m.id === membreId) : null;

  // Formatage des créneaux horaires
  const formatCreneaux = (creneaux: Creneau[]) => {
    return creneaux.map((c) => `${c.debut} - ${c.fin}`).join(", ");
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {membre && (
        <div className="p-4 bg-indigo-50 border-b border-indigo-100">
          <h3 className="text-lg font-semibold text-indigo-900">
            {membre.nom}
          </h3>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Horaires
              </th>
              {!membreId && (
                <>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Équipe
                  </th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {jours.map((jour) => {
              const membreJour = membreId
                ? jour.equipe.find((e) => e.membreId === membreId)
                : null;
              const estPresent = membreId ? !!membreJour : true;

              return (
                <tr
                  key={jour.date}
                  className={`${
                    !estPresent
                      ? "bg-gray-50 text-gray-400"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">
                        {format(parseISO(jour.date), "EEEE", { locale: fr })}
                      </div>
                      <div className="text-gray-500">
                        {format(parseISO(jour.date), "d MMMM yyyy", {
                          locale: fr,
                        })}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {jour.horaires.ferme ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Fermé
                      </span>
                    ) : membreId && membreJour ? (
                      <div className="text-sm text-gray-900">
                        {formatCreneaux(membreJour.creneaux)}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-900">
                        {jour.horaires.debut} - {jour.horaires.fin}
                      </div>
                    )}
                  </td>
                  {!membreId && (
                    <>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {jour.equipe.map(({ membreId }) => {
                            const membre = membres.find(
                              (m) => m.id === membreId
                            );
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
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PlanningPreview;
