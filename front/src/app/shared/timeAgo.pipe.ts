import { Pipe, PipeTransform, Inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { switchMap } from 'rxjs/operators';

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
})
export class TimeAgoPipe implements PipeTransform {
  constructor(
    @Inject(TranslateService) private translateService: TranslateService
  ) {}

  transform(value: Date, type: 'long' | 'short' = 'long'): any {
    if (value) {
      const seconds = Math.floor((+new Date() - +new Date(value)) / 1000);
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

      console.log('pipe');
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
    }

    return value;
  }
}
