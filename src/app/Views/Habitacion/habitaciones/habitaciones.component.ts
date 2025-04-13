import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HabitacionesService } from '../../../core/services/Habitaciones/habitaciones.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { Habitacion } from '../../../core/models/habitacion';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-habitaciones',
  templateUrl: './habitaciones.component.html',
  styleUrls: ['./habitaciones.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule]
})
export class HabitacionesComponent implements OnInit {
  habitaciones: Habitacion[] = [];
  loading = false;
  error = '';
  
  // Variables para paginación
  pagina: number = 1;
  registros: number = 5;

  constructor(
    private habitacionService: HabitacionesService,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.loadHabitaciones();
  }

  get paginaActual() {
    const indice = (this.pagina - 1) * this.registros;
    return this.habitaciones.slice(indice, indice + this.registros);
  }

  get totalPaginas() {
    return Math.ceil(this.habitaciones.length / this.registros);
  }

  siguiente() {
    if (this.pagina < this.totalPaginas) {
      this.pagina++;
    }
  }

  anterior() {
    if (this.pagina > 1) {
      this.pagina--;
    }
  }

  isAdmin(): boolean {
    const userRole = this.authService.getUserRole();
    return Number(userRole) === 2;
  }
  
  isUser(): boolean {
    const userRole = this.authService.getUserRole();
    return Number(userRole) === 3;
  }

  loadHabitaciones() {
    this.loading = true;
    this.habitacionService.getHabitaciones().subscribe({
      next: (habitaciones) => {
        this.habitaciones = habitaciones;
        this.loading = false;
      },
      error: (error) => {
        this.toastr.error('Error al cargar la lista de habitaciones');
        console.error('Error al cargar habitaciones:', error);
        this.error = 'Error al cargar la lista de habitaciones';
        this.loading = false;
      }
    });
  }

  deleteHabitacion(id: number) {
    if (!this.isAdmin()) return;
    
    if (confirm('¿Está seguro de eliminar esta habitación?')) {
      this.habitacionService.eliminarHabitacion(id).subscribe({
        next: (response) => {
          this.toastr.success(response.message || 'Habitación eliminada correctamente');
          this.loadHabitaciones();
        },
        error: (err) => {
          this.toastr.error(err.error.message || 'Error al eliminar la habitación');
          console.error('Error al eliminar:', err);
          this.error = 'Error al eliminar la habitación';
        }
      });
    }
  }
  
  cambiarRegistros(event: any) {
    this.registros = Number(event.target.value);
    this.pagina = 1;
  }
}