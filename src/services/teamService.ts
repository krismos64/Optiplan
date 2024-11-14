import {
  collection,
  updateDoc,
  doc,
  getDocs,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { planningService } from "./planningService";

export interface TeamMember {
  id?: string;
  nom: string;
  heuresHebdo: number;
  compteurHeures: number;
}

export const teamService = {
  async mettreAJourCompteurHeures(
    membreId: string,
    debut: string,
    fin: string
  ) {
    try {
      const heuresTravaillees = await planningService.calculerHeuresMembre(
        membreId,
        debut,
        fin
      );
      const membreRef = doc(db, "team", membreId);
      const heuresContrat = (
        await getDocs(
          query(collection(db, "team"), where("id", "==", membreId))
        )
      ).docs[0].data().heuresHebdo;

      // Calculer la différence entre les heures travaillées et les heures contractuelles
      const difference = heuresTravaillees - heuresContrat;

      await updateDoc(membreRef, {
        compteurHeures: difference,
        derniereMiseAJour: Timestamp.now(),
      });

      return difference;
    } catch (error) {
      console.error(
        "Erreur lors de la mise à jour du compteur d'heures:",
        error
      );
      throw error;
    }
  },
};
