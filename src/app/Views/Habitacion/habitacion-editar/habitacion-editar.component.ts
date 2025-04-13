import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { HabitacionesService } from '../../../core/services/Habitaciones/habitaciones.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { Habitacion } from '../../../core/models/habitacion';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-habitacion-editar',
  templateUrl: './habitacion-editar.component.html',
  styleUrls: ['./habitacion-editar.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class HabitacionEditarComponent implements OnInit {
  habitacionForm!: FormGroup;
  habitacionId!: number;
  habitaciones: Habitacion[] = [];
  loading = false;
  error = '';
  submitted = false;

  constructor(
    private fb: FormBuilder,
    private habitacionService: HabitacionesService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    if (!this.isAdmin()) {
      this.router.navigate(['/habitacion']);
      this.toastr.warning('No tienes permisos para editar habitaciones');
      return;
    }

    this.initForm();
    
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.habitacionId = +params['id'];
        this.loadHabitacion();
      } else {
        this.router.navigate(['/habitacion']);
      }
    });
  }

  isAdmin(): boolean {
    const userRole = this.authService.getUserRole();
    return Number(userRole) === 2;
  }

  private initForm() {
    this.habitacionForm = this.fb.group({
      numero_habitacion: ['', [
        Validators.required,
        Validators.pattern('^[0-9]{1,3}$'),
        Validators.min(1),
        Validators.max(999)
      ]],
      tipo_habitacion: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50)
      ]],
      precio_habitacion: ['', [
        Validators.required,
        Validators.min(0), 
        Validators.pattern('^[0-9]+(\\.[0-9]{1,2})?$')
      ]],
      descripcion_habitacion: ['', [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(500)
      ]]
    });
  }

  loadHabitacion() {
    this.loading = true;
    
    this.habitacionService.getHabitaciones().subscribe({
      next: (habitaciones) => {
        this.habitaciones = habitaciones;
        
        const habitacion = habitaciones.find(h => h.id === this.habitacionId);
        
        if (habitacion) {
          this.habitacionForm.patchValue({
            numero_habitacion: habitacion.numero_habitacion,
            tipo_habitacion: habitacion.tipo_habitacion,
            precio_habitacion: habitacion.precio_habitacion,
            descripcion_habitacion: habitacion.descripcion_habitacion
          });
          this.loading = false;
        } else {
          this.error = 'No se encontró la habitación';
          this.loading = false;
          this.toastr.error('No se encontró la habitación', 'Error');
          setTimeout(() => {
            this.router.navigate(['/habitacion']);
          }, 3000);
        }
      },
      error: (err) => {
        this.error = 'Error al cargar habitación';
        this.loading = false;
        this.toastr.error('Error al cargar datos de la habitación', 'Error');
        console.error('Error:', err);
      }
    });
  }

  campoInvalido(campo: string): boolean {
    const control = this.habitacionForm.get(campo);
    return !!control && control.invalid && (control.dirty || control.touched || this.submitted);
  }

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

  tieneErrorServidor(campo: string): boolean {
    const control = this.habitacionForm.get(campo);
    return !!control && !!control.errors?.['serverError'];
  }
  
  getErrorServidor(campo: string): string {
    const control = this.habitacionForm.get(campo);
    return control?.errors?.['serverError'] || '';
  }

  onSubmit() {
    this.submitted = true;
    
    if (this.habitacionForm.valid) {
      this.loading = true;
      
      const formData = {
        id: this.habitacionId,
        numero: this.habitacionForm.value.numero_habitacion,
        tipo: this.habitacionForm.value.tipo_habitacion,
        precio: this.habitacionForm.value.precio_habitacion,
        descripcion: this.habitacionForm.value.descripcion_habitacion
      };
  
      this.habitacionService.actualizarHabitacion(formData).subscribe({
        next: (response) => { 
          this.toastr.success(response.message || 'Habitación actualizada correctamente');
          this.loading = false;
          this.router.navigate(['/habitacion']);
        },
        error: (err) => {
          this.toastr.error(err.error.message || 'Error al actualizar habitación');
          this.loading = false;
          console.error('Error:', err);
          
          if (err.error && err.error.errors) {
            for (const campo in err.error.errors) {
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
      Object.keys(this.habitacionForm.controls).forEach(key => {
        const control = this.habitacionForm.get(key);
        control?.markAsTouched();
      });
      
      this.error = 'Por favor complete correctamente todos los campos requeridos';
    }
  }
  
  mapearCampo(campoApi: string): string {
    const mapa: {[key: string]: string} = {
      'numero': 'numero_habitacion',
      'tipo': 'tipo_habitacion',
      'precio': 'precio_habitacion',
      'descripcion': 'descripcion_habitacion'
    };
    return mapa[campoApi] || campoApi;
  }

  cancelar() {
    this.router.navigate(['/habitacion']);
  }
}