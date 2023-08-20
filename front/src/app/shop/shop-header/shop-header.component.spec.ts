import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShopHeaderComponent } from './shop-header.component';

describe('ShopHeaderComponent', () => {
  let component: ShopHeaderComponent;
  let fixture: ComponentFixture<ShopHeaderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ShopHeaderComponent]
    });
    fixture = TestBed.createComponent(ShopHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
