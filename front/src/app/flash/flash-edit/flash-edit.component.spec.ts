import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlashEditComponent } from './flash-edit.component';

describe('FlashEditComponent', () => {
  let component: FlashEditComponent;
  let fixture: ComponentFixture<FlashEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlashEditComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlashEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
