import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  inject,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, of, switchMap, startWith, first } from 'rxjs';
import { Shop, ShopService } from '../shop.service';
import { Router } from '@angular/router';
import { backInDown } from '@shared/animation';
import { CredentialsService } from '@app/auth/credentials.service';
import { environment } from '@env/environment';

@Component({
  selector: 'app-creation',
  templateUrl: './creation.component.html',
  styleUrls: ['./creation.component.scss'],
  animations: [backInDown()],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreationComponent implements OnInit {
  @Input() shop?: Shop;

  private readonly shopService = inject(ShopService);

  private readonly router = inject(Router);

  private readonly credentialsService = inject(CredentialsService);

  public readonly credentials$ = this.credentialsService.credentials$;

  public form?: FormGroup;

  public logoPreview$?: Observable<string | null>;

  ngOnInit() {
    this.form = new FormGroup({
      name: new FormControl<string>(this.shop?.name || '', {
        validators: [Validators.required],
        nonNullable: true,
      }),
      url: new FormControl<string>(this.shop?.url || '', {
        validators: [
          Validators.required,
          Validators.pattern('^[a-zA-Z0-9_-]*$'),
        ],
        nonNullable: true,
      }),
      description: new FormControl<string>(this.shop?.description || ''),
      booking_condition: new FormControl<string>(
        this.shop?.booking_condition || ''
      ),
      logo: new FormControl<File[]>([], { nonNullable: true }),
      instagram: new FormControl<string | null>(this.shop?.instagram || null),
      twitter: new FormControl<string | null>(this.shop?.twitter || null),
      facebook: new FormControl<string | null>(this.shop?.facebook || null),
      website: new FormControl<string | null>(this.shop?.website || null),
    });

    this.credentials$.pipe(first()).subscribe((credentials) => {
      this.logoPreview$ = this.form!.get('logo')?.valueChanges.pipe(
        startWith(
          credentials && this.shop?.got_profile_picture
            ? environment.public_bucket +
                'shops/' +
                credentials.shop_id +
                '/logo?v=' +
                credentials.shop_image_version
            : ''
        ),
        switchMap((files) => {
          if (files.length === 0) {
            return of(null);
          } else if (typeof files === 'string') {
            return of(files);
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
    });
  }

  public onSubmit() {
    if (this.form?.invalid) {
      return;
    }

    this.form?.disable();

    const formData: FormData = new FormData();

    Object.entries(this.form?.getRawValue()).forEach(([key, value]) => {
      if (value) {
        formData.append(key, Array.isArray(value) ? value[0] : value);
      }
    });

    const service = this.shop ? 'update' : 'create';

    this.shopService[service](formData).subscribe(() =>
      this.router.navigate(['/shop'])
    );
  }
}
