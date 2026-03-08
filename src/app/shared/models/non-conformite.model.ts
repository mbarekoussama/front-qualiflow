import { Utilisateur } from './utilisateur.model';

export type PrioriteNonConformite = 'Faible' | 'Moyenne' | 'Élevée' | 'Critique';
export type SourceNonConformite =
  | 'Audit interne'
  | 'Réclamation client'
  | 'Contrôle interne'
  | 'Externe';
export type StatutNonConformite = 'Ouverte' | 'En cours' | 'Clôturée' | 'Rejetée';

export interface NonConformite {
  id: string;
  description: string;
  processus: string;
  detectePar: Utilisateur;
  responsable: Utilisateur;
  dateDetection: Date;
  priorite: PrioriteNonConformite;
  source: SourceNonConformite;
  causeRacine?: string;
  statut: StatutNonConformite;
  avancement: number;
  actionsCorrectives: string[];
  preuves: string[];
  dateEcheance: Date;
}
