import { parseISO, format, eachDayOfInterval, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { TeamMember, PlanningDay, HoraireCreneau } from '../types/planning';

interface MemberScore {
  id: string;
  score: number;
  joursConsecutifs: number;
  heuresRestantes: number;
  heuresJour?: number;
}

interface DayConstraints {
  tauxPresenceRequis: number;
  heuresMinimales: number;
  heuresMaximales: number;
}

export class PlanningAlgorithm {
  private membres: TeamMember[];
  private debut: Date;
  private fin: Date;
  private horaires: any;
  private memberScores: Map<string, MemberScore>;
  private readonly CONTRAINTES_JOURS: { [key: string]: DayConstraints } = {
    vendredi: { tauxPresenceRequis: 0.9, heuresMinimales: 6, heuresMaximales: 10 },
    samedi: { tauxPresenceRequis: 0.9, heuresMinimales: 6, heuresMaximales: 10 },
    dimanche: { tauxPresenceRequis: 0.5, heuresMinimales: 4, heuresMaximales: 6 },
    default: { tauxPresenceRequis: 0.7, heuresMinimales: 6, heuresMaximales: 9 }
  };

  constructor(membres: TeamMember[], debut: string, fin: string, horaires: any) {
    this.validateInputs(membres, debut, fin, horaires);
    this.membres = membres;
    this.debut = parseISO(debut);
    this.fin = parseISO(fin);
    this.horaires = horaires;
    this.memberScores = new Map();
    this.initializeMemberScores();
  }

  private validateInputs(membres: TeamMember[], debut: string, fin: string, horaires: any): void {
    if (!membres || membres.length === 0) {
      throw new Error('Au moins un membre est requis');
    }

    if (!debut || !fin) {
      throw new Error('Les dates de début et de fin sont requises');
    }

    const debutDate = parseISO(debut);
    const finDate = parseISO(fin);

    if (isNaN(debutDate.getTime()) || isNaN(finDate.getTime())) {
      throw new Error('Dates invalides');
    }

    if (finDate < debutDate) {
      throw new Error('La date de fin doit être postérieure à la date de début');
    }

    if (!horaires || Object.keys(horaires).length === 0) {
      throw new Error('Les horaires sont requis');
    }
  }

  private initializeMemberScores(): void {
    this.membres.forEach(membre => {
      this.memberScores.set(membre.id, {
        id: membre.id,
        score: 0,
        joursConsecutifs: 0,
        heuresRestantes: membre.heuresHebdo
      });
    });
  }

  private resetWeeklyHours(): void {
    this.membres.forEach(membre => {
      const score = this.memberScores.get(membre.id);
      if (score) {
        score.heuresRestantes = membre.heuresHebdo;
      }
    });
  }

  private calculerHeuresCreneau(creneau: HoraireCreneau): number {
    const [debutH, debutM] = creneau.debut.split(':').map(Number);
    const [finH, finM] = creneau.fin.split(':').map(Number);
    return (finH + finM/60) - (debutH + debutM/60);
  }

  private getMembresDisponibles(jour: string, creneaux: HoraireCreneau[]): TeamMember[] {
    const heuresJour = creneaux.reduce((acc, creneau) => 
      acc + this.calculerHeuresCreneau(creneau), 0
    );

    return this.membres.filter(membre => {
      const score = this.memberScores.get(membre.id);
      if (!score) return false;

      // Vérifier les contraintes
      const estJourRepos = membre.preferences?.joursRepos?.includes(jour.toLowerCase());
      const aAssezHeures = score.heuresRestantes >= heuresJour;
      const pasDepassementJoursConsecutifs = score.joursConsecutifs < 5;
      const respectePreferencesHoraires = this.verifierPreferencesHoraires(membre, creneaux);

      return !estJourRepos && aAssezHeures && pasDepassementJoursConsecutifs && respectePreferencesHoraires;
    });
  }

  private verifierPreferencesHoraires(membre: TeamMember, creneaux: HoraireCreneau[]): boolean {
    if (!membre.preferences?.creneaux) return true;

    return creneaux.every(creneau => {
      const [debutH, debutM] = creneau.debut.split(':').map(Number);
      const [finH, finM] = creneau.fin.split(':').map(Number);
      const debutMinutes = debutH * 60 + debutM;
      const finMinutes = finH * 60 + finM;

      return membre.preferences!.creneaux![format(this.debut, 'EEEE', { locale: fr })]?.some(prefCreneau => {
        const [prefDebutH, prefDebutM] = prefCreneau.debut.split(':').map(Number);
        const [prefFinH, prefFinM] = prefCreneau.fin.split(':').map(Number);
        const prefDebutMinutes = prefDebutH * 60 + prefDebutM;
        const prefFinMinutes = prefFinH * 60 + prefFinM;

        return debutMinutes >= prefDebutMinutes && finMinutes <= prefFinMinutes;
      });
    });
  }

  private assignerMembresJour(jourSemaine: string, creneaux: HoraireCreneau[]): string[] {
    const contraintes = this.CONTRAINTES_JOURS[jourSemaine.toLowerCase()] || this.CONTRAINTES_JOURS.default;
    const membresDisponibles = this.getMembresDisponibles(jourSemaine, creneaux);
    const nombreMembresRequis = Math.ceil(this.membres.length * contraintes.tauxPresenceRequis);

    // Trier les membres par priorité
    const membresPriorites = membresDisponibles.sort((a, b) => {
      const scoreA = this.memberScores.get(a.id)!;
      const scoreB = this.memberScores.get(b.id)!;

      // Critères de tri
      const prioriteA = scoreA.heuresRestantes + (5 - scoreA.joursConsecutifs) * 2;
      const prioriteB = scoreB.heuresRestantes + (5 - scoreB.joursConsecutifs) * 2;

      return prioriteB - prioriteA;
    });

    const membresSelectionnes = membresPriorites.slice(0, nombreMembresRequis);

    // Mettre à jour les scores
    membresSelectionnes.forEach(membre => {
      const score = this.memberScores.get(membre.id)!;
      const heuresJour = creneaux.reduce((acc, creneau) => 
        acc + this.calculerHeuresCreneau(creneau), 0
      );

      score.heuresRestantes -= heuresJour;
      score.joursConsecutifs++;
      score.heuresJour = heuresJour;
    });

    // Réinitialiser les jours consécutifs pour les membres non sélectionnés
    membresDisponibles
      .filter(membre => !membresSelectionnes.includes(membre))
      .forEach(membre => {
        const score = this.memberScores.get(membre.id)!;
        score.joursConsecutifs = 0;
      });

    return membresSelectionnes.map(m => m.id);
  }

  public generate(): PlanningDay[] {
    const planningDays: PlanningDay[] = [];
    const dateRange = eachDayOfInterval({ start: this.debut, end: this.fin });
    let semaineEnCours = 0;

    dateRange.forEach((date, index) => {
      // Nouvelle semaine
      if (index % 7 === 0) {
        semaineEnCours++;
        this.resetWeeklyHours();
      }

      const jourSemaine = format(date, 'EEEE', { locale: fr }).toLowerCase();
      const horaireJour = this.horaires[jourSemaine];

      if (!horaireJour.ferme) {
        const creneaux = [{
          debut: horaireJour.debut,
          fin: horaireJour.fin
        }];

        const equipeJour = this.assignerMembresJour(jourSemaine, creneaux);

        planningDays.push({
          date: format(date, 'yyyy-MM-dd'),
          jourSemaine,
          horaires: {
            creneaux,
            ferme: false
          },
          equipe: equipeJour.map(membreId => ({
            membreId,
            creneaux
          })),
          tauxPresence: equipeJour.length / this.membres.length
        });
      } else {
        planningDays.push({
          date: format(date, 'yyyy-MM-dd'),
          jourSemaine,
          horaires: {
            creneaux: [],
            ferme: true
          },
          equipe: [],
          tauxPresence: 0
        });
      }
    });

    return planningDays;
  }
}

export const generatePlanning = (
  debut: string,
  fin: string,
  membres: TeamMember[],
  horaires: any
): PlanningDay[] => {
  try {
    const algorithm = new PlanningAlgorithm(membres, debut, fin, horaires);
    const planning = algorithm.generate();
    
    if (!planning || planning.length === 0) {
      throw new Error('Échec de la génération du planning');
    }
    
    return planning;
  } catch (error: any) {
    console.error('Erreur lors de la génération du planning:', error);
    throw new Error(error.message || 'Impossible de générer le planning');
  }
};