import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { catchError, throwError } from 'rxjs';

export const authTokenInterceptor: HttpInterceptorFn = (req, next) => {
  // Inyectar servicios necesarios
  const router = inject(Router);
  const toastr = inject(ToastrService);

  // OBTENEMOS EL TOKEN DEL LOCALSTORAGE
  const token = localStorage.getItem('token');

  // SI HAY UN TOKEN 
  if (token) {
    // CLONAMOS LA PETICION ORIGINAL Y LE AGREGAMOS EL TOKEN EN EL HEADER
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    
    // CONTINUAMOS CON LA PETICION MODIFICADA Y MANEJAMOS LOS ERRORES
    return next(authReq).pipe(
      catchError((error: HttpErrorResponse) => {


        if (error.status === 403 && 
          error.error?.status === 'error' && 
          error.error?.message === 'No tienes permisos para acceder a esta sección.' && 
          error.error?.details === 'Tu rol actual no tiene privilegios para esta operación.') {
        
        // Mostrar mensaje al usuario
        toastr.warning('No tienes permisos para acceder a esta sección', 'Acceso restringido');
        
        // Redireccionar al home
        router.navigate(['/']);
        
        // Evitar que se muestren errores adicionales
        return throwError(() => new Error('Acceso restringido'));
      }

        // Verificar si es un error 403 (Forbidden)
        if (error.status === 403) {
          // Intentar obtener el mensaje de error del backend
          const errorMessage = error.error?.message || 'Tu cuenta ha sido deshabilitada o no tienes permiso para acceder.';
          
          // Si el mensaje contiene información sobre cuenta deshabilitada
          if (errorMessage.includes('cuenta ha sido deshabilitada') || 
              errorMessage.includes('banned') || 
              errorMessage.includes('blocked')) {
            
            // Limpiar el token y otros datos de sesión
            localStorage.removeItem('token');

            
            // Mostrar mensaje al usuario
            toastr.error(errorMessage, 'Acceso Denegado', {
              timeOut: 0,
              extendedTimeOut: 0,
              closeButton: true
            });
            
            // Redireccionar al login
            router.navigate(['/login']);
          }
        }
        



        // También manejar 401 (Unauthorized) para redireccionar cuando el token expire
        if (error.status === 401) {
          // Si el token expiró o es inválido
          if (error.error?.message?.includes('expired') || 
              error.error?.message?.includes('invalid') || 
              error.error?.message?.includes('token')) {
            
            // Limpiar datos de sesión
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('role');
            
            // Mostrar mensaje
            toastr.warning('Tu sesión ha expirado. Por favor inicia sesión nuevamente.', 'Sesión expirada');
            
            // Redireccionar al login
            router.navigate(['/login']);
          }
        }
        
        // Propagar el error para que otros interceptores o servicios puedan manejarlo
        return throwError(() => error);
      })
    );
  }
  
  // SI NO HAY TOKEN, CONTINUAMOS CON LA PETICIÓN ORIGINAL
  return next(req);
};