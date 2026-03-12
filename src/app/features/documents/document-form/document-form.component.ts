import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { DocumentService } from '../../../core/services/document.service';
import { ProcessusService } from '../../../core/services/processus.service';
import { AuthService } from '../../../core/auth/auth.service';
import {
  CreateDocumentDto,
  TypeDocument,
  UpdateDocumentDto
} from '../../../shared/models/document.model';

@Component({
  selector: 'app-document-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './document-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocumentFormComponent implements OnInit {
  private svc          = inject(DocumentService);
  private processusSvc = inject(ProcessusService);
  private router       = inject(Router);
  private route        = inject(ActivatedRoute);

  private readonly auth = inject(AuthService);
  readonly orgId      = this.auth.organisationId() ?? '00000000-0000-0000-0000-000000000001';
  readonly userId     = this.auth.currentUser()?.id ?? '00000000-0000-0000-0000-000000000010';

  readonly editId    = signal<string | null>(null);
  readonly isEdit    = computed(() => !!this.editId());
  readonly loading   = this.svc.loading;
  readonly error     = this.svc.error;
  readonly submitted = signal(false);

  // ── Form fields ────────────────────────────────────────────
  readonly code               = signal('');
  readonly titre              = signal('');
  readonly description        = signal('');
  readonly typeDocument       = signal<TypeDocument>('TRAVAIL');
  readonly processusId        = signal('');
  readonly actif              = signal(true);
  // Première version (création uniquement)
  readonly numeroVersion      = signal('v1.0');
  readonly commentaireRevision = signal('');
  readonly fichierPath        = signal('');

  readonly typesDocument: { value: TypeDocument; label: string }[] = [
    { value: 'REFERENCE', label: 'Document de référence' },
    { value: 'TRAVAIL',   label: 'Document de travail' },
  ];

  readonly processusList = this.processusSvc.items;

  readonly isValid = computed(() =>
    this.code().trim() !== '' &&
    this.titre().trim() !== '' &&
    (!this.isEdit() ? this.numeroVersion().trim() !== '' : true)
  );

  async ngOnInit() {
    // Charger la liste des processus
    await this.processusSvc.chargerListe(this.orgId);

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editId.set(id);
      await this.svc.chargerParId(id);
      const d = this.svc.selected();
      if (d) {
        this.code.set(d.code);
        this.titre.set(d.titre);
        this.description.set(d.description ?? '');
        this.typeDocument.set(d.typeDocument);
        this.processusId.set(d.processusId ?? '');
        this.actif.set(d.actif);
      }
    }
  }

  async submit() {
    this.submitted.set(true);
    if (!this.isValid()) return;

    try {
      if (this.isEdit()) {
        const dto: UpdateDocumentDto = {
          id:           this.editId()!,
          code:         this.code().trim().toUpperCase(),
          titre:        this.titre().trim(),
          typeDocument: this.typeDocument(),
          description:  this.description().trim() || undefined,
          processusId:  this.processusId() || undefined,
          actif:        this.actif()
        };
        await this.svc.modifier(this.editId()!, dto);
        await this.router.navigate(['/documents', this.editId()]);
      } else {
        const dto: CreateDocumentDto = {
          organisationId:      this.orgId,
          code:                this.code().trim().toUpperCase(),
          titre:               this.titre().trim(),
          typeDocument:        this.typeDocument(),
          description:         this.description().trim() || undefined,
          processusId:         this.processusId() || undefined,
          numeroVersion:       this.numeroVersion().trim(),
          etabliParId:         this.userId,
          commentaireRevision: this.commentaireRevision().trim() || undefined,
          fichierPath:         this.fichierPath().trim() || undefined,
        };
        const id = await this.svc.creer(dto);
        await this.router.navigate(['/documents', id]);
      }
    } catch {
      // error already set in service
    }
  }

  cancel() {
    if (this.isEdit()) {
      this.router.navigate(['/documents', this.editId()]);
    } else {
      this.router.navigate(['/documents']);
    }
  }
}
