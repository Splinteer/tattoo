import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  inject,
} from '@angular/core';
import { Flash, FlashService } from '../flash.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
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
}
