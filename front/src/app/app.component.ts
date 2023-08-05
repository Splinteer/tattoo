import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ResponsiveComponent } from './shared/responsive/responsive.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent extends ResponsiveComponent {}
