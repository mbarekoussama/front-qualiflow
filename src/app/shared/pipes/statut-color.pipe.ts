import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'statutColor',
  standalone: true
})
export class StatutColorPipe implements PipeTransform {
  transform(statut: string): string {
    const map: Record<string, string> = {
      'Conforme': 'text-green-700',
      'Active': 'text-green-700',
      'Approuvé': 'text-green-700',
      'À surveiller': 'text-amber-600',
      'En révision': 'text-amber-600',
      'En cours': 'text-amber-600',
      'Non conforme': 'text-red-600',
      'Ouverte': 'text-red-600',
      'Archivée': 'text-slate-400',
      'Périmé': 'text-slate-400',
    };
    return map[statut] ?? 'text-slate-500';
  }
}
