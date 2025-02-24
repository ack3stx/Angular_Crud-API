import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

export const authTokenGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');

  if (!token) {
    router.navigate(['/login']);
    return false;
  }

  try {
    const decodedToken = jwtDecode(token);
    
    if (decodedToken.exp && decodedToken.exp * 1000 < Date.now()) {
      localStorage.removeItem('token');
      router.navigate(['/login']);
      return false;
    }

    return true;
  } catch (error) {
    localStorage.removeItem('token');
    router.navigate(['/login']);
    return false;
  }
}