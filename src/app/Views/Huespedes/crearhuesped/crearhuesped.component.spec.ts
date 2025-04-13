import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearhuespedComponent } from './crearhuesped.component';

describe('CrearhuespedComponent', () => {
  let component: CrearhuespedComponent;
  let fixture: ComponentFixture<CrearhuespedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearhuespedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearhuespedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
