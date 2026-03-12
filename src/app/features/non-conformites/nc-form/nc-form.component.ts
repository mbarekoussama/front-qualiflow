import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { GraviteNC, SourceNC } from '../../../shared/models/non-conformite.model';
import { NonConformiteService } from '../../../core/services/non-conformite.service';
import { AuthService } from '../../../core/auth/auth.service';
import { ProcessusService } from '../../../core/services/processus.service';

@Component({
  selector: 'app-nc-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './nc-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NcFormComponent implements OnInit {
  private readonly fb      = inject(FormBuilder);
  private readonly svc     = inject(NonConformiteService);
  private readonly auth    = inject(AuthService);
  private readonly procSvc = inject(ProcessusService);
  private readonly router  = inject(Router);

  readonly loading       = this.svc.loading;
  readonly error         = this.svc.error;
  readonly responsables  = this.svc.utilisateurs;
  readonly formSubmitted = signal(false);
  readonly successMsg    = signal<string | null>(null);

  readonly processusOptions = signal<{ id: string; nom: string; code: string }[]>([]);

  readonly sources: { value: SourceNC; label: string }[] = [
    { value: 'AUDIT',          label: 'Audit interne' },
    { value: 'POINT_CONTROLE', label: 'Point de contrôle' },
    { value: 'RECLAMATION',    label: 'Réclamation' },
    { value: 'AUTRE',          label: 'Autre' },
  ];

  readonly gravites: { value: GraviteNC; label: string }[] = [
    { value: 'MINEURE',  label: 'Mineure' },
    { value: 'MAJEURE',  label: 'Majeure' },
    { value: 'CRITIQUE', label: 'Critique' },
  ];

  readonly form = this.fb.nonNullable.group({
    description:             ['', [Validators.required, Validators.minLength(10)]],
    nature:                  ['', [Validators.required]],
    type:                    ['', [Validators.required]],
    processusId:             ['', [Validators.required]],
    source:                  ['AUDIT' as SourceNC,  [Validators.required]],
    gravite:                 ['MAJEURE' as GraviteNC,[Validators.required]],
    responsableTraitementId: ['', [Validators.required]],
    dateEcheance:            ['', [Validators.required]],
  });

  async ngOnInit(): Promise<void> {
    const orgId = this.auth.organisationId() ?? '';
    if (!orgId) return;
    await Promise.all([
      this.svc.chargerUtilisateurs(orgId),
      this.procSvc.chargerListe(orgId, { pageSize: 100 }),
    ]);
    this.processusOptions.set(
      this.procSvc.items().map(p => ({ id: p.id, nom: p.nom, code: p.code }))
    );
    // set defaults if available
    if (this.responsables().length > 0)
      this.form.controls.responsableTraitementId.setValue(this.responsables()[0].id);
    if (this.processusOptions().length > 0)
      this.form.controls.processusId.setValue(this.processusOptions()[0].id);
  }

  async submit(): Promise<void> {
    this.formSubmitted.set(true);
    if (this.form.invalid) return;

    const orgId     = this.auth.organisationId() ?? '';
    const currentId = this.auth.currentUser()?.id ?? '';
    const v         = this.form.getRawValue();

    const id = await this.svc.creer({
      organisationId:          orgId,
      processusId:             v.processusId,
      description:             v.description,
      nature:                  v.nature,
      type:                    v.type,
      source:                  v.source,
      gravite:                 v.gravite,
      responsableTraitementId: v.responsableTraitementId,
      dateEcheance:            v.dateEcheance,
      detecteParId:            currentId,
    });

    if (id) {
      this.router.navigate(['/non-conformites', id]);
    }
  }

  private todayIso(): string {
    return new Date().toISOString().slice(0, 10);
  }
}

