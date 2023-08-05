import { Component, Input, OnInit, inject } from '@angular/core';
import { Flash, FlashService } from '../../flash/flash.service';

@Component({
  selector: 'app-shop-gallery-add',
  templateUrl: './shop-gallery-add.component.html',
  styleUrls: ['./shop-gallery-add.component.scss'],
})
export class ShopGalleryAddComponent implements OnInit {
  @Input() flash?: Flash;

  private readonly flashService = inject(FlashService);

  ngOnInit(): void {}
}

/**
 * CREATE TABLE
    IF NOT EXISTS public.flash (
        id uuid PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
        shop_id uuid NOT NULL,
        creation_date timestamp NOT NULL DEFAULT NOW(),
        name varchar(255) NOT NULL,
        description text,
        image_url varchar(255) NOT NULL,
        available boolean NOT NULL DEFAULT true,
        price_range_start integer,
        price_range_end integer,
        CONSTRAINT fk_shop_id FOREIGN KEY (shop_id) REFERENCES public.shop (id)
    );
 */
