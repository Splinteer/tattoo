import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { ResponsiveService } from './responsive.service';
import { tap } from 'rxjs';

@Component({
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResponsiveComponent {
  private readonly responsiveService = inject(ResponsiveService);

  public readonly isMobile$ = this.responsiveService.isMobile$;
}
