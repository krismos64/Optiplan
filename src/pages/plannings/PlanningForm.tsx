import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { collection, addDoc, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import MemberSelection from '../../components/planning/MemberSelection';
import ManualPlanningList from './ManualPlanningList';

interface PlanningFormProps {
  onClose: () => void;
  planning?: any;
}

const PlanningForm: React.FC<PlanningFormProps> = ({ onClose, planning }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [members, setMembers] = useState([]);
  const [formData, setFormData] = useState({
    nom: planning?.nom || '',
    debut: planning?.debut || '',
    fin: planning?.fin || '',
    membresSelectionnes: planning?.membres || []
  });
  const [planningJours, setPlanningJours] = useState(planning?.jours || []);

  useEffect(() => {
    const loadMembers = async () => {
      try {
        const membersRef = collection(db, 'team');
        const snapshot = await getDocs(membersRef);
        const membersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setMembers(membersData);
      } catch (err) {
        console.error('Erreur lors du chargement des membres:', err);
        setError('Erreur lors du chargement des membres');
      }
    };

    loadMembers();
  }, []);

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        if (!formData.nom.trim()) {
          throw new Error('Le nom du planning est requis');
        }
        if (!formData.debut || !formData.fin) {
          throw new Error('Les dates de début et de fin sont requises');
        }
        const dateDebut = new Date(formData.debut);
        const dateFin = new Date(formData.fin);
        if (dateFin < dateDebut) {
          throw new Error('La date de fin doit être postérieure à la date de début');
        }
        break;

      case 2:
        if (formData.membresSelectionnes.length === 0) {
          throw new Error('Veuillez sélectionner au moins un membre');
        }
        break;
    }
  };

  const handleNext = () => {
    try {
      validateStep(currentStep);
      setCurrentStep(prev => prev + 1);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const planningData = {
        nom: formData.nom,
        debut: formData.debut,
        fin: formData.fin,
        membres: formData.membresSelectionnes,
        jours: planningJours,
        dateCreation: new Date().toISOString(),
        derniereMiseAJour: new Date().toISOString()
      };

      if (planning?.id) {
        await updateDoc(doc(db, 'plannings', planning.id), planningData);
      } else {
        await addDoc(collection(db, 'plannings'), planningData);
      }

      onClose();
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMemberToggle = (memberId: string, selected: boolean) => {
    setFormData(prev => ({
      ...prev,
      membresSelectionnes: selected
        ? [...prev.membresSelectionnes, memberId]
        : prev.membresSelectionnes.filter(id => id !== memberId)
    }));
  };

  const handleSelectAllMembers = () => {
    setFormData(prev => ({
      ...prev,
      membresSelectionnes: 
        prev.membresSelectionnes.length === members.length 
          ? [] 
          : members.map(m => m.id)
    }));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom du planning
              </label>
              <input
                type="text"
                value={formData.nom}
                onChange={(e) => setFormData(prev => ({ ...prev, nom: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de début
                </label>
                <input
                  type="date"
                  value={formData.debut}
                  onChange={(e) => setFormData(prev => ({ ...prev, debut: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de fin
                </label>
                <input
                  type="date"
                  value={formData.fin}
                  onChange={(e) => setFormData(prev => ({ ...prev, fin: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <MemberSelection
            members={members}
            selectedMembers={formData.membresSelectionnes}
            onMemberToggle={handleMemberToggle}
            onSelectAll={handleSelectAllMembers}
          />
        );

      case 3:
        return (
          <ManualPlanningList
            debut={formData.debut}
            fin={formData.fin}
            membres={members.filter(m => formData.membresSelectionnes.includes(m.id))}
            onSave={setPlanningJours}
            initialJours={planningJours}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-indigo-900">
              {planning ? 'Modifier le planning' : 'Nouveau Planning'}
            </h2>
            <p className="text-sm text-gray-500">Étape {currentStep} sur 3</p>
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

        <form onSubmit={handleSubmit}>
          {renderStepContent()}

          <div className="mt-8 flex justify-between">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Retour
              </button>
            )}

            {currentStep < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="ml-auto px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Suivant
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className={`ml-auto px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center ${
                  isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Enregistrement...
                  </>
                ) : (
                  'Enregistrer le planning'
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default PlanningForm;