import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
  serverTimestamp,
  Timestamp,
  DocumentReference,
  DocumentData
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Planning, TeamMember } from '../types/planning';

const handleFirebaseError = (error: any, operation: string) => {
  console.error(`Erreur Firebase (${operation}):`, error);
  
  if (error.code === 'permission-denied') {
    throw new Error('Vous n\'avez pas les permissions nécessaires');
  }
  
  if (error.code === 'unavailable') {
    throw new Error('Service temporairement indisponible. Veuillez réessayer.');
  }

  if (error.code === 'not-found') {
    throw new Error('Document non trouvé');
  }
  
  throw new Error(`Impossible de ${operation}. Veuillez réessayer.`);
};

export const firebaseService = {
  // Plannings
  async createPlanning(planningData: Omit<Planning, 'id'>): Promise<string> {
    try {
      if (!planningData || !planningData.nom || !planningData.debut || !planningData.fin) {
        throw new Error('Données de planning incomplètes');
      }

      const planningsRef = collection(db, 'plannings');
      const docRef = await addDoc(planningsRef, {
        ...planningData,
        dateCreation: serverTimestamp(),
        derniereMiseAJour: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      handleFirebaseError(error, 'créer le planning');
      throw error;
    }
  },

  async updatePlanning(planningId: string, planningData: Partial<Planning>): Promise<void> {
    try {
      const planningRef = doc(db, 'plannings', planningId);
      await updateDoc(planningRef, {
        ...planningData,
        derniereMiseAJour: serverTimestamp()
      });
    } catch (error) {
      handleFirebaseError(error, 'mettre à jour le planning');
      throw error;
    }
  },

  async deletePlanning(planningId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'plannings', planningId));
    } catch (error) {
      handleFirebaseError(error, 'supprimer le planning');
      throw error;
    }
  },

  async getPlanningsByPeriod(debut: string, fin: string): Promise<Planning[]> {
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
      handleFirebaseError(error, 'récupérer les plannings');
      throw error;
    }
  },

  async getPlanningsByMember(membreId: string): Promise<Planning[]> {
    try {
      const q = query(
        collection(db, 'plannings'),
        where('membres', 'array-contains', membreId)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Planning[];
    } catch (error) {
      handleFirebaseError(error, 'récupérer les plannings du membre');
      throw error;
    }
  },

  // Membres
  async createTeamMember(memberData: Omit<TeamMember, 'id'>): Promise<string> {
    try {
      if (!memberData.nom || !memberData.role || !memberData.heuresHebdo) {
        throw new Error('Données du membre incomplètes');
      }

      const membresRef = collection(db, 'team');
      const docRef = await addDoc(membresRef, {
        ...memberData,
        dateCreation: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      handleFirebaseError(error, 'créer le membre');
      throw error;
    }
  },

  async updateTeamMember(memberId: string, memberData: Partial<TeamMember>): Promise<void> {
    try {
      const memberRef = doc(db, 'team', memberId);
      await updateDoc(memberRef, {
        ...memberData,
        derniereMiseAJour: serverTimestamp()
      });
    } catch (error) {
      handleFirebaseError(error, 'mettre à jour le membre');
      throw error;
    }
  },

  async deleteTeamMember(memberId: string): Promise<void> {
    try {
      // Vérifier si le membre est dans des plannings actifs
      const planningsActifs = await this.getPlanningsByMember(memberId);
      if (planningsActifs.length > 0) {
        throw new Error('Ce membre est présent dans des plannings actifs');
      }

      await deleteDoc(doc(db, 'team', memberId));
    } catch (error) {
      handleFirebaseError(error, 'supprimer le membre');
      throw error;
    }
  },

  async getActiveTeamMembers(): Promise<TeamMember[]> {
    try {
      const q = query(collection(db, 'team'), where('statut', '==', 'actif'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as TeamMember[];
    } catch (error) {
      handleFirebaseError(error, 'récupérer les membres actifs');
      throw error;
    }
  },

  // Gestion des heures et congés
  async updateMemberHours(memberId: string, heures: number): Promise<void> {
    try {
      const memberRef = doc(db, 'team', memberId);
      await updateDoc(memberRef, {
        compteurHeures: heures,
        derniereMiseAJour: serverTimestamp()
      });
    } catch (error) {
      handleFirebaseError(error, 'mettre à jour les heures');
      throw error;
    }
  },

  async addLeave(memberId: string, conge: {
    debut: string;
    fin: string;
    type: 'conges' | 'maladie' | 'autre';
    description?: string;
  }): Promise<void> {
    try {
      const memberRef = doc(db, 'team', memberId);
      await updateDoc(memberRef, {
        'conges.pris': Timestamp.now(),
        derniereMiseAJour: serverTimestamp()
      });
    } catch (error) {
      handleFirebaseError(error, 'ajouter le congé');
      throw error;
    }
  },

  // Utilitaires
  async batchUpdate(updates: { ref: DocumentReference<DocumentData>; data: Partial<DocumentData> }[]): Promise<void> {
    try {
      const batch = db.batch();
      updates.forEach(({ ref, data }) => {
        batch.update(ref, {
          ...data,
          derniereMiseAJour: serverTimestamp()
        });
      });
      await batch.commit();
    } catch (error) {
      handleFirebaseError(error, 'effectuer les mises à jour groupées');
      throw error;
    }
  }
};

export default firebaseService;