import { Component, Input } from '@angular/core';

@Component({
  selector: 'wave-separator',
  templateUrl: './waveSeparator.component.html',
  styleUrls: ['./waveSeparator.component.scss'],
})
export class WaveSeparatorComponent {
  @Input('color') color = '#fff';
}
