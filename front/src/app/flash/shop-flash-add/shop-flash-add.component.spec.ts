import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShopFlashAddComponent } from './shop-flash-add.component';

describe('ShopFlashAddComponent', () => {
  let component: ShopFlashAddComponent;
  let fixture: ComponentFixture<ShopFlashAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShopFlashAddComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShopFlashAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
