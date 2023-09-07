import {
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import {
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  filter,
  fromEvent,
  map,
  skipWhile,
  startWith,
  takeWhile,
  tap,
} from 'rxjs';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { DateTime } from 'luxon';

@Component({
  selector: 'app-infinite-scroll',
  standalone: true,
  imports: [CommonModule, InfiniteScrollModule],
  templateUrl: './infinite-scroll.component.html',
  styleUrls: ['./infinite-scroll.component.scss'],
})
export class InfiniteScrollComponent implements OnDestroy, OnChanges {
  @Input() direction: 'horizontal' | 'vertical' = 'vertical';

  @Input() fullyLoaded = false;

  @Input({ alias: 'threshold' }) thresholdPercentage = 1;

  @Output() loadMore = new EventEmitter<void>();

  @HostBinding('style.flex-direction') get flexDirection() {
    return this.direction === 'horizontal' ? 'row' : 'column';
  }

  readonly host = inject(ElementRef).nativeElement;

  #boxSize: number = 0;

  #listSize: number = 0;

  #previousScrollPosition: number = 0;

  loading = false;

  readonly #onScrollObservable = fromEvent(this.host, 'scroll').pipe(
    takeUntilDestroyed(),
    takeWhile(() => !this.fullyLoaded),
    filter(() => !this.loading),
    debounceTime(15),
    tap(() => {
      this.#checkIfShouldLoadMore();
    })
  );

  readonly #onResizeObservable = combineLatest([
    fromEvent(this.host, 'resize'),
    fromEvent(window, 'resize'),
  ]).pipe(
    takeUntilDestroyed(),
    takeWhile(() => !this.fullyLoaded),
    filter(() => !this.loading),
    tap(() => {
      this.#setBoxSize();
      this.#checkIfShouldLoadMore();
    })
  );

  readonly #childContentObserver = new MutationObserver(() => {
    this.#setBoxSize();
    this.loading = false;
  });

  ngAfterViewInit() {
    this.#setBoxSize();
    this.#checkIfShouldLoadMore();
    this.#observeChildContent();
    this.#onScrollObservable.subscribe();
    this.#onResizeObservable.subscribe();
  }

  ngOnChanges({ fullyLoaded }: SimpleChanges): void {
    if (fullyLoaded && this.fullyLoaded) {
      this.#childContentObserver.disconnect();
    }
  }

  ngOnDestroy(): void {
    this.#childContentObserver.disconnect();
  }

  #setBoxSize() {
    const host = this.host as HTMLElement;
    this.#boxSize =
      this.direction === 'vertical' ? host.clientHeight : host.clientWidth;

    this.#listSize =
      this.direction === 'vertical' ? host.scrollHeight : host.scrollWidth;
  }

  #observeChildContent() {
    this.#childContentObserver.observe(this.host, {
      childList: true,
      subtree: true,
    });
  }

  #checkIfShouldLoadMore() {
    const host = this.host as HTMLElement;

    const distanceFromOrigin =
      this.direction === 'vertical' ? host.scrollTop : host.scrollLeft;
    const scrollPosition = this.#boxSize + distanceFromOrigin;
    const thresold = (1 - this.thresholdPercentage / 100) * this.#listSize;

    let scrollDirection: 'left' | 'right' | 'up' | 'down' =
      this.direction === 'vertical' ? 'down' : 'right';

    if (distanceFromOrigin < this.#previousScrollPosition) {
      scrollDirection = this.direction === 'vertical' ? 'up' : 'left';
    }
    this.#previousScrollPosition = distanceFromOrigin;

    const needMore =
      ['down', 'right'].includes(scrollDirection) && thresold < scrollPosition;

    if (needMore) {
      this.loading = true;
      this.loadMore.next();
    }
  }
}
