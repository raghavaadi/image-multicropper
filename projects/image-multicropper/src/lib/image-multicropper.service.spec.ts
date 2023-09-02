import { TestBed } from '@angular/core/testing';

import { ImageMulticropperService } from './image-multicropper.service';

describe('ImageMulticropperService', () => {
  let service: ImageMulticropperService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImageMulticropperService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
