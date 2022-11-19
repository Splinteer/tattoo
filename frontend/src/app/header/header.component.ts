import { Component, OnInit } from '@angular/core';
import { ShopService } from '@modules/shop/shop.service';
import { Auth0Service } from '../modules/auth/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  public shopStatus: string | null = null;

  constructor(public auth0: Auth0Service, private shopService: ShopService) {}

  ngOnInit() {
    this.auth0.isAuthenticated.subscribe((isAuthenticated: boolean) => {
      this.getShop();
    });
  }

  private getShop() {
    this.shopService.getShop().subscribe((shopStatus: string | null) => {
      this.shopStatus = shopStatus;
    });
  }
}
