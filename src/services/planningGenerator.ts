import { parseISO, format, eachDayOfInterval } from 'date-fns';
import { fr } from 'date-fns/locale';
import { settingsService } from './settingsService';

interface TeamMember {
  id: string;
  nom: string;
  heuresHebdo: number;
}

interface PlanningDay {
  date: string;
  jourSemaine: string;
  horaires: {
    debut: string;
    fin: string;
    ferme: boolean;
  };
  equipe: {
    membreId: string;
    creneaux: { debut: string; fin: string; }[];
  }[];
  tauxPresence: number;
}

const defaultHoraires = {
  lundi: { debut: '08:30', fin: '20:00', ferme: false },
  mardi: { debut: '08:30', fin: '20:00', ferme: false },
  mercredi: { debut: '08:30', fin: '20:00', ferme: false },
  jeudi: { debut: '08:30', fin: '20:00', ferme: false },
  vendredi: { debut: '08:30', fin: '20:00', ferme: false },
  samedi: { debut: '08:30', fin: '20:00', ferme: false },
  dimanche: { debut: '08:45', fin: '12:30', ferme: false }
};

const validateInputs = (debut: string, fin: string, membres: TeamMember[]) => {
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
};

export const generatePlanning = async (
  debut: string,
  fin: string,
  membres: TeamMember[]
): Promise<PlanningDay[]> => {
  try {
    validateInputs(debut, fin, membres);

    // Récupérer les horaires depuis les paramètres ou utiliser les horaires par défaut
    const settings = await settingsService.getSettings('horaires');
    const horaires = settings || defaultHoraires;

    const dateRange = eachDayOfInterval({
      start: parseISO(debut),
      end: parseISO(fin)
    });

    // Distribution simple et équitable des membres
    const planningDays: PlanningDay[] = [];
    let currentMemberIndex = 0;

    dateRange.forEach(date => {
      const jourSemaine = format(date, 'EEEE', { locale: fr }).toLowerCase();
      const horaireJour = horaires[jourSemaine];

      if (!horaireJour.ferme) {
        // Sélectionner environ 70% des membres pour chaque jour
        const nombreMembresNecessaires = Math.ceil(membres.length * 0.7);
        const equipeDuJour = [];

        for (let i = 0; i < nombreMembresNecessaires; i++) {
          equipeDuJour.push({
            membreId: membres[currentMemberIndex].id,
            creneaux: [{
              debut: horaireJour.debut,
              fin: horaireJour.fin
            }]
          });
          currentMemberIndex = (currentMemberIndex + 1) % membres.length;
        }

        planningDays.push({
          date: format(date, 'yyyy-MM-dd'),
          jourSemaine,
          horaires: horaireJour,
          equipe: equipeDuJour,
          tauxPresence: equipeDuJour.length / membres.length
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