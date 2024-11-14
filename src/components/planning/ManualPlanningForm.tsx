import React, { useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Clock, Calendar } from 'lucide-react';

interface ManualPlanningFormProps {
  jour: {
    date: string;
    jourSemaine: string;
    horaires: {
      debut: string;
      fin: string;
      ferme: boolean;
    };
    equipe: string[];
  };
  membres: {
    id: string;
    nom: string;
    role: string;
  }[];
  onUpdate: (jourModifie: any) => void;
}

const ManualPlanningForm: React.FC<ManualPlanningFormProps> = ({
  jour,
  membres,
  onUpdate
}) => {
  const [horaires, setHoraires] = useState(jour.horaires);
  const [equipeSelectionnee, setEquipeSelectionnee] = useState(jour.equipe);

  const handleHoraireChange = (type: 'debut' | 'fin', value: string) => {
    setHoraires(prev => ({
      ...prev,
      [type]: value
    }));
  };

  const handleFermetureToggle = () => {
    setHoraires(prev => ({
      ...prev,
      ferme: !prev.ferme
    }));
  };

  const handleMembreToggle = (membreId: string) => {
    setEquipeSelectionnee(prev => 
      prev.includes(membreId)
        ? prev.filter(id => id !== membreId)
        : [...prev, membreId]
    );
  };

  const handleSave = () => {
    onUpdate({
      ...jour,
      horaires,
      equipe: equipeSelectionnee,
      tauxPresence: equipeSelectionnee.length / membres.length
    });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {format(new Date(jour.date), 'EEEE d MMMM yyyy', { locale: fr })}
          </h3>
        </div>
        <div className="flex items-center space-x-4">
          {!horaires.ferme ? (
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-gray-400" />
              <input
                type="time"
                value={horaires.debut}
                onChange={(e) => handleHoraireChange('debut', e.target.value)}
                className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <span>-</span>
              <input
                type="time"
                value={horaires.fin}
                onChange={(e) => handleHoraireChange('fin', e.target.value)}
                className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          ) : (
            <span className="text-red-600 text-sm">Fermé</span>
          )}
          <button
            type="button"
            onClick={handleFermetureToggle}
            className={`px-3 py-1 rounded text-sm ${
              horaires.ferme
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {horaires.ferme ? 'Rouvrir' : 'Fermer'}
          </button>
        </div>
      </div>

      {!horaires.ferme && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Équipe du jour</h4>
          <div className="grid grid-cols-3 gap-2">
            {membres.map((membre) => (
              <label
                key={membre.id}
                className="flex items-center p-2 border rounded-lg hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={equipeSelectionnee.includes(membre.id)}
                  onChange={() => handleMembreToggle(membre.id)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">{membre.nom}</span>
              </label>
            ))}
          </div>
          <div className="mt-4 text-sm text-gray-500">
            Taux de présence: {Math.round((equipeSelectionnee.length / membres.length) * 100)}%
          </div>
        </div>
      )}

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          Enregistrer
        </button>
      </div>
    </div>
  );
};

export default ManualPlanningForm;