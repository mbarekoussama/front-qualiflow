import { Utilisateur } from './utilisateur.model';

export type StatutActionCorrective =
  | 'Planifiée'
  | 'En cours'
  | 'Réalisée'
  | 'Efficace'
  | 'Inefficace';

// ── API enum values ─────────────────────────────────────────────────────────────
export type StatutAction = 'PLANIFIEE' | 'EN_COURS' | 'REALISEE' | 'VERIFIEE';

// ── API response DTOs ────────────────────────────────────────────────────────────
export interface ActionCorrectiveListItemDto {
  id: string;
  nonConformiteId: string;
  ncReference: string;
  ncDescription: string;
  type: string;
  description: string;
  responsableId: string;
  responsableNom: string;
  responsableInitiales: string;
  responsableCouleur: string;
  dateEcheance: string;
  statut: StatutAction;
  dateRealisation?: string;
}

export interface ActionCorrectiveDetailDto extends ActionCorrectiveListItemDto {
  preuveEnregistrementId?: string;
}

export interface PagedResultAc {
  items: ActionCorrectiveListItemDto[];
  total: number;
  page: number;
  pageSize: number;
}

// ── Request DTOs ─────────────────────────────────────────────────────────────────
export interface AddActionCorrectiveDto {
  ncId: string;
  type: string;
  description: string;
  responsableId: string;
  dateEcheance: string;
}

export interface UpdateActionCorrectiveDto {
  id: string;
  type: string;
  description: string;
  responsableId: string;
  dateEcheance: string;
}

export interface UpdateActionCorrectiveStatutDto {
  actionId: string;
  nouveauStatut: StatutAction;
}

// ── Local display model (front-only, used in ac-list) ────────────────────────────
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

// ── Statut helpers ────────────────────────────────────────────────────────────────
export const STATUT_ACTION_LABELS: Record<StatutAction, string> = {
  PLANIFIEE: 'Planifiée',
  EN_COURS:  'En cours',
  REALISEE:  'Réalisée',
  VERIFIEE:  'Efficace',
};

