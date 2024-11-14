import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Planning {
  id: string;
  nom: string;
  debut: string;
  fin: string;
  membres: string[];
  jours: {
    date: string;
    jourSemaine: string;
    horaires: {
      debut: string;
      fin: string;
      ferme: boolean;
    };
    equipe: string[];
    tauxPresence: number;
  }[];
}

interface TeamMember {
  id: string;
  nom: string;
  role: string;
  heuresHebdo: number;
}

class ReportGenerator {
  static async generateHeuresTravaillees(plannings: Planning[], members: TeamMember[], dateRange: { debut: string; fin: string }) {
    const heuresParMembre = new Map<string, number>();
    const heuresParJour = new Map<string, Map<string, number>>();

    // Calculer les heures pour chaque membre
    plannings.forEach(planning => {
      planning.jours.forEach(jour => {
        if (!jour.horaires.ferme) {
          const heuresTravail = this.calculerHeuresTravail(jour.horaires);
          
          jour.equipe.forEach(membreId => {
            // Heures totales par membre
            heuresParMembre.set(
              membreId,
              (heuresParMembre.get(membreId) || 0) + heuresTravail
            );

            // Heures par jour par membre
            if (!heuresParJour.has(jour.date)) {
              heuresParJour.set(jour.date, new Map());
            }
            const joursMap = heuresParJour.get(jour.date)!;
            joursMap.set(membreId, heuresTravail);
          });
        }
      });
    });

    // Générer le rapport Excel
    const wb = XLSX.utils.book_new();

    // Feuille récapitulative
    const recapData = [
      ['Rapport des heures travaillées'],
      ['Période:', `${format(new Date(dateRange.debut), 'dd/MM/yyyy')} - ${format(new Date(dateRange.fin), 'dd/MM/yyyy')}`],
      [''],
      ['Membre', 'Rôle', 'Heures contractuelles', 'Heures travaillées', 'Différence']
    ];

    members.forEach(member => {
      const heuresTravaillees = heuresParMembre.get(member.id) || 0;
      const difference = heuresTravaillees - member.heuresHebdo;
      
      recapData.push([
        member.nom,
        member.role,
        member.heuresHebdo,
        heuresTravaillees,
        difference
      ]);
    });

    const wsRecap = XLSX.utils.aoa_to_sheet(recapData);
    XLSX.utils.book_append_sheet(wb, wsRecap, 'Récapitulatif');

    // Feuille détaillée
    const detailData = [
      ['Détail par jour'],
      ['Date', ...members.map(m => m.nom)]
    ];

    Array.from(heuresParJour.entries()).sort().forEach(([date, heures]) => {
      const row = [format(new Date(date), 'dd/MM/yyyy')];
      members.forEach(member => {
        row.push(heures.get(member.id) || 0);
      });
      detailData.push(row);
    });

    const wsDetail = XLSX.utils.aoa_to_sheet(detailData);
    XLSX.utils.book_append_sheet(wb, wsDetail, 'Détail par jour');

    // Sauvegarder le fichier
    const fileName = `heures_travaillees_${format(new Date(), 'yyyyMMdd')}.xlsx`;
    XLSX.writeFile(wb, fileName);
  }

  static async generateRotationEquipe(plannings: Planning[], members: TeamMember[], dateRange: { debut: string; fin: string }) {
    const rotationData = new Map<string, {
      joursPresence: number;
      tauxPresence: number;
      joursConsecutifs: number[];
    }>();

    // Initialiser les données pour chaque membre
    members.forEach(member => {
      rotationData.set(member.id, {
        joursPresence: 0,
        tauxPresence: 0,
        joursConsecutifs: []
      });
    });

    // Analyser les plannings
    plannings.forEach(planning => {
      let consecutifs = new Map<string, number>();

      planning.jours.forEach(jour => {
        if (!jour.horaires.ferme) {
          jour.equipe.forEach(membreId => {
            const data = rotationData.get(membreId)!;
            data.joursPresence++;
            
            // Compter les jours consécutifs
            consecutifs.set(membreId, (consecutifs.get(membreId) || 0) + 1);
          });

          // Réinitialiser les compteurs pour les membres absents
          members.forEach(member => {
            if (!jour.equipe.includes(member.id)) {
              const streak = consecutifs.get(member.id) || 0;
              if (streak > 0) {
                const data = rotationData.get(member.id)!;
                data.joursConsecutifs.push(streak);
                consecutifs.set(member.id, 0);
              }
            }
          });
        }
      });
    });

    // Calculer les taux de présence
    const totalJours = plannings.reduce((acc, planning) => 
      acc + planning.jours.filter(j => !j.horaires.ferme).length, 0
    );

    rotationData.forEach((data, membreId) => {
      data.tauxPresence = (data.joursPresence / totalJours) * 100;
    });

    // Générer le rapport Excel
    const wb = XLSX.utils.book_new();

    const reportData = [
      ['Rapport de rotation d\'équipe'],
      ['Période:', `${format(new Date(dateRange.debut), 'dd/MM/yyyy')} - ${format(new Date(dateRange.fin), 'dd/MM/yyyy')}`],
      [''],
      ['Membre', 'Rôle', 'Jours de présence', 'Taux de présence', 'Max jours consécutifs', 'Moyenne jours consécutifs']
    ];

    members.forEach(member => {
      const data = rotationData.get(member.id)!;
      const maxConsecutifs = Math.max(...data.joursConsecutifs, 0);
      const moyenneConsecutifs = data.joursConsecutifs.length > 0
        ? data.joursConsecutifs.reduce((a, b) => a + b, 0) / data.joursConsecutifs.length
        : 0;

      reportData.push([
        member.nom,
        member.role,
        data.joursPresence,
        `${data.tauxPresence.toFixed(1)}%`,
        maxConsecutifs,
        moyenneConsecutifs.toFixed(1)
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(reportData);
    XLSX.utils.book_append_sheet(wb, ws, 'Rotation équipe');

    // Sauvegarder le fichier
    const fileName = `rotation_equipe_${format(new Date(), 'yyyyMMdd')}.xlsx`;
    XLSX.writeFile(wb, fileName);
  }

  private static calculerHeuresTravail(horaires: { debut: string; fin: string; ferme: boolean }): number {
    if (horaires.ferme) return 0;

    const [debutHeure, debutMinute] = horaires.debut.split(':').map(Number);
    const [finHeure, finMinute] = horaires.fin.split(':').map(Number);
    
    return (finHeure + finMinute/60) - (debutHeure + debutMinute/60);
  }

  // Les autres méthodes de génération de rapports suivent le même modèle
  static async generatePlanningMensuel(plannings: Planning[], members: TeamMember[], dateRange: { debut: string; fin: string }) {
    // Implémentation similaire pour le planning mensuel
  }

  static async generateAnalysePerformance(plannings: Planning[], members: TeamMember[], dateRange: { debut: string; fin: string }) {
    // Implémentation similaire pour l'analyse de performance
  }
}

export default ReportGenerator;