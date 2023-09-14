import {
  ChangeDetectionStrategy,
  Component,
  Input,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatService, Message, ReactiveChat } from '../chat.service';
import { InfiniteScrollComponent } from '@app/shared/infinite-scroll/infinite-scroll.component';
import { HttpService } from '@app/@core/http/http.service';
import { Observable, map } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import { ImagePreviewService } from '@app/shared/image-preview.service';
import { DialogModule } from '@angular/cdk/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { CredentialsService } from '@app/auth/credentials.service';

@Component({
  selector: 'app-chat-message-list',
  standalone: true,
  imports: [CommonModule, InfiniteScrollComponent, TranslateModule],
  // changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './chat-message-list.component.html',
  styleUrls: ['./chat-message-list.component.scss'],
})
export class ChatMessageListComponent {
  @Input({ required: true }) chat!: ReactiveChat;

  readonly #chatService = inject(ChatService);

  readonly #imagePreviewService = inject(ImagePreviewService);

  readonly #credentialsService = inject(CredentialsService);

  readonly credentials = this.#credentialsService.credentials;

  openModalPreview(src: string) {
    return this.#imagePreviewService.openModal(src);
  }

  loadMessages() {
    this.#chatService.queueLoadMoreMessages(this.chat);
  }
}
