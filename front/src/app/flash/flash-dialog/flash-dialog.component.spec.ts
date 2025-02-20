import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlashDialogComponent } from './flash-dialog.component';

describe('FlashDialogComponent', () => {
  let component: FlashDialogComponent;
  let fixture: ComponentFixture<FlashDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlashDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlashDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
