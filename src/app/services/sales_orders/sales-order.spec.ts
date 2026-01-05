import { TestBed } from '@angular/core/testing';

import { SalesOrderService } from './sales-order';

describe('SalesOrder', () => {
  let service: SalesOrderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SalesOrderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
