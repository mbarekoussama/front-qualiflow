import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { IndicateurService } from '../../../core/services/indicateur.service';
import { ProcessusService } from '../../../core/services/processus.service';
import { AuthService } from '../../../core/auth/auth.service';
import {
  CreateIndicateurDto,
  FrequenceMesure,
  StatutIndicateur,
  UpdateIndicateurDto
} from '../../../shared/models/indicateur.model';

@Component({
  selector: 'app-indicateur-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './indicateur-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IndicateurFormComponent implements OnInit {
  private readonly svc = inject(IndicateurService);
  private readonly procSvc = inject(ProcessusService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly orgId = this.auth.organisationId() ?? '00000000-0000-0000-0000-000000000001';

  readonly editId = signal<string | null>(null);
  readonly isEdit = computed(() => !!this.editId());
  readonly loading = this.svc.loading;
  readonly error = this.svc.error;
  readonly submitted = signal(false);

  readonly processusOptions = signal<{ id: string; code: string; nom: string }[]>([]);
  readonly responsables = this.svc.utilisateurs;

  readonly frequences: { value: FrequenceMesure; label: string }[] = [
    { value: 'QUOTIDIEN', label: 'Quotidien' },
    { value: 'HEBDOMADAIRE', label: 'Hebdomadaire' },
    { value: 'MENSUEL', label: 'Mensuel' },
    { value: 'TRIMESTRIEL', label: 'Trimestriel' },
    { value: 'ANNUEL', label: 'Annuel' }
  ];

  readonly statuts: { value: StatutIndicateur; label: string }[] = [
    { value: 'ACTIF', label: 'ACTIF' },
    { value: 'INACTIF', label: 'INACTIF' }
  ];

  // Form fields
  readonly code = signal('');
  readonly nom = signal('');
  readonly description = signal('');
  readonly processusId = signal('');
  readonly methodeCalcul = signal('');
  readonly unite = signal('');
  readonly valeurCible = signal<number>(0);
  readonly seuilAlerte = signal<number>(0);
  readonly frequenceMesure = signal<FrequenceMesure>('MENSUEL');
  readonly responsableId = signal('');
  readonly statut = signal<StatutIndicateur>('ACTIF');

  readonly isValid = computed(() =>
    this.code().trim() !== '' &&
    this.nom().trim() !== '' &&
    this.processusId() !== '' &&
    this.responsableId() !== ''
  );

  async ngOnInit(): Promise<void> {
    await Promise.all([
      this.svc.chargerUtilisateurs(this.orgId),
      this.procSvc.chargerListe(this.orgId, { pageSize: 100 })
    ]);

    this.processusOptions.set(
      this.procSvc.items().map((p) => ({ id: p.id, code: p.code, nom: p.nom }))
    );

    if (this.responsables().length > 0 && !this.responsableId()) {
      this.responsableId.set(this.responsables()[0].id);
    }
    if (this.processusOptions().length > 0 && !this.processusId()) {
      this.processusId.set(this.processusOptions()[0].id);
    }

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editId.set(id);
      await this.svc.chargerDetail(id);
      const ind = this.svc.selected();
      if (ind) {
        this.code.set(ind.code);
        this.nom.set(ind.nom);
        this.description.set(ind.description ?? '');
        this.processusId.set(ind.processusId);
        this.methodeCalcul.set(ind.methodeCalcul ?? '');
        this.unite.set(ind.unite ?? '');
        this.valeurCible.set(ind.valeurCible);
        this.seuilAlerte.set(ind.seuilAlerte);
        this.frequenceMesure.set(ind.frequenceMesure);
        this.responsableId.set(ind.responsable.id);
        this.statut.set(ind.statut);
      }
    }
  }

  async submit(): Promise<void> {
    this.submitted.set(true);
    if (!this.isValid()) return;

    const code = this.code().trim().toUpperCase();
    if (code !== this.code()) this.code.set(code);

    if (this.isEdit()) {
      const dto: UpdateIndicateurDto = {
        id: this.editId()!,
        processusId: this.processusId(),
        code,
        nom: this.nom().trim(),
        description: this.description().trim() || null,
        methodeCalcul: this.methodeCalcul().trim() || null,
        unite: this.unite().trim() || null,
        valeurCible: this.valeurCible(),
        seuilAlerte: this.seuilAlerte(),
        frequenceMesure: this.frequenceMesure(),
        responsableId: this.responsableId(),
        statut: this.statut()
      };
      const ok = await this.svc.modifier(this.editId()!, dto);
      if (ok) this.router.navigate(['/indicateurs', this.editId()]);
    } else {
      const dto: CreateIndicateurDto = {
        organisationId: this.orgId,
        processusId: this.processusId(),
        code,
        nom: this.nom().trim(),
        description: this.description().trim() || null,
        methodeCalcul: this.methodeCalcul().trim() || null,
        unite: this.unite().trim() || null,
        valeurCible: this.valeurCible(),
        seuilAlerte: this.seuilAlerte(),
        frequenceMesure: this.frequenceMesure(),
        responsableId: this.responsableId()
      };
      const id = await this.svc.creer(dto);
      if (id) this.router.navigate(['/indicateurs', id]);
    }
  }

  annuler(): void {
    this.router.navigate(['/indicateurs']);
  }
}
