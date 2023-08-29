import { DatePipe } from '@angular/common';
import { Inject, LOCALE_ID, Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'shortTime',
  standalone: true,
})
export class ShortTimePipe implements PipeTransform {
  constructor(@Inject(LOCALE_ID) public locale: string) {}

  transform(value: string, showHour?: boolean): string {
    const datePipe = new DatePipe(this.locale);
    const formattedTime = datePipe.transform(value, 'H:mm');

    if (!formattedTime) {
      return '';
    }

    return formattedTime.endsWith('00')
      ? formattedTime.split(':')[0] + (showHour ? 'h' : '')
      : formattedTime;
  }
}
