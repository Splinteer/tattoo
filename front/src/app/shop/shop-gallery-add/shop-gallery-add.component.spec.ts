import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShopGalleryAddComponent } from './shop-gallery-add.component';

describe('ShopGalleryAddComponent', () => {
  let component: ShopGalleryAddComponent;
  let fixture: ComponentFixture<ShopGalleryAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShopGalleryAddComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShopGalleryAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
