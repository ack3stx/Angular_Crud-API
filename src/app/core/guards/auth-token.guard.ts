import { CanActivateFn } from '@angular/router';

export const authTokenGuard: CanActivateFn = (route, state) => {
  return true;
};
