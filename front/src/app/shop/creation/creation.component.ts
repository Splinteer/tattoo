import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, Subject, map, of, filter, switchMap, tap } from 'rxjs';
import { ShopService } from '../shop.service';
import { Router } from '@angular/router';
import { CredentialsService } from '@app/auth/credentials.service';

@Component({
  selector: 'app-creation',
  templateUrl: './creation.component.html',
  styleUrls: ['./creation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreationComponent {
  private readonly credentialsService = inject(CredentialsService);

  constructor() {
    this.credentialsService.refreshCredentials();
  }

  private readonly shopService = inject(ShopService);

  private readonly router = inject(Router);

  public readonly form = new FormGroup({
    name: new FormControl<string>('', {
      validators: [Validators.required],
      nonNullable: true,
    }),
    url: new FormControl<string>('', {
      validators: [Validators.required],
      nonNullable: true,
    }),
    logo: new FormControl<File[]>([], { nonNullable: true }),
    instagram: new FormControl<string | null>(null),
    twitter: new FormControl<string | null>(null),
    facebook: new FormControl<string | null>(null),
    website: new FormControl<string | null>(null),
  });

  public readonly logoPreview$ = this.form.get('logo')?.valueChanges.pipe(
    switchMap((files) => {
      if (files.length === 0) {
        return of(null);
      }

      const fileReader = new FileReader();
      const fileReader$ = new Observable<string>((subscriber) => {
        fileReader.onload = () => {
          subscriber.next(fileReader.result as string);
          subscriber.complete();
        };
        fileReader.onerror = (error) => {
          subscriber.error(error);
        };
      });

      fileReader.readAsDataURL((<File[]>files)[0]);

      return fileReader$;
    })
  );

  public onSubmit() {
    if (this.form.invalid) {
      return;
    }

    this.form.disable();

    const formData: FormData = new FormData();

    Object.entries(this.form.getRawValue()).forEach(([key, value]) => {
      if (value) {
        formData.append(key, Array.isArray(value) ? value[0] : value);
      }
    });

    this.shopService
      .create(formData)
      .subscribe(() => this.router.navigate(['/']));
  }
}
