import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmpleadoService } from '../../../core/services/empleados/empleado.service';
import { Empleado } from '../../../core/models/empleado';

@Component({
  selector: 'app-empleado-user',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './empleado-user.component.html',
  styleUrl: './empleado-user.component.css'
})
export class EmpleadoUserComponent implements OnInit {
  empleados: Empleado[] = [];
  loading = false;
  error = '';

  constructor(private empleadoService: EmpleadoService) {}

  ngOnInit() {
    this.loadEmpleados();
  }

  loadEmpleados() {
    this.loading = true;
    this.empleadoService.getEmpleados().subscribe({
      next: (empleados) => {
        this.empleados = empleados;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar empleados:', error);
        this.error = 'Error al cargar la lista de empleados';
        this.loading = false;
      }
    });
  }
}