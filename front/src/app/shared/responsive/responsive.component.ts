import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { ResponsiveService } from './responsive.service';
import { distinctUntilChanged, tap } from 'rxjs';

@Component({
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResponsiveComponent {
  private readonly responsiveService = inject(ResponsiveService);

  public readonly isMobile$ = this.responsiveService.isMobile$;

  public readonly screenHeight$ = this.responsiveService.screenHeight$
    .asObservable()
    .pipe(distinctUntilChanged());
}
