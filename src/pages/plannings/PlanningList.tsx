import React, { useState } from 'react';
import { Plus, Search, Calendar, Download, Trash2, Edit2, X, AlertCircle } from 'lucide-react';
import { useFirebaseCollection } from '../../hooks/useFirebase';
import { useFirebaseError } from '../../hooks/useFirebaseError';
import PlanningForm from './PlanningForm';
import DeleteConfirmationModal from '../../components/modals/DeleteConfirmationModal';
import { exportToPDF } from '../../utils/exportUtils';
import ExportMenu from '../../components/planning/ExportMenu';
import PlanningPreview from '../../components/planning/PlanningPreview';
import { Planning, TeamMember } from '../../types/planning';
import { firebaseService } from '../../services/firebaseService';

const PlanningList = () => {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlanning, setSelectedPlanning] = useState<Planning | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [editingPlanning, setEditingPlanning] = useState<Planning | null>(null);
  
  const { error, loading, handleFirebaseOperation } = useFirebaseError();
  const { data: plannings = [] } = useFirebaseCollection<Planning>('plannings');
  const { data: members = [] } = useFirebaseCollection<TeamMember>('team');

  const handleDelete = async (planningId: string) => {
    await handleFirebaseOperation(
      async () => {
        await firebaseService.deletePlanning(planningId);
        setShowDeleteModal(false);
        setSelectedPlanning(null);
      },
      'Erreur lors de la suppression du planning'
    );
  };

  const handleExport = async (planning: Planning, memberId?: string) => {
    await handleFirebaseOperation(
      async () => {
        await exportToPDF(planning, members, memberId);
      },
      'Erreur lors de l\'export du planning'
    );
  };

  const handlePreview = (planning: Planning, memberId?: string) => {
    setSelectedPlanning({
      ...planning,
      previewMemberId: memberId
    } as Planning);
    setShowPreview(true);
  };

  const handleEdit = (planning: Planning) => {
    setEditingPlanning(planning);
    setShowForm(true);
  };

  const filteredPlannings = plannings.filter(planning =>
    planning.nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-indigo-900">Plannings</h1>
          <p className="text-gray-600">Gérez vos plannings d'équipe</p>
        </div>
        <button 
          onClick={() => {
            setEditingPlanning(null);
            setShowForm(true);
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-indigo-700"
        >
          <Plus className="w-5 h-5" />
          <span>Nouveau Planning</span>
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-start">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher un planning..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Période</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Membres</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPlannings.map((planning) => (
                <tr key={planning.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 text-indigo-600 mr-2" />
                      <span className="text-sm font-medium text-gray-900">{planning.nom}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-500">
                      {new Date(planning.debut).toLocaleDateString()} - {new Date(planning.fin).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex -space-x-2">
                      {planning.membres.slice(0, 3).map((membreId) => {
                        const membre = members.find(m => m.id === membreId);
                        return membre ? (
                          <div
                            key={membre.id}
                            className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center border-2 border-white"
                            title={membre.nom}
                          >
                            <span className="text-xs font-medium text-indigo-600">
                              {membre.nom.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        ) : null;
                      })}
                      {planning.membres.length > 3 && (
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center border-2 border-white">
                          <span className="text-xs font-medium text-gray-600">
                            +{planning.membres.length - 3}
                          </span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      planning.statut === 'actif' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {planning.statut}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      <ExportMenu
                        planning={planning}
                        members={members}
                        onExport={(memberId) => handleExport(planning, memberId)}
                        onPreview={(memberId) => handlePreview(planning, memberId)}
                      />
                      <button
                        onClick={() => handleEdit(planning)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedPlanning(planning);
                          setShowDeleteModal(true);
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <PlanningForm
          members={members}
          onClose={() => {
            setShowForm(false);
            setEditingPlanning(null);
          }}
          planning={editingPlanning}
        />
      )}

      {showDeleteModal && selectedPlanning && (
        <DeleteConfirmationModal
          title="Supprimer le planning"
          message={`Êtes-vous sûr de vouloir supprimer le planning "${selectedPlanning.nom}" ?`}
          onConfirm={() => handleDelete(selectedPlanning.id)}
          onCancel={() => {
            setShowDeleteModal(false);
            setSelectedPlanning(null);
          }}
        />
      )}

      {showPreview && selectedPlanning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-indigo-900">
                  Aperçu du planning
                </h2>
                <button
                  onClick={() => {
                    setShowPreview(false);
                    setSelectedPlanning(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <PlanningPreview
                jours={selectedPlanning.jours}
                membres={members}
                membreId={selectedPlanning.previewMemberId}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanningList;