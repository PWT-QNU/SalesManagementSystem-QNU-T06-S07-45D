import { TestBed } from '@angular/core/testing';

import { SalesOrder } from './sales-order';

describe('SalesOrder', () => {
  let service: SalesOrder;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SalesOrder);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
