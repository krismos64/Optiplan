import React, { useState } from 'react';
import { Save, Shield, Key } from 'lucide-react';
import { useFirebaseError } from '../../../hooks/useFirebaseError';
import { firebaseService } from '../../../services/firebaseService';

const SecuritySettings = () => {
  const [settings, setSettings] = useState({
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      expiryDays: 90
    },
    session: {
      timeout: 30,
      maxAttempts: 3,
      lockoutDuration: 15
    },
    twoFactor: {
      enabled: false,
      requiredForAdmins: true,
      requiredForManagers: false
    }
  });

  const { error, loading, handleFirebaseOperation } = useFirebaseError();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleFirebaseOperation(
      async () => {
        await firebaseService.updateSettings('security', settings);
      },
      'Erreur lors de la sauvegarde des paramètres de sécurité'
    );
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Paramètres de sécurité</h2>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Politique de mot de passe</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Longueur minimale
              </label>
              <input
                type="number"
                min="6"
                max="32"
                value={settings.passwordPolicy.minLength}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  passwordPolicy: { ...prev.passwordPolicy, minLength: parseInt(e.target.value) }
                }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="require-uppercase"
                checked={settings.passwordPolicy.requireUppercase}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  passwordPolicy: { ...prev.passwordPolicy, requireUppercase: e.target.checked }
                }))}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="require-uppercase" className="ml-2 block text-sm text-gray-900">
                Exiger des majuscules
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="require-numbers"
                checked={settings.passwordPolicy.requireNumbers}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  passwordPolicy: { ...prev.passwordPolicy, requireNumbers: e.target.checked }
                }))}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="require-numbers" className="ml-2 block text-sm text-gray-900">
                Exiger des chiffres
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="require-special"
                checked={settings.passwordPolicy.requireSpecialChars}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  passwordPolicy: { ...prev.passwordPolicy, requireSpecialChars: e.target.checked }
                }))}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="require-special" className="ml-2 block text-sm text-gray-900">
                Exiger des caractères spéciaux
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expiration du mot de passe (jours)
              </label>
              <input
                type="number"
                min="0"
                max="365"
                value={settings.passwordPolicy.expiryDays}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  passwordPolicy: { ...prev.passwordPolicy, expiryDays: parseInt(e.target.value) }
                }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Session</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Délai d'expiration (minutes)
              </label>
              <input
                type="number"
                min="5"
                max="240"
                value={settings.session.timeout}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  session: { ...prev.session, timeout: parseInt(e.target.value) }
                }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tentatives de connexion maximales
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={settings.session.maxAttempts}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  session: { ...prev.session, maxAttempts: parseInt(e.target.value) }
                }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Durée de verrouillage (minutes)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={settings.session.lockoutDuration}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  session: { ...prev.session, lockoutDuration: parseInt(e.target.value) }
                }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Authentification à deux facteurs</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-700">Activer l'authentification à deux facteurs</label>
              <div className="relative inline-block w-10 mr-2 align-middle select-none">
                <input
                  type="checkbox"
                  checked={settings.twoFactor.enabled}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    twoFactor: { ...prev.twoFactor, enabled: e.target.checked }
                  }))}
                  className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                />
                <label className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
              </div>
            </div>

            {settings.twoFactor.enabled && (
              <>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="required-admins"
                    checked={settings.twoFactor.requiredForAdmins}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      twoFactor: { ...prev.twoFactor, requiredForAdmins: e.target.checked }
                    }))}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="required-admins" className="ml-2 block text-sm text-gray-900">
                    Obligatoire pour les administrateurs
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="required-managers"
                    checked={settings.twoFactor.requiredForManagers}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      twoFactor: { ...prev.twoFactor, requiredForManagers: e.target.checked }
                    }))}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="required-managers" className="ml-2 block text-sm text-gray-900">
                    Obligatoire pour les managers
                  </label>
                </div>
              </>
            )}
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

export default SecuritySettings;