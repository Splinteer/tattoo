import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  inject,
} from '@angular/core';
import { Flash, FlashService } from '../flash.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, forkJoin, of, startWith, switchMap } from 'rxjs';
import { Router } from '@angular/router';
import { backInDown } from '@app/shared/animation';
import {
  greaterThanValidator,
  smallerThanValidator,
} from '@app/shared/custom-validators';

@Component({
  selector: 'app-shop-flash-add',
  templateUrl: './shop-flash-add.component.html',
  styleUrls: ['./shop-flash-add.component.scss'],
  animations: [backInDown()],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShopFlashAddComponent implements OnInit {
  @Input() flash?: Flash;

  private readonly flashService = inject(FlashService);

  private readonly router = inject(Router);

  public form?: FormGroup;

  public imagesPreview$?: Observable<string[]>;

  ngOnInit(): void {
    this.form = new FormGroup(
      {
        name: new FormControl<string | null>(this.flash?.name ?? null, [
          Validators.required,
        ]),
        description: new FormControl<string | null>(
          this.flash?.description ?? null
        ),
        image: new FormControl<File[]>([], [Validators.required]),
        available: new FormControl<boolean>(this.flash?.available ?? true),
        price_range_start: new FormControl<number | null>(
          this.flash?.price_range_start ?? null
        ),
        price_range_end: new FormControl<number | null>(
          this.flash?.price_range_end ?? null
        ),
      },
      {
        validators: [
          greaterThanValidator('price_range_end', 'price_range_start', true),
        ],
      }
    );

    this.imagesPreview$ = this.form.get('image')?.valueChanges.pipe(
      startWith(this.flash ? [this.flash.image_url] : []),
      switchMap((files) => {
        if (files.length === 0) {
          return of([]);
        } else if (typeof files === 'string') {
          return of([files]);
        }

        // Map each file to a FileReader observable and wait for all to complete.
        const fileReaderObservables = (<File[]>files).map((file) => {
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

          fileReader.readAsDataURL(file);

          return fileReader$;
        });

        return forkJoin(fileReaderObservables);
      })
    );
  }

  public onSubmit() {
    if (this.form?.invalid) {
      return;
    }

    this.form?.disable();
    const service = this.flash ? 'update' : 'create';

    const observables = this.form?.value.image.map(
      (image: File, index: number) => {
        const formData: FormData = new FormData();
        formData.append('image', image);

        Object.entries(this.form?.getRawValue()).forEach(([key, value]) => {
          if (value !== null && key !== 'image') {
            formData.append(key, Array.isArray(value) ? value[0] : value);
          }
        });

        if (this.form?.value.image.length > 1 && index > 0) {
          formData.set('name', `${formData.get('name')} ${index + 1}`);
        }

        return this.flashService[service](formData);
      }
    );

    return forkJoin(observables).subscribe(() =>
      this.router.navigate(['/shop/gallery/flashs'])
    );
  }

  public removeImage(index: number) {
    const images: File[] = this.form?.get('image')?.value;
    images.splice(index, 1);

    this.form?.get('image')?.setValue(images);
  }
}
