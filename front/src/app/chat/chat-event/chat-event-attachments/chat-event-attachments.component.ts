import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  Input,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImagePreviewService } from '@app/shared/image-preview.service';

@Component({
  selector: 'app-chat-event-attachments',
  standalone: true,
  imports: [CommonModule],
  template: `
    @for (attachment of attachments; track attachment) {
    <button (click)="openModalPreview(attachment)" class="cursor-pointer">
      <img [src]="attachment" />
    </button>
    }
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-short);
        align-items: flex-end;
        justify-content: flex-start;

        &.mine {
          justify-content: flex-end;
        }
      }

      button {
        max-height: 150px;
      }

      img {
        max-height: 150px;
        min-height: 100px;
        height: 100%;
        width: auto;
        border-radius: var(--base-border-radius);
        object-fit: cover;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatEventAttachmentsComponent {
  readonly #imagePreviewService = inject(ImagePreviewService);

  @Input({
    required: true,
    transform: (value: string | string[]) =>
      Array.isArray(value) ? value : [value],
  })
  attachments!: string[];

  @Input({ required: true }) isMine!: boolean;

  @HostBinding('class') get senderClass() {
    return this.isMine ? 'mine' : 'theirs';
  }

  openModalPreview(src?: string) {
    if (src) {
      return this.#imagePreviewService.openModal(src);
    }
  }
}
