import {
  ChangeDetectionStrategy,
  Component,
  WritableSignal,
  computed,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CredentialsService,
  CredentialsWithShop,
} from '@app/auth/credentials.service';
import { CalendarFormEventComponent } from '../calendar-form-event/calendar-form-event.component';
import { CalendarViewComponent } from '../calendar-view/calendar-view.component';
import {
  FormArray,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CalendarSelectionService } from '../calendar-selection.service';
import { CalendarService } from '../calendar.service';
import { DialogRef } from '@angular/cdk/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { DateTime } from 'luxon';
import { minDateValidator } from '@app/shared/custom-validators';
import { map, tap } from 'rxjs';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ProjectService } from '@app/project/project.service';

@Component({
  selector: 'app-calendar-proposal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CalendarFormEventComponent,
    CalendarViewComponent,
    TranslateModule,
  ],
  template: `
    <form [formGroup]="form">
      <app-calendar-view
        formControlName="availability"
        view="month"
        [shopUrl]="credentials().shop_url"
        proposal
        showToggle
      ></app-calendar-view>
      <p class="caption1 text-center" translate>
        CALENDAR.PROPOSAL.select_event
      </p>
    </form>

    @if (form) {
    <form
      class="grouped-form no-border"
      [formGroup]="form"
      #ngForm="ngForm"
      (ngSubmit)="submit()"
    >
      <ng-container formArrayName="proposals">
        <div role="group" aria-labelledby="group-date">
          <div class="input-group">
            <h1 class="title1" translate>CALENDAR.PROPOSAL.title</h1>
          </div>
          <!-- @for (proposal of proposalsFormArray().controls; let proposalIndex = $index; let isLast = $last) { -->

          @for ( proposal of proposalsFormArray().controls; track proposal; let
          proposalIndex = $index; let isLast = $last) {

          <ng-container [formGroupName]="proposalIndex">
            <div class="input-group inline">
              <label translate>AVAILABILITY.the_day</label>
              <input
                formControlName="date"
                type="date"
                id="date"
                name="date"
                [min]="today.toISODate()"
                [placeholder]="'AVAILABILITY.the_day' | translate | lowercase"
                [ngClass]="{
                  'is-invalid':
                    (ngForm.submitted || form.get('date')?.touched) &&
                    form.get('date')?.errors
                }"
              />
            </div>
            @if (!form.get('allDay')?.getRawValue()) {
            <div class="input-group inline">
              <label translate>AVAILABILITY.from_hour</label>
              <input
                type="time"
                formControlName="startTime"
                [class.is-invalid]="
                  (ngForm.submitted || form.get('startTime')?.touched) &&
                  form.get('startTime')?.errors
                "
              />
              <label class="lowercase" translate>AVAILABILITY.to_hour</label>
              <input
                type="time"
                formControlName="endTime"
                [class.is-invalid]="
                  (ngForm.submitted || form.get('startTime')?.touched) &&
                  form.get('startTime')?.errors
                "
              />
            </div>
            }
            <div class="input-group inline button-group">
              @if (showDeleteButton()) {
              <button
                type="button"
                class="link-button"
                (click)="proposalsFormArray().removeAt(proposalIndex)"
                translate
              >
                <i class="fa-regular fa-times"></i>
                COMMON.delete
              </button>
              } @if (isLast) {
              <button
                type="button"
                class="link-button"
                (click)="proposalsFormArray().push(getProposalFormGroup())"
                translate
              >
                <i class="fa-regular fa-plus"></i>
                COMMON.add
              </button>
              }
            </div>
          </ng-container>

          }
          <!-- } -->
        </div>
        <div class="input-group inline button-group">
          <button
            type="button"
            (click)="dialogRef.close()"
            class="button button-outline"
            translate
          >
            COMMON.cancel
          </button>
          <button type="submit" class="button" translate>
            CALENDAR.PROPOSAL.propose
          </button>
        </div>
      </ng-container>
    </form>
    }
  `,
  styles: [
    `
      :host {
        display: block;
        width: min(80vw, 1500px);
        padding: var(--space-middle);
      }

      form {
        div[role='group'] {
          flex-direction: column;
          gap: var(--space-short);
          align-items: center;
        }
      }

      .grouped-form {
        margin-top: var(--space-middle);
      }

      .caption1 {
        color: var(--label-secondary);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarProposalComponent {
  public readonly credentials = inject(CredentialsService)
    .credentials as WritableSignal<CredentialsWithShop>;

  readonly dialogRef = inject(DialogRef);

  readonly #calendarService = inject(CalendarService);

  readonly #selectionService = inject(CalendarSelectionService);

  readonly #projectService = inject(ProjectService);

  public readonly today = DateTime.now();

  getProposalFormGroup = () =>
    new FormGroup({
      date: new FormControl<string>('', {
        validators: [
          Validators.required,
          minDateValidator(this.today.toJSDate()),
        ],
        nonNullable: true,
      }),
      startTime: new FormControl<string>('', {
        validators: [Validators.required],
        nonNullable: true,
      }),
      endTime: new FormControl<string>('', {
        validators: [Validators.required],
        nonNullable: true,
      }),
    });

  readonly form = new FormGroup({
    availability: new FormControl<string[]>([]),
    proposals: new FormArray([this.getProposalFormGroup()]),
  });

  proposalsFormArray() {
    return this.form.get('proposals') as FormArray;
  }

  readonly showDeleteButton = toSignal(
    this.proposalsFormArray().valueChanges.pipe(
      map((proposals) => proposals.length > 1),
    ),
  );

  selected = computed(() => {
    const selection = this.#selectionService.selectionObject();
    if (Object.keys(selection).length) {
      return this.#calendarService.loadedEventsByIdSignal()[
        Object.keys(selection)[0]
      ];
    }

    return undefined;
  });

  readonly #updateFormOnEventSelection = this.form
    .get('availability')
    ?.valueChanges.pipe(
      takeUntilDestroyed(),
      tap(() => {
        const selected = this.selected();
        if (selected) {
          const start = DateTime.fromISO(selected.start_time);
          const end = DateTime.fromISO(selected.end_time);

          const formProposals = this.form.get('proposals') as FormArray;

          formProposals.at(-1).patchValue({
            date: start.toISODate() as string,
            startTime: start.toFormat('H:mm'),
            endTime: end.toFormat('H:mm'),
          });
        }
      }),
    )
    .subscribe();

  submit() {
    if (this.form.invalid) {
      return;
    }

    const formProposals = this.form.get('proposals') as FormArray;

    const proposals = formProposals
      .getRawValue()
      .map(({ date, startTime, endTime }) => {
        return {
          start_time: DateTime.fromFormat(
            `${date} ${startTime}`,
            'yyyy-MM-dd H:mm',
          ).toISO() as string,
          end_time: DateTime.fromFormat(
            `${date} ${endTime}`,
            'yyyy-MM-dd H:mm',
          ).toISO() as string,
        };
      });

    this.#calendarService.addProposals(
      this.#projectService.project()!.id,
      proposals,
    );
  }
}
