import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { IndicateurService } from '../../../core/services/indicateur.service';
import { AuthService } from '../../../core/auth/auth.service';
import { FREQUENCE_LABEL } from '../../../shared/models/indicateur.model';

@Component({
  selector: 'app-indicateur-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './indicateur-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IndicateurDetailComponent implements OnInit {
  private readonly svc = inject(IndicateurService);
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly frequenceLabel = FREQUENCE_LABEL;
  readonly loading = this.svc.loading;
  readonly error = this.svc.error;
  readonly indicateur = this.svc.selected;

  readonly valeurSubmitted = signal(false);
  readonly periode = signal('');
  readonly valeur = signal<number | null>(null);
  readonly commentaire = signal('');
  readonly dateMesure = signal(this.todayIso());

  readonly latestValeur = computed(() => {
    const ind = this.indicateur();
    if (!ind || ind.valeurs.length === 0) return null;
    return ind.valeurs[ind.valeurs.length - 1].valeur;
  });

  readonly performance = computed(() => {
    const ind = this.indicateur();
    const val = this.latestValeur();
    if (!ind || val === null || ind.valeurCible === 0) return 0;
    return Math.min(100, Math.round((val / ind.valeurCible) * 100));
  });

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) await this.svc.chargerDetail(id);
  }

  async ajouterValeur(): Promise<void> {
    this.valeurSubmitted.set(true);
    const ind = this.indicateur();
    if (!ind) return;
    if (!this.periode().trim() || this.valeur() === null) return;

    const userId = this.auth.currentUser()?.id ?? '';
    if (!userId) return;

    const ok = await this.svc.ajouterValeur(ind.id, {
      periode: this.periode().trim(),
      valeur: Number(this.valeur()),
      commentaire: this.commentaire().trim() || null,
      saisieParId: userId,
      dateMesure: this.dateMesure() || null
    });

    if (ok) {
      await this.svc.chargerDetail(ind.id);
      this.periode.set('');
      this.valeur.set(null);
      this.commentaire.set('');
      this.dateMesure.set(this.todayIso());
      this.valeurSubmitted.set(false);
    }
  }

  async supprimer(): Promise<void> {
    const ind = this.indicateur();
    if (!ind) return;
    if (!confirm('Supprimer cet indicateur ?')) return;
    const ok = await this.svc.supprimer(ind.id);
    if (ok) this.router.navigate(['/indicateurs']);
  }

  private todayIso(): string {
    return new Date().toISOString().slice(0, 10);
  }
}
