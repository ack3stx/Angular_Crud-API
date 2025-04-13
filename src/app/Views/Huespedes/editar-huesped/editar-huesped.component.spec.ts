import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarHuespedComponent } from './editar-huesped.component';

describe('EditarHuespedComponent', () => {
  let component: EditarHuespedComponent;
  let fixture: ComponentFixture<EditarHuespedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarHuespedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarHuespedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
