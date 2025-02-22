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
    // Decodifica el token para verificar su estructura
    const decodedToken = jwtDecode(token);
    
    // Verifica si el token ha expirado
    if (decodedToken.exp && decodedToken.exp * 1000 < Date.now()) {
      localStorage.removeItem('token');
      router.navigate(['/login']);
      return false;
    }

    return true;
  } catch (error) {
    // Si hay error al decodificar el token, significa que no es válido
    localStorage.removeItem('token');
    router.navigate(['/login']);
    return false;
  }
}