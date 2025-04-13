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
  submitted = false; // Para controlar cuándo se ha intentado enviar el formulario

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
    return Number(userRole) === 2;
  }

  private initForm() {
    this.habitacionForm = this.fb.group({
      numero_habitacion: ['', [
        Validators.required,
        Validators.pattern('^[0-9]{1,3}$'), // Solo números de 1 a 3 dígitos
        Validators.min(1),     // Número mínimo razonable para una habitación
        Validators.max(999)    // Número máximo razonable para una habitación
      ]],
      tipo_habitacion: ['', [
        Validators.required,
        Validators.minLength(3),     // Un tipo debe tener al menos 3 caracteres
        Validators.maxLength(50)     // Límite razonable para un tipo
      ]],
      precio_habitacion: ['', [
        Validators.required,
        Validators.min(0),           // El precio no puede ser negativo
        Validators.pattern('^[0-9]+(\\.[0-9]{1,2})?$') // Formato de precio: 123 o 123.45
      ]],
      descripcion_habitacion: ['', [
        Validators.required,
        Validators.minLength(10),    // Una descripción útil debería tener al menos 10 caracteres
        Validators.maxLength(500)    // Limitar la longitud máxima
      ]]
    });
  }

  // Método para verificar si un campo es inválido
  campoInvalido(campo: string): boolean {
    const control = this.habitacionForm.get(campo);
    return !!control && control.invalid && (control.dirty || control.touched || this.submitted);
  }

  // Método para obtener mensaje de error específico para cada campo
  getMensajeError(campo: string): string {
    const control = this.habitacionForm.get(campo);
    if (!control) return '';
    if (!control.errors) return '';

    const errors = control.errors;
    
    if (errors['required']) return 'Este campo es obligatorio';
    
    if (campo === 'numero_habitacion') {
      if (errors['pattern']) return 'Solo se permiten números de 1 a 3 dígitos';
      if (errors['min']) return `El número mínimo permitido es ${errors['min'].min}`;
      if (errors['max']) return `El número máximo permitido es ${errors['max'].max}`;
    }
    
    if (campo === 'tipo_habitacion') {
      if (errors['minlength']) return `El tipo debe tener al menos ${errors['minlength'].requiredLength} caracteres`;
      if (errors['maxlength']) return `El tipo no puede tener más de ${errors['maxlength'].requiredLength} caracteres`;
    }
    
    if (campo === 'precio_habitacion') {
      if (errors['min']) return 'El precio no puede ser negativo';
      if (errors['pattern']) return 'Formato de precio inválido. Ejemplos: 100 o 100.50';
    }
    
    if (campo === 'descripcion_habitacion') {
      if (errors['minlength']) return `La descripción debe tener al menos ${errors['minlength'].requiredLength} caracteres`;
      if (errors['maxlength']) return `La descripción no puede tener más de ${errors['maxlength'].requiredLength} caracteres`;
    }
    
    return 'Campo inválido';
  }

  onSubmit() {
    this.submitted = true; // Marcar que se ha intentado enviar
    
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
          this.router.navigate(['/habitacion']);
        },
        error: (err) => {
          // Mostrar mensaje de error del servidor
          this.toastr.error(err.error.message || 'Error al crear habitación');
          this.error = 'Error al crear habitación';
          this.loading = false;
          console.error('Error:', err);
          
          // Si hay errores de validación en campos específicos, marcarlos
          if (err.error && err.error.errors) {
            for (const campo in err.error.errors) {
              // Mapear el nombre del campo de la API al nombre del campo en el formulario
              const nombreCampo = this.mapearCampo(campo);
              if (this.habitacionForm.get(nombreCampo)) {
                this.habitacionForm.get(nombreCampo)?.setErrors({
                  serverError: err.error.errors[campo][0]
                });
              }
            }
          }
        }
      });
    } else {
      // NO usamos toast aquí - solo marcar todos los campos como tocados
      // para que se muestren los errores en el formulario
      Object.keys(this.habitacionForm.controls).forEach(key => {
        const control = this.habitacionForm.get(key);
        control?.markAsTouched();
      });
      
      // Establecer mensaje general de error
      this.error = 'Por favor complete correctamente todos los campos requeridos';
    }
  }
  
  // Mapear nombres de campos entre API y formulario
  mapearCampo(campoApi: string): string {
    const mapa: {[key: string]: string} = {
      'numero': 'numero_habitacion',
      'tipo': 'tipo_habitacion',
      'precio': 'precio_habitacion',
      'descripcion': 'descripcion_habitacion'
    };
    return mapa[campoApi] || campoApi;
  }

  // Verificar errores del servidor
  tieneErrorServidor(campo: string): boolean {
    const control = this.habitacionForm.get(campo);
    return !!control && !!control.errors?.['serverError'];
  }
  
  // Obtener mensaje de error del servidor
  getErrorServidor(campo: string): string {
    const control = this.habitacionForm.get(campo);
    return control?.errors?.['serverError'] || '';
  }

  cancelar() {
    this.router.navigate(['/habitacion']);
  }
}