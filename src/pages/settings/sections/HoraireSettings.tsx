import React, { useState } from 'react';
import { Save } from 'lucide-react';
import { useFirebaseError } from '../../../hooks/useFirebaseError';
import { firebaseService } from '../../../services/firebaseService';
import CreneauHoraire from '../../../components/planning/CreneauHoraire';

const JOURS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];

const HoraireSettings = () => {
  const [horaires, setHoraires] = useState({
    lundi: { creneaux: [{ debut: '08:30', fin: '20:15' }], ferme: false },
    mardi: { creneaux: [{ debut: '08:30', fin: '20:15' }], ferme: false },
    mercredi: { creneaux: [{ debut: '08:30', fin: '20:15' }], ferme: false },
    jeudi: { creneaux: [{ debut: '08:30', fin: '20:15' }], ferme: false },
    vendredi: { creneaux: [{ debut: '08:30', fin: '20:15' }], ferme: false },
    samedi: { creneaux: [{ debut: '08:30', fin: '20:15' }], ferme: false },
    dimanche: { creneaux: [{ debut: '08:45', fin: '12:30' }], ferme: false }
  });

  const { error, loading, handleFirebaseOperation } = useFirebaseError();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleFirebaseOperation(
      async () => {
        await firebaseService.updateSettings('horaires', horaires);
      },
      'Erreur lors de la sauvegarde des horaires'
    );
  };

  const handleFermetureToggle = (jour: string) => {
    setHoraires(prev => ({
      ...prev,
      [jour]: {
        ...prev[jour],
        ferme: !prev[jour].ferme
      }
    }));
  };

  const handleCreneauxChange = (jour: string, creneaux: any[]) => {
    setHoraires(prev => ({
      ...prev,
      [jour]: {
        ...prev[jour],
        creneaux
      }
    }));
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Horaires par défaut</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {JOURS.map(jour => (
          <div key={jour} className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 capitalize">{jour}</h3>
              <button
                type="button"
                onClick={() => handleFermetureToggle(jour)}
                className={`px-3 py-1 rounded-lg text-sm font-medium ${
                  horaires[jour].ferme
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                {horaires[jour].ferme ? 'Fermé' : 'Ouvert'}
              </button>
            </div>

            {!horaires[jour].ferme && (
              <CreneauHoraire
                creneaux={horaires[jour].creneaux}
                onChange={(creneaux) => handleCreneauxChange(jour, creneaux)}
                minCreneaux={1}
                maxCreneaux={3}
              />
            )}
          </div>
        ))}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Enregistrer
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default HoraireSettings;