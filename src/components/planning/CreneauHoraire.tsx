import React from 'react';
import { Clock, Plus, Trash } from 'lucide-react';
import { HoraireCreneau } from '../../types/planning';

interface CreneauHoraireProps {
  creneaux: HoraireCreneau[];
  onChange: (creneaux: HoraireCreneau[]) => void;
  disabled?: boolean;
  minCreneaux?: number;
  maxCreneaux?: number;
}

const CreneauHoraire: React.FC<CreneauHoraireProps> = ({
  creneaux,
  onChange,
  disabled = false,
  minCreneaux = 1,
  maxCreneaux = 3
}) => {
  const validerCreneau = (creneau: HoraireCreneau): boolean => {
    const [debutH, debutM] = creneau.debut.split(':').map(Number);
    const [finH, finM] = creneau.fin.split(':').map(Number);
    const debutMinutes = debutH * 60 + debutM;
    const finMinutes = finH * 60 + finM;
    
    return finMinutes > debutMinutes;
  };

  const verifierChevauchement = (nouveauxCreneaux: HoraireCreneau[]): boolean => {
    for (let i = 0; i < nouveauxCreneaux.length; i++) {
      for (let j = i + 1; j < nouveauxCreneaux.length; j++) {
        const [debutH1, debutM1] = nouveauxCreneaux[i].debut.split(':').map(Number);
        const [finH1, finM1] = nouveauxCreneaux[i].fin.split(':').map(Number);
        const [debutH2, debutM2] = nouveauxCreneaux[j].debut.split(':').map(Number);
        const [finH2, finM2] = nouveauxCreneaux[j].fin.split(':').map(Number);

        const debut1 = debutH1 * 60 + debutM1;
        const fin1 = finH1 * 60 + finM1;
        const debut2 = debutH2 * 60 + debutM2;
        const fin2 = finH2 * 60 + finM2;

        if ((debut1 <= debut2 && fin1 > debut2) || (debut2 <= debut1 && fin2 > debut1)) {
          return true;
        }
      }
    }
    return false;
  };

  const ajouterCreneau = () => {
    if (creneaux.length >= maxCreneaux) return;

    // Trouver un créneau libre
    const nouveauCreneau = { debut: '09:00', fin: '17:00' };
    const nouveauxCreneaux = [...creneaux, nouveauCreneau].sort((a, b) => {
      const [aH, aM] = a.debut.split(':').map(Number);
      const [bH, bM] = b.debut.split(':').map(Number);
      return (aH * 60 + aM) - (bH * 60 + bM);
    });

    if (!verifierChevauchement(nouveauxCreneaux)) {
      onChange(nouveauxCreneaux);
    }
  };

  const supprimerCreneau = (index: number) => {
    if (creneaux.length <= minCreneaux) return;
    const nouveauxCreneaux = creneaux.filter((_, i) => i !== index);
    onChange(nouveauxCreneaux);
  };

  const modifierCreneau = (index: number, type: 'debut' | 'fin', valeur: string) => {
    const nouveauxCreneaux = [...creneaux];
    const nouveauCreneau = {
      ...nouveauxCreneaux[index],
      [type]: valeur
    };

    if (validerCreneau(nouveauCreneau)) {
      nouveauxCreneaux[index] = nouveauCreneau;
      if (!verifierChevauchement(nouveauxCreneaux)) {
        onChange(nouveauxCreneaux);
      }
    }
  };

  return (
    <div className="space-y-2">
      {creneaux.map((creneau, index) => (
        <div key={index} className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-gray-400" />
          <input
            type="time"
            value={creneau.debut}
            onChange={(e) => modifierCreneau(index, 'debut', e.target.value)}
            className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            disabled={disabled}
          />
          <span>-</span>
          <input
            type="time"
            value={creneau.fin}
            onChange={(e) => modifierCreneau(index, 'fin', e.target.value)}
            className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            disabled={disabled}
          />
          {!disabled && creneaux.length > minCreneaux && (
            <button
              type="button"
              onClick={() => supprimerCreneau(index)}
              className="p-1 text-red-600 hover:text-red-800 rounded-full hover:bg-red-50"
              title="Supprimer ce créneau"
            >
              <Trash className="w-4 h-4" />
            </button>
          )}
        </div>
      ))}
      
      {!disabled && creneaux.length < maxCreneaux && (
        <button
          type="button"
          onClick={ajouterCreneau}
          className="flex items-center space-x-1 text-sm text-indigo-600 hover:text-indigo-800"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter un créneau</span>
        </button>
      )}

      {creneaux.length > 0 && (
        <div className="text-sm text-gray-500">
          Total: {creneaux.reduce((acc, creneau) => {
            const [debutH, debutM] = creneau.debut.split(':').map(Number);
            const [finH, finM] = creneau.fin.split(':').map(Number);
            return acc + ((finH * 60 + finM) - (debutH * 60 + debutM)) / 60;
          }, 0).toFixed(1)}h
        </div>
      )}
    </div>
  );
};

export default CreneauHoraire;