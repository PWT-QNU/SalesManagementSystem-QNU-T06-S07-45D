import { TestBed } from '@angular/core/testing';

import { ImportOrder } from './import-order';

describe('ImportOrder', () => {
  let service: ImportOrder;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImportOrder);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
