import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ResponsiveService } from './responsive.service';
import { distinctUntilChanged } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';

@Component({
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResponsiveComponent {
  private readonly responsiveService = inject(ResponsiveService);

  public readonly isMobile = this.responsiveService.isMobile;

  public readonly screenHeight$ = toObservable(
    this.responsiveService.screenHeight,
  ).pipe(distinctUntilChanged());
}
