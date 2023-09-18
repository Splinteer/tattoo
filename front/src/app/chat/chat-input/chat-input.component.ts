import { Component, Renderer2, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../chat.service';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { OverlayModule } from '@angular/cdk/overlay';
import {
  BehaviorSubject,
  Observable,
  forkJoin,
  map,
  of,
  startWith,
  switchMap,
  tap,
} from 'rxjs';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ImagePreviewService } from '@app/shared/image-preview.service';

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
  hidden: any[]; // You might want to specify a more detailed type if you know the structure
  text: string;
  set: string;
  colons: string;
};

@Component({
  selector: 'app-chat-input',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PickerComponent,
    TranslateModule,
    OverlayModule,
  ],
  providers: [ImagePreviewService],
  templateUrl: './chat-input.component.html',
  styleUrls: ['./chat-input.component.scss'],
})
export class ChatInputComponent {
  private readonly chatService = inject(ChatService);

  private readonly renderer = inject(Renderer2);

  private readonly translateService = inject(TranslateService);

  readonly #imagePreviewService = inject(ImagePreviewService);

  public readonly chat = this.chatService.activeChatSignal;

  public newMessage = '';

  readonly #attachments$ = signal<File[]>([]);

  readonly imagesPreview$ = this.#imagePreviewService.getImagesPreviews(
    toObservable(this.#attachments$)
  );

  fileSizeError: boolean = false;

  fileTypeError: boolean = false;

  public isEmojiOverlayOpen = false;

  public readonly emojiMartTranslation = toSignal(
    this.translateService.onLangChange.pipe(
      startWith(
        this.translateService.currentLang ?? this.translateService.defaultLang
      ),
      switchMap((lang) => this.translateService.getTranslation(lang as string)),
      map((lang) => {
        return lang['EMOJI_MART'];
      })
    )
  );

  addEmoji({ emoji }: { $event: Event; emoji: Emoji }) {
    this.newMessage += emoji.native;
  }

  addMessage(event?: Event) {
    if (event) {
      event.preventDefault();
    }

    const chat = this.chat();
    const attachments = this.#attachments$();
    if ((!this.newMessage.length && !attachments.length) || !chat) {
      return;
    }

    this.chatService.addEvent(chat, this.newMessage, attachments);
    this.newMessage = '';
    this.fileSizeError = false;
    this.fileTypeError = false;
    this.#attachments$.set([]);
  }

  adjustTextareaHeight(event: Event): void {
    const textarea = event.target as HTMLElement;
    this.renderer.setStyle(textarea, 'height', 'auto');
    this.renderer.setStyle(textarea, 'height', textarea.scrollHeight + 'px');
  }

  onFileChange(event: any) {
    const files = Array.from(event.target.files as FileList);
    const maxSize = 2 * 1024 * 1024; // 2MB
    this.fileSizeError = false;
    this.fileTypeError = false;

    files.forEach((file: File) => {
      if (file.size > maxSize) {
        this.fileSizeError = true;
        event.target.value = '';
        return;
      }

      const allowedTypes = ['image/jpeg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        this.fileTypeError = true;
        event.target.value = '';
        return;
      }

      this.#attachments$.update((files) => [...files, file]);
    });
  }

  removeImage(index: number) {
    this.#attachments$.update((files) => {
      files.splice(index, 1);
      return files;
    });
  }
}
