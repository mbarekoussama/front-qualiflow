import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ProcedureDetail } from '../../shared/models/procedure.model';
import { DocumentDetail } from '../../shared/models/document.model';

@Injectable({ providedIn: 'root' })
export class PdfService {

  // ── Couleurs QualiFlow ─────────────────────────────────────
  private readonly GREEN    = [26, 92, 56]  as [number, number, number];
  private readonly LIGHTG   = [45, 122, 79] as [number, number, number];
  private readonly SLATE50  = [248, 250, 252] as [number, number, number];
  private readonly SLATE200 = [226, 232, 240] as [number, number, number];
  private readonly SLATE500 = [100, 116, 139] as [number, number, number];
  private readonly SLATE800 = [30,  41,  59]  as [number, number, number];

  // ─────────────────────────────────────────────────────────────
  // Entête commune
  // ─────────────────────────────────────────────────────────────
  private drawHeader(doc: jsPDF, title: string, subtitle: string): void {
    const W = doc.internal.pageSize.getWidth();

    // Bande verte supérieure
    doc.setFillColor(...this.GREEN);
    doc.rect(0, 0, W, 22, 'F');

    // Logo placeholder (carré blanc)
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(8, 4, 14, 14, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...this.GREEN);
    doc.text('QF', 15, 12.5, { align: 'center' });

    // Nom organisation
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text('Institut QualiFlow', 26, 10);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text('Système de Management de la Qualité — ISO 21001', 26, 16);

    // Date à droite
    const now = new Date().toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'long', year: 'numeric'
    });
    doc.setFontSize(7);
    doc.text(now, W - 8, 16, { align: 'right' });

    // Titre document
    doc.setFillColor(...this.SLATE50);
    doc.rect(0, 22, W, 18, 'F');
    doc.setFillColor(...this.LIGHTG);
    doc.rect(0, 22, 4, 18, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...this.SLATE800);
    doc.text(title, 10, 32);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...this.SLATE500);
    doc.text(subtitle, 10, 38);
  }

  // ─────────────────────────────────────────────────────────────
  // Pied de page
  // ─────────────────────────────────────────────────────────────
  private drawFooter(doc: jsPDF): void {
    const W = doc.internal.pageSize.getWidth();
    const H = doc.internal.pageSize.getHeight();
    const n = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= n; i++) {
      doc.setPage(i);
      doc.setDrawColor(...this.SLATE200);
      doc.line(8, H - 12, W - 8, H - 12);
      doc.setFontSize(7);
      doc.setTextColor(...this.SLATE500);
      doc.text('QualiFlow — Document confidentiel', 8, H - 7);
      doc.text(`Page ${i} / ${n}`, W - 8, H - 7, { align: 'right' });
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Section label
  // ─────────────────────────────────────────────────────────────
  private section(doc: jsPDF, label: string, y: number): number {
    const W = doc.internal.pageSize.getWidth();
    doc.setFillColor(...this.GREEN);
    doc.rect(8, y, W - 16, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text(label.toUpperCase(), 12, y + 4.2);
    return y + 10;
  }

  // ─────────────────────────────────────────────────────────────
  // Ligne de métadonnée
  // ─────────────────────────────────────────────────────────────
  private metaRow(doc: jsPDF, label: string, value: string, x: number, y: number): void {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...this.SLATE500);
    doc.text(label + ' :', x, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...this.SLATE800);
    doc.text(value || '—', x + 38, y);
  }

  // ─────────────────────────────────────────────────────────────
  // PDF Procédure
  // ─────────────────────────────────────────────────────────────
  downloadProcedure(p: ProcedureDetail): void {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const W = doc.internal.pageSize.getWidth();

    this.drawHeader(doc,
      `Procédure : ${p.code}`,
      p.titre
    );

    let y = 48;

    // ── Informations générales ─────────────────────────────
    y = this.section(doc, 'Informations générales', y);

    this.metaRow(doc, 'Code',         p.code,            12,  y);
    this.metaRow(doc, 'Processus',    `${p.processusCode} — ${p.processusNom}`, 110, y);
    y += 7;
    this.metaRow(doc, 'Statut',       p.statut === 'ACTIF' ? 'Actif' : 'Inactif', 12, y);
    this.metaRow(doc, 'Responsable',  p.responsableNom,  110, y);
    y += 7;
    this.metaRow(doc, 'Date création',
      new Date(p.dateCreation).toLocaleDateString('fr-FR'), 12, y);
    if (p.domaineApplication) {
      this.metaRow(doc, 'Domaine', p.domaineApplication, 110, y);
    }
    y += 10;

    // ── Objectif ──────────────────────────────────────────
    y = this.section(doc, 'Objectif', y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...this.SLATE800);
    const objLines = doc.splitTextToSize(p.objectif, W - 24);
    doc.text(objLines, 12, y);
    y += objLines.length * 5 + 5;

    // ── Description ───────────────────────────────────────
    if (p.description) {
      y = this.section(doc, 'Description', y);
      const descLines = doc.splitTextToSize(p.description, W - 24);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...this.SLATE800);
      doc.text(descLines, 12, y);
      y += descLines.length * 5 + 5;
    }

    // ── Instructions ──────────────────────────────────────
    if (p.instructions.length > 0) {
      y = this.section(doc, 'Instructions', y);
      autoTable(doc, {
        startY: y,
        margin: { left: 8, right: 8 },
        head: [['Code', 'Titre', 'Description', 'Statut', 'Créée le']],
        body: p.instructions.map(i => [
          i.code,
          i.titre,
          i.description ?? '—',
          i.statut === 'ACTIF' ? 'Actif' : 'Inactif',
          new Date(i.dateCreation).toLocaleDateString('fr-FR')
        ]),
        headStyles: {
          fillColor: this.GREEN,
          textColor: [255, 255, 255],
          fontSize: 8,
          fontStyle: 'bold'
        },
        bodyStyles: { fontSize: 8, textColor: this.SLATE800 },
        alternateRowStyles: { fillColor: this.SLATE50 },
        columnStyles: { 0: { cellWidth: 22 }, 3: { cellWidth: 18 }, 4: { cellWidth: 22 } }
      });
    } else {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(...this.SLATE500);
      doc.text('Aucune instruction associée.', 12, y + 4);
    }

    this.drawFooter(doc);
    doc.save(`Procedure_${p.code}_${new Date().toISOString().slice(0, 10)}.pdf`);
  }

  // ─────────────────────────────────────────────────────────────
  // PDF Document
  // ─────────────────────────────────────────────────────────────
  downloadDocument(d: DocumentDetail): void {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const W = doc.internal.pageSize.getWidth();

    this.drawHeader(doc,
      `Document : ${d.code}`,
      d.titre
    );

    let y = 48;

    // ── Informations générales ─────────────────────────────
    y = this.section(doc, 'Informations générales', y);

    this.metaRow(doc, 'Code',       d.code,            12,  y);
    this.metaRow(doc, 'Type',       d.typeDocument,    110, y);
    y += 7;
    this.metaRow(doc, 'Processus',  d.processusCode ?? '—', 12, y);
    this.metaRow(doc, 'Actif',      d.actif ? 'Oui' : 'Non', 110, y);
    y += 7;
    this.metaRow(doc, 'Date création',
      new Date(d.dateCreation).toLocaleDateString('fr-FR'), 12, y);
    y += 10;

    // ── Description ───────────────────────────────────────
    if (d.description) {
      y = this.section(doc, 'Description', y);
      const descLines = doc.splitTextToSize(d.description, W - 24);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...this.SLATE800);
      doc.text(descLines, 12, y);
      y += descLines.length * 5 + 5;
    }

    // ── Versions ──────────────────────────────────────────
    if (d.versions && d.versions.length > 0) {
      y = this.section(doc, 'Historique des versions', y);
      autoTable(doc, {
        startY: y,
        margin: { left: 8, right: 8 },
        head: [['Version', 'Statut', 'Établi par', 'Commentaire', 'Date']],
        body: d.versions.map(v => [
          v.numeroVersion,
          v.statut,
          v.etabliParNom ?? '—',
          v.commentaireRevision ?? '—',
          new Date(v.dateEtablissement).toLocaleDateString('fr-FR')
        ]),
        headStyles: {
          fillColor: this.GREEN,
          textColor: [255, 255, 255],
          fontSize: 8,
          fontStyle: 'bold'
        },
        bodyStyles: { fontSize: 8, textColor: this.SLATE800 },
        alternateRowStyles: { fillColor: this.SLATE50 },
        columnStyles: { 0: { cellWidth: 22 }, 1: { cellWidth: 28 }, 4: { cellWidth: 22 } }
      });
    }

    this.drawFooter(doc);
    doc.save(`Document_${d.code}_${new Date().toISOString().slice(0, 10)}.pdf`);
  }
}
