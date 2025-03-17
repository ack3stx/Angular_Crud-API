import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpleadoUserComponent } from './empleado-user.component';

describe('EmpleadoUserComponent', () => {
  let component: EmpleadoUserComponent;
  let fixture: ComponentFixture<EmpleadoUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmpleadoUserComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmpleadoUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
