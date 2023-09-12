import { Injectable } from '@angular/core';
import { Observable, forkJoin, fromEvent, of } from 'rxjs';
import { map, share, shareReplay, switchMap } from 'rxjs/operators';
import { FormControl } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class ImagePreviewService {
  getImagesPreviews(observable: Observable<File[]>) {
    return observable.pipe(
      switchMap((files) => {
        console.log('getPPPPPPP');
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
      }),
      share()
    );
  }
}
