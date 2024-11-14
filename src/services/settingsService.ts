import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
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
      throw error;
    }
  },

  async updateSettings(section: string, data: any) {
    try {
      const docRef = doc(db, 'settings', section);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        await updateDoc(docRef, data);
      } else {
        await setDoc(docRef, {
          ...data,
          dateCreation: new Date(),
          derniereMiseAJour: new Date()
        });
      }
    } catch (error) {
      console.error(`Erreur lors de la mise à jour des paramètres ${section}:`, error);
      throw error;
    }
  }
};