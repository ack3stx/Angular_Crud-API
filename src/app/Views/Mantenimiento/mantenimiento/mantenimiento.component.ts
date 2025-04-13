import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MantenimientoService } from '../../../core/services/Mantenimientos/mantenimiento.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { Mantenimiento } from '../../../core/models/mantenimiento';
import { ToastrService } from 'ngx-toastr';
import { HabitacionesService } from '../../../core/services/Habitaciones/habitaciones.service';
import { EmpleadoService } from '../../../core/services/empleados/empleado.service';
import { Habitacion } from '../../../core/models/habitacion';
import { Empleado } from '../../../core/models/empleado';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-mantenimiento',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './mantenimiento.component.html',
  styleUrls: ['./mantenimiento.component.css']
})
export class MantenimientoComponent implements OnInit {
  mantenimientos: Mantenimiento[] = [];
  habitaciones: Map<number, Habitacion> = new Map();
  empleados: Map<number, Empleado> = new Map();
  loading = false;
  error = '';
  
  // Variables para paginación
  pagina: number = 1;
  registros: number = 5;

  constructor(
    private mantenimientoService: MantenimientoService,
    private habitacionService: HabitacionesService,
    private empleadoService: EmpleadoService,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.cargarDatos();
  }

  // Método para obtener los mantenimientos de la página actual
  get paginaActual() {
    const indice = (this.pagina - 1) * this.registros;
    return this.mantenimientos.slice(indice, indice + this.registros);
  }

  // Método para calcular el total de páginas
  get totalPaginas() {
    return Math.ceil(this.mantenimientos.length / this.registros);
  }

  // Método para ir a la página siguiente
  siguiente() {
    if (this.pagina < this.totalPaginas) {
      this.pagina++;
    }
  }

  // Método para ir a la página anterior
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

  // Cargar todos los datos necesarios
  cargarDatos() {
    this.loading = true;
    
    forkJoin({
      mantenimientos: this.mantenimientoService.getMantenimientos(),
      habitaciones: this.habitacionService.getHabitaciones(),
      empleados: this.empleadoService.getEmpleados()
    }).subscribe({
      next: (results) => {
        this.mantenimientos = results.mantenimientos;
        
        // Convertir arrays a Maps para búsqueda rápida por ID
        results.habitaciones.forEach(habitacion => {
          this.habitaciones.set(habitacion.id, habitacion);
        });
        
        results.empleados.forEach(empleado => {
          this.empleados.set(empleado.id!, empleado);
        });
        
        this.loading = false;
      },
      error: (error) => {
        this.toastr.error('Error al cargar los datos');
        console.error('Error al cargar datos:', error);
        this.error = 'Error al cargar los datos necesarios';
        this.loading = false;
      }
    });
  }

  // Método para obtener el número de habitación
  getNumeroHabitacion(habitacion_id: number): string {
    const habitacion = this.habitaciones.get(habitacion_id);
    return habitacion ? habitacion.numero_habitacion : 'N/A';
  }
  
  // Método para obtener el nombre del empleado
  getNombreEmpleado(empleado_id: number): string {
    const empleado = this.empleados.get(empleado_id);
    return empleado ? `${empleado.nombre} ${empleado.apellido}` : 'N/A';
  }

  eliminarMantenimiento(id: number) {
    if (!this.isAdmin()) return;
    
    if (confirm('¿Está seguro de eliminar este mantenimiento?')) {
      this.mantenimientoService.deleteMantenimiento(id).subscribe({
        next: (response) => {
          this.toastr.success('Mantenimiento eliminado correctamente');
          this.cargarDatos(); // Recargar todos los datos
        },
        error: (err) => {
          this.toastr.error(err.error?.message || 'Error al eliminar el mantenimiento');
          console.error('Error al eliminar:', err);
          this.error = 'Error al eliminar el mantenimiento';
        }
      });
    }
  }
  
  // Método para cambiar la cantidad de registros por página
  cambiarRegistros(event: any) {
    this.registros = Number(event.target.value);
    this.pagina = 1; // Volver a la primera página al cambiar
  }
}