import { Component, Input, OnChanges, ViewChild, inject } from '@angular/core';
import { Gallery, GalleryService } from '../gallery.service';
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
import { ResponsiveComponent } from '@app/shared/responsive/responsive.component';

@Component({
  selector: 'app-gallery-list',
  templateUrl: './gallery-list.component.html',
  styleUrls: ['./gallery-list.component.scss'],
})
export class GalleryListComponent
  extends ResponsiveComponent
  implements OnChanges
{
  @Input() shop?: string;

  private readonly galleryService = inject(GalleryService);

  private fetchMore = new BehaviorSubject<boolean>(true);

  private allDataLoaded = false;

  private lastDate?: Date;

  public gallery$?: Observable<Gallery[]>;

  ngOnChanges(): void {
    this.gallery$ = combineLatest({
      isMobile: this.isMobile$,
      fetchMore: this.fetchMore,
      windowHeight: this.screenHeight$.pipe(
        takeWhile(() => !this.allDataLoaded),
        debounceTime(1000)
      ),
    }).pipe(
      switchMap(({ isMobile }) =>
        (this.shop
          ? this.galleryService.getByShop(
              this.shop,
              this.lastDate,
              isMobile ? 9 : 8
            )
          : this.galleryService.getMine(this.lastDate, isMobile ? 9 : 8)
        ).pipe(
          tap((gallery) => {
            this.lastDate = gallery.at(-1)?.creation_date;

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

  trackByIdx(index: number, item: Gallery): string {
    return item.id;
  }
}
