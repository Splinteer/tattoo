import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DefaultAvailabilityComponent } from './default-availability.component';

describe('DefaultAvailabilityComponent', () => {
  let component: DefaultAvailabilityComponent;
  let fixture: ComponentFixture<DefaultAvailabilityComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DefaultAvailabilityComponent]
    });
    fixture = TestBed.createComponent(DefaultAvailabilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
