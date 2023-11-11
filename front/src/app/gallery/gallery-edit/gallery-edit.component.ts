import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { GalleryService } from '../gallery.service';
import { ActivatedRoute, Params } from '@angular/router';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-gallery-edit',
  template: `
    @if (gallery$ | async; as gallery) {

    <app-gallery-add [gallery]="gallery"></app-gallery-add>

    }
  `,
  styles: [
    `
      :host {
        width: 100%;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GalleryEditComponent {
  private readonly galleryService = inject(GalleryService);

  private readonly route = inject(ActivatedRoute);

  public readonly gallery$ = this.route.params.pipe(
    switchMap((params: Params) => this.galleryService.get(params['id'])),
  );
}
