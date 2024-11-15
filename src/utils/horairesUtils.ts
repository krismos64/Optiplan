export interface HoraireCreneau {
  debut: string;
  fin: string;
}

/**
 * Vérifie si un créneau horaire est valide
 * @param creneau - L'objet HoraireCreneau à vérifier
 * @returns boolean - true si le créneau est valide, sinon false
 */
export const isCreneauValid = (creneau: HoraireCreneau): boolean => {
  return !!creneau.debut && !!creneau.fin;
};

/**
 * Met à jour l'heure de début d'un créneau
 * @param creneau - L'objet HoraireCreneau à mettre à jour
 * @param debut - La nouvelle heure de début
 * @returns HoraireCreneau - L'objet créneau mis à jour
 */
export const updateDebut = (
  creneau: HoraireCreneau,
  debut: string
): HoraireCreneau => {
  return { ...creneau, debut };
};

/**
 * Met à jour l'heure de fin d'un créneau
 * @param creneau - L'objet HoraireCreneau à mettre à jour
 * @param fin - La nouvelle heure de fin
 * @returns HoraireCreneau - L'objet créneau mis à jour
 */
export const updateFin = (
  creneau: HoraireCreneau,
  fin: string
): HoraireCreneau => {
  return { ...creneau, fin };
};

/**
 * Vérifie si deux créneaux horaires se chevauchent
 * @param creneau1 - Premier créneau horaire
 * @param creneau2 - Deuxième créneau horaire
 * @returns boolean - true si les créneaux se chevauchent, sinon false
 */
export const areCreneauxOverlapping = (
  creneau1: HoraireCreneau,
  creneau2: HoraireCreneau
): boolean => {
  if (!isCreneauValid(creneau1) || !isCreneauValid(creneau2)) {
    return false;
  }
  return creneau1.debut < creneau2.fin && creneau1.fin > creneau2.debut;
};

/**
 * Filtre et retourne les créneaux valides
 * @param creneaux - Liste des créneaux horaires à vérifier
 * @returns HoraireCreneau[] - Liste des créneaux valides
 */
export const filterValidCreneaux = (
  creneaux: HoraireCreneau[]
): HoraireCreneau[] => {
  return creneaux.filter(isCreneauValid);
};
