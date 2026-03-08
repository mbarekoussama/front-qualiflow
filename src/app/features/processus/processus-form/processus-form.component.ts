import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  FormArray,
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { RouterLink } from '@angular/router';

import { FrequenceRevue, ProcessusType } from '../../../shared/models/processus.model';
import { Utilisateur } from '../../../shared/models/utilisateur.model';

interface ProcessusFormModel {
  code: FormControl<string>;
  intitule: FormControl<string>;
  type: FormControl<ProcessusType>;
  clauseISO: FormControl<string>;
  objectif: FormControl<string>;
  piloteId: FormControl<string>;
  frequenceRevue: FormControl<FrequenceRevue>;
  dateCreation: FormControl<string>;
  prochaineRevue: FormControl<string>;
  tauxConformite: FormControl<number>;
  indicateurs: FormArray<FormControl<string>>;
}

@Component({
  selector: 'app-processus-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './processus-form.component.html',
  styleUrl: './processus-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProcessusFormComponent {
  private readonly fb = inject(FormBuilder);

  readonly pilotes = signal<Utilisateur[]>([
    {
      id: 'u-01',
      nom: 'Mansouri',
      prenom: 'Amira',
      initiales: 'AM',
      email: 'a.mansouri@qualiflow.app',
      role: 'Responsable Qualité',
      couleur: '#1a5c38'
    },
    {
      id: 'u-02',
      nom: 'Mrad',
      prenom: 'Kais',
      initiales: 'KM',
      email: 'k.mrad@qualiflow.app',
      role: 'Pilote',
      couleur: '#2d7a4f'
    },
    {
      id: 'u-03',
      nom: 'Haddad',
      prenom: 'Rami',
      initiales: 'RH',
      email: 'r.haddad@qualiflow.app',
      role: 'Pilote',
      couleur: '#475569'
    }
  ]);

  readonly availableIndicateurs = signal<string[]>([
    'Satisfaction apprenants',
    'Taux de conformité documentaire',
    'Délais de traitement NC',
    "Taux d'actions correctives efficaces",
    "Couverture plan d'audit"
  ]);

  readonly selectedPiloteId = signal('');
  readonly formSubmitted = signal(false);
  readonly actionState = signal<'idle' | 'draft' | 'create'>('idle');

  readonly form = this.fb.nonNullable.group<ProcessusFormModel>({
    code: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(2)]),
    intitule: this.fb.nonNullable.control('', [Validators.required]),
    type: this.fb.nonNullable.control<ProcessusType>('Pilotage', [Validators.required]),
    clauseISO: this.fb.nonNullable.control('8.1', [Validators.required]),
    objectif: this.fb.nonNullable.control('', [Validators.required]),
    piloteId: this.fb.nonNullable.control('', [Validators.required]),
    frequenceRevue: this.fb.nonNullable.control<FrequenceRevue>('Trimestrielle'),
    dateCreation: this.fb.nonNullable.control(this.todayIso()),
    prochaineRevue: this.fb.nonNullable.control(''),
    tauxConformite: this.fb.nonNullable.control(75, [Validators.min(0), Validators.max(100)]),
    indicateurs: this.fb.nonNullable.array<FormControl<string>>([])
  });

  readonly indicateursValues = toSignal(this.form.controls.indicateurs.valueChanges, {
    initialValue: this.form.controls.indicateurs.value
  });

  readonly scoreValue = toSignal(this.form.controls.tauxConformite.valueChanges, {
    initialValue: this.form.controls.tauxConformite.value
  });

  readonly selectedPilote = computed(() =>
    this.pilotes().find((pilote) => pilote.id === this.selectedPiloteId()) ?? null
  );

  readonly scoreLabel = computed(() => `${this.scoreValue()}%`);

  readonly scoreClass = computed(() => {
    const value = this.scoreValue();
    if (value < 65) {
      return 'text-red-600';
    }
    if (value < 80) {
      return 'text-amber-600';
    }
    return 'text-emerald-600';
  });

  readonly indicateursCount = computed(() => this.indicateursValues().length);

  private readonly _initPilote = effect(() => {
    const firstPilote = this.pilotes()[0];
    if (firstPilote && !this.selectedPiloteId()) {
      this.selectedPiloteId.set(firstPilote.id);
    }
  });

  private readonly _syncPilote = effect(() => {
    const id = this.selectedPiloteId();
    if (id && this.form.controls.piloteId.value !== id) {
      this.form.controls.piloteId.setValue(id);
    }
  });

  get indicateurControls(): FormControl<string>[] {
    return this.form.controls.indicateurs.controls;
  }

  addIndicateur(value = ''): void {
    this.form.controls.indicateurs.push(this.fb.nonNullable.control(value));
  }

  removeIndicateur(index: number): void {
    this.form.controls.indicateurs.removeAt(index);
  }

  moveIndicateur(index: number, direction: -1 | 1): void {
    const target = index + direction;
    const array = this.form.controls.indicateurs;
    if (target < 0 || target >= array.length) {
      return;
    }
    const control = array.at(index);
    array.removeAt(index);
    array.insert(target, control);
  }

  selectPilote(id: string): void {
    this.selectedPiloteId.set(id);
  }

  saveDraft(): void {
    this.formSubmitted.set(true);
    this.actionState.set('draft');
  }

  submit(): void {
    this.formSubmitted.set(true);
    if (this.form.invalid) {
      return;
    }
    this.actionState.set('create');
  }

  private todayIso(): string {
    return new Date().toISOString().slice(0, 10);
  }
}
