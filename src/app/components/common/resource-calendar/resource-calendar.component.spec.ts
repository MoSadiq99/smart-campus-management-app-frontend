import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResourceCalendarComponent } from './resource-calendar.component';

describe('ResourceCalendarComponent', () => {
  let component: ResourceCalendarComponent;
  let fixture: ComponentFixture<ResourceCalendarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResourceCalendarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResourceCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
