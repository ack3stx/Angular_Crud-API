import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserHuespedComponent } from './user-huesped.component';

describe('UserHuespedComponent', () => {
  let component: UserHuespedComponent;
  let fixture: ComponentFixture<UserHuespedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserHuespedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserHuespedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
