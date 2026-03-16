import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  AddIndicateurValeurDto,
  CreateIndicateurDto,
  Indicateur,
  IndicateurDetailDto,
  IndicateurListItemDto,
  IndicateurValeurDto,
  ValeurIndicateur,
  UpdateIndicateurDto
} from '../../shared/models/indicateur.model';
import { RoleUtilisateur, Utilisateur } from '../../shared/models/utilisateur.model';

export interface IndicateurFilters {
  processusId?: string;
}

interface UtilisateurApiDto {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: string;
  initiales: string;
  couleur: string;
}

@Injectable({ providedIn: 'root' })
export class IndicateurService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/indicateurs`;
  private readonly usersUrl = `${environment.apiUrl}/utilisateurs`;

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly items = signal<Indicateur[]>([]);
  readonly selected = signal<Indicateur | null>(null);
  readonly utilisateurs = signal<Utilisateur[]>([]);

  async chargerListe(organisationId: string, filtres: IndicateurFilters = {}): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      let params = new HttpParams().set('organisationId', organisationId);
      if (filtres.processusId) params = params.set('processusId', filtres.processusId);

      const data = await firstValueFrom(
        this.http.get<IndicateurListItemDto[]>(this.apiUrl, { params })
      );
      this.items.set(data.map((d) => this.mapIndicateur(d)));
    } catch (e: any) {
      this.error.set(e?.message ?? 'Erreur de chargement des indicateurs.');
    } finally {
      this.loading.set(false);
    }
  }

  async chargerDetail(id: string): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const data = await firstValueFrom(
        this.http.get<IndicateurDetailDto>(`${this.apiUrl}/${id}`)
      );
      this.selected.set(this.mapIndicateur(data));
    } catch (e: any) {
      this.error.set(e?.message ?? 'Indicateur introuvable.');
    } finally {
      this.loading.set(false);
    }
  }

  async creer(dto: CreateIndicateurDto): Promise<string | null> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const res = await firstValueFrom(
        this.http.post<{ id: string }>(this.apiUrl, dto)
      );
      return res.id;
    } catch (e: any) {
      this.error.set(e?.error?.errors?.[0]?.message ?? e?.message ?? 'Erreur de création.');
      return null;
    } finally {
      this.loading.set(false);
    }
  }

  async modifier(id: string, dto: UpdateIndicateurDto): Promise<boolean> {
    this.loading.set(true);
    this.error.set(null);
    try {
      await firstValueFrom(this.http.put<void>(`${this.apiUrl}/${id}`, dto));
      return true;
    } catch (e: any) {
      this.error.set(e?.message ?? 'Erreur de modification.');
      return false;
    } finally {
      this.loading.set(false);
    }
  }

  async supprimer(id: string): Promise<boolean> {
    this.loading.set(true);
    this.error.set(null);
    try {
      await firstValueFrom(this.http.delete<void>(`${this.apiUrl}/${id}`));
      return true;
    } catch (e: any) {
      this.error.set(e?.message ?? 'Erreur de suppression.');
      return false;
    } finally {
      this.loading.set(false);
    }
  }

  async ajouterValeur(indicateurId: string, dto: AddIndicateurValeurDto): Promise<boolean> {
    this.loading.set(true);
    this.error.set(null);
    try {
      await firstValueFrom(
        this.http.post<{ id: string }>(`${this.apiUrl}/${indicateurId}/valeurs`, dto)
      );
      return true;
    } catch (e: any) {
      this.error.set(e?.message ?? 'Erreur lors de l\'ajout de la valeur.');
      return false;
    } finally {
      this.loading.set(false);
    }
  }

  async chargerUtilisateurs(organisationId: string): Promise<void> {
    try {
      const users = await firstValueFrom(
        this.http.get<UtilisateurApiDto[]>(this.usersUrl, {
          params: new HttpParams().set('organisationId', organisationId)
        })
      );
      this.utilisateurs.set(users.map((u) => ({
        id: u.id,
        nom: u.nom,
        prenom: u.prenom,
        initiales: u.initiales,
        email: u.email,
        role: this.mapRole(u.role),
        couleur: u.couleur
      })));
    } catch {
      // silent
    }
  }

  private mapValeur(dto: IndicateurValeurDto): ValeurIndicateur {
    return {
      id: dto.id,
      periode: dto.periode,
      valeur: dto.valeur,
      commentaire: dto.commentaire ?? null,
      dateMesure: new Date(dto.dateMesure),
      saisiePar: this.buildUserProfil(
        dto.saisieParId,
        dto.saisieParNom,
        dto.saisieParInitiales,
        dto.saisieParCouleur
      )
    };
  }

  private mapIndicateur(
    dto: IndicateurListItemDto | IndicateurDetailDto
  ): Indicateur {
    return {
      id: dto.id,
      code: dto.code,
      nom: dto.nom,
      description: dto.description ?? null,
      processusId: dto.processusId,
      processusNom: dto.processusNom,
      methodeCalcul: dto.methodeCalcul ?? null,
      unite: dto.unite ?? null,
      valeurCible: dto.valeurCible,
      seuilAlerte: dto.seuilAlerte,
      frequenceMesure: dto.frequenceMesure,
      responsable: this.buildUserProfil(
        dto.responsableId,
        dto.responsableNom,
        dto.responsableInitiales,
        dto.responsableCouleur
      ),
      valeurs: dto.valeurs.map((v) => this.mapValeur(v)),
      statut: dto.statut,
      dateCreation: new Date(dto.dateCreation)
    };
  }

  private buildUserProfil(
    id: string,
    fullNom: string,
    initiales: string,
    couleur: string
  ): Utilisateur {
    const parts = fullNom.trim().split(' ');
    return {
      id,
      prenom: parts[0] ?? '',
      nom: parts.slice(1).join(' '),
      initiales: initiales || (fullNom.length > 0
        ? (parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')
        : ''),
      email: '',
      role: 'Pilote',
      couleur: couleur || '#2d7a4f'
    };
  }

  private mapRole(role: string): RoleUtilisateur {
    switch (role) {
      case 'ADMIN_ORG':
        return 'Admin';
      case 'RESPONSABLE_SMQ':
        return 'Responsable Qualité';
      case 'AUDITEUR':
        return 'Auditeur';
      default:
        return 'Pilote';
    }
  }
}
