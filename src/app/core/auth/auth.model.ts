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
  avatar?: string;
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
  organisationName: string;
  organisationCode: string;
}

export interface LoginResponse {
  token: string;
  expiresIn: number;
  user: AuthUser;
}

export interface UpdateProfilePayload {
  nom: string;
  prenom: string;
  email: string;
}

export interface UpdatePasswordPayload {
  currentPassword: string;
  newPassword: string;
}
