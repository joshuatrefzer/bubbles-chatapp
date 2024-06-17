import { TestBed } from '@angular/core/testing';

import { mainService } from './data.service';

describe('mainService', () => {
  let service: MainService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(mainService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
