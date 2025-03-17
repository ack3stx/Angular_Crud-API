import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservarActualizarComponent } from './reservar-actualizar.component';

describe('ReservarActualizarComponent', () => {
  let component: ReservarActualizarComponent;
  let fixture: ComponentFixture<ReservarActualizarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReservarActualizarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReservarActualizarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
