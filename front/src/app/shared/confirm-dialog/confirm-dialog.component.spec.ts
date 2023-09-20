import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionDialogComponent } from './confirm-dialog.component';

describe('ConfirmDialogComponent', () => {
  let component: ActionDialogComponent;
  let fixture: ComponentFixture<ActionDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ActionDialogComponent],
    });
    fixture = TestBed.createComponent(ActionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
