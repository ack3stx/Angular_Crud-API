import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { EmpleadoService } from '../../../core/services/empleados/empleado.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { Empleado } from '../../../core/models/empleado';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-empleado-editar',
  templateUrl: './empleado-editar.component.html',
  styleUrls: ['./empleado-editar.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class EmpleadoEditarComponent implements OnInit {
  empleadoForm!: FormGroup;
  empleadoId!: number;
  empleados: Empleado[] = [];
  loading = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private empleadoService: EmpleadoService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    if (!this.isAdmin()) {
      this.router.navigate(['/empleados']);
      this.toastr.warning('No tienes permisos para editar empleados');
      return;
    }

    this.initForm();
    
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.empleadoId = +params['id'];
        this.loadEmpleado();
      } else {
        this.router.navigate(['/empleados']);
      }
    });
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
      // estado se maneja automáticamente desde la API
    });
  }

  // En el método loadEmpleado()
loadEmpleado() {
  this.loading = true;
  
  // Cargamos todos los empleados para encontrar el que buscamos por ID
  this.empleadoService.getEmpleados().subscribe({
    next: (empleados) => {
      this.empleados = empleados;
      
      // Buscamos el empleado con el ID correspondiente
      const empleado = empleados.find(e => e.id !== undefined && e.id === this.empleadoId);
      
      if (empleado) {
        // Verificamos si el empleado está activo
        if (empleado.estado.toLowerCase() === 'inactivo') {
          this.toastr.warning('No se puede editar un empleado inactivo');
          this.error = 'No se puede editar un empleado inactivo';
          this.loading = false;
          setTimeout(() => {
            this.router.navigate(['/empleados']);
          }, 2000);
          return;
        }
        
        // Rellenamos el formulario con la información del empleado
        this.empleadoForm.patchValue({
          nombre: empleado.nombre,
          apellido: empleado.apellido,
          direccion: empleado.direccion,
          telefono: empleado.telefono,
          correo: empleado.correo
          // No incluimos estado aquí
        });
        this.loading = false;
      } else {
        // Si no encontramos el empleado, mostramos error
        this.toastr.error('No se encontró el empleado');
        this.error = 'No se encontró el empleado';
        this.loading = false;
        setTimeout(() => {
          this.router.navigate(['/empleados']);
        }, 3000);
      }
    },
    error: (err) => {
      this.toastr.error('Error al cargar el empleado');
      this.error = 'Error al cargar el empleado';
      this.loading = false;
      console.error('Error:', err);
    }
  });
}

  onSubmit() {
    if (this.empleadoForm.valid) {
      this.loading = true;
      
      const formData = {
        id: this.empleadoId,
        ...this.empleadoForm.value
        // No incluimos estado aquí, se mantiene el valor actual en el servidor
      };
  
      this.empleadoService.actualizarEmpleado(formData).subscribe({
        next: (response: any) => {
          // Verificamos si la respuesta tiene un mensaje o usamos uno predeterminado
          if (response && typeof response === 'object') {
            // Si la respuesta es un objeto, intentamos extraer el mensaje
            if (response.message) {
              this.toastr.success(response.message);
            } else {
              // Si no hay mensaje pero hay un empleado, mostramos un éxito genérico
              this.toastr.success('Empleado actualizado correctamente');
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
          let errorMsg = 'Error al actualizar empleado';
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