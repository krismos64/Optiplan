import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export const settingsService = {
  async getSettings(section: string) {
    try {
      const docRef = doc(db, 'settings', section);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data();
      }
      
      return null;
    } catch (error) {
      console.error(`Erreur lors de la récupération des paramètres ${section}:`, error);
      throw new Error('Impossible de récupérer les paramètres');
    }
  },

  async updateSettings(section: string, data: any) {
    try {
      const docRef = doc(db, 'settings', section);
      await setDoc(docRef, {
        ...data,
        derniereMiseAJour: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Erreur lors de la mise à jour des paramètres ${section}:`, error);
      throw new Error('Impossible de sauvegarder les paramètres');
    }
  }
};