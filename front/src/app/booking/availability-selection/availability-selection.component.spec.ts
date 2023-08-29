import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AvailabilitySelectionComponent } from './availability-selection.component';

describe('AvailabilitySelectionComponent', () => {
  let component: AvailabilitySelectionComponent;
  let fixture: ComponentFixture<AvailabilitySelectionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AvailabilitySelectionComponent]
    });
    fixture = TestBed.createComponent(AvailabilitySelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
