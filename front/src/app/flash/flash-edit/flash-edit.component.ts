import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { FlashService } from '../flash.service';
import { ActivatedRoute, Params } from '@angular/router';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-flash-edit',
  templateUrl: './flash-edit.component.html',
  styleUrls: ['./flash-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlashEditComponent {
  private readonly flashService = inject(FlashService);

  private readonly route = inject(ActivatedRoute);

  public readonly flash$ = this.route.params.pipe(
    switchMap((params: Params) => this.flashService.get(params['id']))
  );
}
