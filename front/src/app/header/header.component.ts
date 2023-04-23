import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  Renderer2,
  ViewChild,
  inject,
} from '@angular/core';
import { CredentialsService } from '@app/auth/credentials.service';
import { ResponsiveComponent } from '@app/shared/responsive/responsive.component';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent extends ResponsiveComponent {
  private readonly credentialsService = inject(CredentialsService);

  public readonly credentials$ = this.credentialsService.credentials$;

  public readonly logOut = () => this.credentialsService.logOut(true);
}
