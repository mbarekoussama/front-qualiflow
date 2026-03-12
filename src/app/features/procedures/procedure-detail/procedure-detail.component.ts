import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ProcedureService } from '../../../core/services/procedure.service';
import { PdfService } from '../../../core/services/pdf.service';

@Component({
  selector: 'app-procedure-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './procedure-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProcedureDetailComponent implements OnInit {
  private readonly svc   = inject(ProcedureService);
  private readonly route = inject(ActivatedRoute);

  private readonly pdf = inject(PdfService);

  readonly loading  = this.svc.loading;
  readonly error    = this.svc.error;
  readonly procedure = this.svc.selected;

  downloadPdf(): void {
    const p = this.procedure();
    if (p) this.pdf.downloadProcedure(p);
  }

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) await this.svc.chargerParId(id);
  }
}
