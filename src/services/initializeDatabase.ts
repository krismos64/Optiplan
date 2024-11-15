import { collection, getDocs, addDoc, setDoc, doc } from "firebase/firestore";
import { db } from "../config/firebase";

const defaultHoraires = {
  lundi: { debut: "08:30", fin: "20:15", ferme: false },
  mardi: { debut: "08:30", fin: "20:15", ferme: false },
  mercredi: { debut: "08:30", fin: "20:15", ferme: false },
  jeudi: { debut: "08:30", fin: "20:15", ferme: false },
  vendredi: { debut: "08:30", fin: "20:15", ferme: false },
  samedi: { debut: "08:30", fin: "20:15", ferme: false },
  dimanche: { debut: "08:45", fin: "12:30", ferme: false },
};

export const initializeDatabase = async () => {
  try {
    // Vérifier si la collection plannings existe
    const planningsRef = collection(db, "plannings");
    const planningsSnapshot = await getDocs(planningsRef);

    // Créer la structure de base si nécessaire
    if (planningsSnapshot.empty) {
      await setDoc(doc(db, "config", "plannings"), {
        horairesDefaut: defaultHoraires,
        version: "1.0",
        lastUpdate: new Date(),
      });
    }

    // Vérifier si la collection team existe
    const teamRef = collection(db, "team");
    const teamSnapshot = await getDocs(teamRef);

    if (teamSnapshot.empty) {
      // Créer un membre d'équipe par défaut sans les champs indésirables
      await addDoc(teamRef, {
        nom: "Admin",
        heuresHebdo: 35,
        dateCreation: new Date(),
      });
    }

    console.log("Base de données initialisée avec succès");
  } catch (error) {
    console.error(
      "Erreur lors de l'initialisation de la base de données:",
      error
    );
    throw error;
  }
};
