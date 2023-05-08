import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CredentialsService } from '@app/auth/credentials.service';
import { ShopService } from '../shop.service';
import { backInDown } from '@shared/animation';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  animations: [backInDown()],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  private readonly credentialsService = inject(CredentialsService);

  public readonly credentials$ = this.credentialsService.credentials$;

  private readonly shopService = inject(ShopService);
}
