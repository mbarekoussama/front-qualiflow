import { Utilisateur } from './utilisateur.model';

export type StatutActionCorrective =
  | 'Planifiée'
  | 'En cours'
  | 'Réalisée'
  | 'Efficace'
  | 'Inefficace';

export interface ActionCorrective {
  id: string;
  nonConformite: string;
  description: string;
  responsable: Utilisateur;
  dateEcheance: Date;
  statut: StatutActionCorrective;
  preuves: string[];
  dateVerification?: Date;
  verificateur?: Utilisateur;
  commentaireEfficacite?: string;
}

export interface CreateActionCorrectiveDto {
  nonConformite: string;
  description: string;
  responsableId: string;
  dateEcheance: string;
}
