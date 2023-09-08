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
  booleanAttribute,
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

  @Input({ transform: booleanAttribute }) reverse = false;

  @Input({ alias: 'threshold' }) thresholdPercentage = 1;

  @Output() loadMore = new EventEmitter<void>();

  @HostBinding('style.flex-direction') get flexDirection() {
    let direction = this.direction === 'horizontal' ? 'row' : 'column';
    if (this.reverse) {
      direction += '-reverse';
    }
    return direction;
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
      console.log('onScrollObservable');
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
      console.log('resize');
      this.#checkIfShouldLoadMore();
    })
  );

  readonly #childContentObserver = new MutationObserver(() => {
    const needCheck = this.#listSize === 0;
    this.#setBoxSize();
    this.loading = false;

    if (needCheck) {
      console.log('childContentObserver');
      this.#checkIfShouldLoadMore();
    }
  });

  ngAfterViewInit() {
    this.#setBoxSize();
    if (this.#listSize > 0) {
      console.log('ngAfterViewInit');
      this.#checkIfShouldLoadMore();
    }
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

    const scrollDirection = this.#getScrollDirection(distanceFromOrigin);

    const isGoodScrollDirection =
      this.#checkIfGoodScrollDirection(scrollDirection);

    if (!isGoodScrollDirection) {
      return;
    }

    const isNearEnd = this.#checkIfNearEnd(distanceFromOrigin);
    if (isNearEnd && !this.loading) {
      this.loading = true;
      console.log('loading');
      this.loadMore.next();
    }
  }

  #getScrollDirection(distanceFromOrigin: number) {
    let scrollDirection: 'left' | 'right' | 'up' | 'down' =
      this.direction === 'vertical' ? 'down' : 'right';

    if (distanceFromOrigin < this.#previousScrollPosition) {
      scrollDirection = this.direction === 'vertical' ? 'up' : 'left';
    }
    this.#previousScrollPosition = distanceFromOrigin;

    // if (this.reverse) {
    //   const opposites = {
    //     up: 'down',
    //     down: 'up',
    //     left: 'right',
    //     right: 'left',
    //   };

    //   return opposites[scrollDirection];
    // }

    return scrollDirection;
  }

  #checkIfNearEnd(distanceFromOrigin: number) {
    const threshold = this.#boxSize * (this.thresholdPercentage / 100);

    if (this.reverse) {
      return this.direction === 'vertical'
        ? distanceFromOrigin <= threshold
        : distanceFromOrigin <= threshold;
    }

    return this.direction === 'vertical'
      ? distanceFromOrigin + this.#boxSize >= this.#listSize - threshold
      : distanceFromOrigin + this.#boxSize >= this.#listSize - threshold;
  }

  #checkIfGoodScrollDirection(scrollDirection: string) {
    if (this.reverse) {
      return ['up', 'left'].includes(scrollDirection);
    }

    return ['down', 'right'].includes(scrollDirection);
  }
}
