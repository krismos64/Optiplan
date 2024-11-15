import React, { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { X } from "lucide-react";
import type { TeamMember, PlanningJour } from "../../types/planning";

interface PlanningPreviewProps {
  jours: PlanningJour[];
  membres: TeamMember[];
  onClose: () => void;
  membreId?: string;
}

const PlanningPreview: React.FC<PlanningPreviewProps> = ({
  jours,
  membres,
  onClose,
  membreId,
}) => {
  const [selectedMembre, setSelectedMembre] = useState<TeamMember | null>(null);

  useEffect(() => {
    if (membreId) {
      const membre = membres.find((m) => m.id === membreId) || null;
      setSelectedMembre(membre);
    } else {
      setSelectedMembre(null);
    }
  }, [membreId, membres]);

  const formatCreneaux = (creneaux: { debut: string; fin: string }[]) => {
    return creneaux.map((c) => `${c.debut} - ${c.fin}`).join(", ");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-indigo-900">
            {selectedMembre
              ? `Planning de ${selectedMembre.nom}`
              : "Planning d'équipe"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2"
            aria-label="Fermer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Équipe
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {jours.map((jour) => {
                const membresSelectionnes = membreId
                  ? jour.equipe.filter((e) => e.membreId === membreId)
                  : jour.equipe;

                return (
                  <tr key={jour.date} className="hover:bg-gray-50">
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
                      {membreId && membresSelectionnes.length > 0 ? (
                        <div className="text-sm text-gray-900">
                          {formatCreneaux(membresSelectionnes[0].creneaux)}
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {membresSelectionnes.map((equipeMembre) => {
                            const membre = membres.find(
                              (m) => m.id === equipeMembre.membreId
                            );
                            return membre &&
                              equipeMembre.creneaux.length > 0 ? (
                              <div
                                key={equipeMembre.membreId}
                                className="text-sm text-gray-900"
                              >
                                <span className="font-medium">
                                  {membre.nom}:
                                </span>{" "}
                                {formatCreneaux(equipeMembre.creneaux)}
                              </div>
                            ) : null;
                          })}
                        </div>
                      )}
                    </td>
                    {!membreId && (
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {membresSelectionnes.map(({ membreId }) => {
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
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PlanningPreview;
