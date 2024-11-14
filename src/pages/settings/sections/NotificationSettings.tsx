import React, { useState } from 'react';
import { Save, Bell } from 'lucide-react';
import { useFirebaseError } from '../../../hooks/useFirebaseError';
import { settingsService } from '../../../services/settingsService';

const NotificationSettings = () => {
  const [settings, setSettings] = useState({
    email: {
      enabled: true,
      planningChanges: true,
      newSchedule: true,
      teamUpdates: true,
      dailyRecap: false
    },
    push: {
      enabled: true,
      planningChanges: true,
      newSchedule: true,
      teamUpdates: false,
      dailyRecap: false
    },
    advance: {
      planningReminder: 24,
      shiftReminder: 2
    }
  });

  const { error, loading, handleFirebaseOperation } = useFirebaseError();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleFirebaseOperation(
      async () => {
        await settingsService.updateSettings('notifications', settings);
      },
      'Erreur lors de la sauvegarde des paramètres de notification'
    );
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Paramètres de notification</h2>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Notifications par email</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-700">Activer les notifications par email</label>
              <div className="relative inline-block w-10 mr-2 align-middle select-none">
                <input
                  type="checkbox"
                  checked={settings.email.enabled}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    email: { ...prev.email, enabled: e.target.checked }
                  }))}
                  className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                />
                <label className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
              </div>
            </div>

            {settings.email.enabled && (
              <div className="ml-4 space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="email-planning-changes"
                    checked={settings.email.planningChanges}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      email: { ...prev.email, planningChanges: e.target.checked }
                    }))}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="email-planning-changes" className="ml-2 block text-sm text-gray-900">
                    Modifications du planning
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="email-new-schedule"
                    checked={settings.email.newSchedule}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      email: { ...prev.email, newSchedule: e.target.checked }
                    }))}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="email-new-schedule" className="ml-2 block text-sm text-gray-900">
                    Nouveau planning disponible
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="email-team-updates"
                    checked={settings.email.teamUpdates}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      email: { ...prev.email, teamUpdates: e.target.checked }
                    }))}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="email-team-updates" className="ml-2 block text-sm text-gray-900">
                    Mises à jour de l'équipe
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="email-daily-recap"
                    checked={settings.email.dailyRecap}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      email: { ...prev.email, dailyRecap: e.target.checked }
                    }))}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="email-daily-recap" className="ml-2 block text-sm text-gray-900">
                    Récapitulatif quotidien
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Notifications push</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-700">Activer les notifications push</label>
              <div className="relative inline-block w-10 mr-2 align-middle select-none">
                <input
                  type="checkbox"
                  checked={settings.push.enabled}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    push: { ...prev.push, enabled: e.target.checked }
                  }))}
                  className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                />
                <label className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
              </div>
            </div>

            {settings.push.enabled && (
              <div className="ml-4 space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="push-planning-changes"
                    checked={settings.push.planningChanges}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      push: { ...prev.push, planningChanges: e.target.checked }
                    }))}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="push-planning-changes" className="ml-2 block text-sm text-gray-900">
                    Modifications du planning
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="push-new-schedule"
                    checked={settings.push.newSchedule}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      push: { ...prev.push, newSchedule: e.target.checked }
                    }))}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="push-new-schedule" className="ml-2 block text-sm text-gray-900">
                    Nouveau planning disponible
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="push-team-updates"
                    checked={settings.push.teamUpdates}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      push: { ...prev.push, teamUpdates: e.target.checked }
                    }))}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="push-team-updates" className="ml-2 block text-sm text-gray-900">
                    Mises à jour de l'équipe
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="push-daily-recap"
                    checked={settings.push.dailyRecap}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      push: { ...prev.push, dailyRecap: e.target.checked }
                    }))}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="push-daily-recap" className="ml-2 block text-sm text-gray-900">
                    Récapitulatif quotidien
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Rappels</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rappel de planning (heures à l'avance)
              </label>
              <input
                type="number"
                min="0"
                max="72"
                value={settings.advance.planningReminder}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  advance: { ...prev.advance, planningReminder: parseInt(e.target.value) }
                }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rappel de service (heures à l'avance)
              </label>
              <input
                type="number"
                min="0"
                max="24"
                value={settings.advance.shiftReminder}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  advance: { ...prev.advance, shiftReminder: parseInt(e.target.value) }
                }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
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

export default NotificationSettings;