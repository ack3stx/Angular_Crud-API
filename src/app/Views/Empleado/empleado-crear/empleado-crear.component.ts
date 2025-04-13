import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { EmpleadoService } from '../../../core/services/empleados/empleado.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-empleado-crear',
  templateUrl: './empleado-crear.component.html',
  styleUrls: ['./empleado-crear.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class EmpleadoCrearComponent implements OnInit {
  empleadoForm!: FormGroup;
  loading = false;
  error = '';
  submitted = false;

  constructor(
    private fb: FormBuilder,
    private empleadoService: EmpleadoService,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    if (!this.isAdmin()) {
      this.router.navigate(['/empleados']);
      this.toastr.warning('No tienes permisos para crear empleados');
    }
    this.initForm();
  }

  isAdmin(): boolean {
    const userRole = this.authService.getUserRole();
    return Number(userRole) === 2;
  }

  private initForm() {
    this.empleadoForm = this.fb.group({
      nombre: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
        Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$') // Solo letras y espacios
      ]],
      apellido: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
        Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$') // Solo letras y espacios
      ]],
      direccion: ['', [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(100)
      ]],
      telefono: ['', [
        Validators.required,
        Validators.pattern('^[0-9]{10}$') // 10 dígitos numéricos
      ]],
      correo: ['', [
        Validators.required,
        Validators.email,
        Validators.maxLength(100)
      ]]
      // estado se asigna automáticamente desde la API
    });
  }

  // Método para verificar si un campo es inválido
  campoInvalido(campo: string): boolean {
    const control = this.empleadoForm.get(campo);
    return !!control && control.invalid && (control.dirty || control.touched || this.submitted);
  }

  // Método para obtener mensaje de error para cada campo
  getMensajeError(campo: string): string {
    const control = this.empleadoForm.get(campo);
    if (!control) return '';
    if (!control.errors) return '';

    const errors = control.errors;
    
    if (errors['required']) return 'Este campo es obligatorio';
    
    if (campo === 'nombre' || campo === 'apellido') {
      if (errors['minlength']) return `Debe tener al menos ${errors['minlength'].requiredLength} caracteres`;
      if (errors['maxlength']) return `No puede tener más de ${errors['maxlength'].requiredLength} caracteres`;
      if (errors['pattern']) return 'Solo se permiten letras y espacios';
    }
    
    if (campo === 'direccion') {
      if (errors['minlength']) return `La dirección debe tener al menos ${errors['minlength'].requiredLength} caracteres`;
      if (errors['maxlength']) return `La dirección no puede tener más de ${errors['maxlength'].requiredLength} caracteres`;
    }
    
    if (campo === 'telefono') {
      if (errors['pattern']) return 'El teléfono debe tener exactamente 10 dígitos numéricos';
    }
    
    if (campo === 'correo') {
      if (errors['email']) return 'Debe ser un correo electrónico válido';
      if (errors['maxlength']) return `El correo no puede tener más de ${errors['maxlength'].requiredLength} caracteres`;
    }
    
    return 'Campo inválido';
  }

  onSubmit() {
    this.submitted = true;
    
    if (this.empleadoForm.invalid) {
      // No mostramos toast, los errores se mostrarán en el formulario
      this.error = 'Por favor complete correctamente todos los campos requeridos';
      return;
    }

    this.loading = true;
    this.error = '';
    
    this.empleadoService.nuevoEmpleado(this.empleadoForm.value).subscribe({
      next: (response: any) => {
        // Verificamos si la respuesta tiene un mensaje o usamos uno predeterminado
        if (response && typeof response === 'object') {
          // Si la respuesta es un objeto, intentamos extraer el mensaje
          if (response.message) {
            this.toastr.success(response.message);
          } else {
            // Si no hay mensaje pero hay un empleado, mostramos un éxito genérico
            this.toastr.success('Empleado creado correctamente');
          }
        } else {
          // Si la respuesta no es un objeto, mostramos mensaje genérico
          this.toastr.success('Operación completada con éxito');
        }
        
        this.loading = false;
        this.router.navigate(['/empleados']);
      },
      error: (err) => {
        // Manejo de errores más robusto
        let errorMsg = 'Error al crear empleado';
        if (err && err.error) {
          if (typeof err.error === 'string') {
            errorMsg = err.error;
          } else if (err.error.message) {
            errorMsg = err.error.message;
          }
        }
        this.toastr.error(errorMsg);
        this.error = errorMsg;
        this.loading = false;
        console.error('Error:', err);
      }
    });
  }

  cancelar() {
    this.router.navigate(['/empleados']);
  }
}