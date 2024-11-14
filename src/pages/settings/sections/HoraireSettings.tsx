import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { useFirebaseError } from '../../../hooks/useFirebaseError';
import { settingsService } from '../../../services/settingsService';

const JOURS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];

const defaultHoraires = {
  lundi: { debut: '08:30', fin: '20:00', ferme: false },
  mardi: { debut: '08:30', fin: '20:00', ferme: false },
  mercredi: { debut: '08:30', fin: '20:00', ferme: false },
  jeudi: { debut: '08:30', fin: '20:00', ferme: false },
  vendredi: { debut: '08:30', fin: '20:00', ferme: false },
  samedi: { debut: '08:30', fin: '20:00', ferme: false },
  dimanche: { debut: '08:45', fin: '12:30', ferme: false }
};

const HoraireSettings = () => {
  const [horaires, setHoraires] = useState(defaultHoraires);
  const { error, loading, handleFirebaseOperation } = useFirebaseError();

  useEffect(() => {
    const loadHoraires = async () => {
      try {
        const settings = await settingsService.getSettings('horaires');
        if (settings) {
          setHoraires(settings);
        }
      } catch (err) {
        console.error('Erreur lors du chargement des horaires:', err);
      }
    };

    loadHoraires();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleFirebaseOperation(
      async () => {
        await settingsService.updateSettings('horaires', {
          ...horaires,
          derniereMiseAJour: new Date().toISOString()
        });
      },
      'Erreur lors de la sauvegarde des horaires'
    );
  };

  const handleHoraireChange = (jour: string, type: 'debut' | 'fin', value: string) => {
    setHoraires(prev => ({
      ...prev,
      [jour]: {
        ...prev[jour],
        [type]: value
      }
    }));
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

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Horaires d'ouverture</h2>
      
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Heure d'ouverture
                  </label>
                  <input
                    type="time"
                    value={horaires[jour].debut}
                    onChange={(e) => handleHoraireChange(jour, 'debut', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Heure de fermeture
                  </label>
                  <input
                    type="time"
                    value={horaires[jour].fin}
                    onChange={(e) => handleHoraireChange(jour, 'fin', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
              </div>
            )}
          </div>
        ))}

        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
            {error}
          </div>
        )}

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