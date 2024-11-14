import { parseISO, format, eachDayOfInterval } from 'date-fns';
import { fr } from 'date-fns/locale';

interface TeamMember {
  id: string;
  nom: string;
  role: string;
  heuresHebdo: number;
  preferences?: {
    horaires?: {
      debut: string;
      fin: string;
    };
    joursRepos?: string[];
  };
}

interface PlanningDay {
  date: string;
  jourSemaine: string;
  horaires: {
    debut: string;
    fin: string;
    ferme: boolean;
  };
  equipe: string[];
  tauxPresence: number;
}

const validateInputs = (debut: string, fin: string, membres: TeamMember[], horaires: any) => {
  if (!debut || !fin) {
    throw new Error('Les dates de début et de fin sont requises');
  }

  if (!membres || membres.length === 0) {
    throw new Error('Au moins un membre est requis pour générer le planning');
  }

  const dateDebut = parseISO(debut);
  const dateFin = parseISO(fin);

  if (isNaN(dateDebut.getTime()) || isNaN(dateFin.getTime())) {
    throw new Error('Dates invalides');
  }

  if (dateFin < dateDebut) {
    throw new Error('La date de fin doit être postérieure à la date de début');
  }

  if (!horaires || Object.keys(horaires).length === 0) {
    throw new Error('Les horaires sont requis');
  }
};

const calculerTauxPresenceRequis = (jourSemaine: string): number => {
  switch (jourSemaine.toLowerCase()) {
    case 'vendredi':
    case 'samedi':
      return 0.9; // 90% de l'équipe
    case 'dimanche':
      return 0.5; // 50% de l'équipe
    default:
      return 0.7; // 70% de l'équipe pour les autres jours
  }
};

const calculerHeuresTravail = (horaires: { debut: string; fin: string }): number => {
  const [debutHeure, debutMinute] = horaires.debut.split(':').map(Number);
  const [finHeure, finMinute] = horaires.fin.split(':').map(Number);
  return (finHeure + finMinute/60) - (debutHeure + debutMinute/60);
};

const estJourRepos = (membre: TeamMember, jourSemaine: string): boolean => {
  return membre.preferences?.joursRepos?.includes(jourSemaine.toLowerCase()) || false;
};

export const generatePlanning = (
  debut: string,
  fin: string,
  membres: TeamMember[],
  horaires: {
    [jour: string]: {
      debut: string;
      fin: string;
      ferme: boolean;
    };
  }
): PlanningDay[] => {
  try {
    validateInputs(debut, fin, membres, horaires);

    const dateRange = eachDayOfInterval({
      start: parseISO(debut),
      end: parseISO(fin)
    });

    // Initialiser les compteurs d'heures hebdomadaires
    const heuresParMembre = new Map<string, {
      heuresRestantes: number;
      joursConsecutifs: number;
    }>();

    membres.forEach(membre => {
      heuresParMembre.set(membre.id, {
        heuresRestantes: membre.heuresHebdo,
        joursConsecutifs: 0
      });
    });

    const planningDays: PlanningDay[] = [];
    let semaineEnCours = 0;

    dateRange.forEach((date, index) => {
      const jourSemaine = format(date, 'EEEE', { locale: fr }).toLowerCase();
      const horaireJour = horaires[jourSemaine];

      // Nouvelle semaine
      if (index % 7 === 0) {
        semaineEnCours++;
        membres.forEach(membre => {
          heuresParMembre.set(membre.id, {
            heuresRestantes: membre.heuresHebdo,
            joursConsecutifs: heuresParMembre.get(membre.id)?.joursConsecutifs || 0
          });
        });
      }

      if (!horaireJour.ferme) {
        const heuresTravail = calculerHeuresTravail(horaireJour);
        const tauxPresenceRequis = calculerTauxPresenceRequis(jourSemaine);
        const nombreMembresRequis = Math.ceil(membres.length * tauxPresenceRequis);

        // Sélectionner les membres disponibles
        const membresDisponibles = membres.filter(membre => {
          const stats = heuresParMembre.get(membre.id);
          if (!stats) return false;

          const estEnRepos = estJourRepos(membre, jourSemaine);
          const aAssezHeures = stats.heuresRestantes >= heuresTravail;
          const pasDepassementJoursConsecutifs = stats.joursConsecutifs < 5;

          return !estEnRepos && aAssezHeures && pasDepassementJoursConsecutifs;
        });

        // Trier par priorité
        const membresDuJour = membresDisponibles
          .sort((a, b) => {
            const statsA = heuresParMembre.get(a.id);
            const statsB = heuresParMembre.get(b.id);
            if (!statsA || !statsB) return 0;
            return statsB.heuresRestantes - statsA.heuresRestantes;
          })
          .slice(0, nombreMembresRequis);

        // Mettre à jour les compteurs
        membresDuJour.forEach(membre => {
          const stats = heuresParMembre.get(membre.id);
          if (stats) {
            heuresParMembre.set(membre.id, {
              heuresRestantes: stats.heuresRestantes - heuresTravail,
              joursConsecutifs: stats.joursConsecutifs + 1
            });
          }
        });

        // Réinitialiser les jours consécutifs pour les absents
        membres.forEach(membre => {
          if (!membresDuJour.includes(membre)) {
            const stats = heuresParMembre.get(membre.id);
            if (stats) {
              heuresParMembre.set(membre.id, {
                ...stats,
                joursConsecutifs: 0
              });
            }
          }
        });

        planningDays.push({
          date: format(date, 'yyyy-MM-dd'),
          jourSemaine,
          horaires: horaireJour,
          equipe: membresDuJour.map(m => m.id),
          tauxPresence: membresDuJour.length / membres.length
        });
      } else {
        planningDays.push({
          date: format(date, 'yyyy-MM-dd'),
          jourSemaine,
          horaires: horaireJour,
          equipe: [],
          tauxPresence: 0
        });
      }
    });

    return planningDays;
  } catch (error: any) {
    console.error('Erreur lors de la génération du planning:', error);
    throw new Error(error.message || 'Erreur lors de la génération du planning');
  }
};