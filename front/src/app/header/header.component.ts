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

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  private readonly credentialsService = inject(CredentialsService);

  public readonly credentials$ = this.credentialsService.credentials$;

  public readonly logOut = () => this.credentialsService.logOut(true);

  // Responsive menu toggle

  @ViewChild('mobileMenu') mobileMenu?: ElementRef;

  public isMobileMenuOpen = false;

  private readonly renderer = inject(Renderer2);

  private readonly toggleMenuOnClick = this.renderer.listen(
    'document',
    'click',
    (event: MouseEvent) => {
      if (!this.mobileMenu || window.innerWidth > 768) {
        return;
      }

      const clickedInsideMenu = this.mobileMenu.nativeElement.contains(
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
