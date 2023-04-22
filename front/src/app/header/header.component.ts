import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  Renderer2,
  ViewChild,
  inject,
} from '@angular/core';
import { CredentialsService } from '@app/auth/credentials.service';
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from '@angular/animations';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  animations: [
    trigger('growFromTop', [
      state('void', style({ maxHeight: 0, borderWidth: 0, opacity: 0 })),
      state('*', style({ maxHeight: '500px', borderWidth: '*', opacity: 1 })),
      transition('void <=> *', [animate('0.4s ease-in-out')]),
      transition('* => void', [animate('0.3s ease-out')]),
    ]),
  ],
})
export class HeaderComponent {
  private readonly credentialsService = inject(CredentialsService);

  public readonly credentials$ = this.credentialsService.credentials$;

  public readonly logOut = () => this.credentialsService.logOut(true);

  // Responsive menu toggle

  @ViewChild('mobileHeader') mobileHeader?: ElementRef;

  public isMobileMenuOpen = true;

  private readonly renderer = inject(Renderer2);

  private readonly toggleMenuOnClick = this.renderer.listen(
    'document',
    'click',
    (event: MouseEvent) => {
      if (!this.mobileHeader || window.innerWidth > 768) {
        return;
      }

      const clickedInsideMenu = this.mobileHeader.nativeElement.contains(
        event.target
      );

      const clickedItemClasses = (event.target as HTMLElement).classList;
      const clickedHamburger =
        clickedItemClasses.length &&
        clickedItemClasses[0].startsWith('hamburger');

      if (clickedHamburger || (!clickedInsideMenu && this.isMobileMenuOpen)) {
        this.isMobileMenuOpen = !this.isMobileMenuOpen;
      }
    }
  );
}
