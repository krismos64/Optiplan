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
import { planningService } from './planningService';

export interface TeamMember {
  id?: string;
  nom: string;
  role: string;
  heuresHebdo: number;
  compteurHeures: number;
  statut: 'actif' | 'inactif';
  preferences: {
    horaires: {
      debut: string;
      fin: string;
    };
    joursRepos: string[];
  };
  conges: {
    solde: number;
    pris: {
      debut: string;
      fin: string;
      type: 'conges' | 'maladie' | 'autre';
      description?: string;
    }[];
  };
}

export const teamService = {
  async mettreAJourCompteurHeures(membreId: string, debut: string, fin: string) {
    try {
      const heuresTravaillees = await planningService.calculerHeuresMembre(membreId, debut, fin);
      const membreRef = doc(db, 'team', membreId);
      const heuresContrat = (await getDocs(query(collection(db, 'team'), where('id', '==', membreId)))).docs[0].data().heuresHebdo;
      
      // Calculer la différence entre les heures travaillées et les heures contractuelles
      const difference = heuresTravaillees - heuresContrat;
      
      await updateDoc(membreRef, {
        compteurHeures: difference,
        derniereMiseAJour: Timestamp.now()
      });

      return difference;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du compteur d\'heures:', error);
      throw error;
    }
  },

  async ajouterConge(membreId: string, conge: { debut: string; fin: string; type: 'conges' | 'maladie' | 'autre'; description?: string }) {
    try {
      const membreRef = doc(db, 'team', membreId);
      await updateDoc(membreRef, {
        'conges.pris': Timestamp.now(),
        derniereMiseAJour: Timestamp.now()
      });
    } catch (error) {
      console.error('Erreur lors de l\'ajout du congé:', error);
      throw error;
    }
  },

  async getMembresActifs() {
    try {
      const q = query(collection(db, 'team'), where('statut', '==', 'actif'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as TeamMember[];
    } catch (error) {
      console.error('Erreur lors de la récupération des membres actifs:', error);
      throw error;
    }
  }
};