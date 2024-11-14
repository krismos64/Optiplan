import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Planning, TeamMember, HoraireCreneau } from '../types/planning';

const calculerHeuresCreneau = (creneau: HoraireCreneau): number => {
  const [debutH, debutM] = creneau.debut.split(':').map(Number);
  const [finH, finM] = creneau.fin.split(':').map(Number);
  return (finH + finM/60) - (debutH + debutM/60);
};

const formatCreneaux = (creneaux: HoraireCreneau[]): string => {
  return creneaux.map(c => `${c.debut} - ${c.fin}`).join('\n');
};

export const exportToPDF = async (planning: Planning, members: TeamMember[], memberId?: string) => {
  const doc = new jsPDF();
  const membre = memberId ? members.find(m => m.id === memberId) : null;
  
  // En-tête
  doc.setFontSize(20);
  doc.text(membre ? `Planning de ${membre.nom}` : planning.nom, 14, 15);
  
  doc.setFontSize(12);
  doc.text(`Période: ${format(parseISO(planning.debut), 'dd MMMM yyyy', { locale: fr })} - ${format(parseISO(planning.fin), 'dd MMMM yyyy', { locale: fr })}`, 14, 25);

  if (membre) {
    doc.text(`Rôle: ${membre.role}`, 14, 35);
    doc.text(`Heures hebdomadaires: ${membre.heuresHebdo}h`, 14, 45);
  }

  // Tableau des horaires
  const tableData = planning.jours.map(jour => {
    const dateFormatted = format(parseISO(jour.date), 'dd/MM/yyyy');
    const jourSemaine = format(parseISO(jour.date), 'EEEE', { locale: fr });
    
    if (membre) {
      // Pour un membre spécifique
      const creneauxMembre = jour.equipe
        .find(e => e.membreId === membre.id)?.creneaux || [];
      
      return [
        dateFormatted,
        jourSemaine,
        jour.horaires.ferme ? 'Fermé' : formatCreneaux(creneauxMembre),
        creneauxMembre.length > 0 ? 
          creneauxMembre.reduce((acc, c) => acc + calculerHeuresCreneau(c), 0).toFixed(1) + 'h' 
          : '-'
      ];
    } else {
      // Pour l'équipe complète
      return [
        dateFormatted,
        jourSemaine,
        jour.horaires.ferme ? 'Fermé' : formatCreneaux(jour.horaires.creneaux),
        jour.equipe.map(e => {
          const member = members.find(m => m.id === e.membreId);
          return `${member?.nom}: ${formatCreneaux(e.creneaux)}`;
        }).join('\n'),
        `${Math.round(jour.tauxPresence * 100)}%`
      ];
    }
  });

  const headers = membre 
    ? [['Date', 'Jour', 'Horaires', 'Heures']]
    : [['Date', 'Jour', 'Horaires', 'Équipe', 'Taux présence']];

  autoTable(doc, {
    head: headers,
    body: tableData,
    startY: membre ? 55 : 35,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2
    },
    headStyles: {
      fillColor: [79, 70, 229],
      textColor: 255,
      fontSize: 9,
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250]
    },
    columnStyles: {
      3: { cellWidth: membre ? 'auto' : 60 }
    }
  });

  // Pied de page
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      `Généré le ${format(new Date(), 'dd/MM/yyyy à HH:mm')}`,
      14,
      doc.internal.pageSize.height - 10
    );
    doc.text(
      `Page ${i} sur ${pageCount}`,
      doc.internal.pageSize.width - 30,
      doc.internal.pageSize.height - 10
    );
  }

  const fileName = membre 
    ? `planning_${membre.nom.toLowerCase().replace(/\s+/g, '_')}_${format(new Date(), 'yyyyMMdd')}.pdf`
    : `${planning.nom}_${format(new Date(), 'yyyyMMdd')}.pdf`;
  
  doc.save(fileName);
};