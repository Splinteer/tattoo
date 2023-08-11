import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlashSelectionComponent } from './flash-selection.component';

describe('FlashSelectionComponent', () => {
  let component: FlashSelectionComponent;
  let fixture: ComponentFixture<FlashSelectionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FlashSelectionComponent]
    });
    fixture = TestBed.createComponent(FlashSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
