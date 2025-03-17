import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserHabitacionesComponent } from './user-habitaciones.component';

describe('UserHabitacionesComponent', () => {
  let component: UserHabitacionesComponent;
  let fixture: ComponentFixture<UserHabitacionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserHabitacionesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserHabitacionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
