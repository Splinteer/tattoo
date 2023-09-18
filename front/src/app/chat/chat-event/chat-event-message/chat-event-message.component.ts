import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  Input,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chat-event-message',
  standalone: true,
  imports: [CommonModule],
  template: `<ng-content></ng-content>`,
  styles: [
    `
      :host {
        display: flex;
        width: fit-content;
        background-color: var(--material-control-selection-focus);
        color: var(--label-dark-primary);
        padding: var(--space-short);
        border-radius: var(--base-border-radius);
        position: relative;

        &::before,
        &::after {
          bottom: -0.1rem;
          content: '';
          height: 10px;
          position: absolute;
        }

        &.mine {
          &::before {
            border-bottom-left-radius: 0.8rem 0.7rem;
            border-right: 1rem solid var(--material-control-selection-focus);
            right: -0.35rem;
            transform: translate(0, -0.1rem);
          }

          &::after {
            background-color: var(--bg-primary);
            border-bottom-left-radius: 0.5rem;
            right: -40px;
            transform: translate(-30px, -2px);
            width: 10px;
          }
        }

        &.theirs {
          background-color: #e5e5ea;
          color: black;

          &::before {
            border-bottom-right-radius: 0.8rem 0.7rem;
            border-left: 1rem solid #e5e5ea;
            left: -0.35rem;
            transform: translate(0, -0.1rem);
          }

          &::after {
            background-color: var(--bg-primary);
            border-bottom-right-radius: 0.5rem;
            left: 20px;
            transform: translate(-30px, -2px);
            width: 10px;
          }
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatEventMessageComponent {
  @Input({ required: true }) isMine!: boolean;

  @HostBinding('class') get senderClass() {
    return this.isMine ? 'mine' : 'theirs';
  }
}
