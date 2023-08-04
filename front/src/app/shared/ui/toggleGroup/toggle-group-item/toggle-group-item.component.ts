import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-toggle-group-item',
  template: ` <div (click)="select()" [class.selected]="selected">
    <ng-content></ng-content>
  </div>`,
})
export class ToggleGroupItemComponent {
  @Input() value: any;

  @Input() selected: boolean = false;

  @Output() selectedChange = new EventEmitter();

  select() {
    this.selected = true;
    this.selectedChange.emit(this.selected);
  }
}
