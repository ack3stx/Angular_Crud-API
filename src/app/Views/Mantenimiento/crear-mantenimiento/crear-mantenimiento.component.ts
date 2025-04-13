import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MantenimientoService } from '../../../core/services/Mantenimientos/mantenimiento.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { ToastrService } from 'ngx-toastr';
import { HabitacionesService } from '../../../core/services/Habitaciones/habitaciones.service';
import { EmpleadoService } from '../../../core/services/empleados/empleado.service';
import { Habitacion } from '../../../core/models/habitacion';
import { Empleado } from '../../../core/models/empleado';

@Component({
  selector: 'app-crear-mantenimiento',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './crear-mantenimiento.component.html',
  styleUrls: ['./crear-mantenimiento.component.css']
})
export class CrearMantenimientoComponent implements OnInit {
  mantenimientoForm!: FormGroup;
  habitaciones: Habitacion[] = [];
  empleados: Empleado[] = [];
  submitting: boolean = false;
  loading: boolean = false;
  error: string | null = null;
  submitted: boolean = false;

  constructor(
    private fb: FormBuilder,
    private mantenimientoService: MantenimientoService,
    private habitacionService: HabitacionesService,
    private empleadoService: EmpleadoService,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    // Verificar si el usuario es administrador
    if (!this.isAdmin()) {
      this.toastr.warning('No tienes permiso para acceder a esta página');
      this.router.navigate(['/mantenimientos']);
      return;
    }

    this.initForm();
    this.cargarHabitaciones();
    this.cargarEmpleados();
  }

  // Verificar si el usuario es administrador
  isAdmin(): boolean {
    const userRole = this.authService.getUserRole();
    return Number(userRole) === 2;
  }

  private initForm(): void {
    this.mantenimientoForm = this.fb.group({
      habitacion_id: ['', [Validators.required]],
      empleado_id: ['', [Validators.required]],
      descripcion: ['', [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(200)
      ]],
      tipo: ['', [Validators.required]]
    });
  }

  cargarHabitaciones(): void {
    this.loading = true;
    
    this.habitacionService.getHabitaciones().subscribe({
      next: (habitaciones) => {
        this.habitaciones = habitaciones;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error al cargar las habitaciones';
        this.loading = false;
        console.error('Error:', error);
      }
    });
  }

  cargarEmpleados(): void {
    this.loading = true;
    
    this.empleadoService.getEmpleados().subscribe({
      next: (empleados) => {
        this.empleados = empleados;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error al cargar los empleados';
        this.loading = false;
        console.error('Error:', error);
      }
    });
  }

  // Método para verificar si un campo es inválido
  campoInvalido(campo: string): boolean {
    const control = this.mantenimientoForm.get(campo);
    return !!control && control.invalid && (control.dirty || control.touched || this.submitted);
  }

  // Método para obtener mensaje de error para cada campo
  getMensajeError(campo: string): string {
    const control = this.mantenimientoForm.get(campo);
    if (!control) return '';
    if (!control.errors) return '';

    const errors = control.errors;
    
    if (errors['required']) return 'Este campo es obligatorio';
    
    if (campo === 'descripcion') {
      if (errors['minlength']) return `La descripción debe tener al menos ${errors['minlength'].requiredLength} caracteres`;
      if (errors['maxlength']) return `La descripción no puede tener más de ${errors['maxlength'].requiredLength} caracteres`;
    }
    
    return 'Campo inválido';
  }

  onSubmit(): void {
    this.submitted = true;
    
    if (this.mantenimientoForm.invalid) {
      // Marcar todos los campos como touched para mostrar errores
      Object.keys(this.mantenimientoForm.controls).forEach(key => {
        this.mantenimientoForm.get(key)?.markAsTouched();
      });
      
      this.error = 'Por favor completa todos los campos requeridos correctamente';
      return;
    }

    this.submitting = true;
    this.error = null;
    
    this.mantenimientoService.createMantenimiento(this.mantenimientoForm.value).subscribe({
      next: () => {
        this.toastr.success('Mantenimiento creado correctamente');
        this.submitting = false;
        this.router.navigate(['/mantenimientos']);
      },
      error: (error: any) => {
        this.error = error.error?.message || 'Error al crear el mantenimiento';
        this.submitting = false;
        console.error('Error:', error);
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/mantenimientos']);
  }
}