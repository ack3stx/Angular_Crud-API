import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HuespedesService } from '../../../core/services/huespedes/huespedes.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Huesped } from '../../../core/models/huesped';

@Component({
  selector: 'app-editar-huesped',
  templateUrl: './editar-huesped.component.html',
  styleUrls: ['./editar-huesped.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class EditarHuespedComponent implements OnInit {
  huespedForm!: FormGroup;
  huesped: Huesped | null = null;
  huespedId!: number;
  loading: boolean = true;
  submitting: boolean = false;
  error: string | null = null;
  submitted: boolean = false;

  constructor(
    private fb: FormBuilder,
    private huespedService: HuespedesService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
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
    
    // Obtener ID de la URL
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.huespedId = +params['id'];
        this.cargarHuesped();
      } else {
        this.error = 'ID de huésped no especificado';
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
    this.huespedForm = this.fb.group({
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
      telefono: ['', [
        Validators.required,
        Validators.pattern('^[0-9]{10}$') // 10 dígitos numéricos
      ]],
      direccion: ['', [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(100)
      ]],
      correo: ['', [
        Validators.required,
        Validators.email,
        Validators.maxLength(100)
      ]]
    });
  }
  
  cargarHuesped(): void {
    this.loading = true;
    
    this.huespedService.getHuesped(this.huespedId).subscribe({
      next: (huesped: Huesped) => {
        this.huesped = huesped;
        this.huespedForm.patchValue({
          nombre: huesped.nombre,
          apellido: huesped.apellido,
          telefono: huesped.telefono,
          direccion: huesped.direccion,
          correo: huesped.correo
        });
        this.loading = false;
      },
      error: (error: any) => {
        this.error = 'Error al cargar el huésped';
        console.error('Error:', error);
        this.loading = false;
      }
    });
  }
  
  // Método para verificar si un campo es inválido
  campoInvalido(campo: string): boolean {
    const control = this.huespedForm.get(campo);
    return !!control && control.invalid && (control.dirty || control.touched || this.submitted);
  }

  // Método para obtener mensaje de error para cada campo
  getMensajeError(campo: string): string {
    const control = this.huespedForm.get(campo);
    if (!control) return '';
    if (!control.errors) return '';

    const errors = control.errors;
    
    if (errors['required']) return 'Este campo es obligatorio';
    
    if (campo === 'nombre' || campo === 'apellido') {
      if (errors['minlength']) return `Debe tener al menos ${errors['minlength'].requiredLength} caracteres`;
      if (errors['maxlength']) return `No puede tener más de ${errors['maxlength'].requiredLength} caracteres`;
      if (errors['pattern']) return 'Solo se permiten letras y espacios';
    }
    
    if (campo === 'telefono') {
      if (errors['pattern']) return 'El teléfono debe tener exactamente 10 dígitos numéricos';
    }
    
    if (campo === 'direccion') {
      if (errors['minlength']) return `La dirección debe tener al menos ${errors['minlength'].requiredLength} caracteres`;
      if (errors['maxlength']) return `La dirección no puede tener más de ${errors['maxlength'].requiredLength} caracteres`;
    }
    
    if (campo === 'correo') {
      if (errors['email']) return 'Debe ser un correo electrónico válido';
      if (errors['maxlength']) return `El correo no puede tener más de ${errors['maxlength'].requiredLength} caracteres`;
    }
    
    return 'Campo inválido';
  }
  
  onSubmit(): void {
    this.submitted = true;
    
    if (this.huespedForm.invalid) {
      // Marcar todos los campos como touched para mostrar errores
      Object.keys(this.huespedForm.controls).forEach(key => {
        this.huespedForm.get(key)?.markAsTouched();
      });
      
      this.error = 'Por favor completa correctamente todos los campos requeridos';
      return;
    }
    
    this.submitting = true;
    this.error = null;
    
    const huespedActualizado = {
      ...this.huespedForm.value,
      id: this.huespedId
    } as Huesped;
    
    this.huespedService.updateHuesped(this.huespedId, huespedActualizado).subscribe({
      next: (response) => {
        this.toastr.success('Huésped actualizado correctamente');
        this.submitting = false;
        this.router.navigate(['/huespedes']);
      },
      error: (error: any) => {
        this.error = error.error?.message || 'Error al actualizar el huésped';
        console.error('Error:', error);
        this.submitting = false;
      }
    });
  }
  
  cancelar(): void {
    this.router.navigate(['/huespedes']);
  }
}