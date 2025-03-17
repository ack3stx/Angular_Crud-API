import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EmpleadoService } from '../../../core/services/empleados/empleado.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { Empleado } from '../../../core/models/empleado';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-empleados',
  templateUrl: './empleados.component.html',
  styleUrls: ['./empleados.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule]
})
export class EmpleadosComponent implements OnInit {
  empleados: Empleado[] = [];
  loading = false;
  error = '';
  
  // Variables para paginación
  pagina: number = 1;
  registros: number = 5;

  constructor(
    private empleadoService: EmpleadoService,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.loadEmpleados();
  }

  // Método para obtener los empleados de la página actual
  get paginaActual() {
    const indice = (this.pagina - 1) * this.registros;
    return this.empleados.slice(indice, indice + this.registros);
  }

  // Método para calcular el total de páginas
  get totalPaginas() {
    return Math.ceil(this.empleados.length / this.registros);
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

  // Método para verificar si un empleado está activo
  isEmpleadoActivo(estado: string): boolean {
    return estado.toLowerCase() !== 'inactivo';
  }

  loadEmpleados() {
    this.loading = true;
    this.empleadoService.getEmpleados().subscribe({
      next: (empleados) => {
        this.empleados = empleados;
        this.loading = false;
      },
      error: (error) => {
        this.toastr.error('Error al cargar la lista de empleados');
        console.error('Error al cargar empleados:', error);
        this.error = 'Error al cargar la lista de empleados';
        this.loading = false;
      }
    });
  }

  deleteEmpleado(empleado: Empleado) {
    // Verificamos si el empleado está activo y tiene un ID definido
    if (!this.isAdmin() || !empleado.id || !this.isEmpleadoActivo(empleado.estado)) {
      if (!this.isEmpleadoActivo(empleado.estado)) {
        this.toastr.warning('No se pueden eliminar empleados inactivos');
      }
      return;
    }
    
    if (confirm('¿Está seguro de eliminar este empleado?')) {
      this.empleadoService.eliminarEmpleado(empleado.id).subscribe({
        next: (response) => {
          this.toastr.success(response.message || 'Empleado eliminado correctamente');
          this.loadEmpleados();
        },
        error: (err) => {
          this.toastr.error(err.error.message || 'Error al eliminar el empleado');
          console.error('Error al eliminar:', err);
          this.error = 'Error al eliminar el empleado';
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