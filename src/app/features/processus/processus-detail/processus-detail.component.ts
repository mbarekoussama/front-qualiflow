import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { ProcessusService } from '../../../core/services/processus.service';
import { TypeActeur } from '../../../shared/models/processus.model';

type TabId = 'infos' | 'procedures' | 'indicateurs' | 'pointsControle' | 'documents' | 'nc';

@Component({
  selector: 'app-processus-detail',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './processus-detail.component.html',
  styleUrl: './processus-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProcessusDetailComponent implements OnInit {
  readonly svc    = inject(ProcessusService);
  private router  = inject(Router);
  private route   = inject(ActivatedRoute);

  readonly processus = this.svc.selected;
  readonly loading   = this.svc.loading;
  readonly error     = this.svc.error;

  readonly activeTab = signal<TabId>('infos');

  readonly tabs: { id: TabId; label: string }[] = [
    { id: 'infos',         label: 'Informations' },
    { id: 'procedures',    label: 'Procédures' },
    { id: 'indicateurs',   label: 'Indicateurs' },
    { id: 'pointsControle',label: 'Points de contrôle' },
    { id: 'documents',     label: 'Documents' },
    { id: 'nc',            label: 'Non-conformités' },
  ];

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    await this.svc.chargerParId(id);
  }

  setTab(tab: TabId) { this.activeTab.set(tab); }

  editer() {
    const id = this.processus()?.id;
    if (id) this.router.navigate(['/processus', id, 'edition']);
  }

  typeBadgeClass(type: string): string {
    return ({
      PILOTAGE   : 'bg-slate-100 text-slate-700',
      REALISATION: 'bg-blue-100 text-blue-700',
      SUPPORT    : 'bg-orange-100 text-orange-700',
    })[type] ?? 'bg-slate-100 text-slate-700';
  }

  acteurBadgeClass(typeActeur: TypeActeur): string {
    return ({
      PILOTE      : 'bg-[#1B5E20]/10 text-[#1B5E20]',
      COPILOTE    : 'bg-blue-100 text-blue-700',
      CONTRIBUTEUR: 'bg-purple-100 text-purple-700',
      OBSERVATEUR : 'bg-slate-100 text-slate-600',
    })[typeActeur] ?? 'bg-slate-100 text-slate-600';
  }

  piloteColor(initiales: string): string {
    const colors = ['#1B5E20','#1565C0','#C62828','#6A1B9A','#00695C','#E65100'];
    const idx = ((initiales.charCodeAt(0) || 0) + (initiales.charCodeAt(1) || 0)) % colors.length;
    return colors[idx];
  }
}
