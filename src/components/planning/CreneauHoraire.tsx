import React, { useState } from "react";
import { HoraireCreneau } from "../../types/planning";
import {
  updateDebut,
  updateFin,
  isCreneauValid,
} from "../../utils/horairesUtils";

interface CreneauHoraireProps {
  creneau: HoraireCreneau;
  onChange: (updatedCreneau: HoraireCreneau) => void;
  onRemove: () => void;
}

const CreneauHoraire: React.FC<CreneauHoraireProps> = ({
  creneau,
  onChange,
  onRemove,
}) => {
  const [debut, setDebut] = useState(creneau.debut);
  const [fin, setFin] = useState(creneau.fin);

  const handleDebutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDebut = e.target.value;
    const updatedCreneau = updateDebut(creneau, newDebut);
    setDebut(newDebut);
    if (isCreneauValid(updatedCreneau)) {
      onChange(updatedCreneau);
    }
  };

  const handleFinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFin = e.target.value;
    const updatedCreneau = updateFin(creneau, newFin);
    setFin(newFin);
    if (isCreneauValid(updatedCreneau)) {
      onChange(updatedCreneau);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <input
        type="time"
        value={debut}
        onChange={handleDebutChange}
        className="border rounded px-2 py-1 text-sm"
      />
      <input
        type="time"
        value={fin}
        onChange={handleFinChange}
        className="border rounded px-2 py-1 text-sm"
      />
      <button
        onClick={onRemove}
        className="text-red-600 hover:text-red-800 text-sm font-medium"
      >
        Supprimer
      </button>
    </div>
  );
};

export default CreneauHoraire;
