import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Credentials } from '@app/auth/credentials.service';
import { Customer } from '@app/customer/customer.service';
import { environment } from '@env/environment';

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
  standalone: true,
})
export class AvatarComponent implements OnChanges {
  @Input({ required: true }) customer!: {
    id: string;

    got_profile_picture?: boolean;
    profile_picture_version?: number;

    owner_id?: string; // to identify if it's a shop
    shop_id?: string;
    shop_got_picture?: boolean;
    shop_image_version?: number;
  };

  @Input() ignoreShop?: boolean = false;

  public src: string =
    'https://flowbite.com/docs/images/people/profile-picture-3.jpg';

  ngOnChanges(changes: SimpleChanges): void {
    if (
      this.customer.owner_id ||
      (this.customer.shop_got_picture && !this.ignoreShop)
    ) {
      const shopId = this.customer.owner_id
        ? this.customer.id
        : this.customer.shop_id;
      const imageVersion = this.customer.owner_id
        ? this.customer.profile_picture_version
        : this.customer.shop_image_version;

      this.src =
        environment.public_bucket +
        'shops/' +
        shopId +
        '/logo?v=' +
        imageVersion;
    } else if (this.customer.got_profile_picture) {
      this.src =
        environment.public_bucket +
        'profile_picture/' +
        this.customer.id +
        '?v=' +
        this.customer.profile_picture_version;
    }
  }
}
