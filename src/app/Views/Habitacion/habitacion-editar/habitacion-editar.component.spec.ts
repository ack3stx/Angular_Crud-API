import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HabitacionEditarComponent } from './habitacion-editar.component';

describe('HabitacionEditarComponent', () => {
  let component: HabitacionEditarComponent;
  let fixture: ComponentFixture<HabitacionEditarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HabitacionEditarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HabitacionEditarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
