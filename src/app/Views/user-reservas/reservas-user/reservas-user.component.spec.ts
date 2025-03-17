import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservasUserComponent } from './reservas-user.component';

describe('ReservasUserComponent', () => {
  let component: ReservasUserComponent;
  let fixture: ComponentFixture<ReservasUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReservasUserComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReservasUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
