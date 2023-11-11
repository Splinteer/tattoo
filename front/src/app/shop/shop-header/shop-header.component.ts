import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CredentialsService } from '@app/auth/credentials.service';
import { RouterModule } from '@angular/router';
import { AvatarComponent } from '@app/shared/avatar/avatar.component';

@Component({
  selector: 'app-shop-header',
  standalone: true,
  imports: [CommonModule, AvatarComponent, RouterModule],
  template: `
    @if (credentials$ | async; as credentials) {
    <div class="header">
      <a routerLink="/shop">
        <app-avatar [customer]="credentials"></app-avatar>
      </a>
      <a routerLink="/shop" class="description">
        <div class="title">
          <h1>{{ credentials.shop_name }}</h1>
          <div class="url">/{{ credentials.shop_url }}</div>
        </div>
      </a>

      <nav>
        <a
          routerLink="/shop/disponiblite"
          routerLinkActive="active"
          class="settings"
        >
          <i class="fa-regular fa-calendar"></i>
          Disponiblités
        </a>
      </nav>

      <a routerLink="/shop/edit" routerLinkActive="active" class="settings">
        <i class="fa-regular fa-gear"></i>
        Modifier la boutique
      </a>
    </div>
    }
  `,
  styleUrls: ['./shop-header.component.scss'],
})
export class ShopHeaderComponent {
  private readonly credentialsService = inject(CredentialsService);

  public readonly credentials$ = this.credentialsService.credentials$;
}
