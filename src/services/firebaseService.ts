import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../config/firebase";

// Gestionnaire d'erreurs Firebase
const handleFirebaseError = (error: any) => {
  console.error("Erreur Firebase:", error);

  if (!error) {
    throw new Error("Une erreur inconnue est survenue");
  }

  if (typeof error === "string") {
    throw new Error(error);
  }

  if (error.code === "permission-denied") {
    throw new Error("Vous n'avez pas les permissions nécessaires");
  }

  if (error.code === "unavailable") {
    throw new Error("Service temporairement indisponible. Veuillez réessayer.");
  }

  if (error.code === "not-found") {
    throw new Error("Document non trouvé");
  }

  if (error.message) {
    throw new Error(error.message);
  }

  throw new Error("Une erreur est survenue. Veuillez réessayer.");
};

// Types des données
interface Planning {
  id?: string;
  nom: string;
  debut: string;
  fin: string;
  membres: string[]; // IDs des membres associés
  jours?: any[];
}

interface TeamMember {
  id: string;
  nom: string;
  heuresHebdo: number;
}

export const firebaseService = {
  // Créer un planning
  async createPlanning(planningData: Planning) {
    try {
      if (!planningData.nom || !planningData.debut || !planningData.fin) {
        throw new Error("Données de planning incomplètes");
      }

      const docRef = await addDoc(collection(db, "plannings"), {
        ...planningData,
        dateCreation: serverTimestamp(),
        derniereMiseAJour: serverTimestamp(),
      });

      return docRef.id;
    } catch (error) {
      handleFirebaseError(error);
    }
  },

  // Mettre à jour un planning existant
  async updatePlanning(planningId: string, planningData: Partial<Planning>) {
    try {
      if (!planningId) {
        throw new Error("ID du planning manquant");
      }

      const planningRef = doc(db, "plannings", planningId);
      await updateDoc(planningRef, {
        ...planningData,
        derniereMiseAJour: serverTimestamp(),
      });
    } catch (error) {
      handleFirebaseError(error);
    }
  },

  // Supprimer un planning
  async deletePlanning(planningId: string) {
    try {
      if (!planningId) {
        throw new Error("ID du planning manquant");
      }

      await deleteDoc(doc(db, "plannings", planningId));
    } catch (error) {
      handleFirebaseError(error);
    }
  },

  // Récupérer tous les plannings
  async getPlannings(): Promise<Planning[]> {
    try {
      const querySnapshot = await getDocs(collection(db, "plannings"));
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        nom: doc.data().nom,
        debut: doc.data().debut,
        fin: doc.data().fin,
        membres: doc.data().membres,
        jours: doc.data().jours || [],
      })) as Planning[];
    } catch (error) {
      handleFirebaseError(error);
      return [];
    }
  },
  // Récupérer les membres d'équipe
  async getTeamMembers(): Promise<TeamMember[]> {
    try {
      const teamRef = collection(db, "team");
      const querySnapshot = await getDocs(teamRef);

      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as TeamMember[];
    } catch (error) {
      handleFirebaseError(error);
      return [];
    }
  },
};

export default firebaseService;
