import { Pipe, PipeTransform } from '@angular/core';
import { formatLoCode } from '@core/lo-code/lo-code.formatter';

@Pipe({
  name: 'loCodeLabel',
})
export class LoCodeLabelPipe implements PipeTransform {
  transform(
    value: string | null | undefined,
    showMapped = false,
    direction = 'ltr',
  ): string {
    const raw = value ?? '';
    if (!showMapped) {
      return raw;
    }

    const language = direction === 'rtl' ? 'ar' : 'en';
    return formatLoCode(value, language);
  }
}
