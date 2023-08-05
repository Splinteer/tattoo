import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Credentials } from '@app/auth/credentials.service';
import { Customer } from '@app/customer/customer.service';

@Component({
  selector: 'app-avatar',
  template: ` <img [src]="src" alt="Avatar" />`,
  styles: [
    `
      img {
        border-radius: 50%;
        border: 1px solid var(--gray-500);
        object-fit: cover;
        aspect-ratio: 1;
      }
    `,
  ],
})
export class AvatarComponent implements OnChanges {
  @Input() customer!: {
    id: string;

    got_profile_picture?: boolean;
    profile_picture_version?: string;

    shop_id?: string;
    shop_got_picture?: boolean;
    shop_image_version?: number;
  }; // update with angular 16

  @Input() ignoreShop?: boolean = false;

  public src: string =
    'https://flowbite.com/docs/images/people/profile-picture-3.jpg';

  ngOnChanges(changes: SimpleChanges): void {
    if (this.customer.shop_got_picture && !this.ignoreShop) {
      this.src =
        'http://storage.googleapis.com/tattoo-public/shops/' +
        this.customer.shop_id +
        '/logo?v=' +
        this.customer.shop_image_version;
    } else if (this.customer.got_profile_picture) {
      this.src =
        'http://storage.googleapis.com/tattoo-public/profile_picture/' +
        this.customer.id +
        '?v=' +
        this.customer.profile_picture_version;
    }
  }
}
