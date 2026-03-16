import { Utilisateur } from './utilisateur.model';

// ── Backend enum types ───────────────────────────────────────────────────────
export type GraviteNC      = 'MINEURE' | 'MAJEURE' | 'CRITIQUE';
export type SourceNC       = 'AUDIT' | 'POINT_CONTROLE' | 'RECLAMATION' | 'AUTRE';
export type StatutNC       = 'OUVERTE' | 'ANALYSE' | 'ACTION_EN_COURS' | 'CLOTUREE';
export type StatutAction   = 'PLANIFIEE' | 'EN_COURS' | 'REALISEE' | 'VERIFIEE';
export type MethodeAnalyse = '_5M' | 'ISHIKAWA' | '_5WHY' | 'AUTRE';

// Legacy aliases (kept for template compatibility where needed)
export type PrioriteNonConformite = GraviteNC;
export type SourceNonConformite   = SourceNC;
export type StatutNonConformite   = StatutNC;

// ── Display label maps ────────────────────────────────────────────────────────
export const GRAVITE_LABEL: Record<GraviteNC, string> = {
  MINEURE: 'Mineure', MAJEURE: 'Majeure', CRITIQUE: 'Critique'
};
export const STATUT_NC_LABEL: Record<StatutNC, string> = {
  OUVERTE: 'Ouverte', ANALYSE: 'Analyse', ACTION_EN_COURS: 'En cours', CLOTUREE: 'Clôturée'
};
export const SOURCE_NC_LABEL: Record<SourceNC, string> = {
  AUDIT: 'Audit interne', POINT_CONTROLE: 'Point de contrôle',
  RECLAMATION: 'Réclamation', AUTRE: 'Autre'
};
export const STATUT_ACTION_LABEL: Record<StatutAction, string> = {
  PLANIFIEE: 'Planifiée', EN_COURS: 'En cours', REALISEE: 'Réalisée', VERIFIEE: 'Vérifiée'
};
export const METHODE_LABEL: Record<MethodeAnalyse, string> = {
  _5M: '5M (Ishikawa)', ISHIKAWA: 'Ishikawa', _5WHY: '5 Pourquoi', AUTRE: 'Autre'
};

// ── Embedded user (lighter than full Utilisateur) ────────────────────────────
export interface NcUserProfil {
  id: string;
  nom: string;
  prenom: string;
  initiales: string;
  email: string;
  role: string;
  couleur: string;
}

// ── Action corrective (display) ──────────────────────────────────────────────
export interface ActionCorrectiveItem {
  id: string;
  type: string;
  description: string;
  responsable: NcUserProfil;
  dateEcheance: Date;
  statut: StatutAction;
  dateRealisation: Date | null;
}

// ── Analyse de cause (display) ───────────────────────────────────────────────
export interface AnalyseCauseItem {
  id: string;
  methodeAnalyse: MethodeAnalyse;
  description: string;
  dateAnalyse: Date;
  analysePar: NcUserProfil;
}

// ── Historique (display) ─────────────────────────────────────────────────────
export interface HistoriqueNcItem {
  id: string;
  ancienStatut: StatutNC;
  nouveauStatut: StatutNC;
  dateChangement: Date;
  changeParNom: string;
  commentaire: string | null;
}

// ── Display model (backward-compatible with HTML templates) ──────────────────
export interface NonConformite {
  id: string;              // UUID — for routing
  reference: string;       // NC-001 — for display
  description: string;
  processus: string;       // processusNom
  detectePar: NcUserProfil;
  responsable: NcUserProfil;
  dateDetection: Date;
  priorite: GraviteNC;     // was French string, now enum
  source: SourceNC;        // was French string, now enum
  causeRacine?: string;    // first analysis description if available
  statut: StatutNC;        // was French string, now enum
  avancement: number;
  actionsCorrectives: ActionCorrectiveItem[];
  preuves: string[];
  dateEcheance: Date;
  // extras for detail view
  nature?: string;
  type?: string;
  analysesCauses?: AnalyseCauseItem[];
  historique?: HistoriqueNcItem[];
}

// ── API Response types (match backend DTOs exactly) ──────────────────────────
export interface NcApiListItem {
  id: string;
  reference: string;
  description: string;
  nature: string;
  type: string;
  processusId: string;
  processusNom: string;
  source: SourceNC;
  gravite: GraviteNC;
  statut: StatutNC;
  avancement: number;
  responsableId: string;
  responsableNom: string;
  responsableInitiales: string;
  responsableCouleur: string;
  dateDetection: string;
  dateEcheance: string;
  nbActionsCorrectives: number;
}

export interface NcApiActionCorrective {
  id: string;
  type: string;
  description: string;
  responsableId: string;
  responsableNom: string;
  responsableInitiales: string;
  responsableCouleur: string;
  dateEcheance: string;
  statut: StatutAction;
  dateRealisation: string | null;
}

export interface NcApiAnalyseCause {
  id: string;
  methodeAnalyse: MethodeAnalyse;
  description: string;
  dateAnalyse: string;
  analyseParId: string;
  analyseParNom: string;
  analyseParInitiales: string;
}

export interface NcApiHistorique {
  id: string;
  ancienStatut: StatutNC;
  nouveauStatut: StatutNC;
  dateChangement: string;
  changeParNom: string;
  commentaire: string | null;
}

export interface NcApiDetail {
  id: string;
  reference: string;
  description: string;
  nature: string;
  type: string;
  processusId: string;
  processusNom: string;
  source: SourceNC;
  gravite: GraviteNC;
  statut: StatutNC;
  avancement: number;
  detecteParId: string;
  detecteParNom: string;
  detecteParInitiales: string;
  detecteParCouleur: string;
  responsableId: string;
  responsableNom: string;
  responsableInitiales: string;
  responsableCouleur: string;
  dateDetection: string;
  dateEcheance: string;
  analysesCauses: NcApiAnalyseCause[];
  actionsCorrectives: NcApiActionCorrective[];
  historique: NcApiHistorique[];
}

export interface NcApiPagedResult {
  items: NcApiListItem[];
  total: number;
  page: number;
  pageSize: number;
}

// ── Form DTO ──────────────────────────────────────────────────────────────────
export interface CreateNcDto {
  organisationId: string;
  processusId: string;
  description: string;
  nature: string;
  type: string;
  source: SourceNC;
  gravite: GraviteNC;
  responsableTraitementId: string;
  dateEcheance: string;
  detecteParId: string;
}

export interface UpdateNcStatutDto {
  id: string;
  nouveauStatut: StatutNC;
  changeParId: string;
  commentaire?: string;
}

export interface AddActionCorrectiveDto {
  ncId: string;
  type: string;
  description: string;
  responsableId: string;
  dateEcheance: string;
}

export interface UpdateActionCorrectiveStatutDto {
  actionId: string;
  nouveauStatut: StatutAction;
}

export interface AddAnalyseCauseDto {
  ncId: string;
  methodeAnalyse: MethodeAnalyse;
  description: string;
  analyseParId: string;
}

