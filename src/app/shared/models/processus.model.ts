// ── ISO_Quality Processus models ────────────────────────────

export type TypeProcessus   = 'PILOTAGE' | 'REALISATION' | 'SUPPORT';
export type StatutProcessus = 'ACTIF' | 'INACTIF';
export type TypeActeur = 'PILOTE' | 'COPILOTE' | 'CONTRIBUTEUR' | 'OBSERVATEUR';

export interface PiloteInfo {
  id: string;
  nom: string;
  prenom: string;
  fonction?: string;
  initiales: string;
}

export interface ActeurInfo {
  utilisateurId: string;
  nomComplet: string;
  typeActeur: TypeActeur;
  dateAffectation: string;
}

export interface ProcessusListItem {
  id: string;
  code: string;
  nom: string;
  description?: string;
  type: TypeProcessus;
  statut: StatutProcessus;
  piloteInitiales: string;
  piloteNomComplet: string;
  nombreProcedures: number;
  nombreDocuments: number;
  nombreIndicateurs: number;
  nombreNC: number;
}

export interface Processus {
  id: string;
  organisationId: string;
  code: string;
  nom: string;
  description?: string;
  type: TypeProcessus;
  statut: StatutProcessus;
  finalites: string[];
  perimetres: string[];
  fournisseurs: string[];
  clients: string[];
  donneesEntree: string[];
  donneesSortie: string[];
  objectifs: string[];
  pilote: PiloteInfo;
  acteurs: ActeurInfo[];
  nombreProcedures: number;
  nombreDocuments: number;
  nombreIndicateurs: number;
  nombreNC: number;
  nombrePointsControle: number;
  dateCreation: string;
}

export interface CreateProcessusDto {
  organisationId: string;
  code: string;
  nom: string;
  description?: string;
  type: TypeProcessus;
  finalites: string[];
  perimetres: string[];
  fournisseurs: string[];
  clients: string[];
  donneesEntree: string[];
  donneesSortie: string[];
  objectifs: string[];
  piloteId: string;
}

export interface UpdateProcessusDto {
  id: string;
  code: string;
  nom: string;
  description?: string;
  type: TypeProcessus;
  statut: StatutProcessus;
  finalites: string[];
  perimetres: string[];
  fournisseurs: string[];
  clients: string[];
  donneesEntree: string[];
  donneesSortie: string[];
  objectifs: string[];
  piloteId: string;
}

export interface ProcessusFiltres {
  search?: string;
  type?: TypeProcessus | '';
  statut?: StatutProcessus | '';
  page?: number;
  pageSize?: number;
}

export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Legacy aliases for backward compat with other components
export type ProcessusType = TypeProcessus;
export type FrequenceRevue = 'MENSUEL' | 'TRIMESTRIEL' | 'SEMESTRIEL' | 'ANNUEL';
export type StatutProcessusLegacy = StatutProcessus;
