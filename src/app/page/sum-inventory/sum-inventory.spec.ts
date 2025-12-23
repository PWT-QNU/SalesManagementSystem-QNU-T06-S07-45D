import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SumInventory } from './sum-inventory';

describe('SumInventory', () => {
  let component: SumInventory;
  let fixture: ComponentFixture<SumInventory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SumInventory]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SumInventory);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
