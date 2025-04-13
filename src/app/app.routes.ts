import { Routes } from '@angular/router';

// Auth Components
import { LoginComponent } from './Views/auth/login/login.component';
import { RegisterComponent } from './Views/auth/register/register.component';
import { AuthCodeComponent } from './Views/auth/auth-code/auth-code.component';
import { WelcomeComponent } from './Views/welcome/welcome.component';

// Dashboard Components
import { DashboardComponent } from './Views/dashboard/dashboard/dashboard.component';
import { WelcomeAdminComponent } from './Views/admin/welcome-admin/welcome-admin.component';

// Users Management
import { UsersComponent } from './Views/users-admin/users/users.component';
import { EditUserComponent } from './Views/users-admin/edit-user/edit-user.component';

// Habitaciones Components
import { HabitacionesComponent } from './Views/Habitacion/habitaciones/habitaciones.component';
import { HabitacionCrearComponent } from './Views/Habitacion/habitacion-crear/habitacion-crear.component';
import { HabitacionEditarComponent } from './Views/Habitacion/habitacion-editar/habitacion-editar.component';

// Empleados Components
import { EmpleadosComponent } from './Views/Empleado/empleados/empleados.component';
import { EmpleadoCrearComponent } from './Views/Empleado/empleado-crear/empleado-crear.component';
import { EmpleadoEditarComponent } from './Views/Empleado/empleado-editar/empleado-editar.component';

// Reservaciones Components
import { ReservarHistorialComponent } from './Views/Reservacion/reservar-historial/reservar-historial.component';
import { ReservarComponent } from './Views/Reservacion/reservar/reservar.component';
import { ReservaractualizarComponent } from './Views/Reservacion/reservar-actualizar/reservar-actualizar.component';

// Facturas Components
import { FacturaComponent } from './Views/Facturas/factura/factura.component';
import { CrearFacturaComponent } from './Views/Facturas/crear-factura/crear-factura.component';
import { EditarFacturaComponent } from './Views/Facturas/editar-factura/editar-factura.component';

// Huespedes Components
import { HuespedComponent } from './Views/Huespedes/huesped/huesped.component';
import { CrearHuespedComponent } from './Views/Huespedes/crearhuesped/crearhuesped.component';
import { EditarHuespedComponent } from './Views/Huespedes/editar-huesped/editar-huesped.component';

// Mantenimiento Components
import { MantenimientoComponent } from './Views/Mantenimiento/mantenimiento/mantenimiento.component';
import { CrearMantenimientoComponent } from './Views/Mantenimiento/crear-mantenimiento/crear-mantenimiento.component';
import { EditarmantenimientoComponent } from './Views/Mantenimiento/editarmantenimiento/editarmantenimiento.component';

// Auditoria Components
import { AuditoriaComponent } from './Views/auditoria/auditoria.component';

// Guards
import { authTokenGuard } from './core/guards/auth-token.guard';
import { loginGuard } from './core/guards/login.guard';
import { AdminGuard } from './core/guards/admin-guard.guard';

export const routes: Routes = [
  // Rutas públicas (accesibles sin autenticación)
  {
    path: '',
    canActivate: [loginGuard],
    children: [
      { path: '', component: WelcomeComponent },
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
      { path: 'confirm-acount', component: AuthCodeComponent }
    ]
  },

  // Rutas protegidas (requieren autenticación)
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authTokenGuard]
  },

  // Rutas de administración (requieren rol de administrador)
  {
    path: 'admin',
    canActivate: [AdminGuard],
    children: [
      { path: 'dashboard', component: WelcomeAdminComponent },
      { path: 'users', component: UsersComponent },
      { path: 'users/edit/:id', component: EditUserComponent },
      { path: 'auditoria', component: AuditoriaComponent }
    ]
  },

  // Módulo de Habitaciones
  {
    path: 'habitacion',
    children: [
      // Ruta de visualización - cualquier usuario autenticado
      { 
        path: '', 
        component: HabitacionesComponent, 
        canActivate: [authTokenGuard] 
      },
      // Rutas de creación y edición - solo administradores
      { 
        path: 'crear', 
        component: HabitacionCrearComponent, 
        canActivate: [authTokenGuard, AdminGuard] 
      },
      { 
        path: 'editar/:id', 
        component: HabitacionEditarComponent, 
        canActivate: [authTokenGuard, AdminGuard] 
      }
    ]
  },

  // Módulo de Empleados
  {
    path: 'empleados',
    children: [
      // Ruta de visualización - cualquier usuario autenticado
      { 
        path: '', 
        component: EmpleadosComponent, 
        canActivate: [authTokenGuard] 
      },
      // Rutas de creación y edición - solo administradores
      { 
        path: 'crear', 
        component: EmpleadoCrearComponent, 
        canActivate: [authTokenGuard, AdminGuard] 
      },
      { 
        path: 'editar/:id', 
        component: EmpleadoEditarComponent, 
        canActivate: [authTokenGuard, AdminGuard] 
      }
    ]
  },

  // Módulo de Reservaciones
  {
    path: 'reservaciones',
    children: [
      // Ruta de visualización - cualquier usuario autenticado
      { 
        path: '', 
        component: ReservarHistorialComponent, 
        canActivate: [authTokenGuard] 
      },
      // Rutas de creación y edición - solo administradores
      { 
        path: 'crear', 
        component: ReservarComponent, 
        canActivate: [authTokenGuard, AdminGuard] 
      },
      { 
        path: 'editar/:id', 
        component: ReservaractualizarComponent, 
        canActivate: [authTokenGuard, AdminGuard] 
      }
    ]
  },

  // Módulo de Facturas
  {
    path: 'facturas',
    children: [
      // Ruta de visualización - cualquier usuario autenticado
      { 
        path: '', 
        component: FacturaComponent, 
        canActivate: [authTokenGuard] 
      },
      // Rutas de creación y edición - solo administradores
      { 
        path: 'crear', 
        component: CrearFacturaComponent, 
        canActivate: [authTokenGuard, AdminGuard] 
      },
      { 
        path: 'editar/:id', 
        component: EditarFacturaComponent, 
        canActivate: [authTokenGuard, AdminGuard] 
      }
    ]
  },

  // Módulo de Huéspedes
  {
    path: 'huespedes',
    children: [
      // Ruta de visualización - cualquier usuario autenticado
      { 
        path: '', 
        component: HuespedComponent, 
        canActivate: [authTokenGuard] 
      },
      // Rutas de creación y edición - solo administradores
      { 
        path: 'crear', 
        component: CrearHuespedComponent, 
        canActivate: [authTokenGuard, AdminGuard] 
      },
      { 
        path: 'editar/:id', 
        component: EditarHuespedComponent, 
        canActivate: [authTokenGuard, AdminGuard] 
      }
    ]
  },

  // Módulo de Mantenimiento
  {
    path: 'mantenimientos',
    children: [
      // Ruta de visualización - cualquier usuario autenticado
      { 
        path: '', 
        component: MantenimientoComponent, 
        canActivate: [authTokenGuard] 
      },
      // Rutas de creación y edición - solo administradores
      { 
        path: 'crear', 
        component: CrearMantenimientoComponent, 
        canActivate: [authTokenGuard, AdminGuard] 
      },
      { 
        path: 'editar/:id', 
        component: EditarmantenimientoComponent, 
        canActivate: [authTokenGuard, AdminGuard] 
      }
    ]
  },

  // Redireccionamiento y ruta genérica de "no encontrado"
  { path: '**', redirectTo: '' }
];