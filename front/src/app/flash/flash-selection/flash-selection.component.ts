import { Component, Input, OnChanges, forwardRef, inject } from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  switchMap,
  tap,
  scan,
  takeWhile,
  shareReplay,
} from 'rxjs';
import { FlashService, Flash } from '../flash.service';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

type ControlValue = (Flash & { selected?: boolean })[] | undefined;

@Component({
  selector: 'app-flash-selection',
  templateUrl: './flash-selection.component.html',
  styleUrls: ['./flash-selection.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FlashSelectionComponent),
      multi: true,
    },
  ],
})
export class FlashSelectionComponent
  implements ControlValueAccessor, OnChanges
{
  @Input({ required: true, alias: 'shop' }) shopUrl!: string;

  @Input() invalid?: boolean = false;

  public value?: ControlValue;

  public toggle(toggledItem: Flash & { selected?: boolean }): void {
    toggledItem.selected = !!!toggledItem.selected;
    if (this.loadedFlashs) {
      const value = this.loadedFlashs.filter((item) => item.selected);

      this.markAsTouched();
      this.writeValue(value);
      this.onChange(this.value);
    }
  }

  private readonly flashService = inject(FlashService);

  private fetchMore = new BehaviorSubject<boolean>(true);

  private allDataLoaded = false;

  private lastDate?: Date;

  public flashs$?: Observable<ControlValue>;

  private loadedFlashs: ControlValue;

  ngOnChanges(changes: any): void {
    if (changes.shopUrl) {
      this.flashs$ = this.fetchMore.pipe(
        switchMap(() =>
          this.flashService
            .getByShop(this.shopUrl, this.lastDate, true, 16)
            .pipe(
              tap((flashs) => {
                this.lastDate = flashs.at(-1)?.creation_date;
              })
            )
        ),
        scan((acc, newPage) => {
          if (newPage.length === 0) {
            this.allDataLoaded = true;
            return acc;
          }

          return [...acc, ...newPage];
        }),
        takeWhile(() => !this.allDataLoaded),
        shareReplay(1),
        tap((flashs) => {
          this.loadedFlashs = flashs;
        })
      );
    }
  }

  onScroll() {
    if (!this.allDataLoaded) {
      this.fetchMore.next(true);
    }
  }

  trackByIdx(index: number, item: Flash): string {
    return item.id;
  }

  // ControlValueAccessor

  @Input() disabled = false;

  public onChange: (value: ControlValue) => void = () => {};

  public onTouched: Function = () => {};

  private touched = false;

  public writeValue(value: ControlValue, ignoreRefresh?: true): void {
    this.value = value;
  }

  public registerOnChange(
    fn: typeof FlashSelectionComponent.prototype.onChange
  ): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: Function): void {
    this.onTouched = fn;
  }

  public setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  public markAsTouched() {
    if (!this.touched) {
      this.onTouched();
      this.touched = true;
    }
  }
}
