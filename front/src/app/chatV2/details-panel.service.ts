import { Injectable, computed, inject, signal } from '@angular/core';
import { ResponsiveService } from '@app/shared/responsive/responsive.service';

@Injectable({
  providedIn: 'root',
})
export class DetailsPanelService {
  readonly #responsiveService = inject(ResponsiveService);

  readonly #showByDefault = computed(
    () => !this.#responsiveService.isLaptopOrLess(),
  );

  readonly visible = signal<boolean>(this.#showByDefault());

  toggle() {
    this.visible.update((visible) => !visible);
  }
}
