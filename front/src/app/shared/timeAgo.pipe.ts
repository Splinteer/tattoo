import { Pipe, PipeTransform, Inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DateTime } from 'luxon';
import { Observable, combineLatest, of } from 'rxjs';
import { map, startWith, switchMap } from 'rxjs/operators';

const intervals = {
  year: 31536000,
  month: 2592000,
  week: 604800,
  day: 86400,
  hour: 3600,
  minute: 60,
  second: 1,
};

@Pipe({
  name: 'timeAgo',
  pure: false,
  standalone: true,
})
export class TimeAgoPipe implements PipeTransform {
  constructor(
    @Inject(TranslateService) private translateService: TranslateService
  ) {}

  transform(
    value: string | DateTime,
    type: 'long' | 'short' = 'long'
  ): Observable<any> {
    if (!value) {
      return of(value);
    }

    const date = value instanceof DateTime ? value.toJSDate() : new Date(value);

    return combineLatest([
      this.translateService.onLangChange.pipe(
        startWith({}), // To trigger immediately
        switchMap(() => {
          const seconds = Math.floor((+new Date() - +date) / 1000);
          if (seconds < 29) {
            return this.translateService.get('PIPE.TIMEAGO.just_now');
          }

          let count: number = 0;
          const interval = (
            Object.keys(intervals) as Array<keyof typeof intervals>
          ).find((key) => {
            count = Math.floor(seconds / intervals[key]);
            return count > 0;
          });

          return this.translateService
            .get(`PIPE.TIMEAGO.${type}.${interval}`, {
              count: count,
            })
            .pipe(
              switchMap((unit) =>
                this.translateService.get(`PIPE.TIMEAGO.${type}.time_ago`, {
                  count: count,
                  unit,
                })
              )
            );
        })
      ),
    ]);
  }
}
