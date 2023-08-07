import { FormGroup } from '@angular/forms';
import { Component, inject } from '@angular/core';
import { BookingService } from '../booking.service';
import { Observable, filter, forkJoin, of, switchMap } from 'rxjs';

@Component({
  selector: 'app-booking-location',
  templateUrl: './location.component.html',
  styleUrls: ['./location.component.scss'],
})
export class LocationComponent {
  private readonly bookingService = inject(BookingService);

  public readonly form$ = this.bookingService.form$;

  public readonly imagesPreview$ = this.form$.pipe(
    filter((form) => {
      console.log(form.get(['location', 'illustrations']));
      return !!form.get(['location', 'illustrations']);
    }),
    switchMap((form) =>
      form.get(['location', 'illustrations'])!.valueChanges.pipe(
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

  public removeImage(form: FormGroup, index: number) {
    const images: File[] = form?.get(['location', 'illustrations'])?.value;
    images.splice(index, 1);

    form?.get(['location', 'illustrations'])?.setValue(images);
  }
}
