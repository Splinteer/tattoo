import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CredentialsService } from '@app/auth/credentials.service';
import { tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AvatarComponent } from '@app/shared/avatar/avatar.component';
import { ChatSelectionService } from '../chat-selection.service';

@Component({
  selector: 'app-chat-selection',
  standalone: true,
  imports: [CommonModule, AvatarComponent],
  template: `
    @if ({ user: credentials(), activeChatList: activeChatList() }; as vm) {
      @if (vm.user && vm.user.shop_url) {
        <button
          (click)="activeChatList.set(vm.user.shop_url)"
          [class.selected]="vm.activeChatList === vm.user.shop_url"
        >
          <app-avatar [customer]="vm.user"></app-avatar>
        </button>
        <button
          (click)="activeChatList.set('personal')"
          [class.selected]="vm.activeChatList !== vm.user.shop_url"
        >
          <app-avatar [customer]="vm.user" ignoreShop></app-avatar>
        </button>
      }
    }
  `,
  styles: `
    :host {
      display: flex;
      gap: var(--space-xsmall);
      overflow-x: auto;
    }

    button {
      display: flex;
      justify-content: center;
      align-items: center;
      transition: background-color 0.2s ease-in-out;
      text-align: center;
      width: 100%;
      border-radius: var(--base-border-radius);
      padding: var(--space-xsmall);

      &.selected {
        background-color: var(--fill-quinary);
      }

      &:hover {
        background-color: var(--fill-quaternary);
      }
    }

    app-avatar {
      min-width: 30px;
      max-width: 50px;
    }

    @media (max-width: 768px) {
      app-avatar {
        max-width: 20px;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatSelectionComponent {
  readonly #credentialsService = inject(CredentialsService);

  readonly #chatSelectionService = inject(ChatSelectionService);

  readonly #changeChatSelectionOnLog$ = this.#credentialsService.credentials$
    .pipe(
      takeUntilDestroyed(),
      tap((credentials) => {
        if (credentials?.shop_url) {
          return this.#chatSelectionService.selectedChatProfile.set(
            credentials.shop_url,
          );
        }

        return this.#chatSelectionService.selectedChatProfile.update(
          () => 'personal',
        );
      }),
    )
    .subscribe();

  readonly credentials = this.#credentialsService.credentials;

  readonly activeChatList = this.#chatSelectionService.selectedChatProfile;
}
