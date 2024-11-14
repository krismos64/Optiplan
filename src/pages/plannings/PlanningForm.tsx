import React, { useState } from 'react';
import { X, Calendar, AlertCircle } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { generatePlanning } from '../../services/planningGenerator';
import PlanningHoraires from '../../components/planning/PlanningHoraires';
import MemberSelection from '../../components/planning/MemberSelection';
import ManualPlanningList from './ManualPlanningList';
import PlanningPreview from '../../components/planning/PlanningPreview';
import PlanningStats from '../../components/planning/PlanningStats';

interface TeamMember {
  id: string;
  nom: string;
  role: string;
  heuresHebdo: number;
  preferences: {
    horaires: {
      debut: string;
      fin: string;
    };
    joursRepos: string[];
  };
}

interface PlanningFormProps {
  members: TeamMember[];
  onClose: () => void;
  planning?: any;
}

const defaultHoraires = {
  lundi: { debut: '09:00', fin: '17:00', ferme: false },
  mardi: { debut: '09:00', fin: '17:00', ferme: false },
  mercredi: { debut: '09:00', fin: '17:00', ferme: false },
  jeudi: { debut: '09:00', fin: '17:00', ferme: false },
  vendredi: { debut: '09:00', fin: '17:00', ferme: false },
  samedi: { debut: '09:00', fin: '17:00', ferme: false },
  dimanche: { debut: '09:00', fin: '17:00', ferme: false }
};

const PlanningForm: React.FC<PlanningFormProps> = ({ members, onClose, planning }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isManual, setIsManual] = useState(planning ? planning.isManual : false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    nom: planning?.nom || '',
    debut: planning?.debut || '',
    fin: planning?.fin || '',
    membresSelectionnes: planning?.membres || [],
    horaires: planning?.horaires || defaultHoraires
  });
  const [planningJours, setPlanningJours] = useState<any[]>(planning?.jours || []);
  const [previewData, setPreviewData] = useState<any[]>([]);

  const handleHoraireChange = (jour: string, type: 'debut' | 'fin', value: string) => {
    setFormData(prev => ({
      ...prev,
      horaires: {
        ...prev.horaires,
        [jour]: {
          ...prev.horaires[jour],
          [type]: value
        }
      }
    }));
  };

  const handleFermetureToggle = (jour: string) => {
    setFormData(prev => ({
      ...prev,
      horaires: {
        ...prev.horaires,
        [jour]: {
          ...prev.horaires[jour],
          ferme: !prev.horaires[jour].ferme
        }
      }
    }));
  };

  const handleAppliquerPartout = (jourSource: string) => {
    const horaireSource = formData.horaires[jourSource];
    const nouveauxHoraires = { ...formData.horaires };
    
    Object.keys(nouveauxHoraires).forEach(jour => {
      if (jour !== jourSource) {
        nouveauxHoraires[jour] = { ...horaireSource };
      }
    });

    setFormData(prev => ({
      ...prev,
      horaires: nouveauxHoraires
    }));
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

      case 3:
        if (isManual && (!planningJours || planningJours.length === 0)) {
          throw new Error('Le planning manuel est vide');
        }
        break;
    }
  };

  const handleNext = async () => {
    try {
      validateStep(currentStep);
      
      if (currentStep === 3 && !isManual) {
        // Générer l'aperçu du planning
        const membresActifs = members.filter(m => 
          formData.membresSelectionnes.includes(m.id)
        );

        const joursGeneres = await generatePlanning(
          formData.debut,
          formData.fin,
          membresActifs,
          formData.horaires
        );

        setPreviewData(joursGeneres);
      }

      setCurrentStep(prev => prev + 1);
      setError(null);
    } catch (error: any) {
      setError(error.message);
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
        nom: formData.nom.trim(),
        debut: formData.debut,
        fin: formData.fin,
        membres: formData.membresSelectionnes,
        horaires: formData.horaires,
        jours: isManual ? planningJours : previewData,
        isManual,
        statut: 'actif' as const,
        dateCreation: new Date().toISOString(),
        derniereMiseAJour: new Date().toISOString()
      };

      if (planning?.id) {
        // Mise à jour d'un planning existant
        await updateDoc(doc(db, 'plannings', planning.id), planningData);
      } else {
        // Création d'un nouveau planning
        await addDoc(collection(db, 'plannings'), planningData);
      }

      onClose();
    } catch (error: any) {
      console.error('Erreur lors de la création du planning:', error);
      setError(error.message || 'Une erreur est survenue lors de la création du planning');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-indigo-900">
                {planning ? 'Modifier le planning' : 'Nouveau Planning'}
              </h2>
              <p className="text-sm text-gray-500">Étape {currentStep} sur 4</p>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-start">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit}>
            {currentStep === 1 && (
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de génération
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setIsManual(false)}
                      className={`p-4 border rounded-lg text-left ${
                        !isManual 
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <h3 className="font-semibold mb-1">Automatique</h3>
                      <p className="text-sm text-gray-600">
                        Le système génère le planning en respectant les contraintes
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsManual(true)}
                      className={`p-4 border rounded-lg text-left ${
                        isManual 
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <h3 className="font-semibold mb-1">Manuel</h3>
                      <p className="text-sm text-gray-600">
                        Vous définissez les horaires et l'équipe jour par jour
                      </p>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <MemberSelection
                  members={members}
                  selectedMembers={formData.membresSelectionnes}
                  onMemberToggle={handleMemberToggle}
                  onSelectAll={handleSelectAllMembers}
                />

                {!isManual && (
                  <PlanningHoraires
                    horaires={formData.horaires}
                    onHoraireChange={handleHoraireChange}
                    onFermetureToggle={handleFermetureToggle}
                    onAppliquerPartout={handleAppliquerPartout}
                  />
                )}
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                {isManual ? (
                  <ManualPlanningList
                    debut={formData.debut}
                    fin={formData.fin}
                    membres={members.filter(m => formData.membresSelectionnes.includes(m.id))}
                    horairesDefaut={formData.horaires}
                    onSave={setPlanningJours}
                  />
                ) : (
                  previewData.length > 0 && (
                    <>
                      <PlanningPreview
                        jours={previewData}
                        membres={members}
                      />
                      <PlanningStats
                        jours={previewData}
                        membres={members}
                      />
                    </>
                  )
                )}
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Confirmation</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <dl className="grid grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Nom</dt>
                      <dd className="text-sm text-gray-900">{formData.nom}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Type</dt>
                      <dd className="text-sm text-gray-900">
                        {isManual ? 'Manuel' : 'Automatique'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Période</dt>
                      <dd className="text-sm text-gray-900">
                        Du {new Date(formData.debut).toLocaleDateString()} au{' '}
                        {new Date(formData.fin).toLocaleDateString()}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Membres</dt>
                      <dd className="text-sm text-gray-900">
                        {formData.membresSelectionnes.length} sélectionnés
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-between">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Retour
                </button>
              )}
              
              {currentStep < 4 ? (
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
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
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
    </div>
  );
};

export default PlanningForm;