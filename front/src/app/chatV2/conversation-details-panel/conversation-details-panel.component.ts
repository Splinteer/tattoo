import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImagePreviewService } from '@app/shared/image-preview.service';
import { ChatSelectionService } from '../chat-selection.service';
import { DetailsPanelService } from '../details-panel.service';
import { ResponsiveComponent } from '@app/shared/responsive/responsive.component';
import { TranslateModule } from '@ngx-translate/core';
import { CalendarItemComponent } from '@app/calendar/calendar-item/calendar-item.component';
import { FlashItemComponent } from '@app/flash/flash-item/flash-item.component';

@Component({
  selector: 'app-conversation-details-panel',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    CalendarItemComponent,
    FlashItemComponent,
  ],
  template: `
    @if (conversation(); as conversation) {
      <div class="header">
        <h2>Projet</h2>
        @if (isMobile()) {
          <button (click)="close()">
            <i class="fa-regular fa-times-circle"></i>
          </button>
        }
      </div>

      <div class="content">
        <div class="box">
          @for (type of conversation.project.types; track type) {
            <div class="detail">
              {{ temp[type].text | translate }}
              <i class="type-icon" [ngClass]="temp[type].icon"></i>
            </div>
            <hr />
          }

          @if (conversation.project.isFirstTattoo) {
            <div class="detail">
              <div class="name">Premier tatouage</div>
              <i class="fa-solid fa-stars"></i>
            </div>
            <hr />
          }

          @if (conversation.project.isCoverUp) {
            <div class="detail">
              <div class="name">Recouvrement</div>
              <i class="fa-solid fa-star-half-stroke"></i>
            </div>
            <hr />
          }

          @if (conversation.project.isPostOperationOrOverScar) {
            <div class="detail">
              <div class="name">Post opé</div>
              <i class="fa-solid fa-bandage"></i>
            </div>
            <hr />
          }

          <div class="detail">
            <div class="name">Zone</div>
            <div class="text-bold">{{ conversation.project.zone }}</div>
          </div>
          <hr />

          <div class="detail">
            <div class="name">Taille (lxh)</div>
            <div class="text-bold">
              {{ conversation.project.widthCm }}x{{
                conversation.project.heightCm
              }}
            </div>
          </div>

          @if (conversation.project.additionalInformation) {
            <hr />
            <div class="detail">
              <div class="name break-lines text-center footnote">
                {{ conversation.project.additionalInformation }}
              </div>
            </div>
          }
        </div>

        @if (conversation.project.illustrations) {
          <h3>Illustrations</h3>
          <div class="media-grid">
            @for (src of conversation.project.illustrations; track src) {
              <button
                (click)="openModalPreview(src)"
                class="cursor-pointer media"
              >
                <img [src]="src" />
              </button>
            }
          </div>
        }

        @if (conversation.project.appointments) {
          <h3>Rendez-vous</h3>
          <div class="events">
            @for (event of conversation.project.appointments; track event.id) {
              <app-calendar-item [event]="event" date></app-calendar-item>
            }
          </div>
        }

        @if (conversation.project.customerAvailability) {
          <h3>Disponibilités</h3>
          <div class="box footnote">
            {{ conversation.project.customerAvailability }}
          </div>
        }

        @if (conversation.project.locations) {
          <h3>Emplacement</h3>
          <div class="media-grid">
            @for (src of conversation.project.locations; track src) {
              <button
                (click)="openModalPreview(src)"
                class="cursor-pointer media"
              >
                <img [src]="src" />
              </button>
            }
          </div>
        }

        @if (conversation.project.flashs) {
          <h3>Flash</h3>
          <div class="media-grid">
            @for (flash of conversation.project.flashs; track flash) {
              <app-flash-item
                class="media"
                [flash]="flash"
                hideAvailability
              ></app-flash-item>
            }
          </div>
        }

        @if (conversation.project.attachments) {
          <h3>Médias</h3>
          <div class="media-grid">
            @for (src of conversation.project.attachments; track src) {
              <button
                (click)="openModalPreview(src)"
                class="cursor-pointer media"
              >
                <img [src]="src" />
              </button>
            }
          </div>
        }
      </div>
    }
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      overflow: hidden;
      background-color: var(--material-control-sidebar);
    }

    hr {
      width: 100%;
    }

    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
      margin: 0;
    }

    h3 {
      margin-block: var(--space-short);
      padding-inline: var(--space-middle);
    }

    i {
      font-size: 1.2rem;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--space-short) var(--space-middle);
      background-color: var(--bg-primary);
      border-bottom: 1px solid var(--separator-non-opaque);

      button {
        font-size: 1.2rem;
      }
    }

    .content {
      padding: var(--space-middle);
      overflow-y: auto;
    }

    .events,
    .box {
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: var(--space-short);
    }

    .box {
      background-color: var(--bg-color);
      border-radius: var(--base-border-radius);
      padding: var(--space-middle);
    }

    .detail {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: var(--space-300);
    }

    .media-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--space-short);

      .media {
        width: 100%;
        height: 75px;
        border-radius: var(--base-border-radius);
        overflow: hidden;

        img {
          width: 100%;
          height: 75px;
          object-fit: cover;
        }
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConversationDetailsPanelComponent extends ResponsiveComponent {
  readonly #detailsPanelService = inject(DetailsPanelService);

  readonly conversation = inject(ChatSelectionService).conversation;

  readonly #imagePreviewService = inject(ImagePreviewService);

  temp = {
    flashs: {
      icon: 'fa-regular fa-sparkles',
      text: 'BOOKING.types.flashs',
    },
    custom: {
      icon: 'fa-regular fa-plus',
      text: 'BOOKING.types.custom',
    },
    adjustment: {
      icon: 'fa-regular fa-circle-dashed',
      text: 'BOOKING.types.adjustment',
    },
  };

  openModalPreview(src: string) {
    return this.#imagePreviewService.openModal(src);
  }

  close() {
    this.#detailsPanelService.toggle();
  }
}
