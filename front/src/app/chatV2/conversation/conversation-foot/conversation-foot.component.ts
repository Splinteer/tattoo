import {
  ChangeDetectionStrategy,
  Component,
  Input,
  Renderer2,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Conversation } from '@app/chatV2/chat.interface';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ImagePreviewService } from '@app/shared/image-preview.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { startWith, switchMap, map } from 'rxjs';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { FormsModule } from '@angular/forms';
import { OverlayModule } from '@angular/cdk/overlay';
import { ConversationEventsService } from '@app/chatV2/conversation-events.service';

type SkinVariation = {
  unified: string;
  sheet: [number, number];
};

type Emoji = {
  name: string;
  unified: string;
  keywords: string[];
  sheet: [number, number];
  skinVariations: SkinVariation[];
  shortNames: string[];
  shortName: string;
  id: string;
  native: string;
  emoticons: string[];
  hidden: unknown[]; // You might want to specify a more detailed type if you know the structure
  text: string;
  set: string;
  colons: string;
};

@Component({
  selector: 'app-conversation-foot',
  standalone: true,
  imports: [
    CommonModule,
    PickerModule,
    TranslateModule,
    FormsModule,
    OverlayModule,
  ],
  template: `
    @if (imagesPreview$ | async; as imagesPreview) {
      @if (imagesPreview.length) {
        <div class="preview-container">
          @for (image of imagesPreview; track image; let imageIndex = $index) {
            <div class="image-container">
              <img [src]="image" />

              <button type="button" class="button button-outline">
                <i
                  class="fa-regular fa-times"
                  (click)="removeImage(imageIndex)"
                ></i>
              </button>
            </div>
          }
        </div>
      }
      <div class="preview-error-container">
        @if (fileSizeError) {
          <div class="error-group" translate>CHAT.INPUT.file_size_error</div>
        }

        @if (fileTypeError) {
          <div class="error-group" translate>CHAT.INPUT.file_type_error</div>
        }
      </div>
    }
    <div class="input-container">
      <button class="media-btn" (click)="fileInput.click()">
        <i class="fa-solid fa-image"></i>
      </button>
      <div class="input-container">
        <textarea
          (keydown.enter)="addMessage($event)"
          (input)="adjustTextareaHeight($event)"
          rows="1"
          [(ngModel)]="newMessage"
          type="text"
          placeholder="Aa"
        ></textarea>

        <button
          (click)="isEmojiOverlayOpen = true"
          class="emoji-btn"
          cdkOverlayOrigin
          #trigger="cdkOverlayOrigin"
        >
          <i class="fa-sharp fa-solid fa-face-smile"></i>
        </button>
      </div>

      @if (!sending) {
        <button class="send-btn" (click)="addMessage()">
          <i class="fa-sharp fa-solid fa-paper-plane-top"></i>
        </button>
      } @else {
        <button class="send-btn">
          <i class="fa-regular fa-spinner-third fa-spin"></i>
        </button>
      }

      <input
        #fileInput
        type="file"
        style="display: none"
        (change)="onFileChange($event)"
        accept=".jpg, .jpeg, .png"
        multiple
      />

      <ng-template
        cdkConnectedOverlay
        [cdkConnectedOverlayOrigin]="trigger"
        [cdkConnectedOverlayOpen]="isEmojiOverlayOpen"
        [cdkConnectedOverlayFlexibleDimensions]="true"
        [cdkConnectedOverlayPush]="true"
        (overlayOutsideClick)="isEmojiOverlayOpen = false"
        [cdkConnectedOverlayPositions]="[
          {
            originX: 'end',
            originY: 'top',
            overlayX: 'end',
            overlayY: 'bottom',
            offsetX: 5
          }
        ]"
      >
        <emoji-mart
          title="Pick your emoji…"
          emoji="thumbs_up"
          [i18n]="emojiMartTranslation()"
          color="var(--primary-color)"
          [darkMode]="false"
          [isNative]="true"
          (emojiSelect)="addEmoji($event)"
          [enableFrequentEmojiSort]="true"
          [showPreview]="false"
        ></emoji-mart>
      </ng-template>
    </div>
  `,
  styles: `
  $size: 40px;

  .input-container {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    gap: 5px;
    position: relative;
    flex-grow: 1;

    textarea {
      min-height: 100%;
      max-height: 120px;
      padding-right: $size;
      resize: none;
    }

    button.emoji-btn,
    button.send-btn,
    button.media-btn {
      color: var(--primary-color);
      border-radius: 50%;
      transition: background-color 0.2s ease-in;
      width: $size;
      height: $size;
      font-size: 20px;
      text-align: center;

      &:hover {
        background-color: var(--gray-200);
      }
    }

    button.emoji-btn {
      width: calc($size - 10px);
      height: calc($size - 10px);
      position: absolute;
      bottom: 1px;
      right: 1px;

      i {
        font-size: calc($size - 20px - 2px);
      }
    }
  }

  .preview-container {
    display: flex;
    gap: var(--space-500);
    padding: var(--space-200);
    overflow-x: auto;
    overflow-y: visible;

    .image-container {
      position: relative;

      button {
        position: absolute;
        top: -7px;
        right: -7px;
        border-radius: 50%;
        border: 1px solid var(--primary-color);
        padding: 3px;

        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 13px;
      }

      img {
        height: 100%;
        max-height: 100px;
        object-fit: cover;
        border-radius: var(--border-radius);
        // border: 1px solid var(--primary-color);

        box-shadow: var(--box-shadow);

        aspect-ratio: 1;
      }
    }
  }

  .preview-error-container .error-group {
    text-align: center;
  }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConversationFootComponent {
  @Input({ required: true }) conversation!: Conversation;

  readonly #eventsService = inject(ConversationEventsService);

  readonly #renderer = inject(Renderer2);

  readonly #translateService = inject(TranslateService);

  readonly #imagePreviewService = inject(ImagePreviewService);

  readonly #attachments = signal<File[]>([]);

  readonly imagesPreview$ = this.#imagePreviewService.getImagesPreviews(
    toObservable(this.#attachments),
  );

  newMessage = '';

  sending = false;

  fileSizeError: boolean = false;

  fileTypeError: boolean = false;

  isEmojiOverlayOpen = false;

  readonly emojiMartTranslation = toSignal(
    this.#translateService.onLangChange.pipe(
      startWith(
        this.#translateService.currentLang ??
          this.#translateService.defaultLang,
      ),
      switchMap((lang) =>
        this.#translateService.getTranslation(lang as string),
      ),
      map((lang) => {
        return lang['EMOJI_MART'];
      }),
    ),
  );

  addEmoji({ emoji }: { $event: Event; emoji: Emoji }) {
    this.newMessage += emoji.native;
  }

  addMessage(event?: Event) {
    if (event) {
      event.preventDefault();
    }

    const attachments = this.#attachments();
    if (!this.newMessage.length && !attachments.length) {
      return;
    }

    this.sending = true;

    this.#eventsService
      .addEvent(this.conversation, this.newMessage, attachments)
      .subscribe(() => {
        this.newMessage = '';
        this.fileSizeError = false;
        this.fileTypeError = false;
        this.#attachments.set([]);
        this.sending = false;
      });
  }

  adjustTextareaHeight(event: Event): void {
    const textarea = event.target as HTMLElement;
    this.#renderer.setStyle(textarea, 'height', 'auto');
    this.#renderer.setStyle(textarea, 'height', textarea.scrollHeight + 'px');
  }

  onFileChange(event: Event) {
    const fileInput = event.target as HTMLInputElement;

    const files = Array.from(fileInput.files as FileList);
    const maxSize = 2 * 1024 * 1024; // 2MB
    this.fileSizeError = false;
    this.fileTypeError = false;

    files.forEach((file: File) => {
      if (file.size > maxSize) {
        this.fileSizeError = true;
        fileInput.value = '';
        return;
      }

      const allowedTypes = ['image/jpeg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        this.fileTypeError = true;
        fileInput.value = '';
        return;
      }

      this.#attachments.update((files) => [...files, file]);
    });
  }

  removeImage(index: number) {
    this.#attachments.update((files) => {
      const updatedFiles = [...files];
      updatedFiles.splice(index, 1);

      return updatedFiles;
    });
  }
}
