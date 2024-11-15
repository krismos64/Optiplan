import React, { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Clock } from "lucide-react";
import { isCreneauValid } from "../../utils/horairesUtils";

interface ManualPlanningFormProps {
  jour: {
    date: string;
    jourSemaine: string;
    horaires: {
      debut: string;
      fin: string;
      ferme: boolean;
    };
    equipe: string[];
  };
  membres: {
    id: string;
    nom: string;
    role: string;
  }[];
  onUpdate: (jourModifie: {
    date: string;
    jourSemaine: string;
    horaires: { debut: string; fin: string; ferme: boolean };
    equipe: string[];
  }) => void;
}

const ManualPlanningForm: React.FC<ManualPlanningFormProps> = ({
  jour,
  membres,
  onUpdate,
}) => {
  const [horaires, setHoraires] = useState(jour.horaires);

  const handleHorairesChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "debut" | "fin"
  ) => {
    const newHoraires = {
      ...horaires,
      [type]: e.target.value,
    };

    if (isCreneauValid(newHoraires)) {
      setHoraires(newHoraires);
      onUpdate({
        ...jour,
        horaires: newHoraires,
      });
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {format(new Date(jour.date), "EEEE d MMMM yyyy", { locale: fr })}
      </h3>
      <div className="flex items-center space-x-2 mb-4">
        <Clock className="w-5 h-5 text-gray-500" />
        <input
          type="time"
          value={horaires.debut}
          onChange={(e) => handleHorairesChange(e, "debut")}
          className="border rounded px-2 py-1 text-sm"
        />
        <span>-</span>
        <input
          type="time"
          value={horaires.fin}
          onChange={(e) => handleHorairesChange(e, "fin")}
          className="border rounded px-2 py-1 text-sm"
        />
      </div>
      <div>
        <label>
          <input
            type="checkbox"
            checked={horaires.ferme}
            onChange={(e) => {
              const newHoraires = { ...horaires, ferme: e.target.checked };
              setHoraires(newHoraires);
              onUpdate({
                ...jour,
                horaires: newHoraires,
              });
            }}
          />
          Fermé
        </label>
      </div>
      <div className="mt-4">
        <h4 className="text-md font-semibold text-gray-800 mb-2">
          Membres de l'équipe :
        </h4>
        <ul className="list-disc list-inside">
          {membres.map((membre) => (
            <li key={membre.id} className="text-gray-700 text-sm">
              {membre.nom} - {membre.role}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ManualPlanningForm;
