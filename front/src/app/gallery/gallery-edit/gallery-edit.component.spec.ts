import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GalleryEditComponent } from './gallery-edit.component';

describe('GalleryEditComponent', () => {
  let component: GalleryEditComponent;
  let fixture: ComponentFixture<GalleryEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GalleryEditComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GalleryEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
