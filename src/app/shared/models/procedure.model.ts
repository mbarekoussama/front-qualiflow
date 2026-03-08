import { Utilisateur } from './utilisateur.model';

export type StatutProcedure = 'Active' | 'En révision' | 'Archivée';

export interface EtapeProcedure {
  ordre: number;
  description: string;
  responsable: string;
  delai?: string;
}

export interface Procedure {
  id: string;
  intitule: string;
  processusParent: string;
  description: string;
  responsable: Utilisateur;
  etapes: EtapeProcedure[];
  ressources: string[];
  documents: string[];
  statut: StatutProcedure;
  dateCreation: Date;
  dateMiseAJour: Date;
}

export interface CreateProcedureDto {
  intitule: string;
  processusParent: string;
  description: string;
  responsableId: string;
  etapes: EtapeProcedure[];
  ressources: string[];
  documents: string[];
  statut: StatutProcedure;
}
