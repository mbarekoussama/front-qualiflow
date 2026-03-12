export type StatutProcedure = 'ACTIF' | 'INACTIF';

// ─── List ──────────────────────────────────────────────────────
export interface ProcedureListItem {
  id:                 string;
  code:               string;
  titre:              string;
  objectif:           string;
  processusCode:      string;
  processusNom:       string;
  responsableNom:     string;
  statut:             StatutProcedure;
  dateCreation:       string;
  nombreInstructions: number;
}

// ─── Detail ────────────────────────────────────────────────────
export interface InstructionDto {
  id:          string;
  code:        string;
  titre:       string;
  description: string | null;
  statut:      string;
  dateCreation: string;
}

export interface ProcedureDetail {
  id:                 string;
  organisationId:     string;
  processusId:        string;
  processusCode:      string;
  processusNom:       string;
  code:               string;
  titre:              string;
  objectif:           string;
  domaineApplication: string | null;
  description:        string | null;
  responsableId:      string;
  responsableNom:     string;
  statut:             StatutProcedure;
  dateCreation:       string;
  instructions:       InstructionDto[];
}

// ─── Payloads ──────────────────────────────────────────────────
export interface CreateProcedureDto {
  organisationId:     string;
  processusId:        string;
  code:               string;
  titre:              string;
  objectif:           string;
  domaineApplication: string | null;
  description:        string | null;
  responsableId:      string;
}

export interface UpdateProcedureDto {
  id:                 string;
  processusId:        string;
  code:               string;
  titre:              string;
  objectif:           string;
  domaineApplication: string | null;
  description:        string | null;
  responsableId:      string;
  statut:             StatutProcedure;
}

export interface PagedResult<T> {
  items:    T[];
  total:    number;
  page:     number;
  pageSize: number;
}

export interface ProcedureFiltres {
  search?:      string;
  processusId?: string;
  statut?:      StatutProcedure;
  page?:        number;
  pageSize?:    number;
}
