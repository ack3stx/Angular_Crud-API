import { Component, OnInit, OnDestroy } from '@angular/core';
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
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-reservar-historial',
  templateUrl: './reservar-historial.component.html',
  styleUrls: ['./reservar-historial.component.css'],
  standalone: true,
  imports: [CommonModule, NgClass, DatePipe, CurrencyPipe, RouterModule, FormsModule]
})
export class ReservarHistorialComponent implements OnInit, OnDestroy {
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
  
  // Variables para polling
  private pollingInterval: Subscription | null = null;
  private readonly POLLING_TIME = 7000; // 7 segundos
  actualizando: boolean = false;

  constructor(
    private reservacionService: ReservacionesService,
    private huespedService: HuespedesService,
    private habitacionService: HabitacionesService,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.cargarDatos();
    
    this.iniciarPolling();
  }

  ngOnDestroy() {
    this.detenerPolling();
  }
  
  iniciarPolling() {
    this.detenerPolling();
    
    this.pollingInterval = interval(this.POLLING_TIME).subscribe(() => {
      this.actualizarDatos();
    });
  }
  
  detenerPolling() {
    if (this.pollingInterval) {
      this.pollingInterval.unsubscribe();
      this.pollingInterval = null;
    }
  }
  
  actualizarDatos() {
    if (this.actualizando) return;
    
    this.actualizando = true;
    
    this.reservacionService.todaslasreservaciones().subscribe({
      next: (nuevasReservaciones) => {
        if (this.hayDiferenciasEnReservaciones(this.reservaciones, nuevasReservaciones)) {
          this.reservaciones = nuevasReservaciones;
          this.calcularPaginacion();
          this.toastr.info('Se han actualizado las reservaciones', '', {
            timeOut: 2000,
            positionClass: 'toast-bottom-right'
          });
        }
        this.actualizando = false;
      },
      error: (error) => {
        console.error('Error al actualizar reservaciones:', error);
        this.actualizando = false;
      }
    });
  }
  
  private hayDiferenciasEnReservaciones(actuales: Reservacion[], nuevas: Reservacion[]): boolean {
    if (actuales.length !== nuevas.length) return true;
    
    const mapaActuales = new Map<number, string>();
    actuales.forEach(res => {
      if (res.id) mapaActuales.set(res.id, JSON.stringify(res));
    });
    
    for (const nuevaRes of nuevas) {
      if (!nuevaRes.id) continue;
      
      const reservaActualStr = mapaActuales.get(nuevaRes.id);
      
      if (!reservaActualStr) return true;
      
      // Comparación completa usando JSON.stringify para detectar cualquier cambio
      const nuevaResStr = JSON.stringify(nuevaRes);
      if (reservaActualStr !== nuevaResStr) {
        console.log(`Cambio detectado en reservación ID ${nuevaRes.id}`);
        return true;
      }
    }
    
    return false;
  }

  isAdmin(): boolean {
    const userRole = this.authService.getUserRole();
    return Number(userRole) === 2;
  }

  isUser(): boolean {
    const userRole = this.authService.getUserRole();
    return Number(userRole) === 3;
  }

  cargarDatos() {
    this.loading = true;
    this.error = null;
    
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
      this.cargarReservaciones();
    })
    .catch((error) => {
      this.loading = false;
      console.error('Error general:', error);
    });
  }

  cargarReservaciones() {
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

  calcularPaginacion() {
    this.totalPaginas = Math.ceil(this.reservaciones.length / this.registros);
    
    if (this.totalPaginas === 0) {
      this.totalPaginas = 1;
    }
    
    if (this.pagina > this.totalPaginas) {
      this.pagina = this.totalPaginas;
    } else if (this.pagina < 1) {
      this.pagina = 1;
    }
    
    const inicio = (this.pagina - 1) * this.registros;
    const fin = Math.min(inicio + this.registros, this.reservaciones.length);
    
    this.paginaActual = this.reservaciones.slice(inicio, fin);
  }

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

  cambiarRegistros(event: any) {
    this.registros = parseInt(event.target.value);
    this.pagina = 1;
    this.calcularPaginacion();
  }

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
    
    this.reservacionService.EliminarReservacion(id).subscribe({
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

  refrescarDatos() {
    this.actualizando = true;
    this.cargarReservaciones();
    this.iniciarPolling();
  }
}