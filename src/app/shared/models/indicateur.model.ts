import { Utilisateur } from './utilisateur.model';

export type FrequenceIndicateur = 'Mensuelle' | 'Trimestrielle' | 'Semestrielle' | 'Annuelle';
export type TendanceIndicateur = 'Hausse' | 'Baisse' | 'Stable';

export interface ValeurIndicateur {
  periode: string;
  valeur: number;
  commentaire?: string;
  saisiePar: Utilisateur;
  dateSaisie: Date;
}

export interface Indicateur {
  id: string;
  intitule: string;
  processus: string;
  formule: string;
  unite: string;
  cible: number;
  seuilAlerte: number;
  frequence: FrequenceIndicateur;
  responsable: Utilisateur;
  valeurs: ValeurIndicateur[];
  tendance: TendanceIndicateur;
}

export interface CreateIndicateurDto {
  intitule: string;
  processus: string;
  formule: string;
  unite: string;
  cible: number;
  seuilAlerte: number;
  frequence: FrequenceIndicateur;
  responsableId: string;
}
