import React, { useState, useRef, useEffect } from "react";
import { Download, Eye, AlertCircle } from "lucide-react";
import { Planning, TeamMember } from "../../types/planning";
import { isCreneauValid } from "../../utils/horairesUtils";

interface ExportMenuProps {
  planning: Planning;
  members: TeamMember[];
  onExport: (memberId?: string) => Promise<void>;
  onPreview: (memberId?: string) => void;
}

const ExportMenu: React.FC<ExportMenuProps> = ({
  planning,
  members,
  onExport,
  onPreview,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleExport = async (memberId?: string) => {
    try {
      setIsExporting(true);
      setError(null);

      // Vérification des créneaux avant l'exportation
      const isValid = planning.jours.every(
        (jour) =>
          Array.isArray(jour.horaires) && jour.horaires.every(isCreneauValid)
      );

      if (!isValid) {
        throw new Error(
          "Certains créneaux ne sont pas valides et ne peuvent pas être exportés."
        );
      }

      await onExport(memberId);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Erreur lors de l'export");
      } else {
        setError("Erreur inconnue lors de l'export");
      }
    } finally {
      setIsExporting(false);
      setIsOpen(false);
    }
  };

  const handlePreview = (memberId?: string) => {
    onPreview(memberId);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block" ref={menuRef}>
      <button
        aria-haspopup="true"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 rounded-lg hover:bg-blue-50"
      >
        <Download className="w-4 h-4 mr-2" />
        Actions
      </button>

      {isOpen && (
        <div
          className="fixed transform translate-x-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-300"
          style={{ zIndex: 1000 }}
        >
          {error && (
            <div className="p-3 bg-red-50 border-b border-red-100 text-red-700 text-sm flex items-start rounded-t-lg">
              <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="p-3">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              Planning équipe complet
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => handlePreview()}
                className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Eye className="w-4 h-4 mr-2 text-blue-600" />
                Aperçu du planning complet
              </button>
              <button
                onClick={() => handleExport()}
                disabled={isExporting}
                className={`w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded-lg transition-colors ${
                  isExporting ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <Download className="w-4 h-4 mr-2 text-blue-600" />
                Télécharger le PDF complet
              </button>
            </div>
          </div>

          <div className="border-t border-gray-100 p-3">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              Plannings individuels
            </h3>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {members
                .filter((member) =>
                  planning.membres.map((m) => m.id).includes(member.id)
                )
                .map((member) => (
                  <div
                    key={member.id}
                    className="p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm text-gray-900">
                          {member.nom}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handlePreview(member.id)}
                          className="p-1 text-blue-600 hover:text-blue-800 rounded"
                          aria-label={`Aperçu de ${member.nom}`}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleExport(member.id)}
                          disabled={isExporting}
                          className="p-1 text-blue-600 hover:text-blue-800 rounded"
                          aria-label={`Télécharger PDF de ${member.nom}`}
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {isExporting && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
          style={{ zIndex: 1100 }}
          aria-live="assertive"
        >
          <div className="bg-white p-4 rounded-lg shadow-xl">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <span>Export en cours...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportMenu;
