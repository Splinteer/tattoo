import {
  Injectable,
  RendererFactory2,
  computed,
  inject,
  signal,
} from '@angular/core';

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

  public readonly screenHeight = signal(window.innerHeight);

  public readonly screenWidth = signal(window.innerWidth);

  private readonly onResizeListener$ = this.rendered2.listen(
    'window',
    'resize',
    () => {
      this.screenHeight.set(window.innerHeight);
      this.screenWidth.set(window.innerWidth);
    },
  );

  readonly isMobile = computed<boolean>(
    () => this.screenWidth() < this.breakpoints.tabletSmall,
  );

  readonly isTabletOrLess = computed<boolean>(
    () => this.screenWidth() < this.breakpoints.tabletSmall,
  );

  readonly isLaptopOrLess = computed<boolean>(
    () => this.screenWidth() < this.breakpoints.laptopSmall,
  );
}
