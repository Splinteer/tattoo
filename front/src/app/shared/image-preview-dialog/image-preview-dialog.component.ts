import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DIALOG_DATA } from '@angular/cdk/dialog';

@Component({
  selector: 'app-image-preview-dialog',
  standalone: true,
  imports: [CommonModule],
  template: ` <img [src]="src" />`,
  styles: [
    `
      :host {
        max-width: 90vw;
        max-height: 90vh;
        outline: none;
        overflow: hidden;
      }

      img {
        display: block;
        width: 100%;
        height: auto;
        max-height: 90vh;
        object-fit: contain;
      }
    `,
  ],
})
export class ImagePreviewDialogComponent {
  public readonly src: string = inject(DIALOG_DATA);
}
