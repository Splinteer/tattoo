import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-creation',
  templateUrl: './creation.component.html',
  styleUrls: ['./creation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreationComponent {
  public readonly form = new FormGroup({
    name: new FormControl('', [Validators.required]),
    url: new FormControl('', [Validators.required]),
    logo: new FormControl(null),
    socialInstagram: new FormControl(''),
    socialTwitter: new FormControl(''),
    socialFacebook: new FormControl(''),
    socialWebsite: new FormControl(''),
  });
}
