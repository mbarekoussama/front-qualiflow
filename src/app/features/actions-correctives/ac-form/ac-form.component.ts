import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';

import { ActionCorrectiveService } from '../../../core/services/action-corrective.service.js';
import { AuthService } from '../../../core/auth/auth.service.js';
import { UtilisateurOptionDto } from '../../../core/services/non-conformite.service.js';
import { environment } from '../../../../environments/environment.js';

interface NcOption {
  id: string;
  reference: string;
  description: string;
}

@Component({
  selector: 'app-ac-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './ac-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AcFormComponent implements OnInit {
  private readonly route  = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly auth   = inject(AuthService);
  private readonly svc    = inject(ActionCorrectiveService);
  private readonly fb     = inject(FormBuilder);
  private readonly http   = inject(HttpClient);

  readonly isEdit   = signal(false);
  readonly editId   = signal<string | null>(null);
  readonly loading  = signal(false);
  readonly error    = signal<string | null>(null);
  readonly success  = signal(false);

  readonly utilisateurs = signal<UtilisateurOptionDto[]>([]);
  readonly ncs          = signal<NcOption[]>([]);

  readonly form = this.fb.nonNullable.group({
    ncId:          ['', [Validators.required]],
    type:          ['', [Validators.required, Validators.maxLength(200)]],
    description:   ['', [Validators.required, Validators.minLength(5), Validators.maxLength(2000)]],
    responsableId: ['', [Validators.required]],
    dateEcheance:  ['', [Validators.required]],
  });

  async ngOnInit(): Promise<void> {
    const orgId = this.auth.organisationId() ?? '';
    if (!orgId) return;

    // Load users
    try {
      const users = await firstValueFrom(
        this.http.get<UtilisateurOptionDto[]>(
          `${environment.apiUrl}/utilisateurs`,
          { params: new HttpParams().set('organisationId', orgId) }
        )
      );
      this.utilisateurs.set(users);
      if (users.length > 0) {
        this.form.controls.responsableId.setValue(users[0].id);
      }
    } catch { /* silent */ }

    // Load NCs (simplified list)
    try {
      const res = await firstValueFrom(
        this.http.get<{ items: Array<{ id: string; reference: string; description: string }> }>(
          `${environment.apiUrl}/non-conformites`,
          { params: new HttpParams().set('organisationId', orgId).set('pageSize', '100') }
        )
      );
      this.ncs.set(res.items.map(n => ({ id: n.id, reference: n.reference, description: n.description })));
    } catch { /* silent */ }

    // Edit mode
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.editId.set(id);
      await this.svc.chargerDetail(id);
      const a = this.svc.selected();
      if (a) {
        this.form.patchValue({
          ncId:          a.nonConformiteId,
          type:          a.type,
          description:   a.description,
          responsableId: a.responsableId,
          dateEcheance:  a.dateEcheance.slice(0, 10),
        });
        // NC is fixed in edit mode
        this.form.controls.ncId.disable();
      }
    }
  }

  async soumettre(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    const v = this.form.getRawValue();
    try {
      if (this.isEdit()) {
        const id = this.editId()!;
        await this.svc.modifier(id, {
          type:          v.type,
          description:   v.description,
          responsableId: v.responsableId,
          dateEcheance:  new Date(v.dateEcheance).toISOString(),
        });
        this.router.navigate(['/actions-correctives', id]);
      } else {
        const newId = await this.svc.creer(v.ncId, {
          type:          v.type,
          description:   v.description,
          responsableId: v.responsableId,
          dateEcheance:  new Date(v.dateEcheance).toISOString(),
        });
        this.router.navigate(['/actions-correctives', newId]);
      }
    } catch (e: any) {
      this.error.set(e?.message ?? 'Erreur lors de la sauvegarde.');
    } finally {
      this.loading.set(false);
    }
  }
}
