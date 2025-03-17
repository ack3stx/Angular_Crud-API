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
      nombre: ['', [Validators.required]],
      apellido: ['', [Validators.required]],
      direccion: ['', [Validators.required]],
      telefono: ['', [Validators.required]],
      correo: ['', [Validators.required, Validators.email]]
      // estado se asigna automáticamente desde la API
    });
  }

  onSubmit() {
    if (this.empleadoForm.valid) {
      this.loading = true;
      
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
    } else {
      this.toastr.warning('Por favor complete todos los campos requeridos');
      
      Object.keys(this.empleadoForm.controls).forEach(key => {
        const control = this.empleadoForm.get(key);
        control?.markAsTouched();
      });
    }
  }

  cancelar() {
    this.router.navigate(['/empleados']);
  }
}