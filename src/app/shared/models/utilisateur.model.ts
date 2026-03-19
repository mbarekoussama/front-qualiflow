export type RoleUtilisateur =
  | 'Admin'
  | 'Responsable Qualité'
  | 'Auditeur'
  | 'Utilisateur'
  | 'Pilote'
  | 'Lecteur';

export interface Utilisateur {
  id: string;
  nom: string;
  prenom: string;
  initiales: string;
  email: string;
  role: RoleUtilisateur;
  avatar?: string;
  couleur: string;
}
