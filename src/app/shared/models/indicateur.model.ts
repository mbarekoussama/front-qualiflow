import { Utilisateur } from './utilisateur.model';

export type FrequenceMesure =
  | 'QUOTIDIEN'
  | 'HEBDOMADAIRE'
  | 'MENSUEL'
  | 'TRIMESTRIEL'
  | 'ANNUEL';

export type StatutIndicateur = 'ACTIF' | 'INACTIF';
export type TendanceIndicateur = 'Hausse' | 'Baisse' | 'Stable';

export const FREQUENCE_LABEL: Record<FrequenceMesure, string> = {
  QUOTIDIEN: 'Quotidien',
  HEBDOMADAIRE: 'Hebdomadaire',
  MENSUEL: 'Mensuel',
  TRIMESTRIEL: 'Trimestriel',
  ANNUEL: 'Annuel'
};

export interface ValeurIndicateur {
  id?: string;
  periode: string;
  valeur: number;
  commentaire?: string | null;
  saisiePar: Utilisateur;
  dateMesure: Date;
}

export interface Indicateur {
  id: string;
  code: string;
  nom: string;
  description?: string | null;
  processusId: string;
  processusNom: string;
  methodeCalcul?: string | null;
  unite?: string | null;
  valeurCible: number;
  seuilAlerte: number;
  frequenceMesure: FrequenceMesure;
  responsable: Utilisateur;
  valeurs: ValeurIndicateur[];
  statut: StatutIndicateur;
  dateCreation: Date;
}

// API DTOs
export interface IndicateurValeurDto {
  id: string;
  periode: string;
  valeur: number;
  commentaire?: string | null;
  dateMesure: string;
  saisieParId: string;
  saisieParNom: string;
  saisieParInitiales: string;
  saisieParCouleur: string;
}

export interface IndicateurListItemDto {
  id: string;
  code: string;
  nom: string;
  description?: string | null;
  processusId: string;
  processusNom: string;
  methodeCalcul?: string | null;
  unite?: string | null;
  valeurCible: number;
  seuilAlerte: number;
  frequenceMesure: FrequenceMesure;
  responsableId: string;
  responsableNom: string;
  responsableInitiales: string;
  responsableCouleur: string;
  statut: StatutIndicateur;
  dateCreation: string;
  valeurs: IndicateurValeurDto[];
}

export interface IndicateurDetailDto extends IndicateurListItemDto {
  organisationId: string;
}

export interface CreateIndicateurDto {
  organisationId: string;
  processusId: string;
  code: string;
  nom: string;
  description?: string | null;
  methodeCalcul?: string | null;
  unite?: string | null;
  valeurCible: number;
  seuilAlerte: number;
  frequenceMesure: FrequenceMesure;
  responsableId: string;
}

export interface UpdateIndicateurDto {
  id: string;
  processusId: string;
  code: string;
  nom: string;
  description?: string | null;
  methodeCalcul?: string | null;
  unite?: string | null;
  valeurCible: number;
  seuilAlerte: number;
  frequenceMesure: FrequenceMesure;
  responsableId: string;
  statut: StatutIndicateur;
}

export interface AddIndicateurValeurDto {
  periode: string;
  valeur: number;
  commentaire?: string | null;
  saisieParId: string;
  dateMesure?: string | null;
}
