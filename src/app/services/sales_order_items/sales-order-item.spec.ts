import { TestBed } from '@angular/core/testing';

import { SalesOrderItem } from './sales-order-item';

describe('SalesOrderItem', () => {
  let service: SalesOrderItem;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SalesOrderItem);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
