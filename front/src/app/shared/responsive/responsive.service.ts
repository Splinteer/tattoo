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
    switchMap((width) => of(width < 768)),
    distinctUntilChanged()
  );
}
