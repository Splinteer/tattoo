import { Component, inject } from '@angular/core';
import { ShopService } from '../shop.service';

@Component({
  selector: 'app-shop-edit',
  templateUrl: './shop-edit.component.html',
  styleUrls: ['./shop-edit.component.scss'],
})
export class ShopEditComponent {
  private readonly shopService = inject(ShopService);

  public readonly shop$ = this.shopService.get();
}
