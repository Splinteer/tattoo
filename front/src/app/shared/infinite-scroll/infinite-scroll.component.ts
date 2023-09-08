import {
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
  booleanAttribute,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { combineLatest, filter, fromEvent, takeWhile, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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

  @ViewChild('containerRef', { static: true }) containerRef!: ElementRef;

  #boxSize: number = 0;

  #listSize: number = 0;

  #previousScrollPosition: number = 0;

  loading = false;

  scroll: ((event: Event) => void) | null = (event: any) => {
    if (this.loading) {
      return;
    }

    this.#setBoxSize();
    this.#checkIfShouldLoadMore();
  };

  resize: (() => void) | null = () => {
    this.#setBoxSize();
    this.#checkIfShouldLoadMore();
  };

  readonly #onResizeObservable = combineLatest([fromEvent(window, 'resize')])
    .pipe(
      takeUntilDestroyed(),
      takeWhile(() => !this.fullyLoaded),
      filter(() => !this.loading),
      tap(() => this.resize && this.resize())
    )
    .subscribe();

  readonly #childContentObserver = new MutationObserver(() => {
    this.#setBoxSize();
    this.loading = false;

    this.#checkIfShouldLoadMore();
  });

  ngAfterViewInit() {
    this.#setBoxSize();
    if (this.#listSize > 0) {
      this.#checkIfShouldLoadMore();
    }
    this.#observeChildContent();
  }

  ngOnChanges({ fullyLoaded }: SimpleChanges): void {
    if (fullyLoaded && this.fullyLoaded) {
      this.scroll = null;
      this.resize = null;
    }
  }

  ngOnDestroy(): void {
    this.#childContentObserver.disconnect();
  }

  #setBoxSize() {
    const host = this.containerRef.nativeElement as HTMLElement;
    this.#boxSize =
      this.direction === 'vertical' ? host.clientHeight : host.clientWidth;

    this.#listSize =
      this.direction === 'vertical' ? host.scrollHeight : host.scrollWidth;
  }

  #observeChildContent() {
    this.#childContentObserver.observe(this.containerRef.nativeElement, {
      childList: true,
      subtree: true,
    });
  }

  #checkIfShouldLoadMore() {
    const host = this.containerRef.nativeElement as HTMLElement;

    if (this.#boxSize === this.#listSize) {
      return this.#sendLoadMoreEvent();
    }

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
      this.#sendLoadMoreEvent();
    }
  }

  #sendLoadMoreEvent() {
    this.loading = true;
    console.log('loading');
    this.loadMore.next();
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
