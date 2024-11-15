export interface HoraireCreneau {
  debut: string;
  fin: string;
}

export interface HoraireJour {
  creneaux: HoraireCreneau[];
  ferme: boolean;
}

export interface TeamMember {
  id: string;
  nom: string;
  heuresHebdo: number;
  compteurHeures: number;
}

export interface PlanningJour {
  date: string;
  jourSemaine: string;
  horaires: HoraireJour;
  equipe: {
    membreId: string;
    creneaux: HoraireCreneau[];
  }[];
}

export interface Planning {
  id?: string;
  nom: string;
  debut: string;
  fin: string;
  membres: TeamMember[];
  horaires: {
    [jour: string]: HoraireJour;
  };
  jours: PlanningJour[];
  isManual: boolean;
}
