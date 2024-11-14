import React from 'react';
import { Users, Clock, Calendar } from 'lucide-react';

interface PlanningStatsProps {
  jours: {
    equipe: string[];
    tauxPresence: number;
  }[];
  membres: {
    id: string;
    nom: string;
    heuresHebdo: number;
  }[];
}

const PlanningStats: React.FC<PlanningStatsProps> = ({ jours, membres }) => {
  const tauxPresenceMoyen = jours.reduce((acc, jour) => acc + jour.tauxPresence, 0) / jours.length;
  const joursParMembre = new Map<string, number>();

  jours.forEach(jour => {
    jour.equipe.forEach(membreId => {
      joursParMembre.set(membreId, (joursParMembre.get(membreId) || 0) + 1);
    });
  });

  const membresPlusPresents = Array.from(joursParMembre.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([membreId, jours]) => ({
      membre: membres.find(m => m.id === membreId)?.nom || 'Inconnu',
      jours
    }));

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistiques du planning</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-indigo-50 p-4 rounded-lg">
          <div className="flex items-center space-x-3">
            <Users className="w-6 h-6 text-indigo-600" />
            <div>
              <p className="text-sm text-gray-600">Taux de présence moyen</p>
              <p className="text-xl font-semibold text-indigo-600">
                {Math.round(tauxPresenceMoyen * 100)}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-indigo-50 p-4 rounded-lg">
          <div className="flex items-center space-x-3">
            <Calendar className="w-6 h-6 text-indigo-600" />
            <div>
              <p className="text-sm text-gray-600">Nombre de jours</p>
              <p className="text-xl font-semibold text-indigo-600">
                {jours.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-indigo-50 p-4 rounded-lg">
          <div className="flex items-center space-x-3">
            <Clock className="w-6 h-6 text-indigo-600" />
            <div>
              <p className="text-sm text-gray-600">Membres les plus présents</p>
              <div className="text-sm text-indigo-600">
                {membresPlusPresents.map((item, index) => (
                  <p key={index}>
                    {item.membre}: {item.jours} jours
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanningStats;