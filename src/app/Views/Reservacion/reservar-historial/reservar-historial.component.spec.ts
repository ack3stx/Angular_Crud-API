import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservarHistorialComponent } from './reservar-historial.component';

describe('ReservarHistorialComponent', () => {
  let component: ReservarHistorialComponent;
  let fixture: ComponentFixture<ReservarHistorialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReservarHistorialComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReservarHistorialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
