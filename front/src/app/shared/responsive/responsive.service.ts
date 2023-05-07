import {
  HostListener,
  Injectable,
  RendererFactory2,
  inject,
} from '@angular/core';
import {
  BehaviorSubject,
  distinctUntilChanged,
  map,
  of,
  switchMap,
} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ResponsiveService {
  private readonly breakpoints = {
    mobileSmall: 320,
    mobileMedium: 375,
    mobileLarge: 414,
    tabletSmall: 768,
    tabletLarge: 1024,
    laptopSmall: 1280,
    laptopLarge: 1440,
    desktopMedium: 1920,
  };

  private readonly rendererFactory = inject(RendererFactory2);

  private readonly rendered2 = this.rendererFactory.createRenderer(null, null);

  private readonly screenWidth$ = new BehaviorSubject<number>(
    window.innerWidth
  );

  private readonly onResizeListener$ = this.rendered2.listen(
    'window',
    'resize',
    () => {
      this.screenWidth$.next(window.innerWidth);
    }
  );

  public readonly isMobile$ = this.screenWidth$.asObservable().pipe(
    switchMap((width) => of(width < this.breakpoints.tabletSmall)),
    distinctUntilChanged()
  );

  public readonly isTabletOrLess$ = this.screenWidth$.asObservable().pipe(
    switchMap((width) => of(width < this.breakpoints.tabletSmall)),
    distinctUntilChanged()
  );

  public readonly isLargeDesktop$ = this.screenWidth$.asObservable().pipe(
    switchMap((width) => of(width >= this.breakpoints.desktopMedium)),
    distinctUntilChanged()
  );
}
