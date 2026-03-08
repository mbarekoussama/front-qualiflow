import { RoleUtilisateur } from '../../shared/models/utilisateur.model';

export interface AuthUser {
  id: string;
  nom: string;
  prenom: string;
  initiales: string;
  email: string;
  role: RoleUtilisateur;
  couleur: string;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: AuthUser;
  token: string;
  expiresIn: number;
}
