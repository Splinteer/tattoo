import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DefaultAvailabilityComponent } from '@app/calendar/default-availability/default-availability.component';
import { backInDown } from '@app/shared/animation';
import { TranslateModule } from '@ngx-translate/core';
import { AutomaticAvailabilitySettingsComponent } from '../automatic-availability-settings/automatic-availability-settings.component';

@Component({
  selector: 'app-availability',
  standalone: true,
  imports: [
    CommonModule,
    AutomaticAvailabilitySettingsComponent,
    DefaultAvailabilityComponent,
    TranslateModule,
  ],
  templateUrl: './availability.component.html',
  styleUrls: ['./availability.component.scss'],
  animations: [backInDown()],
})
export class AvailabilityComponent {}
