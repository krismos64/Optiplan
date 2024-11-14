import React, { useState, useEffect } from 'react';
import { Plus, Search, Calendar, Download, Trash2, Edit2, X, AlertCircle, Eye } from 'lucide-react';
import { useFirebaseError } from '../../hooks/useFirebaseError';
import PlanningForm from './PlanningForm';
import DeleteConfirmationModal from '../../components/modals/DeleteConfirmationModal';
import { exportToPDF } from '../../utils/exportUtils';
import PlanningPreview from '../../components/planning/PlanningPreview';
import { firebaseService } from '../../services/firebaseService';

const PlanningList = () => {
  const [plannings, setPlannings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlanning, setSelectedPlanning] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [editingPlanning, setEditingPlanning] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const { error, handleFirebaseOperation } = useFirebaseError();

  useEffect(() => {
    const loadPlannings = async () => {
      try {
        setLoading(true);
        const result = await firebaseService.getPlannings();
        if (result) {
          setPlannings(result);
        }
      } catch (err) {
        console.error('Erreur lors du chargement des plannings:', err);
      } finally {
        setLoading(false);
      }
    };

    loadPlannings();
  }, []);

  const handleDelete = async (planningId) => {
    try {
      await handleFirebaseOperation(
        async () => {
          await firebaseService.deletePlanning(planningId);
          setPlannings(prev => prev.filter(p => p.id !== planningId));
          setShowDeleteModal(false);
          setSelectedPlanning(null);
        },
        'Erreur lors de la suppression du planning'
      );
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
    }
  };

  const handleExport = async (planning) => {
    try {
      await handleFirebaseOperation(
        async () => {
          await exportToPDF(planning);
        },
        'Erreur lors de l\'export du planning'
      );
    } catch (err) {
      console.error('Erreur lors de l\'export:', err);
    }
  };

  const handlePreview = (planning) => {
    setSelectedPlanning(planning);
    setShowPreview(true);
  };

  const filteredPlannings = plannings.filter(planning =>
    planning.nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && plannings.length === 0) {
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
                    <span className="text-sm text-gray-500">
                      {planning.membres?.length || 0} membre(s)
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => handlePreview(planning)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleExport(planning)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingPlanning(planning);
                          setShowForm(true);
                        }}
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
                jours={selectedPlanning.jours || []}
                membres={selectedPlanning.membres || []}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanningList;