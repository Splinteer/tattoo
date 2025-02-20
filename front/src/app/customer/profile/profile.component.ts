import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  inject,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, of, switchMap, startWith, first, map } from 'rxjs';
import { Customer, CustomerService } from '../customer.service';
import { Router } from '@angular/router';
import { backInDown } from '@shared/animation';
import { CredentialsService } from '@app/auth/credentials.service';
import { noSpaceNoSpecialCharactersValidator } from '@app/shared/custom-validators';
import { environment } from '@env/environment';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  animations: [backInDown()],
})
export class ProfileComponent implements OnInit {
  @Input() customer?: Customer;

  private readonly customerService = inject(CustomerService);

  private readonly router = inject(Router);

  private readonly credentialsService = inject(CredentialsService);

  private readonly cdr = inject(ChangeDetectorRef);

  public readonly credentials$ = this.credentialsService.credentials$;

  public form?: FormGroup;

  public picturePreview$?: Observable<string | null>;

  ngOnInit() {
    if (!this.customer) {
      return this.loadCurrentUser();
    }

    this.initComponent();
  }

  private loadCurrentUser() {
    this.customerService.getMine().subscribe((customer) => {
      if (customer) {
        this.customer = customer;
        this.ngOnInit();
      }
    });
  }

  private initComponent() {
    this.form = new FormGroup({
      firstname: new FormControl<string>(this.customer?.firstname || '', {
        validators: [Validators.required],
        nonNullable: true,
      }),
      lastname: new FormControl<string>(this.customer?.lastname || '', {
        validators: [Validators.required],
        nonNullable: true,
      }),
      birthday: new FormControl<string | null>(
        this.customer?.birthday?.toISOString().substring(0, 10) || null,
        {
          validators: [Validators.required],
          nonNullable: true,
        }
      ),
      pronouns: new FormControl<string>(this.customer?.pronouns || ''),
      phone: new FormControl<string>(this.customer?.phone || ''),
      personal_information: new FormControl<string>(
        this.customer?.personal_information || ''
      ),
      profile_picture: new FormControl<File[]>([], { nonNullable: true }),

      address: new FormControl<string>(this.customer?.address || ''),
      address2: new FormControl<string>(this.customer?.address2 || ''),
      city: new FormControl<string>(this.customer?.city || ''),
      zipcode: new FormControl<string>(this.customer?.zipcode || ''),

      instagram: new FormControl<string | null>(
        this.customer?.instagram || null,
        [noSpaceNoSpecialCharactersValidator]
      ),
      twitter: new FormControl<string | null>(this.customer?.twitter || null, [
        noSpaceNoSpecialCharactersValidator,
      ]),
    });

    this.cdr.detectChanges();

    this.picturePreview$ = this.form!.get('profile_picture')?.valueChanges.pipe(
      startWith(
        this.customer?.got_profile_picture
          ? environment.public_bucket +
              'profile_picture/' +
              this.customer.id +
              '?v=' +
              this.customer.profile_picture_version
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

    this.customerService
      .update(formData)
      .subscribe(() =>
        this.router.navigate(['/']).then(() => this.router.navigate(['/me']))
      );
  }
}
