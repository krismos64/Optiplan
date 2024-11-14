import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';

const handleFirebaseError = (error: any) => {
  console.error('Erreur Firebase:', error);
  
  if (!error) {
    throw new Error('Une erreur inconnue est survenue');
  }

  if (typeof error === 'string') {
    throw new Error(error);
  }

  if (error.code === 'permission-denied') {
    throw new Error('Vous n\'avez pas les permissions nécessaires');
  }
  
  if (error.code === 'unavailable') {
    throw new Error('Service temporairement indisponible. Veuillez réessayer.');
  }

  if (error.code === 'not-found') {
    throw new Error('Document non trouvé');
  }

  if (error.message) {
    throw new Error(error.message);
  }
  
  throw new Error('Une erreur est survenue. Veuillez réessayer.');
};

export const firebaseService = {
  async createPlanning(planningData: any) {
    try {
      if (!planningData || !planningData.nom || !planningData.debut || !planningData.fin) {
        throw new Error('Données de planning incomplètes');
      }

      const docRef = await addDoc(collection(db, 'plannings'), {
        ...planningData,
        dateCreation: serverTimestamp(),
        derniereMiseAJour: serverTimestamp()
      });

      return docRef.id;
    } catch (error) {
      handleFirebaseError(error);
    }
  },

  async updatePlanning(planningId: string, planningData: any) {
    try {
      if (!planningId) {
        throw new Error('ID du planning manquant');
      }

      const planningRef = doc(db, 'plannings', planningId);
      await updateDoc(planningRef, {
        ...planningData,
        derniereMiseAJour: serverTimestamp()
      });
    } catch (error) {
      handleFirebaseError(error);
    }
  },

  async deletePlanning(planningId: string) {
    try {
      if (!planningId) {
        throw new Error('ID du planning manquant');
      }

      await deleteDoc(doc(db, 'plannings', planningId));
    } catch (error) {
      handleFirebaseError(error);
    }
  },

  async getPlannings() {
    try {
      const querySnapshot = await getDocs(collection(db, 'plannings'));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      handleFirebaseError(error);
      return [];
    }
  },

  async getActivePlannings() {
    try {
      const q = query(
        collection(db, 'plannings'),
        where('statut', '==', 'actif')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      handleFirebaseError(error);
      return [];
    }
  }
};

export default firebaseService;