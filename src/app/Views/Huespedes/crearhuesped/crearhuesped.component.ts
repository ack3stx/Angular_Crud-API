import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HuespedesService } from '../../../core/services/huespedes/huespedes.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Huesped } from '../../../core/models/huesped';

@Component({
  selector: 'app-crear-huesped',
  templateUrl: './crearhuesped.component.html',
  styleUrls: ['./crearhuesped.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class CrearHuespedComponent implements OnInit {
  huespedForm!: FormGroup;
  submitting: boolean = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private huespedService: HuespedesService,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    // Verificar si el usuario es administrador
    if (!this.isAdmin()) {
      this.toastr.warning('No tienes permiso para acceder a esta página');
      this.router.navigate(['/huespedes']);
      return;
    }

    this.initForm();
  }

  // Verificar si el usuario es administrador
  isAdmin(): boolean {
    const userRole = this.authService.getUserRole();
    return Number(userRole) === 2;
  }

  private initForm(): void {
    this.huespedForm = this.fb.group({
      nombre: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/) // Solo letras y espacios
      ]],
      apellido: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/) // Solo letras y espacios
      ]],
      telefono: ['', [
        Validators.required,
        Validators.pattern(/^[0-9]{10}$/), // Exactamente 10 dígitos numéricos
        Validators.minLength(10),
        Validators.maxLength(10)
      ]],
      direccion: ['', [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(150)
      ]],
      correo: ['', [
        Validators.required, 
        Validators.email,
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/) // Formato de email
      ]]
    });
  }

  onSubmit(): void {
    if (this.huespedForm.invalid) {
      // Marcar todos los campos como touched para mostrar errores
      Object.keys(this.huespedForm.controls).forEach(key => {
        this.huespedForm.get(key)?.markAsTouched();
      });
      
      this.toastr.warning('Por favor completa todos los campos requeridos');
      return;
    }

    this.submitting = true;
    
    const huespedData = this.huespedForm.value as Huesped;
    
    this.huespedService.createHuesped(huespedData).subscribe({
      next: () => {
        this.toastr.success('Huésped creado correctamente');
        this.submitting = false;
        this.router.navigate(['/huespedes']);
      },
      error: (error: any) => {
        this.error = 'Error al crear el huésped';
        this.submitting = false;
        console.error('Error:', error);
        this.toastr.error(error.error?.message || this.error);
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/huespedes']);
  }

  // Métodos para validación UI
getErrorMessage(controlName: string): string {
  const control = this.huespedForm.get(controlName);
  
  if (!control || !control.errors || !control.touched) {
    return '';
  }
  
  const errors = control.errors;
  
  if (errors['required']) {
    return 'Este campo es obligatorio';
  }
  
  if (errors['email']) {
    return 'Ingrese un correo electrónico válido';
  }
  
  if (errors['pattern']) {
    switch (controlName) {
      case 'nombre':
      case 'apellido':
        return 'Solo se permiten letras y espacios';
      case 'telefono':
        return 'Ingrese exactamente 10 dígitos numéricos';
      case 'correo':
        return 'Formato de correo inválido';
      default:
        return 'Formato inválido';
    }
  }
  
  if (errors['minlength']) {
    const requiredLength = errors['minlength'].requiredLength;
    return `Mínimo ${requiredLength} caracteres`;
  }
  
  if (errors['maxlength']) {
    const requiredLength = errors['maxlength'].requiredLength;
    return `Máximo ${requiredLength} caracteres`;
  }
  
  return 'Campo inválido';
}

// Verificar si un campo tiene error y ha sido tocado
hasError(controlName: string): boolean {
  const control = this.huespedForm.get(controlName);
  return !!control && control.invalid && control.touched;
}
}