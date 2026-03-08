import { Utilisateur } from './utilisateur.model';

export type ProcessusType = 'Pilotage' | 'Opérationnel' | 'Support' | 'Mesure';
export type FrequenceRevue = 'Mensuelle' | 'Trimestrielle' | 'Semestrielle' | 'Annuelle';
export type StatutProcessus = 'Conforme' | 'À surveiller' | 'Non conforme';

export interface Processus {
  id: string;
  code: string;
  intitule: string;
  type: ProcessusType;
  objectif: string;
  perimetre: string;
  pilote: Utilisateur;
  clauseISO: string;
  frequenceRevue: FrequenceRevue;
  prochaineRevue: Date;
  tauxConformite: number;
  statut: StatutProcessus;
  indicateurs: string[];
  procedures: string[];
  documents: string[];
  dateCreation: Date;
  actif: boolean;
}
