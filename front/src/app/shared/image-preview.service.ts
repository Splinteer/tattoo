import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { share, switchMap } from 'rxjs/operators';
import { Dialog } from '@angular/cdk/dialog';
import { ImagePreviewDialogComponent } from './image-preview-dialog/image-preview-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class ImagePreviewService {
  private readonly dialog = inject(Dialog);

  getImagesPreviews(observable: Observable<File[]>): Observable<string[]> {
    return observable.pipe(
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
      }),
      share(),
    );
  }

  public openModal(src: string) {
    this.dialog.open(ImagePreviewDialogComponent, {
      maxWidth: '1000px',
      maxHeight: '90%',
      data: src,
    });
  }
}
