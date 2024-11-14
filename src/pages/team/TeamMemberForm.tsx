import React, { useState, useEffect } from 'react';
import { X, Plus, Clock, Calendar } from 'lucide-react';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

interface TeamMemberFormProps {
  member?: TeamMember | null;
  availableRoles: string[];
  onClose: () => void;
}

interface TeamMember {
  id: string;
  nom: string;
  role: string;
  heuresHebdo: number;
  statut: 'actif' | 'inactif';
  compteurHeures: number;
  preferences: {
    horaires: {
      debut: string;
      fin: string;
    };
    joursRepos: string[];
  };
  conges: {
    solde: number;
    pris: {
      debut: string;
      fin: string;
      type: 'conges' | 'maladie' | 'autre';
      description?: string;
    }[];
  };
}

const JOURS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];

const defaultFormData = {
  nom: '',
  role: '',
  heuresHebdo: 35,
  statut: 'actif' as const,
  compteurHeures: 0,
  preferences: {
    horaires: {
      debut: '09:00',
      fin: '17:00'
    },
    joursRepos: [] as string[]
  },
  conges: {
    solde: 25,
    pris: [] as {
      debut: string;
      fin: string;
      type: 'conges' | 'maladie' | 'autre';
      description?: string;
    }[]
  }
};

const TeamMemberForm: React.FC<TeamMemberFormProps> = ({ member, availableRoles, onClose }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newRole, setNewRole] = useState('');
  const [formData, setFormData] = useState(defaultFormData);

  useEffect(() => {
    if (member) {
      setFormData({
        ...defaultFormData,
        ...member,
        preferences: {
          ...defaultFormData.preferences,
          ...member.preferences
        },
        conges: {
          ...defaultFormData.conges,
          ...member.conges
        }
      });
    }
  }, [member]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (member) {
        await updateDoc(doc(db, 'team', member.id), formData);
      } else {
        await addDoc(collection(db, 'team'), formData);
      }
      onClose();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleJourReposToggle = (jour: string) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        joursRepos: prev.preferences.joursRepos.includes(jour)
          ? prev.preferences.joursRepos.filter(j => j !== jour)
          : [...prev.preferences.joursRepos, jour]
      }
    }));
  };

  const addNewRole = () => {
    if (newRole.trim() && !availableRoles.includes(newRole.trim())) {
      setFormData(prev => ({ ...prev, role: newRole.trim() }));
      setNewRole('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-indigo-900">
            {member ? 'Modifier le membre' : 'Ajouter un membre'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations générales */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom complet
              </label>
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rôle
              </label>
              <div className="flex space-x-2">
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option value="">Sélectionner un rôle</option>
                  {availableRoles.map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
              <div className="mt-2 flex space-x-2">
                <input
                  type="text"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  placeholder="Nouveau rôle..."
                  className="flex-1 p-2 border border-gray-300 rounded-lg text-sm"
                />
                <button
                  type="button"
                  onClick={addNewRole}
                  className="p-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Heures et compteur */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Heures hebdomadaires
              </label>
              <input
                type="number"
                name="heuresHebdo"
                value={formData.heuresHebdo}
                onChange={handleChange}
                min="0"
                max="50"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Compteur d'heures
              </label>
              <input
                type="number"
                name="compteurHeures"
                value={formData.compteurHeures}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                Positif = heures supplémentaires, Négatif = heures à rattraper
              </p>
            </div>
          </div>

          {/* Préférences horaires */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Préférences horaires</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Heure de début
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="time"
                    value={formData.preferences.horaires.debut}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      preferences: {
                        ...prev.preferences,
                        horaires: {
                          ...prev.preferences.horaires,
                          debut: e.target.value
                        }
                      }
                    }))}
                    className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Heure de fin
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="time"
                    value={formData.preferences.horaires.fin}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      preferences: {
                        ...prev.preferences,
                        horaires: {
                          ...prev.preferences.horaires,
                          fin: e.target.value
                        }
                      }
                    }))}
                    className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Jours de repos préférés */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jours de repos préférés
            </label>
            <div className="flex flex-wrap gap-2">
              {JOURS.map((jour) => (
                <button
                  key={jour}
                  type="button"
                  onClick={() => handleJourReposToggle(jour)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    formData.preferences.joursRepos.includes(jour)
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {jour.charAt(0).toUpperCase() + jour.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Statut */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Statut
            </label>
            <select
              name="statut"
              value={formData.statut}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="actif">Actif</option>
              <option value="inactif">Inactif</option>
            </select>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center ${
                isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Enregistrement...
                </>
              ) : (
                'Enregistrer'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeamMemberForm;