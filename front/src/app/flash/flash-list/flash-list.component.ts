import {
  Component,
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
  scan,
  share,
  shareReplay,
  switchMap,
  takeWhile,
  tap,
} from 'rxjs';
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

  ngOnChanges(changes: SimpleChanges): void {
    // if (this.shop) {
    //   this.flashs$ = this.isMobile$.pipe(
    //     switchMap((isMobile) =>
    //       this.flashService.getByShop(
    //         <string>this.shop,
    //         this.lastDate,
    //         isMobile ? 9 : 8
    //       )
    //     )
    //   );
    // }

    // this.flashs$ = combineLatest({
    //   isMobile: this.isMobile$,
    //   fetchMore: this.fetchMore,
    // }).pipe(
    //   shareReplay(1),
    //   switchMap(({ isMobile }) => {
    //     return this.flashService.getByShop(
    //       <string>this.shop,
    //       this.lastDate,
    //       isMobile ? 9 : 8
    //     );
    //   })
    // );
    console.log('init');
    this.flashs$ = combineLatest({
      isMobile: this.isMobile$,
      fetchMore: this.fetchMore,
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
            console.log('result', flashs);
            this.lastDate = flashs.at(-1)?.creation_date;

            setTimeout(() => {
              if (!this.allDataLoaded) {
                // this.fetchMore.next(true);
              }
            });
          })
        )
      ),
      scan((acc, newPage) => {
        if (newPage.length === 0) {
          console.log('oh non', acc, newPage);
          this.allDataLoaded = true;
        }

        return [...acc, ...newPage];
      }),
      takeWhile(() => !this.allDataLoaded),
      shareReplay(1)
    );
  }

  onScroll() {
    console.log('onScroll');
    this.fetchMore.next(true);
    // if (!this.allDataLoaded && index >= this.viewPort.getDataLength() - 8) {
    //   this.fetchMore.next();
    // }
  }

  trackByIdx(index: number, item: Flash): string {
    return item.id;
  }
}
