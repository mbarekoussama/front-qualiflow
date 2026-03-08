import { Utilisateur } from './utilisateur.model';

export type DocumentType = 'Manuel' | 'Procédure' | 'Enregistrement' | 'Formulaire';
export type StatutDocument = 'Approuvé' | 'En révision' | 'Périmé' | 'Brouillon';

export interface VersionDocument {
  numero: string;
  dateCreation: Date;
  auteur: Utilisateur;
  commentaire: string;
  fichierUrl: string;
  statut: 'Actuelle' | 'Archivée';
  validePar?: Utilisateur;
  dateValidation?: Date;
}

export interface DocumentMetadonnees {
  format: string;
  taille: number;
  langue: string;
  motsCles: string[];
}

export interface Document {
  id: string;
  intitule: string;
  type: DocumentType;
  processus: string;
  procedure?: string;
  versions: VersionDocument[];
  versionCourante: string;
  statut: StatutDocument;
  responsable: Utilisateur;
  metadonnees: DocumentMetadonnees;
  diffusion: string[];
  dateCreation: Date;
}
