import { Pipe, PipeTransform, inject } from '@angular/core';
import { formatNumber } from '@angular/common';
import { TranslocoService } from '@jsverse/transloco';

@Pipe({
  name: 'localizedNumber',
  pure: false
})
export class LocalizedNumberPipe implements PipeTransform {
  private readonly transloco = inject(TranslocoService);

  transform(value: number | string | null | undefined): string | null {
    if (value == null) return null;

    const num = typeof value === 'number' ? value : Number(value);
    if (Number.isNaN(num)) return String(value);

    const lang = this.transloco.getActiveLang().toLowerCase();
    const locale = lang.startsWith('en') ? 'en-US' :
      lang.startsWith('es') ? 'es-ES' :
        'pt-BR';

    const hasFraction = num % 1 !== 0;
    const digits = hasFraction ? '1.0-2' : '1.0-0';

    return formatNumber(num, locale, digits);
  }
}
