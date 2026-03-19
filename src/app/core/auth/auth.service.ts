import { Injectable, PLATFORM_ID, inject, signal, computed } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

import {
  AuthUser,
  LoginCredentials,
  LoginResponse,
  RegisterCredentials,
  UpdatePasswordPayload,
  UpdateProfilePayload
} from './auth.model.js';
import { RoleUtilisateur } from '../../shared/models/utilisateur.model.js';
import { environment } from '../../../environments/environment.js';

const TOKEN_KEY = 'qf_token';
const USER_KEY  = 'qf_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly router     = inject(Router);
  private readonly http       = inject(HttpClient);

  private readonly _currentUser = signal<AuthUser | null>(this.loadUserFromStorage());
  readonly currentUser      = this._currentUser.asReadonly();
  readonly isAuthenticated  = computed(() => this._currentUser() !== null);
  readonly userRole         = computed(() => this._currentUser()?.role ?? null);
  readonly organisationId   = computed(() => this._currentUser()?.organisationId ?? null);

  login(credentials: LoginCredentials): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/auth/login`, credentials)
      .pipe(
        tap((res) => this.persistSession(res.user, res.token)),
        catchError((err) => {
          const msg: string =
            err?.error?.message ?? err?.message ?? 'Email ou mot de passe incorrect';
          return throwError(() => new Error(msg));
        })
      );
  }

  register(credentials: RegisterCredentials): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/auth/register`, credentials)
      .pipe(
        tap((res) => this.persistSession(res.user, res.token)),
        catchError((err) => {
          const msg: string =
            err?.error?.message ?? err?.message ?? 'Erreur lors de la création du compte';
          return throwError(() => new Error(msg));
        })
      );
  }

  updateProfile(payload: UpdateProfilePayload): Observable<{ message: string; user: AuthUser }> {
    return this.http
      .put<{ message: string; user: AuthUser }>(`${environment.apiUrl}/utilisateurs/me`, payload)
      .pipe(
        tap((res) => this.updateCurrentUser(res.user)),
        catchError((err) => {
          const msg: string = err?.error?.message ?? err?.message ?? 'Erreur de mise à jour du profil';
          return throwError(() => new Error(msg));
        })
      );
  }

  updatePassword(payload: UpdatePasswordPayload): Observable<{ message: string }> {
    return this.http
      .put<{ message: string }>(`${environment.apiUrl}/utilisateurs/me/password`, payload)
      .pipe(
        catchError((err) => {
          const msg: string = err?.error?.message ?? err?.message ?? 'Erreur de mise à jour du mot de passe';
          return throwError(() => new Error(msg));
        })
      );
  }

  logout(): void {
    this.clearSession();
    this.router.navigate(['/login']);
  }

  hasRole(roles: RoleUtilisateur[]): boolean {
    const role = this.userRole();
    return role !== null && roles.includes(role);
  }

  canCreate(): boolean {
    return this.hasRole(['Responsable Qualité']);
  }

  canEdit(): boolean {
    return this.hasRole(['Responsable Qualité', 'Pilote']);
  }

  canDeclareNC(): boolean {
    return this.hasRole(['Responsable Qualité', 'Auditeur', 'Pilote']);
  }

  getToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    return localStorage.getItem(TOKEN_KEY);
  }

  updateCurrentUser(next: Partial<AuthUser>): void {
    const user = this._currentUser();
    if (!user || !isPlatformBrowser(this.platformId)) return;

    const merged = { ...user, ...next };
    localStorage.setItem(USER_KEY, JSON.stringify(merged));
    this._currentUser.set(merged);
  }

  private persistSession(user: AuthUser, token: string): void {
    if (!isPlatformBrowser(this.platformId)) return;
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this._currentUser.set(user);
  }

  private clearSession(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this._currentUser.set(null);
  }

  private loadUserFromStorage(): AuthUser | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  }
}
