import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { ProcessusService } from '../../../core/services/processus.service.js';
import { AuthService } from '../../../core/auth/auth.service.js';
import {
  CreateProcessusDto,
  StatutProcessus,
  TypeProcessus,
  UpdateProcessusDto
} from '../../../shared/models/processus.model.js';
import { TagInputComponent } from '../../../shared/components/tag-input/tag-input.component.js';

@Component({
  selector: 'app-processus-form',
  standalone: true,
  imports: [FormsModule, TagInputComponent],
  templateUrl: './processus-form.component.html',
  styleUrl: './processus-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProcessusFormComponent implements OnInit {
  private svc    = inject(ProcessusService);
  private router = inject(Router);
  private route  = inject(ActivatedRoute);
  private readonly auth  = inject(AuthService);

  readonly orgId = this.auth.organisationId() ?? '00000000-0000-0000-0000-000000000001';

  readonly editId   = signal<string | null>(null);
  readonly isEdit   = computed(() => !!this.editId());
  readonly loading  = this.svc.loading;
  readonly error    = this.svc.error;
  readonly submitted = signal(false);

  // ── Form fields ────────────────────────────────────────────
  readonly code         = signal('');
  readonly nom          = signal('');
  readonly description  = signal('');
  readonly type         = signal<TypeProcessus>('REALISATION');
  readonly statut       = signal<StatutProcessus>('ACTIF');
  readonly piloteId     = signal('');
  readonly finalites    = signal<string[]>([]);
  readonly objectifs    = signal<string[]>([]);
  readonly perimetres   = signal<string[]>([]);
  readonly fournisseurs = signal<string[]>([]);
  readonly clients      = signal<string[]>([]);
  readonly donneesEntree = signal<string[]>([]);
  readonly donneesSortie = signal<string[]>([]);

  // Mock pilotes — in production load from UserService
  readonly pilotes = signal([
    { id: '00000000-0000-0000-0000-000000000010', nomComplet: 'Amira Mansouri', initiales: 'AM' },
    { id: '00000000-0000-0000-0000-000000000011', nomComplet: 'Kais Mrad',      initiales: 'KM' },
    { id: '00000000-0000-0000-0000-000000000012', nomComplet: 'Rami Haddad',    initiales: 'RH' },
  ]);

  readonly isValid = computed(() =>
    this.code().trim() !== '' &&
    this.nom().trim() !== '' &&
    this.piloteId() !== '' &&
    this.finalites().length > 0 &&
    this.objectifs().length > 0
  );

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editId.set(id);
      await this.svc.chargerParId(id);
      const p = this.svc.selected();
      if (p) {
        this.code.set(p.code);
        this.nom.set(p.nom);
        this.description.set(p.description ?? '');
        this.type.set(p.type);
        this.statut.set(p.statut);
        this.piloteId.set(p.pilote.id);
        this.finalites.set([...p.finalites]);
        this.objectifs.set([...p.objectifs]);
        this.perimetres.set([...p.perimetres]);
        this.fournisseurs.set([...p.fournisseurs]);
        this.clients.set([...p.clients]);
        this.donneesEntree.set([...p.donneesEntree]);
        this.donneesSortie.set([...p.donneesSortie]);
      }
    }
  }

  async submit() {
    this.submitted.set(true);
    if (!this.isValid()) return;

    const code = this.code().trim().toUpperCase();
    if (code !== this.code()) this.code.set(code);

    try {
      if (this.isEdit()) {
        const dto: UpdateProcessusDto = {
          id:            this.editId()!,
          code,
          nom:           this.nom(),
          description:   this.description() || undefined,
          type:          this.type(),
          statut:        this.statut(),
          finalites:     this.finalites(),
          objectifs:     this.objectifs(),
          perimetres:    this.perimetres(),
          fournisseurs:  this.fournisseurs(),
          clients:       this.clients(),
          donneesEntree: this.donneesEntree(),
          donneesSortie: this.donneesSortie(),
          piloteId:      this.piloteId()
        };
        await this.svc.modifier(this.editId()!, dto);
        this.router.navigate(['/processus', this.editId()]);
      } else {
        const dto: CreateProcessusDto = {
          organisationId: this.orgId,
          code,
          nom:           this.nom(),
          description:   this.description() || undefined,
          type:          this.type(),
          finalites:     this.finalites(),
          objectifs:     this.objectifs(),
          perimetres:    this.perimetres(),
          fournisseurs:  this.fournisseurs(),
          clients:       this.clients(),
          donneesEntree: this.donneesEntree(),
          donneesSortie: this.donneesSortie(),
          piloteId:      this.piloteId()
        };
        const id = await this.svc.creer(dto);
        this.router.navigate(['/processus', id]);
      }
    } catch {
      // error handled by service signal
    }
  }

  annuler() { this.router.navigate(['/processus']); }
}
