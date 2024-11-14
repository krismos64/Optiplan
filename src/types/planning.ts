export interface HoraireCreneau {
  debut: string;
  fin: string;
}

export interface HoraireJour {
  creneaux: HoraireCreneau[];
  ferme: boolean;
}

export interface Planning {
  id: string;
  nom: string;
  debut: string;
  fin: string;
  membres: string[];
  horaires: {
    [jour: string]: HoraireJour;
  };
  jours: PlanningJour[];
  isManual: boolean;
}

export interface PlanningJour {
  date: string;
  jourSemaine: string;
  horaires: HoraireJour;
  equipe: {
    membreId: string;
    creneaux: HoraireCreneau[];
  }[];
  tauxPresence: number;
}

export interface TeamMember {
  id: string;
  nom: string;
  role: string;
  heuresHebdo: number;
  preferences?: {
    creneaux?: {
      [jour: string]: HoraireCreneau[];
    };
    joursRepos?: string[];
  };
}