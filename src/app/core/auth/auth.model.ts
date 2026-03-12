import { RoleUtilisateur } from '../../shared/models/utilisateur.model';

export interface AuthUser {
  id: string;
  nom: string;
  prenom: string;
  initiales: string;
  email: string;
  role: RoleUtilisateur;
  couleur: string;
  organisationId: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  nom:              string;
  prenom:           string;
  email:            string;
  password:         string;
  organisationCode: string;
  fonction?:        string;
  role?:            string;
}

export interface LoginResponse {
  token: string;
  expiresIn: number;
  user: AuthUser;
}
