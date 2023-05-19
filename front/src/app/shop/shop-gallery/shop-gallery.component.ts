import { Component, OnInit } from '@angular/core';
import { ResponsiveComponent } from '@app/shared/responsive/responsive.component';

@Component({
  selector: 'app-shop-gallery',
  templateUrl: './shop-gallery.component.html',
  styleUrls: ['./shop-gallery.component.scss'],
})
export class ShopGalleryComponent
  extends ResponsiveComponent
  implements OnInit
{
  public readonly flashs = [
    'https://l2utattoo.com/assets/img/flash/1638544426_thumb.jpg',
    'https://l2utattoo.com/assets/img/flash/1638544438_thumb.jpg',
    'https://l2utattoo.com/assets/img/flash/1629484449.jpg',
    'https://l2utattoo.com/assets/img/flash/1629485334.jpg',
    'https://l2utattoo.com/assets/img/flash/1629485173.jpg',
    'https://l2utattoo.com/assets/img/flash/1588774138.jpg',
    'https://l2utattoo.com/assets/img/flash/1615734223.jpg',
    'https://l2utattoo.com/assets/img/flash/1615732738.jpg',
    'https://l2utattoo.com/assets/img/flash/1615733792.jpg',
  ];

  public readonly pictures = [
    'https://l2utattoo.com/assets/img/galerie/1615737244.jpeg',
    'https://l2utattoo.com/assets/img/galerie/1615737793.jpeg',
    'https://l2utattoo.com/assets/img/galerie/1615737977.jpeg',
    'https://l2utattoo.com/assets/img/galerie/1615737083.jpeg',
    'https://l2utattoo.com/assets/img/galerie/1615737060.jpeg',
    'https://l2utattoo.com/assets/img/galerie/1615737039.jpeg',
    'https://l2utattoo.com/assets/img/galerie/1615737103.jpeg',
    'https://l2utattoo.com/assets/img/galerie/1615737481.jpeg',
    'https://l2utattoo.com/assets/img/galerie/1615737436.jpeg',
  ];

  ngOnInit(): void {}
}
