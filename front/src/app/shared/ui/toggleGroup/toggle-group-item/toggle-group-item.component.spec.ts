import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToggleGroupItemComponent } from './toggle-group-item.component';

describe('ToggleGroupItemComponent', () => {
  let component: ToggleGroupItemComponent;
  let fixture: ComponentFixture<ToggleGroupItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ToggleGroupItemComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ToggleGroupItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
