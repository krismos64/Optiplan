import React from 'react';
import { Clock } from 'lucide-react';

interface PlanningHorairesProps {
  horaires: {
    [jour: string]: {
      debut: string;
      fin: string;
      ferme: boolean;
    };
  };
  onHoraireChange: (jour: string, type: 'debut' | 'fin', value: string) => void;
  onFermetureToggle: (jour: string) => void;
  onAppliquerPartout: (jour: string) => void;
}

const PlanningHoraires: React.FC<PlanningHorairesProps> = ({
  horaires,
  onHoraireChange,
  onFermetureToggle,
  onAppliquerPartout
}) => {
  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">Horaires par défaut</h3>
      <div className="space-y-4">
        {Object.entries(horaires).map(([jour, horaire]) => (
          <div key={jour} className="flex items-center space-x-4">
            <span className="w-24 text-sm font-medium text-gray-700">
              {jour.charAt(0).toUpperCase() + jour.slice(1)}
            </span>
            
            {!horaire.ferme ? (
              <>
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <input
                    type="time"
                    value={horaire.debut}
                    onChange={(e) => onHoraireChange(jour, 'debut', e.target.value)}
                    className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <span>-</span>
                  <input
                    type="time"
                    value={horaire.fin}
                    onChange={(e) => onHoraireChange(jour, 'fin', e.target.value)}
                    className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => onAppliquerPartout(jour)}
                  className="text-sm text-indigo-600 hover:text-indigo-800"
                >
                  Appliquer à tous
                </button>
              </>
            ) : (
              <span className="text-red-600 text-sm">Fermé</span>
            )}
            
            <button
              type="button"
              onClick={() => onFermetureToggle(jour)}
              className={`px-3 py-1 rounded text-sm ${
                horaire.ferme
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {horaire.ferme ? 'Rouvrir' : 'Fermer'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlanningHoraires;