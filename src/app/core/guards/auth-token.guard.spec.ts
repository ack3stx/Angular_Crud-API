import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { authTokenGuard } from './auth-token.guard';

describe('authTokenGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => authTokenGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
