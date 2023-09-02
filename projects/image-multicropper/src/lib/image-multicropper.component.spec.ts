import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageMulticropperComponent } from './image-multicropper.component';

describe('ImageMulticropperComponent', () => {
  let component: ImageMulticropperComponent;
  let fixture: ComponentFixture<ImageMulticropperComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ImageMulticropperComponent]
    });
    fixture = TestBed.createComponent(ImageMulticropperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
