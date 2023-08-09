import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  inject,
} from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Gallery, GalleryService } from '../gallery.service';
import { backInDown } from '@app/shared/animation';
import { greaterThanValidator } from '@app/shared/custom-validators';
import { Observable, startWith, switchMap, of, forkJoin } from 'rxjs';
import { environment } from '@env/environment';

@Component({
  selector: 'app-gallery-add',
  templateUrl: './gallery-add.component.html',
  styleUrls: ['./gallery-add.component.scss'],
  animations: [backInDown()],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GalleryAddComponent implements OnInit {
  @Input() gallery?: Gallery;

  private readonly galleryService = inject(GalleryService);

  private readonly router = inject(Router);

  public form?: FormGroup;

  public imagesPreview$?: Observable<string[]>;

  ngOnInit(): void {
    const imageValidators = [];
    if (!this.gallery) {
      imageValidators.push(Validators.required);
    }

    this.form = new FormGroup({
      name: new FormControl<string | null>(this.gallery?.name ?? null, [
        Validators.required,
      ]),
      description: new FormControl<string | null>(
        this.gallery?.description ?? null
      ),
      image: new FormControl<File[]>([], imageValidators),
    });

    this.imagesPreview$ = this.form.get('image')?.valueChanges.pipe(
      startWith(
        this.gallery
          ? [
              environment.public_bucket +
                this.gallery.image_url +
                '?v=' +
                this.gallery.image_version,
            ]
          : []
      ),
      switchMap((files) => {
        if (files.length === 0) {
          return of([]);
        } else if (typeof files[0] === 'string') {
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
    const valueToMap = this.gallery ? [false] : this.form?.value.image;

    const observables = valueToMap.map((image: File, index: number) => {
      const formData: FormData = new FormData();
      if (image) {
        formData.append('image', image);
      }

      Object.entries(this.form?.getRawValue()).forEach(([key, value]) => {
        if (value !== null && key !== 'image') {
          formData.append(key, Array.isArray(value) ? value[0] : value);
        }
      });

      if (this.form?.value.image.length > 1 && index > 0) {
        formData.set('name', `${formData.get('name')} ${index + 1}`);
      }

      if (this.gallery) {
        return this.galleryService.update(this.gallery.id, formData);
      }

      return this.galleryService.create(formData);
    });

    return forkJoin(observables).subscribe(() => {
      return this.router.navigate(['/shop/gallery']);
    });
  }

  public removeImage(index: number) {
    const images: File[] = this.form?.get('image')?.value;
    images.splice(index, 1);

    this.form?.get('image')?.setValue(images);
  }
}
