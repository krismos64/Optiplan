import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Calendar,
  Trash2,
  Edit2,
  AlertCircle,
  Eye,
} from "lucide-react";
import { useFirebaseError } from "../../hooks/useFirebaseError";
import PlanningForm from "./PlanningForm";
import DeleteConfirmationModal from "../../components/modals/DeleteConfirmationModal";
import PlanningPreview from "../../components/planning/PlanningPreview";
import { firebaseService } from "../../services/firebaseService";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { UserOptions } from "jspdf-autotable";
import type { TeamMember, Planning, PlanningJour } from "../../types/planning";

// Extension de jsPDF pour inclure lastAutoTable
interface ExtendedJsPDF extends jsPDF {
  lastAutoTable?: {
    finalY: number;
  };
}

// Extension des options d'autoTable
interface ExtendedUserOptions extends UserOptions {
  startY?: number;
}

const PlanningList = () => {
  const [plannings, setPlannings] = useState<Planning[]>([]);
  const [membres, setMembres] = useState<TeamMember[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedPlanning, setSelectedPlanning] = useState<
    Planning | undefined
  >(undefined);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [editingPlanning, setEditingPlanning] = useState<Planning | undefined>(
    undefined
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [showPreview, setShowPreview] = useState<boolean>(false);

  const { error, handleFirebaseOperation } = useFirebaseError();

  useEffect(() => {
    const loadPlannings = async () => {
      setLoading(true);
      try {
        const result = await firebaseService.getPlannings();
        setPlannings(result as unknown as Planning[]);
      } catch (err) {
        console.error("Erreur lors du chargement des plannings:", err);
      } finally {
        setLoading(false);
      }
    };

    const loadMembres = async () => {
      try {
        const result = await firebaseService.getTeamMembers();
        setMembres(
          result.map((member: Partial<TeamMember>) => ({
            id: member.id || "",
            nom: member.nom || "",
            heuresHebdo: member.heuresHebdo || 0,
            compteurHeures: member.compteurHeures || 0,
          }))
        );
      } catch (err) {
        console.error("Erreur lors du chargement des membres:", err);
      }
    };

    loadPlannings();
    loadMembres();
  }, []);

  const handleDelete = async (planningId: string) => {
    await handleFirebaseOperation(async () => {
      await firebaseService.deletePlanning(planningId);
      setPlannings((prev) => prev.filter((p) => p.id !== planningId));
      setShowDeleteModal(false);
      setSelectedPlanning(undefined);
    }, "Erreur lors de la suppression du planning");
  };

  const handlePreview = (planning: Planning) => {
    setSelectedPlanning(planning);
    setShowPreview(true);
  };

  const handleExportPDF = (planning: Planning, memberId?: string) => {
    const doc = new jsPDF() as ExtendedJsPDF;
    doc.setFontSize(14);

    if (memberId) {
      const member = membres.find((m) => m.id === memberId);
      if (!member) return;

      doc.text(`Planning Individuel - ${member.nom}`, 10, 10);
      planning.jours.forEach((jour: PlanningJour) => {
        const memberDay = jour.equipe.find((e) => e.membreId === memberId);
        if (memberDay) {
          const schedule = memberDay.creneaux.map(
            (creneau) => `${creneau.debut} - ${creneau.fin}`
          );
          const options: ExtendedUserOptions = {
            startY: doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 20,
            head: [[`Date: ${jour.date}`, "Horaires"]],
            body: schedule.map((s) => [s]),
          };
          autoTable(doc, options);
        }
      });
      doc.save(`${planning.nom}_${member.nom}.pdf`);
    } else {
      doc.text(`Planning Équipe - ${planning.nom}`, 10, 10);
      planning.jours.forEach((jour: PlanningJour) => {
        const membersSchedules = jour.equipe.map((equipeMembre) => {
          const memberInfo = membres.find(
            (m) => m.id === equipeMembre.membreId
          );
          const schedule = equipeMembre.creneaux
            .map((creneau) => `${creneau.debut} - ${creneau.fin}`)
            .join(", ");
          return [memberInfo ? memberInfo.nom : "Membre inconnu", schedule];
        });
        const options: ExtendedUserOptions = {
          startY: doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 20,
          head: [[`Date: ${jour.date}`, "Membre", "Horaires"]],
          body: membersSchedules,
        };
        autoTable(doc, options);
      });
      doc.save(`${planning.nom}_equipe.pdf`);
    }
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
                        {planning.membres.length} membre(s)
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
                          onClick={() => handleExportPDF(planning)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Télécharger PDF Équipe
                        </button>
                        {planning.membres.map((member) => (
                          <button
                            key={member.id}
                            onClick={() => handleExportPDF(planning, member.id)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Télécharger PDF - {member.nom}
                          </button>
                        ))}
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
        )}
      </div>

      {showForm && (
        <PlanningForm
          onClose={() => setShowForm(false)}
          planning={editingPlanning}
        />
      )}

      {showDeleteModal && selectedPlanning && (
        <DeleteConfirmationModal
          title="Supprimer le planning"
          message={`Êtes-vous sûr de vouloir supprimer le planning "${selectedPlanning.nom}" ?`}
          onConfirm={() =>
            selectedPlanning?.id && handleDelete(selectedPlanning.id)
          }
          onCancel={() => setShowDeleteModal(false)}
        />
      )}

      {showPreview && selectedPlanning && (
        <PlanningPreview
          jours={selectedPlanning.jours}
          membres={membres}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
};

export default PlanningList;
