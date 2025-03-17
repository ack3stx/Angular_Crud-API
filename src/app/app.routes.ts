import { Routes } from '@angular/router';
import { LoginComponent } from './Views/auth/login/login.component';
import { RegisterComponent } from './Views/auth/register/register.component';
import { WelcomeComponent } from './Views/welcome/welcome.component';
import { DashboardComponent } from './Views/dashboard/dashboard/dashboard.component';
import { authTokenGuard } from './core/guards/auth-token.guard';
import { loginGuard } from './core/guards/login.guard';
import { HuespedComponent } from './Views/huesped/huesped.component';
import { WelcomeAdminComponent } from './Views/admin/welcome-admin/welcome-admin.component';
import { AdminGuard } from './core/guards/admin-guard.guard';
import {HabitacionesComponent} from './Views/Habitacion/habitaciones/habitaciones.component';
import {ReservasUserComponent} from './Views/user-reservas/reservas-user/reservas-user.component';
import { EmpleadoUserComponent} from './Views/user-empleado/empleado-user/empleado-user.component';
import { MantenimientoComponent } from './Views/Mantenimiento/mantenimiento/mantenimiento.component';
import { UsersComponent } from './Views/users-admin/users/users.component';
import { AuthCodeComponent } from './Views/auth/auth-code/auth-code.component';
import { UserHabitacionesComponent } from './Views/user-habitaciones/user-habitaciones.component';
import { UserHuespedComponent } from './Views/user-huesped/user-huesped.component';
import { HabitacionCrearComponent } from './Views/Habitacion/habitacion-crear/habitacion-crear.component';
import { HabitacionEditarComponent } from './Views/Habitacion/habitacion-editar/habitacion-editar.component';

import { EmpleadosComponent } from './Views/Empleado/empleados/empleados.component';
import { EmpleadoCrearComponent } from './Views/Empleado/empleado-crear/empleado-crear.component';
import { EmpleadoEditarComponent } from './Views/Empleado/empleado-editar/empleado-editar.component';


import { ReservarHistorialComponent } from './Views/Reservacion/reservar-historial/reservar-historial.component';
import { ReservarComponent } from './Views/Reservacion/reservar/reservar.component';
import { ReservaractualizarComponent } from './Views/Reservacion/reservar-actualizar/reservar-actualizar.component';


import { FacturaComponent} from './Views/Facturas/factura/factura.component';
import { CrearFacturaComponent } from './Views/Facturas/crear-factura/crear-factura.component';
import { EditarFacturaComponent } from './Views/Facturas/editar-factura/editar-factura.component';

export const routes: Routes = [

    { path: 'habitaciones', component: HabitacionesComponent , canActivate: [authTokenGuard] },
    { path: 'habitaciones/crear', component: HabitacionCrearComponent , canActivate: [authTokenGuard] },
    { path: 'habitaciones/editar/:id', component: HabitacionEditarComponent , canActivate: [authTokenGuard] },

    { 
        path: 'empleados', 
        component: EmpleadosComponent, 
        canActivate: [authTokenGuard] // Protección para todos los usuarios autenticados
      },
      { 
        path: 'empleados/crear', 
        component: EmpleadoCrearComponent, 
        canActivate: [authTokenGuard] // Solo administradores
      },
      { 
        path: 'empleados/editar/:id', 
        component: EmpleadoEditarComponent, 
        canActivate: [authTokenGuard] // Solo administradores
      },

      { 
        path: 'reservaciones', 
        component: ReservarHistorialComponent, 
        canActivate: [authTokenGuard]  // Accesible para usuarios autenticados
      },
      { 
        path: 'reservaciones/crear', 
        component: ReservarComponent, 
        canActivate: [authTokenGuard]  // Solo administradores
      },
      { 
        path: 'reservaciones/editar/:id', 
        component: ReservaractualizarComponent, 
        canActivate: [authTokenGuard]  // Solo administradores
      },

      {
        path: 'facturas',
        component: FacturaComponent,
        canActivate: [authTokenGuard]
      },
      {
        path: 'facturas/crear',
        component: CrearFacturaComponent,
        canActivate: [authTokenGuard]
      },
      {
        path: 'facturas/editar/:id',
        component: EditarFacturaComponent,
        canActivate: [authTokenGuard]
      },

    {
        path: 'login',
        component: LoginComponent,
        canActivate: [loginGuard]
    },
    {
        path: 'register',
        component: RegisterComponent,
        canActivate: [loginGuard]
    },
    {
        path : '',
        component : WelcomeComponent,
        canActivate : [loginGuard]
    },
    {
        path : 'confirm-acount',
        component : AuthCodeComponent,   
        canActivate : [loginGuard]
    },
    {
        path : 'huesped',
        component : HuespedComponent,
        canActivate : [authTokenGuard]
    },
    {
        path : 'lista_habitaciones',
        component : UserHabitacionesComponent,
        canActivate : [authTokenGuard]

    },
    {
        path : 'lista_huespedes',
        component : UserHuespedComponent,
        canActivate : [authTokenGuard]
    },
    {
        path : 'reservar',
        component : ReservarComponent,
        canActivate : [authTokenGuard]
    },
    {
        path: 'historial',
        component: ReservarHistorialComponent,
        canActivate: [authTokenGuard]
    },
    {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [authTokenGuard]
    },
    {
        path: 'habitacion',
        component: HabitacionesComponent,
        canActivate: [authTokenGuard]
    },
    {
        path: 'lista_reservaciones',
        component: ReservasUserComponent,
        canActivate: [authTokenGuard]
    },
    {
        path: 'lista_empleados',
        component: EmpleadoUserComponent,
        canActivate: [authTokenGuard]
    },
    {
        path: 'lista_mantenimiento',
        component: MantenimientoComponent,
        canActivate: [authTokenGuard]
    },
    {
        path: 'desabilitar',
        component: UsersComponent,
        canActivate: [authTokenGuard]
    },
    {
        path: 'admin',
        canActivate: [AdminGuard],
        children: [
            {
                path: 'dashboard2',
                component: WelcomeAdminComponent
            }
        ]
    }
]