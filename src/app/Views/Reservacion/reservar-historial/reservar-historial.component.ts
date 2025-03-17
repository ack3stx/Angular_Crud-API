import { Component, OnInit } from '@angular/core';
import { CommonModule, NgClass, DatePipe, CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ReservacionesService } from '../../../core/services/Reservaciones/reservaciones.service';
import { HuespedesService } from '../../../core/services/huespedes/huespedes.service';
import { HabitacionesService } from '../../../core/services/Habitaciones/habitaciones.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { Reservacion } from '../../../core/models/reservacion';
import { Huesped } from '../../../core/models/huesped';
import { Habitacion } from '../../../core/models/habitacion';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-reservar-historial',
  templateUrl: './reservar-historial.component.html',
  styleUrls: ['./reservar-historial.component.css'],
  standalone: true,
  imports: [CommonModule, NgClass, DatePipe, CurrencyPipe, RouterModule, FormsModule]
})
export class ReservarHistorialComponent implements OnInit {
  reservaciones: Reservacion[] = [];
  huespedes: Huesped[] = [];
  habitaciones: Habitacion[] = [];
  loading: boolean = true;
  error: string | null = null;
  
  // Variables para paginación
  pagina: number = 1;
  registros: number = 5;
  totalPaginas: number = 0;
  paginaActual: Reservacion[] = [];

  constructor(
    private reservacionService: ReservacionesService,
    private huespedService: HuespedesService,
    private habitacionService: HabitacionesService,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.cargarDatos();
  }

  // Verificar si el usuario es administrador
  isAdmin(): boolean {
    const userRole = this.authService.getUserRole();
    return Number(userRole) === 2; // 2 representa el rol de administrador
  }

  // Verificar si el usuario es cliente regular
  isUser(): boolean {
    const userRole = this.authService.getUserRole();
    return Number(userRole) === 3; // 3 representa el rol de usuario normal
  }

  cargarDatos() {
    this.loading = true;
    this.error = null;
    
    // Primero cargar los catálogos (huéspedes y habitaciones)
    Promise.all([
      new Promise<void>((resolve, reject) => {
        this.huespedService.getHuespedes().subscribe({
          next: (huespedes) => {
            this.huespedes = huespedes;
            resolve();
          },
          error: (error) => {
            this.error = 'Error al cargar huéspedes';
            console.error('Error:', error);
            reject(error);
          }
        });
      }),
      new Promise<void>((resolve, reject) => {
        this.habitacionService.getHabitaciones().subscribe({
          next: (habitaciones) => {
            this.habitaciones = habitaciones;
            resolve();
          },
          error: (error) => {
            this.error = 'Error al cargar habitaciones';
            console.error('Error:', error);
            reject(error);
          }
        });
      })
    ])
    .then(() => {
      // Una vez cargados los catálogos, cargar las reservaciones
      this.cargarReservaciones();
    })
    .catch((error) => {
      this.loading = false;
      console.error('Error general:', error);
    });
  }

  cargarReservaciones() {
    // Todos los usuarios ven todas las reservaciones
    this.reservacionService.todaslasreservaciones().subscribe({
      next: (data) => {
        this.reservaciones = data;
        this.calcularPaginacion();
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error al cargar las reservaciones';
        this.loading = false;
        console.error('Error:', error);
      }
    });
  }

  // Método para calcular la paginación
  calcularPaginacion() {
    this.totalPaginas = Math.ceil(this.reservaciones.length / this.registros);
    
    // Si no hay datos, asegurarse de que hay al menos una página
    if (this.totalPaginas === 0) {
      this.totalPaginas = 1;
    }
    
    // Asegurarse de que la página actual es válida
    if (this.pagina > this.totalPaginas) {
      this.pagina = this.totalPaginas;
    } else if (this.pagina < 1) {
      this.pagina = 1;
    }
    
    // Calcular los índices de inicio y fin
    const inicio = (this.pagina - 1) * this.registros;
    const fin = Math.min(inicio + this.registros, this.reservaciones.length);
    
    // Obtener los elementos de la página actual
    this.paginaActual = this.reservaciones.slice(inicio, fin);
  }

  // Métodos de paginación
  anterior() {
    if (this.pagina > 1) {
      this.pagina--;
      this.calcularPaginacion();
    }
  }

  siguiente() {
    if (this.pagina < this.totalPaginas) {
      this.pagina++;
      this.calcularPaginacion();
    }
  }

  // Método para cambiar el número de registros por página
  cambiarRegistros(event: any) {
    this.registros = parseInt(event.target.value);
    this.pagina = 1; // Volver a la primera página
    this.calcularPaginacion();
  }

  // Métodos para obtener datos de las entidades relacionadas
  obtenerNombreHabitacion(habitacionId: number): string {
    const habitacion = this.habitaciones.find(h => h.id === habitacionId);
    return habitacion ? habitacion.tipo_habitacion : 'No disponible';
  }

  obtenerNumeroHabitacion(habitacionId: number): string {
    const habitacion = this.habitaciones.find(h => h.id === habitacionId);
    return habitacion ? habitacion.numero_habitacion : 'N/A';
  }

  obtenerNombreHuesped(huespedId: number): string {
    const huesped = this.huespedes.find(h => h.id === huespedId);
    return huesped ? `${huesped.nombre} ${huesped.apellido}` : 'No disponible';
  }

  obtenerTelefonoHuesped(huespedId: number): string {
    const huesped = this.huespedes.find(h => h.id === huespedId);
    return huesped ? huesped.telefono : 'N/A';
  }

  confirmarEliminar(reservacion: Reservacion) {
    if (confirm('¿Está seguro que desea eliminar esta reservación? Esta acción no se puede deshacer.')) {
      this.eliminarReservacion(reservacion);
    }
  }

  eliminarReservacion(reservacion: Reservacion) {
    const id = reservacion.id!;
    
    this.reservacionService.cancelarReservacion(id).subscribe({
      next: () => {
        this.toastr.success('Reservación eliminada correctamente');
        this.reservaciones = this.reservaciones.filter(r => r.id !== id);
        this.calcularPaginacion();
      },
      error: (error) => {
        this.toastr.error('Error al eliminar la reservación');
        console.error('Error:', error);
      }
    });
  }
}