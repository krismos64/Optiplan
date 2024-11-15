import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { db } from "../config/firebase";

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
  isManual: boolean;
  derniereMiseAJour: string;
  creePar: string;
}

export const planningService = {
  async creerPlanning(planningData: Omit<Planning, "id">) {
    try {
      // Vérifier les données requises
      if (!planningData.nom || !planningData.debut || !planningData.fin) {
        throw new Error("Données de planning incomplètes");
      }

      // Créer le document dans Firestore
      const docRef = await addDoc(collection(db, "plannings"), {
        ...planningData,
        dateCreation: Timestamp.now(),
        derniereMiseAJour: Timestamp.now(),
      });

      return docRef.id;
    } catch (error) {
      console.error("Erreur lors de la création du planning:", error);
      throw error;
    }
  },

  async mettreAJourPlanning(id: string, planningData: Partial<Planning>) {
    try {
      const planningRef = doc(db, "plannings", id);
      await updateDoc(planningRef, {
        ...planningData,
        derniereMiseAJour: Timestamp.now(),
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour du planning:", error);
      throw error;
    }
  },

  async getPlanningsPeriode(debut: string, fin: string) {
    try {
      const q = query(
        collection(db, "plannings"),
        where("debut", ">=", debut),
        where("fin", "<=", fin)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Planning[];
    } catch (error) {
      console.error("Erreur lors de la récupération des plannings:", error);
      throw error;
    }
  },
};
