import {
  Component,
  ElementRef,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
  inject,
} from '@angular/core';
import { Flash, FlashService } from '../flash.service';
import {
  BehaviorSubject,
  Observable,
  Subject,
  combineLatest,
  debounceTime,
  scan,
  shareReplay,
  switchMap,
  takeWhile,
  tap,
} from 'rxjs';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { ResponsiveComponent } from '@app/shared/responsive/responsive.component';

@Component({
  selector: 'app-flash-list',
  templateUrl: './flash-list.component.html',
  styleUrls: ['./flash-list.component.scss'],
})
export class FlashListComponent
  extends ResponsiveComponent
  implements OnChanges
{
  @Input() shop?: string;

  private readonly flashService = inject(FlashService);

  private fetchMore = new BehaviorSubject<boolean>(true);

  private allDataLoaded = false;

  private lastDate?: Date;

  public flashs$?: Observable<Flash[]>;

  ngOnChanges(): void {
    this.flashs$ = combineLatest({
      isMobile: this.isMobile$,
      fetchMore: this.fetchMore,
      windowHeight: this.screenHeight$.pipe(
        takeWhile(() => !this.allDataLoaded),
        debounceTime(1000)
      ),
    }).pipe(
      switchMap(({ isMobile }) =>
        (this.shop
          ? this.flashService.getByShop(
              this.shop,
              this.lastDate,
              isMobile ? 9 : 8
            )
          : this.flashService.getMine(this.lastDate, isMobile ? 9 : 8)
        ).pipe(
          tap((flashs) => {
            console.log('fetched');
            this.lastDate = flashs.at(-1)?.creation_date;

            setTimeout(() => {
              if (!this.allDataLoaded) {
                if (!this.checkIfGridIsScrollable()) {
                  this.fetchMore.next(true);
                }
              }
            });
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
      shareReplay(1)
    );
  }

  checkIfGridIsScrollable(): boolean {
    return document.documentElement.scrollHeight > window.innerHeight;
  }

  onScroll() {
    if (!this.allDataLoaded) {
      this.fetchMore.next(true);
    }
  }

  trackByIdx(index: number, item: Flash): string {
    return item.id;
  }
}
