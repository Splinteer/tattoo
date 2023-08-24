import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AvailabilityComponent } from './availability.component';

describe('AvailabilityComponent', () => {
  let component: AvailabilityComponent;
  let fixture: ComponentFixture<AvailabilityComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AvailabilityComponent]
    });
    fixture = TestBed.createComponent(AvailabilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
