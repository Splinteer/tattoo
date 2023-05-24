import { Component, ViewChild, inject } from '@angular/core';
import { Gallery, GalleryService } from '../gallery.service';
import {
  Subject,
  combineLatest,
  scan,
  shareReplay,
  switchMap,
  takeWhile,
  tap,
} from 'rxjs';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { ResponsiveComponent } from '@app/shared/responsive/responsive.component';

@Component({
  selector: 'app-gallery-list',
  templateUrl: './gallery-list.component.html',
  styleUrls: ['./gallery-list.component.scss'],
})
export class GalleryListComponent extends ResponsiveComponent {
  @ViewChild(CdkVirtualScrollViewport) viewPort!: CdkVirtualScrollViewport;

  private readonly galleryService = inject(GalleryService);

  private fetchMore = new Subject<void>();

  private allDataLoaded = false;

  private lastDate?: Date;

  public readonly gallerys$ = combineLatest({
    isMobile: this.isMobile$,
    fetchMore: this.fetchMore,
  }).pipe(
    switchMap(({ isMobile }) =>
      this.galleryService.getMine(this.lastDate, isMobile ? 9 : 8).pipe(
        tap((gallerys) => {
          this.lastDate = gallerys.at(-1)?.creation_date;

          setTimeout(() => {
            const end = this.viewPort.getRenderedRange().end;
            const total = this.viewPort.getDataLength();

            console.log(end, total);

            if (end === total && !this.allDataLoaded) {
              this.fetchMore.next();
            }
          });
        })
      )
    ),
    scan((acc, newPage) => {
      if (newPage.length === 0) {
        this.allDataLoaded = true;
      }

      return [...acc, ...newPage];
    }),
    takeWhile(() => !this.allDataLoaded),
    shareReplay(1)
  );

  onScroll(index: number) {
    if (!this.allDataLoaded && index >= this.viewPort.getDataLength() - 8) {
      this.fetchMore.next();
    }
  }

  trackByIdx(index: number, item: Gallery): string {
    return item.id;
  }
}
