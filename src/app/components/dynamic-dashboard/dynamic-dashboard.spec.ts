import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicDashboard } from './dynamic-dashboard';

describe('DynamicDashboard', () => {
  let component: DynamicDashboard;
  let fixture: ComponentFixture<DynamicDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DynamicDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DynamicDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
