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

  constructor(
    private fb: FormBuilder,
    private habitacionService: HabitacionesService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService  // Añadir esta línea

  ) {}

  ngOnInit() {
    if (!this.isAdmin()) {
      this.router.navigate(['/habitaciones']);
      return;
    }

    this.initForm();
    
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.habitacionId = +params['id'];
        this.loadHabitacion();
      } else {
        this.router.navigate(['/habitaciones']);
      }
    });
  }

  isAdmin(): boolean {
    const userRole = this.authService.getUserRole();
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

  loadHabitacion() {
    this.loading = true;
    
    // Primero cargamos todas las habitaciones
    this.habitacionService.getHabitaciones().subscribe({
      next: (habitaciones) => {
        this.habitaciones = habitaciones;
        
        // Luego buscamos la habitación con el ID correspondiente
        const habitacion = habitaciones.find(h => h.id === this.habitacionId);
        
        if (habitacion) {
          // Si encontramos la habitación, rellenamos el formulario
          this.habitacionForm.patchValue({
            numero_habitacion: habitacion.numero_habitacion,
            tipo_habitacion: habitacion.tipo_habitacion,
            precio_habitacion: habitacion.precio_habitacion,
            descripcion_habitacion: habitacion.descripcion_habitacion
          });
          this.loading = false;
        } else {
          // Si no encontramos la habitación, mostramos error
          this.error = 'No se encontró la habitación';
          this.loading = false;
          setTimeout(() => {
            this.router.navigate(['/habitaciones']);
          }, 3000);
        }
      },
      error: (err) => {
        this.error = 'Error al cargar habitación';
        this.loading = false;
        console.error('Error:', err);
      }
    });
  }

  onSubmit() {
    if (this.habitacionForm.valid) {
      this.loading = true;
      
      // Transformar los datos al formato que espera la API
      const formData = {
        id: this.habitacionId,
        numero: this.habitacionForm.value.numero_habitacion,
        tipo: this.habitacionForm.value.tipo_habitacion,
        precio: this.habitacionForm.value.precio_habitacion,
        descripcion: this.habitacionForm.value.descripcion_habitacion
      };
  
      this.habitacionService.actualizarHabitacion(formData).subscribe({
        next: (response) => {  // Añadir el parámetro response
          this.toastr.success(response.message || 'Habitación actualizada correctamente');
          this.loading = false;
          this.router.navigate(['/habitaciones']);
        },
        error: (err) => {
          this.toastr.error(err.error.message || 'Error al actualizar habitación');
          this.loading = false;
          console.error('Error:', err);
        }
      });
    }
  }

  cancelar() {
    this.router.navigate(['/habitaciones']);
  }
}