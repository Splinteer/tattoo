import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ShopService } from '../shop.service';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-shop-profile',
  templateUrl: './shop-profile.component.html',
  styleUrls: ['./shop-profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShopProfileComponent {
  private readonly route = inject(ActivatedRoute);

  private readonly shopService = inject(ShopService);

  public readonly shop$ = this.route.params.pipe(
    switchMap(({ shopUrl }) => this.shopService.getByUrl(shopUrl))
  );
}
