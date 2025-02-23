import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authTokenInterceptor } from './core/interceptors/auth/auth-token.interceptor';
import { routes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authTokenInterceptor])
    ),
    provideToastr({
      timeOut: 3000,
      positionClass: 'toast-bottom-right', // Cambiado a arriba a la derecha
      preventDuplicates: true,
      progressBar: true,              // Añade barra de progreso
      closeButton: true,              // Añade botón de cerrar
      newestOnTop: true,             // Nuevos mensajes aparecen arriba
      tapToDismiss: true,            // Cerrar al hacer clic
      // Personalización de colores
      toastClass: 'ngx-toastr',      
      // Clases CSS personalizadas
      iconClasses: {
        error: 'toast-error',
        info: 'toast-info',
        success: 'toast-success',
        warning: 'toast-warning'
      }
    }),
    provideAnimations()
  ]
};