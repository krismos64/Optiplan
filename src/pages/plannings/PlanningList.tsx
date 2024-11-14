import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Calendar,
  Download,
  Trash2,
  Edit2,
  X,
  AlertCircle,
  Eye,
} from "lucide-react";
import { useFirebaseError } from "../../hooks/useFirebaseError";
import PlanningForm from "./PlanningForm";
import DeleteConfirmationModal from "../../components/modals/DeleteConfirmationModal";
import PlanningPreview from "../../components/planning/PlanningPreview";
import { firebaseService } from "../../services/firebaseService";

interface TeamMember {
  id: string;
  nom: string;
}

// Définir un type pour représenter un planning
interface Planning {
  id: string;
  nom: string;
  debut: string;
  fin: string;
  membres: TeamMember[];
  jours?: Array<any>;
}

const PlanningList = () => {
  const [plannings, setPlannings] = useState<Planning[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedPlanning, setSelectedPlanning] = useState<
    Planning | undefined
  >(undefined);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [editingPlanning, setEditingPlanning] = useState<Planning | undefined>(
    undefined
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [showForm, setShowForm] = useState<boolean>(false);

  const { error, handleFirebaseOperation } = useFirebaseError();

  useEffect(() => {
    const loadPlannings = async () => {
      setLoading(true);
      try {
        const result = await firebaseService.getPlannings();
        if (result) {
          setPlannings(result as Planning[]);
        }
      } catch (err) {
        console.error("Erreur lors du chargement des plannings:", err);
      } finally {
        setLoading(false);
      }
    };

    loadPlannings();
  }, []);

  const handleDelete = async (planningId: string) => {
    await handleFirebaseOperation(async () => {
      await firebaseService.deletePlanning(planningId);
      setPlannings((prev) => prev.filter((p) => p.id !== planningId));
      setShowDeleteModal(false);
      setSelectedPlanning(undefined);
    }, "Erreur lors de la suppression du planning");
  };
  function exportToPDF(nom: string, jours: Array<any>) {
    console.log("Export du planning:", nom);
    console.log("Nombre de jours:", jours.length); // Utilise `jours` pour éviter l'erreur
    // Logique d'export en PDF
  }

  const handleExport = async (planning: Planning) => {
    // Assurez-vous d'utiliser le bon nombre d'arguments requis pour exportToPDF
    await handleFirebaseOperation(async () => {
      await exportToPDF(
        planning?.nom || "Nom par défaut",
        planning.jours || []
      );

      alert("Planning exporté avec succès !");
    }, "Erreur lors de l'export du planning");
  };

  const handlePreview = (planning: Planning) => {
    setSelectedPlanning(planning);
    setShowPreview(true);
  };

  const filteredPlannings = plannings.filter((planning) =>
    planning.nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-indigo-900">Plannings</h1>
          <p className="text-gray-600">Gérez vos plannings d'équipe</p>
        </div>
        <button
          onClick={() => {
            setEditingPlanning(undefined);
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

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-500">Chargement des plannings...</p>
          </div>
        ) : plannings.length === 0 ? (
          <p className="text-gray-500">Aucun planning disponible.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nom
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Période
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Membres
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPlannings.map((planning) => (
                  <tr key={planning.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="w-5 h-5 text-indigo-600 mr-2" />
                        <span className="text-sm font-medium text-gray-900">
                          {planning.nom}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500">
                        {new Date(planning.debut).toLocaleDateString()} -{" "}
                        {new Date(planning.fin).toLocaleDateString()}
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
                          aria-label={`Aperçu du planning ${planning.nom}`}
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleExport(planning)}
                          className="text-indigo-600 hover:text-indigo-900"
                          aria-label={`Exporter le planning ${planning.nom}`}
                        >
                          <Download className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingPlanning(planning);
                            setShowForm(true);
                          }}
                          className="text-indigo-600 hover:text-indigo-900"
                          aria-label={`Modifier le planning ${planning.nom}`}
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedPlanning(planning);
                            setShowDeleteModal(true);
                          }}
                          className="text-red-600 hover:text-red-900"
                          aria-label={`Supprimer le planning ${planning.nom}`}
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
        )}
      </div>

      {showForm && (
        <PlanningForm
          onClose={() => {
            setShowForm(false);
            setEditingPlanning(undefined);
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
            setSelectedPlanning(undefined);
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
                    setSelectedPlanning(undefined);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <PlanningPreview
                jours={selectedPlanning?.jours || []}
                membres={selectedPlanning?.membres || []}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanningList;
