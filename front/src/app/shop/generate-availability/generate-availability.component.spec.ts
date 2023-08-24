import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateAvailabilityComponent } from './generate-availability.component';

describe('GenerateAvailabilityComponent', () => {
  let component: GenerateAvailabilityComponent;
  let fixture: ComponentFixture<GenerateAvailabilityComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [GenerateAvailabilityComponent]
    });
    fixture = TestBed.createComponent(GenerateAvailabilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
