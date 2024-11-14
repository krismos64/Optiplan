import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDocs, 
  query, 
  where,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';

interface TeamMember {
  id: string;
  nom: string;
  role: string;
  heuresHebdo: number;
  preferences?: {
    joursRepos?: string[];
  };
}

interface Planning {
  id?: string;
  nom: string;
  debut: string;
  fin: string;
  membres: string[];
  horaires: {
    [jour: string]: {
      debut: string;
      fin: string;
      ferme: boolean;
    };
  };
  jours: {
    date: string;
    jourSemaine: string;
    horaires: {
      debut: string;
      fin: string;
      ferme: boolean;
    };
    equipe: string[];
  }[];
  statut: 'actif' | 'en_attente' | 'termine';
  isManual: boolean;
  derniereMiseAJour: string;
  creePar: string;
}

export const planningService = {
  async creerPlanning(planningData: Omit<Planning, 'id'>) {
    try {
      // Vérifier les données requises
      if (!planningData.nom || !planningData.debut || !planningData.fin) {
        throw new Error('Données de planning incomplètes');
      }

      // Créer le document dans Firestore
      const docRef = await addDoc(collection(db, 'plannings'), {
        ...planningData,
        dateCreation: Timestamp.now(),
        derniereMiseAJour: Timestamp.now()
      });

      return docRef.id;
    } catch (error) {
      console.error('Erreur lors de la création du planning:', error);
      throw error;
    }
  },

  async mettreAJourPlanning(id: string, planningData: Partial<Planning>) {
    try {
      const planningRef = doc(db, 'plannings', id);
      await updateDoc(planningRef, {
        ...planningData,
        derniereMiseAJour: Timestamp.now()
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du planning:', error);
      throw error;
    }
  },

  async getPlanningsPeriode(debut: string, fin: string) {
    try {
      const q = query(
        collection(db, 'plannings'),
        where('debut', '>=', debut),
        where('fin', '<=', fin)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Planning[];
    } catch (error) {
      console.error('Erreur lors de la récupération des plannings:', error);
      throw error;
    }
  },

  async calculerHeuresMembre(membreId: string, debut: string, fin: string) {
    try {
      const plannings = await this.getPlanningsPeriode(debut, fin);
      let totalHeures = 0;

      plannings.forEach(planning => {
        planning.jours.forEach(jour => {
          if (!jour.horaires.ferme && jour.equipe.includes(membreId)) {
            const debutHeure = parseInt(jour.horaires.debut.split(':')[0]);
            const debutMinute = parseInt(jour.horaires.debut.split(':')[1]);
            const finHeure = parseInt(jour.horaires.fin.split(':')[0]);
            const finMinute = parseInt(jour.horaires.fin.split(':')[1]);
            
            const heuresTravail = (finHeure + finMinute/60) - (debutHeure + debutMinute/60);
            totalHeures += heuresTravail;
          }
        });
      });

      return totalHeures;
    } catch (error) {
      console.error('Erreur lors du calcul des heures:', error);
      throw error;
    }
  }
};