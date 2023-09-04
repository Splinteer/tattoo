import { Injectable, PipeTransform } from '@nestjs/common';
import { DateTime } from 'luxon';

@Injectable()
export class ParseDateTimePipe implements PipeTransform {
  transform(value: any) {
    if (typeof value === 'string') {
      return DateTime.fromISO(value);
    }

    return value;
  }
}
