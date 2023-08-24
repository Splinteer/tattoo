import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutomaticAvailabilitySettingsComponent } from './automatic-availability-settings.component';

describe('AutomaticAvailabilitySettingsComponent', () => {
  let component: AutomaticAvailabilitySettingsComponent;
  let fixture: ComponentFixture<AutomaticAvailabilitySettingsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AutomaticAvailabilitySettingsComponent]
    });
    fixture = TestBed.createComponent(AutomaticAvailabilitySettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
