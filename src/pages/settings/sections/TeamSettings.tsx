import React, { useState } from 'react';
import { Save, Users } from 'lucide-react';
import { useFirebaseError } from '../../../hooks/useFirebaseError';
import { firebaseService } from '../../../services/firebaseService';

const TeamSettings = () => {
  const [settings, setSettings] = useState({
    minPresence: 50,
    maxConsecutiveDays: 5,
    minRestDays: 1,
    roles: ['Manager', 'Employé', 'Stagiaire'],
    autoRotation: true,
    weekendBonus: 10
  });

  const { error, loading, handleFirebaseOperation } = useFirebaseError();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleFirebaseOperation(
      async () => {
        await firebaseService.updateSettings('team', settings);
      },
      'Erreur lors de la sauvegarde des paramètres d\'équipe'
    );
  };

  const handleRoleAdd = (role: string) => {
    if (role.trim() && !settings.roles.includes(role.trim())) {
      setSettings(prev => ({
        ...prev,
        roles: [...prev.roles, role.trim()]
      }));
    }
  };

  const handleRoleRemove = (index: number) => {
    setSettings(prev => ({
      ...prev,
      roles: prev.roles.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Paramètres d'équipe</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Présence minimum (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={settings.minPresence}
              onChange={(e) => setSettings(prev => ({ ...prev, minPresence: parseInt(e.target.value) }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jours consécutifs maximum
            </label>
            <input
              type="number"
              min="1"
              max="7"
              value={settings.maxConsecutiveDays}
              onChange={(e) => setSettings(prev => ({ ...prev, maxConsecutiveDays: parseInt(e.target.value) }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jours de repos minimum par semaine
            </label>
            <input
              type="number"
              min="1"
              max="7"
              value={settings.minRestDays}
              onChange={(e) => setSettings(prev => ({ ...prev, minRestDays: parseInt(e.target.value) }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bonus weekend (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={settings.weekendBonus}
              onChange={(e) => setSettings(prev => ({ ...prev, weekendBonus: parseInt(e.target.value) }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rôles disponibles
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {settings.roles.map((role, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-700"
              >
                {role}
                <button
                  type="button"
                  onClick={() => handleRoleRemove(index)}
                  className="ml-2 text-indigo-500 hover:text-indigo-700"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Nouveau rôle..."
              className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleRoleAdd(e.currentTarget.value);
                  e.currentTarget.value = '';
                }
              }}
            />
            <button
              type="button"
              onClick={() => {
                const input = document.querySelector('input[placeholder="Nouveau rôle..."]') as HTMLInputElement;
                handleRoleAdd(input.value);
                input.value = '';
              }}
              className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200"
            >
              Ajouter
            </button>
          </div>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="autoRotation"
            checked={settings.autoRotation}
            onChange={(e) => setSettings(prev => ({ ...prev, autoRotation: e.target.checked }))}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="autoRotation" className="ml-2 block text-sm text-gray-900">
            Activer la rotation automatique des équipes
          </label>
        </div>

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

export default TeamSettings;