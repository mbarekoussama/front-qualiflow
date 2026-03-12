// ── Enums aligned with backend ──────────────────────────────
export type TypeDocument  = 'REFERENCE' | 'TRAVAIL';
export type StatutVersion = 'BROUILLON' | 'EN_REVISION' | 'VALIDE' | 'OBSOLETE';

// ── DTOs from API ────────────────────────────────────────────
export interface VersionDocumentDto {
  id: string;
  numeroVersion: string;
  statut: StatutVersion;
  fichierPath?: string;
  commentaireRevision?: string;
  etabliParId: string;
  etabliParNom: string;
  dateEtablissement: string;
  verifieParId?: string;
  verifieParNom?: string;
  dateVerification?: string;
  valideParId?: string;
  valideParNom?: string;
  dateValidation?: string;
  dateMiseEnVigueur?: string;
}

export interface DocumentListItem {
  id: string;
  code: string;
  titre: string;
  typeDocument: TypeDocument;
  processusCode?: string;
  actif: boolean;
  dateCreation: string;
  derniereVersion: string;
  statutDerniereVersion: StatutVersion;
  etabliParNom: string;
}

export interface DocumentDetail {
  id: string;
  organisationId: string;
  processusId?: string;
  processusCode?: string;
  code: string;
  titre: string;
  typeDocument: TypeDocument;
  description?: string;
  actif: boolean;
  dateCreation: string;
  versions: VersionDocumentDto[];
}

// ── Create/Update DTOs ───────────────────────────────────────
export interface CreateDocumentDto {
  organisationId: string;
  processusId?: string;
  code: string;
  titre: string;
  typeDocument: TypeDocument;
  description?: string;
  numeroVersion: string;
  etabliParId: string;
  commentaireRevision?: string;
  fichierPath?: string;
}

export interface UpdateDocumentDto {
  id: string;
  processusId?: string;
  code: string;
  titre: string;
  typeDocument: TypeDocument;
  description?: string;
  actif: boolean;
}

export interface AjouterVersionDto {
  documentId: string;
  organisationId: string;
  numeroVersion: string;
  etabliParId: string;
  commentaireRevision?: string;
  fichierPath?: string;
}

export interface ChangerStatutVersionDto {
  versionId: string;
  nouveauStatut: StatutVersion;
  utilisateurId: string;
  dateMiseEnVigueur?: string;
}

// ── Paged result ─────────────────────────────────────────────
export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface DocumentFiltres {
  search?: string;
  type?: TypeDocument;
  statut?: StatutVersion;
  processusId?: string;
  page?: number;
  pageSize?: number;
}
