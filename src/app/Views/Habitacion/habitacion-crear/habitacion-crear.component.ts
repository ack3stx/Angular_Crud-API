import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HabitacionesService } from '../../../core/services/Habitaciones/habitaciones.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-habitacion-crear',
  templateUrl: './habitacion-crear.component.html',
  styleUrls: ['./habitacion-crear.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class HabitacionCrearComponent implements OnInit {
  habitacionForm!: FormGroup;
  loading = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private habitacionService: HabitacionesService,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    if (!this.isAdmin()) {
      this.router.navigate(['/habitaciones']);
      this.toastr.warning('No tienes permisos para crear habitaciones');
    }
    this.initForm();
  }

  isAdmin(): boolean {
    const userRole = this.authService.getUserRole();
    // Convertir a número para comparar
    return Number(userRole) === 2;
  }

  private initForm() {
    this.habitacionForm = this.fb.group({
      numero_habitacion: ['', [Validators.required]],
      tipo_habitacion: ['', [Validators.required]],
      precio_habitacion: ['', [Validators.required, Validators.min(0)]],
      descripcion_habitacion: ['', [Validators.required]]
    });
  }

  onSubmit() {
    if (this.habitacionForm.valid) {
      this.loading = true;
      const formData = {
        numero: this.habitacionForm.value.numero_habitacion,
        tipo: this.habitacionForm.value.tipo_habitacion,
        precio: this.habitacionForm.value.precio_habitacion,
        descripcion: this.habitacionForm.value.descripcion_habitacion
      };

      this.habitacionService.nuevaHabitacion(formData).subscribe({
        next: (response) => {
          this.toastr.success(response.message || 'Habitación creada correctamente');
          this.loading = false;
          this.router.navigate(['/habitaciones']);
        },
        error: (err) => {
          this.toastr.error(err.error.message || 'Error al crear habitación');
          this.error = 'Error al crear habitación';
          this.loading = false;
          console.error('Error:', err);
        }
      });
    } else {
      // Mostrar mensaje si el formulario es inválido
      this.toastr.warning('Por favor complete todos los campos requeridos');
      
      // Marcar todos los campos como tocados para mostrar errores
      Object.keys(this.habitacionForm.controls).forEach(key => {
        const control = this.habitacionForm.get(key);
        control?.markAsTouched();
      });
    }
  }

  cancelar() {
    this.router.navigate(['/habitaciones']);
  }
}