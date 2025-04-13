import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpleadoCrearComponent } from './empleado-crear.component';

describe('EmpleadoCrearComponent', () => {
  let component: EmpleadoCrearComponent;
  let fixture: ComponentFixture<EmpleadoCrearComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmpleadoCrearComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmpleadoCrearComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
