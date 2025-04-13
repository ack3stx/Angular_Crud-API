import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarmantenimientoComponent } from './editarmantenimiento.component';

describe('EditarmantenimientoComponent', () => {
  let component: EditarmantenimientoComponent;
  let fixture: ComponentFixture<EditarmantenimientoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarmantenimientoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarmantenimientoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
