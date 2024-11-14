import React, { useState } from 'react';
import { X, Calendar } from 'lucide-react';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { generatePlanning } from '../../services/planningGenerator';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface SmartPlanningGeneratorProps {
  onClose: () => void;
  equipes: string[];
}

interface GenerationParams {
  nombreSemaines: number;
  contraintesSpecifiques: string[];
}

const defaultHoraires = {
  lundi: { debut: '08:30', fin: '20:15', ferme: false },
  mardi: { debut: '08:30', fin: '20:15', ferme: false },
  mercredi: { debut: '08:30', fin: '20:15', ferme: false },
  jeudi: { debut: '08:30', fin: '20:15', ferme: false },
  vendredi: { debut: '08:30', fin: '20:15', ferme: false },
  samedi: { debut: '08:30', fin: '20:15', ferme: false },
  dimanche: { debut: '08:45', fin: '12:30', ferme: false }
};

const SmartPlanningGenerator: React.FC<SmartPlanningGeneratorProps> = ({ onClose }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [params, setParams] = useState<GenerationParams>({
    nombreSemaines: 4,
    contraintesSpecifiques: []
  });
  const [contrainte, setContrainte] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleAddContrainte = () => {
    if (contrainte.trim()) {
      setParams(prev => ({
        ...prev,
        contraintesSpecifiques: [...prev.contraintesSpecifiques, contrainte.trim()]
      }));
      setContrainte('');
    }
  };

  const handleRemoveContrainte = (index: number) => {
    setParams(prev => ({
      ...prev,
      contraintesSpecifiques: prev.contraintesSpecifiques.filter((_, i) => i !== index)
    }));
  };

  const genererPlanning = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const dateDebut = new Date();
      const dateFin = new Date();
      dateFin.setDate(dateFin.getDate() + params.nombreSemaines * 7);

      // Récupérer les membres de l'équipe depuis Firestore
      const membresRef = collection(db, 'team');
      const membresSnapshot = await getDocs(membresRef);
      const membres = membresSnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(membre => membre.statut === 'actif'); // Ne prendre que les membres actifs

      if (membres.length === 0) {
        throw new Error('Aucun membre actif dans l\'équipe');
      }

      // Générer le planning
      const planningGenere = generatePlanning(
        dateDebut.toISOString(),
        dateFin.toISOString(),
        membres,
        defaultHoraires
      );

      const planningData = {
        nom: `Planning du ${format(dateDebut, 'dd/MM/yyyy', { locale: fr })}`,
        debut: dateDebut.toISOString(),
        fin: dateFin.toISOString(),
        statut: 'en_attente' as const,
        derniereMiseAJour: new Date().toISOString(),
        contraintesAppliquees: params.contraintesSpecifiques,
        horaires: defaultHoraires,
        membres: membres.map(m => m.id),
        jours: planningGenere
      };

      await addDoc(collection(db, 'plannings'), planningData);
      onClose();
    } catch (error: any) {
      console.error('Erreur lors de la génération du planning:', error);
      setError(error.message || 'Une erreur est survenue lors de la génération du planning');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
            <Calendar className="w-6 h-6 text-indigo-600" />
            <h2 className="text-2xl font-bold text-indigo-900">
              Génération Automatique de Planning
            </h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de semaines à générer
            </label>
            <input
              type="number"
              value={params.nombreSemaines}
              onChange={(e) => setParams(prev => ({ ...prev, nombreSemaines: parseInt(e.target.value) }))}
              min="1"
              max="52"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contraintes spécifiques
            </label>
            <div className="flex space-x-2 mb-2">
              <input
                type="text"
                value={contrainte}
                onChange={(e) => setContrainte(e.target.value)}
                placeholder="Ajouter une contrainte..."
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <button
                onClick={handleAddContrainte}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Ajouter
              </button>
            </div>
            {params.contraintesSpecifiques.length > 0 && (
              <div className="mt-2 space-y-2">
                {params.contraintesSpecifiques.map((contrainte, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                    <span className="text-sm text-gray-700">{contrainte}</span>
                    <button
                      onClick={() => handleRemoveContrainte(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-indigo-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-indigo-900 mb-2">Le générateur prendra en compte :</h3>
            <ul className="list-disc list-inside text-sm text-indigo-700 space-y-1">
              <li>Les heures contractuelles de chaque membre</li>
              <li>Les préférences de jours de repos</li>
              <li>L'équilibre des rotations</li>
              <li>Les horaires par défaut définis</li>
              <li>Les contraintes spécifiques ajoutées</li>
            </ul>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              disabled={isGenerating}
            >
              Annuler
            </button>
            <button
              onClick={genererPlanning}
              disabled={isGenerating}
              className={`px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center space-x-2 ${
                isGenerating ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Génération en cours...
                </>
              ) : (
                <>
                  <Calendar className="w-5 h-5" />
                  <span>Générer le planning</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartPlanningGenerator;