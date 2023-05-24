import { Component, inject } from '@angular/core';
import { ResponsiveComponent } from '@app/shared/responsive/responsive.component';
import { FlashService } from '../../flash/flash.service';
import { GalleryService } from '@app/gallery/gallery.service';

@Component({
  selector: 'app-shop-gallery',
  templateUrl: './shop-gallery.component.html',
  styleUrls: ['./shop-gallery.component.scss'],
})
export class ShopGalleryComponent extends ResponsiveComponent {
  private readonly flashService = inject(FlashService);

  public readonly flashs$ = this.flashService.getMine();

  private readonly galleryService = inject(GalleryService);

  public readonly gallerys$ = this.galleryService.getMine();
}
