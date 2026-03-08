import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  computed,
  effect
} from '@angular/core';
import { FormArray, FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { StatutProcedure } from '../../../shared/models/procedure.model';
import { Utilisateur } from '../../../shared/models/utilisateur.model';

interface EtapeForm {
  ordre: FormControl<number>;
  description: FormControl<string>;
  responsable: FormControl<string>;
  delai: FormControl<string>;
}

@Component({
  selector: 'app-procedure-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './procedure-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProcedureFormComponent {
  private readonly fb = inject(FormBuilder);

  readonly responsables = signal<Utilisateur[]>([
    { id: 'u-01', nom: 'Mansouri', prenom: 'Amira', initiales: 'AM', email: 'a.mansouri@qualiflow.app', role: 'Responsable Qualité', couleur: '#1a5c38' },
    { id: 'u-02', nom: 'Mrad', prenom: 'Kais', initiales: 'KM', email: 'k.mrad@qualiflow.app', role: 'Pilote', couleur: '#2d7a4f' },
    { id: 'u-03', nom: 'Ben Ali', prenom: 'Sana', initiales: 'SB', email: 's.benali@qualiflow.app', role: 'Auditeur', couleur: '#0f766e' },
    { id: 'u-04', nom: 'Haddad', prenom: 'Rami', initiales: 'RH', email: 'r.haddad@qualiflow.app', role: 'Pilote', couleur: '#475569' }
  ]);

  readonly processusOptions = signal(['P-01', 'P-02', 'P-03', 'P-04', 'P-05']);
  readonly formSubmitted = signal(false);
  readonly selectedResponsableId = signal('u-01');

  readonly form = this.fb.nonNullable.group({
    intitule: this.fb.nonNullable.control('', [Validators.required]),
    processusParent: this.fb.nonNullable.control('P-01', [Validators.required]),
    description: this.fb.nonNullable.control('', [Validators.required]),
    responsableId: this.fb.nonNullable.control('u-01', [Validators.required]),
    statut: this.fb.nonNullable.control<StatutProcedure>('Active'),
    etapes: this.fb.nonNullable.array<ReturnType<typeof this.newEtapeGroup>>([])
  });

  readonly selectedResponsable = computed(() =>
    this.responsables().find((r) => r.id === this.selectedResponsableId()) ?? null
  );

  readonly etapeControls = computed(
    () => this.form.controls.etapes.controls
  );

  private readonly _syncResponsable = effect(() => {
    const id = this.selectedResponsableId();
    if (this.form.controls.responsableId.value !== id) {
      this.form.controls.responsableId.setValue(id);
    }
  });

  newEtapeGroup(ordre: number) {
    return this.fb.nonNullable.group<EtapeForm>({
      ordre: this.fb.nonNullable.control(ordre),
      description: this.fb.nonNullable.control('', [Validators.required]),
      responsable: this.fb.nonNullable.control(''),
      delai: this.fb.nonNullable.control('')
    });
  }

  addEtape(): void {
    const next = this.form.controls.etapes.length + 1;
    this.form.controls.etapes.push(this.newEtapeGroup(next));
  }

  removeEtape(index: number): void {
    this.form.controls.etapes.removeAt(index);
    this.reorderEtapes();
  }

  selectResponsable(id: string): void {
    this.selectedResponsableId.set(id);
  }

  submit(): void {
    this.formSubmitted.set(true);
    if (this.form.invalid) return;
    console.log('Procedure form submitted:', this.form.getRawValue());
  }

  private reorderEtapes(): void {
    this.form.controls.etapes.controls.forEach((ctrl, i) => {
      ctrl.controls.ordre.setValue(i + 1);
    });
  }
}
