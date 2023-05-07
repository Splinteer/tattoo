import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  forwardRef,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { BehaviorSubject, tap } from 'rxjs';

@Component({
  selector: 'app-file-dropzone',
  templateUrl: './file-dropzone.component.html',
  styleUrls: ['./file-dropzone.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FileDropzoneComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileDropzoneComponent implements ControlValueAccessor {
  @Input() multiple = false;

  @Input() disabled = false;

  @Input() accept?: string;

  @Output() filesDropped: EventEmitter<FileList> = new EventEmitter();

  public readonly files$: BehaviorSubject<File[]> = new BehaviorSubject<File[]>(
    []
  );

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();

    if (event.dataTransfer?.types.includes('Files')) {
      (<HTMLElement>event.target).classList.add('drag-over');
    }
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    (<HTMLElement>event.target).classList.remove('drag-over');
  }

  // Update the onDrop function
  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    (<HTMLElement>event.target).classList.remove('drag-over');

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.updateFiles(event.dataTransfer.files);
    }
  }

  onFileInputChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;

    if (inputElement.files && inputElement.files.length > 0) {
      this.updateFiles(inputElement.files);
    }

    inputElement.value = ''; // to allow re-adding the same file
  }

  private updateFiles(newFiles: FileList) {
    const validFiles: File[] = [];

    for (let i = 0; i < newFiles.length; i++) {
      const file = newFiles[i];
      if (this.isValidFileType(file)) {
        validFiles.push(file);
      }
    }

    if (!validFiles.length) {
      return;
    }

    const limit = this.multiple ? validFiles.length : 1;
    const actualFiles = this.multiple ? this.files$.getValue() : [];

    for (let i = 0; i < limit; i++) {
      this.files$.next([...actualFiles, validFiles[i]]);
    }

    this.onChange(this.files$.getValue());
    this.markAsTouched();
  }

  private isValidFileType(file: File): boolean {
    if (!this.accept) {
      return true;
    }

    const acceptedTypes = this.accept.split(',').map((type) => type.trim());
    const fileType = file.type;
    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    return acceptedTypes.some((type) => {
      if (type.startsWith('.')) {
        return fileExtension === type.substring(1);
      }

      if (type.endsWith('/*')) {
        return fileType.startsWith(type.substring(0, type.length - 1));
      }

      return fileType === type || fileType.startsWith(`${type}/`);
    });
  }

  // ControlValueAccessor

  onChange: (files: File[] | null) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(files: File[] | null): void {
    this.files$.next(files || []);
  }

  registerOnChange(fn: (files: File[] | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  private touched = false;

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  markAsTouched() {
    if (!this.touched) {
      this.onTouched();
      this.touched = true;
    }
  }
}
