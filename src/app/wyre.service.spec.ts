import { TestBed } from '@angular/core/testing';

import { WyreService } from './wyre.service';

describe('WyreService', () => {
  let service: WyreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WyreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
