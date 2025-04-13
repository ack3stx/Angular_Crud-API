import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { ToastrService } from 'ngx-toastr';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  
  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  canActivate(): boolean {
    const token = localStorage.getItem('token');
    
    if (!token) {
      this.toastr.error('Necesitas iniciar sesión', 'Acceso denegado');
      this.router.navigate(['/login']);
      return false;
    }
    
    try {
      // Decodificar el token
      const decodedToken: any = jwtDecode(token);
      
      // Verificar si el token es válido y no ha expirado
      if (decodedToken.exp && decodedToken.exp * 1000 < Date.now()) {
        localStorage.removeItem('token');
        this.toastr.error('Tu sesión ha expirado', 'Acceso denegado');
        this.router.navigate(['/login']);
        return false;
      }
      
      // Verificar el rol del usuario (debe ser 2 para administrador)
      const userRole = decodedToken.role_id || this.authService.getUserRole();
      
      if (Number(userRole) === 2) {
        return true;
      } else {
        this.toastr.error('No tienes permisos de administrador', 'Acceso denegado');
        
        // Si está autenticado pero no es admin, redirigir al dashboard de usuario
        if (this.authService.isLoggedIn()) {
          this.router.navigate(['/dashboard']);
        } else {
          this.router.navigate(['/']);
        }
        
        return false;
      }
    } catch (error) {
      console.error('Error al verificar el token:', error);
      localStorage.removeItem('token');
      this.toastr.error('Sesión inválida', 'Acceso denegado');
      this.router.navigate(['/login']);
      return false;
    }
  }
}