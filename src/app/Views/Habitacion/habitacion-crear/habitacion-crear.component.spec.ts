import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HabitacionCrearComponent } from './habitacion-crear.component';

describe('HabitacionCrearComponent', () => {
  let component: HabitacionCrearComponent;
  let fixture: ComponentFixture<HabitacionCrearComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HabitacionCrearComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HabitacionCrearComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
