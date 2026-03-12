import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { DocumentService } from '../../../core/services/document.service';
import { PdfService } from '../../../core/services/pdf.service';
import {
  AjouterVersionDto,
  ChangerStatutVersionDto,
  StatutVersion,
  VersionDocumentDto
} from '../../../shared/models/document.model';

@Component({
  selector: 'app-document-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './document-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocumentDetailComponent implements OnInit {
  private svc    = inject(DocumentService);
  private router = inject(Router);
  private route  = inject(ActivatedRoute);
  private pdf    = inject(PdfService);

  // Demo IDs
  readonly userId = '00000000-0000-0000-0000-000000000010';

  readonly loading  = this.svc.loading;
  readonly error    = this.svc.error;
  readonly document = this.svc.selected;

  // Dernière version
  readonly derniereVersion = computed(() => {
    const d = this.document();
    if (!d || d.versions.length === 0) return null;
    return d.versions[0]; // already sorted desc by handler
  });

  // UI pour ajouter une nouvelle version
  readonly showAddVersion    = signal(false);
  readonly newVersionNum     = signal('');
  readonly newVersionComment = signal('');
  readonly newVersionPath    = signal('');

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      await this.svc.chargerParId(id);
    } else {
      this.router.navigate(['/documents']);
    }
  }

  downloadPdf(): void {
    const d = this.document();
    if (d) this.pdf.downloadDocument(d);
  }

  async supprimerDocument() {
    const d = this.document();
    if (!d) return;
    if (!confirm(`Supprimer le document "${d.titre}" ? Cette action est irréversible.`)) return;
    await this.svc.supprimer(d.id);
    this.router.navigate(['/documents']);
  }

  async soumettrreNouvelleVersion() {
    const d = this.document();
    if (!d || !this.newVersionNum().trim()) return;
    const dto: AjouterVersionDto = {
      documentId:          d.id,
      organisationId:      d.organisationId,
      numeroVersion:       this.newVersionNum().trim(),
      etabliParId:         this.userId,
      commentaireRevision: this.newVersionComment().trim() || undefined,
      fichierPath:          this.newVersionPath().trim() || undefined,
    };
    await this.svc.ajouterVersion(dto);
    this.showAddVersion.set(false);
    this.newVersionNum.set('');
    this.newVersionComment.set('');
    this.newVersionPath.set('');
    await this.svc.chargerParId(d.id);
  }

  async changerStatut(version: VersionDocumentDto, statut: StatutVersion) {
    const d = this.document();
    if (!d) return;
    const dto: ChangerStatutVersionDto = {
      versionId:       version.id,
      nouveauStatut:   statut,
      utilisateurId:   this.userId,
    };
    await this.svc.changerStatutVersion(version.id, dto);
    await this.svc.chargerParId(d.id);
  }

  statutClass(statut: StatutVersion): string {
    const map: Record<StatutVersion, string> = {
      BROUILLON:   'bg-amber-100 text-amber-700',
      EN_REVISION: 'bg-blue-100 text-blue-700',
      VALIDE:      'bg-emerald-100 text-emerald-700',
      OBSOLETE:    'bg-slate-100 text-slate-500'
    };
    return map[statut] ?? 'bg-slate-100 text-slate-500';
  }

  suivantStatuts(current: StatutVersion): StatutVersion[] {
    const flow: Partial<Record<StatutVersion, StatutVersion[]>> = {
      BROUILLON:   ['EN_REVISION'],
      EN_REVISION: ['VALIDE', 'BROUILLON'],
      VALIDE:      ['OBSOLETE'],
    };
    return flow[current] ?? [];
  }

  statutLabel(s: StatutVersion): string {
    const labels: Record<StatutVersion, string> = {
      BROUILLON:   'Brouillon',
      EN_REVISION: 'En révision',
      VALIDE:      'Valider',
      OBSOLETE:    'Marquer obsolète'
    };
    return labels[s];
  }
}
