import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardWidget } from './dashboard-widget';

describe('DashboardWidget', () => {
  let component: DashboardWidget;
  let fixture: ComponentFixture<DashboardWidget>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardWidget]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardWidget);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
