import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ShopWithRating, ShopService } from '../shop.service';
import { Observable, map, switchMap } from 'rxjs';
import { environment } from '@env/environment';

@Component({
  selector: 'app-shop-profile',
  templateUrl: './shop-profile.component.html',
  styleUrls: ['./shop-profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShopProfileComponent {
  private readonly route = inject(ActivatedRoute);

  private readonly shopService = inject(ShopService);

  public readonly publicBucket = environment.public_bucket;

  public activeTab: string = 'flashs';

  public readonly shop$: Observable<
    ShopWithRating & { socials: { icon: string; url: string }[] }
  > = this.route.params.pipe(
    switchMap(({ shopUrl }) => this.shopService.getByUrl(shopUrl)),
    map((shop) => {
      const socials = [];

      if (shop.instagram) {
        socials.push({
          icon: 'fa-brands fa-instagram',
          url: 'https://instagram.com/' + shop.instagram,
        });
      }

      if (shop.twitter) {
        socials.push({
          icon: 'fa-brands fa-twitter',
          url: 'https://twitter.com/' + shop.twitter,
        });
      }

      if (shop.facebook) {
        socials.push({
          icon: 'fa-brands fa-facebook',
          url: 'https://facebook.com/' + shop.facebook,
        });
      }

      if (shop.website) {
        socials.push({
          icon: 'fa-regular fa-globe',
          url: shop.website,
        });
      }

      return { ...shop, socials };
    })
  );
}
