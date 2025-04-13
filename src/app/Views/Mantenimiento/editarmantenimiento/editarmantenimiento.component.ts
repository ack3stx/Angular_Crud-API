import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MantenimientoService } from '../../../core/services/Mantenimientos/mantenimiento.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { ToastrService } from 'ngx-toastr';
import { HabitacionesService } from '../../../core/services/Habitaciones/habitaciones.service';
import { EmpleadoService } from '../../../core/services/empleados/empleado.service';
import { Habitacion } from '../../../core/models/habitacion';
import { Empleado } from '../../../core/models/empleado';
import { Mantenimiento } from '../../../core/models/mantenimiento';

@Component({
  selector: 'app-editarmantenimiento',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './editarmantenimiento.component.html',
  styleUrls: ['./editarmantenimiento.component.css']
})
export class EditarmantenimientoComponent implements OnInit {
  mantenimientoForm!: FormGroup;
  mantenimiento: Mantenimiento | null = null;
  habitaciones: Habitacion[] = [];
  empleados: Empleado[] = [];
  mantenimientoId!: number;
  loading: boolean = true;
  submitting: boolean = false;
  error: string | null = null;
  submitted: boolean = false;

  constructor(
    private fb: FormBuilder,
    private mantenimientoService: MantenimientoService,
    private habitacionService: HabitacionesService,
    private empleadoService: EmpleadoService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
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
    
    // Obtener ID de la URL
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.mantenimientoId = +params['id'];
        this.cargarDatos();
      } else {
        this.error = 'ID de mantenimiento no especificado';
        this.loading = false;
      }
    });
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
  
  cargarDatos(): void {
    this.loading = true;
    
    // Cargar habitaciones y empleados simultáneamente
    this.habitacionService.getHabitaciones().subscribe({
      next: (habitaciones) => {
        this.habitaciones = habitaciones;
        
        // Cargar empleados después de habitaciones
        this.empleadoService.getEmpleados().subscribe({
          next: (empleados) => {
            this.empleados = empleados;
            
            // Finalmente cargar el mantenimiento específico
            this.cargarMantenimiento();
          },
          error: (error) => {
            this.error = 'Error al cargar los empleados';
            this.loading = false;
            console.error('Error:', error);
          }
        });
      },
      error: (error) => {
        this.error = 'Error al cargar las habitaciones';
        this.loading = false;
        console.error('Error:', error);
      }
    });
  }
  
  cargarMantenimiento(): void {
    this.mantenimientoService.getMantenimiento(this.mantenimientoId).subscribe({
      next: (mantenimiento) => {
        this.mantenimiento = mantenimiento;
        this.mantenimientoForm.patchValue({
          habitacion_id: mantenimiento.habitacion_id,
          empleado_id: mantenimiento.empleado_id,
          descripcion: mantenimiento.descripcion,
          tipo: mantenimiento.tipo
        });
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error al cargar el mantenimiento';
        console.error('Error:', error);
        this.loading = false;
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
    
    const mantenimientoActualizado = {
      ...this.mantenimientoForm.value,
      id: this.mantenimientoId
    } as Mantenimiento;
    
    this.mantenimientoService.updateMantenimiento(this.mantenimientoId, mantenimientoActualizado).subscribe({
      next: () => {
        this.toastr.success('Mantenimiento actualizado correctamente');
        this.submitting = false;
        this.router.navigate(['/mantenimientos']);
      },
      error: (error) => {
        this.error = 'Error al actualizar el mantenimiento';
        console.error('Error:', error);
        this.submitting = false;
      }
    });
  }
  
  cancelar(): void {
    this.router.navigate(['/mantenimientos']);
  }
}