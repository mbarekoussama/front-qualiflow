import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { Utilisateur } from '../../../shared/models/utilisateur.model';
import { PrioriteNonConformite, SourceNonConformite } from '../../../shared/models/non-conformite.model';

@Component({
  selector: 'app-nc-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './nc-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NcFormComponent {
  private readonly fb = inject(FormBuilder);

  readonly responsables = signal<Utilisateur[]>([
    { id: 'u-01', nom: 'Mansouri', prenom: 'Amira', initiales: 'AM', email: 'a.mansouri@qualiflow.app', role: 'Responsable Qualité', couleur: '#1a5c38' },
    { id: 'u-02', nom: 'Mrad', prenom: 'Kais', initiales: 'KM', email: 'k.mrad@qualiflow.app', role: 'Pilote', couleur: '#2d7a4f' },
    { id: 'u-03', nom: 'Ben Ali', prenom: 'Sana', initiales: 'SB', email: 's.benali@qualiflow.app', role: 'Auditeur', couleur: '#0f766e' },
    { id: 'u-04', nom: 'Haddad', prenom: 'Rami', initiales: 'RH', email: 'r.haddad@qualiflow.app', role: 'Pilote', couleur: '#475569' }
  ]);

  readonly processusOptions = signal(['P-01', 'P-02', 'P-03', 'P-04', 'P-05']);
  readonly formSubmitted = signal(false);

  readonly sources: SourceNonConformite[] = [
    'Audit interne', 'Réclamation client', 'Contrôle interne', 'Externe'
  ];
  readonly priorites: PrioriteNonConformite[] = ['Faible', 'Moyenne', 'Élevée', 'Critique'];

  readonly form = this.fb.nonNullable.group({
    description: ['', [Validators.required, Validators.minLength(10)]],
    processus: ['P-01', [Validators.required]],
    source: ['Audit interne' as SourceNonConformite, [Validators.required]],
    priorite: ['Moyenne' as PrioriteNonConformite, [Validators.required]],
    responsableId: ['u-01', [Validators.required]],
    causeRacine: [''],
    dateDetection: [this.todayIso(), [Validators.required]],
    dateEcheance: ['', [Validators.required]]
  });

  submit(): void {
    this.formSubmitted.set(true);
    if (this.form.invalid) return;
    console.log('NC form submitted:', this.form.getRawValue());
  }

  private todayIso(): string {
    return new Date().toISOString().slice(0, 10);
  }
}
