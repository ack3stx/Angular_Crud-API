import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

export const loginGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');

  if (token) {
    try {
      const decodedToken = jwtDecode(token);
      if (decodedToken.exp && decodedToken.exp * 1000 > Date.now()) {
        router.navigate(['/dashboard']);
        return false;
      }
    } catch (error) {
      localStorage.removeItem('token');
      return true;
    }
  }

  return true;
};