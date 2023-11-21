import { Component, Input, OnChanges, booleanAttribute } from '@angular/core';
import { environment } from '@env/environment';

export type AvatarCustomer = {
  id: string;

  got_profile_picture?: boolean;
  profile_picture_version?: number;

  owner_id?: string; // to identify if it's a shop
  shop_id?: string;
  shop_got_picture?: boolean;
  shop_image_version?: number;
};

export type AvatarCustomerV2 = {
  id: string;

  gotProfilePicture?: boolean;
  profilePictureVersion?: number;

  ownerId?: string; // to identify if it's a shop
  shopId?: string;
  shopGotPicture?: boolean;
  shopImageVersion?: number;
};

@Component({
  selector: 'app-avatar',
  template: `
    <img [src]="src" alt="Avatar" />
  `,
  styles: [
    `
      :host {
        display: flex;
        justify-content: center;
        align-items: center;
      }

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
  @Input({ required: true }) customer!: AvatarCustomer | AvatarCustomerV2;

  @Input({ transform: booleanAttribute }) ignoreShop?: boolean = false;

  public src: string = '/assets/images/default_pp.webp';

  ngOnChanges(): void {
    if (
      'owner_id' in this.customer ||
      'shop_got_picture' in this.customer ||
      'got_profile_picture' in this.customer
    ) {
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
    } else if (
      'ownerId' in this.customer ||
      'shopGotPicture' in this.customer ||
      'gotProfilePicture' in this.customer
    ) {
      // V2
      if (
        this.customer.ownerId ||
        (this.customer.shopGotPicture && !this.ignoreShop)
      ) {
        const shopId = this.customer.ownerId
          ? this.customer.id
          : this.customer.shopId;
        const imageVersion = this.customer.ownerId
          ? this.customer.profilePictureVersion
          : this.customer.shopImageVersion;

        this.src =
          environment.public_bucket +
          'shops/' +
          shopId +
          '/logo?v=' +
          imageVersion;
      } else if (this.customer.gotProfilePicture) {
        this.src =
          environment.public_bucket +
          'profile_picture/' +
          this.customer.id +
          '?v=' +
          this.customer.profilePictureVersion;
      }
    }
  }
}
