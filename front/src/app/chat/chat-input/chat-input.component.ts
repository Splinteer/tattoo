import { Component, Renderer2, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../chat.service';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { OverlayModule } from '@angular/cdk/overlay';
import { map, startWith, switchMap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

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
  templateUrl: './chat-input.component.html',
  styleUrls: ['./chat-input.component.scss'],
})
export class ChatInputComponent {
  private readonly chatService = inject(ChatService);

  private readonly renderer = inject(Renderer2);

  private readonly translateService = inject(TranslateService);

  public readonly chat = this.chatService.activeChatSignal;

  public newMessage = '';

  public readonly attachments: File[] = [];

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

  addMessage() {
    const chat = this.chat();
    if (!this.newMessage.length || !chat) {
      return;
    }

    this.chatService.addMessage(chat, this.newMessage);
    this.newMessage = '';
  }

  adjustTextareaHeight(event: any): void {
    const textarea = event.target;
    this.renderer.setStyle(textarea, 'height', 'auto');
    this.renderer.setStyle(textarea, 'height', textarea.scrollHeight + 'px');
  }

  fileSizeError: boolean = false;

  fileTypeError: boolean = false;

  onFileChange(event: any) {
    const file = event.target.files[0];
    const maxSize = 2 * 1024 * 1024; // 2MB

    // Check file size
    if (file.size > maxSize) {
      this.fileSizeError = true;
      // Optionally, clear the input
      event.target.value = '';
      return; // Exit the function early if the file size is too large
    } else {
      this.fileSizeError = false;
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      this.fileTypeError = true;
      // Optionally, clear the input
      event.target.value = '';
      return; // Exit the function early if the file type is not allowed
    } else {
      this.fileTypeError = false;
    }

    // Handle the file upload or any other operations
  }
}
