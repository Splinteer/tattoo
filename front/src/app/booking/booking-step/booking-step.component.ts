import { Component, Input, inject } from '@angular/core';
import { BookingService, BookingStep } from '../booking.service';
import { Observable, filter, forkJoin, of, switchMap } from 'rxjs';
import { FormGroup } from '@angular/forms';

@Component({
  template: '',
})
export abstract class BookingStepComponent {
  @Input({ required: true }) step!: BookingStep;

  protected readonly bookingService = inject(BookingService);

  public readonly form$ = this.bookingService.form$;

  public readonly shop$ = this.bookingService.shop$;

  protected getImagePreview(controlPath: string[]) {
    return this.form$.pipe(
      filter((form) => {
        return !!form.get(controlPath);
      }),
      switchMap((form) =>
        form.get(controlPath)!.valueChanges.pipe(
          switchMap((files) => {
            if (files.length === 0) {
              return of([]);
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
        )
      )
    );
  }

  public getRemoveImage(controlPath: string[]) {
    return (form: FormGroup, index: number) => {
      const images: File[] = form?.get(controlPath)?.value;
      images.splice(index, 1);

      form?.get(controlPath)?.setValue(images);
    };
  }
}
