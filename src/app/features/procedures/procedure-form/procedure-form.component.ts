import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { ProcedureService } from '../../../core/services/procedure.service';
import { ProcessusService } from '../../../core/services/processus.service';
import { AuthService } from '../../../core/auth/auth.service';
import { environment } from '../../../../environments/environment';
import { CreateProcedureDto, StatutProcedure, UpdateProcedureDto } from '../../../shared/models/procedure.model';

interface UtilisateurOption { id: string; nom: string; prenom: string; actif: boolean; }

@Component({
  selector: 'app-procedure-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './procedure-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProcedureFormComponent implements OnInit {
  private readonly svc          = inject(ProcedureService);
  private readonly processusSvc = inject(ProcessusService);
  private readonly http         = inject(HttpClient);
  private readonly router       = inject(Router);
  private readonly route        = inject(ActivatedRoute);

  private readonly auth = inject(AuthService);
  readonly orgId  = this.auth.organisationId() ?? '00000000-0000-0000-0000-000000000001';
  readonly editId = signal<string | null>(null);
  readonly isEdit = computed(() => !!this.editId());

  readonly loading   = this.svc.loading;
  readonly error     = this.svc.error;
  readonly submitted = signal(false);

  // ── Dropdowns ──────────────────────────────────────────────
  readonly processusList = this.processusSvc.items;
  readonly utilisateurs  = signal<UtilisateurOption[]>([]);

  // ── Form fields ────────────────────────────────────────────
  readonly processusId        = signal('');
  readonly code               = signal('');
  readonly titre              = signal('');
  readonly objectif           = signal('');
  readonly domaineApplication = signal('');
  readonly description        = signal('');
  readonly responsableId      = signal('');
  readonly statut             = signal<StatutProcedure>('ACTIF');

  readonly isValid = computed(() =>
    this.processusId().trim() !== '' &&
    this.code().trim() !== '' &&
    this.titre().trim() !== '' &&
    this.objectif().trim() !== '' &&
    this.responsableId().trim() !== ''
  );

  async ngOnInit(): Promise<void> {
    const [,users] = await Promise.all([
      this.processusSvc.chargerListe(this.orgId),
      firstValueFrom(
        this.http.get<UtilisateurOption[]>(
          `${environment.apiUrl}/utilisateurs`,
          { params: new HttpParams().set('organisationId', this.orgId) }
        )
      ).catch(() => [
        { id: '00000000-0000-0000-0000-000000000010', nom: 'Mansouri', prenom: 'Amira', actif: true },
        { id: '00000000-0000-0000-0000-000000000011', nom: 'Mrad',     prenom: 'Kais',  actif: true },
        { id: '00000000-0000-0000-0000-000000000012', nom: 'Haddad',   prenom: 'Rami',  actif: true },
      ])
    ]);
    this.utilisateurs.set(users.filter(u => u.actif));

    // Edit mode
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editId.set(id);
      await this.svc.chargerParId(id);
      const p = this.svc.selected();
      if (p) {
        this.processusId.set(p.processusId);
        this.code.set(p.code);
        this.titre.set(p.titre);
        this.objectif.set(p.objectif);
        this.domaineApplication.set(p.domaineApplication ?? '');
        this.description.set(p.description ?? '');
        this.responsableId.set(p.responsableId);
        this.statut.set(p.statut);
      }
    }
  }

  async submit(): Promise<void> {
    this.submitted.set(true);
    if (!this.isValid()) return;
    try {
      if (this.isEdit()) {
        await this.svc.modifier({
          id:                 this.editId()!,
          processusId:        this.processusId(),
          code:               this.code(),
          titre:              this.titre(),
          objectif:           this.objectif(),
          domaineApplication: this.domaineApplication() || null,
          description:        this.description() || null,
          responsableId:      this.responsableId(),
          statut:             this.statut(),
        } as UpdateProcedureDto);
        await this.router.navigate(['/procedures']);
      } else {
        const newId = await this.svc.creer({
          organisationId:     this.orgId,
          processusId:        this.processusId(),
          code:               this.code(),
          titre:              this.titre(),
          objectif:           this.objectif(),
          domaineApplication: this.domaineApplication() || null,
          description:        this.description() || null,
          responsableId:      this.responsableId(),
        } as CreateProcedureDto);
        await this.router.navigate(['/procedures', newId]);
      }
    } catch { /* error shown via svc.error signal */ }
  }
}
