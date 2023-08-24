import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShopHeaderComponent } from '../shop-header/shop-header.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-shop-shell',
  standalone: true,
  imports: [CommonModule, ShopHeaderComponent, RouterModule],
  template: `
    <app-shop-header></app-shop-header>
    <router-outlet></router-outlet>
  `,
  styles: [
    `
      :host {
        width: 100%;
        padding: var(--page-content-padding);
        display: flex;
        flex-direction: column;
      }

      app-shop-header {
        margin-bottom: var(--space-300);
      }
    `,
  ],
})
export class ShopShellComponent {}
